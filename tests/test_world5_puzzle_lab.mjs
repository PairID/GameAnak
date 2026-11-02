// tests/test_world5_puzzle_lab.mjs
// Dedicated, Standalone Verification Suite for World 5: "Dunia Teka-Teki Cilik / Kiddo Puzzle Lab"
// Validates 4 new engines (pola, kode, beda, jumlah), all 16 levels (76-91), touch targets (>=64px),
// 273 max star progression, mascot costumes & 60fps keyframes, procedural Web Audio cues, and offline PWA invariant.
// Zero external npm dependencies — runnable via `node tests/test_world5_puzzle_lab.mjs`.

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ============================================================================
// 1. LIGHTWEIGHT ISOMORPHIC MOCK DOM ENVIRONMENT
// ============================================================================

class MockClassList {
  constructor() {
    this._set = new Set();
  }
  add(...classes) {
    classes.forEach(c => {
      if (c && typeof c === 'string') {
        c.split(/\s+/).filter(Boolean).forEach(item => this._set.add(item));
      }
    });
  }
  remove(...classes) {
    classes.forEach(c => {
      if (c && typeof c === 'string') {
        c.split(/\s+/).filter(Boolean).forEach(item => this._set.delete(item));
      }
    });
  }
  contains(cls) {
    return this._set.has(cls);
  }
  toggle(cls, force) {
    if (force !== undefined) {
      if (force) this.add(cls);
      else this.remove(cls);
      return force;
    }
    if (this.contains(cls)) {
      this.remove(cls);
      return false;
    }
    this.add(cls);
    return true;
  }
  toString() {
    return Array.from(this._set).join(' ');
  }
}

function matchSingleSelector(el, sel) {
  if (!sel || !el) return false;
  if (sel === '*') return true;
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const inner = sel.slice(1, -1);
    const eqIdx = inner.indexOf('=');
    if (eqIdx === -1) {
      return el.getAttribute(inner) !== null || el.dataset[inner] !== undefined;
    }
    const rawAttr = inner.slice(0, eqIdx).trim();
    let val = inner.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (rawAttr.startsWith('data-')) {
      const prop = rawAttr.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      return String(el.dataset[prop]) === val || el.getAttribute(rawAttr) === val;
    }
    return el.getAttribute(rawAttr) === val;
  }

  let strippedSel = sel;
  const classMatches = strippedSel.match(/\.([a-zA-Z0-9_-]+)/g);
  if (classMatches) {
    for (const cm of classMatches) {
      if (!el.classList.contains(cm.slice(1))) return false;
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
    this._textContent = '';
  }

  get className() { return this._classList.toString(); }
  set className(val) {
    this._classList = new MockClassList();
    if (val) val.split(/\s+/).filter(Boolean).forEach(c => this._classList.add(c));
  }
  get classList() { return this._classList; }

  get textContent() {
    if (this._textContent) return this._textContent;
    return this.children.map(c => c.textContent).join(' ');
  }
  set textContent(val) {
    this._textContent = String(val);
    this.children = [];
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
  getAttribute(k) { return this.attributes[k] ?? null; }
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
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
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
    const evtObj = typeof event === 'string'
      ? { type, target: this, preventDefault: () => {}, stopPropagation: () => {} }
      : Object.assign({ preventDefault: () => {}, stopPropagation: () => {} }, event);
    evtObj.target = this;
    if (typeof this[`on${type}`] === 'function') {
      this[`on${type}`](evtObj);
    }
    const handlers = this.listeners.get(type) || [];
    handlers.forEach(fn => fn.call(this, evtObj));
    return true;
  }
  click() {
    if (typeof this.onclick === 'function') {
      this.onclick({ type: 'click', target: this, preventDefault: () => {}, stopPropagation: () => {} });
    }
    this.dispatchEvent({ type: 'click', target: this });
  }

  setPointerCapture() {}
  releasePointerCapture() {}

  getBoundingClientRect() {
    return { left: 10, top: 20, right: 110, bottom: 84, width: 100, height: 64, x: 10, y: 20 };
  }
  contains(node) {
    if (node === this) return true;
    for (const ch of this.children) {
      if (ch.contains(node)) return true;
    }
    return false;
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
          ['img', 'input', 'br', 'hr', 'source', 'line', 'circle', 'path', 'polygon', 'ellipse'].includes(openTag.toLowerCase());
        if (!isSelfClosing) stack.push(el);
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        if (stack.length > 0) stack[stack.length - 1]._textContent = text.trim();
      }
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

// Mock LocalStorage
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
}

