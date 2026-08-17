# AI Agent Instructions for Platanus Hack 26: Arcade Challenge

You are helping build an arcade game for a hackathon challenge. Follow these instructions carefully.

## Your Goal

Create an engaging, fun arcade game in **game.js** using **Phaser 3** (v3.87.0) that meets all restrictions.

## ⚠️ IMPORTANT: Files to Edit

**ONLY edit these three files:**
- `game.js` - Your game code
- `metadata.json` - Game name, description, and player mode
- `cover.png` - Game cover image (800x600 pixels)

**DO NOT edit any other files** (including index.html, check-restrictions files, config files, etc.)

## Critical Restrictions

1. **Size**: Game must be ≤50KB after minification (before gzip)
2. **No imports**: Pure vanilla JavaScript only - no `import` or `require`
3. **No external URLs**: No `http://`, `https://`, or `//` (except `data:` URIs for base64)
4. **No network calls**: No `fetch`, `XMLHttpRequest`, or similar
5. **Sandboxed environment**: Game runs in iframe with no internet access

## What's Allowed

-  Base64-encoded images (as `data:` URIs)
-  Procedurally generated graphics using Phaser's Graphics API
-  Generated audio tones using Phaser's Web Audio API
-  Canvas-based rendering and effects

## Development Workflow

1. **Edit game.js**: Write your game code in this single file
2. **Update metadata.json**: Set `game_name`, `description`, and `player_mode` (`single_player` or `two_player`)
3. **Create cover.png**: Design an 800x600 pixel cover image for your game
4. **Check restrictions**: Run `npm run check-restrictions` frequently
5. **DO NOT start dev servers**: The user will handle running `npm run dev` - do not run it yourself

## Phaser 3 Resources

- **Quick start guide**: @docs/phaser-quick-start.md
- **API documentation**: For specific Phaser methods and examples, search within docs/phaser-api.md

## Size Optimization Tips

- Use short variable names before minification
- Avoid large data structures or arrays
- Generate graphics procedurally instead of embedding images
- Keep game logic simple and efficient
- Test size early and often with `npm run check-restrictions`

## Validation

Always validate your work:
```bash
npm run check-restrictions
```

This checks:
- File size after minification
- No forbidden imports
- No network calls
- No external URLs
- Code safety warnings

## Game Structure

`game.js` already contains a full working starter — two players moving around with sound and storage. Use it as your base. A copy is also in the README for reference.

## Controls

- Use the arcade codes (`P1_U`, `P1_1`, `START1`, etc.) in your game logic — never raw keyboard keys
- **Do NOT change or replace existing keys in `CABINET_KEYS`** — they map to the physical cabinet wiring. To add local testing shortcuts, append to the arrays (e.g. `P1_U: ['w', 'ArrowUp']`)
- Keep controls simple: joystick + 1–2 action buttons is the sweet spot for arcade feel

## Storage

Use `window.platanusArcadeStorage` for persistence (e.g. leaderboards):

```js
const result = await window.platanusArcadeStorage.get('my-key'); // { found, value }
await window.platanusArcadeStorage.set('my-key', { score: 100 });
await window.platanusArcadeStorage.remove('my-key');
```

- Storage persists across releases — always validate data you read back, the shape may have changed
- Keys: `[A-Za-z0-9._:/-]`, 1–128 chars; values: JSON-compatible, under 64 KiB

## cover.png

- Must be exactly **800×600 pixels**, PNG format, **500 KB or less**
- Generate it programmatically or draw it — just make it represent your game

## Important Notes

- Phaser is loaded externally via CDN (not counted in 50KB limit)
- Focus on gameplay and creativity within size constraints
- Use Phaser's built-in features (sprites, physics, tweens, etc.)
- Keep code readable - minification happens automatically

## Best Practices

1. **Start simple**: Get a working game first, optimize later
2. **Check size frequently**: Don't wait until the end
3. **Use Phaser features**: Leverage built-in physics, tweens, and effects
4. **Generate assets**: Draw shapes instead of using images when possible
5. **Let the user test**: The user will run `npm run dev` when they want to test - focus on building the game

Good luck building an amazing arcade game! <�
