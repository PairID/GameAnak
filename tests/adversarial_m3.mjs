// tests/adversarial_m3.mjs
// Adversarial Stress Test Suite for Milestone 3 (App Orchestration, Audio/TTS, Parental Gate & Certificate)
// Tests boundary conditions, race conditions, edge cases, and integrity properties.

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('============================================================');
console.log('⚔️ ADVERSARIAL STRESS TEST SUITE: MILESTONE 3');
console.log('Challenging Assumptions, Stress-Testing Boundaries & Gate Resilience');
console.log('============================================================\n');

// ----------------------------------------------------------------------------
// SYNTHETIC DOM ENVIRONMENT
// ----------------------------------------------------------------------------
class MockClassList {
  constructor() {
    this._set = new Set();
  }
  add(...classes) {
    classes.forEach(c => {
      if (c) c.split(/\s+/).filter(Boolean).forEach(item => this._set.add(item));
    });
  }
  remove(...classes) {
    classes.forEach(c => {
      if (c) c.split(/\s+/).filter(Boolean).forEach(item => this._set.delete(item));
    });
  }
  contains(c) {
    return this._set.has(c);
  }
  toString() {
    return Array.from(this._set).join(' ');
  }
}

function matchSingleSelector(el, sel) {
  sel = sel.trim();
  if (!sel) return false;

  const attrRegex = /\[([a-zA-Z0-9_-]+)(?:=(?:["']?)([^"']*)(?:["']?))?\]/g;
  let attrMatch;
  let strippedSel = sel;
  while ((attrMatch = attrRegex.exec(sel)) !== null) {
    const [, attr, val] = attrMatch;
    let actualVal;
    if (attr.startsWith('data-')) {
      const prop = attr.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      actualVal = el.dataset ? el.dataset[prop] : undefined;
    } else {
      actualVal = el.getAttribute(attr);
    }
    if (actualVal === undefined || actualVal === null) return false;
    if (val !== undefined && String(actualVal) !== String(val)) return false;
  }
  strippedSel = strippedSel.replace(attrRegex, '');
  if (!strippedSel) return true;

  const idMatch = strippedSel.match(/#([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    if (el.id !== idMatch[1]) return false;
    strippedSel = strippedSel.replace(idMatch[0], '');
  }

  const classMatches = strippedSel.match(/\.([a-zA-Z0-9_-]+)/g);
  if (classMatches) {
    for (const cm of classMatches) {
      const clsName = cm.slice(1);
      if (!el.classList.contains(clsName)) return false;
    }
    strippedSel = strippedSel.replace(/\.([a-zA-Z0-9_-]+)/g, '');
  }

  strippedSel = strippedSel.trim();
  if (strippedSel) {
    if (el.tagName.toLowerCase() !== strippedSel.toLowerCase()) return false;
  }

  return true;
}

class MockElement {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this._classList = new MockClassList();
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = new Map();
    this._textContent = '';
    this._innerHTML = '';
    this.parentNode = null;
    this.value = '';
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

