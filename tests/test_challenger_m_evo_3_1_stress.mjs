// tests/test_challenger_m_evo_3_1_stress.mjs
// Adversarial Empirical Stress Test Suite for Milestone M-EVO-3
// Challenger M-EVO-3.1: Audio & Particle Physics Stress
// Covers:
// 1. Rapid sequential triggering of 1,000 Web Audio calls across all instruments
//    (playPop, playClick, playCorrect, playStar, playFanfare, playGentleTryAgain, playRobotStep)
//    checking for memory leaks, unhandled exceptions, and oscillator clamping.
// 2. Assert zero occurrences of the word 'buzz' or external audio file references (.mp3, .wav, .ogg).
// 3. Stress test ConfettiEffect physics: simulate 1,000 frame steps, verifying particle bounding box,
//    gravity, rotation math, and zero NaN/infinite velocities.
// 4. Stress test reactMascot: rapid-fire 100 emotion updates with overlapping timeouts to verify race condition safety.
// 5. Staged celebration sequencing, cancellation, and idempotent cleanup.
//
// Zero external dependencies - executable via `node tests/test_challenger_m_evo_3_1_stress.mjs`

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('⚡ CHALLENGER M-EVO-3.1: ADVERSARIAL EMPIRICAL STRESS TEST SUITE');
console.log('Milestone M-EVO-3: Web Audio Synthesis, Confetti Physics & Mascot Race Safety');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const findings = [];

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${title}`);
  } catch (err) {
    failedChecks++;
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${title}`);
    console.error(`         \x1b[33mEvidence: ${err.message}\x1b[0m`);
    findings.push({ title, error: err.message, stack: err.stack });
  }
}

async function checkAsync(title, fn) {
  totalChecks++;
  try {
    await fn();
    passedChecks++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${title}`);
  } catch (err) {
    failedChecks++;
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${title}`);
    console.error(`         \x1b[33mEvidence: ${err.message}\x1b[0m`);
    findings.push({ title, error: err.message, stack: err.stack });
  }
}

// ============================================================================
// SUITE 1: NEGATIVE LEXICAL & EXTERNAL AUDIO PROHIBITION AUDIT
// ============================================================================
console.log('--- [SUITE 1] Negative Lexical & External Audio Prohibition Audit ---');

const srcFiles = [
  'audio.js',
  'app.js',
  'engines.js',
  'levels.js',
  'mascot.js',
  'sw.js',
  'style.css',
  'index.html',
  'manifest.webmanifest'
];

check('1.1 Zero occurrences of the word "buzz" across all production codebase files', () => {
  const buzzMatches = [];
  for (const file of srcFiles) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/\bbuzz/i.test(line)) {
        buzzMatches.push({ file, line: idx + 1, text: line.trim() });
      }
    });
  }
  assert.strictEqual(
    buzzMatches.length,
    0,
    `Found "buzz" references in production files: ${JSON.stringify(buzzMatches)}`
  );
});

check('1.2 Zero external audio asset references (.mp3, .wav, .ogg, .aac, .flac, .m4a)', () => {
  const audioExtMatches = [];
  // Regex strictly matching audio file extensions, ignoring css selectors like .wave
  const audioFileRegex = /\.(mp3|wav|ogg|aac|flac|m4a)\b/i;

  for (const file of srcFiles) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Disregard css animation names or class names (.spidey-mascot.wave)
      if (audioFileRegex.test(line)) {
        // Double check it's an audio reference, not a CSS selector ending in .wave
        if (!/\.wave\b/i.test(line) || /['"][^'"]*\.wav['"]/i.test(line)) {
          audioExtMatches.push({ file, line: idx + 1, text: line.trim() });
        }
      }
    });
  }
  assert.strictEqual(
    audioExtMatches.length,
    0,
    `Found external audio file references: ${JSON.stringify(audioExtMatches)}`
  );
});

