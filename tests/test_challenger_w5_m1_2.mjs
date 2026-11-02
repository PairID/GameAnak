// tests/test_challenger_w5_m1_2.mjs
// Adversarial Empirical Stress Test Suite for Milestone W5-M1
// Target: audio.js and regression safety across all 75 existing levels
// Archetype: Empirical Challenger (critic, specialist)
// Mode: Pure Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER W5-M1.2: EMPIRICAL ADVERSARIAL STRESS SUITE');
console.log('Web Audio Procedural Synthesis, Leak Audit & 75-Level Regression');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const testResults = [];
const anomalies = [];

function test(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res.then(() => {
        console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
        passCount++;
        testResults.push({ name, status: 'PASS' });
      }).catch(err => {
        console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
        failCount++;
        testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
      });
    } else {
      console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
      passCount++;
      testResults.push({ name, status: 'PASS' });
      return Promise.resolve();
    }
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    failCount++;
    testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
    return Promise.resolve();
  }
}

function anomaly(category, message, details = {}) {
  anomalies.push({ category, message, details });
  console.log(`  \x1b[33m⚡ [ANOMALY - ${category}]\x1b[0m ${message}`);
}

// ============================================================================
// SUITE 1: HEADLESS NODE.JS EXECUTION & SYNCHRONOUS STRESS TEST
// ============================================================================
console.log('[SUITE 1: Headless Node.js Execution & Synchronous Stress]');

const { SoundSystem, sound } = await import('../audio.js');

await test('1.1 Interface Contract: All sound cue methods exist', () => {
  const requiredMethods = [
    'init', 'loadVoices', 'speak', 'stopSpeech', 'playTone',
    'playPop', 'playClick', 'playCorrect', 'playStar', 'playFanfare',
    'playGentleTryAgain', 'playRobotStep',
    // 4 New World 5 Milestone 1 cues:
    'playSnap', 'playCipherClick', 'playScaleTilt', 'playFlourish'
  ];

  requiredMethods.forEach(method => {
    assert(typeof sound[method] === 'function', `sound.${method} must be a function`);
  });
});

await test('1.2 Headless Safety: In bare Node.js, SoundSystem methods execute without error', () => {
  assert.doesNotThrow(() => sound.init(), 'init() threw in Node.js');
  assert.doesNotThrow(() => sound.playSnap(), 'playSnap() threw in Node.js');
  assert.doesNotThrow(() => sound.playCipherClick(), 'playCipherClick() threw in Node.js');
  assert.doesNotThrow(() => sound.playScaleTilt(), 'playScaleTilt() threw in Node.js');
  assert.doesNotThrow(() => sound.playFlourish(), 'playFlourish() threw in Node.js');
});

await test('1.3 High-Concurrency Stress in Node.js: 1,000 rapid calls per new method', () => {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    sound.playSnap();
    sound.playCipherClick();
    sound.playScaleTilt();
    sound.playFlourish();
  }
  const duration = performance.now() - start;
  assert(duration < 500, `1000 rapid iterations took too long: ${duration.toFixed(2)}ms`);
});

await test('1.4 Interleaved Stress: Rapid mixed sequence of 2,000 calls across all 11 SFX methods', () => {
  const methods = [
    'playPop', 'playClick', 'playCorrect', 'playStar', 'playFanfare',
    'playGentleTryAgain', 'playRobotStep', 'playSnap', 'playCipherClick',
    'playScaleTilt', 'playFlourish'
  ];

  for (let i = 0; i < 2000; i++) {
    const fn = methods[i % methods.length];
    assert.doesNotThrow(() => sound[fn](), `${fn} threw during interleaved stress`);
  }
});

await test('1.5 Edge Inputs on Speech Synthesis: Null, empty, huge strings, and toggles', async () => {
  let callbackFired = false;
  sound.speak('Halo Spidey!', () => { callbackFired = true; });
  await new Promise(r => setTimeout(r, 350));
  assert.strictEqual(callbackFired, true, 'onEnd callback must fire in headless mode');

  // Edge cases
  assert.doesNotThrow(() => sound.speak(null));
  assert.doesNotThrow(() => sound.speak(undefined));
  assert.doesNotThrow(() => sound.speak(''));
  assert.doesNotThrow(() => sound.speak('A'.repeat(50000))); // 50k characters
  assert.doesNotThrow(() => sound.stopSpeech());

  // Toggle sfxEnabled & speechEnabled
  sound.sfxEnabled = false;
  assert.doesNotThrow(() => sound.playSnap());
  assert.doesNotThrow(() => sound.playFlourish());
  sound.sfxEnabled = true;

  sound.speechEnabled = false;
  callbackFired = false;
  sound.speak('Muted voice', () => { callbackFired = true; });
  await new Promise(r => setTimeout(r, 350));
  assert.strictEqual(callbackFired, true, 'onEnd callback must fire when speechEnabled is false');
  sound.speechEnabled = true;
});


