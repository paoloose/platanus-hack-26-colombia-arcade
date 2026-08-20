import { minify } from '@swc/core';
const code = `
(() => {
const M = Math, Mmax = M.max, Mmin = M.min, Msin = M.sin, Mcos = M.cos, Mabs = M.abs, Mrnd = M.random, Mpow = M.pow, Mceil = M.ceil, Mround = M.round, MPI = M.PI;
globalThis.calc = (x, y) => {
  return Mmax(x, Mmin(y, Msin(MPI) + Mcos(x) + Mabs(y) + Mrnd() + Mpow(x, y) + Mceil(x) + Mround(y)));
};
})();
`;
minify(code, { compress: true, mangle: true }).then(res => console.log(res.code));
