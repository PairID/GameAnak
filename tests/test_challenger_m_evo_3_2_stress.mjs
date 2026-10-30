// tests/test_challenger_m_evo_3_2_stress.mjs
// Adversarial Empirical Stress Test Suite for Milestone M-EVO-3
// Engine Invariants, Micro-Interactions, Maze Solvability, SW Asset Integrity & Defensive Fallbacks
//
// Targets: engines.js, levels.js, sw.js
// Mode: Empirical Challenger (critic, specialist)
// Pure Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER M-EVO-3.2: ADVERSARIAL EMPIRICAL STRESS TEST SUITE');
console.log('Engine Invariants, Micro-Interactions, Mazes & SW Asset Integrity');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const testResults = [];
const anomalies = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passCount++;
    testResults.push({ name, status: 'PASS' });
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    console.error(err.stack);
    failCount++;
    testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passCount++;
    testResults.push({ name, status: 'PASS' });
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    failCount++;
    testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
  }
}

function anomaly(category, message, details = {}) {
  anomalies.push({ category, message, details });
  console.log(`  \x1b[33m⚡ [ANOMALY - ${category}]\x1b[0m ${message}`);
}

// ============================================================================
// LIGHTWEIGHT SYNTHETIC DOM ENVIRONMENT FOR HEADLESS ENGINE MOUNTING
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
  toggle(c) {
    if (this._set.has(c)) {
      this._set.delete(c);
      return false;
    }
    this._set.add(c);
    return true;
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
    const prop = attr.startsWith('data-') ? attr.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase()) : attr;
    const dataVal = el.dataset[prop] !== undefined ? el.dataset[prop] : el.dataset[attr.replace(/^data-/, '')];
    const attrVal = el.getAttribute(attr);

    if (val !== undefined) {
      const match = (attrVal !== null && String(attrVal) === String(val)) ||
                    (dataVal !== undefined && String(dataVal) === String(val));
      if (!match) return false;
    } else {
      if (attrVal === null && dataVal === undefined) return false;
    }
    strippedSel = strippedSel.replace(attrMatch[0], '');
  }
  if (!strippedSel) return true;
  if (strippedSel.startsWith('#')) return el.id === strippedSel.slice(1);
  if (strippedSel.startsWith('.')) return el.classList.contains(strippedSel.slice(1));
  return el.tagName.toLowerCase() === strippedSel.toLowerCase();
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

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
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
    this.dispatchEvent({ type: 'click', target: this });
  }

  setPointerCapture() {}
  releasePointerCapture() {}

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
          stack[stack.length - 1]._textContent = text.trim();
        }
      }
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

// Setup global mock DOM environment
globalThis.CustomEvent = class CustomEvent {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail || null;
  }
};

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: (evt) => {
    if (globalThis.window._eventListeners && globalThis.window._eventListeners[evt.type]) {
      globalThis.window._eventListeners[evt.type].forEach(fn => fn(evt));
    }
    return true;
  },
  _eventListeners: {}
};

globalThis.document = {
  createElement: (tag) => new MockElement(tag),
  createElementNS: (ns, tag) => new MockElement(tag),
  querySelector: () => null,
  querySelectorAll: () => []
};

// Import modules under test
const { LEVELS, WORLDS } = await import('../levels.js');
const { Engines } = await import('../engines.js');
const { sound } = await import('../audio.js');
const { Illustrations } = await import('../illustrations.js');
const { Mascot } = await import('../mascot.js');

// ============================================================================
// SUITE 1: ALL 75 LEVELS ENGINE MOUNTING & DOM STABILITY ACROSS 4 WORLDS
// ============================================================================
console.log('\n--- SUITE 1: 75-Level Engine Mounting & DOM Stability Across 4 Worlds ---');

test('LEVELS database exports exactly 75 verified levels', () => {
  assert.equal(LEVELS.length, 75, `Expected 75 levels, found ${LEVELS.length}`);
});

test('WORLDS contains 4 valid pedagogical domains', () => {
  assert.equal(WORLDS.length, 4, `Expected 4 worlds, found ${WORLDS.length}`);
  const worldIds = WORLDS.map(w => w.id).sort();
  assert.deepEqual(worldIds, ['angka', 'hewan', 'koding', 'spidey']);
});

test('Level distribution across 4 worlds adheres strictly to specification', () => {
  const worldCounts = {};
  LEVELS.forEach(lvl => {
    worldCounts[lvl.worldId] = (worldCounts[lvl.worldId] || 0) + 1;
  });
  console.log(`    World Distribution: Hewan=${worldCounts.hewan}, Angka=${worldCounts.angka}, Spidey=${worldCounts.spidey}, Koding=${worldCounts.koding}`);
  assert.equal(worldCounts.hewan, 11, 'World "hewan" must contain 11 levels');
  assert.equal(worldCounts.angka, 22, 'World "angka" must contain 22 levels');
  assert.equal(worldCounts.spidey, 23, 'World "spidey" must contain 23 levels');
  assert.equal(worldCounts.koding, 19, 'World "koding" must contain 19 levels');
  assert.equal(worldCounts.hewan + worldCounts.angka + worldCounts.spidey + worldCounts.koding, 75);
});

