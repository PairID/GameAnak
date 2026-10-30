// tests/test_challenger_m3_2.mjs - Empirical Verification & Adversarial Stress Suite for Milestone 3
// Challenger 2: Parental Gate Hold Timer & Math Challenge, LocalStorage Resilience & Fallback
// Zero external dependencies, pure Node.js (v18+)

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS TEST SUITE (M3)');
console.log('Parental Gate Hold Timer & Math Gate, LocalStorage Resilience');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    failures.push({ name, error: err });
    failCount++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    failures.push({ name, error: err });
    failCount++;
  }
}

// ============================================================================
// LIGHTWEIGHT SYNTHETIC DOM ENVIRONMENT FOR TEST HARNESS
// ============================================================================
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
    this.offsetWidth = 100;
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

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
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
    const evt = typeof event === 'string'
      ? { type, target: this, cancelable: true, preventDefault: () => {} }
      : Object.assign({ cancelable: true, preventDefault: () => {} }, event);

    if (typeof this[`on${type}`] === 'function') {
      this[`on${type}`](evt);
    }
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(h => h(evt));
    }
  }

  click() {
    this.dispatchEvent('click');
  }

  getContext(type) {
    if (type === '2d') {
      return {
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        arc: () => {},
        fill: () => {},
        clearRect: () => {},
        fillRect: () => {},
        setLineDash: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        lineWidth: 1,
        strokeStyle: '#000',
        fillStyle: '#000',
        lineCap: 'round'
      };
    }
    return null;
  }
}

// Global Mocks for Headless Node.js Environment
const domRegistry = new Map();

function registerElement(id, tag = 'div') {
  const el = new MockElement(tag, id);
  domRegistry.set(id, el);
  return el;
}

const mockDocument = {
  getElementById(id) {
    return domRegistry.get(id) || null;
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  readyState: 'complete'
};

const storageStore = new Map();
let storageThrowsOnGet = null;
let storageThrowsOnSet = null;
let storageThrowsOnRemove = null;

const mockLocalStorage = {
  getItem: (k) => {
    if (storageThrowsOnGet) throw storageThrowsOnGet;
    return storageStore.has(k) ? storageStore.get(k) : null;
  },
  setItem: (k, v) => {
    if (storageThrowsOnSet) throw storageThrowsOnSet;
    storageStore.set(k, String(v));
  },
  removeItem: (k) => {
    if (storageThrowsOnRemove) throw storageThrowsOnRemove;
    storageStore.delete(k);
  },
  clear: () => storageStore.clear()
};

globalThis.document = mockDocument;
globalThis.localStorage = mockLocalStorage;
globalThis.window = {
  innerWidth: 1024,
  innerHeight: 768,
  print: () => { globalThis.__PRINT_CALLED = true; },
  addEventListener: () => {},
  removeEventListener: () => {}
};
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 10);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Populate DOM Registry matching index.html IDs
const requiredIds = [
  'app', 'btnHeaderBack', 'headerTitle', 'starCounter', 'totalStarsCount',
  'btnOpenCert', 'btnOpenParent', 'parentHoldProgress',
  'instructionBar', 'btnSpeakPrompt', 'promptText', 'mascotBubble',
  'mainContainer', 'viewWorlds', 'welcomeMascot', 'worldsGrid',
  'viewLevels', 'currentWorldTitle', 'currentWorldProgress', 'levelsGrid',
  'viewGame', 'gameLevelBadge', 'gameLevelTitle', 'gameMount',
  'modalVictory', 'confettiCanvas', 'victoryMascot', 'victoryStarsAnim',
  'btnNextLevel', 'btnReplayLevel', 'btnVictoryLevelSelect',
  'modalCertificate', 'btnPrintCert', 'btnCloseCert', 'printableCertificate',
  'certMascotLeft', 'certMascotRight', 'certChildName', 'certTotalStars',
  'certCompletedLevels', 'certIssueDate',
  'modalParent', 'parentGateSection', 'parentMathQuestion', 'parentMathChoices',
  'btnCancelParentGate', 'parentDashboardSection', 'btnCloseParentDash',
  'inputChildName', 'btnSaveChildName', 'worldRecapList', 'btnTestSfx',
  'btnTestTts', 'btnResetProgress'
];

requiredIds.forEach(id => {
  const tag = (id === 'confettiCanvas') ? 'canvas' : (id === 'inputChildName' ? 'input' : (id.startsWith('btn') ? 'button' : 'div'));
  registerElement(id, tag);
});