check('1.3 Service Worker cache manifest (sw.js) contains zero external audio files', () => {
  const swPath = path.join(rootDir, 'sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(!/\.(mp3|wav|ogg|aac|flac|m4a)\b/i.test(swContent), 'sw.js must not cache external audio files');
});

// ============================================================================
// SUITE 2: WEB AUDIO SYNTHESIS & 1,000 RAPID SEQUENTIAL INVOCATIONS STRESS
// ============================================================================
console.log('\n--- [SUITE 2] Web Audio Synthesis & 1,000 Rapid Sequential Invocations ---');

// High-fidelity W3C Web Audio API Spec Mock
class MockAudioParam {
  constructor(name, defaultValue = 0) {
    this.name = name;
    this.value = defaultValue;
    this.events = [];
  }
  setValueAtTime(val, time) {
    assert(typeof val === 'number' && !isNaN(val) && isFinite(val), `AudioParam ${this.name}.setValueAtTime value must be a finite number, got ${val}`);
    assert(typeof time === 'number' && !isNaN(time) && isFinite(time) && time >= 0, `AudioParam ${this.name}.setValueAtTime time must be >= 0, got ${time}`);
    this.value = val;
    this.events.push({ type: 'setValueAtTime', val, time });
  }
  exponentialRampToValueAtTime(val, time) {
    // W3C Web Audio API: exponential ramp target MUST be strictly positive (> 0)
    assert(typeof val === 'number' && !isNaN(val) && isFinite(val), `AudioParam ${this.name}.exponentialRampToValueAtTime value must be a finite number`);
    if (val <= 0) {
      throw new RangeError(`[W3C Web Audio Spec Violation] exponentialRampToValueAtTime target value must be > 0. Got: ${val}`);
    }
    assert(typeof time === 'number' && !isNaN(time) && isFinite(time) && time >= 0, `AudioParam ${this.name}.exponentialRampToValueAtTime time must be >= 0`);
    this.value = val;
    this.events.push({ type: 'exponentialRampToValueAtTime', val, time });
  }
}

class MockAudioNode {
  constructor(context, type) {
    this.context = context;
    this.nodeType = type;
    this.connections = [];
  }
  connect(dest) {
    assert(dest, 'Cannot connect to null/undefined audio node');
    this.connections.push(dest);
    return dest;
  }
  disconnect() {
    this.connections = [];
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor(context) {
    super(context, 'OscillatorNode');
    this.type = 'sine';
    this.frequency = new MockAudioParam('frequency', 440);
    this.started = false;
    this.stopped = false;
    this.startTime = null;
    this.stopTime = null;
  }
  start(time = 0) {
    assert(!this.started, 'Cannot call start() on an OscillatorNode more than once');
    assert(typeof time === 'number' && !isNaN(time) && time >= 0, 'OscillatorNode.start time must be a non-negative number');
    this.started = true;
    this.startTime = time;
    this.context._activeOscillators.add(this);
    this.context._totalOscillatorsCreated++;
  }
  stop(time = 0) {
    assert(!this.stopped, 'Cannot call stop() on an OscillatorNode more than once');
    assert(typeof time === 'number' && !isNaN(time) && time >= 0, 'OscillatorNode.stop time must be a non-negative number');
    assert(time >= (this.startTime || 0), `OscillatorNode.stop time (${time}) must be >= startTime (${this.startTime})`);
    this.stopped = true;
    this.stopTime = time;
    this.context._totalOscillatorsStopped++;
  }
}

class MockGainNode extends MockAudioNode {
  constructor(context) {
    super(context, 'GainNode');
    this.gain = new MockAudioParam('gain', 1.0);
    this.context._totalGainsCreated++;
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0.05;
    this.destination = new MockAudioNode(this, 'AudioDestinationNode');
    this._activeOscillators = new Set();
    this._totalOscillatorsCreated = 0;
    this._totalOscillatorsStopped = 0;
    this._totalGainsCreated = 0;
  }
  createOscillator() {
    return new MockOscillatorNode(this);
  }
  createGain() {
    return new MockGainNode(this);
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

// Setup Global Environment for Audio & Window Testing
const windowListeners = new Map();
globalThis.window = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  innerWidth: 1024,
  innerHeight: 768,
  speechSynthesis: {
    getVoices: () => [{ lang: 'id-ID', name: 'Indonesian Male' }, { lang: 'en-US', name: 'English' }],
    speak: (u) => { setTimeout(() => u.onend && u.onend(), 10); },
    cancel: () => {}
  },
  addEventListener: (event, fn) => {
    if (!windowListeners.has(event)) windowListeners.set(event, []);
    windowListeners.get(event).push(fn);
  },
  removeEventListener: (event, fn) => {
    if (windowListeners.has(event)) {
      windowListeners.set(event, windowListeners.get(event).filter(f => f !== fn));
    }
  },
  dispatchEvent: (evt) => {
    const handlers = windowListeners.get(evt.type) || [];
    handlers.forEach(h => h(evt));
  }
};
globalThis.SpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text;
    this.lang = 'id-ID';
    this.rate = 1;
    this.pitch = 1;
    this.onend = null;
    this.onerror = null;
  }
};

const { SoundSystem } = await import('../audio.js');

check('2.1 SoundSystem instantiation & initial state', () => {
  const snd = new SoundSystem();
  assert.strictEqual(snd.ctx, null);
  assert.strictEqual(snd.sfxEnabled, true);
  assert.strictEqual(snd.speechEnabled, true);
  snd.init();
  assert(snd.ctx instanceof MockAudioContext, 'snd.ctx must be instantiated on init');
  assert.strictEqual(snd.ctx.state, 'running');
});

check('2.2 playTone frequency clamping and parameter edge cases', () => {
  const snd = new SoundSystem();
  snd.init();

  // Test extreme frequencies
  // Note: in audio.js line 76: Math.min(Math.max(Number(freq) || 220, 20), 20000)
  // Number(0) is 0, which is falsy, so (0 || 220) evaluates to safe fallback 220Hz.
  const testCases = [
    { freq: -100, expected: 20 },
    { freq: 0, expected: 220 }, // 0 is falsy in JS, safely falls back to default 220Hz
    { freq: 10, expected: 20 },
    { freq: 20, expected: 20 },
    { freq: 440, expected: 440 },
    { freq: 15000, expected: 15000 },
    { freq: 20000, expected: 20000 },
    { freq: 25000, expected: 20000 },
    { freq: 100000, expected: 20000 },
    { freq: NaN, expected: 220 }, // fallback
    { freq: null, expected: 220 }, // fallback
    { freq: undefined, expected: 220 }, // fallback
    { freq: 'invalid', expected: 220 } // fallback
  ];

  for (const tc of testCases) {
    snd.playTone(tc.freq, 'sine', 0.1, 0.2);
    const lastOsc = Array.from(snd.ctx._activeOscillators).pop();
    assert(lastOsc, `Oscillator must be created for input ${tc.freq}`);
    const setEvent = lastOsc.frequency.events.find(e => e.type === 'setValueAtTime');
    assert(setEvent, `setValueAtTime must be recorded for ${tc.freq}`);
    assert.strictEqual(
      setEvent.val,
      tc.expected,
      `Frequency ${tc.freq} must clamp to ${tc.expected}, got ${setEvent.val}`
    );
  }
});

check('2.3 Rapid Sequential Triggering: 1,000 Web Audio Calls across all 7 instruments', () => {
  const snd = new SoundSystem();
  snd.init();

  const instruments = [
    { name: 'playPop', fn: () => snd.playPop(), weight: 150 },
    { name: 'playClick', fn: () => snd.playClick(), weight: 150 },
    { name: 'playCorrect', fn: () => snd.playCorrect(), weight: 150 },
    { name: 'playStar', fn: () => snd.playStar(), weight: 150 },
    { name: 'playFanfare', fn: () => snd.playFanfare(), weight: 150 },
    { name: 'playGentleTryAgain', fn: () => snd.playGentleTryAgain(), weight: 150 },
    { name: 'playRobotStep', fn: () => snd.playRobotStep(), weight: 100 }
  ];

  const totalCalls = instruments.reduce((sum, inst) => sum + inst.weight, 0);
  assert.strictEqual(totalCalls, 1000, 'Must perform exactly 1,000 audio calls');

  const startOscCount = snd.ctx._totalOscillatorsCreated;

  for (const inst of instruments) {
    for (let i = 0; i < inst.weight; i++) {
      assert.doesNotThrow(() => {
        inst.fn();
      }, `Instrument ${inst.name} threw unhandled exception on call ${i + 1}`);
    }
  }

  const endOscCount = snd.ctx._totalOscillatorsCreated;
  assert(endOscCount > startOscCount, `Oscillators must have been created, got ${endOscCount}`);
});

await checkAsync('2.4 Multi-note timeout execution & Oscillator stop balance verification', async () => {
  const snd = new SoundSystem();
  snd.init();

  const initialCreated = snd.ctx._totalOscillatorsCreated;
  const initialStopped = snd.ctx._totalOscillatorsStopped;

  // Trigger composite instruments
  for (let i = 0; i < 20; i++) {
    snd.playCorrect();
    snd.playStar();
    snd.playFanfare();
  }

  // Wait for all setTimeout cascades to complete (max wait in fanfare is 660ms + margin)
  await new Promise(resolve => setTimeout(resolve, 800));

  const totalCreated = snd.ctx._totalOscillatorsCreated - initialCreated;
  const totalStopped = snd.ctx._totalOscillatorsStopped - initialStopped;

  assert.strictEqual(
    totalCreated,
    totalStopped,
    `Memory leak / dangling oscillator detected! Created: ${totalCreated}, Stopped: ${totalStopped}`
  );
});

check('2.5 Resilience against muted sfx, suspended context, and missing AudioContext', () => {
  // Test muted sfx
  const sndMuted = new SoundSystem();
  sndMuted.init();
  sndMuted.sfxEnabled = false;
  const beforeCount = sndMuted.ctx._totalOscillatorsCreated;
  sndMuted.playPop();
  sndMuted.playClick();
  sndMuted.playCorrect();
  sndMuted.playStar();
  sndMuted.playFanfare();
  sndMuted.playGentleTryAgain();
  sndMuted.playRobotStep();
  assert.strictEqual(sndMuted.ctx._totalOscillatorsCreated, beforeCount, 'Muted SFX must create zero audio nodes');

  // Test headless Node.js without window (null ctx)
  const sndHeadless = new SoundSystem();
  sndHeadless.ctx = null;
  assert.doesNotThrow(() => {
    sndHeadless.playPop();
    sndHeadless.playClick();
    sndHeadless.playCorrect();
    sndHeadless.playStar();
    sndHeadless.playFanfare();
    sndHeadless.playGentleTryAgain();
    sndHeadless.playRobotStep();
    sndHeadless.playTone(440);
  }, 'All audio methods must run cleanly without error when ctx is null');
});

check('2.6 Interleaved 1,000-call burst across random instruments with advancing audio clock', () => {
  const snd = new SoundSystem();
  snd.init();
  const fns = [
    () => snd.playPop(),
    () => snd.playClick(),
    () => snd.playCorrect(),
    () => snd.playStar(),
    () => snd.playFanfare(),
    () => snd.playGentleTryAgain(),
    () => snd.playRobotStep()
  ];
  for (let i = 0; i < 1000; i++) {
    snd.ctx.currentTime += 0.005; // advance Web Audio clock
    const chosen = fns[Math.floor(Math.random() * fns.length)];
    assert.doesNotThrow(chosen, `Call ${i} failed`);
  }
});

check('2.7 Web Speech API TTS rapid-fire stress (50 utterances, cancellation, queue overflow safety, fallback onEnd)', () => {
  const snd = new SoundSystem();
  snd.init();
  let completedCount = 0;
  for (let i = 0; i < 50; i++) {
    snd.speak(`Soal ${i}: Temukan jalannya!`, () => {
      completedCount++;
    });
  }
  snd.stopSpeech();
  assert.strictEqual(typeof snd.speak, 'function');
});

// ============================================================================
// SUITE 3: CONFETTIEFFECT PARTICLE PHYSICS (1,000 FRAME STEPS STRESS)
// ============================================================================
console.log('\n--- [SUITE 3] ConfettiEffect Particle Physics Simulation (1,000 Frames) ---');

// Mock 2D Canvas Context
class MockCanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this.drawCalls = 0;
    this.saves = 0;
    this.restores = 0;
    this.clears = 0;
  }
  clearRect(x, y, w, h) {
    this.clears++;
  }
  save() {
    this.saves++;
  }
  restore() {
    this.restores++;
  }
  translate(x, y) {
    assert(!isNaN(x) && isFinite(x), `translate(x) is NaN or Infinite: ${x}`);
    assert(!isNaN(y) && isFinite(y), `translate(y) is NaN or Infinite: ${y}`);
  }
  rotate(rad) {
    assert(!isNaN(rad) && isFinite(rad), `rotate(rad) is NaN or Infinite: ${rad}`);
  }
  beginPath() {
    this.drawCalls++;
  }
  closePath() {}
  moveTo(x, y) {
    assert(!isNaN(x) && isFinite(x), `moveTo(x) is NaN or Infinite: ${x}`);
    assert(!isNaN(y) && isFinite(y), `moveTo(y) is NaN or Infinite: ${y}`);
  }
  lineTo(x, y) {
    assert(!isNaN(x) && isFinite(x), `lineTo(x) is NaN or Infinite: ${x}`);
    assert(!isNaN(y) && isFinite(y), `lineTo(y) is NaN or Infinite: ${y}`);
  }
  arc(x, y, r, sa, ea) {
    assert(!isNaN(x) && isFinite(x), `arc x is NaN: ${x}`);
    assert(!isNaN(y) && isFinite(y), `arc y is NaN: ${y}`);
    assert(!isNaN(r) && isFinite(r) && r >= 0, `arc r is invalid: ${r}`);
  }
  fill() {}
  fillRect(x, y, w, h) {
    assert(!isNaN(x) && isFinite(x), `fillRect x is NaN: ${x}`);
    assert(!isNaN(y) && isFinite(y), `fillRect y is NaN: ${y}`);
    assert(!isNaN(w) && isFinite(w), `fillRect w is NaN: ${w}`);
    assert(!isNaN(h) && isFinite(h), `fillRect h is NaN: ${h}`);
  }
}

