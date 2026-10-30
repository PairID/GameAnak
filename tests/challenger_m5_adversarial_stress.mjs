// tests/challenger_m5_adversarial_stress.mjs
// Adversarial Empirical Stress Test Suite for Milestone 5 (End-to-End Stress Verifier)
// Written by Challenger 1 (critic & specialist)
// Pure Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🕷️ CHALLENGER M5-1: ADVERSARIAL EMPIRICAL STRESS VERIFIER');
console.log('BFS Mazes, Robot Automata, Storage Resilience & Concurrency');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
const failures = [];

async function check(title, fn) {
  totalChecks++;
  try {
    await fn();
    passedChecks++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${title}`);
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${title}`);
    console.error(`         \x1b[33mError: ${err.message}\x1b[0m`);
    failures.push({ title, error: err });
  }
}

// ============================================================================
// SYNTHETIC DOM ENVIRONMENT & MOCK APIS
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
    this.width = 800;
    this.height = 600;
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
        const isSelfClosing = (attrs && attrs.trim().endsWith('/')) ||
          ['img', 'input', 'br', 'hr', 'source', 'line', 'path', 'circle', 'rect', 'ellipse', 'polygon'].includes(openTag.toLowerCase());
        if (!isSelfClosing) {
          stack.push(el);
        }
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        const txtEl = new MockElement('span');
        txtEl.textContent = text.trim();
        stack[stack.length - 1].appendChild(txtEl);
      }
    }
  }

  appendChild(child) {
    if (child) {
      child.parentNode = this;
      this.children.push(child);
    }
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

  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'id') this.id = v;
    if (k === 'class') this.className = v;
    if (k.startsWith('data-')) {
      const prop = k.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[prop] = String(v);
    }
  }

  getAttribute(k) {
    if (k === 'id') return this.id || null;
    if (k === 'class') return this.className || null;
    if (k.startsWith('data-')) {
      const prop = k.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      return this.dataset[prop] !== undefined ? this.dataset[prop] : null;
    }
    return this.attributes[k] !== undefined ? this.attributes[k] : null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k.startsWith('data-')) {
      const prop = k.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      delete this.dataset[prop];
    }
  }

  addEventListener(type, cb) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(cb);
  }

  removeEventListener(type, cb) {
    if (this.listeners.has(type)) {
      const arr = this.listeners.get(type);
      const idx = arr.indexOf(cb);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }

  dispatchEvent(evt) {
    const arr = this.listeners.get(evt.type) || [];
    for (const cb of arr) {
      cb.call(this, evt);
    }
    if (typeof this[`on${evt.type}`] === 'function') {
      this[`on${evt.type}`](evt);
    }
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, preventDefault: () => {} });
  }

  getContext(type) {
    return {
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {}
    };
  }

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }

  querySelectorAll(sel) {
    const results = [];
    const selectors = sel.split(',').map(s => s.trim()).filter(Boolean);

    function walk(node) {
      for (const child of node.children) {
        for (const single of selectors) {
          if (matchSingleSelector(child, single)) {
            if (!results.includes(child)) {
              results.push(child);
            }
          }
        }
        walk(child);
      }
    }

    walk(this);
    return results;
  }
}

class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) {
    return this.store.has(k) ? this.store.get(k) : null;
  }
  setItem(k, v) {
    this.store.set(k, String(v));
  }
  removeItem(k) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
}

// Build Global DOM Environment
const mockLocalStorage = new MockLocalStorage();
const rootDocEl = new MockElement('html');
const bodyEl = new MockElement('body');
rootDocEl.appendChild(bodyEl);

const mockDocument = {
  documentElement: rootDocEl,
  body: bodyEl,
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    function find(n) {
      if (n.id === id) return n;
      for (const c of n.children) {
        const found = find(c);
        if (found) return found;
      }
      return null;
    }
    return find(rootDocEl);
  },
  querySelector: (sel) => rootDocEl.querySelector(sel),
  querySelectorAll: (sel) => rootDocEl.querySelectorAll(sel),
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Set Global Headless Environment
globalThis.window = {
  document: mockDocument,
  innerWidth: 1024,
  innerHeight: 768,
  localStorage: mockLocalStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  print: () => {}
};
globalThis.document = mockDocument;
globalThis.localStorage = mockLocalStorage;

// Load Modules
const { WORLDS, LEVELS } = await import('../levels.js');
const { Engines } = await import('../engines.js');
const { sound } = await import('../audio.js');
const { Mascot } = await import('../mascot.js');
const { ConfettiEffect, AppController, App } = await import('../app.js');

