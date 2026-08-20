const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');

// Replace Math.floor(x) with (x | 0) where appropriate
code = code.replace(/Math\.floor\(\(ps\.length - 1\) \* i \/ 4\)/g, "(((ps.length - 1) * i / 4) | 0)");
code = code.replace(/Math\.floor\(k\.t \/ SEC_LEN\)/g, "((k.t / SEC_LEN) | 0)");
code = code.replace(/Math\.floor\(i \/ 2\)/g, "((i / 2) | 0)");
code = code.replace(/Math\.floor\(\(songT \+ TRAVEL_TIME\) \/ SEC_LEN\)/g, "(((songT + TRAVEL_TIME) / SEC_LEN) | 0)");
code = code.replace(/Math\.floor\(songT \/ SEC_LEN\)/g, "((songT / SEC_LEN) | 0)");

fs.writeFileSync('game.js', code);
