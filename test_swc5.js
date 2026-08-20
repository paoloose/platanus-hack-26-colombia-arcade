import { minify } from '@swc/core';
const code1 = `
(() => {
globalThis.draw = (g) => {
  g.fillStyle(1,1); g.fillRect(0,0,10,10);
  g.fillStyle(2,1); g.fillRect(1,1,10,10);
  g.fillStyle(3,1); g.fillRect(2,2,10,10);
  g.fillStyle(4,1); g.fillRect(3,3,10,10);
  g.fillStyle(5,1); g.fillRect(4,4,10,10);
}
})();
`;
const code2 = `
(() => {
const f = (g, c, a, x, y, w, h) => { g.fillStyle(c, a); g.fillRect(x, y, w, h); };
globalThis.draw = (g) => {
  f(g,1,1,0,0,10,10);
  f(g,2,1,1,1,10,10);
  f(g,3,1,2,2,10,10);
  f(g,4,1,3,3,10,10);
  f(g,5,1,4,4,10,10);
}
})();
`;
Promise.all([
  minify(code1, { compress: true, mangle: true }),
  minify(code2, { compress: true, mangle: true })
]).then(res => console.log(res[0].code.length, res[1].code.length));