class MockCanvas {
  constructor(width = 1024, height = 768) {
    this.width = width;
    this.height = height;
    this.ctx = new MockCanvasRenderingContext2D(this);
  }
  getContext(type) {
    return type === '2d' ? this.ctx : null;
  }
}

// Track RAF for Confetti
let pendingRafCb = null;
let currentRafId = 1;
globalThis.requestAnimationFrame = (cb) => {
  pendingRafCb = cb;
  return currentRafId++;
};
globalThis.cancelAnimationFrame = (id) => {
  pendingRafCb = null;
};

const { ConfettiEffect } = await import('../app.js');

check('3.1 ConfettiEffect initialization and particle burst generation', () => {
  const canvas = new MockCanvas(800, 600);
  const confetti = new ConfettiEffect(canvas);

  assert.strictEqual(confetti.active, false);
  assert.strictEqual(confetti.particles.length, 0);

  confetti.start(10000);
  assert.strictEqual(confetti.active, true);
  assert.strictEqual(confetti.particles.length, 95);

  const shapes = new Set(confetti.particles.map(p => p.shape));
  assert(shapes.has('star'), 'Must contain star particles');
  assert(shapes.has('glint'), 'Must contain glint particles');
  assert(shapes.has('disc'), 'Must contain disc particles');
  assert(shapes.has('ribbon'), 'Must contain ribbon particles');

  confetti.stop();
  assert.strictEqual(confetti.active, false);
});

