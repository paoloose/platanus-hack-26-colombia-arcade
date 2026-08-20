import zlib
import base64
import json
from pathlib import Path
import sys

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

songs_list = []
for filename, cuts in SONG_LIST:
    path = Path('tools/midi_to_string/midis') / filename
    songs_list.append(pack_raw(path, cuts))

dancers_str = """[
  ['Cumbiambera', [
    sp('9.1.1<9.4.9.1<1N1<3U9.8.2r1<5U8.8.1r1<1r2U3,8.8.1[1r2U2,1A1,8.7.1[1<1[2{2,1A1,8.8.1[2U1<4,8.9.1.1U1{3,9.9.2.1{1,1[9.1.9.1.3[2G9.9.1,5G1,8.8.2,5G2,7.7.2,1.2E4G2,6.6.2,9G3,4.5.4<4G2<3r2,4.4.1G3r6<2r2[1G5.4.2G2[6r2[3G5.4.1E2G7[3G2<1G4.5.1E9G3<1r1[1G3.6.4E1{3G2<2r2[1G3.9.3{1.2G2r2[2G3.8.3,3.5G5.7.2,5.1,1{8.7.3,2.>', 24),
    sp('8.1I9.6.7.1I1N1I9.5.6.2r1I4U9.2.6.1r1<1r5U9.1.6.1[1r2U4,9.1.5.1[1<1[1U1,1A1,1A1,9.1.6.1[2U1,1A1,1A1,9.1.8.1<5,1<9.9.1.3,6.2,3.2.2,5.1[3{1[3.3,1G3.2.1G4,3G3[3G3,1<1G3.2.1G1<1.3,7G3,1.1<1G3.1.1G1[1r1<3.2E3G2E3.1G1<1r1G2.1.1G1[1r1<2G2.5E3.1G2<1r1G2.1.1G1[2r1<9G3G1<2r1G2.1.1G2[2r1<9G2<2r1[1G2.1.2G1[2r2<7G2<2r1[2G2.2.2G1[2r3<3G3<2r1[2G3.3.1G2[3r5<3r2[1G4.3.2G3[7r3[1G5.4.3G9[2G6.6.9G1G8.9.2,1.2,9.1.8.3,1.3,9.', 24),
    sp('8.1I9.6.7.1I1N1I3U9.2.6.2r1I5U9.1.6.1r1<1r2U3,9.1.6.1[1r2U2,1A1,9.1.5.1[1<1[2{2,1A1,9.1.6.1[2U1<4,4.2,4.8.1U1{3,4.3,1G3.9.1{1,1[4.2,1<1r1[1G2.6.2G3[2G2.2,1.1<1r1[1G2.5.8G3,2.1<1r1[1G2.5.3,5G2,3.1<1r1[1G2.4.2,2.4E2G3.2<1r1[1G2.4.2,3.1E5G1.2<1r1[2G2.3.1<3,8G2<1r1[1G4.2.1G2r3<6G2<1r2[1G4.2.1G2[2r2<4G2<1r2[1G5.2.2G2[2r6<2r1[1G6.3.2G2[7r2[1G7.4.3G8[2G7.5.9G1G9.7.2,3.2,9.1.7.2,3.1,1{9.1.7.3,2.3,9.', 24),
    sp('~~8.1I9.6.7.1I1N1I9.5.6.2r1I4U9.2.6.1r1<1r5U9.1.6.1[1r2U4,9.1.5.1[1<1[1U1,1A1,1A1,9.1.6.1[2U1,1A1,1A1,9.1.8.1<5,1<9.9.1[3,1[9.1.7.2G5[2G4,4.6.9G1G6,2.6.1{2,4G1E5.1<3,1.7.3,3E5G1<2r1G2.5.1r1<1G3,5G2<2r1[1G2.4.2r2<1G3,3G2<2r1[2G2.3.1G1[2r3<2{1G3<2r1[2G3.3.1G2[3r5<3r2[1G4.3.2G3[7r3[1G5.4.3G9[2G6.5.1,9G1G8.4.4,4.2,9.1.3.3,6.3,9.', 24),
  ]],
  ['La Palenquera', [
    sp('8.2X4.1X2.1X6.9.1X1?1<1?3]2Y6.8.1X1.1<1?1<1?3]2c1X4.9.1.1?1<1?1<3]3c4.9.1.9{5.9.2.7{6.9.3.5[7.9.2.1[1<5[6.9.1.1[1<1r1[1M2J1[6.9.1.1[1<1r1M4J6.9.2.1<1r1M1A2J1A6.9.2.2r2J2]1J6.9.3.1M5J6.9.1.2<1.2J2.2<5.9.1J2r6<1r1J4.7.3J2[6r3J3.6.3J3.5[2.2J3.4.3J5.5<2.2J3.3.1G2[6.5<1.3J3.4.1G3[2r8<2J4.4.2G3[2r1<5r1<1r5.5.2G3[1r1<5r1<2[4.6.2G4[5<2[1G4.5.2J3G8[1G5.4.4J1.9G6.4.2J9.2J7.5.1J9.2J7.9.6.3J6.', 24),
    sp('~~~8.2X4.1X2.1X6.9.1X1?1<1?3]2Y6.8.1X1.1<1?1<1?3]2c1X4.9.1.1?1<1?1<3]3c4.9.1.9{5.9.2.7{6.9.3.5[7.9.2.1[1<5[6.9.1.1[1<1r1[1M2J1[6.9.1.1[1<1r1M4J4.1X1.9.2.1<1r1M1A2J1A3.3]9.2.2r2J2]1J3.3]9.3.1M5J4.2J4.2[2.2J2<1.2J2.2<2.2J1.3.1G1[1.4J2r6<1r1J1.2J1.3.1G1[3J2.2[6r5J1.3.1G2[6.5[2.3J2.3.1G2[6.5<7.4.1G2[3r8<6.4.2G2[3r1<5r1<1r5.5.2G3[1r1<5r1<2[4.6.2G4[5<2[1G4.7.3G8[1G1J4.9.9G3J3.9.1.3J6.3J2.', 24),
    sp('5.2X4.1X2.1X9.6.1X1?1<1?3]2Y9.5.1X1.1<1?1<1?3]2c1X7.7.1?1<1?1<3]3c7.7.9{8.8.7{9.9.5[9.1.8.1[1<3[1<9.1.7.1[2<1M3J1<9.7.1[1<1M4J1<9.8.1<1J1A2J1A9.1.8.1r2J2]1J9.1.9.1M4J9.1.7.2<1.2J2.2<8.1.1J2.3J2r6<1r2J6.1.6J2[6r6J3.1G2[1<5.5[5.3J2.1G1[2r2<3.1?5<6.1<2.1G2[2r2<3?9<2r1[2.1.1G2[2r9<1<4r1[1G2.1.2G2[3r1<5r1<3r2[2G2.2.2G2[2r1<5r1<2r2[2G3.3.2G4[5<3[3G4.4.3G8[3G6.6.9G1G8.8.2J2.2J9.1.7.3J2.2J9.1.7.3J2.3J9.', 24),
  ]],
  ['Marimonda', [
    sp('4.3r1.7o1.3r5.3.5r3&1o3&5r4.3.5r1&2B1Y2B1&5r4.^3.5r3&1Y3&5r1.2{1.3.5r3o1Y3o5r1.2{1.4.4r1o2<1Y2<1o4r2.2G1.8.1o2N1Y2N1o4.3G2.9.2o1Y2o3.5G2.8.2c1r1Y1r2c5G4.7.1G2c3r2c4G5.5.3G2c1G1r1G2c9.4.3G1.2c1G1r1G2c9.3.3G2.2c1G1r1G2c9.3.2G3.2c1G1r1G1c1<1c8.2.3G4.1<2G2<1c1<8.1.2{1G5.1<1c1<1c3<1c7.1.2{5.1c2<3.1c2<7.8.1<1c4.1<1c8.8.2<4.1c1<8.8.1c2<3.2Y8.8.2<1c3.3Y7.9.2Y9.4.8.3Y9.4.', 24),
    sp('7.7o1.3r6.5.1r3&1o3&1o5r5.4.2r1&2B1Y2B1&1o5r5.3.3r1&2B1Y2B1&1o5r5.3.3r3&1Y3&1o5r5.3.4r2o1Y4o5r5.4.3r1o1<1Y3<1o4r6.7.1o1N1Y3N1o9.1.8.1o1Y3o9.2.7.1G1c1Y2r2c2G8.6.2G1c3r2c3G7.5.3G1c1G1r1G2c3G7.4.3G1.1c2{6G7.4.2G2.1c2{5E8.4.1G2{1.1c1G1r1G2c9.1.5.2{1.1<3G2<9.1.8.2<1c1<1c1<9.1.8.1c5<9.1.9.1c1<1c1<2J1<2Y6.9.1.2<2J1c1<2Y6.9.1.2<5.1Y6.9.1<1c9.4.9.2Y9.4.8.3Y9.4.', 24),
    sp('~~~5.3r9.3r4.4.5r7o5r3.^4.5r3&1o3&5r3.4.5r1&2B1Y2B1&5r3.^5.4r3&1Y3&4r4.9.1o2<1Y2<1o8.9.1o2N1Y2N1o8.6.3G1c2o1Y2o1c3G5.5.4G2c1r1Y1r2c4G4.4.3G2.2c1G1r1G2c2.3G3.4.2G3.2c1G1r1G2c3.2G3.4.2{3.2c1G1r1G2c3.2{3.4.2{2.2<1c1G1r1G1c2<2.2{3.6.1<1c4<1G2<1c3<1c4.6.3<1c1<1c1<1c3<1c2<4.6.1c2<8.1<1c5.6.2<1c8.1c1<5.7.2Y8.2Y5.6.3Y8.3Y4.', 24),
    sp('6.3r1.7o2r5.5.5r1o3&1o3&2r4.5.5r1o1&2B1Y2B1&2r4.^5.5r1o3&1Y3&2r4.5.5r4o1Y2o3r4.6.4r1o3<1Y1<1o2r5.9.1.1o3N1Y1N1o7.9.2.3o1Y1o8.8.2G2c2r1Y1c1G7.7.3G2c3r1c1G7.7.2G1.2c1G1r1G1c1G7.^7.2G1.2c1G1r1G1c2G6.7.3G1{1c1G1r1G1c2G1{5.8.1G2{1<3G1<1.2{5.9.1.1<1c1<1c2<8.6.1Y1c1<1.5<1c8.6.1Y3<1c1<1c1<1c1<8.6.2Y1c2<1c1<1.3<7.6.1Y2.1<1c2<2.1c1<7.9.6.1<1c7.9.6.2Y7.9.6.3Y6.', 24),
  ]],
  ['Rolo con ruana', [
    sp('9.1.2A>9.1A2U>^7.5A>7.5U>9.2U1{1A1{1A9.9.1U5{9.9.1.2{2G1{9.9.2.1{>9.1}1f3N1f2}7.8.2}2f1N2f2}1T6.7.2T2}1f1N1f2}2T6.7.2T2}1f1N1f1}1T1M1;6.6.2;2T1}2f3M2;6.6.3;1T2}1f2{2;7.5.2{1;1.2T1}1f2{1;8.4.1[2{2.2T1}1f2}1T8.3.1[1x1<3.2T1}1f2}1T8.3.1[1x1<3.2T1}2B1}1T8.4.1x4.2T1B2C1B1T8.9.1.1B1C1B2C9.9.1.3C1B2C8.9.1.3C1.2C8.9.1.2L3.3L6.', 24),
    sp('~9.1.2A>9.1A2U>3.2<4.1A4U1A9.2.2x2<1.9A1A7.1.3[2{1.9U1U7.4.1{1;3.2U1{1A1{1A9.5.2;2.1U5{9.5.2;3.2{2G1{9.6.3;1}1f2{1N1f2}7.7.1;1}2f2N2f2}1T1.2;2{1.7.2T1f2N2f2}1T4;2{1.7.1}1T4f2}2T2;5.6.2}1T3f3}1T8.5.2}1T3f3}2C8.4.3}1T1f2T1}1T4C4.1L2.5.1}2T1f1T9C1.2L2.6.1T2f1T5C1B1.3C2L2.7.1f2T3C2B1C2.2C2L2.9.2T2.3C8.9.5.2C8.^9.5.2L8.9.5.4L6.', 24),
    sp('9.1.5A9.9.1A5U1A8.2.2[5.1A5U1A8.1.3x1[3.9A1A6.1.1x1<2{3.9U1U3.2{1.2.1<2{1;3.1U1{1A1{1A1{1U4.2{2.4.2;3.1U5{1U4.2;2.5.2;1}2.1{2G2{4.2;3.5.2;3}1.2{3.2}3;3.6.2T2}1f3N1f3}2;4.7.1T2}2f1N2f2}1T6.7.2T2}1f1N1f2}2T6.8.1T2}1f1N1f1}3T6.8.2T1}3f1}3T6.8.2T2}1f2}2T7.8.3T1}1f2}1T8.7.4T1}1f2}1T8.6.5T1}1f2}2T7.6.5T1}1f2}3T6.5.6T1}1f2}3T6.5.1T2.5B2C2B1T6.7.3C3T1B3C7.7.3C2.>6.4L5.3L6.', 24),
  ]],
]"""

# Clean up DANCERS string to just the inner CSEF strings to represent what would be in JSON
import ast
import re

csef_strings = re.findall(r"sp\('([^']+)'", dancers_str)
dancers_data = {"d": csef_strings, "s": songs_list}

combined_json = json.dumps(dancers_data, separators=(',', ':'))
comp = zlib.compress(combined_json.encode(), 9)
b64 = base64.urlsafe_b64encode(comp).decode()
print(f"Combined DANCERS+SONGS compressed size: {len(b64)} chars")

