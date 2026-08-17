// Platanus Hack 26 - Lucha de Código
// Scene-based architecture. Each game phase is a Phaser Scene.

const W = 800, H = 600, K = 'platanus-lucha-26';
const rand = () => Math.random();
const abs = (n) => Math.abs(n);
const sin = (n) => Math.sin(n);
const cos = (n) => Math.cos(n);
const t = (s, c, b) => ({ fontFamily: 'monospace', fontSize: s + 'px', color: c, fontStyle: b ? 'bold' : 'normal' });
const C = {
  bg: 0x1a0a2e, crowd: 0x2d1b4e, apron: 0x4a0000, mat: 0x5664c7,
  rope1: 0x9a4360, rope2: 0xccd0fc, rope3: 0x4A8764,
  p1: 0xff0000, p2: 0x0000ff, txt: 0xffffff, shadow: 0x000000,
  bar: 0x2dc243, timer: 0xf7bb1b,
};

// ====================================================
// CSEF SPRITE ENGINE
// ====================================================
const P_PAL = [
  0x000000, 0, 0, 0x7b768e, 0xaba4c1, 0xd3cde7, 0xfefdfe, 0,
  0, 0x9f5611, 0x6e2100, 0, 0, 0x915f01, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0x2b9200,
  0x7ec43f, 0, 0, 0, 0xff6600, 0, 0, 0,
  0, 0x019000, 0, 0, 0, 0, 0, 0,
  0x08b8ea, 0x006092, 0x004373, 0x333d8d, 0, 0, 0, 0,
  0, 0, 0x140c81, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0xf5765d, 0xd11717, 0xa41c1c, 0xab8169, 0x7c6822, 0xffc7ba, 0x254c93, 0xdeac92,
  0, 0xf7bb1b, 0xBF921F
];

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*()_+-=[]{};:,/<?`"';
const CLR = {};
for (let i = 0; i < CHARS.length; i++) {
  if (i < P_PAL.length) CLR[CHARS[i]] = P_PAL[i];
}
CLR['.'] = null; CLR[' '] = null;

function parseCSEF(s, w) {
  const r = [], p = [];
  for (let i = 0; i < s.length;) {
    if (!p.length) {
      if (s[i] == '~') { r.push(Array(w).fill('.')); i++; continue; }
      if (s[i] == '^') { if (r.length) r.push([...r.at(-1)]); i++; continue; }
    }
    if (s[i] == '>' && p.length >= w / 2 && w % 2 == 0) {
      const h = p.slice(0, w / 2);
      r.push([...h, ...h.toReversed()]);
      p.length = 0; i++; continue;
    }
    const n = +s[i], c = s[i + 1];
    if (!n || n > 9) { i++; continue; }
    p.push(...Array(n).fill(c));
    while (p.length >= w) r.push(p.splice(0, w));
    i += 2;
  }
  if (p.length) r.push(p);
  return r;
}

function sp(sData, w = 24) {
  if (!sData) return [];
  if (Array.isArray(sData)) return sData;
  try {
    const res = parseCSEF(sData, w);
    if (!res || !res.length || res[0].length !== w) {
      throw new Error('Invalid dimensions or empty sprite');
    }
    return res;
  } catch (e) {
    throw new Error('CRASH: Invalid encoded sprite data: ' + sData + ' | Error: ' + e.message);
  }
}

function dsp(gfx, sData, x, y, opt = {}) {
  if (!sData || !sData.length) return;
  const h = sData.length;
  const w = sData[0]?.length || 0;
  if (!w) return;
  const cx = w >> 1;
  const cy = h >> 1;

  if (opt.shadow) {
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < sData[r].length; c++) {
        const col = CLR[sData[r][c]];
        if (col != null) {
          gfx.fillStyle(P_PAL[0], 0.3);
          gfx.fillRect(x - cx + c + 1 | 0, y - cy + r + 2 | 0, 1, 1);
        }
      }
    }
  }

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < sData[r].length; c++) {
      const col = CLR[sData[r][c]];
      if (col != null) {
        gfx.fillStyle(opt.white ? 0xBDBDBD : col, 1);
        gfx.fillRect(x - cx + c | 0, y - cy + r | 0, 1, 1);
      }
    }
  }
}

const CH = [
  ['Blue Demon', {
  Walk: '~9.7r8.9.2r1F5r7.8.3r4F2r7.8.3r2F2A2F7.8.4r1F2A2F7.8.5r4F7.9.3r2F3=7.9.4r3F8.9.1.5r9.7.7r1=1r8.6.2r2=3r2=1r8.5.1r1y3=1K1r4=8.5.1r1y3=2K4=1K7.5.1r1y4=2K3=1K1=6.5.1r1y6=1K2=1K1=6.5.1r2y5=1K2=8.5.1r2y2r3=3r8.5.1r2y9r7.5.1r2y2r2F1.2r2F7.^8.3r1F1.3r1F7.8.4r1.5r6.8.5r9.2.',
  Jump: '~~~~~8.7r9.8.2r1F5r8.7.3r4F2r8.7.3r2F2A2F8.7.4r1F2A2F8.7.5r4F8.8.3r2F3=8.7.5r3F9.4.9r1r9.1.2.3r3=4r1=1r9.1.2.2r4=3r3=9.1.1.2r4=1K1r5=9.1.1.2r3=2K6=6.2r2.1.1r1y3=1K7=4.4r2.1.1r1y2=2y2r5=2.3F3r2.1.1r5y9r2F4r2.1.1r3y2.9r6r2.1.1r1y4.9r2r6.8.7r9.',
  Punch: '~~9.1.7r7.9.1.2r1F5r6.9.3r4F2r6.9.3r2F2A2F6.9.4r1F2A2F6.9.5r4F6.9.1.3r2F3=6.9.1.4r3F1.4=2.9.1.6r1.6=1.8.6r1=1r1K6=1.7.2r1=2K1r3=1K1=3.2=1.6.1r1y3=2K3=1K7.6.1r1y4=2K2=1K7.6.1r1y6=1K1=8.6.1r2y5=1K1=8.6.1r2y2r3=3r7.6.1r2y7r2F6.6.1r2y2r2F1.2r2F6.6.1r2y2r2F1.3r1F6.8.1y3r1F1.4r6.9.4r1.5r5.9.5r9.1.'
}],
  ['La Parka', {
  Walk: '~9.3A2[2A8.9.2A1[4F1A7.8.3A1[3F2[7.8.3A1[4F1[7.8.3A1[2F2A1F7.8.3A1[1A3F1A7.8.2A2[3F2A7.8.3[2A3F8.8.2[5A9.9.4A2F1A8.8.1A1F2A>7.1A1F2A5F8.6.2A1F5A1F2A7.6.2A1F2A5F2A6.6.1A1F6A1F3A6.6.1A1F4A4F8.6.1A1F1.5A1F1A8.8.9A7.8.2A1F1A1.2A1F1A7.^8.2A1F1A1.4A7.8.2A1F1A1.5A6.8.5A9.2.',
  Jump: '~7.3A2[2A9.1.7.2A1[4F1A9.6.3A1[3F2[9.6.3A1[4F1[9.6.3A1[2F2A1F9.3.2A1.3A1[1A3F1A9.3.1A1F3A2[3F2A9.3.2A1F2A1[2A3F9.1.4.1A2F7A9.1.5.2A2F3A1F2A9.7.1A1F3A1F3A8.8.2A5F1A8.8.4A1F3A8.9.2A4F1A8.9.4A1F2A8.9.1.2A4F8.9.1.3A1F3A7.9.2.7A6.9.2.2A1F3A1F6.9.3.2A1F2A1F1A5.9.3.2A1F4A5.9.3.8A4.9.4.3A8.',
  Punch: '~~9.1.3A2[2A7.9.1.2A1[4F1A6.9.3A1[3F2[6.9.3A1[4F1[6.9.3A1[2F2A1F6.9.3A1[1A3F1A6.9.2A2[3F2A6.9.3[2A3F4A3.9.2[7A3F1A2.8.1A1F4A1F1A2F3A1F1A1.7.1A1F2A5F2A2.3A1.7.1A1F5A1F1A8.7.1A2F1A5F8.7.3A1F3A1F1A8.8.4A4F8.9.5A1F1A8.9.9A6.9.2A1F1A1.2A1F1A6.^9.2A1F1A1.4A6.9.2A1F1A1.5A5.9.5A9.1.'
}],
  ['KeMonito', {
  Walk: '~~~~~~~9.1.5o9.9.1.6o8.9.3o4<8.9.3o1<2A1<8.9.3o3<1A8.9.4o1<2?8.9.4o3<1.2]5.9.3o2]2o3p5.9.1o2p1o1p2<2p6.9.4o1p2<8.9.4p3<8.9.5o2<8.^9.1.1p5o8.9.2p2o1.1p1o8.9.1p2o2.1p1o8.9.3]2.2]8.',
  Jump: '~~~~~~~~~~~~~~9.5.5o5.9.4.7o4.9.7o4<4.7.1o1p7o1<2A1<4.6.1o1p8o3<1A4.3.1]3o1p5o2p2o1<2?4.3.1]3p2o3<3o2p3<4.3.1]5o4<3o3p5.3.1]5o3<2.1p4o1]4.3.1]2o9.2p1o2]4.',
  Punch: '~~~~~9.2.5o8.9.2.6o7.9.1.3o4<7.9.1.3o1<2A1<7.9.1.3o3<1A1.2p1]3.9.1.4o1<2?3p1]3.9.1.4o3<2p5.9.3o2]2o2p6.9.1o2p1o1p2<1p7.9.4o1p2<8.9.4p3<8.9.5o2<8.^9.1.1p5o8.9.2p2o1.1p1o8.9.1p2o2.1p1o8.9.3]2.2]8.~~'
}],
  ['Psycho Clown', {
  Walk: '9.3.1c9.2.9.2.1c>9.2.3c9.1.9.1.1F3c1F9.9.2F1:1F1:2F8.8.3F3:2F8.8.2F2:1A2:1F8.8.2F2:2A1:2[7.8.2F4:1F1A8.8.3F1:1F1:1A1[8.8.3F1:1F1A2[8.8.1A5F1K2[7.8.5A2=1A1[7.7.3=1A2=1A1=1A8.7.3=1:2=3A1=7.8.2=1:5A1=1:6.9.7A2:6.9.7:2=6.9.8:7.8.4:1.4:7.8.4:2.2h8.9.2h3.2h8.9.2h3.4[6.9.4[9.2.',
  Jump: '~9.3.1c9.2.9.2.1c>9.2.3c9.1.9.1.1F3c1F9.9.2F1:1F1:2F8.9.2F3:2F8.8.2F2:1A2:1F8.8.2F2:2A1:2[7.8.2F4:1F1A8.8.3F1:1F1:1A1[8.8.3F1:1F1A2[8.9.5F1.2[7.8.2=2A2=2.1[7.5.5=2A2=9.1.4.5=4A1=9.1.3.4=1K6A9.1.3.3:2K5A7.2[2.3.3=1K7A6.2[2.3.2=2.2:5A2.1:3h2[2.7.9:1:3h2[2.7.9:1:1h6.7.5:>8.7:9.',
  Punch: '9.5.1c9.9.4.2c9.9.4.3c8.9.3.1F3c1F7.9.2.2F1:1F1:2F6.9.1.3F3:2F6.9.1.2F2:1A2:1F6.9.1.2F2:2A1:2[5.9.1.2F4:1F1A6.9.1.3F1:1F1:1A1[3=1:2.9.1.3F1:1F1A2[2=2:1=1.9.1.1A5F3[1=1:2=1.9.1=5A2=1A1[2.2=1.8.3=5A1=7.8.4=5A7.9.2=2:1=3A7.9.1.2:2=3A7.9.1.1:3=3:7.9.1.8:6.9.4:1.4:6.^9.1.2h3.2h7.9.1.2h3.4[5.9.1.2[>',
}],
  ['Platanus', {
  Walk: '9.2.1A>9.1.2?2<9.1.9.1.1?4<9.9.2?4<9.9.1?2<3J9.8.2?1<4;9.8.1?2<1;1A1;1A9.8.1?2<4;9.^8.1?2<3?9.1.8.1?5<1A9.7.1A1?5<1A9.6.2A1?5<2A8.5.3A1?5<2A8.5.2A1.1?5<2A1;7.5.2A1.1?5<1.1A1;7.5.2A1.2?4<9.1.5.2A1.1A1?4<9.1.5.2;1.1A1?4<9.1.8.2A1?4<9.8.2A2?3<9.8.2A1.2?3<8.8.2A2.4?1<7.7.3A2.2A9.1.',
  Jump: '~~~~~~9.4.2;9.1A7.2;2.3A9.1A7.2A1.3A9.1.1A1.1?5.2A1.2A9.2.2A1<1?4.2A1.2A9.2.2A2<1?3.3A1.2A9.1.1.3<3?2.2A1.2A9.1.1A5<6?2A5?5.1A9<2<2A4<3?3.2.9<1<2A6<3?1.3.9<2<1?4;3<1?1A4.9<1<1?2;1A1;1J3<1A6.8<1?4;1J3<1.9.6.2;1A1;1J2<2.~~~~',
  Punch: '~~9.7.4?1A3.9.5.3?3<1A3.9.4.2?4<5.9.3.2?4<6.9.2.1?3<3J6.9.2.1?2<1;1A1;1A6.9.1.1?2<4;7.9.1?3<3?8.9.1?6<8.9.1A5<9.8.2A5<9.^7.2A1?5<9.6.3A1?5<9.6.2A1.2?4<9.6.2;1.1A1?4<9.6.1;2.1A1?4<9.9.2A1?4<8.9.2A2?3<8.9.2A1.2?3<7.9.2A2.4?1<6.9.3A1.3A8.'
}],
  ['El Santo', {
  Walk: '~9.7G8.9.8G7.8.4G4F1G7.8.4G1F1A2F1G7.8.4G1F2A2F7.8.4G5F7.9.3G2F3=7.9.4G3F8.9.1.5G9.7.1F4=1G2=1G8.6.1F4=2G2=1G1=7.5.1F4=2G4=1K1=6.5.4=2G5=1K2=5.4.4=1K7=1K2=5.4.4=1K6=2K1=6.5.4=1K5G3=6.5.1F1D3=1K4G2=7.5.1F1D3=7G7.5.1F2D2G2D1.2G2D7.^5.1F2D3G1D1.3G1D7.8.4G1.5G6.8.5G9.2.',
  Jump: '~~~~~8.7G9.8.4G>7.4G4F1G8.7.4G1F1A2F1G8.7.4G1F2A1F1G8.7.4G5F8.8.4G1F3=8.7.1E4G3F9.4.3F1E2=1G3=9.1.2.3F4=2G3=9.1.2.2F4=2G4=9.1.1.2F4=1K6=9.1.1.2F3=2K6=6.2G2.1.1F1D3=1K7=4.4G2.1.1F1D2=2D2G5=2.3D3G2.1.1F5D9G2D4G2.1.1F3D2.9G6G2.1.1F1D4.9G2G6.8.7G9.',
  Punch: '~~9.1.7G7.9.1.8G6.9.4G3F2G6.9.4G1F1A2F1G6.9.4G1F2A1F1G6.9.4G5F6.9.1.3G2F3=6.9.1.4G3F1.4=2.9.2F5G1.6=1.8.2F3=1G1=1G1K6=1.7.2F1=2K1G3=1K1=3.2=1.6.1F1D3=2K3=1K7.6.1F1D4=2K2=1K7.6.1F1D6=1K1=8.6.1F2D5=1K1=8.6.1F2D2G3=3G7.6.1F2D7G2D6.6.1F2D2G2D1.2G2D6.6.1F2D2G2D1.3G1D6.8.1D3G1D1.4G6.9.4G1.5G5.9.5G9.1.'
}]
];

const ANGEL_SPRITE = sp('2.3<9.6.2.1<1.2<9.5.2.1<3?9.5.3.1<9.7.3.2<4.2?8.1?1?3.1<3.1?2<1?4.4?1<2?1.2<2.1?2<1?2.5?1<1.1<2?1.1<3.3<2.1?2<2}1.1.2<2?1}2<2.1<2.2?1<2}2.2.2<1?1}5<1.1}1?4<2.2.2<2?1}6<1}3<1?2.3.1<1?3}1<2?2<1}1<2?3.4.3?1}5?1}1<5.5.2?3}3<1}6.7.2}3<1}3<4.7.1}4<3.3<2.7.1<2}2<8.6.2}5<7.5.2}1?5<7.5.1}1?1}5<7.5.1?2}3<2}1<6.4.2?1}5<1}1<6.5.1?1}4<1?1<1}6.6.1}4<1?2}6.7.1?3<1?1<7.7.1?3<1.2<6.7.1?1<3K2<6.7.1K1<4K2<5.7.1{2K3{7.7.3{>^6.1K2{1,>^6.1K1{2,>^5.1K2{2,>^^5.1K1{3,>5.1K2{3,3{1K5.', 20);

const CROWD_SPR = [
  sp('4.1J4.3.3J3.2.1?1J1?1J1?2.1.7J1.2.5,2.2.1,1A1,1A1,2.2.5,2.3.1X1,1X3.1.7X1.9Y', 9),
  sp('~~2.5A2.1{1.5A1.1{1[1.5{1.1[1[1.1{1A1{1A1{1.1[1[1.5{1.1[1[2.1[1{1[2.1[9[^', 9),
  sp('~~2.5A2.1,1.4A1[1.1,1G1.1A3,1A1[1G1G1.2A1,2A1.1G1G1.1A3,1A1.1G2G1A1G1,1G1A2G2G1A3G1A2G9G', 9),
];
const SPR = CH.map(c => {
  const s = {};
  for (const [frame, data] of Object.entries(c[1])) {
    s[frame] = data ? sp(data, 24) : null;
  }
  return s;
});
// ====================================================

const CABINET_KEYS = {
  P1_U: ['w'], P1_D: ['s'], P1_L: ['a'], P1_R: ['d'],
  P1_1: ['u'], P1_2: ['i'], P1_3: ['o'],
  P1_4: ['j'], P1_5: ['k'], P1_6: ['l'],
  P2_U: ['ArrowUp'], P2_D: ['ArrowDown'], P2_L: ['ArrowLeft'], P2_R: ['ArrowRight'],
  P2_1: ['r'], P2_2: ['t'], P2_3: ['y'],
  P2_4: ['f'], P2_5: ['g'], P2_6: ['h'],
  START1: ['Enter'], START2: ['2'],
};

const KEY_TO_ARCADE = {};
for (const [code, keys] of Object.entries(CABINET_KEYS)) {
  for (const key of keys) {
    KEY_TO_ARCADE[key.length == 1 ? key.toLowerCase() : key] = code;
  }
}

const held = Object.create(null);
const pressed = Object.create(null);

window.addEventListener('keydown', (e) => {
  const key = e.key.length == 1 ? e.key.toLowerCase() : e.key;
  const code = KEY_TO_ARCADE[key];
  if (!code) return;
  if (!held[code]) pressed[code] = true;
  held[code] = true;
});

window.addEventListener('keyup', (e) => {
  const key = e.key.length == 1 ? e.key.toLowerCase() : e.key;
  const code = KEY_TO_ARCADE[key];
  if (!code) return;
  held[code] = false;
});

function isHeld(code) { return held[code] == true; }
function isPress(code) {
  if (pressed[code]) { pressed[code] = false; return true; }
  return false;
}

function clearPressed() { for (const k in pressed) pressed[k] = false; }

// Audio
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function snd(type) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const now = ctx.currentTime;
  const p = (t, f1, f2, g, dur) => {
    osc.type = t;
    osc.frequency.setValueAtTime(f1, now);
    if (f2) osc.frequency.exponentialRampToValueAtTime(f2, now + dur);
    gain.gain.setValueAtTime(g, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    osc.start(now); osc.stop(now + dur);
  };
  const m = {
    punch: ['square', 200, 100, 0.3, 0.05], slam: ['sawtooth', 80, 40, 0.4, 0.15],
    rope: ['sine', 400, 600, 0.2, 0.1], jump: ['sine', 300, 150, 0.2, 0.2],
    count: ['square', 800, 0, 0.3, 0.05], bell: ['sine', 500, 0, 0.3, 0.5],
    select: ['square', 1200, 0, 0.2, 0.03]
  };
  if (m[type]) p(...m[type]);
}

// Storage
function getStorage() {
  return window.platanusArcadeStorage || {
    async get(k) { try { let r = localStorage.getItem(k); return { found: r !== null, value: JSON.parse(r) }; } catch { return { found: false, value: null }; } },
    async set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  };
}
async function loadData(key) { return getStorage().get(key); }
async function saveData(key, value) { return getStorage().set(key, value); }

// Constants
const RING = { x: 100, y: 120, w: 600, h: 360, matH: 320, ropeY: 40, ropeH: 8, turnW: 20, turnH: 40 };
const P = {
  size: 40, walkSpd: 3.5, jumpGrav: 0.8, jumpForce: 12, jumpMax: 20,
  chargeTime: 2000, punchDmg: 4, slamDmg: 8,
  punchKb: 20, tackleKb: 40, comboTime: 2000, comboCount: 3, downTime: 2500, mHealth: 100,
};

const ST = {
  IDLE: 1, WALK: 2, RUN: 3, JUMP: 4,
  PUNCH: 5, HIT: 6, DOWN: 7, KO: 8, FLY: 9,
  SUPLEX_A: 10, SUPLEX_R: 11, WIN: 12, ONROPE: 13,
  BULL_C: 14, BULL_B: 15, BULL_R: 16
};

const AI = [
  // ch = chance
  { punchCh: 0.08, jumpCh: 0.05, runCh: 0.3 },
  { punchCh: 0.04, jumpCh: 0.07, runCh: 0.1 },
  { punchCh: 0.03, jumpCh: 0.12, runCh: 0.2 },
];

// Helpers
const Rnd = (a, b) => Phaser.Math.Between(a, b);
const RndF = (a, b) => Phaser.Math.FloatBetween(a, b);
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function particles(s, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const p = s.add.rectangle(x, y, 4, 4, color, 1);
    const ang = RndF(0, Math.PI * 2);
    const d = Rnd(10, 30);
    s.tweens.add({ targets: p, x: x + cos(ang) * d, y: y + sin(ang) * d, alpha: 0, duration: 200, onComplete: () => p.destroy() });
  }
}
function shake(s, intensity, duration) { s.cameras.main.shake(duration * 1000, intensity); }
function damage(s, p, amt, kb) {
  if (p.invuln > 0) return;
  p.hp -= amt; if (p.hp < 0) p.hp = 0;
  p.shakeTimer = 0.2;
  p.vx += kb;
  p.combo = 0; // Victim loses their combo progress
  p.charge = 0; p.charging = false; // Reset jump charge
  if (p.jh > 0) {
    p.jh = 0;
    p.y = p.sy; // Snap to ground if hit out of the air
  }
  particles(s, p.x, p.y, 0xffffff, 4);
  if (amt >= 15) shake(s, amt / 2000, amt / 100);
}

// ==============================
// SHARED BACKGROUND
// ==============================

function drawCityBackground(scene, includeAngel = true) {
  scene.add.rectangle(W / 2, H / 2, W, H, 0x0a0520, 1);

  // Stars
  const sg = scene.add.graphics();
  for (let i = 0; i < 60; i++) {
    const sx = rand() * W, sy = rand() * H * 0.5;
    const br = 0.3 + rand() * 0.7;
    sg.fillStyle(0xffffff, br);
    sg.fillCircle(sx, sy, rand() < 0.2 ? 2 : 1);
  }

  // Moon
  sg.fillStyle(0xffe8a0, 0.9);
  sg.fillCircle(650, 80, 30);
  sg.fillStyle(0x0a0520, 1);
  sg.fillCircle(660, 72, 28);

  // Mexico City Skyline
  const gfx = scene.add.graphics();
  const blds = [
    { x: 0, w: 70, h: 160, c: 0x1a1040 },
    { x: 50, w: 90, h: 250, c: 0x150b30 },
    { x: 120, w: 60, h: 180, c: 0x1f1445 },
    { x: 160, w: 80, h: 320, c: 0x100825 },
    { x: 220, w: 100, h: 220, c: 0x221545 },
    { x: 300, w: 120, h: 360, c: 0x0f0820 },
    { x: 400, w: 90, h: 280, c: 0x150b30 },
    { x: 460, w: 110, h: 400, c: 0x0a0515 },
    { x: 550, w: 80, h: 240, c: 0x1f1445 },
    { x: 610, w: 100, h: 340, c: 0x100825 },
    { x: 690, w: 60, h: 280, c: 0x201545 },
    { x: 745, w: 65, h: 200, c: 0x1a1838 },
  ];
  for (const b of blds) {
    gfx.fillStyle(b.c, 1);
    gfx.fillRect(b.x, H - b.h, b.w, b.h);
    for (let wy = H - b.h + 12; wy < H - 15; wy += 18) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
        const lit = rand() < 0.45;
        gfx.fillStyle(lit ? 0xffdd44 : 0x0a0818, lit ? 0.8 : 0.5);
        gfx.fillRect(wx, wy, 6, 8);
      }
    }
  }

  // Trees / parks at ground level
  const treeSpots = [50, 195, 360, 510, 640];
  for (const tx of treeSpots) {
    gfx.fillStyle(0x0a3018, 1);
    gfx.fillCircle(tx, H - 15, 18);
    gfx.fillCircle(tx + 14, H - 20, 15);
    gfx.fillCircle(tx - 10, H - 10, 13);
    gfx.fillStyle(0x0d4020, 1);
    gfx.fillCircle(tx + 4, H - 22, 12);
  }

  // Ground strip
  gfx.fillStyle(0x111111, 1);
  gfx.fillRect(0, H - 4, W, 4);

  // Angel of Independence
  if (includeAngel) {
    const angelGfx = scene.add.graphics();
    angelGfx.scale = 5;
    angelGfx.setDepth(5);
    dsp(angelGfx, ANGEL_SPRITE, (W / 2) / 5, (H - 300) / 5);
  }

  // Overlay to dim background slightly behind text
  scene.add.rectangle(W / 2, H / 2, W, H, 0, 0.4).setDepth(6);

  // Coliseum searchlight beams (Mexican flag colors)
  scene.beamGfx = scene.add.graphics();
  scene.beamGfx.setBlendMode(Phaser.BlendModes.ADD);
  scene.beamGfx.setDepth(7);
  scene.beams = [
    [150, 1.2, 0.4, 0x00aa00],
    [W - 150, 1.9, 0.35, 0xcc0000],
    [280, 1.5, -0.3, 0xcc0000],
    [W - 280, 1.0, 0.5, 0x00aa00],
    [150, 0.5, 0.4, 0x00aa00],
    [W - 150, 1.3, 0.35, 0xcc0000],
  ];
}



// ==============================
// SHARED BACKGROUND
// ==============================

function drawCityBackground(scene, includeAngel = true) {
  scene.add.rectangle(W / 2, H / 2, W, H, 0x0a0520, 1);

  // Stars
  const sg = scene.add.graphics();
  for (let i = 0; i < 60; i++) {
    const sx = rand() * W, sy = rand() * H * 0.5;
    const br = 0.3 + rand() * 0.7;
    sg.fillStyle(0xffffff, br);
    sg.fillCircle(sx, sy, rand() < 0.2 ? 2 : 1);
  }

  // Moon
  sg.fillStyle(0xffe8a0, 0.9);
  sg.fillCircle(650, 80, 30);
  sg.fillStyle(0x0a0520, 1);
  sg.fillCircle(660, 72, 28);

  // Mexico City Skyline - vibrant night buildings
  const gfx = scene.add.graphics();
  const blds = [
    { x: 0, w: 70, h: 160, c: 0x1a1040 },
    { x: 65, w: 55, h: 240, c: 0x2a1555 },
    { x: 115, w: 80, h: 180, c: 0x1e2848 },
    { x: 190, w: 50, h: 130, c: 0x281838 },
    { x: 235, w: 75, h: 300, c: 0x1a2050 },
    { x: 305, w: 60, h: 140, c: 0x221540 },
    { x: 440, w: 65, h: 160, c: 0x2a1848 },
    { x: 500, w: 80, h: 260, c: 0x182050 },
    { x: 575, w: 55, h: 190, c: 0x241535 },
    { x: 625, w: 70, h: 130, c: 0x1e2848 },
    { x: 690, w: 60, h: 280, c: 0x201545 },
    { x: 745, w: 65, h: 200, c: 0x1a1838 },
  ];
  for (const b of blds) {
    gfx.fillStyle(b.c, 1);
    gfx.fillRect(b.x, H - b.h, b.w, b.h);
    // Windows
    for (let wy = H - b.h + 12; wy < H - 15; wy += 18) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
        const lit = rand() < 0.45;
        gfx.fillStyle(lit ? 0xffdd44 : 0x0a0818, lit ? 0.8 : 0.5);
        gfx.fillRect(wx, wy, 6, 8);
      }
    }
  }

  // Trees / parks at ground level
  const treeSpots = [50, 195, 360, 510, 640];
  for (const tx of treeSpots) {
    gfx.fillStyle(0x0a3018, 1);
    gfx.fillCircle(tx, H - 15, 18);
    gfx.fillCircle(tx + 14, H - 20, 15);
    gfx.fillCircle(tx - 10, H - 10, 13);
    gfx.fillStyle(0x0d4020, 1);
    gfx.fillCircle(tx + 4, H - 22, 12);
  }

  // Ground strip
  gfx.fillStyle(0x111111, 1);
  gfx.fillRect(0, H - 4, W, 4);

  // Angel of Independence
  if (includeAngel) {
    const angelGfx = scene.add.graphics();
    angelGfx.scale = 5;
    angelGfx.setDepth(5);
    dsp(angelGfx, ANGEL_SPRITE, (W / 2) / 5, (H - 300) / 5);
  }

  // Overlay to dim background slightly behind text
  scene.add.rectangle(W / 2, H / 2, W, H, 0, 0.4).setDepth(6);

  // Coliseum searchlight beams (Mexican flag colors)
  scene.beamGfx = scene.add.graphics();
  scene.beamGfx.setBlendMode(Phaser.BlendModes.ADD);
  scene.beamGfx.setDepth(7);
  // [x, angle, speed, color]
  scene.beams = [
    [150, 1.2, 0.4, 0x00aa00],
    [W - 150, 1.9, 0.35, 0xcc0000],
    [280, 1.5, -0.3, 0xcc0000],
    [W - 280, 1.0, 0.5, 0x00aa00],
    // 2 more of the same color
    [150, 0.5, 0.4, 0x00aa00],
    [W - 150, 1.3, 0.35, 0xcc0000],
  ];
}

function updateLights(scene, t) {
  if (!scene.beamGfx) return;
  scene.beamGfx.clear();
  for (const b of scene.beams) {
    const a = b[1] + sin(t * b[2]) * 0.6;
    const len = 1000;
    const spread = 0.1;
    const x1 = b[0] + cos(a - spread) * len;
    const y1 = H - sin(a - spread) * len;
    const x2 = b[0] + cos(a + spread) * len;
    const y2 = H - sin(a + spread) * len;
    scene.beamGfx.fillStyle(b[3], 0.15);
    scene.beamGfx.fillTriangle(b[0], H, x1, y1, x2, y2);
  }
}

// ==============================
// SCENES
// ==============================

class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }
  create() {
    drawCityBackground(this, true);

    // Titles
    const title = this.add.text(W / 2, 100, 'LUCHADOR', t(48, '#f7bb1b', 1)).setOrigin(0.5).setDepth(10);
    this.add.text(W / 2, 150, 'Platanus Hack 26 - CDMX', t(18, '#fff')).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: title, scale: 1.05, duration: 1000, yoyo: true, repeat: -1 });


    // Mode Selection
    this.cursor = 0;
    this.items = ['1 JUGADOR', '2 JUGADORES'].map((l, i) => ({
      bg: this.add.rectangle(400, 420+i*60, 300, 50, 0x1a1e05).setStrokeStyle(2, 0x3a3a0a).setDepth(10),
      txt: this.add.text(400, 420+i*60, l, t(20, '#fff')).setOrigin(.5).setDepth(10)
    }));


    this.updateMenu();
  }

  updateMenu() {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].bg.setFillStyle(i === this.cursor ? 0xf7bb1b : 0x1a1e05);
      this.items[i].txt.setColor(i === this.cursor ? '#000' : '#fff');
    }
  }

  update() {
    // Animate searchlight beams
    updateLights(this, this.time.now / 1000);

    const axis = (isPress('P1_D') || isPress('P2_D') ? 1 : 0) - (isPress('P1_U') || isPress('P2_U') ? 1 : 0);
    if (axis !== 0) {
      this.cursor = Phaser.Math.Wrap(this.cursor + axis, 0, 2);
      this.updateMenu();
      snd('select');
    }

    if (isPress('P1_1') || isPress('P2_1') || isPress('START1') || isPress('START2')) {
      snd('select');
      this.registry.set('mode', this.cursor ? '2p' : '1p');
      this.registry.set('round', 1);
      this.registry.set('scores', { p1: 0, p2: 0 });
      this.registry.set('tournament', 0);
      this.scene.start('CharSelectScene');
    }
    clearPressed();
  }
}

class CharSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'CharSelectScene' }); }

  create() {
    drawCityBackground(this, false);

    this.mode = this.registry.get('mode') || '1p';
    this.charCount = CH.length; // Number of characters
    this.tr = false;
    this.aiPicking = false;

    // Player selections
    this.sel = [
      { cursor: 0, ok: false },
      { cursor: this.charCount - 1, ok: false }
    ];
    this.go = () => {
      this.registry.set('p1Char', this.sel[0].cursor);
      this.registry.set('p2Char', this.sel[1].cursor);
      this.scene.start('PlayScene');
    };

    // Graphics layers
    this.gridGfx = this.add.graphics().setDepth(10);
    this.pvwGfx = [this.add.graphics().setDepth(10), this.add.graphics().setDepth(10)];

    // Text objects
    let b = (x,y,s,c,z) => this.add.text(x,y,s,t(z,c,1)).setOrigin(.5).setDepth(10);
    this.p1Label = b(115, 120, 'P1', '#48f', 20);
    this.p2Label = b(W-115, 120, this.mode === '2p' ? 'P2' : 'CPU', '#f44', 20);
    this.name1 = b(115, 410, '', '#fff', 24);
    this.name2 = b(W-115, 410, '', '#fff', 24);
    this.ready1 = b(115, 440, ' LISTO ', '#000', 16).setBackgroundColor('#2dc243').setVisible(0);
    this.ready2 = b(W-115, 440, ' LISTO ', '#000', 16).setBackgroundColor('#2dc243').setVisible(0);

    b(400, 570, 'BTN1 O START: ELEGIR', '#6f7a4a', 12);

    // Generate preview textures for each character
    const tg = this.add.graphics();
    for (let i = 0; i < this.charCount; i++) {
      const spr = SPR[i]?.Walk;
      if (spr) {
        tg.clear();
        dsp(tg, spr, 12, 12);
        tg.generateTexture('charPvw_' + i, 24, 24);
      }
    }
    tg.destroy();
  }

  update(t) {
    if (this.tr) return;

    updateLights(this, t / 1000);

    // P1 input
    this.handlePInput(0, t, 'P1_U', 'P1_D', 'P1_L', 'P1_R', 'P1_1', 'START1');

    // P2 input (only in 2p mode)
    if (this.mode === '2p') {
      this.handlePInput(1, t, 'P2_U', 'P2_D', 'P2_L', 'P2_R', 'P2_1', 'START2');
    }

    // Check if all ok
    const p1Done = this.sel[0].ok;
    const p2Done = this.sel[1].ok;

    // AI roulette logic in 1P mode
    if (this.mode === '1p' && p1Done && !p2Done && !this.aiPicking) {
      this.aiPicking = true;
      let ticks = 0;
      this.time.addEvent({
        delay: 80,
        repeat: 12,
        callback: () => {
          ticks++;
          if (ticks <= 12) {
            this.sel[1].cursor = Rnd(0, this.charCount - 1);
            snd('select');
          } else {
            const others = [];
            for (let i = 0; i < this.charCount; i++) if (i !== this.sel[0].cursor) others.push(i);
            this.sel[1].cursor = others[Rnd(0, others.length - 1)];
            this.sel[1].ok = true;
            snd('bell');
            this.time.delayedCall(1000, this.go);
          }
        }
      });
    }

    // Normal 2P start
    if (this.mode === '2p' && p1Done && p2Done && !this.tr) {
      this.tr = true;
      snd('bell');
      this.time.delayedCall(800, this.go);
    }

    this.renderUI();
    clearPressed();
  }

  handlePInput(pIdx, t, upK, downK, leftK, rightK, btnK, btnK2) {
    const s = this.sel[pIdx];
    if (s.ok) return;

    let moved = false;
    const cols = Math.min(3, this.charCount);
    const rows = Math.ceil(this.charCount / cols);
    const cCol = s.cursor % cols;
    const cRow = Math.floor(s.cursor / cols);

    if (isPress(leftK)) {
      s.cursor = (cCol > 0) ? s.cursor - 1 : s.cursor + (cols - 1);
      if (s.cursor >= this.charCount) s.cursor = this.charCount - 1;
      moved = true;
    } else if (isPress(rightK)) {
      s.cursor = (cCol < cols - 1 && s.cursor + 1 < this.charCount) ? s.cursor + 1 : s.cursor - cCol;
      moved = true;
    } else if (isPress(upK)) {
      s.cursor = (cRow > 0) ? s.cursor - cols : s.cursor + (rows - 1) * cols;
      if (s.cursor >= this.charCount) s.cursor -= cols;
      moved = true;
    } else if (isPress(downK)) {
      s.cursor = (s.cursor + cols < this.charCount) ? s.cursor + cols : s.cursor % cols;
      moved = true;
    }

    if (moved) snd('select');

    // Confirm
    if (isPress(btnK) || (btnK2 && isPress(btnK2))) {
      s.ok = true;
      snd('select');
    }
  }

  renderUI() {
    this.gridGfx.clear();
    this.pvwGfx[0].clear();
    this.pvwGfx[1].clear();

    const slotW = 100, slotH = 120, gap = 16;
    const cols = Math.min(3, this.charCount);
    const rows = Math.ceil(this.charCount / cols);
    const totalW = cols * (slotW + gap) - gap;
    const totalH = rows * (slotH + gap) - gap;
    const startX = (W - totalW) / 2;
    const startY = (H - totalH) / 2 + 20;

    for (let i = 0; i < this.charCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (slotW + gap);
      const y = startY + row * (slotH + gap);

      const p1H = this.sel[0].cursor === i;
      const p2H = this.sel[1].cursor === i && (this.mode === '2p' || this.aiPicking || this.sel[1].ok);

      // Slot background
      this.gridGfx.fillStyle(0x1a1a2e, 1);
      this.gridGfx.fillRect(x, y, slotW, slotH);

      // Border highlight
      if (p1H && p2H) {
        this.gridGfx.lineStyle(3, 0x4488ff, 1);
        this.gridGfx.strokeRect(x, y, slotW, slotH);
        this.gridGfx.lineStyle(3, 0xff4444, 1);
        this.gridGfx.strokeRect(x + 4, y + 4, slotW - 8, slotH - 8);
      } else if (p1H) {
        this.gridGfx.lineStyle(3, 0x4488ff, 1);
        this.gridGfx.strokeRect(x, y, slotW, slotH);
      } else if (p2H) {
        this.gridGfx.lineStyle(3, 0xff4444, 1);
        this.gridGfx.strokeRect(x, y, slotW, slotH);
      } else {
        this.gridGfx.lineStyle(1, 0x333333, 1);
        this.gridGfx.strokeRect(x, y, slotW, slotH);
      }

      // Draw character preview sprite in slot (scaled)
      const spr = SPR[i]?.Walk;
      if (spr) {
        const sc = 6;
        const sh = spr.length, sw = spr[0]?.length || 0;
        const sox = x + (slotW - sw * sc) / 2;
        const soy = y + 5;
        for (let r = 0; r < sh; r++) {
          for (let c = 0; c < (spr[r]?.length || 0); c++) {
            const px = sox + c * sc;
            const py = soy + r * sc;
            if (px >= x && px + sc <= x + slotW && py >= y && py + sc <= y + slotH) {
              const col = CLR[spr[r][c]];
              if (col != null) {
                this.gridGfx.fillStyle(col, 1);
                this.gridGfx.fillRect(px, py, sc, sc);
              }
            }
          }
        }
      }

      // Character name below slot
      // (We reuse text objects sparingly - draw name via graphics text)
    }

    // Update preview names
    const k1 = this.sel[0].cursor;
    const k2 = this.sel[1].cursor;
    this.name1.setText(CH[k1][0]);
    this.name2.setText((this.mode === '2p' || this.sel[1].ok) ? CH[k2][0] : '???');
    this.ready1.setVisible(this.sel[0].ok);
    this.ready2.setVisible(this.sel[1].ok);

    // Draw large previews on sides
    this.drawPreview(0, 115, 270);
    if (this.mode === '2p' || this.aiPicking || this.sel[1].ok) this.drawPreview(1, W - 115, 270);
  }

  drawPreview(pIdx, cx, cy) {
    const g = this.pvwGfx[pIdx];
    const key = this.sel[pIdx].cursor;
    const spr = SPR[key]?.Walk;
    if (!spr) return;

    // Draw scaled sprite (each pixel = 6px)
    const scale = 9;
    const h = spr.length, w = spr[0]?.length || 0;
    const ox = cx - (w * scale) / 2, oy = cy - (h * scale) / 2;
    const isP2 = pIdx === 1;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < (spr[r]?.length || 0); c++) {
        const col = CLR[spr[r][c]];
        if (col != null) {
          g.fillStyle(col, 1);
          g.fillRect(ox + (isP2 ? w - 1 - c : c) * scale, oy + r * scale, scale, scale);
        }
      }
    }
  }
}

class PlayScene extends Phaser.Scene {
  constructor() { super({ key: 'PlayScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#1a1e05');

    // Create ring
    this.createRing();
    const G = this.ring.geometry;

    const p1Char = this.registry.get('p1Char') || 0;
    const p2Char = this.registry.get('p2Char') || 1;

    // Create players in opposite corners
    this.p1 = this.createPlayer(1, p1Char, G.backLX + 30, G.backY + 30, C.p1);
    this.p2 = this.createPlayer(2, p2Char, G.frontRX - 120, G.frontY - 120, C.p2);

    // Game state
    this.mode = this.registry.get('mode') || '1p';
    this.round = this.registry.get('round') || 1;
    this.scores = this.registry.get('scores') || { p1: 0, p2: 0 };

    // Create HUD
    this.createHUD();

    this.timer = 60;
    this.lastTime = this.time.now;
    this.tournament = this.registry.get('tournament') || 0;

    this.resetRound();
    if (this.round === 1) {
      this.rs = true;
      let c = this.tG = this.add.container(0, 0).setDepth(3e3).setScrollFactor(0);
      c.add(this.add.rectangle(400, 300, 800, 600, 0, .8));
      let a = (x, y, s, z, k) => { let txt = this.add.text(x, y, s, t(z, k||'#fff', 1)).setOrigin(.5); c.add(txt); return txt; };
      a(400, 60, 'CONTROLES', 32);
      a(400, 100, 'JOYSTICK: MOVER', 18, '#aaa');
      this.tBtns = []; this.tA = []; this.tA2 = [];
      let modes = this.mode === '2p' ? [0, 1] : [0];
      modes.forEach(p => {
        let cx = this.mode === '2p' ? (p ? 600 : 200) : 400;
        let scale = p ? -5 : 5;
        let ta = this.add.graphics({x: cx, y: 230}).setScale(scale, 5);
        let ta2 = this.add.graphics({x: cx, y: 230}).setScale(scale, 5).setRotation(p ? -.2 : .2);
        c.add(ta); c.add(ta2);
        this.tA.push(ta); this.tA2.push(ta2);

        ['GOLPE','#f00','EMBESTIDA','#48f','SALTAR','#2dc243'].forEach((v, i, arr) => {
          if (i % 2 === 0) {
            let bx = cx + (i / 2) * 120 - 120;
            a(bx, 340, v, 20, arr[i+1]);
            let bgG = this.add.graphics({ x: bx, y: 420 }).setScale(8.5);
            dsp(bgG, sp('2.3[>1.4[>^2D3[>5D>1.4D>', 8), 0, 0, { white: true });
            bgG.setVisible(0);
            c.add(bgG);

            let g = this.add.graphics({ x: bx, y: 420 }).setScale(8);
            dsp(g, sp('2.3[>1.4[>^2D3[>5D>1.4D>', 8), 0, 0);
            c.add(g); this.tBtns.push({fg: g, bg: bgG});
            a(bx, 480, 'BTN ' + (i / 2 + 1), 16, '#aaa');
          }
        });
      });
      this.tStartText = a(400, 540, 'PRESIONA START PARA INICIAR', 20);
    } else {
      this.showFightText();
      snd('bell');
    }

    // Prevent immediate pause from CharSelectScene button mashing
    this.canPause = false;
    this.time.delayedCall(500, () => { this.canPause = true; });
  }

  createRing() {
    this.ring = {};
    this.ring.g = this.add.graphics();       // back layer (behind players)
    this.ring.fg = this.add.graphics();      // front layer (over players)
    this.ring.fg.setDepth(1000);

    // Centralized geometry: all coordinates derived from these 4 corners
    const G = {
      backY: 180,
      frontY: 480,
      backLX: 120,
      backRX: 680,
      frontLX: -55,
      frontRX: 855,
    };
    G.height = G.frontY - G.backY;
    G.backW = G.backRX - G.backLX;
    G.frontW = G.frontRX - G.frontLX;
    G.centerX = (G.backLX + G.backRX + G.frontLX + G.frontRX) / 4;
    G.centerY = (G.backY + G.frontY) / 2;

    // Center ring logo (Banana & Text)
    this.add.text(G.centerX, G.centerY - 60, '🍌', { fontSize: '100px', padding: { x: 20, y: 20 } })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.15)
      .setScale(1.4, 0.5) // Perspective scaling to lay flat on the mat
      .setDepth(1);       // On top of mat (depth 0), below players (depth 180+)

    this.add.text(G.centerX + 10, G.centerY + 5, ' ARENA\nPLATANUS', t(40, '#fff', 1))
      .setOrigin(0.5, 0.5)
      .setAlpha(0.2)
      .setScale(1.4, 0.5)
      .setDepth(1);

    // Rope levels: wide separation so lateral ropes are clearly distinct
    G.ropeLevels = [
      { backOff: 16, frontOff: 18, color: C.rope1 },   // bottom (red)
      { backOff: 38, frontOff: 40, color: C.rope2 },   // middle (white)
      { backOff: 62, frontOff: 64, color: C.rope3 },   // top (green)
    ];
    G.topRopeY = G.backY - 66;  // just above top back rope
    G.apronH = 60;
    G.apronBottom = G.frontY + G.apronH;

    // Store geometry
    this.ring.geometry = G;

    // Crowd textures
    const tg = this.add.graphics();
    for (let i = 0; i < CROWD_SPR.length; i++) {
      tg.clear(); dsp(tg, CROWD_SPR[i], 4, 5); tg.generateTexture('crowd' + i, 9, 10);
    }
    tg.destroy();

    // Crowd (above top rope)
    this.ring.crowd = [];
    const crowdRows = 7;
    const crowdCols = 45;
    const startX = G.frontLX - 100;
    const endX = G.frontRX + 100;
    const spacingX = (endX - startX) / (crowdCols - 1);
    const startY = 15;
    const endY = G.topRopeY - 20;
    const spacingY = (endY - startY) / (crowdRows - 1);

    for (let r = 0; r < crowdRows; r++) {
      for (let c = 0; c < crowdCols; c++) {
        const type = Rnd(0, 2);
        // Add slight random offset to break up the perfect grid
        const ox = Rnd(-10, 10);
        const oy = Rnd(-5, 5);
        const sp = this.add.image(startX + c * spacingX + ox, startY + r * spacingY + oy, 'crowd' + type);
        sp.setScale(3);
        sp.setDepth(sp.y - 500); // Behind the ring
        sp.baseY = sp.y;
        sp.phase = rand() * Math.PI * 2;
        this.ring.crowd.push(sp);
      }
    }

    // Rope spring system: each side has local bend at contact point
    this.ring.ropes = {
      back: { amount: 0, target: 0, contactX: 0, k: 8, mBend: 25, decay: 0.92, pushVel: 0, soundTimer: 0 },
      front: { amount: 0, target: 0, contactX: 0, k: 8, mBend: 25, decay: 0.92, pushVel: 0, soundTimer: 0 },
      left: { amount: 0, target: 0, contactY: 0, k: 8, mBend: 25, decay: 0.92, pushVel: 0, soundTimer: 0 },
      right: { amount: 0, target: 0, contactY: 0, k: 8, mBend: 25, decay: 0.92, pushVel: 0, soundTimer: 0 },
    };



    // Referee removed
  }

  drawRing() {
    const g = this.ring.g;
    const fg = this.ring.fg;
    g.clear();
    fg.clear();

    const G = this.ring.geometry;

    // Crowd animation (phase updated in update loop)
    const isCheering = (this.p1.st === ST.DOWN || this.p1.st === ST.KO ||
                        this.p2.st === ST.DOWN || this.p2.st === ST.KO || this.timer <= 0);
    const height = isCheering ? 8 : 3;

    for (const sp of this.ring.crowd) {
      sp.y = sp.baseY - abs(sin((this.crowdPhase || 0) + sp.phase)) * height;
    }

    // Apron (front face below mat) - on front layer so it covers player feet
    fg.fillStyle(0x2C3047, 1);
    fg.beginPath();
    fg.moveTo(G.frontLX, G.frontY);
    fg.lineTo(G.frontRX, G.frontY);
    fg.lineTo(G.frontRX, G.apronBottom);
    fg.lineTo(G.frontLX, G.apronBottom);
    fg.closePath();
    fg.fillPath();



    // Mat (trapezoid) and border
    g.beginPath();
    g.moveTo(G.backLX, G.backY);
    g.lineTo(G.backRX, G.backY);
    g.lineTo(G.frontRX, G.frontY);
    g.lineTo(G.frontLX, G.frontY);
    g.closePath();
    g.fillStyle(C.mat, 1);
    g.fillPath();
    g.lineStyle(2, 0xffffff, 0.8);
    g.strokePath();

    // Draw ropes - back/left/right on g (behind players), front on fg (over players)
    for (let i = 0; i < G.ropeLevels.length; i++) {
      const level = G.ropeLevels[i];
      const bY = G.backY - level.backOff;
      const fY = G.frontY - level.frontOff;

      // Back rope - on back layer
      g.lineStyle(3, level.color, 1);
      const rBack = this.ring.ropes.back;
      g.beginPath();
      g.moveTo(G.backLX, bY);
      if (rBack.amount > 0.5) {
        const t = Phaser.Math.Clamp((rBack.contactX - G.backLX) / G.backW, 0.1, 0.9);
        const cpX = G.backLX + t * G.backW;
        g.lineTo(cpX - 15, bY - rBack.amount);
        g.lineTo(cpX + 15, bY - rBack.amount);
      }
      g.lineTo(G.backRX, bY);
      g.strokePath();

      // Front rope - on FRONT layer (over players)
      fg.lineStyle(3, level.color, 1);
      const rFront = this.ring.ropes.front;
      fg.beginPath();
      fg.moveTo(G.frontLX, fY);
      if (rFront.amount > 0.5) {
        const t = Phaser.Math.Clamp((rFront.contactX - G.frontLX) / G.frontW, 0.1, 0.9);
        const cpX = G.frontLX + t * G.frontW;
        fg.lineTo(cpX - 25, fY + rFront.amount);
        fg.lineTo(cpX + 25, fY + rFront.amount);
      }
      fg.lineTo(G.frontRX, fY);
      fg.strokePath();

      // Left rope - on back layer
      g.lineStyle(3, level.color, 1);
      const rLeft = this.ring.ropes.left;
      g.beginPath();
      g.moveTo(G.backLX, bY);
      if (rLeft.amount > 0.5) {
        // Shift contactY down by 20px so the peak aligns with the player's visual body, not just their feet
        const t = Phaser.Math.Clamp((rLeft.contactY + 40 - G.backY) / G.height, 0.1, 0.9);
        const rX = G.backLX + (G.frontLX - G.backLX) * t;
        const rY = bY + (fY - bY) * t;
        // Calculate offset for the V-dent width along the rope
        const dt = 15 / G.height;
        const dx = (G.frontLX - G.backLX) * dt;
        const dy = (fY - bY) * dt;
        g.lineTo(rX - dx - rLeft.amount, rY - dy);
        g.lineTo(rX + dx - rLeft.amount, rY + dy);
      }
      g.lineTo(G.frontLX, fY);
      g.strokePath();

      // Right rope - on back layer
      g.lineStyle(3, level.color, 1);
      const rRight = this.ring.ropes.right;
      g.beginPath();
      g.moveTo(G.backRX, bY);
      if (rRight.amount > 0.5) {
        // Shift contactY down by 20px so the peak aligns with the player's visual body
        const t = Phaser.Math.Clamp((rRight.contactY + 40 - G.backY) / G.height, 0.1, 0.9);
        const rX = G.backRX + (G.frontRX - G.backRX) * t;
        const rY = bY + (fY - bY) * t;
        // Calculate offset for the V-dent width along the rope
        const dt = 15 / G.height;
        const dx = (G.frontRX - G.backRX) * dt;
        const dy = (fY - bY) * dt;
        g.lineTo(rX - dx + rRight.amount, rY - dy);
        g.lineTo(rX + dx + rRight.amount, rY + dy);
      }
      g.lineTo(G.frontRX, fY);
      g.strokePath();
    }

  }

  /*
   * MINIFIED PLAYER PROPERTIES GLOSSARY
   * To keep file size <50KB, many player object properties are aliased:
   * .hp = health              .f = facing                .st = state
   * .sx = shadowX (ground X)  .sy = shadowY (ground Y)
   * .svx = shadowVX           .svy = shadowVY
   * .jh = jumpHeight          .ivy = initialVy
   * .bd = bullDist            .bt = bullTimer          .hb = hasHitBull
   * .rs = ropeHitSide         .ct = comboTimer         .dtm = downTimer
   * .fd = isFlyingDrop        .ra = isRopeAttack       .spt = suplexTimer
   * .jnr = jumpNearRope       .wt = walkTimer          .pt = punchTimer
   * .as = aiState             .at = aiTimer            .ajo = aiJumpOffset
   * .crj = canRopeJump
   *
   * Bull states:
   * BULL_C (14) = Charge
   * BULL_B (15) = Bull Rebound
   * BULL_R (16) = Bull Run (after rebound)
   *
   * sp: parseSprite
   * dsp: drawSprite
   * pers: personality
   */

  createPlayer(num, charName, x, y, color) {
    const p = {
      num, charName, x, y, vx: 0, vy: 0, facing: num === 1 ? 1 : -1,
      state: ST.IDLE, health: P.mHealth, color,
      charge: 0, charging: false, combo: 0, comboTimer: 0,
      downTimer: 0, carry: null, carriedBy: null,
      hitTimer: 0, invuln: 0, bullDist: 0, bullTimer: 0,
      shadowX: x, shadowY: y, shadowVX: 0, shadowVY: 0,
      SPR: SPR[charName],
    };

    p.body = this.add.graphics();
    // Keep p.bodyInner reference null since we don't need a separate inner rectangle anymore
    p.bodyInner = null;

    p.shad = this.add.ellipse(x, y, 40, 20, C.shadow, 0.5);
    p.shad.setVisible(0);

    p.chargeBarBg = this.add.rectangle(x, y - 20 - 25, 40, 6, 0);
    p.chargeBarBg.setStrokeStyle(2, 0xffffff, 0.5);
    p.chargeBar = this.add.rectangle(x - 20, y - 20 - 25, 0, 4, 0xf7bb1b);
    p.chargeBar.setOrigin(0, 0.5);
    p.chargeBar.setVisible(0);
    p.chargeBarBg.setVisible(0);

    p.comboTxt = this.add.text(x, y, '', t(14, '#f7bb1b', 1)).setOrigin(0.5);
    p.comboTxt.setVisible(0);

    return p;
  }

  createHUD() {
    let h = this.hud = {};
    h.container = this.add.container(W / 2, H / 2).setScrollFactor(0).setDepth(2e3);

    h.hp1Bg = this.add.rectangle(200 - W / 2, 40 - H / 2, 200, 24, 0x303030).setStrokeStyle(2, 0x000000);
    h.hp1 = this.add.rectangle(100 - W / 2, 40 - H / 2, 200, 20, C.bar).setOrigin(0, 0.5);

    h.p1AvatarBg = this.add.rectangle(50 - W / 2, 40 - H / 2, 72, 64, 0x000000).setStrokeStyle(2, 0x444444);
    h.p1AvatarWalk = this.add.graphics({x: 50 - W / 2, y: 45 - H / 2}).setScale(3);
    dsp(h.p1AvatarWalk, this.p1.SPR.Walk.slice(0, 18), 0, 0);
    h.p1AvatarJump = this.add.graphics({x: 50 - W / 2, y: 45 - H / 2}).setScale(3).setVisible(0);
    dsp(h.p1AvatarJump, this.p1.SPR.Jump.slice(0, 18), 0, 0);
    h.p1Avatar = this.add.container(0, 0, [h.p1AvatarBg, h.p1AvatarWalk, h.p1AvatarJump]);

    h.hp2Bg = this.add.rectangle(W - 200 - W / 2, 40 - H / 2, 200, 24, 0x303030).setStrokeStyle(2, 0x000000);
    h.hp2 = this.add.rectangle(W - 300 - W / 2, 40 - H / 2, 200, 20, C.bar).setOrigin(0, 0.5);

    h.p2AvatarBg = this.add.rectangle(W - 50 - W / 2, 40 - H / 2, 72, 64, 0x000000).setStrokeStyle(2, 0x444444);
    h.p2AvatarWalk = this.add.graphics({x: W - 50 - W / 2, y: 45 - H / 2}).setScale(-3, 3);
    dsp(h.p2AvatarWalk, this.p2.SPR.Walk.slice(0, 18), 0, 0);
    h.p2AvatarJump = this.add.graphics({x: W - 50 - W / 2, y: 45 - H / 2}).setScale(-3, 3).setVisible(0);
    dsp(h.p2AvatarJump, this.p2.SPR.Jump.slice(0, 18), 0, 0);
    h.p2Avatar = this.add.container(0, 0, [h.p2AvatarBg, h.p2AvatarWalk, h.p2AvatarJump]);

    h.roundText = this.add.text(0, 40 - H / 2, `CAÍDA ${this.round}`, t(24, '#fff', 1)).setOrigin(0.5, 0.5).setStroke('#000', 6);

    h.container.add([h.hp1Bg, h.hp1, h.hp2Bg, h.hp2, h.p1Avatar, h.p2Avatar, h.roundText]);

    h.winCont = this.add.container(0, H / 2).setVisible(0);
    h.winTitle = this.add.text(0, -110, '.', t(24, '#fff')).setOrigin(0.5);
    h.winName = this.add.text(0, -60, 'NAME', t(48, '#f7bb1b', 1)).setOrigin(0.5);
    h.winSubtitle = this.add.text(0, -30, 'FIN DE LA PELEA', t(16, '#fff')).setOrigin(0.5).setVisible(0);
    h.winPrompt = this.add.text(0, -H / 2, 'PRESIONA CUALQUIER BOTÓN PARA CONTINUAR', t(24, '#f7bb1b', 1)).setOrigin(0.5).setStroke('#000', 6).setVisible(0);
    h.winCont.add([this.add.rectangle(0, 0, W, 150, 0, 0.5).setOrigin(0.5, 1), h.winTitle, h.winName, h.winSubtitle, h.winPrompt]);
    h.container.add(h.winCont);
  }

  resetRound() {
    const G = this.ring.geometry;

    this.me = false;
    this.winPhase = 0;
    this.graceTimer = 0;
    if (this.hud.winCont) {
      this.hud.winCont.setVisible(0);
      this.hud.winPrompt.setVisible(0);
      this.hud.winSubtitle.setVisible(0);
      this.hud.winPrompt.setAlpha(1);
    }

    this.p1.x = G.backLX + 30; this.p1.y = G.backY + 30;
    this.p1.vx = 0; this.p1.vy = 0; this.p1.st = ST.IDLE; this.p1.hp = P.mHealth;
    this.p1.charge = 0; this.p1.charging = false; this.p1.combo = 0; this.p1.ct = 0;
    this.p1.dtm = 0; this.p1.carry = null; this.p1.carriedBy = null;
    this.p1.hitTimer = 0; this.p1.invuln = 0;
    this.p1.f = 1;
    this.p1.body.setAngle(0); this.p1.body.setAlpha(1);

    this.p2.x = G.frontRX - 120; this.p2.y = G.frontY - 120;
    this.p2.vx = 0; this.p2.vy = 0; this.p2.st = ST.IDLE; this.p2.hp = P.mHealth;
    this.p2.charge = 0; this.p2.charging = false; this.p2.combo = 0; this.p2.ct = 0;
    this.p2.dtm = 0; this.p2.carry = null; this.p2.carriedBy = null;
    this.p2.hitTimer = 0; this.p2.invuln = 0;
    this.p2.f = -1;
    this.p2.body.setAngle(0); this.p2.body.setAlpha(1);

    // Reset rope deformations
    for (const side in this.ring.ropes) {
      const r = this.ring.ropes[side];
      r.amount = 0; r.target = 0; r.soundTimer = 0;
    }
    this.uPVisuals(this.p1); this.uPVisuals(this.p2);
    this.updateHUD();

    // Reset camera to center of ring
    this.cameras.main.scrollX = G.centerX - W / 2;
  }

  showFightText() {
    this.rs = true;
    let step = 3;

    // Create the background and text container for the bottom
    const winBg = this.add.rectangle(W / 2, H, W, 150, 0, 0.5).setOrigin(0.5, 1).setScrollFactor(0).setDepth(2400);

    let caidaText = ['PRIMERA CAÍDA', 'SEGUNDA CAÍDA', 'TERCERA CAÍDA'][this.round - 1] || 'CAÍDA ' + this.round;
    const title = this.add.text(W / 2, H - 110, caidaText, t(32, '#f7bb1b', 1)).setOrigin(0.5).setScrollFactor(0).setDepth(2500);
    const subtitle = this.add.text(W / 2, H - 70, 'GANA EL MEJOR DE 3 CAÍDAS', t(16, '#fff', 1)).setOrigin(0.5).setScrollFactor(0).setDepth(2500);

    const txt = this.add.text(W / 2, H / 2, '¡A PELEAR!', t(64, '#f7bb1b', 1)).setOrigin(0.5).setStroke('#915f01', 8).setScrollFactor(0).setDepth(2500);
    txt.setVisible(0);

    // SPR for 3, 2, 1
    const SPR = [
      sp('~5.3<4.4.3<1N4.3.2<1N1<1N4.3.2N1.1<1N4.6.1<1N4.^^^^^~', 12),
      sp('~3.5N4.2.1N5<1N3.2.2<2.2<1N3.7.1<1N3.6.2<1N3.5.2<1N4.4.2<1N5.3.2<1N3.1N2.2.3<5N2.2.7<1N2.~', 12),
      sp('~3.7N2.2.4<>7.1<2N2.6.2<1N3.4.3<2N3.5.4<1N2.2.1<4.2<1N2.2.2<2.3<1N2.2.7<1N2.3.3N>~', 12)
    ];

    const gfx = this.add.graphics({ x: W / 2, y: H / 2 }).setScrollFactor(0).setDepth(2500);

    const drawNumber = (n) => {
      gfx.clear();
      dsp(gfx, SPR[n - 1], 0, 0);
    };

    drawNumber(step);
    gfx.setScale(8);
    gfx.setAlpha(1);

    const nextStep = () => {
      step--;
      if (step > 0) {
        drawNumber(step);
        gfx.setScale(8).setAlpha(1);
        this.tweens.add({ targets: gfx, scale: 12, alpha: 0, duration: 800, onComplete: nextStep });
      } else if (step === 0) {
        gfx.destroy();
        txt.setVisible(1);
        txt.setScale(1).setAlpha(1);
        this.rs = false;
        this.tweens.add({ targets: txt, scale: 1.5, alpha: 0, duration: 800 });
        this.tweens.add({ targets: [title, subtitle, winBg], alpha: 0, duration: 800, delay: 1e3, onComplete: nextStep });
      } else {
        txt.destroy();
        title.destroy();
        subtitle.destroy();
        winBg.destroy();
      }
    };
    this.tweens.add({ targets: gfx, scale: 12, alpha: 0, duration: 800, onComplete: nextStep });
  }

  // updatePlayerVisuals
  uPVisuals(p) {
    // For carried players, position is based on carrier
    let drawX = p.x, drawY = p.y;
    if (p.st === ST.CARRY && p.carriedBy) {
      drawX = p.carriedBy.x;
      drawY = p.carriedBy.y - 20;
    }

    if (p.st === ST.HIT) {
      drawX += (rand() - 0.5) * 10;
      drawY += (rand() - 0.5) * 10;
    }

    if (p.st === ST.PUNCH) {
      // Aggressive lunge: quick forward, short hold, quick back
      const t = (p.pt || 0) / 0.5;
      let lungeAmt = 0;
      if (t < 0.1) lungeAmt = t / 0.1;
      else if (t < 0.4) lungeAmt = 1;
      else lungeAmt = Math.max(0, 1 - (t - 0.4) / 0.1);

      drawX += lungeAmt * 15 * p.f;
    }

    let isWalking = false;
    if (p.st === ST.WALK || p.st === ST.BULL_C || p.st === ST.BULL_R || p.st === ST.BULL_B) {
      isWalking = true;
      let spdMod = 1;
      if (p.st === ST.BULL_C) spdMod = 1.5;
      if (p.st === ST.BULL_R) spdMod = 2.0;
      if (p.st === ST.BULL_B) spdMod = 1.0;
      p.wt = (p.wt || 0) + (this.game.loop.delta / 1000) * spdMod;
      drawY += abs(sin(p.wt * 15)) * -6; // vertical bob
    } else {
      p.wt = 0;
    }

    let sx = 4, sy = 4;
    if (p.charging && p.st !== ST.JUMP) {
      const prog = p.charge / P.chargeTime;
      sy = 4 - (prog * 1.5);
      sx = 4 + (prog * 1.0);
      drawY += (4 - sy) * 12; // Compensate to keep feet on ground
      if (prog > 0.8) drawX += (rand() - 0.5) * 4; // Vibrate
    }

    p.body.setPosition(drawX, drawY);

    // Determine sprite frame based on state
    let frame = 'Walk';
    if (p.st === ST.JUMP || p.st === ST.FLY) frame = 'Jump';
    if (p.st === ST.JUMP && p.jnr) frame = 'Walk';
    else if (p.st === ST.WIN) frame = 'Walk';
    else if (p.st === ST.PUNCH) {
      const t = (p.pt || 0) / 0.5;
      frame = t < 0.4 ? 'Punch' : 'Walk';
    }
    else if (p.st === ST.DOWN || p.st === ST.KO) frame = 'Walk';
    else if (p.st === ST.SUPLEX_A) frame = 'Walk';
    else if (p.st === ST.SUPLEX_R) frame = 'Jump';

    p.body.clear();
    if (p.SPR && p.SPR[frame] && p.SPR[frame].length > 0) {
      dsp(p.body, p.SPR[frame], 0, 0, { shadow: true });
    } else {
      // Fallback: draw rectangles manually onto the graphics object
      let fillC = p.color;
      let alphaMultiplier = 1;

      // Damage blink
      if (p.st === ST.HIT) {
        alphaMultiplier = 0.7 + sin(this.time.now * 0.02) * 0.3;
      }
      // KO grayed out
      if (p.st == ST.KO) fillC = 0x888888;

      p.body.fillStyle(fillC, 1 * alphaMultiplier);
      p.body.fillRect(-20, -20, 40, 40);
      p.body.lineStyle(3, 0xffffff, 0.8 * alphaMultiplier);
      p.body.strokeRect(-20, -20, 40, 40);
    }

    const baseDepth = (p.st == ST.JUMP || p.st == ST.FLY || p.st == ST.ONROPE || p.st == ST.SUPLEX_A || p.st == ST.SUPLEX_R || p.st == ST.WIN) ? p.sy : p.y;
    p.body.setDepth(baseDepth);
    p.shad.setDepth(baseDepth - 1);
    p.chargeBarBg.setDepth(baseDepth + 0.2);
    p.chargeBar.setDepth(baseDepth + 0.3);

    p.chargeBarBg.setPosition(drawX, drawY - 20 - 25);
    p.chargeBar.setPosition(drawX - 20, drawY - 20 - 25);
    const cw = (p.charge / P.chargeTime) * 40;
    p.chargeBar.setSize(cw, 4);

    if (p.st == ST.JUMP || p.st == ST.FLY || p.st == ST.SUPLEX_A || p.st == ST.SUPLEX_R || p.st == ST.WIN) {
      p.shad.setPosition(p.sx, p.sy);
      p.shad.setVisible(1);
    } else { p.shad.setVisible(0); }

    // Face the correct direction. We scale by 4 here so 24x24 SPR appear larger (96x96)
    p.body.setScale(p.f * sx, sy);

    if (p.st == ST.DOWN) { p.body.setAngle(90); }
    else if (p.st == ST.KO) {
      if (this.winPhase == 0) {
        const prog = Math.min(1, (0.5 - this.graceTimer) / 0.5);
        p.body.setAngle(prog * 90 * -p.f);
      } else {
        p.body.setAngle(90 * -p.f);
      }
    }
    else if (p.st == ST.ONROPE) { p.body.setAngle(0); }
    else if (p.st == ST.FLY && p.charName !== 2) {
      p.body.setAngle(-90 * p.f);
    }
    else if (p.st == ST.SUPLEX_A) {
      p.body.setAngle(-90 * p.f * Math.min(1, p.spt / 0.35));
    }
    else if (p.st == ST.SUPLEX_R && p.carriedBy) {
      p.body.setAngle(-180 * p.carriedBy.f * Math.min(1, p.carriedBy.spt / 0.35));
    }
    else if (p.st == ST.JUMP && p.charName == 1 && p.ivy) {
      const fraction = (p.vy - p.ivy) / (-2 * p.ivy);
      p.body.setAngle(fraction * -360);
    }
    else if (p.st == ST.BULL_C || p.st == ST.BULL_R || p.st == ST.BULL_B) {
      p.body.setAngle((15 + sin(p.wt * 15) * 2) * p.f);
    }
    else { p.body.setAngle(isWalking ? sin(p.wt * 15) * 2 * p.f : 0); }

    if (p.comboTxt) {
      p.comboTxt.setDepth(baseDepth + 0.4);
      if (p.combo > 1 && !this.me) { p.comboTxt.setPosition(p.x, p.y - 20 - 50); p.comboTxt.setText('¡x' + p.combo + ' COMBO!'); p.comboTxt.setVisible(1); }
      else { p.comboTxt.setVisible(0); }
    }

    if (p.charging && p.st !== ST.JUMP) { p.chargeBar.setVisible(1); p.chargeBarBg.setVisible(1); }
    else { p.chargeBar.setVisible(0); p.chargeBarBg.setVisible(0); }


  }

  updateHUD() {
    let dt = this.game.loop.delta / 1000;
    this.p1.shakeTimer = Math.max(0, (this.p1.shakeTimer || 0) - dt);
    this.p2.shakeTimer = Math.max(0, (this.p2.shakeTimer || 0) - dt);

    const w1 = (this.p1.hp / P.mHealth) * 200;
    const w2 = (this.p2.hp / P.mHealth) * 200;
    this.hud.hp1.setSize(w1, 20); this.hud.hp1.setFillStyle(this.p1.hp <= P.mHealth * 0.2 ? 0xDE4343 : C.bar);
    this.hud.hp2.setSize(w2, 20); this.hud.hp2.setFillStyle(this.p2.hp <= P.mHealth * 0.2 ? 0xDE4343 : C.bar);

    let off1 = this.p1.shakeTimer > 0 ? (rand() - 0.5) * 8 : 0;
    let off2 = this.p2.shakeTimer > 0 ? (rand() - 0.5) * 8 : 0;

    this.hud.hp1Bg.setX(200 - W / 2 + off1);
    this.hud.hp1.setX(100 - W / 2 + off1);
    this.hud.hp2Bg.setX(W - 200 - W / 2 + off2);
    this.hud.hp2.setX(W - 300 - W / 2 + off2);
    
    this.hud.p1Avatar.setX(off1);
    this.hud.p2Avatar.setX(off2);

    this.hud.p1AvatarJump.setVisible(0);
    this.hud.p1AvatarWalk.setVisible(1);
    this.hud.p1Avatar.setY(0);
    
    this.hud.p2AvatarJump.setVisible(0);
    this.hud.p2AvatarWalk.setVisible(1);
    this.hud.p2Avatar.setY(0);

    // Scale the entire HUD container inversely to camera zoom so it stays perfectly pinned to the screen boundaries
    if (this.cameras.main.zoom) {
      this.hud.container.setScale(1 / this.cameras.main.zoom);
    }
  }

  // Trapezoid boundary helpers
  getRingBounds(y) {
    const G = this.ring.geometry;
    const t = Phaser.Math.Clamp((y - G.backY) / G.height, 0, 1);
    return {
      left: G.backLX + (G.frontLX - G.backLX) * t,
      right: G.backRX + (G.frontRX - G.backRX) * t,
    };
  }

    // Springy rope physics - applies to both ground and air players
  ropeSpring(p, dt, isShadow) {
    const G = this.ring.geometry;
    const px = isShadow ? p.sx : p.x;
    const py = isShadow ? p.sy : p.y;
    const bounds = this.getRingBounds(py);
    // Perspective-compensated padding: player's visual "feet" are at their bottom edge,
    // so back/sides need tight or negative padding to look like they reach the edge.
    // Bottom (front) keeps full padding since it already looks correct.
    const minX = bounds.left + 2;
    const maxX = bounds.right - 2;
    const minY = G.backY - 13;
    const maxY = G.frontY - 20;

    // Check each rope side
    const ropes = this.ring.ropes;

    // Left rope
    if (px < minX + 5) {
      const pushVel = abs(isShadow ? (p.svx || 0) : (p.vx || 0));
      const r = ropes.left;
      r.target = Math.max(r.target, Math.min(pushVel * 4, r.mBend));
      r.contactY = py;
      r.pushVel = pushVel;

      // Spring force pushes back (to the right)
      const springf = r.amount * r.k * dt;
      if (isShadow) {
        p.sx += springf;
      } else {
        p.x += springf;
      }

      r.soundTimer -= dt;
    }

    // Right rope
    if (px > maxX - 5) {
      const pushVel = abs(isShadow ? (p.svx || 0) : (p.vx || 0));
      const r = ropes.right;
      r.target = Math.max(r.target, Math.min(pushVel * 4, r.mBend));
      r.contactY = py;
      r.pushVel = pushVel;

      // Spring force pushes back (to the left)
      const springf = r.amount * r.k * dt;
      if (isShadow) {
        p.sx -= springf;
      } else {
        p.x -= springf;
      }

      r.soundTimer -= dt;
    }

    // Back rope
    if (py < minY + 5) {
      const pushVel = abs(isShadow ? (p.svy || 0) : (p.vy || 0));
      const r = ropes.back;
      r.target = Math.max(r.target, Math.min(pushVel * 4, r.mBend));
      r.contactX = px;
      r.pushVel = pushVel;

      // Spring force pushes back (downward)
      const springf = r.amount * r.k * dt;
      if (isShadow) {
        p.sy += springf;
      } else {
        p.y += springf;
      }

      r.soundTimer -= dt;
    }

    // Front rope
    if (py > maxY - 5) {
      const pushVel = abs(isShadow ? (p.svy || 0) : (p.vy || 0));
      const r = ropes.front;
      r.target = Math.max(r.target, Math.min(pushVel * 4, r.mBend));
      r.contactX = px;
      r.pushVel = pushVel;

      // Spring force pushes back (upward)
      const springf = r.amount * r.k * dt;
      if (isShadow) {
        p.sy -= springf;
      } else {
        p.y -= springf;
      }

      r.soundTimer -= dt;
    }

    // Clamp position - allow pushing past bounds by rope bend amount
    if (isShadow) {
      p.sx = Phaser.Math.Clamp(p.sx, minX - ropes.left.amount, maxX + ropes.right.amount);
      p.sy = Phaser.Math.Clamp(p.sy, minY - ropes.back.amount, maxY + ropes.front.amount);
    } else {
      p.x = Phaser.Math.Clamp(p.x, minX - ropes.left.amount, maxX + ropes.right.amount);
      p.y = Phaser.Math.Clamp(p.y, minY - ropes.back.amount, maxY + ropes.front.amount);
    }
  }

  updateRopes() {
    const ropes = this.ring.ropes;
    for (const side in ropes) {
      const r = ropes[side];
      // Smoothly approach target
      r.amount += (r.target - r.amount) * 0.3;
      // Decay when not pushing
      if (r.target == 0) {
        r.amount *= r.decay;
      }
    }

    // Draw the entire ring
    this.drawRing();
  }

  updateCrowd() {
    // is cheering? 20 : 13
    const speed = (this.p1.st == ST.DOWN || this.p1.st == ST.KO ||
      this.p2.st == ST.DOWN || this.p2.st == ST.KO) ? 20 : 13;
    const dt = this.game.loop.delta / 1000;
    this.crowdPhase = (this.crowdPhase || 0) + (dt * speed);
  }

  // Unified physics engine for both player and AI
  // inputs: { up, down, left, right, btn1, btn2, btn3, btn4 }
  sim(p, dt, inputs, opp) {
    const s = this;
    if (p.st == ST.KO || p.st == ST.WIN || p.carriedBy) return;

    // Lift Cooldown
    if (p.liftCooldown > 0) p.liftCooldown -= dt;

    // Down state: countdown and recover
    if (p.st == ST.DOWN) {
      p.dtm -= dt;
      if (p.dtm <= 0) {
        p.st = ST.IDLE;
        p.dtm = 0;
        p.body.setAngle(0);
        if (p.bodyInner) p.bodyInner.setAngle(0);
      }
      p.x += p.vx; p.vx *= 0.9;
      p.y += p.vy; p.vy *= 0.9;
      s.ropeSpring(p, dt, false);
      return;
    }

    // Punch state: auto-reset after short duration. Stops player movement.
    if (p.st == ST.PUNCH) {
      p.vx = 0;
      p.vy = 0;
      p.pt = (p.pt || 0) + dt;
      if (p.pt > 0.5) {
        p.st = ST.IDLE;
        p.pt = 0;
      }
    }

    if (p.st == ST.SUPLEX_A) {
      p.vx = 0; p.vy = 0;
      p.spt += dt;
      const LIFT_TIME = 0.35;
      const progress = p.spt / LIFT_TIME;

      if (p.spt <= LIFT_TIME && p.carry) {
        // Lift & slam
        const opp = p.carry;
        const radius = 32;

        // Attacker stays mostly grounded until a small hop at the very end
        const jumpOffset = Math.pow(progress, 4) * 20;

        // Pivot around the feet instead of the center
        const theta = -Math.PI / 2 * p.f * progress; // 0 to -90 degrees
        const feetR = 20;
        p.x = p.sx + feetR * sin(theta);
        p.y = p.sy + feetR * (1 - cos(theta)) - jumpOffset;

        // Position the receiver on an arc closely coordinated with the attacker's body
        // Angle goes from PI/2 (front) -> 0 (top) -> -PI/2 (behind)
        const angleRads = (Math.PI / 2) - (progress * Math.PI);
        opp.sx = p.sx + sin(angleRads) * radius * p.f;
        opp.sy = p.sy; // Opponent lands at the same Y as attacker's base

        // Receiver stays glued to the attacker's shifting center of mass
        opp.x = p.x + sin(angleRads) * radius * p.f;
        opp.y = p.y - cos(angleRads) * radius;

      } else if (p.spt > LIFT_TIME && p.spt < LIFT_TIME + 0.1 && p.carry) {
        // Impact
        const opp = p.carry;
        p.y = p.sy; // Snap to ground
        opp.x = opp.sx;
        opp.y = opp.sy; // Snap to ground

        damage(s, opp, 10, 0);
        opp.st = ST.DOWN;
        opp.dtm = 2.5;
        opp.liftCooldown = 1.5;
        opp.carriedBy = null;
        p.carry = null;
        snd('slam');
        particles(s, opp.x, opp.y, 0xffffff, 10);
        shake(s, 0.015, 0.15); // Extra impact
      } else if (p.spt > LIFT_TIME + 0.5) {
        // Recovery complete
        p.st = ST.IDLE;
        p.spt = 0;
      }
      return;
    }

    if (p.st == ST.HIT) {
      p.hitTimer -= dt;
      if (p.hitTimer <= 0) p.st = ST.IDLE;
      p.x += p.vx; p.vx *= 0.9;
      p.y += p.vy; p.vy *= 0.9;
      s.ropeSpring(p, dt, false);
      return;
    }

    if (p.st == ST.ONROPE) {
      p.jh = 90;
      p.y = p.sy - p.jh;
      p.x = p.sx;

      if (!inputs.btn3) {
        p.crj = true;
      }

      if (inputs.btn3 && p.crj) {
        p.st = ST.JUMP;
        p.fd = true;
        p.ra = true;
        p.jnr = false;

        let dx = opp.sx - p.sx;
        let dy = opp.sy - p.sy;
        let dist = Math.hypot(dx, dy);

        if (isNaN(dist) || dist == 0) { dx = p.f; dy = 0; dist = 1; }

        let targetDist = Math.min(dist + 20, 300); // Removed minimum 150 overshoot, just aim for their position + small body offset

        p.flyDirX = dx / dist;
        p.flyDirY = dy / dist;
        if (isNaN(p.flyDirX)) p.flyDirX = p.f;
        if (isNaN(p.flyDirY)) p.flyDirY = 0;

        p.vy = -12;
        const frames = 46.5;
        let spd = targetDist / frames;

        p.svx = p.flyDirX * spd;
        p.svy = p.flyDirY * spd;
        p.f = p.flyDirX > 0 ? 1 : -1;
        snd('jump');
      }
      return;
    }

    if (p.st == ST.FLY) {
      const flySpd = P.walkSpd * 2.5;
      p.svx = p.flyDirX * flySpd;
      p.svy = p.flyDirY * flySpd;
      p.sx += p.svx;
      p.sy += p.svy;
      p.flyDist -= flySpd;

      const G = s.ring.geometry;
      const bounds = s.getRingBounds(p.sy);
      const minX = bounds.left + 5;
      const maxX = bounds.right - 5;
      const minY = G.backY - 13 + 5;
      const maxY = G.frontY - 20 - 5;

      const shadowDist = Math.hypot(p.sx - opp.x, p.sy - opp.y);
      if (shadowDist < 60 && abs(p.jh - 40) < 40) {
        p.flyDist = 0; // Drop straight down if passing over opponent
      }

      if (p.flyDist <= 0 || p.sx <= minX || p.sx >= maxX || p.sy <= minY || p.sy >= maxY) {
        p.st = ST.JUMP;
        p.fd = true;
        p.svx = p.flyDirX * 4;
        p.svy = p.flyDirY * 4;
        p.vy = 0; // Starts falling
      }

      p.x = p.sx;
      p.y = p.sy - p.jh;
      return;
    }

    if (p.st == ST.JUMP) {
      const airSpd = P.walkSpd * 0.1; // little mid-air control

      if (!p.svx) p.svx = 0;
      if (!p.svy) p.svy = 0;

      if (!p.jnr && !p.ra) {
        if (inputs.left) p.svx -= airSpd;
        if (inputs.right) p.svx += airSpd;
      }

      p.sx += p.svx;
      p.sy += p.svy;

      s.ropeSpring(p, dt, true);

      const G = s.ring.geometry;
      const bounds = s.getRingBounds(p.sy);
      const minX = bounds.left + 5;
      const maxX = bounds.right - 5;
      const minY = G.backY - 13 + 5;
      const maxY = G.frontY - 20 - 5;

      let bounced = false;
      if (!p.jnr) {
        if (p.sx <= minX) {
          p.sx = minX; p.flyDirX = 1; p.flyDirY = 0; bounced = true;
          s.ring.ropes.left.amount = 25; s.ring.ropes.left.contactY = p.sy;
        } else if (p.sx >= maxX) {
          p.sx = maxX; p.flyDirX = -1; p.flyDirY = 0; bounced = true;
          s.ring.ropes.right.amount = 25; s.ring.ropes.right.contactY = p.sy;
        }
      }
      if (p.sy <= minY) { p.sy = minY; }
      else if (p.sy >= maxY) { p.sy = maxY; }

      if (bounced) {
        if (p.flyDirX !== 0 && p.jnr) {
          p.svx = 0;
          p.f = p.flyDirX;
        } else if (!p.ra) {
          p.st = ST.FLY;
          p.flyDist = 200;
          if (p.flyDirX !== 0 && !p.jnr) p.f = p.flyDirX;
          snd('rope');
          return;
        }
      }

      p.vy += P.jumpGrav;
      p.jh -= p.vy;
      p.x = p.sx;
      p.y = p.sy - p.jh;

      if (p.jnr && p.vy > 0 && p.jh <= 90) {
         if (abs(p.sx - (minX - 10)) < 25) {
           p.sx = minX - 10;
           p.st = ST.ONROPE;
           p.f = 1;
         } else if (abs(p.sx - (maxX + 10)) < 25) {
           p.sx = maxX + 10;
           p.st = ST.ONROPE;
           p.f = -1;
         }

         if (p.st == ST.ONROPE) {
           p.jh = 90;
           p.vy = 0;
           p.y = p.sy - p.jh;
           p.crj = false;
           snd('rope');
           return;
         }
      }

      if (p.jh <= 0) {
        p.jh = p.vy = 0; p.y = p.sy;
        if (!p.fd && !p.ra && Math.hypot(p.sx - opp.x, p.sy - opp.y) < 60 && ![6,10,11].includes(opp.st)) {
          if (opp.st == 7 || opp.st == 8) {
            damage(s, opp, P.punchDmg, p.f * P.punchKb * 0.2);
            shake(s, 0.015, 0.15); snd('slam'); particles(s, opp.x, opp.y, C.txt, 15);
          } else {
            damage(s, opp, P.punchDmg * 2, p.f * P.punchKb);
            opp.st = 6; opp.hitTimer = 0.2;
            shake(s, 0.02, 0.2); snd('punch'); particles(s, opp.x, opp.y, C.txt, 10);
          }
        } else {
          snd('slam'); particles(s, p.x, p.y, C.txt, 6); shake(s, 0.005, 0.1);
        }
        p.fd = p.ra = false; p.st = 1;
      }

      if ((inputs.btn1 || p.fd) && p.vy > 0 && p.jh < 50) {
        const shadowDist = Math.hypot(p.sx - opp.x, p.sy - opp.y);
        if (shadowDist < 60) {
          const dmg = p.ra ? 15 : P.slamDmg;
          const kb = p.ra ? P.tackleKb * 1.5 : P.tackleKb;
          damage(s, opp, dmg, p.f * kb);
          opp.st = ST.DOWN; opp.dtm = P.downTime / 1000;
          p.fd = false;
          p.ra = false;
          shake(s, 0.012, 0.15);
          snd('slam'); particles(s, opp.x, opp.y, C.txt, 8);
        }
      }
      return;
    }

    if (p.st == ST.BULL_C || p.st == ST.BULL_R) {
      const spd = p.st == ST.BULL_C ? P.walkSpd * 1.5 : P.walkSpd * 2.5;
      p.vx = p.f * spd;
      p.vy = 0;
      p.x += p.vx;
      p.bd += abs(p.vx);
      p.sx = p.x;
      p.sy = p.y;
      s.ropeSpring(p, dt, false);

      if (!p.hb && ![6,7,8,10,11].includes(opp.st)) { // ![ST.HIT, ST.DOWN, ST.KO, ST.SUPLEX_A, ST.SUPLEX_R]
        let isPunching = inputs.btn1;
        let hitboxRange = isPunching ? 72 : 40;

        if (abs(p.sx - opp.sx) < hitboxRange && abs(p.sy - opp.y) < 40) {
          if (opp.st == ST.BULL_C || opp.st == ST.BULL_R) {
            // Dash Clash!
            p.st = ST.IDLE;
            opp.st = ST.IDLE;
            p.hb = true;
            opp.hb = true;
            snd('punch');
            particles(s, p.x + (opp.x - p.x)/2, p.y, C.txt, 15);
            shake(s, 0.02, 0.15);
            return;
          }

          const isRebound = p.st == ST.BULL_R;
          const dmg = isRebound ? 20 : 2;
          const kb = isRebound ? P.tackleKb : P.punchKb * 0.5;

          damage(s, opp, dmg, p.f * kb);
          p.combo = 0; // Attacker combo resets when landing a dash

          if (isRebound) {
            opp.st = ST.DOWN;
            opp.dtm = P.downTime / 1000;
            snd('slam');
          } else {
            opp.st = ST.HIT;
            opp.hitTimer = 0.15;
            snd('punch');
          }

          p.hb = true;

          particles(s, opp.x, opp.y, C.txt, isRebound ? 12 : 5);
          shake(s, isRebound ? 0.02 : 0.01, 0.15);

          if (isPunching) {
             p.st = ST.PUNCH;
             p.pt = 0;
             return;
          }
        } else if (isPunching) {
          // Whiffed the running punch, stopping the charge!
          p.st = ST.PUNCH;
          p.pt = 0;
          snd('punch');
          return;
        }
      }

      const bounds = s.getRingBounds(p.y);
      const minX = bounds.left + 5;
      const maxX = bounds.right - 5;

      let hitRope = false;
      if (p.x <= minX && p.f == -1) { hitRope = true; p.x = minX; }
      else if (p.x >= maxX && p.f == 1) { hitRope = true; p.x = maxX; }

      const maxDist = p.st == ST.BULL_C ? 300 : 450;
      if (hitRope && p.st == ST.BULL_C) {
        p.st = ST.BULL_B;
        p.bt = 0.5;
        p.f *= -1; // Immediately point in the rebound direction
        p.rs = p.f == 1 ? -1 : 1;
        snd('rope');
      } else if (p.bd > maxDist || hitRope) {
        p.st = ST.IDLE;
        if (hitRope) snd('rope');
      }
      return;
    }

    if (p.st == ST.BULL_B) {
      p.vx = 0; p.vy = 0;
      p.bt -= dt;

      const bounds = s.getRingBounds(p.y);
      const bendAmt = Math.max(0, ((0.5 - p.bt) / 0.5) * 35);

      if (p.rs == -1) {
        s.ring.ropes.left.amount = bendAmt; s.ring.ropes.left.contactY = p.y;
        p.x = bounds.left + 5 - bendAmt;
      } else {
        s.ring.ropes.right.amount = bendAmt; s.ring.ropes.right.contactY = p.y;
        p.x = bounds.right - 5 + bendAmt;
      }
      p.sx = p.x;

      if (p.bt <= 0) {
        p.st = ST.BULL_R;
        p.bd = 0;
        p.hb = false;
        snd('jump');
      }
      return;
    }

    let mx = 0, my = 0;
    if (inputs.up) my -= 1; if (inputs.down) my += 1;
    if (inputs.left) mx -= 1; if (inputs.right) mx += 1;
    if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }

    if (p.st !== ST.PUNCH) {
      p.vx = mx * P.walkSpd; p.vy = my * P.walkSpd;
      p.x += p.vx; p.y += p.vy;
      if (mx !== 0) p.f = mx > 0 ? 1 : -1;
    } else {
      p.vx = 0; p.vy = 0;
    }

    if (!p.jh || p.jh <= 0) {
      p.sx = p.x;
      p.sy = p.y;
    }

    if (inputs.btn3) {
      if (!p.charging) { p.charging = true; p.charge = 0; }
      p.charge += dt * 1000;
      if (p.charge > P.chargeTime) p.charge = P.chargeTime;
    }
    if (!inputs.btn3 && p.charging) {
      p.charging = false;
      const force = P.jumpForce + (p.charge / P.chargeTime) * (P.jumpMax - P.jumpForce);
      p.vy = -force;
      p.ivy = -force;
      p.jh = force;
      p.st = ST.JUMP;
      p.sx = p.x;
      p.sy = p.y;
      p.svx = p.f * P.walkSpd;
      p.svy = 0;
      p.fd = false;
      const bounds = s.getRingBounds(p.sy);
      p.jnr = false;
      if (p.f == -1 && abs(p.sx - bounds.left) < 90) p.jnr = true;
      if (p.f == 1 && abs(p.sx - bounds.right) < 90) p.jnr = true;

      if (p.jnr) {
        const targetX = p.f == -1 ? bounds.left - 5 : bounds.right + 5;
        p.svx = (targetX - p.sx) / 15;
        p.vy = -12;
        p.ivy = p.vy;
      }

      snd('jump');
    }

    if (inputs.btn1 && (p.st == ST.IDLE || p.st == ST.WALK || p.st == ST.RUN)) {
        // Always punch, even if no opponent is near
        p.st = ST.PUNCH;
        p.pt = 0;
        const isAntiAir = [4,9,13].includes(opp.st); // [ST.JUMP, ST.FLY, ST.ONROPE]
        // Extend vertical hitbox for anti-airs so grounded punches reach up to hitting jumping/roping opponents
        const vertHitbox = isAntiAir ? 120 : 40;
        if (abs(p.sx - opp.sx) < 64 && abs(p.sy - opp.y) < vertHitbox) {
          if (p.f == opp.f && opp.st !== ST.DOWN && opp.st !== ST.HIT && !isAntiAir) {
            // SUPLEX! Punching from behind
            p.st = ST.SUPLEX_A; p.spt = 0; p.carry = opp;
            p.sy = p.y; p.sx = p.x;
            opp.st = ST.SUPLEX_R; opp.carriedBy = p;
            opp.sy = opp.y; opp.sx = opp.x;
            p.combo = 0; opp.combo = 0;
            snd('punch'); // Initial grab sound
          } else if (isAntiAir) {
            // Anti-air hit! Knock them out of the sky
            damage(s, opp, 5, p.f * P.punchKb * 2);
            opp.st = ST.DOWN;
            opp.dtm = P.downTime / 1000;
            opp.jh = 0;
            opp.y = opp.sy;
            p.combo = 0;
            snd('slam');
            particles(s, opp.x, opp.y, C.txt, 10);
            shake(s, 0.015, 0.15); // Extra impact
          } else if (opp.st == ST.BULL_R) {
            // Countered the full-velocity bull charge!
            damage(s, opp, P.punchDmg, p.f * P.punchKb * 2);
            opp.st = ST.DOWN;
            opp.dtm = P.downTime / 1000;
            p.combo = 0;
            snd('slam');
            particles(s, opp.x, opp.y, C.txt, 10);
            shake(s, 0.015, 0.15); // Extra impact
          } else {
            damage(s, opp, P.punchDmg, p.f * P.punchKb);

            // If they were down, popping them into HIT state stands them back up for the combo
            opp.st = ST.HIT; opp.hitTimer = 0.15;
            p.combo++; p.ct = P.comboTime / 1000;
            if (p.combo >= P.comboCount) {
              opp.st = ST.DOWN; opp.dtm = P.downTime / 1000;
              p.combo = 0; snd('slam');
            } else { snd('punch'); }
          }
        } else {
          // Whiff - punch missed
          snd('punch');
        }
      }
    if (inputs.btn2 && (p.st == ST.IDLE || p.st == ST.WALK || p.st == ST.RUN)) {
      p.st = ST.BULL_C;
      p.bd = 0;
      p.hb = false;
      if (inputs.left) p.f = -1;
      else if (inputs.right) p.f = 1;
      snd('jump');
      return;
    }

    if (p.invuln > 0) p.invuln -= dt;

    if ([1,2,3,12].includes(p.st)) { // [ST.IDLE, ST.WALK, ST.RUN, ST.WIN] - i.e. not in an active or busy state
      if (p.vx !== 0 || p.vy !== 0) p.st = ST.WALK;
      else p.st = ST.IDLE;
    }

    s.ropeSpring(p, dt, false);

    if (p.combo > 0) { p.ct -= dt; if (p.ct <= 0) p.combo = 0; }

  }

  // Human player reads real inputs
  updatePlayer(p, dt, opp) {
    const n = p.num;
    const inputs = {
      up: isHeld('P' + n + '_U'),
      down: isHeld('P' + n + '_D'),
      left: isHeld('P' + n + '_L'),
      right: isHeld('P' + n + '_R'),
      btn1: isPress('P' + n + '_1'),
      btn2: isPress('P' + n + '_2'),
      btn3: isHeld('P' + n + '_3'),
      btn4: false
    };
    if (this.me && this.winPhase !== 2) {
      for (const k in inputs) inputs[k] = false;
    }
    this.sim(p, dt, inputs, opp);
  }

  // AI generates virtual inputs and passes them to the same physics
  updateAI(p, opp, dt) {
    const s = this;
    const pers = AI[p.charName] || AI[0];

    const dx = opp.x - p.x, dy = opp.y - p.y;
    const d = Math.hypot(dx, dy);

    // AI generates virtual inputs
    const inputs = { up: false, down: false, left: false, right: false, btn1: false, btn2: false, btn3: false, btn4: false };

    if (this.me && this.winPhase !== 2) {
      this.sim(p, dt, inputs, opp);
      return;
    }

    // State machine for AI behavior
    if (!p.as) p.as = 'approach';
    if (!p.at) p.at = 0;
    p.at -= dt;

    // If carrying opponent, throw immediately
    if (p.st == ST.LIFT && p.carry) {
      p.as = 'throw';
      p.at = 0.3;
    }

    const oppInAir = (opp.st == ST.JUMP || opp.st == ST.FLY || opp.st == ST.ONROPE);
    const canAct = [1,2,3,12,14,15,16].includes(p.st); // [ST.IDLE, ST.WALK, ST.RUN, ST.WIN, ST.BULL_C, ST.BULL_B, ST.BULL_R]

    if (p.at <= 0) {
      p.at = RndF(0.2, 0.6);

      const healthPct = p.hp / P.mHealth;
      const oppHealthPct = opp.hp / P.mHealth;

      // Evade aerial attacks (simulating human reaction time)
      if (canAct && oppInAir && d < 250) {
        // AI has a chance to fail to react based on pers
        if (rand() < pers.jumpCh * 2) {
          p.as = 'jump_atk';
        } else if (rand() < 0.6) {
          p.as = 'dodge_y';
          p.at = 0.6; // Commit to the dodge
        } else {
          p.as = 'wait'; // Failed to dodge
        }
      } else if (opp.st == ST.DOWN) {
        const bounds = s.getRingBounds(p.sy);
        const distL = abs(p.sx - bounds.left);
        const distR = abs(p.sx - bounds.right);

        if (d < 250 && Math.min(distL, distR) < 200) {
          p.as = 'rope_bounce';
          p.at = 1.5;
        } else if (d < 150) {
           p.as = 'teabag';
           p.at = 1.0;
        } else {
           p.as = 'bull_c';
           p.at = 1.0;
        }
      } else if (opp.st == ST.HIT || opp.st == ST.PUNCH) {
        p.as = 'capitalize';
        p.at = 0.3;
      } else if (healthPct < 0.3 && oppHealthPct > 0.5) {
        if (d < 100) {
          p.as = rand() < 0.5 ? 'jump_atk' : 'wait';
        } else {
          p.as = rand() < 0.6 ? 'retreat' : 'circle';
        }
      } else if (d < 80) {
        const r = rand();
        if (r < pers.punchCh * 3) p.as = 'attack';
        else if (r < pers.punchCh * 3 + pers.jumpCh * 2) p.as = 'jump_atk';
        else p.as = 'circle';
      } else if (d < 200) {
        const r = rand();
        if (r < pers.runCh) p.as = 'approach';
        else if (r < pers.runCh + pers.jumpCh * 2) p.as = 'jump_atk';
        else p.as = 'circle';
      } else {
        const r = rand();
        if (r < 0.15) p.as = 'bull_c';
        else if (r < 0.15 + pers.jumpCh * 2) p.as = 'rope_bounce';
        else p.as = rand() < pers.runCh ? 'approach' : 'wait';
      }

      if (pers == AI.mistico && rand() < 0.15) p.as = 'jump_atk';
    }

    // Execute AI strategy
    switch (p.as) {
      case 'approach':
        if (d > 44) {
          // Human-like Y-axis first alignment
          if (abs(dy) > 32) {
            inputs.up = dy < 0; inputs.down = dy > 0;
            // Also close some X distance if far away
            if (abs(dx) > 80) {
               inputs.left = dx < 0; inputs.right = dx > 0;
            }
          } else {
            inputs.left = dx < 0; inputs.right = dx > 0;
          }
        } else {
          p.as = 'attack'; p.at = 0.2;
        }
        break;

      case 'dodge_y':
        if (!oppInAir) p.as = 'approach'; // Cancel dodge if they landed
        else {
          // Move away from opp's Y to sidestep
          inputs.up = dy > 0;
          inputs.down = dy < 0;
          // also move away on X to create distance
          inputs.left = dx > 0;
          inputs.right = dx < 0;
        }
        break;

      case 'retreat':
        if (d < 300) {
          const ang = Math.atan2(dy, dx);
          const mx = -cos(ang) * P.walkSpd;
          const my = -sin(ang) * P.walkSpd;
          if (abs(mx) > abs(my)) { inputs.left = mx < 0; inputs.right = mx > 0; }
          else { inputs.up = my < 0; inputs.down = my > 0; }
        } else {
          p.as = 'wait'; p.at = 1.0;
        }
        break;

      case 'circle':
        {
          const ang = Math.atan2(dy, dx) + Math.PI / 2;
          const mx = cos(ang) * P.walkSpd;
          const my = sin(ang) * P.walkSpd;
          if (abs(mx) > abs(my)) { inputs.left = mx < 0; inputs.right = mx > 0; }
          else { inputs.up = my < 0; inputs.down = my > 0; }
          if (rand() < 0.02) p.as = 'circle_other';
        }
        break;

      case 'circle_other':
        {
          const ang = Math.atan2(dy, dx) - Math.PI / 2;
          const mx = cos(ang) * P.walkSpd;
          const my = sin(ang) * P.walkSpd;
          if (abs(mx) > abs(my)) { inputs.left = mx < 0; inputs.right = mx > 0; }
          else { inputs.up = my < 0; inputs.down = my > 0; }
          if (rand() < 0.02) p.as = 'circle';
        }
        break;

      case 'attack':
        if (d < 60) {
          // Only punch if Y is properly aligned to avoid whiffing
          if (abs(dy) < 16) {
            inputs.btn1 = true;
            p.at = 0.15; // Mash fast for combo
          } else {
            // Realign Y before punching
            inputs.up = dy < 0; inputs.down = dy > 0;
            if (abs(dx) > 40) {
              inputs.left = dx < 0; inputs.right = dx > 0;
            }
          }
        } else {
          p.as = 'approach';
        }
        break;

      case 'teabag':
        if (Math.floor(p.at * 10) % 2 == 0) inputs.up = true;
        else inputs.down = true;
        if (p.at <= 0.1) p.as = 'approach';
        break;

      case 'capitalize':
        if (![6,7].includes(opp.st)) { // ![ST.HIT, ST.DOWN]
          p.as = 'approach';
        } else if (d > 44) {
          const ang = Math.atan2(dy, dx);
          const spd = P.walkSpd;
          const mx = cos(ang) * spd;
          const my = sin(ang) * spd;
          if (abs(mx) > abs(my)) { inputs.left = mx < 0; inputs.right = mx > 0; }
          else { inputs.up = my < 0; inputs.down = my > 0; }
        } else {
          // Once close, decide to lift or combo
          if (rand() < 0.4 && opp.st == ST.DOWN) {
            inputs.btn1 = true;
          } else {
            inputs.btn1 = true;
          }
          p.at = 0.2; // Keep applying input quickly
        }
        break;



      case 'rope_bounce':
        if (![4,9,13].includes(p.st)) { // ![ST.JUMP, ST.FLY, ST.ONROPE]
          const bounds = s.getRingBounds(p.sy);
          const distL = abs(p.sx - bounds.left);
          const distR = abs(p.sx - bounds.right);

          inputs.left = distL < distR;
          inputs.right = distR <= distL;

          if (Math.min(distL, distR) < 80) {
            inputs.btn3 = true; // Jump!
            p.ajo = (rand() - 0.5) * 250;
            p.as = 'in_air'; p.at = 1.5;
          }
        }
        break;

      case 'bull_c':
        if (![14,15,16].includes(p.st)) { // ![ST.BULL_C, ST.BULL_B, ST.BULL_R]
          inputs.btn2 = true;
          // Dash AWAY from the opponent to ensure we hit the ropes first and rebound!
          inputs.left = dx >= 0; inputs.right = dx < 0;
          p.as = 'wait'; p.at = 1.0;
        }
        break;

      case 'jump_atk':
        if (p.st !== ST.JUMP) {
          inputs.btn3 = true;
          p.ajo = (rand() - 0.5) * 250;
          p.as = 'in_air'; p.at = 1.0;
        }
        break;

      case 'in_air':
        if (p.st === ST.IDLE) {
          p.as = 'approach'; // Landed
        } else if (p.st === ST.JUMP || p.st === ST.FLY || p.st === ST.ONROPE) {
          if (p.st === 13) {
            if (p.at <= 0) p.at = 0.3;
            inputs.btn3 = (p.at <= 0.05);
          } else if (p.st === ST.JUMP) {
            // In the air, steer towards opponent with an offset so we don't always land perfectly on them
            const targetX = opp.x + (p.ajo || 0);
            const tdx = targetX - p.sx;
            inputs.left = tdx < -10; inputs.right = tdx > 10;
          }

          if (p.vy > 0 && p.jh < 60) {
            const shadowDist = Math.hypot(p.sx - opp.x, p.sy - opp.y);
            // Only body slam if close, but sometimes randomly hold back
            if (shadowDist < 80 && rand() < 0.7) {
              inputs.btn1 = true;
              p.as = 'retreat'; p.at = 1.0;
            }
          }
        }
        break;

      case 'wait':
        if (rand() < 0.05) {
          const mx = (rand() - 0.5) * P.walkSpd;
          const my = (rand() - 0.5) * P.walkSpd;
          if (abs(mx) > abs(my)) { inputs.left = mx < 0; inputs.right = mx > 0; }
          else { inputs.up = my < 0; inputs.down = my > 0; }
        }
        break;
    }

    // Apply the same physics as the player with AI inputs
    this.sim(p, dt, inputs, opp);
  }

  update() {
    if (this.tG) {
      if (this.canPause && ['START1','START2'].some(isPress)) {
        this.tG.destroy();
        this.tG = 0;
        this.showFightText();
        snd('bell');
      }
      if (this.canPause) {
        let keys = this.mode === '2p' ? ['P1_1','P1_2','P1_3','P2_1','P2_2','P2_3'] : ['P1_1','P1_2','P1_3'];
        keys.forEach((k, i) => {
          let held = isHeld(k);
          this.tBtns[i].fg.setScale(held ? 10 : 8);
          this.tBtns[i].bg.setScale(held ? 11 : 8.5);
          this.tBtns[i].bg.setVisible(held);
          if (isPress(k)) snd('punch');
        });
      }
      this.tStartText.setAlpha(0.65 + 0.4 * sin(this.time.now / 300));
      clearPressed();

      let tm = this.time.now;
      this.tA.forEach((ta, p) => {
        let s = p ? this.p2.SPR : this.p1.SPR;
        let dir = p ? -1 : 1;
        ta.clear(); this.tA2[p].clear();
        dsp(ta, s[tm%500<250?'Punch':'Walk'], -24 * dir, 0);
        dsp(this.tA2[p], s.Walk, 0, abs(sin(tm/50))*-3);
        dsp(ta, s.Jump, 24 * dir, abs(sin(tm/150))*-10);
      });
    }

    let dt = this.game.loop.delta / 1000;
    if (this.me) dt *= 0.35;

    // Reset rope targets at start of frame so they can accumulate from all players
    for (const side in this.ring.ropes) {
      this.ring.ropes[side].target = 0;
    }

    // Pause
    if (this.canPause && !this.me && (isPress('START1') || isPress('START2'))) {
      this.scene.launch('PauseScene'); this.scene.pause();
      clearPressed(); return;
    }

    // Update players
    if (!this.rs) {
      this.updatePlayer(this.p1, dt, this.p2);
      if (this.mode === '1p') this.updateAI(this.p2, this.p1, dt);
      else this.updatePlayer(this.p2, dt, this.p1);

      // Check KO
      this.checkKO(dt);
    }

    // Visuals
    this.uPVisuals(this.p1);
    this.uPVisuals(this.p2);
    this.updateHUD();
    this.updateRopes();
    this.updateCrowd();

    // Camera Pan and Zoom
    let targetMidX = (this.p1.x + this.p2.x) / 2;
    let targetMidY = H / 2;
    let targetZoom = 1;

    if (this.me) {
      targetMidX = (this.p1.x + this.p2.x) / 2;
      targetMidY = (this.p1.y + this.p2.y) / 2 - 40;
      targetZoom = 1.4;
    }

    this.cameras.main.zoom += (targetZoom - this.cameras.main.zoom) * 0.05;

    let targetScrollX = targetMidX - W / 2;
    let targetScrollY = targetMidY - H / 2;

    if (!this.me) {
      const G = this.ring.geometry;
      const minScrollX = G.frontLX - 50;
      const maxScrollX = G.frontRX + 50 - W;
      targetScrollX = Phaser.Math.Clamp(targetScrollX, minScrollX, maxScrollX);
      targetScrollY = 0;
    }

    this.cameras.main.scrollX += (targetScrollX - this.cameras.main.scrollX) * 0.1;
    this.cameras.main.scrollY += (targetScrollY - this.cameras.main.scrollY) * 0.1;

    clearPressed();
  }

  checkKO(dt) {
    if (!this.me && (this.p1.hp <= 0 || this.p2.hp <= 0)) {
      this.me = true; this.winPhase = 0; this.graceTimer = 0.5; snd('bell');
      if (this.p1.hp <= 0) { this.p1.st = 8; this.p1.jh = 0; }
      if (this.p2.hp <= 0) { this.p2.st = 8; this.p2.jh = 0; }
    }

    if (this.me) {
      if (this.matchIsOver && this.winPhase >= 1 && RndF(0,1) < .45) {
        let p = this.add.rectangle(this.cameras.main.scrollX + RndF(0,W), this.cameras.main.scrollY - 20, 6, 8, [0xff0000,0x2dc243,0xff,0xf7bb1b,0xff00ff][Rnd(0,4)]).setDepth(3e3);
        this.tweens.add({targets: p, y: p.y + H + 40, angle: Rnd(-720,720), x: p.x + Rnd(-100,100), duration: Rnd(2e3,3e3), onComplete: () => p.destroy()});
      }

      if (this.winPhase === 0) {
        this.graceTimer -= dt / 0.35;
        if (this.graceTimer <= 0) {
          const d1 = this.p1.hp <= 0, d2 = this.p2.hp <= 0;

          const winner = d1 && d2 ? 'draw' : d1 ? 'p2' : 'p1';
          this.winPhase = 1; this.graceTimer = 3.0; this.lastWinner = winner;

          this.hud.winCont.setVisible(1);
          let titleTxt = 'GANADOR DE LA ' + ['PRIMERA', 'SEGUNDA', 'TERCERA'][this.round - 1] + ' CAÍDA';
          const isMatchOver = (this.scores.p1 + (winner === 'p1' ? 1 : 0) >= 2 || this.scores.p2 + (winner === 'p2' ? 1 : 0) >= 2 || this.round >= 3);
          this.matchIsOver = isMatchOver;
          if (isMatchOver) {
            titleTxt = 'GANADOR DEL COMBATE';
            this.hud.winSubtitle.setVisible(1);
          } else {
            this.hud.winSubtitle.setVisible(0);
          }
          if (winner === 'draw') titleTxt = '¡EMPATE!';
          this.hud.winTitle.setText(titleTxt);

          this.hud.winName.setText(winner === 'draw' ? 'AMBOS KO' : CH[this.registry.get(winner + 'Char') || (winner === 'p1' ? 0 : 1)][0]);

          if (winner !== 'draw') {
            this.scores[winner]++;
            this.registry.set('scores', this.scores);
            const wp = winner == 'p1' ? this.p1 : this.p2;
            wp.st = 12; // ST.WIN
            wp.jh = 0; wp.vy = 0; wp.sx = wp.x; wp.sy = wp.y;
          }
        }
      } else if (this.winPhase == 1) {
        this.graceTimer -= dt / 0.35;
        if (this.graceTimer <= 0) {
          this.winPhase = 2;
          this.hud.winPrompt.setVisible(1);
          this.tweens.add({ targets: this.hud.winPrompt, alpha: 0, duration: 500, yoyo: true, repeat: -1 });
        }
      } else if (this.winPhase == 2) {
        if (isPress('P1_1') || isPress('P2_1') || isPress('START1') || isPress('START2') || isPress('P1_U') || isPress('P1_D') || isPress('P1_L') || isPress('P1_R')) {
          snd('select');
          const isMatchOver = (this.scores.p1 >= 2 || this.scores.p2 >= 2 || this.round >= 3);
          if (isMatchOver) {
            this.registry.remove('p2Char');
            this.scene.start('MenuScene');
          } else {
            this.round++;
            this.registry.set('round', this.round);
            this.scene.start('PlayScene');
          }
        }
      }

      const winnerP = this.lastWinner == 'p1' ? this.p1 : this.lastWinner == 'p2' ? this.p2 : null;
      if (winnerP && winnerP.st == 12) {
        if (winnerP.jh <= 0 && winnerP.vy >= 0) {
          winnerP.vy = -P.jumpForce;
          snd('jump');
        }
        winnerP.vy += P.jumpGrav * dt * 60;
        winnerP.jh -= winnerP.vy * dt * 60;
        if (winnerP.jh <= 0) {
          winnerP.jh = 0;
          winnerP.vy = 0;
        }
        winnerP.y = winnerP.sy - winnerP.jh;
      }
    }
  }
}

class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene', active: false }); }
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0, 0.7);
    this.add.rectangle(W / 2, H / 2, 400, 250, 0);
    this.add.text(W / 2, H / 2 - 60, 'PAUSADO', t(48, '#f7bb1b', 1)).setOrigin(0.5);

    const labels = ['CONTINUAR', 'VOLVER AL MENÚ'];
    this.items = [];
    labels.forEach((l, i) => {
      const y = H / 2 + 20 + i * 60;
      const bg = this.add.rectangle(W / 2, y, 300, 45, 0x1a1e05).setStrokeStyle(2, 0x3a3a0a);
      const txt = this.add.text(W / 2, y, l, t(20, '#fff')).setOrigin(0.5);
      this.items.push({ bg, txt });
    });

    this.sel = 0;
    this.us();
  }

  us() {
    this.items.forEach((o, i) => {
      o.bg.setFillStyle(i == this.sel ? 0xf7bb1b : 0x1a1e05);
      o.txt.setColor(i == this.sel ? '#000' : '#fff');
    });
  }

  update() {
    if (isPress('P1_U') || isPress('P2_U') || isPress('P1_D') || isPress('P2_D')) {
      this.sel ^= 1; snd('select'); this.us();
    }

    if (isPress('START1') || isPress('START2') || isPress('P1_1') || isPress('P2_1')) {
      snd('select');
      this.scene.stop();
      if (!this.sel) this.scene.resume('PlayScene');
      else { this.scene.stop('PlayScene'); this.scene.start('MenuScene'); }
    }
    clearPressed();
  }
}




// Game config
const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-root',
  backgroundColor: '#1a0a2e',
  fps: { target: 60, forceSetTimeOut: true },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, CharSelectScene, PlayScene, PauseScene],
};

new Phaser.Game(config);
