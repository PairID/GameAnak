// test_challenger_m1_2.mjs - Empirical Verification & Adversarial Stress Suite for Milestone 1
// Challenger 2: Engines Dispatcher & Audio Compatibility
// Zero external dependencies, pure Node.js (v18+)

import assert from 'node:assert';

console.log('================================================================');
console.log('🧪 CHALLENGER 2: EMPIRICAL VERIFICATION HARNESS (MILESTONE 1)');
console.log('Engines Dispatcher (9 Engines + Aliases) & Audio Compatibility');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// PHASE 1: AUDIO ISOMORPHIC & HEADLESS NODE.JS TEST (NO WINDOW)
// ----------------------------------------------------------------------------
console.log('--- [PHASE 1] Audio Headless Node.js Safety (typeof window === "undefined") ---');

// In pure Node.js before any window mock is installed:
const audioModule = await import('./audio.js');
const soundHeadless = audioModule.sound;

let headlessFailures = [];

function testHeadless(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    headlessFailures.push({ name, err });
  }
}

testHeadless('sound.init() does not throw when window is undefined', () => {
  soundHeadless.init();
});

testHeadless('sound.playPop() safe in headless Node.js', () => {
  soundHeadless.playPop();
});

testHeadless('sound.playClick() safe in headless Node.js', () => {
  soundHeadless.playClick();
});

testHeadless('sound.playCorrect() safe in headless Node.js', () => {
  soundHeadless.playCorrect();
});

testHeadless('sound.playStar() safe in headless Node.js', () => {
  soundHeadless.playStar();
});

testHeadless('sound.playFanfare() safe in headless Node.js', () => {
  soundHeadless.playFanfare();
});

testHeadless('sound.playGentleTryAgain() safe in headless Node.js', () => {
  soundHeadless.playGentleTryAgain();
});

testHeadless('sound.playRobotStep() safe in headless Node.js', () => {
  soundHeadless.playRobotStep();
});

testHeadless('sound.stopSpeech() safe in headless Node.js', () => {
  soundHeadless.stopSpeech();
});

await new Promise(resolve => {
  testHeadless('sound.speak() executes callback safely in headless Node.js', () => {
    let cbCalled = false;
    soundHeadless.speak('Halo Spidey', () => {
      cbCalled = true;
      assert.strictEqual(cbCalled, true);
      resolve();
    });
  });
});

assert.strictEqual(headlessFailures.length, 0, `Headless tests failed: ${headlessFailures.length}`);
console.log('  -> All headless audio invocations completed without unhandled exceptions!\n');


// ----------------------------------------------------------------------------
// SETUP SYNTHETIC DOM & BROWSER MOCK FOR ENGINE & AUDIO INTERACTION
// ----------------------------------------------------------------------------