function setupFreshDOM() {
  bodyEl.children = [];
  mockLocalStorage.clear();

  const ids = [
    'confettiCanvas', 'starCounter', 'totalStarsCount', 'btnHeaderBack',
    'btnOpenCert', 'btnOpenParent', 'parentHoldProgress', 'instructionBar',
    'btnSpeakPrompt', 'promptText', 'gameLevelBadge', 'gameLevelTitle',
    'mascotBubble', 'viewWorlds', 'welcomeMascot', 'worldsGrid',
    'viewLevels', 'currentWorldTitle', 'currentWorldProgress', 'levelsGrid',
    'viewGame', 'gameMount', 'modalVictory', 'victoryMascot', 'victoryStarsAnim',
    'btnNextLevel', 'btnReplayLevel', 'btnVictoryLevelSelect', 'modalParent',
    'parentGateSection', 'parentMathQuestion', 'parentMathChoices', 'btnCancelParentGate',
    'parentDashboardSection', 'inputChildName', 'btnSaveChildName', 'worldRecapList',
    'btnTestSfx', 'btnTestTts', 'btnResetProgress', 'btnCloseParentDash',
    'modalCertificate', 'certChildName', 'certTotalStars', 'certCompletedLevels',
    'certIssueDate', 'certMascotLeft', 'certMascotRight', 'btnPrintCert', 'btnCloseCert'
  ];

  ids.forEach(id => {
    const el = new MockElement(id === 'confettiCanvas' ? 'canvas' : 'div', id);
    bodyEl.appendChild(el);
  });
}

// ============================================================================
// SUITE 1: ALGORITHMIC ORACLES (BFS MAZES & ROBOT PANAH AUTOMATA)
// ============================================================================
console.log('--- [SUITE 1] ALGORITHMIC ORACLES (BFS MAZES & ROBOT PANAH AUTOMATA) ---');

await check('1.1 BFS Maze Solvability Oracle across all maze levels', () => {
  const mazeLevels = LEVELS.filter(l => l.type === 'labirin');
  assert.ok(mazeLevels.length >= 6, `Expected at least 6 maze levels, found ${mazeLevels.length}`);

  mazeLevels.forEach(level => {
    const size = level.gridSize || 5;
    assert.ok(typeof size === 'number' && size >= 3, `Level ${level.id} invalid gridSize: ${size}`);
    const walls = new Set(level.walls || []);

    const start = { r: 0, c: 0 };
    const goal = { r: size - 1, c: size - 1 };

    // Check bounds of walls
    walls.forEach(w => {
      const [r, c] = w.split(',').map(Number);
      assert.ok(!isNaN(r) && !isNaN(c), `Level ${level.id} wall coordinate invalid: ${w}`);
      assert.ok(r >= 0 && r < size && c >= 0 && c < size, `Level ${level.id} wall ${w} out of bounds (${size}x${size})`);
    });

    // Start & Goal must not be walls
    assert.ok(!walls.has('0,0'), `Level ${level.id} start (0,0) is blocked by a wall!`);
    assert.ok(!walls.has(`${goal.r},${goal.c}`), `Level ${level.id} goal (${goal.r},${goal.c}) is blocked by a wall!`);

    // Standard 4-directional BFS
    const queue = [{ r: start.r, c: start.c, dist: 0, path: ['0,0'] }];
    const visited = new Set(['0,0']);
    let solved = false;
    let shortestDist = -1;

    const dirs = [
      { r: -1, c: 0, name: 'UP' },
      { r: 1, c: 0, name: 'DOWN' },
      { r: 0, c: -1, name: 'LEFT' },
      { r: 0, c: 1, name: 'RIGHT' }
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.r === goal.r && cur.c === goal.c) {
        solved = true;
        shortestDist = cur.dist;
        break;
      }

      for (const d of dirs) {
        const nr = cur.r + d.r;
        const nc = cur.c + d.c;
        const key = `${nr},${nc}`;

        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (!walls.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ r: nr, c: nc, dist: cur.dist + 1, path: [...cur.path, key] });
          }
        }
      }
    }

    assert.ok(solved, `CRITICAL: Level ${level.id} ("${level.title}") is UNSOLVABLE by BFS! No valid path from (0,0) to (${goal.r},${goal.c})!`);
    assert.ok(shortestDist > 0, `Level ${level.id} path length must be > 0 (found ${shortestDist})`);
  });
});