// Import app.js
const { AppController, ConfettiEffect, App } = await import('../app.js');

function resetAppTestState() {
  storageStore.clear();
  storageThrowsOnGet = null;
  storageThrowsOnSet = null;
  storageThrowsOnRemove = null;

  ['btnHeaderBack', 'instructionBar', 'viewLevels', 'viewGame', 'modalVictory', 'modalCertificate', 'modalParent', 'parentDashboardSection'].forEach(id => {
    const el = domRegistry.get(id);
    if (el) el.style.display = 'none';
  });
  domRegistry.get('viewWorlds').style.display = 'flex';
  domRegistry.get('parentGateSection').style.display = 'flex';
  domRegistry.get('parentHoldProgress').style.width = '0%';
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================================
// SUITE 1: PARENTAL GATE HOLD TIMER ADVERSARIAL STRESS TESTING
// ============================================================================
console.log('--- SUITE 1: PARENTAL GATE HOLD TIMER ADVERSARIAL TESTS ---');

await testAsync('GATE.HOLD.1 Release at 500ms cancels timer & keeps gate locked', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const btnOpen = domRegistry.get('btnOpenParent');
  const modal = domRegistry.get('modalParent');
  const progressBar = domRegistry.get('parentHoldProgress');

  btnOpen.dispatchEvent('pointerdown');
  await sleep(500);
  btnOpen.dispatchEvent('pointerup');

  // Let remainder of 2000ms pass
  await sleep(1600);

  assert.strictEqual(modal.style.display, 'none', 'ModalParent must remain hidden after 500ms release');
  assert.strictEqual(progressBar.style.width, '0%', 'Progress bar must reset to 0% after release');
  assert.strictEqual(app.holdTimer, null, 'holdTimer must be cleared');
});

await testAsync('GATE.HOLD.2 Release at 1500ms cancels timer & keeps gate locked', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const btnOpen = domRegistry.get('btnOpenParent');
  const modal = domRegistry.get('modalParent');
  const progressBar = domRegistry.get('parentHoldProgress');

  btnOpen.dispatchEvent('pointerdown');
  await sleep(1500);
  btnOpen.dispatchEvent('pointerup');

  // Let remainder of time pass
  await sleep(600);

  assert.strictEqual(modal.style.display, 'none', 'ModalParent must remain hidden after 1500ms release');
  assert.strictEqual(progressBar.style.width, '0%', 'Progress bar must reset to 0% after release');
  assert.strictEqual(app.holdTimer, null, 'holdTimer must be cleared');
});

await testAsync('GATE.HOLD.3 Release at 1990ms (boundary corner) cancels timer & keeps gate locked', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const btnOpen = domRegistry.get('btnOpenParent');
  const modal = domRegistry.get('modalParent');
  const progressBar = domRegistry.get('parentHoldProgress');

  btnOpen.dispatchEvent('pointerdown');
  await sleep(1980);
  btnOpen.dispatchEvent('pointerup');

  // Wait beyond 2000ms threshold
  await sleep(200);

  assert.strictEqual(modal.style.display, 'none', 'ModalParent must remain hidden on sub-2000ms release');
  assert.strictEqual(progressBar.style.width, '0%', 'Progress bar must be reset to 0%');
  assert.strictEqual(app.holdTimer, null, 'holdTimer must be cleared');
});

await testAsync('GATE.HOLD.4 Continuous hold >= 2000ms unlocks Parental Gate Modal', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const btnOpen = domRegistry.get('btnOpenParent');
  const modal = domRegistry.get('modalParent');
  const gateSection = domRegistry.get('parentGateSection');
  const dashSection = domRegistry.get('parentDashboardSection');
  const mathChoices = domRegistry.get('parentMathChoices');
  const mathQuestion = domRegistry.get('parentMathQuestion');

  btnOpen.dispatchEvent('pointerdown');
  await sleep(2100);
  btnOpen.dispatchEvent('pointerup');

  assert.strictEqual(modal.style.display, 'flex', 'ModalParent must be visible (flex) after >=2000ms hold');
  assert.strictEqual(gateSection.style.display, 'flex', 'parentGateSection must be visible');
  assert.strictEqual(dashSection.style.display, 'none', 'parentDashboardSection must be hidden initially');
  assert.match(mathQuestion.textContent, /Berapa \d+ \+ \d+\?/, 'Math question prompt must be formatted');
  assert.strictEqual(mathChoices.children.length, 6, 'Must generate exactly 6 math choices');
  assert(app.currentMathAnswer >= 3 && app.currentMathAnswer <= 17, `Math answer ${app.currentMathAnswer} must be valid`);
});

