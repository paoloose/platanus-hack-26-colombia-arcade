const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');

code = code.replace(/P\.size\s*\/\s*2/g, '20');
code = code.replace(/P\.size\s*\/\s*3/g, '13');
code = code.replace(/P\.size\s*\*\s*([0-9.]+)/g, (match, num) => {
  return String(Math.round(40 * parseFloat(num)));
});
code = code.replace(/P\.size/g, '40');

fs.writeFileSync('game.js', code);
console.log('Replaced P.size occurrences');