await check('1.2 Maze Engine Interactive Navigation & Wall Collisions', async () => {
  const mount = new MockElement('div');
  const level = LEVELS.find(l => l.id === '02' && l.type === 'labirin');
  assert.ok(level, 'Level 02 labirin not found');

  let completed = false;
  Engines.render(mount, level, () => { completed = true; });

  const upBtn = mount.querySelector('.nav-btn.up');
  const downBtn = mount.querySelector('.nav-btn.down');
  const leftBtn = mount.querySelector('.nav-btn.left');
  const rightBtn = mount.querySelector('.nav-btn.right');
  assert.ok(upBtn && downBtn && leftBtn && rightBtn, 'Maze navigation buttons rendered');

  // Level 02 has walls: ['1,0', '1,2', '3,1', '2,3', '3,3']
  // Start at (0,0). Attempt to move UP -> should remain (0,0)
  upBtn.click();
  // Attempt to move DOWN into (1,0) (wall) -> should remain (0,0)
  downBtn.click();

  // Move RIGHT to (0,1)
  rightBtn.click();
  // Move RIGHT to (0,2)
  rightBtn.click();
  // Move DOWN to (0,2) -> (1,2) is wall. Try DOWN -> blocked
  downBtn.click();
  // Move RIGHT to (0,3)
  rightBtn.click();
  // Move RIGHT to (0,4)
  rightBtn.click();
  // Move DOWN to (1,4)
  downBtn.click();
  // Move DOWN to (2,4)
  downBtn.click();
  // Move DOWN to (3,4)
  downBtn.click();
  // Move DOWN to (4,4) -> GOAL!
  downBtn.click();

  // Wait for 600ms setTimeout in engine
  await new Promise(r => setTimeout(r, 700));

  assert.ok(completed, 'Navigating along valid path triggered level completion callback');
});

await check('1.3 Robot Arrow Coding (Panah) Automata Simulation Oracle', () => {
  const panahLevels = LEVELS.filter(l => l.type === 'panah');
  assert.ok(panahLevels.length >= 1, 'Expected at least 1 panah level');

  panahLevels.forEach(level => {
    const grid = level.grid;
    assert.ok(Array.isArray(grid) && grid.length >= 2, `Level ${level.id} grid must be 2D array`);
    const rows = grid.length;
    const cols = grid[0].length;

    let robotPos = null;
    let goalPos = null;
    const obstacles = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell === 'R') robotPos = { r, c };
        else if (cell === 'G') goalPos = { r, c };
        else if (cell === 'X') obstacles.push({ r, c });
      }
    }

    assert.ok(robotPos, `Level ${level.id} missing Robot start position 'R'`);
    assert.ok(goalPos, `Level ${level.id} missing Goal position 'G'`);

    // Verify correctProgram execution
    const prog = level.correctProgram;
    assert.ok(Array.isArray(prog) && prog.length >= 2, `Level ${level.id} correctProgram must be array`);

    let cur = { ...robotPos };
    prog.forEach((cmd, stepIdx) => {
      if (cmd === '➡️') cur.c++;
      else if (cmd === '⬅️') cur.c--;
      else if (cmd === '⬇️') cur.r++;
      else if (cmd === '⬆️') cur.r--;
      else assert.fail(`Unknown command "${cmd}" in correctProgram`);

      assert.ok(cur.r >= 0 && cur.r < rows && cur.c >= 0 && cur.c < cols,
        `Step ${stepIdx} (${cmd}) drove robot out of bounds to (${cur.r},${cur.c})!`);

      const hitObstacle = obstacles.some(obs => obs.r === cur.r && obs.c === cur.c);
      assert.ok(!hitObstacle, `Step ${stepIdx} (${cmd}) drove robot into obstacle at (${cur.r},${cur.c})!`);
    });

    assert.equal(cur.r, goalPos.r, `Program ended at row ${cur.r}, expected goal row ${goalPos.r}`);
    assert.equal(cur.c, goalPos.c, `Program ended at col ${cur.c}, expected goal col ${goalPos.c}`);
  });
});

