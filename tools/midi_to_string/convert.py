#!/usr/bin/env python3
"""Encode a Standard MIDI File as a compact, copy-pasteable JS string.

The output format is consumed by game.js:
  M2|<ticks-per-quarter-note>|<events>

Events use delta ticks and store note duration directly, so polyphony needs
one record per note instead of separate note-on and note-off records.
"""

from __future__ import annotations

import argparse
from collections import Counter
import json
import re
import struct
import sys
from dataclasses import dataclass
from pathlib import Path


# Printable ASCII excluding quote, backslash, and pipe (the field separator).
ALPHABET = "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{}~"
BASE = len(ALPHABET)
VAR_END = BASE - 1
DEFAULT_TEMPO = 500_000
DRUM_CHANNEL = 9


@dataclass
class Note:
    tick: int
    end: int
    channel: int
    pitch: int
    velocity: int


def read_u16(data: bytes, pos: int) -> tuple[int, int]:
    return struct.unpack_from(">H", data, pos)[0], pos + 2


def read_u32(data: bytes, pos: int) -> tuple[int, int]:
    return struct.unpack_from(">I", data, pos)[0], pos + 4


def read_var(data: bytes, pos: int, limit: int | None = None) -> tuple[int, int]:
    value = 0
    count = 0
    while pos < len(data) and (limit is None or pos < limit):
        byte = data[pos]
        pos += 1
        count += 1
        if count > 4:
            raise ValueError("invalid MIDI variable-length value")
        value = (value << 7) | (byte & 0x7F)
        if byte < 0x80:
            return value, pos
    raise ValueError("truncated MIDI variable-length value")


def parse_track(data: bytes) -> tuple[list[tuple[int, int]], list[Note], int]:
    pos = 0
    tick = 0
    running = 0
    tempos: list[tuple[int, int]] = []
    notes: list[Note] = []
    active: dict[tuple[int, int], list[tuple[int, int]]] = {}
    last_tick = 0

    while pos < len(data):
        delta, pos = read_var(data, pos)
        tick += delta
        last_tick = max(last_tick, tick)
        status = data[pos]
        if status < 0x80:
            if not running:
                raise ValueError("MIDI data byte without running status")
            status = running
        else:
            pos += 1
            if status < 0xF0:
                running = status

        if status == 0xFF:
            if pos >= len(data):
                raise ValueError("truncated MIDI meta event")
            kind = data[pos]
            pos += 1
            length, pos = read_var(data, pos)
            end = pos + length
            if end > len(data):
                raise ValueError("truncated MIDI meta event data")
            if kind == 0x51 and length == 3:
                tempos.append((tick, int.from_bytes(data[pos:end], "big")))
            pos = end
            if kind == 0x2F:
                break
            continue

        if status in (0xF0, 0xF7):
            length, pos = read_var(data, pos)
            pos += length
            continue

        kind = status & 0xF0
        channel = status & 0x0F
        if kind in (0xC0, 0xD0):
            if pos >= len(data):
                raise ValueError("truncated MIDI channel event")
            pos += 1
            continue
        if pos + 1 >= len(data):
            raise ValueError("truncated MIDI channel event")
        pitch = data[pos]
        velocity = data[pos + 1]
        pos += 2

        key = (channel, pitch)
        if kind == 0x90 and velocity:
            active.setdefault(key, []).append((tick, velocity))
        elif kind in (0x80, 0x90):
            starts = active.get(key)
            if starts:
                start, level = starts.pop(0)
                if tick > start:
                    notes.append(Note(start, tick, channel, pitch, level))

    for (channel, pitch), starts in active.items():
        for start, velocity in starts:
            if last_tick > start:
                notes.append(Note(start, last_tick, channel, pitch, velocity))
    return tempos, notes, last_tick