await testAsync('GATE.HOLD.5 Accidental swipe/touchcancel/pointerleave cancels hold timer', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const btnOpen = domRegistry.get('btnOpenParent');
  const modal = domRegistry.get('modalParent');

  // Test pointerleave
  btnOpen.dispatchEvent('pointerdown');
  await sleep(800);
  btnOpen.dispatchEvent('pointerleave');
  await sleep(1300);
  assert.strictEqual(modal.style.display, 'none', 'pointerleave must cancel hold');

  // Test pointercancel
  btnOpen.dispatchEvent('pointerdown');
  await sleep(1000);
  btnOpen.dispatchEvent('pointercancel');
  await sleep(1200);
  assert.strictEqual(modal.style.display, 'none', 'pointercancel must cancel hold');

  // Test touchcancel
  btnOpen.dispatchEvent('touchstart');
  await sleep(1200);
  btnOpen.dispatchEvent('touchcancel');
  await sleep(1000);
  assert.strictEqual(modal.style.display, 'none', 'touchcancel must cancel hold');
});

await testAsync('GATE.HOLD.6 Rapid frantic toddler multi-taps (50 rapid taps) do not trigger gate or leak timers', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const btnOpen = domRegistry.get('btnOpenParent');
  const modal = domRegistry.get('modalParent');

  for (let i = 0; i < 50; i++) {
    btnOpen.dispatchEvent('pointerdown');
    await sleep(10);
    btnOpen.dispatchEvent('pointerup');
  }

  // Settle down
  await sleep(500);
  assert.strictEqual(modal.style.display, 'none', 'Modal must never unlock from rapid chaotic taps');
  assert.strictEqual(app.holdTimer, null, 'holdTimer must remain clean/null');
});

// ============================================================================
// SUITE 2: MATH CHALLENGE ADVERSARIAL INPUTS & BOUNDARY CASES
// ============================================================================
console.log('\n--- SUITE 2: MATH CHALLENGE ADVERSARIAL INPUTS & BOUNDARY CASES ---');

test('MATH.GEN.1 100 Random Math Challenges Integrity Audit', () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  for (let i = 0; i < 100; i++) {
    app.openParentalGateModal();
    const sum = app.currentMathAnswer;
    assert(Number.isInteger(sum), `Answer ${sum} must be an integer`);
    assert(sum >= 3 && sum <= 17, `Answer ${sum} must be in [3, 17]`);

    const mathChoices = domRegistry.get('parentMathChoices');
    assert.strictEqual(mathChoices.children.length, 6, 'Must generate exactly 6 choices');

    const choiceValues = mathChoices.children.map(b => Number(b.dataset.val));
    const uniqueValues = new Set(choiceValues);
    assert.strictEqual(uniqueValues.size, 6, 'All 6 choice values must be distinct');
    assert(uniqueValues.has(sum), `Choice options ${Array.from(uniqueValues)} must include the correct sum ${sum}`);

    // Verify all choices are positive numbers <= 20
    choiceValues.forEach(v => {
      assert(v > 0 && v <= 20, `Choice value ${v} must be in (0, 20]`);
    });
  }
});

await testAsync('MATH.REJ.1 Incorrect choice is rejected, plays gentle audio, wobbles and dismisses', async () => {
  resetAppTestState();
  const app = new AppController();
  app.init();
  app.openParentalGateModal();

  const modal = domRegistry.get('modalParent');
  const gateSection = domRegistry.get('parentGateSection');
  const dashSection = domRegistry.get('parentDashboardSection');
  const mathChoices = domRegistry.get('parentMathChoices');

  const incorrectBtn = mathChoices.children.find(b => Number(b.dataset.val) !== app.currentMathAnswer);
  assert(incorrectBtn, 'Must find an incorrect button');

  incorrectBtn.click();

  assert(gateSection.classList.contains('wobble'), 'gateSection must have wobble class on error');
  assert.strictEqual(dashSection.style.display, 'none', 'Dashboard must not unlock on wrong answer');

  await sleep(600);
  assert.strictEqual(modal.style.display, 'none', 'Modal must be dismissed after wrong answer timeout');
});