  get textContent() {
    if (this._textContent) return this._textContent;
    return this.children.map(c => c.textContent).join(' ');
  }
  set textContent(val) {
    this._textContent = String(val);
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
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
        const isSelfClosing = (attrs && attrs.trim().endsWith('/')) || ['img', 'input', 'br', 'hr', 'source', 'line'].includes(openTag.toLowerCase());
        if (!isSelfClosing) {
          stack.push(el);
        }
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        if (stack.length > 0) {
          stack[stack.length - 1]._textContent = text.trim();
        }
      }
    }
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

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    sel = sel.trim();
    const parts = sel.split(/\s+/).filter(Boolean);

    if (parts.length > 1) {
      let currentSet = [this];
      for (const part of parts) {
        const nextSet = [];
        for (const cur of currentSet) {
          nextSet.push(...cur.querySelectorAll(part));
        }
        currentSet = nextSet;
      }
      return currentSet;
    }

    const singleSel = parts[0];
    const results = [];
    const walk = (node) => {
      for (const ch of node.children) {
        if (matchSingleSelector(ch, singleSel)) results.push(ch);
        walk(ch);
      }
    };
    walk(this);
    return results;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
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

  addEventListener(event, handler, options = {}) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push({ handler, options });
  }

  removeEventListener(event, handler) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(l => l.handler !== handler);
    this.listeners.set(event, list);
  }

  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event.type;
    const list = this.listeners.get(type) || [];
    const remaining = [];
    list.forEach(entry => {
      entry.handler.call(this, event);
      if (!entry.options || !entry.options.once) {
        remaining.push(entry);
      }
    });
    this.listeners.set(type, remaining);
    if (typeof this['on' + type] === 'function') {
      this['on' + type](event);
    }
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    sel = sel.trim();
    const parts = sel.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      let currentSet = [this];
      for (const part of parts) {
        const nextSet = [];
        for (const cur of currentSet) {
          nextSet.push(...cur.querySelectorAll(part));
        }
        currentSet = nextSet;
      }
      return currentSet;
    }
    const singleSel = parts[0];
    const results = [];
    const walk = (node) => {
      for (const ch of node.children) {
        if (matchSingleSelector(ch, singleSel)) results.push(ch);
        walk(ch);
      }
    };
    walk(this);
    return results;
  }
}

const domRegistry = new Map();
function getOrCreateElement(id, tag = 'div') {
  if (!domRegistry.has(id)) {
    const el = new MockElement(tag, id);
    domRegistry.set(id, el);
  }
  return domRegistry.get(id);
}

const requiredIds = [
  'confettiCanvas', 'totalStarsCount', 'starCounter', 'viewWorlds', 'viewLevels',
  'viewGame', 'btnHeaderBack', 'instructionBar', 'welcomeMascot', 'worldsGrid',
  'levelsGrid', 'currentWorldTitle', 'currentWorldProgress', 'gameLevelBadge',
  'gameLevelTitle', 'promptText', 'mascotBubble', 'gameMount', 'btnSpeakPrompt',
  'modalVictory', 'victoryMascot', 'victoryStarsAnim', 'btnNextLevel',
  'btnReplayLevel', 'btnVictoryLevelSelect', 'btnOpenParent', 'parentHoldProgress',
  'modalParent', 'btnCancelParentGate', 'btnCloseParentDash', 'btnSaveChildName',
  'inputChildName', 'btnTestSfx', 'btnTestTts', 'btnResetProgress',
  'parentGateSection', 'parentDashboardSection', 'parentMathQuestion',
  'parentMathChoices', 'worldRecapList', 'btnOpenCert', 'modalCertificate',
  'btnPrintCert', 'btnCloseCert', 'certChildName', 'certTotalStars',
  'certCompletedLevels', 'certIssueDate', 'certMascotLeft', 'certMascotRight'
];
requiredIds.forEach(id => getOrCreateElement(id));

const mockCanvas = getOrCreateElement('confettiCanvas', 'canvas');
mockCanvas.getContext = () => ({
  clearRect: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  fillRect: () => {},
  fillStyle: ''
});

globalThis.document = {
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => new MockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  readyState: 'complete'
};

const windowListeners = new Map();
globalThis.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: (event, handler, options = {}) => {
    if (!windowListeners.has(event)) windowListeners.set(event, []);
    windowListeners.get(event).push({ handler, options });
  },
  removeEventListener: (event, handler) => {
    if (!windowListeners.has(event)) return;
    const list = windowListeners.get(event).filter(l => l.handler !== handler);
    windowListeners.set(event, list);
  },
  dispatchEvent: (event) => {
    const type = typeof event === 'string' ? event : event.type;
    const list = windowListeners.get(type) || [];
    const remaining = [];
    list.forEach(entry => {
      entry.handler.call(globalThis.window, event);
      if (!entry.options || !entry.options.once) {
        remaining.push(entry);
      }
    });
    windowListeners.set(type, remaining);
  },
  print: () => { globalThis.__PRINT_CALLED = true; }
};