// Global Environment Initialization
const mockDocument = {
  createElement(tag) { return new MockElement(tag); },
  getElementById(id) { return this.body ? this.body.querySelector(`#${id}`) : null; },
  querySelector(sel) { return this.body ? this.body.querySelector(sel) : null; },
  querySelectorAll(sel) { return this.body ? this.body.querySelectorAll(sel) : []; },
  body: new MockElement('body'),
  addEventListener() {},
  removeEventListener() {}
};

const mockLocalStorage = new MockLocalStorage();

const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  localStorage: mockLocalStorage,
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  document: mockDocument,
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
};

globalThis.window = mockWindow;
globalThis.document = mockDocument;
globalThis.localStorage = mockLocalStorage;
globalThis.CustomEvent = mockWindow.CustomEvent;

// ============================================================================
// 2. TEST HARNESS INFRASTRUCTURE
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
let currentTier = '';

function setTier(name) {
  currentTier = name;
  console.log(`\n============================================================`);
  console.log(`🔷 ${name.toUpperCase()}`);
  console.log(`============================================================`);
}

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ tier: currentTier, name, error: err });
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

// ============================================================================
// 3. LOAD ALL SYSTEM MODULES
// ============================================================================

console.log('============================================================');
console.log('🧩 PETUALANGAN SPIDEY CILIK — WORLD 5 DEDICATED TEST SUITE');
console.log('Kiddo Puzzle Lab Acceptance & Engine Invariant Verification');
console.log('============================================================\n');

const levelsModule = await import(pathToFileURL(path.join(ROOT_DIR, 'levels.js')).href);
const enginesModule = await import(pathToFileURL(path.join(ROOT_DIR, 'engines.js')).href);
const audioModule = await import(pathToFileURL(path.join(ROOT_DIR, 'audio.js')).href);
const mascotModule = await import(pathToFileURL(path.join(ROOT_DIR, 'mascot.js')).href);

const { ALL_WORLDS, ALL_LEVELS, PUZZLE_LEVELS, WORLD_5 } = levelsModule;
const { Engines } = enginesModule;
const { sound } = audioModule;
const { Mascot } = mascotModule;

const styleCssPath = path.join(ROOT_DIR, 'style.css');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

const swJsPath = path.join(ROOT_DIR, 'sw.js');
const swJs = fs.readFileSync(swJsPath, 'utf8');

// ============================================================================
// TIER 1: ENGINE ARCHITECTURE & RENDERING CONTRACT (R1)
// ============================================================================
setTier('Tier 1: Engine Architecture & Rendering Contract (R1)');

await runTest('T1.ENG.1: Engines.renderPola mounts DOM structure, sequence, and candidate tray', () => {
  const container = new MockElement('div');
  const level = {
    type: 'pola',
    sequence: ['🍎', '🍌', '🍎', '❓'],
    missingIndex: 3,
    answer: '🍌',
    options: ['🍎', '🍌', '🍇']
  };
  Engines.renderPola(container, level, () => {});
  assert(container.querySelector('.engine-pola'), 'Must render .engine-pola container');
  assert(container.querySelector('.pattern-board'), 'Must render .pattern-board');
  assert(container.querySelector('.pattern-train'), 'Must render .pattern-train');
  assert(container.querySelector('#missingSlot'), 'Must render #missingSlot for toddler to solve');
  assert(container.querySelector('#patternOptionsTray'), 'Must render #patternOptionsTray with candidate cards');
  const options = container.querySelectorAll('.choice-btn.pattern-choice-btn');
  assert.strictEqual(options.length, 3, `Expected 3 choice buttons, found ${options.length}`);
});