test('Universal contract across all 75 levels (id, worldId, title, type, prompt)', () => {
  const idSet = new Set();
  const validTypes = new Set(['hubungkan', 'labirin', 'pilih', 'titik', 'tebalkan', 'mewarnai', 'urutkan', 'panah', 'memori']);

  LEVELS.forEach((lvl, idx) => {
    assert.ok(lvl.id, `Level at index ${idx} missing id`);
    assert.ok(!idSet.has(lvl.id), `Duplicate level id: ${lvl.id}`);
    idSet.add(lvl.id);

    assert.ok(lvl.worldId, `Level ${lvl.id} missing worldId`);
    assert.ok(['hewan', 'angka', 'spidey', 'koding'].includes(lvl.worldId), `Level ${lvl.id} has invalid worldId: ${lvl.worldId}`);

    assert.ok(lvl.title && typeof lvl.title === 'string' && lvl.title.trim().length > 0, `Level ${lvl.id} missing title`);
    assert.ok(lvl.prompt && typeof lvl.prompt === 'string' && lvl.prompt.trim().length > 0, `Level ${lvl.id} missing prompt`);
    assert.ok(validTypes.has(lvl.type), `Level ${lvl.id} has unknown engine type: ${lvl.type}`);
  });
});

test('Adversarial Stress: Mount all 75 levels cleanly via Engines.render with zero crashes', () => {
  const mountedByEngine = {};
  let totalMounted = 0;

  LEVELS.forEach(lvl => {
    const container = new MockElement('div');
    container.id = 'gameEngineContainer';
    let completed = false;

    try {
      Engines.render(container, lvl, () => { completed = true; });
      assert.ok(container.children.length > 0, `Level ${lvl.id} (${lvl.type}) produced empty container children`);
      totalMounted++;
      mountedByEngine[lvl.type] = (mountedByEngine[lvl.type] || 0) + 1;
    } catch (err) {
      throw new Error(`Mount crash on Level ${lvl.id} (${lvl.type}, World: ${lvl.worldId}): ${err.message}`);
    }
  });

  assert.equal(totalMounted, 75, `Expected 75 cleanly mounted levels, got ${totalMounted}`);
  console.log('    Engine Mount Counts:', JSON.stringify(mountedByEngine));
  assert.equal(mountedByEngine.hubungkan, 20);
  assert.equal(mountedByEngine.labirin, 6);
  assert.equal(mountedByEngine.pilih, 31);
  assert.equal(mountedByEngine.titik, 3);
  assert.equal(mountedByEngine.mewarnai, 6);
  assert.equal(mountedByEngine.tebalkan, 4);
  assert.equal(mountedByEngine.urutkan, 3);
  assert.equal(mountedByEngine.memori, 1);
  assert.equal(mountedByEngine.panah, 1);
});

test('Engines.render handles unknown engine type gracefully without throwing unhandled exceptions', () => {
  const container = new MockElement('div');
  // Spy on console.error
  const originalError = console.error;
  let loggedError = null;
  console.error = (msg) => { loggedError = msg; };

  try {
    Engines.render(container, { type: 'non_existent_engine' }, () => {});
    assert.ok(loggedError && loggedError.includes('Unknown engine type'), 'Must log an error for unknown engine type');
  } finally {
    console.error = originalError;
  }
});

// ============================================================================
// SUITE 2: INTERIM MOVE MICRO-INTERACTIONS & CELEBRATION HOOKS (ALL 9 ENGINES)
// ============================================================================
console.log('\n--- SUITE 2: Interim Move Micro-Interactions & Celebration Callbacks ---');

// We will test 3 conditions:
// Condition A: window.AppController is undefined (graceful headless / fallback)
// Condition B: window.AppController is active mock with spy
// Condition C: window.AppController throws error (fault injection resilience)

const mockLevels = {
  hubungkan: LEVELS.find(l => l.type === 'hubungkan'),
  labirin: LEVELS.find(l => l.type === 'labirin'),
  pilih: LEVELS.find(l => l.type === 'pilih'),
  titik: LEVELS.find(l => l.type === 'titik'),
  tebalkan: LEVELS.find(l => l.type === 'tebalkan'),
  mewarnai: LEVELS.find(l => l.type === 'mewarnai'),
  urutkan: LEVELS.find(l => l.type === 'urutkan'),
  panah: LEVELS.find(l => l.type === 'panah'),
  memori: LEVELS.find(l => l.type === 'memori')
};

