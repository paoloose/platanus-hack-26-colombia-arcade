# 🎮 Platanus Hack 26: Arcade Challenge

At [Platanus Hack 26: CDMX](https://hack.platan.us/26-mx) (19-21 Jun) we will have an arcade machine. While we could put some cool retro games on it, it is way better if it can be turned into a challenge.

**Your mission:** Build the best arcade game using Phaser 3 (JS Game Lib) that will run on our physical arcade machine!

👾 See all submitted games at [hack.platan.us/26/arcade](https://hack.platan.us/26/arcade)

Open to everyone — you don't need to be a hackathon participant and you can join from anywhere in the world.

---

## 🏆 Prizes

### 🥇 Best Game: chosen by Platanus Team
- 💵 **$150 USD in cash**
- 🎟️ **A slot to participate in Platanus Hack 26: CDMX**
- 🎮 **Your game featured on the arcade machine**

🏁 Deadline: **Tuesday, June 16, 2026 at 23:59 (CDMX time)**

### 🤩 Most Popular Game: chosen by the community
- 💵 **$150 USD in cash**
- 🎟️ **A slot to participate in Platanus Hack 26: CDMX**
- 🎮 **Your game featured on the arcade machine**0

🏁️ Winner announced: **Wednesday, June 17, 2026 (CDMX time)**

## ⏰ Deadline & Submission

**Deadline:** Tuesday, June 16, 2026 at 23:59 (CDMX time)

### How to Submit

1. Make sure `metadata.json` has your game name, description, and `player_mode` (`single_player` or `two_player`).
2. Add a `cover.png` — exactly `800x600` pixels, `500 KB` or less.
3. Hit the **Submit** button in the dev UI and follow the steps.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
This starts a server at `http://localhost:3001` with live restriction checking.

### 3. Build Your Game
- **Edit `game.js`** - Write your arcade game code
- **Update `metadata.json`** - Set your game name, description, and `player_mode` (`single_player` or `two_player`)
- **Create `cover.png`** - Design a custom PNG cover image for your game that is exactly `800x600` pixels and `500 KB` or less
- **Watch the dev server** - It shows live updates on file size and restrictions

---

## 🤖 Vibecoding Your Game

This challenge is designed for vibecoding — use **Claude Code, Codex, Cursor,** or any AI coding tool you like.

The repo includes `AGENTS.md` with pre-loaded context about the restrictions, controls, and storage so your AI hits the ground running. It also includes `docs/phaser-quick-start.md` and `docs/phaser-api.md` as reference.

Just describe what game you want to build and let it rip.

---

## 📋 Restrictions

Your game must comply with these technical restrictions:

### Size Limit
- ✅ **Maximum 50KB after minification**
- The game code is automatically minified - focus on writing good code

### Code Restrictions
- ✅ **Pure vanilla JavaScript only** - No `import` or `require` statements
- ✅ **No external URLs** - No `http://`, `https://`, or `//` (except `data:` URIs for base64)
- ✅ **No network calls** - No `fetch`, `XMLHttpRequest`, or similar APIs
- ✅ **Sandboxed environment** - Game runs in an iframe with no internet access
- ✅ **No direct browser storage required** - `/26/arcade` exposes a parent bridge so you can persist JSON without `allow-same-origin`

### What You CAN Use
- ✅ **Phaser 3** (v3.87.0) - Loaded externally via CDN (not counted in size limit)
- ✅ **Base64-encoded images** - Using `data:` URIs
- ✅ **Procedurally generated graphics** - Using Phaser's Graphics API
- ✅ **Generated audio tones** - Using Phaser's Web Audio API
- ✅ **Canvas-based rendering and effects**

---

## 🕹️ Controls

Your game will run on a real arcade cabinet with physical joysticks and buttons!

![Arcade Button Layout](https://hack.platan.us/assets/images/arcade/button-layout-26.webp)

## Arcade Button Mapping

The arcade cabinet sends specific key codes when buttons are pressed:

**Player 1:**
- **Joystick**: `P1_U`, `P1_D`, `P1_L`, `P1_R` (Up, Down, Left, Right)
- **Action Buttons**: `P1_1`, `P1_2`, `P1_3` (top row) / `P1_4`, `P1_5`, `P1_6` (bottom row)
- **Start**: `START1`

**Player 2:**
- **Joystick**: `P2_U`, `P2_D`, `P2_L`, `P2_R`
- **Action Buttons**: `P2_1`, `P2_2`, `P2_3` / `P2_4`, `P2_5`, `P2_6`
- **Start**: `START2`

## Testing Locally

Each arcade button maps to an array of keyboard keys in `CABINET_KEYS`. To add local testing shortcuts, **append** keys to any array — don't replace the existing ones, as they map to the physical cabinet buttons.

By default:
- Player 1 uses **WASD** (joystick) and **U/I/O/J/K/L** (action buttons)
- Player 2 uses **Arrow Keys** (joystick) and **R/T/Y/F/G/H** (action buttons)

💡 **Tip**: Keep controls simple - design for joystick + 1-2 action buttons for the best arcade experience!

> ⚠️ **Do NOT modify the `CABINET_KEYS` mapping in game.js.** It matches the physical arcade cabinet wiring. Changing it will break your game on the real machine. Use the arcade codes (`P1_U`, `P1_1`, etc.) in your game logic, not raw keyboard keys.

---

## 💾 Storage

Your game can persist data (e.g. leaderboards, high scores) using these functions:

```js
const result = await window.platanusArcadeStorage.get('my-key');  // { found, value }
await window.platanusArcadeStorage.set('my-key', { score: 100 });
await window.platanusArcadeStorage.remove('my-key');
```

---

## 🎯 Reference: Barebones Game Structure

A minimal working example with two-player input, sound, and storage. Use this as a starting point.

<details>
<summary>Click to expand full example (~140 lines)</summary>

```javascript
// Platanus Hack 26 — Arcade Starter
// Two squares that move around. Replace this with your game!

const W = 800;
const H = 600;

// Arcade cabinet button → keyboard key mapping.
// The physical cabinet sends these exact key codes.
// DO NOT modify this mapping — it matches the real arcade cabinet wiring.
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
    KEY_TO_ARCADE[key.length === 1 ? key.toLowerCase() : key] = code;
  }
}

const held = Object.create(null);

window.addEventListener('keydown', (e) => {
  const code = KEY_TO_ARCADE[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (code) held[code] = true;
});
window.addEventListener('keyup', (e) => {
  const code = KEY_TO_ARCADE[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (code) held[code] = false;
});

// --- Storage helpers (uses arcade bridge or falls back to localStorage) ---

function getStorage() {
  if (window.platanusArcadeStorage) return window.platanusArcadeStorage;
  return {
    async get(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null
          ? { found: false, value: null }
          : { found: true, value: JSON.parse(raw) };
      } catch { return { found: false, value: null }; }
    },
    async set(key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
  };
}

async function loadData(key) { return getStorage().get(key); }
async function saveData(key, value) { return getStorage().set(key, value); }

// --- Game ---

const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-root',
  backgroundColor: '#111111',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create, update },
};

new Phaser.Game(config);

function create() {
  // Player 1: yellow-green — WASD + U/I/O/J/K/L
  this.p1 = this.add.rectangle(W / 3, H / 2, 32, 32, 0xe1ff00);
  // Player 2: pink — Arrows + R/T/Y/F/G/H
  this.p2 = this.add.rectangle((W * 2) / 3, H / 2, 32, 32, 0xff6ec7);

  this.add.text(W / 2, 20, 'P1: WASD    P2: ARROWS', {
    fontFamily: 'monospace', fontSize: '14px', color: '#555555',
  }).setOrigin(0.5);

  this.moveTimer = 0;

  // Generate a soft tick sound — a sine blip with fast decay
  const ctx = this.sound.context;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * 0.015);
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    data[i] = Math.sin(t * 3200 * Math.PI) * 0.15 * (1 - i / len);
  }
  this.tickBuffer = buf;

  // Load persisted positions
  loadData('starter-pos').then((result) => {
    if (result.found && result.value) {
      if (result.value.p1) { this.p1.x = result.value.p1.x; this.p1.y = result.value.p1.y; }
      if (result.value.p2) { this.p2.x = result.value.p2.x; this.p2.y = result.value.p2.y; }
    }
  });
}

function update(time) {
  const step = 4;
  let moved = false;

  // Player 1 movement
  if (held.P1_L) { this.p1.x -= step; moved = true; }
  if (held.P1_R) { this.p1.x += step; moved = true; }
  if (held.P1_U) { this.p1.y -= step; moved = true; }
  if (held.P1_D) { this.p1.y += step; moved = true; }

  // Player 2 movement
  if (held.P2_L) { this.p2.x -= step; moved = true; }
  if (held.P2_R) { this.p2.x += step; moved = true; }
  if (held.P2_U) { this.p2.y -= step; moved = true; }
  if (held.P2_D) { this.p2.y += step; moved = true; }

  // Wrap around screen edges
  this.p1.x = Phaser.Math.Wrap(this.p1.x, 0, W);
  this.p1.y = Phaser.Math.Wrap(this.p1.y, 0, H);
  this.p2.x = Phaser.Math.Wrap(this.p2.x, 0, W);
  this.p2.y = Phaser.Math.Wrap(this.p2.y, 0, H);

  // Soft tick on movement (throttled)
  if (moved && time > this.moveTimer) {
    const ctx = this.sound.context;
    const src = ctx.createBufferSource();
    src.buffer = this.tickBuffer;
    src.connect(ctx.destination);
    src.start();
    this.moveTimer = time + 120;
  }

  // Save positions every second
  if (moved && time > (this._lastSave || 0) + 1000) {
    this._lastSave = time;
    saveData('starter-pos', {
      p1: { x: this.p1.x, y: this.p1.y },
      p2: { x: this.p2.x, y: this.p2.y },
    });
  }
}
```

</details>