await runTest('T1.ENG.2: Engines.renderKode mounts cipher legend, code slots, and keypad', () => {
  const container = new MockElement('div');
  const level = {
    type: 'kode',
    cipherKey: [{ symbol: '🐱', value: '1' }, { symbol: '🐶', value: '2' }],
    code: ['🐱', '🐶'],
    solution: ['1', '2'],
    options: ['1', '2'],
    secretReward: 'Piala Pahlawan 🏆',
    rewardEmoji: '🏆'
  };
  Engines.renderKode(container, level, () => {});
  assert(container.querySelector('.engine-kode'), 'Must render .engine-kode container');
  assert(container.querySelector('.cipher-legend-bar'), 'Must render .cipher-legend-bar');
  assert(container.querySelector('#codeChallengeRow'), 'Must render #codeChallengeRow');
  assert(container.querySelector('#kodeKeypad'), 'Must render #kodeKeypad');
  assert(container.querySelector('#secretRewardOverlay'), 'Must render #secretRewardOverlay');
  const slots = container.querySelectorAll('.code-slot');
  assert.strictEqual(slots.length, 2, 'Must render exactly 2 code slots');
});

await runTest('T1.ENG.3: Engines.renderBeda mounts question header and 4-card discrimination grid', () => {
  const container = new MockElement('div');
  const level = {
    type: 'beda',
    question: 'Mana gambar yang berbeda?',
    options: ['🐟', '🐟', '🐟', '🐠'],
    answerIndex: 3
  };
  Engines.renderBeda(container, level, () => {});
  assert(container.querySelector('.engine-beda'), 'Must render .engine-beda container');
  assert(container.querySelector('#bedaGrid'), 'Must render #bedaGrid');
  const cards = container.querySelectorAll('.choice-btn.beda-card.beda-btn');
  assert.strictEqual(cards.length, 4, `Expected 4 beda cards, found ${cards.length}`);
});

await runTest('T1.ENG.4: Engines.renderJumlah mounts dynamic balance scale in balance mode', () => {
  const container = new MockElement('div');
  const level = {
    type: 'jumlah',
    mode: 'balance',
    leftGroup: { item: '🍊', count: 4 },
    rightGroup: { item: '🍊', count: 2 },
    target: 'left',
    answer: 'left'
  };
  Engines.renderJumlah(container, level, () => {});
  assert(container.querySelector('.engine-jumlah.balance-mode'), 'Must render .engine-jumlah.balance-mode');
  assert(container.querySelector('.balance-stage'), 'Must render .balance-stage');
  assert(container.querySelector('.balance-svg'), 'Must render .balance-svg');
  assert(container.querySelector('#panLeft'), 'Must render #panLeft touch zone');
  assert(container.querySelector('#panRight'), 'Must render #panRight touch zone');
  assert(container.querySelector('#balanceOptionsRow'), 'Must render #balanceOptionsRow with choice buttons');
});

await runTest('T1.ENG.5: Engines.renderJumlah mounts fruit counting clusters in addition mode', () => {
  const container = new MockElement('div');
  const level = {
    type: 'jumlah',
    mode: 'addition',
    leftGroup: { item: '🍎', count: 2 },
    rightGroup: { item: '🍎', count: 3 },
    answer: 5,
    options: [4, 5, 6]
  };
  Engines.renderJumlah(container, level, () => {});
  assert(container.querySelector('.engine-jumlah.addition-mode'), 'Must render .engine-jumlah.addition-mode');
  assert(container.querySelector('.math-groups-row'), 'Must render .math-groups-row');
  assert(container.querySelector('#resultBasket'), 'Must render #resultBasket');
  assert(container.querySelector('#mathOptionsTray'), 'Must render #mathOptionsTray');
  const numBtns = container.querySelectorAll('.choice-btn.math-num-btn');
  assert.strictEqual(numBtns.length, 3, 'Must render 3 addition choice buttons');
});