def parse_midi(path: Path) -> tuple[int, list[tuple[int, int]], list[Note], int]:
    data = path.read_bytes()
    if data[:4] != b"MThd":
        raise ValueError("input is not a Standard MIDI File")
    header_length, pos = read_u32(data, 4)
    if header_length < 6 or pos + header_length > len(data):
        raise ValueError("invalid MIDI header")
    fmt, pos = read_u16(data, pos)
    track_count, pos = read_u16(data, pos)
    division, pos = read_u16(data, pos)
    if fmt not in (0, 1):
        raise ValueError("only MIDI format 0 and 1 are supported")
    if division & 0x8000:
        raise ValueError("SMPTE MIDI timing is not supported")
    pos = 8 + header_length
    all_tempos: list[tuple[int, int]] = []
    all_notes: list[Note] = []
    end_tick = 0
    for _ in range(track_count):
        if data[pos:pos + 4] != b"MTrk":
            raise ValueError("missing MIDI track chunk")
        length, pos = read_u32(data, pos + 4)
        end = pos + length
        if end > len(data):
            raise ValueError("truncated MIDI track")
        tempos, notes, track_end = parse_track(data[pos:end])
        all_tempos.extend(tempos)
        all_notes.extend(notes)
        end_tick = max(end_tick, track_end)
        pos = end
    return division, all_tempos, all_notes, end_tick


def fixed(value: int, width: int) -> str:
    if value < 0 or value >= BASE ** width:
        raise ValueError(f"value {value} does not fit in {width} base-{BASE} digits")
    chars = []
    for _ in range(width):
        chars.append(ALPHABET[value % BASE])
        value //= BASE
    return "".join(reversed(chars))


def variable(value: int) -> str:
    if value < 0:
        raise ValueError("negative values cannot be encoded")
    digits = []
    while True:
        digits.append(ALPHABET[value % VAR_END])
        value //= VAR_END
        if not value:
                return "".join(reversed(digits)) + ALPHABET[VAR_END]


def seconds_between(start: int, end: int, tempos: list[tuple[int, int]], division: int) -> float:
    if end <= start:
        return 0.0
    total = 0.0
    current = start
    tempo = DEFAULT_TEMPO
    for tick, next_tempo in sorted(tempos):
        if tick <= start:
            tempo = next_tempo
            continue
        if tick >= end:
            break
        total += (tick - current) * tempo / division / 1_000_000
        current = tick
        tempo = next_tempo
    return total + (end - current) * tempo / division / 1_000_000


