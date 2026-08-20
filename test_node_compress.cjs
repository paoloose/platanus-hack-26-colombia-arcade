const fs = require('fs');
const zlib = require('zlib');

const songs = ['barranquilla', 'fruko_y_sus_tesos', 'loba', 'nuestra_cancion'];

// We need the raw M5 strings to test this.
// Let's extract them from Python's test script.
const m5 = JSON.parse(fs.readFileSync('raw_m5.json', 'utf8'));
let total = 0;
for (const key in m5) {
  const payload = m5[key];
  const comp = zlib.deflateRawSync(payload, { level: 9, memLevel: 9 });
  const b64 = comp.toString('base64');
  console.log(`${key}: ${b64.length}`);
  total += b64.length;
}
console.log(`Node deflateRawSync total: ${total}`);
