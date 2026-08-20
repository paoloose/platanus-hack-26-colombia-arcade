import zlib
import base64
import json
from pathlib import Path
import sys

# Need to import parse_midi and encode from convert.py
sys.path.append('tools/midi_to_string')
from convert import encode, parse_midi, seconds_between, tick_at_seconds, Note

SONG_LIST = [
    ("barranquilla.mid", [(0.00, 43.20), (100.80, 132.80), (166.40, 182.80), (308.80, None)]),
    ("fruko_y_sus_tesos.mid", [(0.0, 60.0)]),
    ("loba.mid", [(1.8, 73.0)]),
    ("nuestra_cancion.mid", [(2.0, 93.0)]),
]

def pack_raw(path: Path, cuts: list[tuple[float, float | None]]) -> str:
    division, tempos, all_notes, total_end_tick = parse_midi(path)
    final_notes, final_tempos, current_tick_offset = [], [], 0
    
    for start_sec, end_sec in cuts:
        start_tick = tick_at_seconds(tempos, division, start_sec) if start_sec else 0
        end_tick = tick_at_seconds(tempos, division, end_sec) if end_sec is not None else total_end_tick
        end_tick = min(total_end_tick, end_tick)
        
        if end_tick <= start_tick: continue
            
        for n in all_notes:
            if n.end <= start_tick or n.tick >= end_tick: continue
            new_tick = max(0, n.tick - start_tick) + current_tick_offset
            new_end = max(new_tick + 1, min(n.end, end_tick) - start_tick + current_tick_offset)
            final_notes.append(Note(new_tick, new_end, n.channel, n.pitch, n.velocity))
            
        cut_tempos, active_tempo = [], 500000
        for t_tick, t_val in tempos:
            if t_tick <= start_tick: active_tempo = t_val
            elif t_tick < end_tick: cut_tempos.append((t_tick - start_tick + current_tick_offset, t_val))
                
        if not final_tempos or final_tempos[-1][1] != active_tempo or current_tick_offset == 0:
            final_tempos.append((current_tick_offset, active_tempo))
            
        final_tempos.extend(cut_tempos)
        current_tick_offset += (end_tick - start_tick)

    final_end_tick = current_tick_offset
    final_notes.sort(key=lambda n: n.tick)

    payload, _, _, _ = encode(
        division, final_tempos, final_notes, final_end_tick,
        no_drums=False, max_seconds=None, profile="original",
        polyphony_limit=None, drop_policy="preserve-bass-melody",
        drop_short_ms=0, min_velocity=0, quantize_ticks=0,
    )
    return payload

songs_dict = {}
for filename, cuts in SONG_LIST:
    path = Path('tools/midi_to_string/midis') / filename
    payload = pack_raw(path, cuts)
    songs_dict[filename] = payload

# Compress everything together
json_str = json.dumps(songs_dict)
compressed = zlib.compress(json_str.encode(), 9)
b64 = base64.urlsafe_b64encode(compressed).decode()

print(f"Combined compressed size: {len(b64)} chars")

# Individual sizes
indiv_total = 0
for payload in songs_dict.values():
    comp = zlib.compress(payload.encode(), 9)
    indiv_total += len(base64.urlsafe_b64encode(comp).decode())
print(f"Individual compressed total: {indiv_total} chars")

