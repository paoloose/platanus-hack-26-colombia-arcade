const P_PAL = [
  0x000000, 0x24222a, 0x4e4b5b, 0x7b768e, 0xaba4c1, 0xd3cde7, 0xfefdfe, 0xffefa8,
  0xe2b35a, 0x9f5611, 0x6e2100, 0x390800, 0x5e2e00, 0x915f01, 0xe6c429, 0xeceab7,
  0xd2fe7d, 0xc1e12c, 0x989800, 0x5b4d00, 0x362400, 0x004d03, 0x0c6d00, 0x2b9200,
  0x7ec43f, 0xb2da73, 0xc8feae, 0x83fe6b, 0xff6600, 0x00cb22, 0x006d45, 0x004d3d,
  0x206100, 0x019000, 0x0bba3d, 0x2eda91, 0x4fffca, 0xd0fff6, 0xa9fbee, 0x01ffff,
  0x08b8ea, 0x006092, 0x004373, 0x333d8d, 0x6dd0ff, 0xb6f3ff, 0xa4dbff, 0x687aff,
  0x0147ff, 0x0017c5, 0x140c81, 0x4200a5, 0x8d00f9, 0xc84ff5, 0xea9bf3, 0xf8dcf7,
  0xf49fb3, 0xf6629d, 0xff0092, 0xcc0095, 0xa30092, 0x920030, 0xc1003f, 0xff0000,
  0xf5765d, 0xd11717, 0xa41c1c, 0xab8169, 0x7c6822, 0xffc7ba, 0x254c93, 0xdeac92,
  0x18171a, 0xf7bb1b, 0xBF7F1F
];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*()_+-=[]{};:,/<?`"';

function findChar(c) {
  const i = P_PAL.indexOf(c);
  if (i === -1) return '?';
  return CHARS[i];
}

console.log("Red (0xff0000): " + findChar(0xff0000));
console.log("Green (0x2dc243): " + findChar(0x2dc243)); // Wait, is 0x2dc243 in P_PAL?
console.log("Old green (0x00ff00)? " + findChar(0x00ff00)); // Might not be there
console.log("Blue (0x0000ff)? " + findChar(0x0000ff));

// find closest green and blue and red
function closest(target) {
  let best = -1, minDist = 99999999;
  const tr = (target >> 16) & 255, tg = (target >> 8) & 255, tb = target & 255;
  for (let i = 0; i < P_PAL.length; i++) {
    const p = P_PAL[i];
    const pr = (p >> 16) & 255, pg = (p >> 8) & 255, pb = p & 255;
    const dist = (tr-pr)*(tr-pr) + (tg-pg)*(tg-pg) + (tb-pb)*(tb-pb);
    if (dist < minDist) { minDist = dist; best = i; }
  }
  return CHARS[best] + " (" + best + ")";
}
console.log("Closest to 0x2dc243 (green): " + closest(0x2dc243));
console.log("Closest to 0x0000ff (blue): " + closest(0x0000ff));
console.log("Closest to dark grey: " + closest(0x333333));
console.log("Closest to black: " + closest(0x000000));