test('Condition A: Undefined AppController - All 9 engines run moves without throwing', () => {
  delete globalThis.window.AppController;
  delete globalThis.window.app;

  // 1. Hubungkan
  const c1 = new MockElement('div');
  Engines.render(c1, mockLevels.hubungkan, () => {});
  const leftItems = c1.querySelectorAll('.left-item');
  const rightItems = c1.querySelectorAll('.right-item');
  assert.ok(leftItems.length > 0 && rightItems.length > 0);
  leftItems[0].click();
  rightItems[0].click(); // Either match or mismatch, must not throw

  // 2. Labirin
  const c2 = new MockElement('div');
  Engines.render(c2, mockLevels.labirin, () => {});
  const navBtns = c2.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.click());

  // 3. Pilih
  const c3 = new MockElement('div');
  Engines.render(c3, mockLevels.pilih, () => {});
  const choiceBtns = c3.querySelectorAll('.choice-btn');
  if (choiceBtns.length > 0) choiceBtns[0].click();

  // 4. Titik
  const c4 = new MockElement('div');
  Engines.render(c4, mockLevels.titik, () => {});
  const dots = c4.querySelectorAll('.dot-node');
  if (dots.length > 1) {
    dots[1].click(); // Out of sequence
    dots[0].click(); // In sequence
  }

  // 5. Tebalkan
  const c5 = new MockElement('div');
  Engines.render(c5, mockLevels.tebalkan, () => {});
  const doneBtn = c5.querySelector('#doneTraceBtn');
  if (doneBtn) doneBtn.click();

  // 6. Mewarnai
  const c6 = new MockElement('div');
  Engines.render(c6, mockLevels.mewarnai, () => {});
  const shape = c6.querySelector('.color-target');
  if (shape) shape.click();
  const finishColor = c6.querySelector('#finishColorBtn');
  if (finishColor) finishColor.click();

  // 7. Urutkan
  const c7 = new MockElement('div');
  Engines.render(c7, mockLevels.urutkan, () => {});
  const orderCards = c7.querySelectorAll('.order-item-btn');
  if (orderCards.length > 0) orderCards[0].click();

  // 8. Panah
  const c8 = new MockElement('div');
  Engines.render(c8, mockLevels.panah, () => {});
  const runBtn = c8.querySelector('#runProgBtn');
  if (runBtn) runBtn.click();

  // 9. Memori
  const c9 = new MockElement('div');
  Engines.render(c9, mockLevels.memori, () => {});
  const memCards = c9.querySelectorAll('.memory-card');
  if (memCards.length >= 2) {
    memCards[0].click();
    memCards[1].click();
  }
});