test('MATH.BND.1 Boundary, malicious, and unexpected values fed into handleMathChoice are safely rejected', () => {
  resetAppTestState();
  const app = new AppController();
  app.init();
  app.openParentalGateModal();

  const gateSection = domRegistry.get('parentGateSection');
  const dashSection = domRegistry.get('parentDashboardSection');
  const currentAnswer = app.currentMathAnswer;

  const adversarialInputs = [
    0, -1, -999, 999999, NaN, Infinity, -Infinity,
    "", "   ", "abc", "NaN", "0", "-1",
    null, undefined, false, true, [], {}, [currentAnswer + 99]
  ];

  for (const input of adversarialInputs) {
    // If input is true, Number(true) is 1. If sum is 1, it might match, but sum is in [3, 17]
    const expectedMatch = (Number(input) === Number(currentAnswer));
    assert(!expectedMatch, `Adversarial input ${JSON.stringify(input)} must NOT match target sum ${currentAnswer}`);

    app.handleMathChoice(input);
    assert.strictEqual(dashSection.style.display, 'none', `Adversarial input ${JSON.stringify(input)} must NOT unlock dashboard`);
    assert(gateSection.classList.contains('wobble'), `Adversarial input ${JSON.stringify(input)} must trigger wobble`);
  }
});

test('MATH.BTN.1 Cancel button dismisses modal without unlocking dashboard', () => {
  resetAppTestState();
  const app = new AppController();
  app.init();
  app.openParentalGateModal();

  const modal = domRegistry.get('modalParent');
  const dashSection = domRegistry.get('parentDashboardSection');
  const btnCancel = domRegistry.get('btnCancelParentGate');

  btnCancel.click();
  assert.strictEqual(modal.style.display, 'none', 'Modal must be closed on cancel');
  assert.strictEqual(dashSection.style.display, 'none', 'Dashboard must not be unlocked');
});

test('MATH.UNL.1 Correct math answer unlocks dashboard & initializes recap & child name', () => {
  resetAppTestState();
  const app = new AppController();
  app.completedLevels = { 'satwa-1': 3, 'angka-1': 3 };
  app.childName = 'Arka Satria';
  app.init();
  app.openParentalGateModal();

  const gateSection = domRegistry.get('parentGateSection');
  const dashSection = domRegistry.get('parentDashboardSection');
  const inputChild = domRegistry.get('inputChildName');
  const mathChoices = domRegistry.get('parentMathChoices');
  const recapList = domRegistry.get('worldRecapList');

  const correctBtn = mathChoices.children.find(b => Number(b.dataset.val) === app.currentMathAnswer);
  assert(correctBtn, 'Must find correct button');

  correctBtn.click();

  assert.strictEqual(gateSection.style.display, 'none', 'Gate section must be hidden on success');
  assert.strictEqual(dashSection.style.display, 'flex', 'Dashboard section must be displayed (flex)');
  assert.strictEqual(inputChild.value, 'Arka Satria', 'Input child name must be populated with childName');
  assert.strictEqual(recapList.children.length, 4, 'World recap list must render 4 world rows');
});

// ============================================================================
// SUITE 3: LOCALSTORAGE CORRUPTION ADVERSARIAL STRESS TESTING
// ============================================================================
console.log('\n--- SUITE 3: LOCALSTORAGE CORRUPTION ADVERSARIAL TESTS ---');

test('STR.COR.1 Corrupt non-JSON strings in spidey_completed_levels recover to empty state', () => {
  resetAppTestState();
  const corruptStrings = [
    '{broken json',
    'undefined',
    '<xml>invalid</xml>',
    '{"unclosed": "string',
    '12345',
    'true',
    'null',
    'NaN',
    '---\ncorrupt: yaml'
  ];

  for (const str of corruptStrings) {
    storageStore.set('spidey_completed_levels', str);
    const app = new AppController();
    assert.doesNotThrow(() => {
      app.loadProgress();
    }, `loadProgress must not throw on corrupt string: ${str}`);

    assert.strictEqual(typeof app.completedLevels, 'object', 'completedLevels must be an object');
    assert.doesNotThrow(() => {
      app.getTotalStars();
      app.getCompletedLevelsCount();
    }, 'Stats helpers must not throw');
  }
});