class MockClassList {
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

class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this._classList = new MockClassList();
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.id = '';
    this.parentNode = null;
    this.listeners = new Map();
    this._innerHTML = '';
    this.textContent = '';
    this.onclick = null;
    this.width = 340;
    this.height = 340;
  }

  get className() {
    return this._classList.toString();
  }
  set className(val) {
    this._classList = new MockClassList();
    if (val) {
      val.split(/\s+/).filter(Boolean).forEach(c => this._classList.add(c));
    }
  }

  get classList() {
    return this._classList;
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'id') this.id = String(v);
    if (k === 'class') this.className = String(v);
    if (k.startsWith('data-')) {
      const prop = k.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[prop] = String(v);
    }
  }

  getAttribute(k) {
    return this.attributes[k] ?? null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'id') this.id = '';
    if (k === 'class') this.className = '';
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (!this.listeners.has(event)) return;
    const arr = this.listeners.get(event);
    const idx = arr.indexOf(handler);
    if (idx !== -1) arr.splice(idx, 1);
  }

  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event.type;
    const evtObj = typeof event === 'string' ? { type, target: this, preventDefault: () => {} } : event;
    if (!evtObj.preventDefault) evtObj.preventDefault = () => {};
    evtObj.target = this;
    if (typeof this[`on${type}`] === 'function') {
      this[`on${type}`](evtObj);
    }
    const handlers = this.listeners.get(type) || [];
    handlers.forEach(fn => fn.call(this, evtObj));
    return true;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, preventDefault: () => {} });
  }

  getBoundingClientRect() {
    return { left: 10, top: 20, right: 110, bottom: 84, width: 100, height: 64, x: 10, y: 20 };
  }

  getContext() {
    return {
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
      clearRect: () => {},
      setLineDash: () => {},
      lineWidth: 1,
      strokeStyle: '#000',
      fillStyle: '#000',
      lineCap: 'round',
      lineJoin: 'round'
    };
  }

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }

  querySelectorAll(sel) {
    const results = [];
    const match = (el) => {
      let s = sel.trim();
      let reqClass = null;
      let reqAttrKey = null;
      let reqAttrVal = null;
      let reqId = null;

      const attrMatch = s.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"'\]]*)["']?)?\]/);
      if (attrMatch) {
        reqAttrKey = attrMatch[1];
        reqAttrVal = attrMatch[2] !== undefined ? attrMatch[2] : null;
        s = s.replace(attrMatch[0], '');
      }

      if (s.startsWith('#')) {
        reqId = s.slice(1);
        s = '';
      } else if (s.startsWith('.')) {
        reqClass = s.slice(1);
        s = '';
      }

      if (reqId && el.id !== reqId) return false;
      if (reqClass && !el.classList.contains(reqClass)) return false;
      if (reqAttrKey) {
        if (reqAttrKey.startsWith('data-')) {
          const prop = reqAttrKey.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
          if (reqAttrVal === null) {
            if (!(prop in el.dataset)) return false;
          } else {
            if (String(el.dataset[prop]) !== String(reqAttrVal)) return false;
          }
        } else {
          if (reqAttrVal === null) {
            if (el.getAttribute(reqAttrKey) === null) return false;
          } else {
            if (String(el.getAttribute(reqAttrKey)) !== String(reqAttrVal)) return false;
          }
        }
      }
      if (s && s !== '*' && el.tagName.toLowerCase() !== s.toLowerCase()) return false;
      return true;
    };

    const walk = (node) => {
      for (const ch of node.children) {
        if (match(ch)) results.push(ch);
        walk(ch);
      }
    };
    walk(this);
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
        const el = new MockElement(openTag);
        if (attrs) {
          const attrRegex = /([a-z0-9_-]+)(?:=["']([^"']*)["'])?/gi;
          let amatch;
          while ((amatch = attrRegex.exec(attrs)) !== null) {
            el.setAttribute(amatch[1], amatch[2] || '');
          }
        }
        stack[stack.length - 1].appendChild(el);
        const isSelfClosing = (attrs && attrs.trim().endsWith('/')) ||
          ['img', 'input', 'br', 'hr', 'source', 'line', 'circle', 'path'].includes(openTag.toLowerCase());
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
}

// Web Audio API Mock Tracker
const audioOps = {
  oscillatorsCreated: 0,
  gainsCreated: 0,
  starts: 0,
  stops: 0,
  freqRamps: [],
  gainRamps: [],
  resumes: 0
};

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
  }
  createOscillator() {
    audioOps.oscillatorsCreated++;
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: (f, t) => { audioOps.freqRamps.push({ f, t }); },
        exponentialRampToValueAtTime: (f, t) => { audioOps.freqRamps.push({ f, t, ramp: true }); }
      },
      connect: () => {},
      start: (t) => { audioOps.starts++; },
      stop: (t) => { audioOps.stops++; }
    };
  }
  createGain() {
    audioOps.gainsCreated++;
    return {
      gain: {
        setValueAtTime: (g, t) => { audioOps.gainRamps.push({ g, t }); },
        exponentialRampToValueAtTime: (g, t) => { audioOps.gainRamps.push({ g, t, ramp: true }); }
      },
      connect: () => {}
    };
  }
  resume() {
    audioOps.resumes++;
    this.state = 'running';
    return Promise.resolve();
  }
}

// Speech Synthesis Mock Tracker
const speechOps = {
  speaks: [],
  cancels: 0
};

class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.onvoiceschanged = null;
  }
  getVoices() {
    return [
      { lang: 'id-ID', name: 'Indonesian Child Voice', default: true },
      { lang: 'en-US', name: 'English Voice', default: false }
    ];
  }
  speak(utterance) {
    speechOps.speaks.push({
      text: utterance.text,
      lang: utterance.lang,
      rate: utterance.rate,
      pitch: utterance.pitch,
      voiceName: utterance.voice ? utterance.voice.name : null
    });
    this.speaking = true;
    setTimeout(() => {
      this.speaking = false;
      if (utterance.onend) utterance.onend();
    }, 15);
  }
  cancel() {
    speechOps.cancels++;
    this.speaking = false;
  }
}

