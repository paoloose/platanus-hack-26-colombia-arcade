const fs = require('fs');
const { execSync } = require('child_process');

const code = fs.readFileSync('game.js', 'utf8');

const features = [
  { name: 'Constants & Tuning', regex: /\/\* === GAMEPLAY & DIFFICULTY TUNING.*?\/\* ======================================================================== \*\//s },
  { name: 'MIDI Song: Loba', regex: /var MIDI_SONG_LOBA = "[^"]+";/ },
  { name: 'MIDI Song: Barranquilla', regex: /var MIDI_SONG_BARRANQUILLA = "[^"]+";/ },
  { name: 'MIDI Song: Fruko', regex: /var MIDI_SONG_FRUKO_Y_SUS_TESOS = "[^"]+";/ },
  { name: 'MIDI Song: Nuestra Cancion', regex: /var MIDI_SONG_NUESTRA_CANCION = "[^"]+";/ },
  { name: 'Song Metadata', regex: /const SONGS = \[.*?\];/s },
  { name: 'Input Handling', regex: /const CABINET_KEYS = \{.*?\};.*?function clearInputs\(\) \{.*?\}/s },
  { name: 'Colors & Engine (CSEF, sp, dsp)', regex: /\/\* === COLORS === \*\/.+?function dsp\(.*?^\}/sm },
  { name: 'Arrow Sprite & drawArrow', regex: /\/\* === ARROW SPRITE.*?function drawArrow\(.*?^\}/sm },
  { name: 'Dancers Sprites (CSEF Strings)', regex: /const DANCERS = \[.*?\];/s },
  { name: 'Title Sprite (CSEF String)', regex: /const TITLE_SPRITE = sp\(.*?\]\);/s },
  { name: 'Game State & Globals', regex: /const STATE = \{.*?G\.aiPicking.*?;/s },
  { name: 'Phaser Init & updateStagePlayer', regex: /new Phaser\.Game\(.*?function updateStagePlayer\(.*?^\}/sm },
  { name: 'Phaser Create (Init scene)', regex: /function create\(\).*?^\}/sm },
  { name: 'Background Art (Sky, Clouds)', regex: /function drawBackground\(.*?^\}/sm },
  { name: 'Stage Art (Mountains, Buildings, Houses)', regex: /function drawStage\(.*?^\}/sm },
  { name: 'Floor Art', regex: /function drawFloor\(.*?^\}/sm },
  { name: 'Pattern BG Art', regex: /function drawPatternBg\(.*?^\}/sm },
  { name: 'HUD & UI Art (TugBar, Arrows)', regex: /function drawTugBar\(.*?function drawArrowGfx\(.*?^\}/sm },
  { name: 'Title Screen Logic', regex: /function drawTitleScreen\(.*?function updateTitleMode\(.*?^\}/sm },
  { name: 'Character Selection Logic', regex: /function drawCharSelScreen\(.*?function updateCharSel\(.*?^\}/sm },
  { name: 'Song Selection Logic', regex: /function drawSongSelScreen\(.*?function updateSongSel\(.*?^\}/sm },
  { name: 'Difficulty Selection Logic', regex: /function drawDiffSelScreen\(.*?function updateDiffSel\(.*?^\}/sm },
  { name: 'Splash Screen Logic', regex: /function drawSplashScreen\(.*?^\}/sm },
  { name: 'Win Screen Logic', regex: /function showWinScreen\(.*?function updateWinScreen\(.*?^\}/sm },
  { name: 'Battle Engine (startBattle, countdown)', regex: /function startBattle\(.*?function startCountdown\(.*?^\}/sm },
  { name: 'Battle Update Loop & Notes', regex: /function updateBattle\(.*?function checkHits\(.*?^\}/sm },
  { name: 'Feedback (Hits, Combo, Explosions)', regex: /function showFeedback\(.*?function checkComboText\(.*?^\}/sm },
  { name: 'Main Update Loop', regex: /function update\(.*?^\}/sm },
  { name: 'MIDI Base91 Unpack', regex: /async function unpack\(.*?^\}/sm },
  { name: 'MIDI Player & Decoder', regex: /function decode\(.*?function generateWave\(.*?^\}/sm }
];

let totalMinified = 0;
console.log('Feature Size Analysis (Minified):\n');

for (const feat of features) {
  let match = code.match(feat.regex);
  if (match) {
    const text = match[0];
    fs.writeFileSync('temp.js', text);
    try {
      execSync('npx esbuild temp.js --minify --outfile=temp.min.js');
      const minSize = fs.statSync('temp.min.js').size;
      console.log(`${feat.name}: ${minSize} bytes (${(minSize/1024).toFixed(2)} KB)`);
      totalMinified += minSize;
    } catch (e) {
      console.log(`${feat.name}: Error minifying`);
    }
  } else {
    console.log(`${feat.name}: Not found`);
  }
}

console.log(`\nTotal Accounted Minified Size: ${(totalMinified/1024).toFixed(2)} KB`);
