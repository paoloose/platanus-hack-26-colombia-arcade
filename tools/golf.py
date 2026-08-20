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

new_draw_floor = """function drawFloor(s) {
  const g = s.add.graphics(); g.setDepth(-80);
  g.fillStyle(0x989490, 1); g.fillRect(-PAD, 400, W+PAD*2, H);
  G.floorGfx = g;
}"""
text = re.sub(r'function drawFloor\(s\) \{.*?G\.floorGfx = g;\n\}', new_draw_floor, text, flags=re.DOTALL)

with open("game.js", "w") as f:
    f.write(text)