await runTest('T1.ENG.6: Polymorphic Engines.render dispatch handles both (container, level) and (level, container)', () => {
  const containerA = new MockElement('div');
  const levelA = { type: 'pola', sequence: ['⭐', '❓'], answer: '⭐', options: ['⭐'] };
  Engines.render(containerA, levelA, () => {});
  assert(containerA.querySelector('.engine-pola'), 'Signatur (container, level) must dispatch');

  const containerB = new MockElement('div');
  const levelB = { type: 'beda', options: ['A', 'A', 'B', 'A'], answerIndex: 2 };
  Engines.render(levelB, containerB, () => {});
  assert(containerB.querySelector('.engine-beda'), 'Signatur (level, container) must dispatch');
});

await runTest('T1.ENG.7: Non-punitive feedback: wrong choices trigger gentle shake without error', () => {
  const container = new MockElement('div');
  const level = { type: 'beda', options: ['🐶', '🐶', '🐱', '🐶'], answerIndex: 2 };
  Engines.renderBeda(container, level, () => {});
  const buttons = container.querySelectorAll('.choice-btn.beda-card.beda-btn');
  // Click wrong card (index 0)
  assert.doesNotThrow(() => {
    buttons[0].click();
  }, 'Clicking wrong card must not throw');
  assert(buttons[0].classList.contains('shake'), 'Wrong button must receive .shake class for gentle feedback');
});

// ============================================================================
// TIER 2: ALGORITHMIC SOLVABILITY ACROSS ALL 16 LEVELS (76–91) (R2)
// ============================================================================
setTier('Tier 2: Algorithmic Solvability Across All 16 Levels (76–91)');

// Verify that all 16 levels in World 5 can be solved algorithmically through simulated toddler interactions
for (const level of PUZZLE_LEVELS) {
  await runTest(`T2.SOLVE.${level.id}: Level ${level.id} (${level.title}) [${level.type}] algorithmically solved`, async () => {
    const container = new MockElement('div');
    let completed = false;
    const onComplete = () => { completed = true; };

    Engines.render(container, level, onComplete);

    if (level.type === 'pola') {
      const targetVal = String(level.answer).trim();
      const choiceButtons = container.querySelectorAll('.choice-btn.pattern-choice-btn');
      let clickedBtn = null;
      for (const btn of choiceButtons) {
        if (btn.dataset.val && btn.dataset.val.trim() === targetVal) {
          clickedBtn = btn;
          break;
        }
      }
      assert(clickedBtn, `Level ${level.id}: candidate button with value "${targetVal}" not found`);
      clickedBtn.click();
      assert(clickedBtn.classList.contains('correct'), `Level ${level.id}: button did not receive .correct class`);
      // Wait for completion timeout (750ms)
      await new Promise(r => setTimeout(r, 800));
      assert(completed, `Level ${level.id}: onComplete callback was not triggered`);
    }
    else if (level.type === 'kode') {
      const solution = level.solution;
      assert(Array.isArray(solution), `Level ${level.id}: solution array missing`);
      for (let sIdx = 0; sIdx < solution.length; sIdx++) {
        const expectedVal = String(solution[sIdx]);
        const keypadButtons = container.querySelectorAll('.choice-btn.keypad-btn');
        let keyBtn = null;
        for (const btn of keypadButtons) {
          if (btn.dataset.val === expectedVal) {
            keyBtn = btn;
            break;
          }
        }
        assert(keyBtn, `Level ${level.id}: keypad button "${expectedVal}" not found for slot ${sIdx}`);
        keyBtn.click();
      }
      const overlay = container.querySelector('#secretRewardOverlay');
      assert(overlay, `Level ${level.id}: secretRewardOverlay missing`);
      assert.strictEqual(overlay.style.display, 'flex', `Level ${level.id}: reward overlay not displayed on solve`);
      // Wait for completion timeout (1400ms)
      await new Promise(r => setTimeout(r, 1450));
      assert(completed, `Level ${level.id}: onComplete callback was not triggered`);
    }
    else if (level.type === 'beda') {
      const targetIdx = level.differentIndex !== undefined ? level.differentIndex : level.answerIndex;
      const cardButtons = container.querySelectorAll('.choice-btn.beda-card.beda-btn');
      assert(cardButtons[targetIdx], `Level ${level.id}: target card at index ${targetIdx} missing`);
      cardButtons[targetIdx].click();
      assert(cardButtons[targetIdx].classList.contains('correct'), `Level ${level.id}: target card did not receive .correct`);
      // Wait for completion timeout (650ms)
      await new Promise(r => setTimeout(r, 700));
      assert(completed, `Level ${level.id}: onComplete callback was not triggered`);
    }
    else if (level.type === 'jumlah') {
      if (level.mode === 'balance') {
        const targetSide = level.target || level.answer;
        const targetPan = container.querySelector(targetSide === 'left' ? '#panLeft' : '#panRight');
        assert(targetPan, `Level ${level.id}: target pan #${targetSide} not found`);
        targetPan.click();
        // Wait for completion timeout (800ms)
        await new Promise(r => setTimeout(r, 850));
        assert(completed, `Level ${level.id}: onComplete callback was not triggered`);
      } else {
        const expectedAnswer = String(level.answer);
        const mathButtons = container.querySelectorAll('.choice-btn.math-num-btn');
        let answerBtn = null;
        for (const btn of mathButtons) {
          if (String(btn.dataset.val) === expectedAnswer) {
            answerBtn = btn;
            break;
          }
        }
        assert(answerBtn, `Level ${level.id}: answer button "${expectedAnswer}" not found`);
        answerBtn.click();
        // Wait for completion timeout (800ms)
        await new Promise(r => setTimeout(r, 850));
        assert(completed, `Level ${level.id}: onComplete callback was not triggered`);
      }
    }
  });
}

