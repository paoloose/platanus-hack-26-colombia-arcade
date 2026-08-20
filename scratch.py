import re

text = """
- **Channel 3 (Likely Rhythm/Synth/Percussive):** 
  - Has a massive **95.40s loop** starting at 121.20s and repeating exactly at 217.20s.
  - Has a **47.40s loop** starting at 217.20s and repeating at 265.20s.
  - Has a **19.05s loop** starting at 70.20s and repeating at 89.25s.
- **Channel 6:**
  - Plays a **25.50s sequence** at 110.40s that repeats perfectly at 136.20s.
  - Plays a **12.45s sequence** at 136.80s that repeats at 149.25s.
- **Channel 7:**
  - Has a **28.80s loop** starting at 127.05s and repeating at 155.85s.

### The Bassline (Channel 2)
The bass (or low strings) has several prominent structural blocks:
- **28.05s block:** Plays at 117.45s and repeats exactly at 149.40s.
- **19.20s block:** Plays at 174.45s and repeats at 193.65s.
- **13.65s block:** Plays at 146.25s and repeats at 160.65s.
- **9.30s block:** An early section at 31.20s that repeats at 69.60s.

### The Main Melodies (Channels 1, 4, 5)
The primary melodic instruments have tighter, more frequent loops:
- **Channel 1 (Main Lead):**
  - **17.85s phrase:** The core of the late-song loop. Plays at 173.40s and repeats exactly at 192.60s.
  - **9.60s phrases:** Repeated motifs occurring heavily in the 153.75s-163.35s range, and again during the outro (285.45s-295.05s).
- **Channels 4 & 5 (Harmonies/Secondary Leads):**
  - **8.70s - 9.00s loops:** Both channels lock into a tight sequence right around 174.15s that repeats perfectly at 193.35s / 193.20s, matching the main lead's structure but broken into tighter repeating 9-second segments.
"""

def repl(m):
    val = float(m.group(1))
    mins = int(val // 60)
    secs = val % 60
    if mins > 0:
        mm = f" ({mins}m{secs:05.2f}s)"
    else:
        mm = f" (0m{secs:05.2f}s)"
    
    # User requested: for each second (in blue) append its minute alternative in light blue
    return f'<span style="color: blue">{val:.2f}s</span> <span style="color: lightblue">{mm}</span>'

# Replace any number followed by 's' (if it's not already in a tag or ** block, wait it might be)
# Let's just match things like 121.20s
output = re.sub(r'(\d+\.\d{2})s', repl, text)

print(output)
