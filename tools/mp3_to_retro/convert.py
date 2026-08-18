#!/usr/bin/env python3
"""Convert a short recording into a compact, fidelity-first retro sequence."""

import argparse
import json
import math
import subprocess
import sys

import librosa
import numpy as np


DEFAULT_OFFSET_SECONDS = 0
DEFAULT_DURATION_SECONDS = 30
MAX_DURATION_SECONDS = 40
SAMPLE_RATE = 22050
HOP_LENGTH = 128
FFT_SIZE = 8192
DEFAULT_BPM = 110

# 92 printable characters. Two characters encode 0..8463 centiseconds.
ALPHABET = (
    "!#$%&'()*+,-./0123456789:;<=>?@"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`"
    "abcdefghijklmnopqrstuvwxyz{}~"
)
BASE_NOTE = 24
BASE = len(ALPHABET)
MAX_CODE = BASE * BASE - 1


def encode_number(value):
    value = min(MAX_CODE, max(0, int(round(value))))
    return ALPHABET[value // BASE] + ALPHABET[value % BASE]


def midi_to_char(midi):
    index = int(round(midi)) - BASE_NOTE
    return ALPHABET[index] if 0 <= index < BASE else "?"


def load_audio(path, offset, duration):
    """Decode MP3, WebM, WAV, or any other ffmpeg-supported input."""
    command = [
        "ffmpeg", "-nostdin", "-v", "error", "-ss", str(max(0, offset)),
        "-i", path, "-t", str(duration), "-ar", str(SAMPLE_RATE), "-ac", "1",
        "-f", "f32le", "pipe:1",
    ]
    try:
        result = subprocess.run(command, capture_output=True, check=True)
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg is required but was not found on PATH") from exc
    except subprocess.CalledProcessError as exc:
        detail = exc.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError("ffmpeg could not decode the input: " + detail) from exc
    audio = np.frombuffer(result.stdout, dtype=np.float32)
    if not audio.size:
        raise RuntimeError("ffmpeg returned no audio samples")
    return audio, SAMPLE_RATE


def onset_times(y, sr):
    """Find real attacks, retaining fast piano notes but rejecting noise."""
    envelope = librosa.onset.onset_strength(
        y=y, sr=sr, hop_length=HOP_LENGTH, aggregate=np.median
    )
    if not envelope.size or float(envelope.max()) <= 0:
        return []
    peak = float(envelope.max())
    delta = max(0.18, float(np.percentile(envelope, 60)) * 0.16)
    frames = librosa.onset.onset_detect(
        onset_envelope=envelope,
        sr=sr,
        hop_length=HOP_LENGTH,
        backtrack=False,
        wait=4,
        pre_max=5,
        post_max=5,
        delta=delta,
    )
    times = [float(frame * HOP_LENGTH / sr) for frame in frames]
    # Keep a strong opening attack even if the onset detector sees its peak late.
    if envelope[0] > peak * 0.08 and (not times or times[0] > 0.08):
        times.insert(0, 0.0)
    return times


def spectral_score(spectrum, frequencies, midi, low_hz, high_hz):
    """Score a piano note by its fundamental and harmonic partials."""
    frequency = 440.0 * 2 ** ((midi - 69) / 12)
    weights = (1.0, 0.72, 0.5, 0.34, 0.23, 0.16, 0.11)
    score = 0.0
    total = 0.0
    for harmonic, weight in enumerate(weights, 1):
        target = frequency * harmonic
        if not low_hz <= target <= high_hz or target >= frequencies[-1]:
            continue
        index = int(round(target / (frequencies[1] - frequencies[0])))
        start = max(0, index - 2)
        end = min(len(spectrum), index + 3)
        score += weight * float(np.max(spectrum[start:end]))
        total += weight
    return score / total if total else 0.0


def note_at(spectrum, frequencies, low_midi, high_midi, low_hz, high_hz, count=1):
    scores = np.array([
        spectral_score(spectrum, frequencies, midi, low_hz, high_hz)
        for midi in range(low_midi, high_midi + 1)
    ])
    if not scores.size or float(scores.max()) <= 0:
        return None
    best_score = float(scores.max())
    if best_score < float(np.percentile(spectrum, 72)) * 0.12:
        return None
    candidates = []
    for index in np.argsort(scores)[::-1]:
        score = float(scores[index])
        midi = low_midi + int(index)
        if score < best_score * 0.42:
            break
        if all(abs(midi - previous[0]) >= 3 for previous in candidates):
            candidates.append((midi, score, float(scores.sum())))
        if len(candidates) >= count:
            break
    return candidates


def dedupe_events(events):
    """Avoid retriggering the same spectral peak within one piano attack."""
    result = []
    for event in events:
        if result and event["time"] - result[-1]["time"] < 0.075:
            if event["level"] > result[-1]["level"]:
                result[-1] = event
        else:
            result.append(event)
    return result


def extract_voice(spectrum, frequencies, times, sr, low_midi, high_midi, low_hz, high_hz, count=1, lowest=False):
    events = []
    for time in times:
        frame = min(spectrum.shape[1] - 1, max(0, int(round(time * sr / HOP_LENGTH))))
        end = min(spectrum.shape[1], frame + max(2, int(round(0.075 * sr / HOP_LENGTH))))
        window = np.mean(spectrum[:, frame:end], axis=1)
        found = note_at(window, frequencies, low_midi, high_midi, low_hz, high_hz)
        if not found:
            continue
        if lowest:
            strongest = found[0][1]
            found = [item for item in found if item[1] >= strongest * 0.55]
            found = [min(found, key=lambda item: item[0])]
        for midi, score, total in found:
            level = int(np.clip(round(15 * score / max(total * 0.22, score)), 3, 15))
            events.append({"pitch": midi, "time": time, "level": level})
    events = dedupe_events(events)
    for index, event in enumerate(events):
        next_time = events[index + 1]["time"] if index + 1 < len(events) else event["time"] + 0.28
        event["duration"] = min(0.8, max(0.07, next_time - event["time"] - 0.012))
    return events


def extract_drums(spectrum, frequencies, times, y, sr):
    """Store only measured percussive attacks; no rhythm is inferred."""
    _, percussive = librosa.effects.hpss(y)
    result = []
    for time in times:
        sample = min(len(percussive) - 1, max(0, int(time * sr)))
        start = max(0, sample - int(sr * 0.018))
        end = min(len(percussive), sample + int(sr * 0.09))
        segment = percussive[start:end]
        if segment.size < 16:
            continue
        magnitude = np.abs(np.fft.rfft(segment * np.hanning(segment.size)))
        bins = np.fft.rfftfreq(segment.size, 1 / sr)
        low = magnitude[(bins >= 55) & (bins < 180)].sum()
        mid = magnitude[(bins >= 180) & (bins < 2600)].sum()
        high = magnitude[bins >= 2600].sum()
        total = low + mid + high
        if total <= 0:
            continue
        if low >= mid * 0.9 and low >= high * 0.7:
            kind = 0
        elif high > mid * 0.8:
            kind = 2
        else:
            kind = 1
        result.append({"time": time, "kind": kind, "level": int(np.clip(round(15 * total / (total + 200)), 3, 15))})
    return dedupe_events(result)


def encode_voice(events):
    encoded = []
    for event in events:
        encoded.extend([
            midi_to_char(event["pitch"]),
            encode_number(event["time"] * 100),
            encode_number(event["duration"] * 100),
            ALPHABET[event["level"]],
        ])
    return "".join(encoded)


def encode_drums(events):
    encoded = []
    for event in events:
        encoded.extend([
            encode_number(event["time"] * 100),
            ALPHABET[event["kind"]],
            ALPHABET[event["level"]],
        ])
    return "".join(encoded)


def encode_clip(y, sr, bpm, include_bass=True, include_drums=True):
    spectrum = np.abs(librosa.stft(y, n_fft=FFT_SIZE, hop_length=HOP_LENGTH, window="hann"))
    frequencies = librosa.fft_frequencies(sr=sr, n_fft=FFT_SIZE)
    times = onset_times(y, sr)
    melody = extract_voice(spectrum, frequencies, times, sr, 65, 108, 350, 8000, count=2)
    bass = extract_voice(spectrum, frequencies, times, sr, 28, 58, 45, 500, lowest=True) if include_bass else []
    drums = extract_drums(spectrum, frequencies, times, y, sr) if include_drums else []
    result = "|".join([
        "R3", str(round(float(bpm), 2)), encode_voice(melody),
        encode_voice(bass), encode_drums(drums),
    ])
    return result, melody, bass, drums


def main():
    parser = argparse.ArgumentParser(description="Convert audio to compact fidelity-first retro events.")
    parser.add_argument("audio", help="Input MP3, WebM, WAV, or any ffmpeg input.")
    parser.add_argument("--offset", type=float, default=DEFAULT_OFFSET_SECONDS)
    parser.add_argument("--duration", type=float, default=DEFAULT_DURATION_SECONDS)
    parser.add_argument("--bpm", type=float, default=None)
    parser.add_argument("--no-bass", action="store_true")
    parser.add_argument("--no-drums", action="store_true")
    args = parser.parse_args()

    duration = min(MAX_DURATION_SECONDS, max(0.1, args.duration))
    print(f"Loading {args.audio} from {args.offset}s for {duration}s...", file=sys.stderr)
    y, sr = load_audio(args.audio, args.offset, duration)
    if args.bpm is None:
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr, hop_length=HOP_LENGTH)
        values = np.asarray(tempo).reshape(-1)
        bpm = float(values[0]) if values.size and values[0] > 0 else DEFAULT_BPM
    else:
        bpm = args.bpm
    print(f"Analyzing source attacks at {bpm:.2f} BPM...", file=sys.stderr)
    result, melody, bass, drums = encode_clip(
        y, sr, bpm, include_bass=not args.no_bass, include_drums=not args.no_drums
    )
    print(
        f"Output length: {len(result)} characters; "
        f"events melody={len(melody)} bass={len(bass)} drums={len(drums)}",
        file=sys.stderr,
    )
    if len(result) > 4000:
        print("Warning: output exceeds the 4 KB target.", file=sys.stderr)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
