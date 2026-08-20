const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');

// Insert Math aliases at the top of IIFE
const aliases = 'const M = Math, Mmax = M.max, Mmin = M.min, Msin = M.sin, Mcos = M.cos, Mabs = M.abs, Mrnd = M.random, Mpow = M.pow, Mceil = M.ceil, Mround = M.round, MPI = M.PI;';
code = code.replace('const SKIP_TO_GAMEPLAY', aliases + '\nconst SKIP_TO_GAMEPLAY');

// Replace usages
code = code.replace(/Math\.max/g, 'Mmax');
code = code.replace(/Math\.min/g, 'Mmin');
code = code.replace(/Math\.sin/g, 'Msin');
code = code.replace(/Math\.cos/g, 'Mcos');
code = code.replace(/Math\.abs/g, 'Mabs');
code = code.replace(/Math\.random/g, 'Mrnd');
code = code.replace(/Math\.pow/g, 'Mpow');
code = code.replace(/Math\.ceil/g, 'Mceil');
code = code.replace(/Math\.round/g, 'Mround');
code = code.replace(/Math\.PI/g, 'MPI');

fs.writeFileSync('game.js', code);