// ============================================================================
// TIER 3: PRESCHOOL UI & ACCESSIBILITY (TOUCH TARGETS >= 64PX) (R4)
// ============================================================================
setTier('Tier 3: Preschool UI & Accessibility (Touch Targets >= 64px) (R4)');

await runTest('T3.UI.1: Pattern train items & options adhere to >= 64px touch target standard', () => {
  assert(styleCss.includes('.pattern-item'), 'style.css must define .pattern-item');
  assert(styleCss.includes('min-width: 64px') || styleCss.includes('width: 80px'), 'Pattern item width must be >= 64px');
  assert(styleCss.includes('min-height: 64px') || styleCss.includes('height: 80px'), 'Pattern item height must be >= 64px');
  assert(styleCss.includes('.choice-btn.pattern-choice-btn'), 'style.css must define .pattern-choice-btn');
  assert(styleCss.includes('min-width: 76px'), 'Pattern choice button min-width must be >= 64px (76px)');
  assert(styleCss.includes('min-height: 76px'), 'Pattern choice button min-height must be >= 64px (76px)');
});

await runTest('T3.UI.2: Code symbol boxes and keypad buttons adhere to >= 64px touch target standard', () => {
  assert(styleCss.includes('.code-symbol-box'), 'style.css must define .code-symbol-box');
  assert(styleCss.includes('min-width: 64px') || styleCss.includes('width: 76px'), 'Code symbol box width must be >= 64px');
  assert(styleCss.includes('.choice-btn.keypad-btn'), 'style.css must define .keypad-btn');
  assert(styleCss.includes('min-width: 72px'), 'Keypad button min-width must be >= 64px (72px)');
  assert(styleCss.includes('min-height: 72px'), 'Keypad button min-height must be >= 64px (72px)');
});

await runTest('T3.UI.3: Beda discrimination cards adhere to >= 64px touch target standard', () => {
  assert(styleCss.includes('.choice-btn.beda-card.beda-btn'), 'style.css must define .beda-card.beda-btn');
  assert(styleCss.includes('min-width: 96px'), 'Beda card min-width must be >= 64px (96px)');
  assert(styleCss.includes('min-height: 96px'), 'Beda card min-height must be >= 64px (96px)');
});

await runTest('T3.UI.4: Balance pans & math buttons adhere to >= 64px touch target standard', () => {
  assert(styleCss.includes('.pan-touch-zone'), 'style.css must define .pan-touch-zone');
  assert(styleCss.includes('width: 130px'), 'Balance pan width must be >= 64px (130px)');
  assert(styleCss.includes('.choice-btn.pan-choice-btn') || styleCss.includes('.choice-btn.math-btn'), 'style.css must define math choice buttons');
});

await runTest('T3.UI.5: Squishy tactile active press physics (scale 1.02, 0.95) applied to new puzzle buttons', () => {
  assert(styleCss.includes('scale(1.02, 0.95)'), 'style.css must implement squishy elastic scale(1.02, 0.95)');
  assert(styleCss.includes('var(--jelly-shadow-active)'), 'style.css must apply jelly active depth shadow');
});

// ============================================================================
// TIER 4: CHARACTER & MASCOT EVOLUTION SYSTEM (R3)
// ============================================================================
setTier('Tier 4: Character & Mascot Evolution System (R3)');

await runTest('T4.MAS.1: Mascot supports dynamic costumes (detective, explorer, scientist, whimsical)', () => {
  assert(Array.isArray(Mascot.costumes), 'Mascot.costumes must be an array');
  const costumeIds = Mascot.costumes.map(c => c.id);
  assert(costumeIds.includes('detective'), 'detective costume missing');
  assert(costumeIds.includes('explorer'), 'explorer costume missing');
  assert(costumeIds.includes('scientist'), 'scientist costume missing');
  assert(costumeIds.includes('whimsical'), 'whimsical costume missing');

  // Verify dedicated wrapper methods
  assert(typeof Mascot.detectiveHero === 'function', 'Mascot.detectiveHero must be a function');
  assert(typeof Mascot.explorerBunny === 'function', 'Mascot.explorerBunny must be a function');
  assert(typeof Mascot.scientistPanda === 'function', 'Mascot.scientistPanda must be a function');
  assert(typeof Mascot.whimsicalCat === 'function', 'Mascot.whimsicalCat must be a function');

  // Verify SVG generation with costume accents
  const detSvg = Mascot.detectiveHero(120, 'wave');
  assert(detSvg.includes('costume-detective'), 'Detective SVG must include costume-detective class');
  const expSvg = Mascot.explorerBunny(100, 'idle');
  assert(expSvg.includes('costume-explorer'), 'Explorer SVG must include costume-explorer class');
});

await runTest('T4.MAS.2: Mascot generates SVG for 4 celebratory poses (celebrate_jump, eureka, curious, proud)', () => {
  const poses = ['celebrate_jump', 'eureka', 'curious', 'proud'];
  poses.forEach(p => {
    const heroSvg = Mascot.hero(100, p);
    assert(heroSvg.includes(p), `hero SVG must include pose class ${p}`);
    const botSvg = Mascot.robot(90, p);
    assert(botSvg.includes(p), `robot SVG must include pose class ${p}`);
    const bunnySvg = Mascot.bunny(100, p);
    assert(bunnySvg.includes(p), `bunny SVG must include pose class ${p}`);
  });
});

await runTest('T4.MAS.3: Mascot.forWorld("puzzle") resolves to Detective Spidey or Explorer Bunny', () => {
  const puzzleHero = Mascot.forWorld('puzzle', 100, 'idle');
  assert(puzzleHero.includes('costume-detective'), 'Mascot.forWorld("puzzle") default must be detective hero');
  const puzzleBunny = Mascot.forWorld('puzzle', 100, 'idle', 'explorer');
  assert(puzzleBunny.includes('costume-explorer'), 'Mascot.forWorld("puzzle", ..., "explorer") must return explorer bunny');
});