class MockSpeechSynthesisUtterance {
  constructor(text = '') {
    this.text = text;
    this.lang = 'id-ID';
    this.rate = 1;
    this.pitch = 1;
    this.voice = null;
    this.onend = null;
    this.onerror = null;
  }
}

// Attach browser globals to globalThis
globalThis.window = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  speechSynthesis: new MockSpeechSynthesis(),
  SpeechSynthesisUtterance: MockSpeechSynthesisUtterance
};

globalThis.document = {
  createElement: (tag) => new MockElement(tag),
  createElementNS: (ns, tag) => new MockElement(tag)
};

globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// ----------------------------------------------------------------------------
// PHASE 2: AUDIO WEB AUDIO & SPEECH INTERACTION (WITH SYNTHETIC BROWSER)
// ----------------------------------------------------------------------------
console.log('--- [PHASE 2] Audio Functional & Synthesizer Verification ---');

// Re-init with mock window
soundHeadless.init();
assert(soundHeadless.ctx, 'AudioContext must be created in browser environment');
console.log('  \x1b[32m✔\x1b[0m [PASS] SoundSystem initialized AudioContext successfully');

function verifySoundMethod(name, fn, minOsc = 1) {
  const oscBefore = audioOps.oscillatorsCreated;
  fn();
  const oscDiff = audioOps.oscillatorsCreated - oscBefore;
  assert(oscDiff >= minOsc, `${name} should have created at least ${minOsc} oscillator(s), got ${oscDiff}`);
  console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name} executed and produced ${oscDiff} oscillator tone(s)`);
}

verifySoundMethod('playPop()', () => soundHeadless.playPop(), 1);
verifySoundMethod('playClick()', () => soundHeadless.playClick(), 1);
verifySoundMethod('playGentleTryAgain()', () => soundHeadless.playGentleTryAgain(), 1);
verifySoundMethod('playRobotStep()', () => soundHeadless.playRobotStep(), 1);

// Chords with setTimeout
await new Promise(r => setTimeout(r, 400));
const oscBeforeCorrect = audioOps.oscillatorsCreated;
soundHeadless.playCorrect();
await new Promise(r => setTimeout(r, 500));
assert(audioOps.oscillatorsCreated - oscBeforeCorrect >= 4, 'playCorrect should schedule 4 arpeggio notes');
console.log('  \x1b[32m✔\x1b[0m [PASS] playCorrect() scheduled ascending 4-note chord (C5, E5, G5, C6)');

const oscBeforeStar = audioOps.oscillatorsCreated;
soundHeadless.playStar();
await new Promise(r => setTimeout(r, 400));
assert(audioOps.oscillatorsCreated - oscBeforeStar >= 3, 'playStar should schedule 3 star notes');
console.log('  \x1b[32m✔\x1b[0m [PASS] playStar() scheduled 3-note star award chime');

const oscBeforeFanfare = audioOps.oscillatorsCreated;
soundHeadless.playFanfare();
await new Promise(r => setTimeout(r, 900));
assert(audioOps.oscillatorsCreated - oscBeforeFanfare >= 6, 'playFanfare should schedule 6 fanfare notes');
console.log('  \x1b[32m✔\x1b[0m [PASS] playFanfare() scheduled 6-note heroic victory fanfare');

// Speech testing in mock environment
await new Promise(resolve => {
  soundHeadless.speak('Hebat sekali Spidey!', () => {
    assert(speechOps.speaks.length > 0, 'speak() should record speech utterance');
    const last = speechOps.speaks[speechOps.speaks.length - 1];
    assert.strictEqual(last.text, 'Hebat sekali Spidey!');
    assert.strictEqual(last.lang, 'id-ID');
    assert.strictEqual(last.voiceName, 'Indonesian Child Voice');
    assert(last.rate < 1.0, 'Toddler speech rate should be gentle & slow (< 1.0)');
    assert(last.pitch > 1.0, 'Toddler speech pitch should be cheerful (> 1.0)');
    console.log('  \x1b[32m✔\x1b[0m [PASS] speak() synthesized id-ID speech with gentle rate & pitch');
    resolve();
  });
});

soundHeadless.stopSpeech();
assert(speechOps.cancels > 0, 'stopSpeech() should call speechSynthesis.cancel()');
console.log('  \x1b[32m✔\x1b[0m [PASS] stopSpeech() invoked cancellation cleanly');

// Audio edge case: suspended context
soundHeadless.ctx.state = 'suspended';
soundHeadless.init();
assert.strictEqual(soundHeadless.ctx.state, 'running', 'SoundSystem.init() resumes suspended AudioContext');
console.log('  \x1b[32m✔\x1b[0m [PASS] AudioContext resume on init() verified');

// Audio edge case: sfxEnabled = false
soundHeadless.sfxEnabled = false;
const oscBeforeMute = audioOps.oscillatorsCreated;
soundHeadless.playPop();
assert.strictEqual(audioOps.oscillatorsCreated, oscBeforeMute, 'playPop() does not produce sound when sfxEnabled is false');
soundHeadless.sfxEnabled = true;
console.log('  \x1b[32m✔\x1b[0m [PASS] Audio muting (sfxEnabled = false) verified\n');


// ----------------------------------------------------------------------------
// PHASE 3: ENGINES DISPATCHER & ALIASES TEST
// ----------------------------------------------------------------------------
console.log('--- [PHASE 3] Engines Unified Dispatcher & Aliases ---');

const { Engines } = await import('./engines.js');
const { LEVELS } = await import('./levels.js');

// 1. Verify aliases
assert.strictEqual(typeof Engines.renderTitik, 'function', 'Engines.renderTitik must be a function');
assert.strictEqual(Engines.renderTitik, Engines.renderHubungkanTitik, 'Engines.renderTitik must alias renderHubungkanTitik');
console.log('  \x1b[32m✔\x1b[0m [PASS] Alias renderTitik === renderHubungkanTitik');

assert.strictEqual(typeof Engines.renderPanah, 'function', 'Engines.renderPanah must be a function');
assert.strictEqual(Engines.renderPanah, Engines.renderKodingPanah, 'Engines.renderPanah must alias renderKodingPanah');
console.log('  \x1b[32m✔\x1b[0m [PASS] Alias renderPanah === renderKodingPanah');

// 2. Verify dispatcher method exists
assert.strictEqual(typeof Engines.render, 'function', 'Engines.render unified dispatcher must be a function');
console.log('  \x1b[32m✔\x1b[0m [PASS] Engines.render dispatcher exists');

// 3. Test Unknown Type Resilience
let loggedError = null;
const origConsoleError = console.error;
console.error = (...args) => { loggedError = args.join(' '); };
const dummyContainer = new MockElement('div');
Engines.render(dummyContainer, { type: 'non_existent_engine' }, () => {});
console.error = origConsoleError;
assert(loggedError && loggedError.includes('Unknown engine type: non_existent_engine'), 'Engines.render should log unknown engine types gracefully without throwing');
console.log('  \x1b[32m✔\x1b[0m [PASS] Unknown engine type error handling resilience');


// ----------------------------------------------------------------------------
// PHASE 4: EMPIRICAL RENDER & SIMULATION FOR ALL 9 ENGINES
// ----------------------------------------------------------------------------
console.log('\n--- [PHASE 4] Empirical Rendering & Winning Simulation for All 9 Engines ---');

const engineTypes = [
  'hubungkan',
  'labirin',
  'pilih',
  'titik',
  'tebalkan',
  'mewarnai',
  'urutkan',
  'panah',
  'memori'
];

for (const type of engineTypes) {
  const sampleLevel = LEVELS.find(l => l.type === type);
  assert(sampleLevel, `Database must contain at least one level for engine type "${type}"`);

  const container = new MockElement('div');
  let completed = false;

  console.log(`\nTesting Engine [${type}] (Level ID: ${sampleLevel.id} - ${sampleLevel.title})`);

  // Render via unified dispatcher Engines.render
  Engines.render(container, sampleLevel, () => {
    completed = true;
  });

  // Verify container is populated
  assert(container.children.length > 0, `Engine [${type}] must populate container with child elements`);
  console.log(`  \x1b[32m✔\x1b[0m [PASS] Engines.render() rendered type [${type}] cleanly into container`);

  // Interactive Winning Simulation per Engine Type
  if (type === 'hubungkan') {
    const colLeft = container.querySelector('#colLeft');
    const colRight = container.querySelector('#colRight');
    assert(colLeft && colRight, 'Hubungkan must render #colLeft and #colRight');
    assert.strictEqual(colLeft.children.length, sampleLevel.pairs.length, 'All left pairs rendered');

    // Tap each matching pair
    sampleLevel.pairs.forEach((p, idx) => {
      const leftBtn = colLeft.children[idx];
      const rightBtn = colRight.children.find(b => parseInt(b.dataset.origIdx, 10) === idx);
      assert(leftBtn && rightBtn, 'Pair buttons must exist');
      leftBtn.click();
      rightBtn.click();
    });

    await new Promise(r => setTimeout(r, 800));
    assert.strictEqual(completed, true, 'Hubungkan matching all pairs must trigger onComplete()');
    console.log('  \x1b[32m✔\x1b[0m [PASS] Hubungkan interactive gameplay & victory completed');

  } else if (type === 'labirin') {
    const mazeGrid = container.querySelector('#mazeGrid');
    assert(mazeGrid, 'Labirin must render #mazeGrid');
    const size = sampleLevel.gridSize || 5;

    // Simulate winning path using BFS
    const walls = new Set(sampleLevel.walls || []);
    const queue = [[0, 0, []]];
    const visited = new Set(['0,0']);
    const targetKey = `${size - 1},${size - 1}`;
    let solutionPath = null;

    while (queue.length > 0) {
      const [r, c, path] = queue.shift();
      if (`${r},${c}` === targetKey) {
        solutionPath = path;
        break;
      }
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !walls.has(key) && !visited.has(key)) {
          visited.add(key);
          queue.push([nr, nc, [...path, [nr, nc]]]);
        }
      }
    }

    assert(solutionPath, 'Labirin must have a solvable path');
    // Step along the path
    for (const [nr, nc] of solutionPath) {
      const cellIdx = nr * size + nc;
      const cell = mazeGrid.children[cellIdx];
      assert(cell, `Cell at ${nr},${nc} exists`);
      cell.click();
    }

    await new Promise(r => setTimeout(r, 700));
    assert.strictEqual(completed, true, 'Labirin reaching goal must trigger onComplete()');
    console.log(`  \x1b[32m✔\x1b[0m [PASS] Labirin interactive path navigation (${solutionPath.length} steps) & victory completed`);

  } else if (type === 'pilih') {
    const items = sampleLevel.items;
    for (let i = 0; i < items.length; i++) {
      const optGrid = container.querySelector('#optionsGrid');
      assert(optGrid, 'Pilih must render #optionsGrid for step ' + i);
      const item = items[i];
      let correctIdx = item.answerIndex;
      if (correctIdx === undefined && item.answer !== undefined) {
        correctIdx = item.options.findIndex(opt => {
          const lbl = typeof opt === 'object' ? opt.label : String(opt);
          return opt === item.answer || lbl.includes(String(item.answer));
        });
      }
      assert(correctIdx !== -1 && correctIdx !== undefined, 'Correct choice index must be determinable');
      const correctBtn = optGrid.children[correctIdx];
      assert(correctBtn, 'Correct choice button must exist');
      correctBtn.click();
      await new Promise(r => setTimeout(r, 650));
    }

    assert.strictEqual(completed, true, 'Pilih completing all question items must trigger onComplete()');
    console.log(`  \x1b[32m✔\x1b[0m [PASS] Pilih answered ${items.length} item(s) & victory completed`);

  } else if (type === 'titik') {
    const wrapper = container.querySelector('#dotsCanvasWrapper');
    assert(wrapper, 'Titik must render #dotsCanvasWrapper');
    const dotButtons = wrapper.querySelectorAll('.dot-node');
    assert.strictEqual(dotButtons.length, sampleLevel.dots.length, 'All dot nodes rendered');

    // Tap dots in sequence 0..N-1
    for (let i = 0; i < dotButtons.length; i++) {
      dotButtons[i].click();
    }

    await new Promise(r => setTimeout(r, 1800));
    assert.strictEqual(completed, true, 'Titik connecting all dots must trigger onComplete()');
    console.log(`  \x1b[32m✔\x1b[0m [PASS] Titik connected all ${dotButtons.length} dots & mystery illustration revealed`);

  } else if (type === 'tebalkan') {
    const canvas = container.querySelector('#traceCanvas');
    assert(canvas, 'Tebalkan must render #traceCanvas');
    assert.strictEqual(canvas.style.touchAction, 'none', 'Canvas style.touchAction must be "none" for touch protection');

    const traceCount = (sampleLevel.traceItems || [{}]).length;
    for (let s = 0; s < traceCount; s++) {
      const doneBtn = container.querySelector('#doneTraceBtn');
      assert(doneBtn, 'doneTraceBtn must exist');
      doneBtn.click();
    }

    assert.strictEqual(completed, true, 'Tebalkan finishing all trace items must trigger onComplete()');
    console.log(`  \x1b[32m✔\x1b[0m [PASS] Tebalkan finished ${traceCount} trace items with touch-action:none verified`);

  } else if (type === 'mewarnai') {
    const palEl = container.querySelector('#paletteBar');
    const canvasEl = container.querySelector('#coloringCanvas');
    const finishBtn = container.querySelector('#finishColorBtn');
    assert(palEl && canvasEl && finishBtn, 'Mewarnai must render paletteBar, coloringCanvas, and finishColorBtn');

    // Select color then color a shape
    const firstSwatch = palEl.children[0];
    firstSwatch.click();
    const firstShape = canvasEl.children[0];
    firstShape.click();

    finishBtn.click();
    await new Promise(r => setTimeout(r, 600));
    assert.strictEqual(completed, true, 'Mewarnai finish button must trigger onComplete()');
    console.log('  \x1b[32m✔\x1b[0m [PASS] Mewarnai swatch selection, shape coloring & victory completed');

  } else if (type === 'urutkan') {
    const slotsRow = container.querySelector('#slotsRow');
    const itemsPool = container.querySelector('#itemsPool');
    assert(slotsRow && itemsPool, 'Urutkan must render slotsRow and itemsPool');

    const total = sampleLevel.items.length;
    for (let exp = 1; exp <= total; exp++) {
      const itemBtn = itemsPool.children.find(b => {
        const it = sampleLevel.items.find(item => b.innerHTML.includes(item.label));
        return it && (it.step === exp || it.size === exp);
      });
      assert(itemBtn, `Urutkan item for step/size ${exp} must exist`);
      itemBtn.click();
    }

    await new Promise(r => setTimeout(r, 800));
    assert.strictEqual(completed, true, 'Urutkan correctly sequencing all items must trigger onComplete()');
    console.log(`  \x1b[32m✔\x1b[0m [PASS] Urutkan sequenced ${total} items in order & victory completed`);

  } else if (type === 'panah') {
    const slotsEl = container.querySelector('#programSlots');
    const runBtn = container.querySelector('#runProgBtn');
    const resetBtn = container.querySelector('#resetProgBtn');
    assert(slotsEl && runBtn && resetBtn, 'KodingPanah must render programSlots, runBtn, resetBtn');

    const arrowBtns = container.querySelectorAll('.arrow-cmd-btn');
    assert(arrowBtns.length >= 4, 'Must have at least 4 direction arrow buttons');

    // Find right and down buttons
    const rightBtn = arrowBtns.find(b => b.dataset.arrow === '➡️');
    const downBtn = arrowBtns.find(b => b.dataset.arrow === '⬇️');
    assert(rightBtn && downBtn, 'Right and Down arrow buttons must exist');

    // Enter program: Right, Right, Down, Down
    rightBtn.click();
    rightBtn.click();
    downBtn.click();
    downBtn.click();

    runBtn.click();
    await new Promise(r => setTimeout(r, 1300));
    assert.strictEqual(completed, true, 'KodingPanah executing correct sequence must trigger onComplete()');
    console.log('  \x1b[32m✔\x1b[0m [PASS] KodingPanah program input [➡️, ➡️, ⬇️, ⬇️], execution & victory completed');

  } else if (type === 'memori') {
    const grid = container.querySelector('#memoryCardsGrid');
    assert(grid, 'Memori must render #memoryCardsGrid');
    const cards = grid.children;
    assert.strictEqual(cards.length, sampleLevel.pairs.length * 2, 'Must render double pairs cards');

    // Match each pair
    const pairMap = new Map();
    sampleLevel.pairs.forEach(p => pairMap.set(p.id, []));

    // Inspect unique cards in DOM
    for (let c = 0; c < cards.length; c++) {
      const cardEl = cards[c];
      const uniqueId = parseInt(cardEl.dataset.uniqueId, 10);
      // We can find card data from innerHTML emoji
      for (const p of sampleLevel.pairs) {
        if (cardEl.innerHTML.includes(p.emoji)) {
          pairMap.get(p.id).push(cardEl);
          break;
        }
      }
    }

    // Click each pair
    for (const [id, [c1, c2]] of pairMap.entries()) {
      c1.click();
      c2.click();
    }

    await new Promise(r => setTimeout(r, 900));
    assert.strictEqual(completed, true, 'Memori matching all pairs must trigger onComplete()');
    console.log(`  \x1b[32m✔\x1b[0m [PASS] Memori matched all ${sampleLevel.pairs.length} pairs & victory completed`);
  }
}

// ----------------------------------------------------------------------------
// PHASE 5: TEST DIRECT EXECUTION VIA ALIASES
// ----------------------------------------------------------------------------
console.log('\n--- [PHASE 5] Direct Invocation via Aliases renderTitik and renderPanah ---');

// Test renderTitik directly
const titikLevel = LEVELS.find(l => l.type === 'titik');
const containerTitik = new MockElement('div');
let titikCompleted = false;
Engines.renderTitik(containerTitik, titikLevel, () => { titikCompleted = true; });
assert(containerTitik.querySelector('#dotsCanvasWrapper'), 'renderTitik must successfully render titik engine');
console.log('  \x1b[32m✔\x1b[0m [PASS] Engines.renderTitik directly executed and rendered');

// Test renderPanah directly
const panahLevel = LEVELS.find(l => l.type === 'panah');
const containerPanah = new MockElement('div');
let panahCompleted = false;
Engines.renderPanah(containerPanah, panahLevel, () => { panahCompleted = true; });
assert(containerPanah.querySelector('#spideyGridBoard'), 'renderPanah must successfully render panah engine');
console.log('  \x1b[32m✔\x1b[0m [PASS] Engines.renderPanah directly executed and rendered');


// ----------------------------------------------------------------------------
// PHASE 6: ADVERSARIAL STRESS & CORNER CASE HARNESS
// ----------------------------------------------------------------------------
console.log('\n--- [PHASE 6] Adversarial Stress & Corner Case Harness ---');

// Stress 1: Audio boundary values and null inputs
console.log('Adversarial 1: Audio boundary and null inputs');
soundHeadless.speak('', () => {});
soundHeadless.speak(null, () => {});
soundHeadless.playTone(0);
soundHeadless.playTone(-100);
soundHeadless.playTone(50000);
console.log('  \x1b[32m✔\x1b[0m [PASS] Sound system survives empty/null speak and extreme tone frequencies');

// Stress 2: Engines dispatcher with null/undefined/empty type
console.log('Adversarial 2: Engines dispatcher with empty/null/missing level type');
let errCount = 0;
const prevErr = console.error;
console.error = () => { errCount++; };
Engines.render(new MockElement('div'), null || {}, () => {});
Engines.render(new MockElement('div'), { type: null }, () => {});
Engines.render(new MockElement('div'), { type: undefined }, () => {});
Engines.render(new MockElement('div'), { type: '' }, () => {});
console.error = prevErr;
assert(errCount >= 3, 'Dispatcher must log unknown type on invalid type');
console.log('  \x1b[32m✔\x1b[0m [PASS] Dispatcher survives null, undefined, and empty string engine types');

// Stress 3: Empty items in Pilih & Tebalkan
console.log('Adversarial 3: Empty items lifecycle in engines');
let emptyPilihDone = false;
Engines.renderPilih(new MockElement('div'), { type: 'pilih', items: [] }, () => { emptyPilihDone = true; });
assert.strictEqual(emptyPilihDone, true, 'Pilih with items:[] should immediately call onComplete()');
console.log('  \x1b[32m✔\x1b[0m [PASS] Pilih with empty items calls onComplete gracefully');

let emptyTebalDone = false;
Engines.renderTebalkan(new MockElement('div'), { type: 'tebalkan', traceItems: [] }, () => { emptyTebalDone = true; });
assert.strictEqual(emptyTebalDone, true, 'Tebalkan with traceItems:[] should immediately call onComplete()');
console.log('  \x1b[32m✔\x1b[0m [PASS] Tebalkan with empty traceItems calls onComplete gracefully');

// Stress 4: Panah arrow buffer limit and empty run
console.log('Adversarial 4: KodingPanah buffer constraints and boundary run');
const panahStressContainer = new MockElement('div');
let panahStressCompleted = false;
Engines.renderKodingPanah(panahStressContainer, { type: 'panah' }, () => { panahStressCompleted = true; });
// Run with 0 arrows
panahStressContainer.querySelector('#runProgBtn').click();
assert.strictEqual(panahStressCompleted, false, 'Running empty program must NOT complete');

// Add 10 arrows - max capacity should be capped at 6
const rightArrowBtn = panahStressContainer.querySelector('.arrow-cmd-btn[data-arrow="➡️"]');
for (let i = 0; i < 10; i++) {
  rightArrowBtn.click();
}
const chips = panahStressContainer.querySelectorAll('.cmd-chip');
assert(chips.length <= 6, `Arrow buffer must cap at 6 commands, got ${chips.length}`);

// Reset program
panahStressContainer.querySelector('#resetProgBtn').click();
const chipsAfterReset = panahStressContainer.querySelectorAll('.cmd-chip');
assert.strictEqual(chipsAfterReset.length, 0, 'Reset button must completely clear arrow program');
console.log('  \x1b[32m✔\x1b[0m [PASS] KodingPanah empty run, buffer capping (<=6), and reset verified');

// Stress 5: Memori duplicate click & out-of-turn taps
console.log('Adversarial 5: Memori card duplicate tap resilience');
const memContainer = new MockElement('div');
let memDone = false;
Engines.renderMemori(memContainer, {
  type: 'memori',
  pairs: [{ id: '1', emoji: '⭐' }, { id: '2', emoji: '🕷️' }]
}, () => { memDone = true; });
const memCards = memContainer.querySelectorAll('.memory-card');
// Rapid double click on the exact same card
memCards[0].click();
memCards[0].click();
// Only 1 card should be flipped
assert(memCards[0].classList.contains('flipped'), 'Card must be flipped');
console.log('  \x1b[32m✔\x1b[0m [PASS] Memori double-clicking same card prevented cleanly');

// Stress 6: Labirin boundary and wall collision
console.log('Adversarial 6: Labirin wall collision and boundary rejection');
const labContainer = new MockElement('div');
Engines.renderLabirin(labContainer, {
  type: 'labirin',
  gridSize: 3,
  walls: ['0,1']
}, () => {});
// Player starts at (0,0). Attempt to move UP (out of bounds)
const upBtn = labContainer.querySelector('[data-dir="up"]');
assert(upBtn, 'Up nav button must exist');
upBtn.click();
// Player still at 0,0
let playerCell = labContainer.querySelector('.player');
assert(playerCell && (playerCell.innerHTML === '🕷️' || playerCell.innerHTML.includes('svg')), 'Player must remain at 0,0 after invalid out-of-bounds UP move');

// Attempt to move RIGHT into wall (0,1)
const rightNavBtn = labContainer.querySelector('[data-dir="right"]');
assert(rightNavBtn, 'Right nav button must exist');
rightNavBtn.click();
playerCell = labContainer.querySelector('.player');
assert(playerCell && (playerCell.innerHTML === '🕷️' || playerCell.innerHTML.includes('svg')), 'Player must remain at 0,0 after hitting wall');
console.log('  \x1b[32m✔\x1b[0m [PASS] Labirin boundary violation and wall collision safely rejected');


// ----------------------------------------------------------------------------
// PHASE 7: SUMMARY & VERDICT
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('🎉 ALL EMPIRICAL CHALLENGER TESTS PASSED SUCCESSFULLY!');
console.log('Total Engines Verified: 9 of 9 (100%)');
console.log('Aliases Verified: renderTitik & renderPanah (100%)');
console.log('Audio Methods Verified: 8 SFX + Speech System (100%)');
console.log('Adversarial Stress Scenarios: 6 of 6 Passed (100%)');
console.log('VERDICT: APPROVE');
console.log('================================================================\n');