def quantize(value: int, grid: int) -> int:
    return value if grid <= 1 else max(0, ((value + grid // 2) // grid) * grid)


def choose_notes(group: list[Note], limit: int, policy: str) -> list[Note]:
    if limit <= 0 or len(group) <= limit:
        return group
    if policy == "lowest":
        chosen = sorted(group, key=lambda note: (note.pitch, -note.velocity))[:limit]
    elif policy == "quietest":
        chosen = sorted(group, key=lambda note: (-note.velocity, note.pitch))[:limit]
    else:
        low = min(group, key=lambda note: (note.pitch, -note.velocity))
        high = max(group, key=lambda note: (note.pitch, note.velocity))
        chosen = [low]
        if high is not low:
            chosen.append(high)
        middle = [note for note in group if note is not low and note is not high]
        chosen.extend(sorted(middle, key=lambda note: (-note.velocity, note.pitch))[:max(0, limit - len(chosen))])
    return sorted(chosen, key=lambda note: (note.pitch, note.end, -note.velocity))


def tick_at_seconds(tempos: list[tuple[int, int]], division: int, seconds: float) -> int:
    target = max(0.0, seconds)
    current_tick = 0
    current_seconds = 0.0
    tempo = DEFAULT_TEMPO
    for tick, next_tempo in sorted(tempos):
        if tick < current_tick:
            continue
        segment_seconds = (tick - current_tick) * tempo / division / 1_000_000
        if current_seconds + segment_seconds >= target:
            return current_tick + round((target - current_seconds) * division * 1_000_000 / tempo)
        current_tick = tick
        current_seconds += segment_seconds
        tempo = next_tempo
    return current_tick + round((target - current_seconds) * division * 1_000_000 / tempo)


def encode(
    division: int,
    tempos: list[tuple[int, int]],
    notes: list[Note],
    end_tick: int,
    no_drums: bool,
    max_seconds: float | None,
    profile: str,
    polyphony_limit: int | None,
    drop_policy: str,
    drop_short_ms: float,
    min_velocity: int,
    quantize_ticks: int,
) -> tuple[str, int, int, int]:
    if max_seconds is not None:
        end_tick = min(end_tick, tick_at_seconds(tempos, division, max_seconds))
        notes = [note for note in notes if note.tick < end_tick]
        notes = [Note(note.tick, min(note.end, end_tick), note.channel, note.pitch, note.velocity) for note in notes]
    profile_limits = {"original": 0, "balanced": 4, "compact": 3, "extreme": 2}
    limit = profile_limits[profile] if polyphony_limit is None else max(0, polyphony_limit)
    filtered: list[Note] = []
    for note in notes:
        if no_drums and note.channel == DRUM_CHANNEL:
            continue
        if note.channel != DRUM_CHANNEL:
            if note.velocity < min_velocity:
                continue
            if drop_short_ms and seconds_between(note.tick, note.end, tempos, division) * 1000 < drop_short_ms:
                continue
        tick = quantize(note.tick, quantize_ticks)
        end = max(tick + 1, quantize(note.end, quantize_ticks)) if quantize_ticks else note.end
        filtered.append(Note(tick, min(end, end_tick), note.channel, note.pitch, note.velocity))
    notes = filtered
    grouped: dict[tuple[int, int], list[Note]] = {}
    for note in notes:
        grouped.setdefault((note.tick, note.channel), []).append(note)
    groups = [((tick, channel), choose_notes(group, limit, drop_policy)) for (tick, channel), group in grouped.items()]
    groups = [(key, group) for key, group in groups if group]
    notes = [note for _, group in groups for note in group]
    for note in notes:
        end_tick = max(end_tick, note.end)
    tempo_map = {(tick, tempo) for tick, tempo in tempos if tempo > 0}
    points = sorted(tempo_map)
    events: list[tuple[int, int, object]] = []
    for tick, tempo in points:
        events.append((tick, 0, (tempo,)))
    for (tick, channel), group in groups:
        events.append((tick, 1, (channel, group)))
    events.sort(key=lambda item: (item[0], item[1]))

    duration_counts = Counter(max(1, note.end - note.tick) for note in notes)
    duration_dict = [duration for duration, _ in duration_counts.most_common(15)]
    duration_indexes = {duration: index for index, duration in enumerate(duration_dict)}
    stream = []
    previous_tick = 0
    event_count = 0
    chord_count = 0
    for tick, kind, values in events:
        stream.append("T" if kind == 0 else ("n" if len(values[1]) == 1 and max(1, values[1][0].end - values[1][0].tick) in duration_indexes else "N" if len(values[1]) == 1 else "G"))
        stream.append(variable(tick - previous_tick))
        if kind == 0:
            stream.append(fixed(max(1, round(values[0] / 10)), 3))
        else:
            channel, group = values
            stream.append(ALPHABET[channel])
            if len(group) == 1:
                note = group[0]
                stream.extend((fixed(note.pitch, 2), ALPHABET[min(15, max(1, round(note.velocity * 15 / 127)))], ALPHABET[duration_indexes[note.end - note.tick]] if note.end - note.tick in duration_indexes else variable(max(1, note.end - note.tick))))
            else:
                chord_count += 1
                common_velocity = len({min(15, max(1, round(note.velocity * 15 / 127))) for note in group}) == 1
                common_duration = len({max(1, note.end - note.tick) for note in group}) == 1
                common_duration_index = duration_indexes.get(max(1, group[0].end - group[0].tick)) if common_duration else None
                flags = (1 if common_velocity else 0) | (2 if common_duration else 0) | (4 if common_duration_index is not None else 0)
                stream.extend((variable(len(group)), ALPHABET[flags]))
                previous_pitch = group[0].pitch
                stream.append(fixed(previous_pitch, 2))
                for note in group[1:]:
                    delta = note.pitch - previous_pitch
                    if -45 <= delta <= 45:
                        stream.append(ALPHABET[delta + 45])
                    else:
                        stream.extend((ALPHABET[VAR_END], fixed(delta + 128, 2)))
                    previous_pitch = note.pitch
                if common_velocity:
                    stream.append(ALPHABET[min(15, max(1, round(group[0].velocity * 15 / 127)))])
                else:
                    stream.extend(ALPHABET[min(15, max(1, round(note.velocity * 15 / 127)))] for note in group)
                if common_duration:
                    stream.append(ALPHABET[common_duration_index] if common_duration_index is not None else variable(max(1, group[0].end - group[0].tick)))
                else:
                    stream.extend(variable(max(1, note.end - note.tick)) for note in group)
        previous_tick = tick
        event_count += 1
    stream.extend(("E", variable(max(0, end_tick - previous_tick))))
    dictionary = ALPHABET[len(duration_dict)] + "".join(variable(duration) for duration in duration_dict)
    payload = "M5|" + fixed(division, 2) + "|" + dictionary + "|" + "".join(stream)
    return payload, event_count, end_tick, chord_count


def main() -> int:
    parser = argparse.ArgumentParser(description="Encode a MIDI file as a compact JS polyphonic player string.")
    parser.add_argument("midi", type=Path, help="input .mid/.midi file")
    parser.add_argument("--name", default="MIDI_SONG", help="JavaScript constant name")
    parser.add_argument("--max-seconds", type=float, default=30, help="clip output to this many seconds (default: 30)")
    parser.add_argument("--no-drums", action="store_true", help="omit MIDI channel 10")
    parser.add_argument("--profile", choices=("original", "balanced", "compact", "extreme"), default="original", help="quality/polyphony preset")
    parser.add_argument("--polyphony-limit", type=int, help="override profile chord limit; 0 keeps every note")
    parser.add_argument("--drop-policy", choices=("preserve-bass-melody", "lowest", "quietest"), default="preserve-bass-melody", help="notes to retain when a chord exceeds its limit")
    parser.add_argument("--drop-short-ms", type=float, default=0, help="drop non-drum notes shorter than this many milliseconds")
    parser.add_argument("--min-velocity", type=int, default=0, help="drop non-drum notes below this MIDI velocity")
    parser.add_argument("--quantize-ticks", type=int, default=0, help="round note starts and ends to this tick grid")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", args.name):
        parser.error("--name must be a valid JavaScript identifier")
    try:
        division, tempos, notes, end_tick = parse_midi(args.midi)
        if args.polyphony_limit is not None and args.polyphony_limit < 0:
            parser.error("--polyphony-limit must be zero or greater")
        if not 0 <= args.min_velocity <= 127:
            parser.error("--min-velocity must be between 0 and 127")
        if args.drop_short_ms < 0 or args.quantize_ticks < 0:
            parser.error("quality thresholds cannot be negative")
        payload, event_count, end_tick, chord_count = encode(
            division, tempos, notes, end_tick, args.no_drums, args.max_seconds,
            args.profile, args.polyphony_limit, args.drop_policy, args.drop_short_ms,
            args.min_velocity, args.quantize_ticks,
        )
    except (OSError, ValueError, struct.error) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    seconds_hint = end_tick * DEFAULT_TEMPO / division / 1_000_000 if division else 0
    print(f"const {args.name} = {json.dumps(payload)};")
    print(f"encoded {len(notes)} notes as {event_count} events ({chord_count} chords), {len(payload)} chars, about {seconds_hint:.1f}s", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