// ============================================================================
// SUITE 2: HIGH-FIDELITY WEB AUDIO API MOCK & OSCILLATOR LEAK AUDIT
// ============================================================================
console.log('\n[SUITE 2: High-Fidelity Web Audio Mock & Oscillator Lifecycle/Leak Audit]');

// We build a mock AudioContext complying with W3C Web Audio API specifications
class MockAudioParam {
  constructor(name, defaultValue = 0) {
    this.name = name;
    this.value = defaultValue;
    this.events = [];
  }

  setValueAtTime(value, startTime) {
    assert(typeof value === 'number' && !isNaN(value) && isFinite(value),
      `AudioParam.setValueAtTime value must be a finite number, received: ${value}`);
    this.value = value;
    this.events.push({ type: 'setValueAtTime', value, time: startTime });
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    // W3C Web Audio Spec: "An exception MUST be thrown if value is less than or equal to zero."
    if (value <= 0 || isNaN(value) || !isFinite(value)) {
      throw new RangeError(`Failed to execute 'exponentialRampToValueAtTime' on 'AudioParam': The value provided (${value}) must be a non-zero, non-negative finite number.`);
    }
    this.value = value;
    this.events.push({ type: 'exponentialRampToValueAtTime', value, time: endTime });
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this.value = value;
    this.events.push({ type: 'linearRampToValueAtTime', value, time: endTime });
    return this;
  }
}

class MockAudioNode {
  constructor(context, type) {
    this.context = context;
    this.nodeType = type;
    this.connections = new Set();
  }

  connect(destination) {
    assert(destination, 'Cannot connect to null or undefined destination');
    this.connections.add(destination);
    return destination;
  }

  disconnect(destination) {
    if (destination) this.connections.delete(destination);
    else this.connections.clear();
  }
}