test('Condition B: Active AppController Mock - All 9 engines trigger reactMascot with correct emotions', () => {
  const reactions = [];
  globalThis.window.AppController = {
    reactMascot(emotion, text) {
      reactions.push({ emotion, text });
    }
  };

  // 1. Hubungkan
  const c1 = new MockElement('div');
  Engines.render(c1, mockLevels.hubungkan, () => {});
  const left1 = c1.querySelectorAll('.left-item');
  const right1 = c1.querySelectorAll('.right-item');
  reactions.length = 0;
  // Trigger both a match and a mismatch
  // Finding match:
  const left0Idx = String(left1[0].dataset.idx);
  const matchRight = Array.from(right1).find(r => String(r.dataset.origIdx) === left0Idx);
  const mismatchRight = Array.from(right1).find(r => String(r.dataset.origIdx) !== left0Idx);

  left1[0].click();
  if (mismatchRight) {
    mismatchRight.click();
    assert.ok(reactions.some(r => r.emotion === 'think'), 'Hubungkan mismatch must trigger think emotion');
  }
  reactions.length = 0;
  left1[0].click();
  if (matchRight) {
    matchRight.click();
    assert.ok(reactions.some(r => r.emotion === 'cheer'), 'Hubungkan match must trigger cheer emotion');
  }

  // 2. Labirin (Obstacle hit -> think)
  const c2 = new MockElement('div');
  Engines.render(c2, mockLevels.labirin, () => {});
  reactions.length = 0;
  // Move into wall
  const walls = new Set(mockLevels.labirin.walls || []);
  if (walls.has('0,1')) {
    const rBtn = c2.querySelector('[data-dir="right"]');
    if (rBtn) rBtn.click();
  } else if (walls.has('1,0')) {
    const dBtn = c2.querySelector('[data-dir="down"]');
    if (dBtn) dBtn.click();
  }
  assert.ok(reactions.some(r => r.emotion === 'think'), 'Labirin obstacle hit must trigger think reaction');

  // 3. Pilih (Correct choice -> cheer, Wrong choice -> think)
  const c3 = new MockElement('div');
  Engines.render(c3, mockLevels.pilih, () => {});
  const choices = c3.querySelectorAll('.choice-btn');
  const correctIdx = mockLevels.pilih.items[0].answerIndex;
  reactions.length = 0;
  // Click wrong choice first
  const wrongChoice = Array.from(choices).find(b => parseInt(b.dataset.idx, 10) !== correctIdx);
  if (wrongChoice) {
    wrongChoice.click();
    assert.ok(reactions.some(r => r.emotion === 'think'), 'Pilih wrong answer must trigger think reaction');
  }
  reactions.length = 0;
  const rightChoice = Array.from(choices).find(b => parseInt(b.dataset.idx, 10) === correctIdx);
  if (rightChoice) {
    rightChoice.click();
    assert.ok(reactions.some(r => r.emotion === 'cheer'), 'Pilih correct answer must trigger cheer reaction');
  }

  // 4. Titik (Out of sequence -> think, final dot -> cheer)
  const c4 = new MockElement('div');
  Engines.render(c4, mockLevels.titik, () => {});
  const dotNodes = c4.querySelectorAll('.dot-node');
  reactions.length = 0;
  // Click dot 2 first
  dotNodes[1].click();
  assert.ok(reactions.some(r => r.emotion === 'think'), 'Titik wrong dot must trigger think reaction');
  reactions.length = 0;
  for (let i = 0; i < dotNodes.length; i++) {
    dotNodes[i].click();
  }
  assert.ok(reactions.some(r => r.emotion === 'cheer'), 'Titik completed loop must trigger cheer reaction');

  // 5. Tebalkan (Done trace -> cheer)
  const c5 = new MockElement('div');
  Engines.render(c5, mockLevels.tebalkan, () => {});
  reactions.length = 0;
  const doneBtn = c5.querySelector('#doneTraceBtn');
  if (doneBtn) doneBtn.click();
  assert.ok(reactions.some(r => r.emotion === 'cheer'), 'Tebalkan completion must trigger cheer reaction');

  // 6. Mewarnai (Shape clicked -> cheer, Finish button -> cheer)
  const c6 = new MockElement('div');
  Engines.render(c6, mockLevels.mewarnai, () => {});
  reactions.length = 0;
  const shape = c6.querySelector('.color-target');
  if (shape) shape.click();
  assert.ok(reactions.some(r => r.emotion === 'cheer' && r.text.includes('Warna Cantik')), 'Mewarnai shape tap must trigger cheer reaction');
  reactions.length = 0;
  const finishBtn = c6.querySelector('#finishColorBtn');
  if (finishBtn) finishBtn.click();
  assert.ok(reactions.some(r => r.emotion === 'cheer' && r.text.includes('Karya Indah')), 'Mewarnai finish must trigger cheer reaction');

  // 7. Urutkan (Correct step -> cheer, Out-of-order -> think)
  const c7 = new MockElement('div');
  Engines.render(c7, mockLevels.urutkan, () => {});
  const orderItems = c7.querySelectorAll('.order-item-btn');
  reactions.length = 0;
  // Click wrong item
  const wrongItem = Array.from(orderItems).find(btn => !btn.className.includes('size-btn-1'));
  if (wrongItem) {
    wrongItem.click();
    assert.ok(reactions.some(r => r.emotion === 'think'), 'Urutkan out of order must trigger think reaction');
  }
  reactions.length = 0;
  const rightItem = Array.from(orderItems).find(btn => btn.className.includes('size-btn-1'));
  if (rightItem) {
    rightItem.click();
    assert.ok(reactions.some(r => r.emotion === 'cheer'), 'Urutkan correct step must trigger cheer reaction');
  }

  // 8. Panah (Incomplete run -> think)
  const c8 = new MockElement('div');
  Engines.render(c8, mockLevels.panah, () => {});
  reactions.length = 0;
  const runBtn = c8.querySelector('#runProgBtn');
  if (runBtn) runBtn.click();
  assert.ok(reactions.some(r => r.emotion === 'think'), 'Panah empty/incomplete program must trigger think reaction');

  // 9. Memori (Flip cards)
  const c9 = new MockElement('div');
  Engines.render(c9, mockLevels.memori, () => {});
  const memCards = c9.querySelectorAll('.memory-card');
  reactions.length = 0;
  memCards[0].click();
  memCards[1].click();
  assert.ok(reactions.length > 0, 'Memori card flip must trigger either cheer or think reaction');
  assert.ok(['cheer', 'think'].includes(reactions[0].emotion));
});

test('Condition C: Fault Injection in AppController - All engines suppress error and do not crash', () => {
  globalThis.window.AppController = {
    reactMascot() {
      throw new Error('Explosive simulated mascot error!');
    }
  };

  // Running moves in all 9 engines must not throw despite AppController crashing
  Object.values(mockLevels).forEach(lvl => {
    const container = new MockElement('div');
    Engines.render(container, lvl, () => {});
    const clickable = container.querySelector('button, .color-target, .maze-cell, .dot-node');
    if (clickable) {
      clickable.click();
    }
  });
});

// ============================================================================
// SUITE 3: ALGORITHMIC BFS PATH SOLVABILITY ON ALL 6 MAZES
// ============================================================================
console.log('\n--- SUITE 3: Algorithmic BFS Path Solvability on All 6 Mazes ---');

const mazeLevels = LEVELS.filter(l => l.type === 'labirin');

test('Exactly 6 maze levels exist across the game worlds', () => {
  assert.equal(mazeLevels.length, 6, `Expected 6 maze levels, found ${mazeLevels.length}`);
  const mazeIds = mazeLevels.map(m => m.id).sort();
  console.log('    Maze Level IDs:', mazeIds.join(', '));
  assert.deepEqual(mazeIds, ['02', '12', '21', '26', '39', '49']);
});

