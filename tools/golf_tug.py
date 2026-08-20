import re

with open("game.js", "r") as f:
    text = f.read()

new_tug = """function drawTugGfx() {
  const g = G.tugGfx;
  if (!g) return;
  G.barVis += (G.bar - G.barVis) * 0.12;
  g.clear();
  const bx = 200, by = 18, bw = 400, bh = 20;
  g.fillStyle(0x000, 1); g.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
  g.fillStyle(C.p1H, 0.3); g.fillRect(bx, by, bw / 2, bh);
  g.fillStyle(C.p2H, 0.3); g.fillRect(bx + bw / 2, by, bw / 2, bh);
  const mx = bx + ((G.barVis + BAR_MAX) / (2 * BAR_MAX)) * bw;
  g.fillStyle(G.barVis >= 0 ? C.p1H : C.p2H, 1); g.fillRect(mx - 4, by - 2, 8, bh + 4);
}"""
text = re.sub(r'function drawTugGfx\(\) \{.*?\}\n', new_tug + '\n', text, flags=re.DOTALL)

with open("game.js", "w") as f:
    f.write(text)
