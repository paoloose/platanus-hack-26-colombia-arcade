# Retro MP3 Encoder Design

## Goal
Convert an MP3 file into a tiny (~3-4 KB) printable string that a Phaser/Web-Audio function can parse and play as a retro chiptune.

## Approach
Melody + rhythm sequence extraction:
1. Load MP3 via `librosa` (mono, 22050 Hz).
2. Detect onsets and beat frames.
3. Extract dominant pitch per onset segment via short-time FFT.
4. Quantize pitch to a Colombian-friendly minor/major scale and durations to 16th notes.
5. Encode events as compact base95 ASCII.

## Output Format
- Each melodic note = 2 printable ASCII chars: `pitch_char` + `duration_char`.
- Pitch char encodes MIDI note offset from a base note (range covers ~C2-C7).
- Duration char encodes quantized length in 16th-note units.
- Percussion is generated algorithmically from detected onsets (not stored per-hit).

## Constants / Defaults
- `DEFAULT_OFFSET_SECONDS = 0`
- `DEFAULT_DURATION_SECONDS = 30`
- `MAX_OUTPUT_CHARS = 3500`
- `SAMPLE_RATE = 22050`
- `QUANTIZE_UNIT = 16th note`
- `DEFAULT_BPM = 100` (auto-detected or fallback)
- `BASE_NOTE = 36` (C2)

## JS Playback
- `playRetro(dataString)` parses the string and schedules Web Audio oscillators (square/triangle) + short noise bursts for percussion.
- Runs inside the existing button callback as the proof of concept.

## Proof of Concept
- Convert `/tmp/barranquilla.mp3` with defaults.
- Embed the produced string in `game.js` and play it on the button click.