mazeLevels.forEach(maze => {
  test(`Maze Level ${maze.id} ("${maze.title}"): BFS proves 100% path solvability with zero wall obstruction`, () => {
    const size = maze.gridSize || 5;
    const walls = new Set(maze.walls || []);
    const start = { r: 0, c: 0 };
    const goal = { r: size - 1, c: size - 1 };

    // Assert start and goal boundaries
    assert.ok(!walls.has('0,0'), `Start (0,0) in Maze ${maze.id} must not be blocked by wall`);
    assert.ok(!walls.has(`${size - 1},${size - 1}`), `Goal (${size - 1},${size - 1}) in Maze ${maze.id} must not be blocked by wall`);

    // Standard 4-way BFS
    const queue = [{ r: 0, c: 0, dist: 0, path: ['0,0'] }];
    const visited = new Set(['0,0']);
    let shortestPath = null;

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.r === goal.r && cur.c === goal.c) {
        shortestPath = cur.path;
        break;
      }
      const dirs = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
      ];
      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !walls.has(key) && !visited.has(key)) {
          visited.add(key);
          queue.push({ r: nr, c: nc, dist: cur.dist + 1, path: [...cur.path, key] });
        }
      }
    }

    assert.ok(shortestPath !== null, `Maze ${maze.id} is UNSOLVABLE! No path from (0,0) to (${goal.r},${goal.c})`);
    assert.ok(shortestPath.length >= size, `Path in Maze ${maze.id} too short (${shortestPath.length} steps)`);

    // Verify zero wall collisions along the entire path
    shortestPath.forEach(coord => {
      assert.ok(!walls.has(coord), `Obstruction regression: path intersects wall at ${coord} in Maze ${maze.id}`);
    });

    console.log(`    Maze ${maze.id}: Solvable in ${shortestPath.length} steps [Path: ${shortestPath.join(' ➔ ')}]`);
  });
});

// ============================================================================
// SUITE 4: SERVICE WORKER PWA CACHE INVARIANT & LOCAL ASSET INTEGRITY
// ============================================================================
console.log('\n--- SUITE 4: Service Worker PWA Cache Invariant & Asset Integrity ---');

const swPath = path.join(ROOT_DIR, 'sw.js');

test('sw.js exists and defines CACHE_NAME and Cache-First strategy', () => {
  assert.ok(fs.existsSync(swPath), 'sw.js file must exist');
  const swCode = fs.readFileSync(swPath, 'utf8');
  assert.ok(swCode.includes('CACHE_NAME'), 'sw.js must define CACHE_NAME');
  assert.ok(swCode.includes('caches.match'), 'sw.js must implement Cache-First via caches.match');
});

test('Exact 14 local cached assets declared in sw.js ASSETS_TO_CACHE', () => {
  const swCode = fs.readFileSync(swPath, 'utf8');
  const match = swCode.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
  assert.ok(match, 'ASSETS_TO_CACHE array must be declared in sw.js');

  const assets = eval(`[${match[1]}]`);
  assert.equal(assets.length, 14, `Expected exactly 14 cached assets, found ${assets.length}`);

  const expectedAssets = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './audio.js',
    './engines.js',
    './illustrations.js',
    './levels.js',
    './mascot.js',
    './manifest.webmanifest',
    './icons/favicon.svg',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
    './icons/icon-maskable.svg'
  ];

  assert.deepEqual(assets, expectedAssets, 'ASSETS_TO_CACHE must match the exact 14 mandatory offline assets');
});

test('All 14 cached assets physically exist on local filesystem with non-zero size', () => {
  const swCode = fs.readFileSync(swPath, 'utf8');
  const match = swCode.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
  const assets = eval(`[${match[1]}]`);

  assets.forEach(relPath => {
    const fullPath = path.resolve(ROOT_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `Cached asset does not exist on disk: ${relPath}`);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) {
      assert.ok(stat.size > 0, `Cached asset ${relPath} is 0 bytes!`);
    }
  });
});

test('Zero missing core runtime files (all imports in index.html and app.js are cached)', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const swCode = fs.readFileSync(swPath, 'utf8');

  // Verify scripts in index.html are in cache list
  const scriptMatches = indexHtml.matchAll(/src=["'](\.\/)?([^"']+)["']/g);
  for (const m of scriptMatches) {
    const scriptFile = m[2];
    assert.ok(swCode.includes(scriptFile), `Runtime script ${scriptFile} from index.html missing from sw.js ASSETS_TO_CACHE!`);
  }
});

// ============================================================================
// SUITE 5: CRITICAL ENGINE INVARIANTS RIGID ASSERTIONS
// ============================================================================
console.log('\n--- SUITE 5: Critical Engine Invariants Assertions ---');

test('Invariant 1: Level 14 Mask Silhouette Resolver Verification', () => {
  const lvl14 = LEVELS.find(l => l.id === '14');
  assert.ok(lvl14, 'Level 14 exists in LEVELS');
  assert.equal(lvl14.type, 'hubungkan');

  // Check SVG generation for Topeng Spidey vs Bayangan Topeng
  const topengSpideyHtml = Illustrations.render('🎭 Topeng Spidey');
  const bayanganTopengHtml = Illustrations.render('🎭 Bayangan Topeng', { isShadow: true });

  assert.ok(topengSpideyHtml.includes('rx="36"') && topengSpideyHtml.includes('ry="42"'),
    'Topeng Spidey MUST render mask SVG (ellipse rx=36 ry=42), NOT full spidey body');
  assert.ok(!topengSpideyHtml.includes('x="36" y="74"'),
    'Topeng Spidey MUST NOT contain Spidey boots rects');

  assert.ok(bayanganTopengHtml.includes('ill-shadow'),
    'Bayangan Topeng MUST contain ill-shadow class');
  assert.ok(bayanganTopengHtml.includes('rx="36"') && bayanganTopengHtml.includes('ry="42"'),
    'Bayangan Topeng MUST render the matching mask silhouette');
});

