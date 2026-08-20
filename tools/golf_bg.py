import re

with open("game.js", "r") as f:
    text = f.read()

new_draw_bg = """function drawBackground(s) {
  const g = s.add.graphics(); g.setDepth(-100);
  g.fillStyle(0x1a3466, 1); g.fillRect(-PAD, -PAD, W+PAD*2, H+PAD*2);
  G.bgGfx = g;
}"""
text = re.sub(r'function drawBackground\(s\) \{.*?G\.bgGfx = g;\n\}', new_draw_bg, text, flags=re.DOTALL)

with open("game.js", "w") as f:
    f.write(text)
