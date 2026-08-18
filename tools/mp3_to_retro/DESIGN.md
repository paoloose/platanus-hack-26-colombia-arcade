# Retro MP3 Encoder Design

## Goal
Convert an MP3 file into a tiny (~3-4 KB) printable string that a Phaser/Web-Audio function can parse and play as a retro chiptune.

## Approach
Source-event transcription:
1. Decode MP3, WebM, WAV, or another ffmpeg-supported input to mono PCM.
2. Detect source attacks directly at millisecond-scale resolution.
3. Score MIDI candidates by their fundamental and harmonic partials for melody and bass.
4. Detect actual percussive onsets and classify their measured spectrum.
5. Store only source events with absolute centisecond positions, durations, pitches, and levels.

## Output Format
- Format is `R3|bpm|melody|bass|drums`.
- Melody and bass events are six printable characters: pitch, two-character
  centisecond start time, two-character centisecond duration, and level.
- Drum events are four printable characters: two-character centisecond start
  time, type, and level.
- No fallback percussion, scale quantization, or generated musical events are used.

## Constants / Defaults
- `DEFAULT_OFFSET_SECONDS = 0`
- `DEFAULT_DURATION_SECONDS = 30`
- `SAMPLE_RATE = 22050`
- `DEFAULT_BPM = 110` (auto-detected or fallback)
- `BASE_NOTE = 24` (C1)

## JS Playback
- `playRetro(dataString)` parses the string and schedules Web Audio oscillators (square/triangle) + short noise bursts for percussion.
- Runs inside the existing button callback as the proof of concept.

## Proof of Concept
- Convert the first 30 seconds of the chosen source with defaults.
- Embed the produced string in `game.js` and play it on the button click.