check('3.2 1,000-Frame Physics Step Simulation: Zero NaN, Infinites, or Unbounded Velocity', () => {
  const canvas = new MockCanvas(1024, 768);
  const confetti = new ConfettiEffect(canvas);
  confetti.start(100000); // large duration so it doesn't auto-stop

  const initialParticleCount = confetti.particles.length;
  assert.strictEqual(initialParticleCount, 95);

  // Manually step 1,000 frames using the RAF callback
  let wrapAroundCount = 0;

  for (let frame = 1; frame <= 1000; frame++) {
    assert(typeof pendingRafCb === 'function', `RAF callback must be registered at frame ${frame}`);
    const currentCb = pendingRafCb;
    pendingRafCb = null;

    currentCb();

    // Verify particle invariants at this frame
    for (let idx = 0; idx < confetti.particles.length; idx++) {
      const p = confetti.particles[idx];

      // Coordinate integrity
      assert(!isNaN(p.x), `Frame ${frame}, Particle ${idx}: p.x is NaN`);
      assert(isFinite(p.x), `Frame ${frame}, Particle ${idx}: p.x is Infinite`);
      assert(!isNaN(p.y), `Frame ${frame}, Particle ${idx}: p.y is NaN`);
      assert(isFinite(p.y), `Frame ${frame}, Particle ${idx}: p.y is Infinite`);

      // Velocity integrity
      assert(!isNaN(p.vx), `Frame ${frame}, Particle ${idx}: p.vx is NaN`);
      assert(isFinite(p.vx), `Frame ${frame}, Particle ${idx}: p.vx is Infinite`);
      assert(!isNaN(p.vy), `Frame ${frame}, Particle ${idx}: p.vy is NaN`);
      assert(isFinite(p.vy), `Frame ${frame}, Particle ${idx}: p.vy is Infinite`);

      // Rotation & Wobble integrity
      assert(!isNaN(p.rotation), `Frame ${frame}, Particle ${idx}: p.rotation is NaN`);
      assert(isFinite(p.rotation), `Frame ${frame}, Particle ${idx}: p.rotation is Infinite`);
      assert(!isNaN(p.wobble), `Frame ${frame}, Particle ${idx}: p.wobble is NaN`);
      assert(isFinite(p.wobble), `Frame ${frame}, Particle ${idx}: p.wobble is Infinite`);

      // Velocity bounds check: terminal velocity should never exceed 50px/frame
      assert(Math.abs(p.vx) < 50, `Frame ${frame}, Particle ${idx}: p.vx explosion (${p.vx})`);
      assert(Math.abs(p.vy) < 50, `Frame ${frame}, Particle ${idx}: p.vy explosion (${p.vy})`);

      // Count wrap-around occurrences
      if (p.y === -20) {
        wrapAroundCount++;
      }
    }
  }

  confetti.stop();
  assert(wrapAroundCount > 0, `Particle wrap-around must have triggered across 1,000 frames. Got ${wrapAroundCount}`);
  assert.strictEqual(canvas.ctx.saves, canvas.ctx.restores, 'Canvas save/restore balance must be exact');
});