test('Invariant 2: Level 16 Detektif Topeng Direction & Answer Verification', () => {
  const lvl16 = LEVELS.find(l => l.id === '16');
  assert.ok(lvl16, 'Level 16 exists in LEVELS');
  assert.equal(lvl16.type, 'pilih');
  assert.equal(lvl16.hideCaptions, true, 'Level 16 must have hideCaptions to prevent text reliance');

  const opts = lvl16.items[0].options;
  assert.equal(opts.length, 4, 'Level 16 must have 4 options');

  const directions = opts.map(o => o.direction);
  const rightCount = directions.filter(d => d === 'right').length;
  const leftCount = directions.filter(d => d === 'left').length;

  assert.equal(rightCount, 3, 'Must have 3 masks facing right');
  assert.equal(leftCount, 1, 'Must have 1 mask facing left');
  assert.equal(lvl16.items[0].answerIndex, 2, 'Answer must point to the left-facing mask (index 2)');

  opts.forEach(opt => {
    assert.equal(opt.hideLabel, true, 'Each option must hide text label for pure visual discrimination');
  });

  const maskRightHtml = Illustrations.render(opts[0].label, { direction: opts[0].direction, size: 104 });
  const maskLeftHtml = Illustrations.render(opts[2].label, { direction: opts[2].direction, size: 104 });

  assert.ok(maskRightHtml.includes('topeng-dir-right'), 'Right mask must have topeng-dir-right class');
  assert.ok(maskLeftHtml.includes('topeng-dir-left'), 'Left mask must have topeng-dir-left class');
  assert.ok(maskLeftHtml.includes('scale(-1, 1)'), 'Left mask must use mirror transform for identical 1-model design');
});

test('Invariant 3: Level 18 Urutkan Guided Slot Classes & Hidden Spoiler Text', () => {
  const lvl18 = LEVELS.find(l => l.id === '18');
  assert.ok(lvl18, 'Level 18 exists in LEVELS');
  assert.equal(lvl18.type, 'urutkan');
  assert.equal(lvl18.hideItemLabels, true, 'Level 18 must hide thick spoiler labels on cards');

  const items18 = lvl18.items;
  assert.equal(items18.length, 3, 'Must have 3 items');
  const sizes = items18.map(i => i.size);
  assert.deepEqual(sizes, [1, 2, 3], 'Must have sizes 1, 2, 3');

  const container = new MockElement('div');
  Engines.renderUrutkan(container, lvl18, () => {});

  const slots = container.querySelectorAll('.order-slot');
  assert.equal(slots.length, 3, 'Must render 3 slots');
  slots.forEach((s, idx) => {
    assert.ok(s.classList.contains(`slot-size-step-${idx + 1}`), `Slot ${idx + 1} must have guided size class slot-size-step-${idx + 1}`);
  });

  const cards = container.querySelectorAll('.order-item-btn');
  assert.equal(cards.length, 3, 'Must render 3 cards');
  cards.forEach(c => {
    assert.ok(c.innerHTML.includes('style="display:none"'), 'Card spoiler label text MUST have style="display:none"');
  });
});

test('Invariant 4: Level 19 Titik Overlay & Closed Loop Progression', () => {
  const lvl19 = LEVELS.find(l => l.id === '19');
  assert.ok(lvl19, 'Level 19 exists in LEVELS');
  assert.equal(lvl19.dots.length, 8, 'Level 19 must have 8 dots');

  // Check dot 1 and dot 8 coordinates separation
  const dot1 = lvl19.dots.find(d => d.num === 1);
  const dot8 = lvl19.dots.find(d => d.num === 8);
  assert.ok(dot1 && dot8, 'Dot 1 and Dot 8 exist');
  assert.ok(dot1.x !== dot8.x || dot1.y !== dot8.y,
    `Dot 1 (${dot1.x}, ${dot1.y}) and Dot 8 (${dot8.x}, ${dot8.y}) MUST NOT overlap!`);

  const coordSet19 = new Set(lvl19.dots.map(d => `${d.x},${d.y}`));
  assert.equal(coordSet19.size, 8, 'All 8 dots must have unique coordinates');

  const container = new MockElement('div');
  let completed = false;
  Engines.renderHubungkanTitik(container, lvl19, () => { completed = true; });

  const overlay = container.querySelector('#revealOverlay');
  assert.ok(overlay, 'Reveal overlay exists');
  assert.ok(!overlay.classList.contains('show'), 'Reveal overlay MUST NOT have .show at start (must not block canvas)');

  const dotNodes = container.querySelectorAll('.dot-node');
  assert.equal(dotNodes.length, 8, 'Must render 8 dot nodes');

  // Complete dots sequentially
  for (let i = 0; i < 8; i++) {
    dotNodes[i].click();
  }
  assert.ok(overlay.classList.contains('show'), 'Reveal overlay MUST receive .show class upon completion');
  const svgLines = container.querySelectorAll('line');
  assert.ok(svgLines.length >= 8, `Must draw all segment lines including loop closing line (got ${svgLines.length})`);
});