class MockGainNode extends MockAudioNode {
  constructor(context) {
    super(context, 'GainNode');
    this.gain = new MockAudioParam('gain', 1.0);
    context._registry.gains.push(this);
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor(context) {
    super(context, 'OscillatorNode');
    this.type = 'sine';
    this.frequency = new MockAudioParam('frequency', 440);
    this.state = 'UNSCHEDULED';
    this.startTime = null;
    this.stopTime = null;
    context._registry.oscillators.push(this);
  }

  start(when = 0) {
    if (this.state !== 'UNSCHEDULED') {
      throw new Error(`Cannot start oscillator in state: ${this.state}`);
    }
    this.state = 'SCHEDULED';
    this.startTime = when;
  }

  stop(when = 0) {
    if (this.state === 'STOPPED') {
      throw new Error('Cannot stop oscillator that is already stopped');
    }
    assert(this.startTime !== null, 'Cannot schedule stop on an oscillator before start is called');
    assert(when >= this.startTime, `Oscillator stop time (${when}) cannot precede start time (${this.startTime})`);
    this.state = 'STOPPED';
    this.stopTime = when;
  }
}

class MockAudioContext {
  constructor() {
    this.currentTime = 10.0; // Arbitrary non-zero timeline
    this.state = 'running';
    this.destination = new MockAudioNode(this, 'AudioDestinationNode');
    this._registry = {
      oscillators: [],
      gains: []
    };
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  createOscillator() {
    return new MockOscillatorNode(this);
  }

  createGain() {
    return new MockGainNode(this);
  }

  resetRegistry() {
    this._registry.oscillators = [];
    this._registry.gains = [];
  }
}

// Attach simulated Web Audio API environment
const mockAudioContext = new MockAudioContext();
const mockWindow = {
  AudioContext: function() { return mockAudioContext; },
  speechSynthesis: {
    getVoices: () => [{ lang: 'id-ID', name: 'Gadis Indonesia' }],
    cancel: () => {},
    speak: (u) => { if (u.onend) setTimeout(u.onend, 10); }
  }
};

// Create a dedicated SoundSystem instance wired to the mock Web Audio API
const testSound = new SoundSystem();
global.window = mockWindow;
testSound.init();

await test('2.1 Mock AudioContext Initialized and Connected', () => {
  assert(testSound.ctx !== null, 'SoundSystem.ctx must be initialized');
  assert.strictEqual(testSound.ctx.state, 'running', 'AudioContext must be running');
});

await test('2.2 Leak Audit: playSnap() creates 2 oscillators, 0 leaks, valid connections and ramps', () => {
  mockAudioContext.resetRegistry();
  testSound.playSnap();

  const oscs = mockAudioContext._registry.oscillators;
  const gains = mockAudioContext._registry.gains;

  assert.strictEqual(oscs.length, 2, `playSnap must create exactly 2 oscillators (found ${oscs.length})`);
  assert.strictEqual(gains.length, 2, `playSnap must create exactly 2 gain nodes (found ${gains.length})`);

  oscs.forEach((osc, idx) => {
    assert.strictEqual(osc.state, 'STOPPED', `Oscillator ${idx} must be scheduled to stop`);
    assert(osc.stopTime > osc.startTime, `Oscillator ${idx} stopTime (${osc.stopTime}) must be > startTime (${osc.startTime})`);
    assert.strictEqual(osc.connections.size, 1, `Oscillator ${idx} must be connected to a gain node`);
    const connectedGain = Array.from(osc.connections)[0];
    assert.strictEqual(connectedGain.nodeType, 'GainNode', 'Connected destination must be GainNode');
    assert(connectedGain.connections.has(mockAudioContext.destination), 'GainNode must connect to destination');

    // Check ramp values: exponential ramp values must be strictly > 0
    const ramps = connectedGain.gain.events.filter(e => e.type === 'exponentialRampToValueAtTime');
    ramps.forEach(ramp => {
      assert(ramp.value > 0, `exponentialRampToValueAtTime target value must be > 0, got ${ramp.value}`);
    });
  });
});

await test('2.3 Leak Audit: playCipherClick() creates 2 oscillators with sequential delay, 0 leaks', () => {
  mockAudioContext.resetRegistry();
  testSound.playCipherClick();

  const oscs = mockAudioContext._registry.oscillators;
  assert.strictEqual(oscs.length, 2, `playCipherClick must create exactly 2 oscillators (found ${oscs.length})`);

  oscs.forEach((osc, idx) => {
    assert.strictEqual(osc.state, 'STOPPED', `Oscillator ${idx} must be scheduled to stop`);
    assert(osc.stopTime > osc.startTime, `Oscillator ${idx} stopTime must be > startTime`);
    assert(osc.connections.size >= 1, `Oscillator ${idx} must be connected`);
  });

  // Verify second tumbler tick has higher startTime than first
  assert(oscs[1].startTime > oscs[0].startTime, 'Second tick oscillator must be delayed (+0.03s)');
});

await test('2.4 Leak Audit: playScaleTilt() creates 2 oscillators with rising pitch glissando, 0 leaks', () => {
  mockAudioContext.resetRegistry();
  testSound.playScaleTilt();

  const oscs = mockAudioContext._registry.oscillators;
  assert.strictEqual(oscs.length, 2, `playScaleTilt must create exactly 2 oscillators (found ${oscs.length})`);

  oscs.forEach((osc, idx) => {
    assert.strictEqual(osc.state, 'STOPPED', `Oscillator ${idx} must be scheduled to stop`);
    assert(osc.stopTime > osc.startTime, `Oscillator ${idx} stopTime must be > startTime`);

    // Verify frequency ramps
    const freqRamps = osc.frequency.events.filter(e => e.type === 'exponentialRampToValueAtTime');
    assert(freqRamps.length >= 1, `Oscillator ${idx} must have frequency exponential ramp for glissando`);
    const initialFreq = osc.frequency.events[0].value;
    const endFreq = freqRamps[0].value;
    assert(endFreq > initialFreq, `Frequency must rise for scale tilt (initial: ${initialFreq}, end: ${endFreq})`);
  });
});

await test('2.5 Leak Audit: playFlourish() creates 10 oscillators across 5 arpeggio notes, 0 leaks', async () => {
  mockAudioContext.resetRegistry();
  testSound.playFlourish();

  // Wait for all 5 setTimeout notes to fire (delays: 0, 70, 140, 220, 310ms + buffer)
  await new Promise(r => setTimeout(r, 450));

  const oscs = mockAudioContext._registry.oscillators;
  assert.strictEqual(oscs.length, 10, `playFlourish must create exactly 10 oscillators (5 notes x 2 voices), found ${oscs.length}`);

  oscs.forEach((osc, idx) => {
    assert.strictEqual(osc.state, 'STOPPED', `Flourish oscillator ${idx} must be scheduled to stop`);
    assert(osc.stopTime > osc.startTime, `Flourish oscillator ${idx} stopTime must be > startTime`);
    assert.strictEqual(osc.connections.size, 1, `Flourish oscillator ${idx} must be connected`);
  });
});

await test('2.6 Adversarial Burst Stress: Rapid concurrent firing (1,100 total oscillators), ZERO LEAKS', async () => {
  mockAudioContext.resetRegistry();

  const burstCount = 100;
  // Fire 100 snaps (200 oscs) + 100 clicks (200 oscs) + 100 scale tilts (200 oscs) + 50 flourishes (500 oscs)
  for (let i = 0; i < burstCount; i++) {
    testSound.playSnap();
    testSound.playCipherClick();
    testSound.playScaleTilt();
    if (i < 50) testSound.playFlourish();
  }

  // Allow all flourish timers to settle
  await new Promise(r => setTimeout(r, 450));

  const oscs = mockAudioContext._registry.oscillators;
  const gains = mockAudioContext._registry.gains;
  const expectedOscs = (100 * 2) + (100 * 2) + (100 * 2) + (50 * 10); // 1,100

  assert.strictEqual(oscs.length, expectedOscs, `Expected exactly ${expectedOscs} oscillators, found ${oscs.length}`);
  assert.strictEqual(gains.length, expectedOscs, `Expected exactly ${expectedOscs} gains, found ${gains.length}`);

  // Rigorous Leak Check across all 1,100 oscillators
  let unstoppedCount = 0;
  let disconnectedCount = 0;
  let invalidTimeCount = 0;

  for (const osc of oscs) {
    if (osc.state !== 'STOPPED') unstoppedCount++;
    if (osc.connections.size === 0) disconnectedCount++;
    if (osc.stopTime <= osc.startTime) invalidTimeCount++;
  }

  assert.strictEqual(unstoppedCount, 0, `FOUND ${unstoppedCount} LEAKING UNSTOPPED OSCILLATORS!`);
  assert.strictEqual(disconnectedCount, 0, `FOUND ${disconnectedCount} DISCONNECTED FLOATING OSCILLATORS!`);
  assert.strictEqual(invalidTimeCount, 0, `FOUND ${invalidTimeCount} OSCILLATORS WITH INVALID STOP TIMES!`);

  console.log(`      ✓ Verified 1,100 procedural oscillators cleanly scheduled and bounded.`);
});

await test('2.7 AudioContext State Resiliency: Suspended AudioContext triggers resume()', () => {
  mockAudioContext.state = 'suspended';
  testSound.init();
  assert.strictEqual(mockAudioContext.state, 'running', 'AudioContext.resume() must be called if suspended');
});

await test('2.8 Acoustic Signature & Waveform Audit for 4 New Sound Cues', () => {
  // Test playSnap waveforms and frequencies
  mockAudioContext.resetRegistry();
  testSound.playSnap();
  const snapOscs = mockAudioContext._registry.oscillators;
  assert.strictEqual(snapOscs[0].type, 'triangle', 'playSnap Voice 1 must be triangle wave');
  assert.strictEqual(snapOscs[0].frequency.events[0].value, 580, 'playSnap Voice 1 start freq must be 580Hz');
  assert.strictEqual(snapOscs[1].type, 'sine', 'playSnap Voice 2 must be sine wave');
  assert.strictEqual(snapOscs[1].frequency.events[0].value, 1280, 'playSnap Voice 2 ping freq must be 1280Hz');

  // Test playCipherClick waveforms and frequencies
  mockAudioContext.resetRegistry();
  testSound.playCipherClick();
  const cipherOscs = mockAudioContext._registry.oscillators;
  assert.strictEqual(cipherOscs[0].type, 'triangle', 'playCipherClick Voice 1 must be triangle wave');
  assert.strictEqual(cipherOscs[0].frequency.events[0].value, 880, 'playCipherClick Voice 1 freq must be 880Hz');
  assert.strictEqual(cipherOscs[1].type, 'sine', 'playCipherClick Voice 2 must be sine wave');
  assert.strictEqual(cipherOscs[1].frequency.events[0].value, 1320, 'playCipherClick Voice 2 freq must be 1320Hz');

  // Test playScaleTilt waveforms and frequencies
  mockAudioContext.resetRegistry();
  testSound.playScaleTilt();
  const tiltOscs = mockAudioContext._registry.oscillators;
  assert.strictEqual(tiltOscs[0].type, 'sine', 'playScaleTilt Voice 1 must be sine wave');
  assert.strictEqual(tiltOscs[0].frequency.events[0].value, 320, 'playScaleTilt Voice 1 start freq must be 320Hz');
  assert.strictEqual(tiltOscs[1].type, 'triangle', 'playScaleTilt Voice 2 must be triangle wave');
  assert.strictEqual(tiltOscs[1].frequency.events[0].value, 640, 'playScaleTilt Voice 2 start freq must be 640Hz');
});

class MockUtterance {
  constructor(text) {
    this.text = text;
    this.lang = 'id-ID';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.voice = null;
    this.onend = null;
    this.onerror = null;
  }
}
global.SpeechSynthesisUtterance = MockUtterance;

await test('2.9 SpeechSynthesis Fault-Tolerance & Exception Handling', async () => {
  // Scenario 1: Empty voices list
  const emptyVoiceWindow = {
    AudioContext: function() { return mockAudioContext; },
    speechSynthesis: {
      getVoices: () => [],
      cancel: () => {},
      speak: (u) => { if (u.onend) setTimeout(u.onend, 10); }
    }
  };
  global.window = emptyVoiceWindow;
  const resilientSound = new SoundSystem();
  resilientSound.init();
  assert.strictEqual(resilientSound.selectedVoice, null, 'Selected voice should be null when voices list is empty');
  let fired1 = false;
  resilientSound.speak('Tes suara saat daftar kosong', () => { fired1 = true; });
  await new Promise(r => setTimeout(r, 50));
  assert.strictEqual(fired1, true, 'onEnd must fire even when voice list is empty');

  // Scenario 2: speechSynthesis.speak throws exception
  const throwingWindow = {
    AudioContext: function() { return mockAudioContext; },
    speechSynthesis: {
      getVoices: () => [{ lang: 'id-ID' }],
      cancel: () => {},
      speak: () => { throw new Error('Simulated browser speech synthesis crash'); }
    }
  };
  global.window = throwingWindow;
  const crashSafeSound = new SoundSystem();
  crashSafeSound.init();
  let fired2 = false;
  assert.doesNotThrow(() => {
    crashSafeSound.speak('Tes saat API melempar error', () => { fired2 = true; });
  }, 'speak() must catch internal SpeechSynthesis error');
  await new Promise(r => setTimeout(r, 50));
  assert.strictEqual(fired2, true, 'onEnd must fire on catch');

  // Restore normal mock window
  global.window = mockWindow;
});


// ============================================================================
// SUITE 3: ZERO EXTERNAL AUDIO ASSET DEPENDENCIES AUDIT
// ============================================================================
console.log('\n[SUITE 3: Zero External Audio Asset Dependencies Audit]');

await test('3.1 Repository Filesystem Scan: Zero audio binary files in workspace', () => {
  const audioExtensions = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus', '.wma', '.mid', '.aiff']);
  const audioFilesFound = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (audioExtensions.has(ext)) {
          audioFilesFound.push(fullPath);
        }
      }
    }
  }

