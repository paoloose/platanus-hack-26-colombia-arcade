import { minify } from '@swc/core';
const code = `
(() => {
const STATE = { A: -1, B: 0, C: 1 };
let v = STATE.A;
v = STATE.B;
function getFill(c, a) {
  g.fillStyle(c, a);
}
const PAD = 160;
const H = 600;
console.log(PAD + H);
const color = '#000000';
console.log(color);
let x = Math.floor(10.5);
let y = 100 / 2;
})();
`;
minify(code, { compress: true, mangle: true }).then(res => console.log(res.code));
