const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');

// Replace g.fillStyle(c, a); g.fillRect(x, y, w, h);
code = code.replace(/g\.fillStyle\(([^,]+?),\s*([^)]+?)\);\s*g\.fillRect\(([^,]+?),\s*([^,]+?),\s*([^,]+?),\s*([^)]+?)\);?/g, 'fRect(g, $1, $2, $3, $4, $5, $6);');

// THEN Insert fRect
code = code.replace(
  'const clamp = (v, a, b) => Math.max(a, Math.min(b, v));',
  'const clamp = (v, a, b) => Math.max(a, Math.min(b, v));\nconst fRect = (g, c, a, x, y, w, h) => { g.fillStyle(c, a); g.fillRect(x, y, w, h); };'
);

// Hex replacements
code = code.replace(/'#000000'/g, "'#000'");
code = code.replace(/0x000000/g, "0x000");
code = code.replace(/'#ffffff'/g, "'#fff'");

fs.writeFileSync('game.js', code);
