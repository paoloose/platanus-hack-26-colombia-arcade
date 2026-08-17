// Platanus Hack 26 — Bogotá Edition
// Minimal demo: a single scene with one button and its callback.

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const RETRO_SONG = "103|     II>>IITTIHRRRBBB AFFHFFFHGIFFFHDGII>>JITTTTRRRQ QLMMLJJOOKJCCDC   CCCCDHHH HHF=BB  IGGAAA    ::::===IIHHHNNHHF==    ::AAHHKHH::::==>  ;;;HGGGHGGGGGGGFGG RRSGHSSSHHGGHTTTHGGGHHGGFGGGFTTTQRGGGGGGHHHII      IHIH:;;:  :::MMMIIHHH:GHJJJKLNNL|     333:338888666556 :99:565.01331.....3  9888866666666776656657885   88889888881111122155555556..../55...8888881111111155556556.....5777 4338881111067700001566./...776443338882112277700000566....2!!!!!!!!!!!!66:.............667...../0.....|      S S SS S S  S   H   K    KK  S   S S SS S S  S  SH     S  S S    S SHH HHHSHH H  H  HH HH  SHHHHH  HHH HHHSHH H H  HH HH   S HH HH H  H HHHHHHHS SHHH HH HHH HHHS HHHHH HHHH HHH SSHH   H  S    H             S HHSSHHSHHHH SSSS HHS HHHHHH";

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#0b0f03',
  scene: {
    create,
  },
};

new Phaser.Game(config);

function create() {
  const scene = this;

  const button = scene.add
    .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CLICK ME', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#e1ff00',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  button.on('pointerdown', () => {
    button.setText('CLICKED!');
    playRetro(RETRO_SONG);
  });
}

function playRetro(data) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const parts = data.split('|');
  const bpm = parseInt(parts[0], 10) || 110;
  const melody = parts[1] || '';
  const bass = parts[2] || '';
  const drums = parts[3] || '';
  const stepTime = 60 / bpm / 4;
  const now = ctx.currentTime + 0.05;
  const baseNote = 24;
  const alphabet = "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function scheduleVoice(seq, type, gainVal, cutoffHz) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoffHz;
    filter.connect(ctx.destination);

    for (let i = 0; i < seq.length; i++) {
      const c = seq[i];
      if (c === ' ') continue;
      const idx = alphabet.indexOf(c);
      if (idx < 0) continue;
      const midi = baseNote + idx;
      const freq = midiToFreq(midi);
      const t = now + i * stepTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gainVal, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 0.9);
      osc.connect(g);
      g.connect(filter);
      osc.start(t);
      osc.stop(t + stepTime);
    }
  }

  scheduleVoice(melody, 'sawtooth', 0.08, 2800);
  scheduleVoice(bass, 'triangle', 0.18, 500);

  // Drums derived from the original onsets
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

  const totalSteps = Math.max(melody.length, bass.length, drums.length);
  for (let i = 0; i < totalSteps; i++) {
    const t = now + i * stepTime;
    const d = drums[i] || ' ';

    if (d === 'K' || d === 'X') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }

    if (d === 'S' || d === 'X') {
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1800;
      f.Q.value = 1.2;
      src.buffer = noiseBuffer;
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      src.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.12);
    }

    if (d === 'H') {
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 6000;
      src.buffer = noiseBuffer;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      src.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.05);
    }
  }
}