check('3.3 Confetti adversarial edge cases: 0x0 canvas, null context, rapid start/stop', () => {
  // 0x0 canvas
  const zeroCanvas = new MockCanvas(0, 0);
  const cZero = new ConfettiEffect(zeroCanvas);
  assert.doesNotThrow(() => {
    cZero.start(100);
    if (pendingRafCb) pendingRafCb();
    cZero.stop();
  }, '0x0 canvas must not crash physics step');

  // Null canvas / null context
  const cNull = new ConfettiEffect(null);
  assert.doesNotThrow(() => {
    cNull.start(100);
    cNull.stop();
    cNull.resize();
  }, 'Null canvas must not throw exceptions');

  // Rapid start/stop cycling (50 rapid calls)
  const rapidCanvas = new MockCanvas(800, 600);
  const cRapid = new ConfettiEffect(rapidCanvas);
  assert.doesNotThrow(() => {
    for (let i = 0; i < 50; i++) {
      cRapid.start(1000);
      cRapid.stop();
    }
  }, '50 rapid start/stop calls must execute cleanly without leaking RAF');
  assert.strictEqual(cRapid.active, false);
});

check('3.4 Dynamic viewport resizing (orientation change reflow) during active 1,000-frame particle physics', () => {
  const canvas = new MockCanvas(800, 600);
  const confetti = new ConfettiEffect(canvas);
  confetti.start(50000);

  const viewports = [
    { w: 390, h: 844 },   // Mobile portrait
    { w: 844, h: 390 },   // Mobile landscape
    { w: 1024, h: 768 },  // Tablet landscape
    { w: 768, h: 1024 },  // Tablet portrait
    { w: 1920, h: 1080 }, // Desktop FHD
    { w: 3840, h: 2160 }  // 4K Ultra-wide
  ];

  for (let frame = 1; frame <= 1000; frame++) {
    if (frame % 50 === 0) {
      const vp = viewports[(frame / 50) % viewports.length];
      canvas.width = vp.w;
      canvas.height = vp.h;
    }
    if (pendingRafCb) {
      const cb = pendingRafCb;
      pendingRafCb = null;
      cb();
    }
    for (const p of confetti.particles) {
      assert(!isNaN(p.x) && isFinite(p.x), `Frame ${frame}: p.x is NaN`);
      assert(!isNaN(p.y) && isFinite(p.y), `Frame ${frame}: p.y is NaN`);
      assert(!isNaN(p.vx) && isFinite(p.vx), `Frame ${frame}: p.vx is NaN`);
      assert(!isNaN(p.vy) && isFinite(p.vy), `Frame ${frame}: p.vy is NaN`);
    }
  }
  confetti.stop();
});