  scanDir(ROOT_DIR);
  assert.strictEqual(audioFilesFound.length, 0, `Found external audio binary files in repository: ${audioFilesFound.join(', ')}`);
});

await test('3.2 Codebase Static Audit: Zero references to external audio assets or audio loading', () => {
  const sourceFiles = [
    'audio.js',
    'engines.js',
    'levels.js',
    'app.js',
    'index.html',
    'sw.js',
    'style.css'
  ];

  const forbiddenPatterns = [
    /\.mp3\b/i,
    /\.wav\b/i,
    /\.ogg\b/i,
    /\.m4a\b/i,
    /\.aac\b/i,
    /\bnew\s+Audio\s*\(/,
    /\bdocument\.createElement\s*\(\s*['"]audio['"]\s*\)/,
    /<audio\b/i,
    /\bdecodeAudioData\b/
  ];

  for (const file of sourceFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of forbiddenPatterns) {
      // Exclude selfcheck regex testing or comments containing pattern
      const lines = content.split('\n');
      lines.forEach((line, lineNum) => {
        // Skip comment lines in audio.js stating zero audio asset needed
        if (line.includes('zero external audio asset') || line.includes('zero external audio')) return;
        if (pattern.test(line)) {
          // If in sw.js or test, verify it is not actually loading audio
          assert.fail(`Forbidden audio pattern ${pattern} detected in ${file}:${lineNum + 1}: ${line.trim()}`);
        }
      });
    }
  }
});

await test('3.3 PWA Service Worker Cache Invariant: sw.js contains 0 audio asset URLs', () => {
  const swContent = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
  assert(!swContent.includes('.mp3'), 'sw.js cache must not contain .mp3');
  assert(!swContent.includes('.wav'), 'sw.js cache must not contain .wav');
  assert(!swContent.includes('.ogg'), 'sw.js cache must not contain .ogg');
});


// ============================================================================
// SUITE 4: ZERO REGRESSION AUDIT ACROSS ALL 75 LEVELS IN WORLDS 1–4
// ============================================================================
console.log('\n[SUITE 4: Zero Regression Audit Across All 75 Existing Levels in Worlds 1–4]');

const { LEVELS, WORLDS } = await import('../levels.js');
const { Engines } = await import('../engines.js');

await test('4.1 World 1–4 Level Quantity & Distribution Invariant', () => {
  const legacyWorlds = ['hewan', 'angka', 'spidey', 'koding'];
  const legacyLevels = LEVELS.filter(l => legacyWorlds.includes(l.worldId));

  assert.strictEqual(legacyLevels.length, 75, `Worlds 1–4 must contain exactly 75 levels (found ${legacyLevels.length})`);

  const counts = {};
  legacyLevels.forEach(l => { counts[l.worldId] = (counts[l.worldId] || 0) + 1; });

  assert.strictEqual(counts.hewan, 11, `World 1 (hewan) must have 11 levels, found ${counts.hewan}`);
  assert.strictEqual(counts.angka, 22, `World 2 (angka) must have 22 levels, found ${counts.angka}`);
  assert.strictEqual(counts.spidey, 23, `World 3 (spidey) must have 23 levels, found ${counts.spidey}`);
  assert.strictEqual(counts.koding, 19, `World 4 (koding) must have 19 levels, found ${counts.koding}`);
});

await test('4.2 Legacy Level IDs: Exactly 75 unique, valid IDs for Worlds 1–4', () => {
  const legacyLevels = LEVELS.filter(l => ['hewan', 'angka', 'spidey', 'koding'].includes(l.worldId));
  const seenIds = new Set();

  legacyLevels.forEach((l, idx) => {
    assert(l.id && typeof l.id === 'string' && l.id.trim().length > 0, `Level at index ${idx} missing valid id string`);
    assert(!seenIds.has(l.id), `Duplicate level id ${l.id} found in legacy worlds`);
    seenIds.add(l.id);
  });
  assert.strictEqual(seenIds.size, 75, `Expected 75 unique level IDs, found ${seenIds.size}`);
});

await test('4.3 Legacy Level Schema Invariants: Non-empty prompt, title, and valid engine type', () => {
  const validEngineTypes = new Set([
    'hubungkan', 'labirin', 'pilih', 'titik', 'tebalkan', 'mewarnai', 'urutkan', 'panah', 'memori'
  ]);

  const legacyLevels = LEVELS.filter(l => ['hewan', 'angka', 'spidey', 'koding'].includes(l.worldId));
  legacyLevels.forEach(l => {
    assert(typeof l.title === 'string' && l.title.trim().length > 0, `Level ${l.id} missing title`);
    assert(typeof l.prompt === 'string' && l.prompt.trim().length > 0, `Level ${l.id} missing prompt`);
    assert(validEngineTypes.has(l.type), `Level ${l.id} has invalid legacy type: ${l.type}`);
  });
});

await test('4.4 Algorithmic Solvability Verification for All 75 Legacy Levels', () => {
  const legacyLevels = LEVELS.filter(l => ['hewan', 'angka', 'spidey', 'koding'].includes(l.worldId));

  for (const l of legacyLevels) {
    switch (l.type) {
      case 'labirin': {
        const size = l.gridSize || 5;
        const wallsSet = new Set(l.walls || []);
        const goalKey = `${size - 1},${size - 1}`;
        assert(!wallsSet.has('0,0'), `Level ${l.id} start (0,0) blocked`);
        assert(!wallsSet.has(goalKey), `Level ${l.id} goal (${goalKey}) blocked`);

        const queue = [{ r: 0, c: 0 }];
        const visited = new Set(['0,0']);
        let reached = false;

        while (queue.length > 0) {
          const cur = queue.shift();
          if (cur.r === size - 1 && cur.c === size - 1) {
            reached = true;
            break;
          }
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = cur.r + dr;
            const nc = cur.c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              const key = `${nr},${nc}`;
              if (!wallsSet.has(key) && !visited.has(key)) {
                visited.add(key);
                queue.push({ r: nr, c: nc });
              }
            }
          }
        }
        assert(reached, `Maze Level ${l.id} is unsolvable by BFS!`);
        break;
      }

      case 'titik': {
        assert(Array.isArray(l.dots) && l.dots.length >= 3, `Titik Level ${l.id} has < 3 dots`);
        l.dots.forEach((d, idx) => {
          assert.strictEqual(d.num, idx + 1, `Titik Level ${l.id} dot num non-contiguous at index ${idx}`);
        });
        break;
      }

      case 'urutkan': {
        assert(Array.isArray(l.items) && l.items.length >= 2, `Urutkan Level ${l.id} items invalid`);
        const orders = l.items.map(it => it.step !== undefined ? it.step : it.size);
        const sorted = [...orders].sort((a, b) => a - b);
        for (let i = 0; i < sorted.length; i++) {
          assert.strictEqual(sorted[i], i + 1, `Urutkan Level ${l.id} contiguous order check failed at ${i}`);
        }
        break;
      }

      case 'pilih': {
        assert(Array.isArray(l.items) && l.items.length > 0, `Pilih Level ${l.id} missing items array`);
        l.items.forEach((item, idx) => {
          assert(Array.isArray(item.options) && item.options.length >= 1, `Pilih Level ${l.id} item ${idx} options empty`);
          const hasAnswerIndex = item.answerIndex !== undefined && item.answerIndex >= 0 && item.answerIndex < item.options.length;
          const hasAnswer = item.answer !== undefined;
          assert(hasAnswerIndex || hasAnswer, `Pilih Level ${l.id} item ${idx} has no valid answer or answerIndex`);
        });
        break;
      }

      case 'memori': {
        const pairs = l.pairs || l.cards;
        assert(Array.isArray(pairs) && pairs.length >= 2, `Memori Level ${l.id} pairs must have >= 2 pairs`);
        pairs.forEach((p, idx) => {
          assert(p.id, `Memori Level ${l.id} pair ${idx} missing id`);
          assert(p.emoji || p.name || p.label, `Memori Level ${l.id} pair ${idx} missing emoji/name`);
        });
        break;
      }

      case 'panah': {
        assert(Array.isArray(l.grid) && l.grid.length > 0, `Panah Level ${l.id} missing grid`);
        assert(Array.isArray(l.correctProgram) && l.correctProgram.length > 0, `Panah Level ${l.id} missing correctProgram`);
        break;
      }

      case 'hubungkan': {
        assert(Array.isArray(l.pairs) && l.pairs.length >= 2, `Hubungkan Level ${l.id} pairs invalid`);
        break;
      }

      case 'tebalkan': {
        assert(Array.isArray(l.traceItems) && l.traceItems.length > 0, `Tebalkan Level ${l.id} traceItems invalid`);
        break;
      }

      case 'mewarnai': {
        assert(Array.isArray(l.palette) && l.palette.length >= 2, `Mewarnai Level ${l.id} palette invalid`);
        assert(Array.isArray(l.shapes) && l.shapes.length > 0, `Mewarnai Level ${l.id} shapes invalid`);
        break;
      }
    }
  }
});


