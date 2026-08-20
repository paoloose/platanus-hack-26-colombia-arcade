import re

with open("game.js", "r") as f:
    text = f.read()

new_pattern = """function drawPatternBg(s) {
  if (G.menuBgGraphics) G.menuBgGraphics.destroy();
  const g = s.add.graphics();
  g.fillStyle(0xF9E076, 1); g.fillRect(0, 0, W, H);
  G.menuBgGraphics = g;
  G.worldLayer.add(g); G.worldLayer.sendToBack(g);
}"""
text = re.sub(r'function drawPatternBg\(s\) \{.*?G\.worldLayer\.sendToBack\(bg\);\n\}', new_pattern, text, flags=re.DOTALL)

with open("game.js", "w") as f:
    f.write(text)
