#!/usr/bin/env python3
"""Convert an MP3 clip into a tiny, faithful retro chiptune string.

Preserves the original melody, bass line and rhythmic onsets as closely as
possible within a ~3-4 KB printable string.
"""

import argparse
import math
import sys

import librosa
import numpy as np

# ---------------------------------------------------------------------------
# Defaults / constants
# ---------------------------------------------------------------------------
DEFAULT_OFFSET_SECONDS = 0
DEFAULT_DURATION_SECONDS = 35
MAX_DURATION_SECONDS = 40

SAMPLE_RATE = 22050
HOP_LENGTH = 256

STEPS_PER_BEAT = 4
DEFAULT_BPM = 110

# 94 printable ASCII chars (excluding " and \) + space for rest.
# Order is chosen so common characters are easy to read.
PITCH_ALPHABET = (
    "!#$%&'()*+,-./0123456789:;<=>?@"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`"
    "abcdefghijklmnopqrstuvwxyz{|}~"
)
PITCH_COUNT = len(PITCH_ALPHABET)
BASE_NOTE = 24  # C1, so we cover bass and melody in one mapping
REST_CHAR = " "

# pYIN ranges
MELODY_FMIN = librosa.note_to_hz("C3")
MELODY_FMAX = librosa.note_to_hz("C7")
BASS_FMIN = librosa.note_to_hz("C1")
BASS_FMAX = librosa.note_to_hz("C3")

# Drum classification
KICK_MAX_HZ = 120
SNARE_MAX_HZ = 1500

# Energy gate: quieter than this fraction of peak energy becomes a rest.
REST_ENERGY_RATIO = 0.05


def midi_to_char(midi_note):
    """Map a MIDI note to one alphabet character, or REST_CHAR if out of range."""
    if midi_note is None or math.isnan(midi_note):
        return REST_CHAR
    idx = int(round(midi_note)) - BASE_NOTE
    if 0 <= idx < PITCH_COUNT:
        return PITCH_ALPHABET[idx]
    return REST_CHAR


def bandpass(y, sr, low_hz, high_hz):
    """STFT-based bandpass for isolating a frequency range."""
    S = librosa.stft(y, n_fft=2048, hop_length=HOP_LENGTH)
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    mask = (freqs >= low_hz) & (freqs <= high_hz)
    S_filtered = np.zeros_like(S)
    S_filtered[mask, :] = S[mask, :]
    return librosa.istft(S_filtered, hop_length=HOP_LENGTH, length=len(y))


def build_16th_grid(y, sr, bpm):
    seconds_per_step = 60.0 / bpm / STEPS_PER_BEAT
    samples_per_step = seconds_per_step * sr
    total_steps = int(len(y) / samples_per_step)
    return total_steps, samples_per_step


def grid_median(values, sr, samples_per_step, hop_length):
    """Collapse frame-aligned values into one value per 16th-note step."""
    total_steps = int(len(values) * hop_length / samples_per_step)
    out = []
    for step in range(total_steps):
        start = int(step * samples_per_step / hop_length)
        end = int((step + 1) * samples_per_step / hop_length)
        start = min(start, len(values))
        end = min(end, len(values))
        if start >= end:
            out.append(np.nan)
            continue
        seg = values[start:end]
        valid = seg[~np.isnan(seg)]
        out.append(np.median(valid) if valid.size else np.nan)
    return np.array(out)


def extract_voice(y, sr, bpm, fmin, fmax, low_hz, high_hz):
    """Extract a monophonic pitch contour for one voice."""
    total_steps, samples_per_step = build_16th_grid(y, sr, bpm)

    # Isolate frequency band
    y_band = bandpass(y, sr, low_hz, high_hz)

    # Further separate harmonic component
    y_harm, _ = librosa.effects.hpss(y_band)

    # pYIN pitch tracking
    f0, voiced_flag, _ = librosa.pyin(
        y_harm,
        fmin=fmin,
        fmax=fmax,
        sr=sr,
        hop_length=HOP_LENGTH,
    )

    midi = 69 + 12 * np.log2(f0 / 440.0)
    midi = np.round(midi)
    grid_notes = grid_median(midi, sr, samples_per_step, HOP_LENGTH)

    # Energy per step (from the original full signal, not just band)
    energies = []
    for step in range(total_steps):
        start = int(step * samples_per_step)
        end = int((step + 1) * samples_per_step)
        start = min(start, len(y))
        end = min(end, len(y))
        seg = y[start:end]
        energies.append(float(np.sqrt(np.mean(seg ** 2))) if seg.size else 0.0)
    energies = np.array(energies)

    peak = energies.max() if energies.size else 1.0
    threshold = peak * REST_ENERGY_RATIO

    chars = []
    for i, note in enumerate(grid_notes):
        if energies[i] < threshold or math.isnan(note):
            chars.append(REST_CHAR)
            continue
        # Remove isolated one-step spikes
        if i > 0 and i < len(grid_notes) - 1:
            prev = chars[-1] if chars else REST_CHAR
            nxt = grid_notes[i + 1]
            if prev == REST_CHAR and math.isnan(nxt):
                chars.append(REST_CHAR)
                continue
        chars.append(midi_to_char(note))

    # Trim trailing rests
    while chars and chars[-1] == REST_CHAR:
        chars.pop()

    return "".join(chars)


def extract_drums(y, sr, bpm):
    """Return a string of drum labels aligned to the original onsets."""
    total_steps, samples_per_step = build_16th_grid(y, sr, bpm)
    labels = [REST_CHAR] * total_steps

    # Use percussive component for crisp onsets
    _, y_perc = librosa.effects.hpss(y)
    onset_env = librosa.onset.onset_strength(y=y_perc, sr=sr, hop_length=HOP_LENGTH)
    onset_frames = librosa.onset.onset_detect(
        onset_envelope=onset_env,
        sr=sr,
        hop_length=HOP_LENGTH,
        wait=2,
        pre_avg=3,
        post_avg=3,
        pre_max=3,
        post_max=3,
    )
    onset_times = librosa.frames_to_time(onset_frames, sr=sr, hop_length=HOP_LENGTH)

    for t in onset_times:
        step = int(round(t * sr / samples_per_step))
        if not (0 <= step < total_steps):
            continue
        # Classify by band energy around the onset
        start = int(step * samples_per_step)
        end = start + int(samples_per_step * 2)
        end = min(end, len(y))
        if start >= end:
            continue
        seg = y[start:end]
        fft = np.fft.rfft(seg * np.hanning(seg.size))
        freqs = np.fft.rfftfreq(seg.size, 1 / sr)
        mag = np.abs(fft)

        kick = np.sum(mag[(freqs > 0) & (freqs <= KICK_MAX_HZ)])
        snare = np.sum(mag[(freqs > KICK_MAX_HZ) & (freqs <= SNARE_MAX_HZ)])
        hihat = np.sum(mag[freqs > SNARE_MAX_HZ])

        if kick > snare and kick > hihat and kick > 0:
            labels[step] = "K"
        elif snare > hihat and snare > 0:
            labels[step] = "S"
        elif hihat > 0:
            labels[step] = "H"

    # Trim trailing rests
    while labels and labels[-1] == REST_CHAR:
        labels.pop()

    return "".join(labels)


def encode_clip(y, sr, bpm):
    """Encode a mono audio clip as '<bpm>|<melody>|<bass>|<drums>'."""
    melody = extract_voice(
        y, sr, bpm,
        fmin=MELODY_FMIN, fmax=MELODY_FMAX,
        low_hz=250, high_hz=4000,
    )
    bass = extract_voice(
        y, sr, bpm,
        fmin=BASS_FMIN, fmax=BASS_FMAX,
        low_hz=60, high_hz=300,
    )
    drums = extract_drums(y, sr, bpm)
    return f"{int(round(bpm))}|{melody}|{bass}|{drums}"


def main():
    parser = argparse.ArgumentParser(description="Convert an MP3 clip to a tiny faithful chiptune string.")
    parser.add_argument("mp3", help="Input MP3 file.")
    parser.add_argument(
        "--offset",
        type=float,
        default=DEFAULT_OFFSET_SECONDS,
        help="Start time in seconds (default: %(default)s).",
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=DEFAULT_DURATION_SECONDS,
        help="Clip length in seconds (default: " + str(DEFAULT_DURATION_SECONDS) + ", max: " + str(MAX_DURATION_SECONDS) + ").",
    )
    parser.add_argument(
        "--bpm",
        type=float,
        default=None,
        help="Force tempo in BPM; auto-detect if omitted.",
    )
    args = parser.parse_args()

    duration = min(args.duration, MAX_DURATION_SECONDS)

    print(f"Loading {args.mp3} from {args.offset}s for {duration}s...", file=sys.stderr)
    y, sr = librosa.load(
        args.mp3,
        sr=SAMPLE_RATE,
        mono=True,
        offset=args.offset,
        duration=duration,
    )

    if args.bpm:
        bpm = args.bpm
    else:
        print("Detecting tempo...", file=sys.stderr)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(tempo[0]) if np.asarray(tempo).size else DEFAULT_BPM
        print(f"Detected tempo: {bpm:.1f} BPM", file=sys.stderr)

    print("Encoding retro song...", file=sys.stderr)
    result = encode_clip(y, sr, bpm)

    print(f"Output length: {len(result)} characters", file=sys.stderr)
    print(f'"{result}"')


if __name__ == "__main__":
    main()