await check('1.4 Robot Panah Engine Interactive Execution & Tray Reset', async () => {
  const mount = new MockElement('div');
  const level = LEVELS.find(l => l.id === '58' && l.type === 'panah');
  assert.ok(level, 'Level 58 panah not found');

  let completed = false;
  Engines.render(mount, level, () => { completed = true; });

  const rightArrow = mount.querySelector('.arrow-cmd-btn[data-arrow="➡️"]');
  const downArrow = mount.querySelector('.arrow-cmd-btn[data-arrow="⬇️"]');
  const resetBtn = mount.querySelector('#resetProgBtn');
  const runBtn = mount.querySelector('#runProgBtn');
  const slotsEl = mount.querySelector('#programSlots');

  assert.ok(rightArrow && downArrow && resetBtn && runBtn && slotsEl, 'Panah controls rendered');

  // Incomplete program run -> should not complete
  runBtn.click();
  assert.equal(completed, false, 'Running empty program should not complete');

  // Input 1 arrow -> reset
  rightArrow.click();
  assert.equal(slotsEl.querySelectorAll('.cmd-chip').length, 1);
  resetBtn.click();
  assert.equal(slotsEl.querySelectorAll('.cmd-chip').length, 0);

  // Input valid sequence: ➡️, ➡️, ⬇️, ⬇️
  rightArrow.click();
  rightArrow.click();
  downArrow.click();
  downArrow.click();
  assert.equal(slotsEl.querySelectorAll('.cmd-chip').length, 4);

  runBtn.click();

  // Wait for 1200ms setTimeout in engine
  await new Promise(r => setTimeout(r, 1300));
  assert.ok(completed, 'Valid program triggered onComplete callback');
});

// ============================================================================
// SUITE 2: LOCALSTORAGE ADVERSARIAL CORRUPTION & RECOVERY
// ============================================================================
console.log('\n--- [SUITE 2] LOCALSTORAGE ADVERSARIAL CORRUPTION & RECOVERY ---');

await check('2.1 Corrupt Malformed JSON in spidey_completed_levels', () => {
  setupFreshDOM();
  const testApp = new AppController();

  mockLocalStorage.setItem('spidey_completed_levels', '{corrupted:::[invalid json');
  mockLocalStorage.setItem('spidey_stars', 'not-a-number');

  testApp.loadProgress();
  assert.deepEqual(testApp.completedLevels, {}, 'Corrupted JSON must gracefully reset to empty object');
  assert.equal(testApp.getTotalStars(), 0, 'Total stars must evaluate to 0');
});

await check('2.2 Non-object and Primitive values in spidey_completed_levels', () => {
  setupFreshDOM();
  const testApp = new AppController();

  const malformedInputs = ['"just a string"', '12345', 'true', 'false', 'null'];
  malformedInputs.forEach(input => {
    mockLocalStorage.setItem('spidey_completed_levels', input);
    testApp.loadProgress();
    assert.ok(typeof testApp.completedLevels === 'object', 'completedLevels must always be an object');
  });
});

await check('2.3 Malformed, negative, or NaN star values in completedLevels', () => {
  setupFreshDOM();
  const testApp = new AppController();

  testApp.completedLevels = {
    '01': -10,
    '02': 'invalid',
    '03': NaN,
    '04': null,
    '05': undefined,
    '06': 3,
    '07': '3'
  };

  const total = testApp.getTotalStars();
  assert.ok(!isNaN(total), 'Total stars must never be NaN');
  assert.ok(typeof total === 'number', 'Total stars must be a valid number');
});

await check('2.4 Prototype Pollution Attack Resistance', () => {
  setupFreshDOM();
  const testApp = new AppController();

  mockLocalStorage.setItem('spidey_completed_levels', '{"__proto__": {"polluted": true}, "constructor": {"prototype": {"polluted": true}}}');
  testApp.loadProgress();

  assert.equal(Object.prototype.polluted, undefined, 'Object prototype must not be polluted');
  assert.equal({}.polluted, undefined, 'Plain objects must not be polluted');
});

await check('2.5 Storage Exceptions (QuotaExceededError & Access Denied)', () => {
  setupFreshDOM();
  const testApp = new AppController();

  const origGet = mockLocalStorage.getItem;
  const origSet = mockLocalStorage.setItem;
  const origRemove = mockLocalStorage.removeItem;

  mockLocalStorage.getItem = () => { throw new Error('Access Denied (Incognito/Sandbox)'); };
  mockLocalStorage.setItem = () => { throw new Error('QuotaExceededError: LocalStorage Full'); };
  mockLocalStorage.removeItem = () => { throw new Error('SecurityError: LocalStorage Disabled'); };

  try {
    const val = testApp.safeStorageGet('any_key', 'fallback_val');
    assert.equal(val, 'fallback_val');

    testApp.safeStorageSet('any_key', 'some_val');
    testApp.safeStorageRemove('any_key');
    testApp.saveProgress();
    testApp.resetProgress();
  } finally {
    mockLocalStorage.getItem = origGet;
    mockLocalStorage.setItem = origSet;
    mockLocalStorage.removeItem = origRemove;
  }
});

