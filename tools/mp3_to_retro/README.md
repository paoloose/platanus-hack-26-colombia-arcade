# mp3_to_retro

Convert an MP3 clip into a tiny retro chiptune string for `game.js`.

## Setup

```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
```

## Usage

```bash
./.venv/bin/python convert.py /path/to/song.mp3 > retro.txt
./.venv/bin/python convert.py /tmp/barranquilla.mp3 --offset 10 --duration 30
```

### Options

- `--offset`: start time in seconds (default: 0)
- `--duration`: clip length in seconds (default: 35, max: 40)
- `--bpm`: force tempo; auto-detected if omitted
- `--no-bass`: drop the bass voice to save characters

## Output format

```
"<bpm>|<melody>|<bass>"
```

Each character is one 16th-note step. Space = rest. Letters/numbers map to pitches via a base64 alphabet starting at C3.

Copy the quoted string into `game.js` and pass it to `playRetro()`.