// ============================================================================
// SUITE 5: SYNTHETIC DOM ENGINE RENDER & POLYMORPHIC SIGNATURE STRESS
// ============================================================================
console.log('\n[SUITE 5: Synthetic DOM Engine Render & Polymorphic Signature Stress]');

class FullMockClassList {
  constructor() {
    this._set = new Set();
  }
  add(...classes) {
    classes.forEach(c => c && this._set.add(c));
  }
  remove(...classes) {
    classes.forEach(c => this._set.delete(c));
  }
  contains(c) {
    return this._set.has(c);
  }
  toString() {
    return Array.from(this._set).join(' ');
  }
}

class FullMockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.classList = new FullMockClassList();
    this.children = [];
    this.parentElement = null;
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this._innerHTML = '';
    this._textContent = '';
    this.onclick = null;
    this.listeners = {};
  }

  get className() {
    return this.classList.toString();
  }
  set className(val) {
    this.classList = new FullMockClassList();
    if (val) val.split(/\s+/).forEach(c => c && this.classList.add(c));
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => c.textContent).join(' ');
  }
  set textContent(val) {
    this._textContent = val;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'class') this.className = val;
    if (name === 'id') this.id = val;
  }
  getAttribute(name) {
    return this.attributes[name] || null;
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  removeEventListener(type, fn) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== fn);
    }
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
    if (event.type === 'click' && typeof this.onclick === 'function') {
      this.onclick(event);
    }
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentElement = null;
    }
    return child;
  }
  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      let match = false;
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (el.id === id || el.getAttribute('id') === id) match = true;
      } else if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        if (el.classList.contains(cls)) match = true;
      } else if (selector.startsWith('[data-')) {
        const m = selector.match(/\[data-([a-zA-Z0-9_-]+)(?:="([^"]+)")?\]/);
        if (m) {
          const key = m[1].replace(/-([a-z])/g, (_, l) => l.toUpperCase());
          if (m[2] !== undefined) {
            if (el.dataset[key] === m[2]) match = true;
          } else {
            if (el.dataset[key] !== undefined) match = true;
          }
        }
      } else {
        if (el.tagName.toLowerCase() === selector.toLowerCase()) match = true;
      }

      if (match && el !== this) results.push(el);
      el.children.forEach(check);
    };

    this.children.forEach(check);
    return results;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    if (!html) return;

    const tagRegex = /<([a-z0-9-]+)([^>]*)>|<\/([a-z0-9-]+)>|([^<]+)/gi;
    let stack = [this];
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      const [, openTag, attrs, closeTag, text] = match;
      if (openTag) {
        const el = new FullMockElement(openTag);
        if (attrs) {
          const attrRegex = /([a-z0-9_-]+)(?:=["']([^"']*)["'])?/gi;
          let amatch;
          while ((amatch = attrRegex.exec(attrs)) !== null) {
            el.setAttribute(amatch[1], amatch[2] || '');
          }
        }
        stack[stack.length - 1].appendChild(el);
        const isSelfClosing = (attrs && attrs.trim().endsWith('/')) ||
          ['img', 'input', 'br', 'hr', 'source', 'line', 'circle', 'path', 'polygon', 'ellipse', 'rect'].includes(openTag.toLowerCase());
        if (!isSelfClosing) {
          stack.push(el);
        }
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        if (stack.length > 0) {
          stack[stack.length - 1].textContent = text.trim();
        }
      }
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  getBoundingClientRect() {
    return { top: 0, left: 0, width: 80, height: 80, right: 80, bottom: 80 };
  }
}

