import sys
from pathlib import Path
sys.path.append('tools/midi_to_string')
from convert import parse_midi, seconds_between

division, tempos, all_notes, end_tick = parse_midi(Path('tools/midi_to_string/midis/barranquilla.mid'))
channels = {}
for n in all_notes:
    if n.channel == 9: continue
    if n.channel not in channels: channels[n.channel] = {}
    sec = seconds_between(0, n.tick, tempos, division)
    t_round = round(sec * 20) / 20.0
    if t_round not in channels[n.channel]: channels[n.channel][t_round] = []
    channels[n.channel][t_round].append(n.pitch)

jumps = []
for ch, times_dict in channels.items():
    times = sorted(times_dict.keys())
    seq = [(t, tuple(sorted(times_dict[t]))) for t in times]
    events = [x[1] for x in seq]
    event_times = [x[0] for x in seq]
    n = len(events)
    
    for i in range(n):
        if event_times[i] > 150.0: # Only care about early t1
            continue
        for j in range(i + 1, n):
            if event_times[j] < 240.0: # Only care about late t2 (outro)
                continue
            if events[i] == events[j]:
                l = 1
                while i + l < n and j + l < n and events[i+l] == events[j+l]:
                    l += 1
                dur = event_times[i+l-1] - event_times[i]
                if dur >= 2.0:
                    jumps.append((dur, event_times[i], event_times[j], ch))

jumps.sort(key=lambda x: (x[1], -x[0])) # sort by earliest t1, then longest dur
seen = []
for r in jumps:
    dur, t1, t2, ch = r
    is_sub = False
    for sdur, st1, st2, sch in seen:
        if ch == sch:
            if (st1 - 0.5 <= t1 <= st1 + sdur + 0.5) and (st2 - 0.5 <= t2 <= st2 + sdur + 0.5):
                is_sub = True
                break
    if not is_sub:
        seen.append(r)

for dur, t1, t2, ch in seen:
    print(f"Channel {ch}: Jump from {t1:.2f}s to {t2:.2f}s (match length: {dur:.2f}s)")