test('STR.COR.2 Corrupt values inside completedLevels map are handled safely without NaN stars', () => {
  resetAppTestState();
  const app = new AppController();

  // Test map with weird/corrupted star values
  app.completedLevels = {
    'satwa-1': 3,
    'satwa-2': 'corrupted',
    'satwa-3': null,
    'satwa-4': undefined,
    'satwa-5': NaN,
    'satwa-6': -5,
    'angka-1': '3',
    'angka-2': 3
  };

  const total = app.getTotalStars();
  assert(Number.isFinite(total), `Total stars must be finite number, got: ${total}`);
  assert.strictEqual(total, 3 + 0 + 0 + 0 + 0 + (-5) + 3 + 3, 'Stars should sum valid numbers');
  assert.strictEqual(app.getCompletedLevelsCount(), 8, 'Level count must match object keys length');

  assert.doesNotThrow(() => {
    app.saveProgress();
  }, 'saveProgress must not throw on corrupted map values');
});

test('STR.COR.3 Corrupt spidey_progress legacy format recovers gracefully without unhandled exceptions', () => {
  resetAppTestState();
  const corruptLegacy = [
    '{invalid json',
    '{"completedLevels": null}',
    '{"totalStars": "corrupt"}',
    'undefined',
    '<xml>bad</xml>',
    'null'
  ];

  for (const str of corruptLegacy) {
    storageStore.clear();
    storageStore.set('spidey_progress', str);
    const app = new AppController();

    assert.doesNotThrow(() => {
      app.loadProgress();
    }, `loadProgress must not throw on legacy corrupt JSON: ${str}`);

    assert.doesNotThrow(() => {
      app.getTotalStars();
      app.getCompletedLevelsCount();
    }, 'Stats methods must not throw on corrupted legacy storage');
  }
});

test('STR.COR.4 Child name boundary & injection handling', () => {
  resetAppTestState();

  const edgeNames = [
    { input: '', expected: 'Pahlawan Cilik' },
    { input: '   ', expected: '' }, // trimmed
    { input: '<script>alert("xss")</script>', expected: '<script>alert("xss")</script>' },
    { input: 'A'.repeat(500), expected: 'A'.repeat(500) }
  ];

  for (const { input, expected } of edgeNames) {
    storageStore.set('spidey_child_name', input);
    const app = new AppController();
    app.loadProgress();

    if (input === '') {
      assert.strictEqual(app.childName, 'Pahlawan Cilik');
    } else {
      assert.strictEqual(app.childName, expected);
    }

    // Verify certificate uses textContent so HTML cannot execute
    app.init();
    app.openCertificateModal();
    const certName = domRegistry.get('certChildName');
    assert.strictEqual(certName.textContent, app.childName || 'Pahlawan Cilik');
  }
});

// ============================================================================
// SUITE 4: LOCALSTORAGE EXCEPTION & IN-MEMORY FALLBACK STRESS TESTING
// ============================================================================
console.log('\n--- SUITE 4: LOCALSTORAGE EXCEPTION & IN-MEMORY FALLBACK TESTS ---');

test('STR.EXC.1 Storage QuotaExceededError on setItem falls back to in-memory store smoothly', () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  // Emulate QuotaExceededError
  const quotaErr = new Error('QuotaExceededError: DOM Exception 22');
  quotaErr.name = 'QuotaExceededError';
  storageThrowsOnSet = quotaErr;

  assert.doesNotThrow(() => {
    app.childName = 'Bintang Cilik';
    app.completedLevels['spidey-1'] = 3;
    app.completedLevels['spidey-2'] = 3;
    app.saveProgress();
  }, 'saveProgress must not throw when localStorage is full');

  // Verify app in-memory state remains completely intact
  assert.strictEqual(app.getTotalStars(), 6, 'In-memory stars must remain 6');
  assert.strictEqual(app.getCompletedLevelsCount(), 2, 'In-memory completed levels must remain 2');
  assert.strictEqual(app.childName, 'Bintang Cilik', 'In-memory child name preserved');

  // Verify certificate modal reflects in-memory progress
  app.openCertificateModal();
  assert.strictEqual(domRegistry.get('certTotalStars').textContent, '6');
  assert.strictEqual(domRegistry.get('certCompletedLevels').textContent, '2');
  assert.strictEqual(domRegistry.get('certChildName').textContent, 'Bintang Cilik');
});

