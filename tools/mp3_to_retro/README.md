# mp3_to_retro

Convert an audio clip into a tiny retro chiptune event string for `game.js`.

## Setup

```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
```

## Usage

```bash
./.venv/bin/python convert.py /path/to/song.mp3 > retro.txt
./.venv/bin/python convert.py /path/to/video.webm --duration 30
```

### Options

- `--offset`: start time in seconds (default: 0)
- `--duration`: clip length in seconds (default: 30, max: 40)
- `--bpm`: force tempo; auto-detected if omitted
- `--no-bass`: drop the bass voice to save characters
- `--no-drums`: omit detected percussion events

## Output format

```
"R3|<bpm>|<melody-events>|<bass-events>|<drum-events>"
```

The `R3` format stores only events found in the source. Melody and bass events
are six characters each: pitch, two-character centisecond start time,
two-character centisecond duration, and level. Drum events are four characters:
two-character centisecond start time, type, and level. The pitch alphabet starts
at C1. No rests or generated notes are stored.

Copy the quoted string into `game.js` and pass it to `playRetro()`.

The converter uses `ffmpeg` on `PATH` to decode MP3, WebM, WAV, and other
supported formats before running the offline `librosa` analysis.
