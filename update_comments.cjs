const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');

const newComment = `/* 
  Player Object Properties (abbreviated for minification):
  - dK: dirKeys (direction keys)
  - aBnc: arrowBounce (arrow bounce animation)
  - pIdx: poseIdx (current sprite pose index)
  - pDx: pulseDx (x-axis pulse scale)
  - pDy: pulseDy (y-axis pulse scale)
  - pT: pulseT (pulse timer)
  - cTxt: comboTxt (combo text graphic)
  - slOut: isSlidingOut (animation state)
  - slTgt: slideTarget (animation target x)
  - nSpr: nextSprites (sprites to load next)
  - nNam: nextName (name to load next)
  - spr: sprites
  - ctr: center
  - bx: box
  - cmb: combo
  - scr: score
  - arrs: arrows
  - nts: notes
  - kys: keys
  - clr: color
  - prf: perfect
  - gd: good
  - mss: miss
  - sq: seq
  - gx: gfx
*/`;

code = code.replace(/\/\*[\s\S]*?Player Object Properties[\s\S]*?\*\//, newComment);
fs.writeFileSync('game.js', code);