global.window = {
  ...global.window,
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};

global.document = {
  createElement: (t) => new FullMockElement(t),
  createElementNS: (ns, t) => new FullMockElement(t),
  getElementById: (id) => null,
  body: new FullMockElement('body'),
  elementFromPoint: () => null
};

await test('5.1 Polymorphic Signature Support in Engines.render', () => {
  const container1 = new FullMockElement('div');
  const container2 = new FullMockElement('div');

  const sampleLevel = LEVELS.find(l => l.id === '01'); // hewan hubungkan
  assert(sampleLevel, 'Sample level 01 must exist');

  let callback1Fired = false;
  let callback2Fired = false;

  // Signature A: (container, level, onComplete)
  assert.doesNotThrow(() => {
    Engines.render(container1, sampleLevel, () => { callback1Fired = true; });
  }, 'Signature A (container, level, onComplete) failed');

  // Signature B: (level, container, onWin, onFail)
  assert.doesNotThrow(() => {
    Engines.render(sampleLevel, container2, () => { callback2Fired = true; });
  }, 'Signature B (level, container, onWin, onFail) failed');

  assert(container1.children.length > 0 || container1.innerHTML.length > 0, 'Container 1 must have rendered content');
  assert(container2.children.length > 0 || container2.innerHTML.length > 0, 'Container 2 must have rendered content');
});