await check('2.6 Corrupted Child Name & Script Injection Sanitization', () => {
  setupFreshDOM();
  const testApp = new AppController();

  mockLocalStorage.setItem('spidey_child_name', '<script>alert("hack")</script>');
  testApp.loadProgress();
  assert.equal(testApp.childName, '<script>alert("hack")</script>');

  testApp.openCertificateModal();
  const nameEl = mockDocument.getElementById('certChildName');
  assert.ok(nameEl, 'certChildName element exists');
  assert.equal(nameEl.textContent, '<script>alert("hack")</script>');
});

await check('2.7 Safe Reset Progress Clears All Storage Keys', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  testApp.completedLevels = { '01': 3, '02': 3 };
  testApp.saveProgress();

  assert.ok(mockLocalStorage.getItem('spidey_completed_levels'));
  assert.ok(mockLocalStorage.getItem('spidey_stars'));

  testApp.resetProgress();
  assert.deepEqual(testApp.completedLevels, {});
  assert.equal(mockLocalStorage.getItem('spidey_completed_levels'), null);
  assert.equal(mockLocalStorage.getItem('spidey_stars'), null);
});

// ============================================================================
// SUITE 3: CONCURRENCY, RAPID STATE TRANSITIONS & EVENT BOMBARDMENT
// ============================================================================
console.log('\n--- [SUITE 3] CONCURRENCY & RAPID STATE TRANSITIONS ---');

await check('3.1 Frenzy View Switching (100 rapid transitions in microburst)', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  for (let i = 0; i < 100; i++) {
    testApp.showWorldsView();
    testApp.showLevelsView('hewan');
    testApp.launchLevel('01');
    testApp.showLevelsView('angka');
    testApp.launchLevel('39');
    testApp.showWorldsView();
  }

  const viewWorlds = mockDocument.getElementById('viewWorlds');
  const viewLevels = mockDocument.getElementById('viewLevels');
  const viewGame = mockDocument.getElementById('viewGame');

  assert.equal(viewWorlds.style.display, 'flex');
  assert.ok(viewWorlds.classList.contains('active'));
  assert.equal(viewLevels.style.display, 'none');
  assert.ok(!viewLevels.classList.contains('active'));
  assert.equal(viewGame.style.display, 'none');
  assert.ok(!viewGame.classList.contains('active'));
  assert.equal(testApp.currentView, 'worlds');
});

await check('3.2 Rapid Back Button Spamming', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  testApp.launchLevel('01');
  assert.equal(testApp.currentView, 'game');

  const btnBack = mockDocument.getElementById('btnHeaderBack');
  assert.ok(btnBack, 'btnHeaderBack exists');

  for (let i = 0; i < 50; i++) {
    btnBack.click();
  }

  assert.equal(testApp.currentView, 'worlds');
  const viewWorlds = mockDocument.getElementById('viewWorlds');
  assert.equal(viewWorlds.style.display, 'flex');
});

await check('3.3 Victory Idempotency Guard (50 rapid victory calls for same level)', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  const level = LEVELS.find(l => l.id === '01');
  assert.ok(level, 'Level 01 not found');

  for (let i = 0; i < 50; i++) {
    testApp.handleVictory(level);
  }

  assert.equal(testApp.completedLevels['01'], 3);
  assert.equal(testApp.getTotalStars(), 3);
  assert.equal(testApp.getCompletedLevelsCount(), 1);

  testApp.closeVictory();
  assert.equal(testApp.isVictoryProcessing, false);
});

await check('3.4 Confetti Particle System Rapid Start/Stop Stress', () => {
  const canvas = new MockElement('canvas');
  const confetti = new ConfettiEffect(canvas);

  for (let i = 0; i < 100; i++) {
    confetti.start(3000);
    confetti.stop();
  }

  assert.equal(confetti.active, false);
  assert.equal(confetti.animId, null);
});

await check('3.5 Modal Overlap & Interleaving (Victory + Parental Gate + Cert)', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  const modalVictory = mockDocument.getElementById('modalVictory');
  const modalParent = mockDocument.getElementById('modalParent');
  const modalCert = mockDocument.getElementById('modalCertificate');

  testApp.handleVictory(LEVELS[0]);
  assert.equal(modalVictory.style.display, 'flex');

  testApp.openParentalGateModal();
  assert.equal(modalParent.style.display, 'flex');

  testApp.openCertificateModal();
  assert.equal(modalCert.style.display, 'flex');

  mockDocument.getElementById('btnCloseCert').click();
  assert.equal(modalCert.style.display, 'none');

  mockDocument.getElementById('btnCancelParentGate').click();
  assert.equal(modalParent.style.display, 'none');

  testApp.closeVictory();
  assert.equal(modalVictory.style.display, 'none');
});