test('Invariant 5: Levels 09 & 45 Zero Overlapping Dots & Physical Clearance (>=16%)', () => {
  const lvl09 = LEVELS.find(l => l.id === '09');
  assert.ok(lvl09, 'Level 09 exists');
  assert.equal(lvl09.dots.length, 10, 'Level 09 must have 10 dots');
  const coordSet09 = new Set(lvl09.dots.map(d => `${d.x},${d.y}`));
  assert.equal(coordSet09.size, 10, 'All 10 dots in Level 09 must have unique coordinates');

  const lvl45 = LEVELS.find(l => l.id === '45');
  assert.ok(lvl45, 'Level 45 exists');
  assert.equal(lvl45.dots.length, 10, 'Level 45 must have 10 dots');
  const coordSet45 = new Set(lvl45.dots.map(d => `${d.x},${d.y}`));
  assert.equal(coordSet45.size, 10, 'All 10 dots in Level 45 must have unique coordinates');

  // Every pair of dots MUST have Euclidean distance >= 16% to guarantee zero physical overlap
  for (const level of [lvl09, lvl45]) {
    for (let i = 0; i < level.dots.length; i++) {
      for (let j = i + 1; j < level.dots.length; j++) {
        const dx = level.dots[i].x - level.dots[j].x;
        const dy = level.dots[i].y - level.dots[j].y;
        const d = Math.hypot(dx, dy);
        assert.ok(d >= 16, `Level ${level.id}: Dot ${level.dots[i].num} and Dot ${level.dots[j].num} are too close (${d.toFixed(2)}% < 16%, overlaps 54px target)`);
      }
    }
  }
  console.log('    Level 09 and Level 45 pairwise clearances all satisfy >= 16% threshold.');
});

// ============================================================================
// SUITE 6: ADVERSARIAL ORACLE SOUNDNESS & TODDLER FRENZY TAPPING STRESS
// ============================================================================
console.log('\n--- SUITE 6: Adversarial Oracle Soundness & Frenzy Tapping Stress ---');

test('Oracle Soundness: BFS correctly detects unsolvable maze when goal is obstructed (Negative Control)', () => {
  const baseMaze = mazeLevels[0];
  const size = baseMaze.gridSize || 5;
  // Artificially wall off goal cell (size-1, size-1): walls on (size-2, size-1) and (size-1, size-2)
  const artificialWalls = new Set([
    `${size - 2},${size - 1}`,
    `${size - 1},${size - 2}`
  ]);

  const queue = [{ r: 0, c: 0, dist: 0 }];
  const visited = new Set(['0,0']);
  let solved = false;

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.r === size - 1 && cur.c === size - 1) {
      solved = true;
      break;
    }
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !artificialWalls.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push({ r: nr, c: nc, dist: cur.dist + 1 });
      }
    }
  }

  assert.equal(solved, false, 'BFS must prove impossible when goal is completely walled off');
});

test('Toddler Frenzy Tapping: Rapid concurrent clicks in all 9 engines do not crash or corrupt state', () => {
  Object.values(mockLevels).forEach(lvl => {
    const container = new MockElement('div');
    Engines.render(container, lvl, () => {});

    // Rapidly spam every button and interactive node 20 times in quick succession
    const interactives = container.querySelectorAll('button, .maze-cell, .color-target, .dot-node, .order-item-btn, .choice-btn');
    for (let round = 0; round < 20; round++) {
      interactives.forEach(el => {
        el.click();
      });
    }

    assert.ok(container.children.length > 0, `Engine ${lvl.type} container emptied or corrupted by frenzy tapping`);
  });
});