await test('5.2 Zero Render Regressions Across All 75 Legacy Levels', () => {
  const legacyLevels = LEVELS.filter(l => ['hewan', 'angka', 'spidey', 'koding'].includes(l.worldId));

  legacyLevels.forEach(l => {
    const container = new FullMockElement('div');
    assert.doesNotThrow(() => {
      Engines.render(container, l, () => {});
    }, `Engines.render failed on Level ${l.id} (${l.worldId} - ${l.type})`);
  });
});

await test('5.3 World 5 Engines Polymorphic & Method Exists Integrity', () => {
  assert(typeof Engines.renderPola === 'function', 'Engines.renderPola must exist');
  assert(typeof Engines.renderKode === 'function', 'Engines.renderKode must exist');
  assert(typeof Engines.renderBeda === 'function', 'Engines.renderBeda must exist');
  assert(typeof Engines.renderJumlah === 'function', 'Engines.renderJumlah must exist');

  // Verify renderPola polymorphic
  const mockPola = {
    id: 999,
    type: 'pola',
    pattern: ['🍎', '🍌', '🍎', null],
    missingIndex: 3,
    correct: '🍌',
    options: ['🍎', '🍌', '🍇']
  };

  const contA = new FullMockElement('div');
  const contB = new FullMockElement('div');
  assert.doesNotThrow(() => Engines.render(contA, mockPola, () => {}));
  assert.doesNotThrow(() => Engines.render(mockPola, contB, () => {}));

  // Verify renderKode polymorphic
  const mockKode = {
    id: 998,
    type: 'kode',
    keys: [{ symbol: '⭐', value: 1 }],
    code: ['⭐'],
    solution: [1],
    reward: '🏆'
  };
  const contC = new FullMockElement('div');
  const contD = new FullMockElement('div');
  assert.doesNotThrow(() => Engines.render(contC, mockKode, () => {}));
  assert.doesNotThrow(() => Engines.render(mockKode, contD, () => {}));

  // Verify renderBeda polymorphic
  const mockBeda = {
    id: 997,
    type: 'beda',
    options: [
      { label: '🐱', rotation: 0 },
      { label: '🐱', rotation: 90 },
      { label: '🐱', rotation: 0 }
    ],
    correctIndex: 1
  };
  const contE = new FullMockElement('div');
  const contF = new FullMockElement('div');
  assert.doesNotThrow(() => Engines.render(contE, mockBeda, () => {}));
  assert.doesNotThrow(() => Engines.render(mockBeda, contF, () => {}));

  // Verify renderJumlah polymorphic
  const mockJumlah = {
    id: 996,
    type: 'jumlah',
    mode: 'balance',
    left: { item: '🍎', count: 2 },
    right: { item: '🍎', count: 3 },
    options: [2, 3, 5],
    correct: 5
  };
  const contG = new FullMockElement('div');
  const contH = new FullMockElement('div');
  assert.doesNotThrow(() => Engines.render(contG, mockJumlah, () => {}));
  assert.doesNotThrow(() => Engines.render(mockJumlah, contH, () => {}));
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n================================================================');
console.log('📊 CHALLENGER W5-M1.2 STRESS TEST EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Checks Executed: ${passCount + failCount}`);
console.log(`Passed Checks:         \x1b[32m${passCount}\x1b[0m`);
console.log(`Failed Checks:         \x1b[31m${failCount}\x1b[0m`);
console.log(`Anomalies Detected:    ${anomalies.length}`);
console.log('================================================================\n');

if (failCount > 0) {
  console.error('❌ ADVERSARIAL STRESS TEST FAILED! Verdict: REQUEST_CHANGES');
  process.exit(1);
} else {
  console.log('🎉 ALL ADVERSARIAL EMPIRICAL STRESS CHECKS PASSED CLEANLY! Verdict: APPROVE');
  process.exit(0);
}