// ============================================================================
// SUITE 4: END-TO-END TODDLER & PARENT WORKFLOWS
// ============================================================================
console.log('\n--- [SUITE 4] END-TO-END TODDLER & PARENT WORKFLOWS ---');

await check('4.1 Multi-World Toddler Progression (1 Level from Each of 4 Worlds)', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  // World 1: Hewan - Level 01
  testApp.launchLevel('01');
  testApp.handleVictory(LEVELS.find(l => l.id === '01'));
  assert.equal(testApp.completedLevels['01'], 3);
  testApp.closeVictory();

  // World 2: Angka - Level 39 (labirin)
  testApp.launchLevel('39');
  testApp.handleVictory(LEVELS.find(l => l.id === '39'));
  assert.equal(testApp.completedLevels['39'], 3);
  testApp.closeVictory();

  // World 3: Spidey - Level 12 (labirin)
  testApp.launchLevel('12');
  testApp.handleVictory(LEVELS.find(l => l.id === '12'));
  assert.equal(testApp.completedLevels['12'], 3);
  testApp.closeVictory();

  // World 4: Koding - Level 58 (panah)
  testApp.launchLevel('58');
  testApp.handleVictory(LEVELS.find(l => l.id === '58'));
  assert.equal(testApp.completedLevels['58'], 3);
  testApp.closeVictory();

  assert.equal(testApp.getCompletedLevelsCount(), 4);
  assert.equal(testApp.getTotalStars(), 12);
  assert.equal(mockLocalStorage.getItem('spidey_stars'), '12');
});

await check('4.2 Complete Parent Journey: Math Gate, Personalization & Certificate', () => {
  setupFreshDOM();
  const testApp = new AppController();
  testApp.init();

  testApp.completedLevels['01'] = 3;
  testApp.completedLevels['58'] = 3;
  testApp.saveProgress();

  testApp.openParentalGateModal();
  const mathChoices = mockDocument.getElementById('parentMathChoices');
  const correctChoiceBtn = mathChoices.querySelector(`button[data-val="${testApp.currentMathAnswer}"]`);
  assert.ok(correctChoiceBtn, 'Found button matching math challenge answer');

  correctChoiceBtn.click();
  const dashSection = mockDocument.getElementById('parentDashboardSection');
  assert.equal(dashSection.style.display, 'flex', 'Parent dashboard unlocked');

  const nameInput = mockDocument.getElementById('inputChildName');
  nameInput.value = 'Arka Spidey Juara';
  const saveNameBtn = mockDocument.getElementById('btnSaveChildName');
  saveNameBtn.click();

  assert.equal(testApp.childName, 'Arka Spidey Juara');
  assert.equal(mockLocalStorage.getItem('spidey_child_name'), 'Arka Spidey Juara');

  mockDocument.getElementById('btnCloseParentDash').click();

  testApp.openCertificateModal();
  const certName = mockDocument.getElementById('certChildName');
  const certStars = mockDocument.getElementById('certTotalStars');
  const certLevels = mockDocument.getElementById('certCompletedLevels');

  assert.equal(certName.textContent, 'Arka Spidey Juara');
  assert.equal(certStars.textContent, '6');
  assert.equal(certLevels.textContent, '2');

  testApp.resetProgress();
  assert.equal(testApp.getTotalStars(), 0);
  assert.equal(testApp.getCompletedLevelsCount(), 0);
  assert.equal(mockLocalStorage.getItem('spidey_stars'), null);
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n============================================================');
console.log('📊 CHALLENGER M5-1 EXECUTION SUMMARY');
console.log('============================================================');
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed:       ${passedChecks}`);
console.log(`Failed:       ${failures.length}`);
console.log('============================================================');

if (failures.length > 0) {
  console.error('\n❌ FAILURES:');
  failures.forEach((f, idx) => {
    console.error(`  ${idx + 1}. ${f.title}`);
    console.error(`     Error: ${f.error.message}\n`);
  });
  process.exit(1);
} else {
  console.log('\n✔ ALL ADVERSARIAL STRESS VERIFICATIONS PASSED CLEANLY (Exit 0)!');
  process.exit(0);
}