await testAsync('All 9 Engines trigger victory onComplete callback upon successful resolution', async () => {
  // Speed up setTimeout during this test
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn, _delay) => originalSetTimeout(fn, 1);

  try {
    // 1. Hubungkan
    let c1Done = false;
    const c1 = new MockElement('div');
    Engines.render(c1, mockLevels.hubungkan, () => { c1Done = true; });
    const lefts = c1.querySelectorAll('.left-item');
    const rights = c1.querySelectorAll('.right-item');
    for (const left of lefts) {
      const lIdx = String(left.dataset.idx);
      const right = Array.from(rights).find(r => String(r.dataset.origIdx) === lIdx);
      if (right) {
        left.click();
        right.click();
      }
    }
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c1Done, 'Hubungkan must trigger onComplete callback');

    // 2. Labirin (Follow BFS path to goal)
    let c2Done = false;
    const c2 = new MockElement('div');
    Engines.render(c2, mockLevels.labirin, () => { c2Done = true; });
    // Navigate step by step along shortest BFS path for Level 02
    const path02 = [
      [0, 1], [1, 1], [2, 1], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4]
    ];
    let curR = 0, curC = 0;
    for (const [nr, nc] of path02) {
      let dir = '';
      if (nr > curR) dir = 'down';
      else if (nr < curR) dir = 'up';
      else if (nc > curC) dir = 'right';
      else if (nc < curC) dir = 'left';

      const btn = c2.querySelector(`[data-dir="${dir}"]`);
      if (btn) btn.click();
      curR = nr;
      curC = nc;
    }
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c2Done, 'Labirin must trigger onComplete callback');

    // 3. Pilih
    let c3Done = false;
    const c3 = new MockElement('div');
    Engines.render(c3, mockLevels.pilih, () => { c3Done = true; });
    for (let step = 0; step < mockLevels.pilih.items.length; step++) {
      await new Promise(r => originalSetTimeout(r, 10));
      const item = mockLevels.pilih.items[step];
      const choices = c3.querySelectorAll('.choice-btn');
      const correctBtn = Array.from(choices).find((b, idx) => {
        if (item.answerIndex !== undefined) return idx === item.answerIndex;
        if (item.answer !== undefined) return b.innerHTML.includes(String(item.answer));
        return false;
      });
      if (correctBtn) correctBtn.click();
      await new Promise(r => originalSetTimeout(r, 10));
    }
    await new Promise(r => originalSetTimeout(r, 30));
    assert.ok(c3Done, 'Pilih must trigger onComplete callback');

    // 4. Titik
    let c4Done = false;
    const c4 = new MockElement('div');
    Engines.render(c4, mockLevels.titik, () => { c4Done = true; });
    const dots = c4.querySelectorAll('.dot-node');
    for (let i = 0; i < dots.length; i++) {
      dots[i].click();
    }
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c4Done, 'Titik must trigger onComplete callback');

    // 5. Tebalkan
    let c5Done = false;
    const c5 = new MockElement('div');
    Engines.render(c5, mockLevels.tebalkan, () => { c5Done = true; });
    const numTraceItems = (mockLevels.tebalkan.traceItems || [1]).length;
    for (let t = 0; t < numTraceItems; t++) {
      const doneTraceBtn = c5.querySelector('#doneTraceBtn');
      if (doneTraceBtn) doneTraceBtn.click();
    }
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c5Done, 'Tebalkan must trigger onComplete callback');

    // 6. Mewarnai
    let c6Done = false;
    const c6 = new MockElement('div');
    Engines.render(c6, mockLevels.mewarnai, () => { c6Done = true; });
    const finishColorBtn = c6.querySelector('#finishColorBtn');
    if (finishColorBtn) finishColorBtn.click();
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c6Done, 'Mewarnai must trigger onComplete callback');

    // 7. Urutkan
    let c7Done = false;
    const c7 = new MockElement('div');
    Engines.render(c7, mockLevels.urutkan, () => { c7Done = true; });
    for (let seq = 1; seq <= mockLevels.urutkan.items.length; seq++) {
      const card = Array.from(c7.querySelectorAll('.order-item-btn')).find(b => b.className.includes(`size-btn-${seq}`));
      if (card) card.click();
    }
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c7Done, 'Urutkan must trigger onComplete callback');

    // 8. Panah
    let c8Done = false;
    const c8 = new MockElement('div');
    Engines.render(c8, mockLevels.panah, () => { c8Done = true; });
    // Add 2 right, 2 down
    const rightCmd = c8.querySelector('[data-arrow="➡️"]');
    const downCmd = c8.querySelector('[data-arrow="⬇️"]');
    if (rightCmd && downCmd) {
      rightCmd.click();
      rightCmd.click();
      downCmd.click();
      downCmd.click();
      const runBtn = c8.querySelector('#runProgBtn');
      if (runBtn) runBtn.click();
    }
    await new Promise(r => originalSetTimeout(r, 20));
    assert.ok(c8Done, 'Panah must trigger onComplete callback');

    // 9. Memori
    let c9Done = false;
    const c9 = new MockElement('div');
    Engines.render(c9, mockLevels.memori, () => { c9Done = true; });
    const pairs = mockLevels.memori.pairs;
    for (const p of pairs) {
      const matchCards = Array.from(c9.querySelectorAll('.memory-card')).filter(card => {
        return !card.classList.contains('matched') && (card.innerHTML.includes(p.name) || card.innerHTML.includes(p.emoji));
      });
      if (matchCards.length >= 2) {
        matchCards[0].click();
        matchCards[1].click();
        await new Promise(r => originalSetTimeout(r, 10));
      }
    }
    await new Promise(r => originalSetTimeout(r, 30));
    assert.ok(c9Done, 'Memori must trigger onComplete callback');
  } finally {
    globalThis.setTimeout = originalSetTimeout;
  }
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log('📊 EMPIRICAL STRESS TEST EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Checks Executed : ${passCount + failCount}`);
console.log(`Passed Checks         : \x1b[32m${passCount}\x1b[0m`);
console.log(`Failed Checks         : \x1b[31m${failCount}\x1b[0m`);
console.log(`Anomalies Detected    : \x1b[33m${anomalies.length}\x1b[0m`);
console.log('================================================================');

if (failCount > 0) {
  console.error('\n❌ STRESS TEST FAILED with regression/invariant violations!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL ADVERSARIAL STRESS CHECKS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}
