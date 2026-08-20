with open('tools/midi_to_string/analyze_structure.py', 'r') as f:
    content = f.read()

content = content.replace("end_of_song = 310.0", "end_of_song = seconds_between(0, end_tick, tempos, division)")

old_print = """            cuts_str = ", ".join([f"({s:.2f}, {e:.2f})" for s, e in cuts])
            print(f"  embed.py format: [ {cuts_str} ]\\n")"""

new_print = """            cut_strs = [f"({s:.2f}, {e:.2f})" for s, e in cuts[:-1]]
            if cuts:
                s, e = cuts[-1]
                cut_strs.append(f"({s:.2f}, None)")
            cuts_str = ", ".join(cut_strs)
            print(f"  embed.py format: [ {cuts_str} ]\\n")"""

content = content.replace(old_print, new_print)

with open('tools/midi_to_string/analyze_structure.py', 'w') as f:
    f.write(content)