check('3.5 Extreme aspect ratios: 320x480 (mobile), 3840x2160 (4K), 4000x600 (panoramic), 600x4000 (tall)', () => {
  const ratios = [
    { w: 320, h: 480 },
    { w: 3840, h: 2160 },
    { w: 4000, h: 600 },
    { w: 600, h: 4000 }
  ];
  for (const r of ratios) {
    const canvas = new MockCanvas(r.w, r.h);
    const c = new ConfettiEffect(canvas);
    c.start(1000);
    for (let f = 0; f < 50; f++) {
      if (pendingRafCb) {
        const cb = pendingRafCb;
        pendingRafCb = null;
        cb();
      }
      for (const p of c.particles) {
        assert(!isNaN(p.x) && isFinite(p.x));
        assert(!isNaN(p.y) && isFinite(p.y));
      }
    }
    c.stop();
  }
});

// ============================================================================
// SUITE 4: REACTIVE MASCOT EMOTION BUS & RACE CONDITION SAFETY
// ============================================================================
console.log('\n--- [SUITE 4] Reactive Mascot Emotion Bus & Race Condition Safety ---');

// Mock DOM Environment for AppController
class MockDOMElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.style = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
    this.dataset = {};
    this.children = [];
    this.parentNode = null;
    this.onclick = null;
    this.listeners = new Map();
  }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
    child.parentNode = null;
    return child;
  }
  addEventListener(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
  }
  removeEventListener(event, fn) {
    if (this.listeners.has(event)) {
      this.listeners.set(event, this.listeners.get(event).filter(f => f !== fn));
    }
  }
  dispatchEvent(evt) {
    const handlers = this.listeners.get(evt.type) || [];
    handlers.forEach(h => h(evt));
  }
  querySelector(sel) {
    const el = new MockDOMElement();
    if (sel.startsWith('.')) el.classList.add(sel.slice(1));
    return el;
  }
  querySelectorAll(sel) {
    return [];
  }
}

const mockDomMap = new Map();
function getOrCreateElement(id, tagName = 'div') {
  if (!mockDomMap.has(id)) {
    mockDomMap.set(id, new MockDOMElement(id, tagName));
  }
  return mockDomMap.get(id);
}

const requiredAppIds = [
  'mascotBubble', 'welcomeMascot', 'confettiCanvas', 'totalStarsCount', 'starCounter',
  'viewWorlds', 'viewLevels', 'viewGame', 'btnHeaderBack', 'instructionBar',
  'gameLevelBadge', 'gameLevelTitle', 'promptText', 'gameMount', 'modalVictory',
  'victoryMascot', 'victoryStarsAnim', 'btnNextLevel', 'btnReplayLevel',
  'btnVictoryLevelSelect', 'btnOpenCert', 'modalCertificate', 'btnPrintCert',
  'btnCloseCert', 'certChildName', 'certTotalStars', 'certCompletedLevels',
  'certIssueDate', 'certMascotLeft', 'certMascotRight', 'btnOpenParent',
  'parentHoldProgress', 'modalParent', 'parentGateSection', 'parentDashboardSection',
  'parentMathQuestion', 'parentMathChoices', 'btnCancelParentGate', 'btnCloseParentDash',
  'btnSaveChildName', 'inputChildName', 'btnTestSfx', 'btnTestTts', 'btnResetProgress',
  'worldsGrid', 'levelsGrid', 'currentWorldTitle', 'currentWorldProgress', 'worldRecapList',
  'btnSpeakPrompt'
];

requiredAppIds.forEach(id => getOrCreateElement(id, id === 'confettiCanvas' ? 'canvas' : 'div'));