const storageStore = new Map();
globalThis.localStorage = {
  getItem: (key) => storageStore.has(key) ? storageStore.get(key) : null,
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

const { AppController, ConfettiEffect, App } = await import('../app.js');
const { sound } = await import('../audio.js');
const { WORLDS, LEVELS } = await import('../levels.js');

let passCount = 0;
let totalCount = 0;

function check(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function asyncCheck(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

// ============================================================================
// SUITE 1: PARENTAL GATE MATH CHALLENGE EMPIRICAL STRESS TEST
// ============================================================================
console.log('\n--- SUITE 1: Parental Gate Math Challenge Empirical Robustness ---');

check('ADV.MAT.1 Math question generation distribution over 2,000 iterations', () => {
  const app = new AppController();
  const seenSums = new Set();
  const seenA = new Set();
  const seenB = new Set();

  for (let i = 0; i < 2000; i++) {
    app.openParentalGateModal();
    const sum = app.currentMathAnswer;
    assert(sum >= 3 && sum <= 17, `Sum ${sum} must be between 3 and 17`);
    seenSums.add(sum);

    const questionText = domRegistry.get('parentMathQuestion').textContent;
    const match = questionText.match(/Berapa (\d+) \+ (\d+)\?/);
    assert(match, `Question text must match pattern: ${questionText}`);

    const a = Number(match[1]);
    const b = Number(match[2]);
    assert(a >= 2 && a <= 9, `Operand a=${a} must be in [2..9]`);
    assert(b >= 1 && b <= 8, `Operand b=${b} must be in [1..8]`);
    assert.strictEqual(a + b, sum, `Sum of operands must equal currentMathAnswer`);
    seenA.add(a);
    seenB.add(b);

    const choicesEl = domRegistry.get('parentMathChoices');
    assert.strictEqual(choicesEl.children.length, 6, 'Must generate exactly 6 buttons');

    const choiceValues = choicesEl.children.map(c => Number(c.dataset.val));
    const uniqueValues = new Set(choiceValues);
    assert.strictEqual(uniqueValues.size, 6, `All 6 choice values must be distinct, got ${choiceValues}`);
    assert(uniqueValues.has(sum), `Correct answer ${sum} must be included in choices`);

    for (const val of uniqueValues) {
      assert(val > 0 && val <= 20, `Choice value ${val} must be in (0, 20]`);
      assert(Number.isInteger(val), `Choice value ${val} must be integer`);
    }
  }

  // Ensure full coverage of operand ranges
  assert(seenSums.size >= 12, 'Must exhibit diverse random sums');
  assert(seenA.size >= 7, 'Must exhibit diverse operand a values');
  assert(seenB.size >= 7, 'Must exhibit diverse operand b values');
});

check('ADV.MAT.2 Gate rejection on incorrect answers and edge non-number inputs', () => {
  const app = new AppController();
  app.openParentalGateModal();
  const correct = app.currentMathAnswer;

  const testCases = [
    correct + 1,
    correct - 1,
    0,
    -5,
    999,
    'wrong',
    null,
    undefined,
    NaN
  ];

  testCases.forEach(badInput => {
    app.handleMathChoice(badInput);
    assert.strictEqual(domRegistry.get('parentDashboardSection').style.display, 'none', `Bad input ${badInput} must NOT open dashboard`);
    assert.strictEqual(domRegistry.get('parentGateSection').style.display, 'flex', `Gate must remain on gate section`);
  });

  // Verify correct answer unlocks
  app.handleMathChoice(correct);
  assert.strictEqual(domRegistry.get('parentDashboardSection').style.display, 'flex', `Correct answer ${correct} must unlock dashboard`);
  assert.strictEqual(domRegistry.get('parentGateSection').style.display, 'none');
});

// ============================================================================
// SUITE 2: HOLD TIMER DYNAMICS & ADVERSARIAL GESTURES
// ============================================================================
console.log('\n--- SUITE 2: Hold Timer Dynamics & Adversarial Gestures ---');

await asyncCheck('ADV.HLD.1 Rapid toddler frenzy tapping (20 rapid taps < 50ms) never triggers gate', async () => {
  const app = new AppController();
  const btnParent = domRegistry.get('btnOpenParent');
  const modalParent = domRegistry.get('modalParent');
  modalParent.style.display = 'none';

  for (let i = 0; i < 20; i++) {
    btnParent.dispatchEvent({ type: 'pointerdown' });
    btnParent.dispatchEvent({ type: 'touchstart', preventDefault: () => {} });
    await new Promise(r => setTimeout(r, 20));
    btnParent.dispatchEvent({ type: 'pointerup' });
    btnParent.dispatchEvent({ type: 'touchend' });
    assert.strictEqual(modalParent.style.display, 'none', `Frenzy tap #${i} must not open modal`);
  }
  assert.strictEqual(app.holdTimer, null, 'Hold timer must be null after release');
  assert.strictEqual(domRegistry.get('parentHoldProgress').style.width, '0%', 'Progress bar must reset to 0%');
});

await asyncCheck('ADV.HLD.2 Abrupt pointercancel / pointerleave aborts hold cleanly', async () => {
  const app = new AppController();
  const btnParent = domRegistry.get('btnOpenParent');
  const modalParent = domRegistry.get('modalParent');
  modalParent.style.display = 'none';

  btnParent.dispatchEvent({ type: 'pointerdown' });
  await new Promise(r => setTimeout(r, 100));
  // Toddler slides finger outside button bounds
  btnParent.dispatchEvent({ type: 'pointerleave' });

  assert.strictEqual(app.holdTimer, null, 'Timer must be cancelled on pointerleave');
  assert.strictEqual(domRegistry.get('parentHoldProgress').style.width, '0%');
  assert.strictEqual(modalParent.style.display, 'none');

  btnParent.dispatchEvent({ type: 'pointerdown' });
  await new Promise(r => setTimeout(r, 100));
  // System gesture cancels touch
  btnParent.dispatchEvent({ type: 'pointercancel' });

  assert.strictEqual(app.holdTimer, null, 'Timer must be cancelled on pointercancel');
  assert.strictEqual(domRegistry.get('parentHoldProgress').style.width, '0%');
  assert.strictEqual(modalParent.style.display, 'none');
});

// ============================================================================
// SUITE 3: LOCALSTORAGE CORRUPTION & FALLBACK STRESS TEST
// ============================================================================
console.log('\n--- SUITE 3: Storage Resilience, Corruption & Total Failure ---');

check('ADV.STR.1 Completely disabled / missing localStorage survival', () => {
  const origStorage = globalThis.localStorage;
  delete globalThis.localStorage;

  const app = new AppController();
  assert.doesNotThrow(() => {
    app.safeStorageSet('key', 'val');
    app.safeStorageGet('key', 'fallback');
    app.safeStorageRemove('key');
    app.saveProgress();
    app.loadProgress();
  }, 'AppController must function in environments where localStorage is undefined');

  globalThis.localStorage = origStorage;
});

check('ADV.STR.2 Malformed JSON data in all storage keys', () => {
  const app = new AppController();
  const corruptPayloads = [
    '<<<not json>>>',
    '{"incomplete":',
    '12345',
    'null',
    'undefined',
    '[1, 2, 3]',
    '{"01": "corrupt_non_number"}'
  ];

  corruptPayloads.forEach(payload => {
    localStorage.setItem('spidey_completed_levels', payload);
    localStorage.setItem('spidey_progress', payload);
    assert.doesNotThrow(() => app.loadProgress(), `Corrupt payload "${payload}" must not crash loadProgress`);
  });
});

check('ADV.STR.3 Safe Progress Reset flushes all keys cleanly', () => {
  const app = new AppController();
  app.completedLevels = { '01': 3, '02': 3, '03': 3, '50': 3 };
  app.saveProgress();

  assert.strictEqual(app.getTotalStars(), 12);
  assert.strictEqual(app.getCompletedLevelsCount(), 4);

  app.resetProgress();
  assert.strictEqual(app.getTotalStars(), 0);
  assert.strictEqual(app.getCompletedLevelsCount(), 0);
  assert.strictEqual(localStorage.getItem('spidey_stars'), null);
  assert.strictEqual(localStorage.getItem('spidey_completed_levels'), null);
  assert.strictEqual(localStorage.getItem('spidey_progress'), null);
  assert.strictEqual(domRegistry.get('totalStarsCount').textContent, '0');
});

// ============================================================================
// SUITE 4: STATE MACHINE, LEVEL TRANSITIONS & BOUNDARIES
// ============================================================================
console.log('\n--- SUITE 4: State Machine, Navigation & Edge Boundaries ---');

check('ADV.NAV.1 Non-existent or null level launch graceful handling', () => {
  const app = new AppController();
  assert.doesNotThrow(() => app.launchLevel(null), 'launchLevel(null) must not crash');
  assert.doesNotThrow(() => app.launchLevel('undefined'), 'launchLevel("undefined") must not crash');
  assert.doesNotThrow(() => app.launchLevel('99999'), 'launchLevel("99999") must not crash');
});

check('ADV.NAV.2 Boundary navigation: Next Level from last level of a world', () => {
  App.showLevelsView('koding');
  const kodingLevels = LEVELS.filter(l => l.worldId === 'koding');
  const lastLevel = kodingLevels[kodingLevels.length - 1];

  App.launchLevel(lastLevel.id);
  App.handleVictory(lastLevel);

  // Click next level when already on the last level
  const btnNext = domRegistry.get('btnNextLevel');
  btnNext.click();

  // Must cleanly return to levels view without throwing or advancing to invalid level
  assert.strictEqual(App.currentView, 'levels', 'Finishing last level in world must return to levels view');
  assert.strictEqual(domRegistry.get('modalVictory').style.display, 'none', 'Victory modal must close');
});

check('ADV.NAV.3 Idempotency stress: 10 consecutive victory triggers on same level', () => {
  const app = new AppController();
  const lvl = LEVELS[5];
  app.launchLevel(lvl.id);

  const initialStars = app.getTotalStars();
  for (let i = 0; i < 10; i++) {
    app.handleVictory(lvl);
  }

  // Should have been processed only once
  assert.strictEqual(app.getTotalStars(), initialStars + 3, 'Repeated victory calls must only award 3 stars once');
  app.closeVictory();
});

// ============================================================================
// SUITE 5: AUDIO SYNCHRONIZATION, SPEECH CANCEL & USER GESTURE UNLOCK
// ============================================================================
console.log('\n--- SUITE 5: Audio & TTS Narration Orchestration ---');

check('ADV.AUD.1 User gesture audio unlock attaches and disengages listeners once', () => {
  const app = new AppController();
  app.audioUnlocked = false;

  let initCalled = false;
  const origInit = sound.init;
  sound.init = () => { initCalled = true; };

  app.attachAudioUnlock();
  assert.strictEqual(app.audioUnlocked, false);

  // Trigger pointerdown
  window.dispatchEvent({ type: 'pointerdown' });
  assert.strictEqual(app.audioUnlocked, true, 'Audio must unlock on pointerdown');
  assert.strictEqual(initCalled, true, 'sound.init must be invoked');

  // Trigger subsequent gestures - should NOT re-invoke or error
  initCalled = false;
  window.dispatchEvent({ type: 'click' });
  window.dispatchEvent({ type: 'touchstart' });
  assert.strictEqual(initCalled, false, 'Listeners must be removed after first gesture');

  sound.init = origInit;
});

check('ADV.AUD.2 Indonesian TTS prompt narration & replay button synchronization', () => {
  let spokenHistory = [];
  const origSpeak = sound.speak;
  const origStop = sound.stopSpeech;

  sound.speak = (text, onEnd) => {
    spokenHistory.push(text);
    if (onEnd) setTimeout(onEnd, 10);
  };
  sound.stopSpeech = () => {
    spokenHistory.push('__STOP__');
  };

  const lvl = LEVELS[10];
  App.launchLevel(lvl.id);

  assert(spokenHistory.includes(lvl.prompt), 'launchLevel must speak prompt');
  const speakerBtn = domRegistry.get('btnSpeakPrompt');
  assert(speakerBtn.classList.contains('speaking'), 'Speaker button must have speaking class during speech');

  // Replay speech
  speakerBtn.click();
  assert.strictEqual(spokenHistory.filter(t => t === lvl.prompt).length, 2, 'Speaker button click must replay prompt');

  // Switch view stops speech
  App.showWorldsView();
  assert(spokenHistory.includes('__STOP__'), 'Switching views must call stopSpeech');

  sound.speak = origSpeak;
  sound.stopSpeech = origStop;
});

// ============================================================================
// SUITE 6: CHAMPIONSHIP CERTIFICATE VERIFICATION
// ============================================================================
console.log('\n--- SUITE 6: Championship Certificate Data Pipeline ---');

check('ADV.CRT.1 Certificate personalization, stats, and Indonesian date format', () => {
  const app = new AppController();
  app.childName = 'Muhammad Fatih';
  app.completedLevels = { '01': 3, '02': 3, '05': 3, '20': 3, '40': 3 };

  app.openCertificateModal();

  assert.strictEqual(domRegistry.get('certChildName').textContent, 'Muhammad Fatih');
  assert.strictEqual(domRegistry.get('certTotalStars').textContent, '15');
  assert.strictEqual(domRegistry.get('certCompletedLevels').textContent, '5');

  const dateText = domRegistry.get('certIssueDate').textContent;
  const validMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  assert(validMonths.some(m => dateText.includes(m)), `Date "${dateText}" must include Indonesian month name`);
  assert(dateText.includes('Tanggal:'), `Date "${dateText}" must start with Tanggal:`);

  // Left & Right mascots rendered
  assert(domRegistry.get('certMascotLeft').innerHTML.includes('<svg'), 'Left mascot SVG rendered');
  assert(domRegistry.get('certMascotRight').innerHTML.includes('<svg'), 'Right robot SVG rendered');
});

check('ADV.CRT.2 Print Certificate invokes native window.print()', () => {
  globalThis.__PRINT_CALLED = false;
  const btnPrint = domRegistry.get('btnPrintCert');
  btnPrint.click();
  assert.strictEqual(globalThis.__PRINT_CALLED, true, 'window.print() was called');
});

// ============================================================================
// SUITE 7: CONFETTI ENGINE RESILIENCE
// ============================================================================
console.log('\n--- SUITE 7: Confetti Engine Particles Lifecycle ---');

check('ADV.CNF.1 Canvas resizing and animation frame control', () => {
  const canvas = domRegistry.get('confettiCanvas');
  const effect = new ConfettiEffect(canvas);

  effect.resize();
  assert.strictEqual(canvas.width, 1024);
  assert.strictEqual(canvas.height, 768);

  effect.start(500);
  assert.strictEqual(effect.active, true);
  assert.strictEqual(effect.particles.length, 75);

  // Multiple stop calls should be idempotent
  effect.stop();
  effect.stop();
  assert.strictEqual(effect.active, false);
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n============================================================');
console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY: ${passCount} / ${totalCount} PASSED`);
console.log('============================================================\n');

if (passCount === totalCount) {
  console.log('🏆 ALL ADVERSARIAL CHALLENGES SURVIVED WITH ZERO VULNERABILITIES!');
  process.exit(0);
} else {
  console.error(`❌ ${totalCount - passCount} ADVERSARIAL CHECKS FAILED`);
  process.exit(1);
}
