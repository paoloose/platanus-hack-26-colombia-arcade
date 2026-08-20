import { minify } from '@swc/core';
const code = `
(() => {
const STATE = { A: -1, B: 0, C: 1 };
globalThis.v = STATE.A;
globalThis.setColor = (c) => { g.fillStyle(c, 1); g.fillRect(0,0,10,10); }
globalThis.calc = (x) => Math.floor(x) + Math.floor(x/2) + 100/2;
globalThis.c = '#000000';
})();
`;
minify(code, { compress: true, mangle: true }).then(res => console.log(res.code));