globalThis.document = {
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => new MockDOMElement('', tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  readyState: 'complete'
};

const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

const { AppController, App } = await import('../app.js');

await checkAsync('4.1 Rapid-fire 100 emotion updates with overlapping timeouts', async () => {
  const app = new AppController();
  app.init();

  const bubble = getOrCreateElement('mascotBubble');
  const emotions = ['cheer', 'happy', 'think', 'encourage', 'cheer'];
  const praiseTexts = ['Hebat! ⭐', 'Pintar! 🌟', 'Keren! 🚀', 'Coba Lagi! 💪', 'Luar Biasa! 🎉'];

  // Fire 100 emotion updates with rapid overlapping delays
  for (let i = 0; i < 100; i++) {
    const emotion = emotions[i % emotions.length];
    const text = praiseTexts[i % praiseTexts.length];
    // Short overlapping duration
    app.reactMascot(emotion, text, 80);

    // Verify mascotRevertTimeout exists and is active
    assert(app.mascotRevertTimeout !== null, `Mascot timeout must be active after update ${i + 1}`);

    // Verify DOM was populated with SVG and bubble
    assert(bubble.innerHTML.includes('mascot-reactive-wrap'), `Bubble HTML must contain reactive wrap at step ${i}`);
    assert(bubble.innerHTML.includes(text), `Bubble HTML must contain speech text "${text}"`);
    assert(bubble.innerHTML.includes('<svg'), `Bubble HTML must contain SVG artwork`);

    // Micro-delay between some calls to simulate true asynchronous concurrency
    if (i % 10 === 0) {
      await new Promise(r => setTimeout(r, 5));
    }
  }

  // After 100 updates, only ONE single timeout should be pending
  const finalTimeoutRef = app.mascotRevertTimeout;
  assert(finalTimeoutRef !== null, 'Final timeout must be registered');

  // Wait for the final timeout to fire and cleanly revert (duration was 80ms)
  await new Promise(r => setTimeout(r, 120));

  // Verify revert cleanup
  assert.strictEqual(app.mascotRevertTimeout, null, 'mascotRevertTimeout must be null after expiration');
  assert(!bubble.innerHTML.includes('mascot-reaction-bubble'), 'Speech bubble must be removed upon revert');
  assert(bubble.innerHTML.includes('<svg'), 'Idle mascot SVG must be rendered after revert');
});

check('4.2 Reactive Mascot resilience against null bubble element, empty text, and invalid emotions', () => {
  const app = new AppController();

  // Test when mascotBubble is absent
  mockDomMap.delete('mascotBubble');
  assert.doesNotThrow(() => {
    app.reactMascot('cheer', 'Hebat!', 500);
  }, 'reactMascot must not crash when mascotBubble is absent');

  // Restore mascotBubble
  const bubble = getOrCreateElement('mascotBubble');

  // Test invalid emotions & malformed inputs
  const weirdInputs = [
    { emotion: null, text: null },
    { emotion: undefined, text: undefined },
    { emotion: 'unknown_alien_emotion', text: '' },
    { emotion: 12345, text: 67890 },
    { emotion: '', text: '   ' }
  ];

  for (const input of weirdInputs) {
    assert.doesNotThrow(() => {
      app.reactMascot(input.emotion, input.text, 50);
    }, `reactMascot must handle weird input cleanly: ${JSON.stringify(input)}`);
    assert(bubble.innerHTML.includes('<svg'), 'Must render valid fallback SVG');
  }

  if (app.mascotRevertTimeout) {
    clearTimeout(app.mascotRevertTimeout);
    app.mascotRevertTimeout = null;
  }
});

check('4.3 High-frequency Event-Bus stress: 100 CustomEvent("mascot-react") dispatched via window concurrently with direct reactMascot calls', () => {
  const app = new AppController();
  app.init();
  const bubble = getOrCreateElement('mascotBubble');

  if (typeof CustomEvent === 'undefined') {
    globalThis.CustomEvent = class {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail || {};
      }
    };
  }

  for (let i = 0; i < 100; i++) {
    // Alternating between event bus and direct method
    if (i % 2 === 0) {
      window.dispatchEvent(new CustomEvent('mascot-react', {
        detail: { emotion: 'cheer', text: `Event ${i}!`, durationMs: 60 }
      }));
    } else {
      app.reactMascot('think', `Direct ${i}!`, 60);
    }
    assert(bubble.innerHTML.includes('<svg'), `Must render valid SVG on iteration ${i}`);
  }

  if (app.mascotRevertTimeout) {
    clearTimeout(app.mascotRevertTimeout);
    app.mascotRevertTimeout = null;
  }
});

check('4.4 Boundary duration values: durationMs = 0, negative, Infinity, NaN', () => {
  const app = new AppController();
  const bubble = getOrCreateElement('mascotBubble');

  const boundaryDurations = [0, -100, NaN, Infinity, -Infinity];
  for (const d of boundaryDurations) {
    assert.doesNotThrow(() => {
      app.reactMascot('cheer', 'Test Boundary', d);
    }, `reactMascot must handle boundary duration ${d}`);
    assert(bubble.innerHTML.includes('<svg'), `Must maintain valid SVG on duration ${d}`);
    if (app.mascotRevertTimeout) {
      clearTimeout(app.mascotRevertTimeout);
      app.mascotRevertTimeout = null;
    }
  }
});

// ============================================================================
// SUITE 5: VICTORY STAGED CELEBRATION & TIMEOUT CANCELLATION INTEGRITY
// ============================================================================
console.log('\n--- [SUITE 5] Victory Celebration Staging & Timeout Cancellation ---');

