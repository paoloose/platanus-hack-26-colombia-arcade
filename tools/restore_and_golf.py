import re

with open("game.js", "r") as f:
    text = f.read()

# Replace drawStage
new_draw_stage = """function drawStage(s) {
  const g = s.add.graphics(), X0 = -PAD, X1 = W + PAD, FW = X1 - X0;
  g.setDepth(-90);
  const mtn = (c, y) => { g.fillStyle(c, 1); g.beginPath(); g.moveTo(X0, 400); for(let x=X0;x<=X1;x+=15) g.lineTo(x, y + Math.sin(x*.01)*30); g.lineTo(X1,400); g.fillPath(); };
  mtn(0x3a6a4a, 180); mtn(0x1e4a2a, 240);
  for(let x=X0; x<X1; x+=40) { g.fillStyle(0x484860,1); g.fillRect(x, 400-50-(x%70), 30, 100); }
  G.stageGfx = g;
}"""
text = re.sub(r'function drawStage\(s\) \{.*?G\.stageGfx = g;\n\}', new_draw_stage, text, flags=re.DOTALL)

# Replace drawFloor
new_draw_floor = """function drawFloor(s) {
  const g = s.add.graphics(); g.setDepth(-80);
  g.fillStyle(0x989490, 1); g.fillRect(-PAD, 400, W+PAD*2, H);
  G.floorGfx = g;
}"""
text = re.sub(r'function drawFloor\(s\) \{.*?G\.floorGfx = g;\n\}', new_draw_floor, text, flags=re.DOTALL)

# Replace drawBackground
new_draw_bg = """function drawBackground(s) {
  const g = s.add.graphics(); g.setDepth(-100);
  g.fillStyle(0x1a3466, 1); g.fillRect(-PAD, -PAD, W+PAD*2, H+PAD*2);
  G.bgGfx = g;
}"""
text = re.sub(r'function drawBackground\(s\) \{.*?G\.bgGfx = g;\n\}', new_draw_bg, text, flags=re.DOTALL)

# Replace drawPatternBg
new_pattern = """function drawPatternBg(s) {
  if (G.menuBgGraphics) G.menuBgGraphics.destroy();
  const g = s.add.graphics();
  g.fillStyle(0xF9E076, 1); g.fillRect(0, 0, W, H);
  G.menuBgGraphics = g;
  G.worldLayer.add(g); G.worldLayer.sendToBack(g);
}"""
text = re.sub(r'function drawPatternBg\(s\) \{.*?G\.worldLayer\.sendToBack\(bg\);\n\}', new_pattern, text, flags=re.DOTALL)

# Replace drawTugGfx
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
