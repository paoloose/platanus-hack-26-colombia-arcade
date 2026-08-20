import sys
from pathlib import Path
from collections import defaultdict

sys.path.append(str(Path(__file__).parent))
from convert import parse_midi, seconds_between

def fmt_time(sec: float) -> str:
    m = int(sec // 60)
    s = sec % 60
    return f"{sec:.2f}s ({m}m{s:05.2f}s)"

def analyze_midi(file_path):
    division, tempos, all_notes, end_tick = parse_midi(Path(file_path))
    
    channels = {}
    for n in all_notes:
        if n.channel == 9: continue
        if n.channel not in channels: channels[n.channel] = {}
        sec = seconds_between(0, n.tick, tempos, division)
        t_round = round(sec * 10) / 10.0 
        if t_round not in channels[n.channel]: channels[n.channel][t_round] = []
        channels[n.channel][t_round].append(n.pitch)

    print("==================================================")
    print(" INITIAL ANALYSIS: REPEATING SEGMENTS PER CHANNEL ")
    print("==================================================")

    raw_jumps = []
    for ch, times_dict in channels.items():
        times = sorted(times_dict.keys())
        seq = [(t, tuple(sorted(times_dict[t]))) for t in times]
        events = [x[1] for x in seq]
        event_times = [x[0] for x in seq]
        n = len(events)
        
        matches = []
        for i in range(n):
            for j in range(i + 1, n):
                if events[i] == events[j] and event_times[j] - event_times[i] >= 2.0:
                    l = 1
                    while i + l < n and j + l < n and events[i+l] == events[j+l]:
                        l += 1
                    dur = event_times[i+l-1] - event_times[i]
                    if dur >= 2.0:
                        matches.append((dur, event_times[i], event_times[j]))
                        
        matches.sort(key=lambda x: -x[0])
        seen = []
        for dur, t1, t2 in matches:
            is_sub = False
            for sdur, st1, st2 in seen:
                if (st1 - 1.0 <= t1 <= st1 + sdur + 1.0) and (st2 - 1.0 <= t2 <= st2 + sdur + 1.0):
                    is_sub = True
                    break
            if not is_sub:
                seen.append((dur, t1, t2))
                raw_jumps.append((t1, t2, dur, ch))

        if seen:
            print(f"\n--- Channel {ch} ---")
            for dur, t1, t2 in seen[:5]:
                print(f"  {fmt_time(dur)} loop (at {fmt_time(t1)}, repeats at {fmt_time(t2)})")

    multi_jumps = []
    used = set()
    for i, (t1_a, t2_a, d_a, c_a) in enumerate(raw_jumps):
        if i in used: continue
        chans = [c_a]
        used.add(i)
        for j, (t1_b, t2_b, d_b, c_b) in enumerate(raw_jumps):
            if j not in used:
                if abs(t1_a - t1_b) < 1.0 and abs(t2_a - t2_b) < 1.0:
                    chans.append(c_b)
                    used.add(j)
        if len(chans) >= 2:
            multi_jumps.append((t1_a, t2_a, chans))
            
    print("\n==================================================")
    print(" SPEEDRUN VERSIONS (50s to 120s Playtime)")
    print("==================================================")
    
    end_of_song = seconds_between(0, end_tick, tempos, division)
    outro_threshold = max(end_of_song - 60.0, end_of_song * 0.8)
    valid_paths = []
    queue = [(0.0, 0.0, [], [])]
    
    max_nodes = 50000
    nodes_processed = 0
    
    while queue and nodes_processed < max_nodes:
        nodes_processed += 1
        curr_t, playtime, cuts, jumps = queue.pop(0)
        
        if curr_t >= outro_threshold:
            final_cuts = cuts + [(curr_t, end_of_song)]
            total_play = playtime + (end_of_song - curr_t)
            if 50.0 <= total_play <= 120.0:
                valid_paths.append((total_play, final_cuts, jumps))
            continue
            
        for t1, t2, chans in multi_jumps:
            if t1 >= curr_t + 1.0 and t2 > t1 + 5.0:
                new_play = playtime + (t1 - curr_t)
                if new_play < 120.0: 
                    queue.append((t2, new_play, cuts + [(curr_t, t1)], jumps + [(t1, t2)]))
                    
    valid_paths.sort(key=lambda x: x[0]) 
    
    printed = 0
    seen_cuts = set()
    for playtime, cuts, jumps in valid_paths:
        cut_tuple = tuple((round(s, 1), round(e, 1)) for s, e in cuts)
        if cut_tuple not in seen_cuts and len(jumps) > 0:
            printed += 1
            seen_cuts.add(cut_tuple)
            print(f"Version {printed}: Playtime {fmt_time(playtime)} ({len(jumps)} jumps)")
            for i, (t1, t2) in enumerate(jumps):
                print(f"  Jump {i+1}: Play until {fmt_time(t1)} -> Skip to {fmt_time(t2)}")
            cut_strs = [f"({s:.2f}, {e:.2f})" for s, e in cuts[:-1]]
            if cuts:
                s, e = cuts[-1]
                cut_strs.append(f"({s:.2f}, None)")
            cuts_str = ", ".join(cut_strs)
            print(f"  embed.py format: [ {cuts_str} ]\n")

if __name__ == "__main__":
    default_path = Path(__file__).parent / "midis" / "barranquilla.mid"
    target = sys.argv[1] if len(sys.argv) > 1 else default_path
    analyze_midi(target)