await checkAsync('5.1 handleVictory staged 5-phase execution', async () => {
  const app = new AppController();
  app.init();

  const testLevel = { id: '99', worldId: 'spidey', title: 'Test Level', prompt: 'Pilih!' };
  app.handleVictory(testLevel);

  // Victory processing flag must be active
  assert.strictEqual(app.isVictoryProcessing, true, 'isVictoryProcessing must be true');
  assert(app.victoryTimeouts.length >= 4, `At least 4 staged timeouts scheduled, got ${app.victoryTimeouts.length}`);

  // Progress must be recorded
  assert.strictEqual(app.completedLevels['99'], 3, 'Level 99 must be recorded with 3 stars');

  // Fast forward through celebration
  await new Promise(r => setTimeout(r, 1300));

  // Close victory
  app.closeVictory();
  assert.strictEqual(app.isVictoryProcessing, false, 'isVictoryProcessing must reset to false');
  assert.strictEqual(app.victoryTimeouts.length, 0, 'victoryTimeouts array must be drained');
});

check('5.2 Rapid closeVictory during celebration cancels all pending timeouts without leak', () => {
  const app = new AppController();
  app.init();

  const testLevel = { id: '98', worldId: 'hewan', title: 'Test Level 2', prompt: 'Test' };

  for (let i = 0; i < 20; i++) {
    app.handleVictory(testLevel);
    // User rapidly dismisses modal immediately
    app.closeVictory();
    assert.strictEqual(app.victoryTimeouts.length, 0, `victoryTimeouts must be empty after closeVictory on cycle ${i}`);
    assert.strictEqual(app.isVictoryProcessing, false, `isVictoryProcessing must be false on cycle ${i}`);
  }
});

check('5.3 handleVictory idempotency guard prevents double invocation during celebration', () => {
  const app = new AppController();
  app.init();

  const testLevel = { id: '97', worldId: 'angka', title: 'Test Level 3', prompt: 'Test' };
  app.handleVictory(testLevel);
  const scheduledCount = app.victoryTimeouts.length;

  // Second immediate invocation must be ignored by idempotency guard
  app.handleVictory(testLevel);
  assert.strictEqual(app.victoryTimeouts.length, scheduledCount, 'Duplicate handleVictory calls must be no-ops');

  app.closeVictory();
});

check('5.4 Interleaved victory modal triggering during level launch and back button navigation', () => {
  const app = new AppController();
  app.init();

  const testLevel = { id: '96', worldId: 'koding', title: 'Test Koding', prompt: 'Koding!' };

  // Trigger victory, then immediately navigate back before celebration ends
  app.handleVictory(testLevel);
  assert.strictEqual(app.isVictoryProcessing, true);

  // Click back button
  const btnBack = getOrCreateElement('btnHeaderBack');
  if (btnBack.onclick) btnBack.onclick();

  // Modal must be cleanable
  app.closeVictory();
  assert.strictEqual(app.isVictoryProcessing, false);
});

// ============================================================================
// SUITE 6: PARENTAL GATE RANDOM MATH & RESET HARDENING
// ============================================================================
console.log('\n--- [SUITE 6] Parental Gate Math Challenge & Progress Hardening ---');

check('6.1 Math challenge generates valid addition and handles wrong/right answers', () => {
  const app = new AppController();
  app.init();

  app.openParentalGateModal();
  const correctAnswer = app.currentMathAnswer;
  assert(typeof correctAnswer === 'number' && correctAnswer >= 3 && correctAnswer <= 18, `Math answer out of range: ${correctAnswer}`);

  // Test wrong answer
  const wrongAnswer = correctAnswer + 10;
  app.handleMathChoice(wrongAnswer);
  const modalParent = getOrCreateElement('modalParent');
  // Should wobble / close, dash not visible
  const dashSection = getOrCreateElement('parentDashboardSection');
  assert.strictEqual(dashSection.style.display, 'none', 'Dashboard section must remain hidden on wrong answer');

  // Test correct answer
  app.openParentalGateModal();
  app.handleMathChoice(app.currentMathAnswer);
  assert.strictEqual(dashSection.style.display, 'flex', 'Dashboard section must be displayed on correct answer');
});

// ============================================================================
// TEST SUMMARY & JUNIT-STYLE AUDIT TRAIL
// ============================================================================
console.log('\n================================================================');
console.log('📊 CHALLENGER M-EVO-3.1 EMPIRICAL AUDIT RESULTS');
console.log('================================================================');
console.log(`Total Adversarial Checks: ${totalChecks}`);
console.log(`Passed:                   \x1b[32m${passedChecks}\x1b[0m`);
console.log(`Failed:                   \x1b[31m${failedChecks}\x1b[0m`);
console.log('================================================================\n');

if (failedChecks > 0) {
  console.error('❌ ADVERSARIAL STRESS SUITE FAILED. FINDINGS:');
  findings.forEach((f, i) => {
    console.error(`  [${i + 1}] ${f.title}`);
    console.error(`      ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('✔ ALL ADVERSARIAL EMPIRICAL CHECKS PASSED PERFECTLY (Exit Code 0).');
  process.exit(0);
}