test('STR.EXC.2 Storage SecurityError on getItem (Private Browsing / Cookies Blocked) falls back cleanly', () => {
  resetAppTestState();
  const app = new AppController();

  const secErr = new Error('SecurityError: Access Denied to localStorage');
  secErr.name = 'SecurityError';
  storageThrowsOnGet = secErr;

  assert.doesNotThrow(() => {
    app.loadProgress();
  }, 'loadProgress must not throw under SecurityError');

  assert.strictEqual(app.childName, 'Pahlawan Cilik', 'Child name should default to Pahlawan Cilik');
  assert.deepStrictEqual(app.completedLevels, {}, 'completedLevels should default to empty object');
  assert.strictEqual(app.getTotalStars(), 0, 'Total stars must default to 0');
});

test('STR.EXC.3 Storage SecurityError on removeItem allows in-memory progress reset', () => {
  resetAppTestState();
  const app = new AppController();
  app.completedLevels = { 'koding-1': 3, 'koding-2': 3 };
  app.init();

  const secErr = new Error('SecurityError: Access Denied');
  secErr.name = 'SecurityError';
  storageThrowsOnRemove = secErr;

  assert.doesNotThrow(() => {
    app.resetProgress();
  }, 'resetProgress must not throw even if localStorage.removeItem throws SecurityError');

  assert.deepStrictEqual(app.completedLevels, {}, 'completedLevels in memory must be reset to {}');
  assert.strictEqual(app.getTotalStars(), 0, 'Total stars must be reset to 0');
  assert.strictEqual(domRegistry.get('totalStarsCount').textContent, '0', 'Header star count must be updated to 0');
  assert.strictEqual(app.currentView, 'worlds', 'View must be reset to worlds');
});

test('STR.EXC.4 Global localStorage object throwing on property access is caught safely', () => {
  const originalLs = globalThis.localStorage;
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      get() {
        throw new Error('SecurityError: localStorage blocked in strict mode');
      },
      configurable: true
    });

    const app = new AppController();
    assert.doesNotThrow(() => {
      app.safeStorageGet('some_key', 'fallback_val');
      app.safeStorageSet('some_key', 'some_val');
      app.safeStorageRemove('some_key');
      app.loadProgress();
      app.saveProgress();
      app.resetProgress();
    }, 'All safeStorage methods must catch property access throws');
  } finally {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLs,
      configurable: true,
      writable: true
    });
  }
});

// ============================================================================
// SUITE 5: PARENT DASHBOARD INTERACTIVE ACTIONS
// ============================================================================
console.log('\n--- SUITE 5: PARENT DASHBOARD INTERACTIVE ACTIONS ---');

test('DASH.ACT.1 Save child name updates storage, controller state, and certificate', () => {
  resetAppTestState();
  const app = new AppController();
  app.init();

  const inputChild = domRegistry.get('inputChildName');
  const btnSave = domRegistry.get('btnSaveChildName');

  inputChild.value = 'Spidey Junior';
  btnSave.click();

  assert.strictEqual(app.childName, 'Spidey Junior', 'app.childName must be updated');
  assert.strictEqual(storageStore.get('spidey_child_name'), 'Spidey Junior', 'Storage must have updated child name');

  // Verify Certificate
  app.openCertificateModal();
  assert.strictEqual(domRegistry.get('certChildName').textContent, 'Spidey Junior');
});

test('DASH.ACT.2 Reset progress via dashboard button clears all data', () => {
  resetAppTestState();
  storageStore.set('spidey_stars', '15');
  storageStore.set('spidey_completed_levels', JSON.stringify({ 'hewan-1': 3, 'hewan-2': 3 }));

  const app = new AppController();
  app.init();
  assert.strictEqual(app.getTotalStars(), 6);

  const btnReset = domRegistry.get('btnResetProgress');
  globalThis.confirm = () => true;

  btnReset.click();

  assert.strictEqual(app.getTotalStars(), 0, 'Total stars must be reset to 0');
  assert.strictEqual(storageStore.has('spidey_stars'), false, 'spidey_stars key must be deleted');
  assert.strictEqual(storageStore.has('spidey_completed_levels'), false, 'spidey_completed_levels key must be deleted');
  assert.strictEqual(domRegistry.get('totalStarsCount').textContent, '0');
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n================================================================');
console.log(`📊 ADVERSARIAL TEST SUMMARY: ${passCount} / ${passCount + failCount} PASSED`);
if (failCount > 0) {
  console.log(`❌ FAILURES: ${failCount}`);
  failures.forEach(f => console.log(`   - ${f.name}: ${f.error.message}`));
}
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🌟 EMPIRICAL CHALLENGE VERDICT: ALL ADVERSARIAL TESTS PASSED (APPROVE)!');
  process.exit(0);
}