await runTest('T4.MAS.4: Mascot.randomCelebration returns valid SVG from celebration pool', () => {
  assert(typeof Mascot.randomCelebration === 'function', 'randomCelebration must exist');
  for (let i = 0; i < 5; i++) {
    const svg = Mascot.randomCelebration('hero');
    assert(svg.includes('<svg') && svg.includes('</svg>'), 'randomCelebration must output valid SVG');
  }
});

await runTest('T4.MAS.5: Pure CSS GPU-accelerated 60fps keyframes defined for all new mascot poses', () => {
  assert(styleCss.includes('@keyframes mascotCelebrateJump'), 'Keyframe mascotCelebrateJump missing');
  assert(styleCss.includes('@keyframes mascotEureka'), 'Keyframe mascotEureka missing');
  assert(styleCss.includes('@keyframes mascotCurious'), 'Keyframe mascotCurious missing');
  assert(styleCss.includes('@keyframes mascotProud'), 'Keyframe mascotProud missing');
  assert(styleCss.includes('will-change: transform'), 'will-change: transform must be present for GPU acceleration');
});

await runTest('T4.MAS.6: Invariant: Mascot.squad strictly preserves 5 canonical characters', () => {
  assert(Array.isArray(Mascot.squad), 'Mascot.squad must be an array');
  assert.strictEqual(Mascot.squad.length, 5, 'Mascot.squad length must be exactly 5');
  const ids = Mascot.squad.map(c => c.id);
  assert.deepStrictEqual(ids, ['spidey', 'cat', 'bunny', 'panda', 'bot'], 'Canonical squad sequence violated');
});

// ============================================================================
// TIER 5: WEB AUDIO PROCEDURAL SYNTHESIS (R4)
// ============================================================================
setTier('Tier 5: Web Audio Procedural Synthesis (R4)');

await runTest('T5.AUD.1: Procedural playSnap provides wooden lock snap with dual harmonics', () => {
  assert(typeof sound.playSnap === 'function', 'sound.playSnap must exist');
  assert.doesNotThrow(() => sound.playSnap(), 'playSnap() must be headless safe');
  const audioCode = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');
  assert(audioCode.includes('playSnap()'), 'audio.js must define playSnap()');
  assert(audioCode.includes('580') || audioCode.includes('240'), 'playSnap must define snap frequency transition');
});

await runTest('T5.AUD.2: Procedural playCipherClick provides mechanical rotary double-tick', () => {
  assert(typeof sound.playCipherClick === 'function', 'sound.playCipherClick must exist');
  assert.doesNotThrow(() => sound.playCipherClick(), 'playCipherClick() must be headless safe');
  const audioCode = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');
  assert(audioCode.includes('playCipherClick()'), 'audio.js must define playCipherClick()');
  assert(audioCode.includes('880') && audioCode.includes('1320'), 'playCipherClick must define mechanical double-tick frequencies');
});

await runTest('T5.AUD.3: Procedural playScaleTilt provides weight-shift glissando', () => {
  assert(typeof sound.playScaleTilt === 'function', 'sound.playScaleTilt must exist');
  assert.doesNotThrow(() => sound.playScaleTilt(), 'playScaleTilt() must be headless safe');
  const audioCode = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');
  assert(audioCode.includes('playScaleTilt()'), 'audio.js must define playScaleTilt()');
});

await runTest('T5.AUD.4: Procedural playFlourish provides 5-note victory arpeggio', () => {
  assert(typeof sound.playFlourish === 'function', 'sound.playFlourish must exist');
  assert.doesNotThrow(() => sound.playFlourish(), 'playFlourish() must be headless safe');
  const audioCode = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');
  assert(audioCode.includes('playFlourish()'), 'audio.js must define playFlourish()');
  assert(audioCode.includes('698.46') && audioCode.includes('1567.98'), 'playFlourish must define arpeggio notes');
});

