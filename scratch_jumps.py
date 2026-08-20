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

jumps = {}
for ch, times_dict in channels.items():
    times = sorted(times_dict.keys())
    seq = [(t, tuple(sorted(times_dict[t]))) for t in times]
    events = [x[1] for x in seq]
    event_times = [x[0] for x in seq]
    n = len(events)
    for i in range(n):
        if 130.0 <= event_times[i] <= 145.0:
            for j in range(i + 1, n):
                if event_times[j] >= 240.0:
                    if events[i] == events[j]:
                        l = 1
                        while i + l < n and j + l < n and events[i+l] == events[j+l]:
                            l += 1
                        dur = event_times[i+l-1] - event_times[i]
                        if dur >= 2.0:
                            key = (round(event_times[i], 1), round(event_times[j], 1))
                            if key not in jumps: jumps[key] = []
                            jumps[key].append((ch, round(dur, 1)))

for (t1, t2), chans in sorted(jumps.items()):
    if len(chans) >= 2:
        print(f"Jump {t1}s -> {t2}s matches on channels: {chans}")
