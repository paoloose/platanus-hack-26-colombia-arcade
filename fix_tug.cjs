const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');

const oldDrawTugGfx = `function drawTugGfx() {
  const g = G.tugGfx;
  if (!g) return;
  G.barVis += (G.bar - G.barVis) * 0.12;
  g.clear();
  const bx = 200, by = 18, bw = 400, bh = 20;
  // Thick pixel border (NES style)
  fRect(g, 0x000, 1, bx - 8, by - 8, bw + 16, bh + 16);
  fRect(g, 0x2a2a3a, 1, bx - 4, by - 4, bw + 8, bh + 8);
  // Bar background
  fRect(g, 0x0a0a14, 1, bx, by, bw, bh);
  // Left half P1, right half P2
  fRect(g, C.p1H, 0.3, bx, by, bw / 2, bh);
  fRect(g, C.p2H, 0.3, bx + bw / 2, by, bw / 2, bh);
  // Center divider
  fRect(g, '#fff', 0.5, bx + bw / 2 - 1, by - 4, 2, bh + 8);

  // Fill active sections based on bar position
  const mx = Mround(bx + ((G.barVis + BAR_MAX) / (2 * BAR_MAX)) * bw);
  const danger = Mabs(G.barVis) > 80;
  
  if (G.barVis > 0) {
    // P1 winning
    fRect(g, C.p1H, 1, bx, by, mx - bx, bh);
  } else if (G.barVis < 0) {
    // P2 winning
    fRect(g, C.p2H, 1, mx, by, bx + bw - mx, bh);
  }
  
  // Indicator marker
  fRect(g, danger ? 0xff0000 : '#fff', 1, mx - 4, by - 8, 8, bh + 16);
}`;

const newDrawTugGfx = `function drawTugGfx() {
  const g = G.tugGfx;
  if (!g) return;
  G.barVis += (G.bar - G.barVis) * 0.12;
  g.clear();
  fRect(g, 0x000, 1, 192, 10, 416, 36);
  fRect(g, 0x2a2a3a, 1, 196, 14, 408, 28);
  fRect(g, 0x0a0a14, 1, 200, 18, 400, 20);
  fRect(g, C.p1H, 0.3, 200, 18, 200, 20);
  fRect(g, C.p2H, 0.3, 400, 18, 200, 20);
  fRect(g, '#fff', 0.5, 399, 14, 2, 28);
  const mx = Mround(200 + ((G.barVis + BAR_MAX) / (2 * BAR_MAX)) * 400);
  if (G.barVis > 0) fRect(g, C.p1H, 1, 200, 18, mx - 200, 20);
  else if (G.barVis < 0) fRect(g, C.p2H, 1, mx, 18, 600 - mx, 20);
  fRect(g, Mabs(G.barVis) > 80 ? 0xff0000 : '#fff', 1, mx - 4, 10, 8, 36);
}`;

if (code.includes(oldDrawTugGfx)) {
  code = code.replace(oldDrawTugGfx, newDrawTugGfx);
  fs.writeFileSync('game.js', code);
  console.log("Replaced drawTugGfx");
} else {
  console.log("Could not find old drawTugGfx");
}