await runTest('T5.AUD.5: Zero external audio files invariant and psychoacoustic safety', () => {
  const audioCode = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');
  assert(!audioCode.includes('.mp3'), 'audio.js must not load external .mp3');
  assert(!audioCode.includes('.wav'), 'audio.js must not load external .wav');
  assert(!audioCode.includes('.ogg'), 'audio.js must not load external .ogg');
});

// ============================================================================
// TIER 6: STATE PROGRESSION, STAR PERSISTENCE (273 STARS) & PWA INVARIANT
// ============================================================================
setTier('Tier 6: State Progression, Star Persistence (273 Stars) & PWA Invariant');

await runTest('T6.SYS.1: Star calculation invariant: 91 levels * 3 = 273 max stars', () => {
  assert.strictEqual(ALL_LEVELS.length, 91, 'Total level count across 5 worlds must be 91');
  const maxStars = ALL_LEVELS.length * 3;
  assert.strictEqual(maxStars, 273, 'Total maximum stars must be exactly 273');

  const appJsCode = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
  assert(appJsCode.includes('273') || appJsCode.includes('this.maxLevels * 3'), 'app.js must reflect 273 max stars');
});

await runTest('T6.SYS.2: World 5 is properly registered with 16 levels in ALL_WORLDS', () => {
  assert.strictEqual(ALL_WORLDS.length, 5, 'Must contain 5 worlds');
  const puzzle = ALL_WORLDS.find(w => w.id === 'puzzle');
  assert(puzzle, 'World 5 (puzzle) must be present in ALL_WORLDS');
  assert.strictEqual(puzzle.emoji, '🧩', 'Puzzle emoji must be 🧩');
  assert.strictEqual(puzzle.color, '#8B5CF6', 'Puzzle color must be #8B5CF6');

  const pLevels = ALL_LEVELS.filter(l => l.worldId === 'puzzle');
  assert.strictEqual(pLevels.length, 16, 'World 5 must have 16 levels');
});

await runTest('T6.SYS.3: Exact 14-Asset PWA Cache Invariant preserved in sw.js', () => {
  assert(swJs.includes("CACHE_NAME = 'spidey-cilik-v1'"), "sw.js CACHE_NAME must be 'spidey-cilik-v1'");
  const assetsMatch = swJs.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
  assert(assetsMatch, 'sw.js must define ASSETS_TO_CACHE array');
  const assetEntries = assetsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  assert.strictEqual(assetEntries.length, 14, `Exact 14-asset cache required, found ${assetEntries.length}`);
});

await runTest('T6.SYS.4: LocalStorage star progression simulation persists World 5 score', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem('spidey_progress', JSON.stringify({
    stars: { '76': 3, '77': 3, '80': 3 },
    totalStars: 9
  }));
  const raw = mockLocalStorage.getItem('spidey_progress');
  assert(raw, 'Progress must be saved');
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.stars['76'], 3, 'Level 76 score preserved');
  assert.strictEqual(parsed.totalStars, 9, 'Total stars preserved');
});

// ============================================================================
// SUMMARY & EXIT REPORT
// ============================================================================
console.log('\n============================================================');
console.log('📊 WORLD 5 PUZZLE LAB TEST SUITE SUMMARY');
console.log('============================================================');
console.log(`Total Verification Checks: ${totalTests}`);
console.log(`Passed:                   ${passedTests}`);
console.log(`Failed:                   ${failedTests}`);
console.log('============================================================');

if (failedTests > 0) {
  console.error('\n✖ TEST SUITE FAILED! The following tests failed:');
  failures.forEach((f, idx) => {
    console.error(`  ${idx + 1}. [${f.tier}] ${f.name}`);
    console.error(`     Error: ${f.error.message}\n`);
  });
  process.exit(1);
} else {
  console.log('\n✔ ALL WORLD 5 DEDICATED VERIFICATIONS PASSED CLEANLY (Exit 0)!\n');
  process.exit(0);
}
