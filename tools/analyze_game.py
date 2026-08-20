import re

with open("game.js", "r") as f:
    text = f.read()

def extract_block(start_keyword, name):
    pattern = rf"function {name}\b.*?\{{"
    match = re.search(pattern, text, flags=re.DOTALL)
    if not match:
        return 0
    start = match.start()
    
    # count braces to find end
    brace_count = 0
    in_str = False
    str_char = ''
    i = match.end() - 1
    
    while i < len(text):
        c = text[i]
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == str_char:
                in_str = False
        else:
            if c in ("'", '"', "`"):
                in_str = True
                str_char = c
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0:
                    return (i + 1) - start
        i += 1
    return 0

funcs = [
    "create", "update", "drawBackground", "drawStage", "drawFloor",
    "drawPatternBg", "drawPlayer", "drawTugBar", "drawTugGfx", "drawArrowGfx",
    "drawTitleScreen", "updateTitleMode", "drawCharSelScreen", "updateCharSel",
    "drawDiffSelScreen", "updateDiffSel", "drawSplashScreen",
    "startBattle", "updateBattle", "spawnNote", "checkHits", "showFeedback", "explodeNote", "checkComboText",
    "drawWinScreen", "updateWinScreen",
    "unpack", "decode", "playMidi", "generateWave",
    "parseCSEF", "dsp", "drawArrow"
]

for func in funcs:
    size = extract_block("function", func)
    print(f"Function {func}: {size} bytes")

print("MIDI BARRANQUILLA:", len(re.search(r'MIDI_SONG_BARRANQUILLA\s*=\s*"([^"]+)"', text).group(1)) if re.search(r'MIDI_SONG_BARRANQUILLA\s*=\s*"([^"]+)"', text) else 0)
print("MIDI FRUKO:", len(re.search(r'MIDI_SONG_FRUKO_Y_SUS_TESOS\s*=\s*"([^"]+)"', text).group(1)) if re.search(r'MIDI_SONG_FRUKO_Y_SUS_TESOS\s*=\s*"([^"]+)"', text) else 0)
print("MIDI LOBA:", len(re.search(r'MIDI_SONG_LOBA\s*=\s*"([^"]+)"', text).group(1)) if re.search(r'MIDI_SONG_LOBA\s*=\s*"([^"]+)"', text) else 0)
print("MIDI NUESTRA:", len(re.search(r'MIDI_SONG_NUESTRA_CANCION\s*=\s*"([^"]+)"', text).group(1)) if re.search(r'MIDI_SONG_NUESTRA_CANCION\s*=\s*"([^"]+)"', text) else 0)

sprites = re.findall(r"sp\('([^']+)'", text)
print("SPRITE STRINGS:", sum(len(s) for s in sprites))
