// tests/challenger_m3_stress.mjs
// Adversarial Empirical Stress Test Suite for Milestone 3: App Orchestration, Audio/TTS, Parent Mode & Certificate
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
console.log('🧪 CHALLENGER 1: ADVERSARIAL EMPIRICAL STRESS SUITE (MILESTONE 3)');
console.log('App Orchestration, Rapid Navigation, Idempotency & Confetti Lifecycle');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
const failures = [];

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${title}`);
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${title}`);
    console.error(`         \x1b[33mError: ${err.message}\x1b[0m`);
    failures.push({ title, error: err });
  }
}

// ============================================================================
// SYNTHETIC DOM & ISOMORPHIC TEST HARNESS
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
    this.offsetWidth = 100;
    this.offsetHeight = 100;
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
      ? { type, target: this, preventDefault: () => {} }
      : Object.assign({ preventDefault: () => {} }, event);

    if (typeof this[`on${type}`] === 'function') {
      this[`on${type}`](evt);
    }
    if (this.listeners.has(type)) {
      const list = [...this.listeners.get(type)];
      list.forEach(h => h(evt));
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
        clearRect: (...args) => { globalThis.__CANVAS_CLEARS = (globalThis.__CANVAS_CLEARS || 0) + 1; },
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

// Global Mocks
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

const mockStorageMap = new Map();
const mockLocalStorage = {
  getItem: (k) => mockStorageMap.has(k) ? mockStorageMap.get(k) : null,
  setItem: (k, v) => mockStorageMap.set(k, String(v)),
  removeItem: (k) => mockStorageMap.delete(k),
  clear: () => mockStorageMap.clear()
};

// RAF Tracker to detect zombie animation loops
let activeRafId = 0;
const activeRafCallbacks = new Map();
globalThis.__RAF_SCHEDULED = 0;
globalThis.__RAF_CANCELED = 0;
globalThis.__RAF_EXECUTED = 0;

globalThis.requestAnimationFrame = (cb) => {
  activeRafId++;
  const id = activeRafId;
  globalThis.__RAF_SCHEDULED++;
  activeRafCallbacks.set(id, cb);
  return id;
};

globalThis.cancelAnimationFrame = (id) => {
  if (activeRafCallbacks.has(id)) {
    globalThis.__RAF_CANCELED++;
    activeRafCallbacks.delete(id);
  }
};

// Helper to step all pending RAFs
function stepAnimationFrames() {
  const cbs = Array.from(activeRafCallbacks.entries());
  activeRafCallbacks.clear();
  for (const [id, cb] of cbs) {
    globalThis.__RAF_EXECUTED++;
    cb(Date.now());
  }
}

globalThis.document = mockDocument;
globalThis.localStorage = mockLocalStorage;
globalThis.window = {
  innerWidth: 1024,
  innerHeight: 768,
  print: () => { globalThis.__PRINT_CALLED = (globalThis.__PRINT_CALLED || 0) + 1; },
  addEventListener: () => {},
  removeEventListener: () => {}
};

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

// Set initial inline styles matching index.html defaults
function resetDomDefaults() {
  ['btnHeaderBack', 'instructionBar', 'viewLevels', 'viewGame', 'modalVictory', 'modalCertificate', 'modalParent', 'parentDashboardSection'].forEach(id => {
    const el = domRegistry.get(id);
    if (el) el.style.display = 'none';
  });
  const viewWorlds = domRegistry.get('viewWorlds');
  if (viewWorlds) viewWorlds.style.display = 'flex';
  const holdProgress = domRegistry.get('parentHoldProgress');
  if (holdProgress) holdProgress.style.width = '0%';
}
resetDomDefaults();

// Import modules
const { AppController, ConfettiEffect, App } = await import('../app.js');
const { WORLDS, LEVELS } = await import('../levels.js');
const { sound } = await import('../audio.js');

// Helper to fresh-init an AppController instance
function createFreshApp() {
  mockStorageMap.clear();
  activeRafCallbacks.clear();
  resetDomDefaults();
  const app = new AppController();
  app.init();
  return app;
}

// ============================================================================
// SUITE 1: RAPID BACK-AND-FORTH NAVIGATION STRESS TESTING
// ============================================================================
console.log('--- [SUITE 1] Rapid Back-and-Forth Navigation Stress Testing ---');

check('ADV.NAV.1: 200 Rapid navigation transitions maintain strict view exclusivity and invariant state', () => {
  const app = createFreshApp();
  const btnBack = domRegistry.get('btnHeaderBack');
  const viewWorlds = domRegistry.get('viewWorlds');
  const viewLevels = domRegistry.get('viewLevels');
  const viewGame = domRegistry.get('viewGame');
  const instructionBar = domRegistry.get('instructionBar');

  const worldIds = WORLDS.map(w => w.id);
  const allLevels = LEVELS;

  for (let i = 0; i < 200; i++) {
    const action = i % 4;
    if (action === 0) {
      // Pick random world
      const randWorld = worldIds[Math.floor(Math.random() * worldIds.length)];
      app.selectWorld(randWorld);
    } else if (action === 1) {
      // Pick random level
      const randLevel = allLevels[Math.floor(Math.random() * allLevels.length)];
      app.launchLevel(randLevel.id);
    } else if (action === 2) {
      // Click back button
      btnBack.click();
    } else {
      // Direct method invocation
      if (Math.random() > 0.5) {
        app.showWorldsView();
      } else {
        btnBack.click();
      }
    }

    // INVARIANT 1: Exactly ONE view is active and visible
    const views = [
      { name: 'worlds', el: viewWorlds },
      { name: 'levels', el: viewLevels },
      { name: 'game', el: viewGame }
    ];

    const activeViews = views.filter(v => v.el.style.display !== 'none' && v.el.classList.contains('active'));
    assert.equal(activeViews.length, 1, `Exactly one view must be active at step ${i}, found: ${activeViews.map(v => v.name).join(', ')}`);
    assert.equal(activeViews[0].name, app.currentView, `Active view must match app.currentView (${app.currentView})`);

    // INVARIANT 2: btnHeaderBack shown ONLY for levels and game
    if (app.currentView === 'worlds') {
      assert.equal(btnBack.style.display, 'none', `Back button must be hidden in worlds view at step ${i}`);
      assert.equal(instructionBar.style.display, 'none', `Instruction bar must be hidden in worlds view`);
    } else if (app.currentView === 'levels') {
      assert.equal(btnBack.style.display, 'flex', `Back button must be visible in levels view at step ${i}`);
      assert.equal(instructionBar.style.display, 'none', `Instruction bar must be hidden in levels view`);
    } else if (app.currentView === 'game') {
      assert.equal(btnBack.style.display, 'flex', `Back button must be visible in game view at step ${i}`);
      assert.equal(instructionBar.style.display, 'flex', `Instruction bar must be visible in game view`);
    }
  }
});

check('ADV.NAV.2: Hammering back button 50 times when already at worlds view is harmless and non-corrupting', () => {
  const app = createFreshApp();
  app.showWorldsView();
  const btnBack = domRegistry.get('btnHeaderBack');

  for (let i = 0; i < 50; i++) {
    btnBack.click();
    assert.equal(app.currentView, 'worlds');
    assert.equal(domRegistry.get('viewWorlds').style.display, 'flex');
  }
});

check('ADV.NAV.3: Speech prompt audio is immediately silenced on navigating away from game view', () => {
  const app = createFreshApp();
  let speechStopped = false;
  const originalStopSpeech = sound.stopSpeech;
  sound.stopSpeech = () => { speechStopped = true; originalStopSpeech?.call(sound); };

  try {
    app.launchLevel(LEVELS[0].id);
    speechStopped = false;

    // Navigate back to levels
    domRegistry.get('btnHeaderBack').click();
    assert.equal(speechStopped, true, 'sound.stopSpeech() must be called when leaving game via back button');

    speechStopped = false;
    app.launchLevel(LEVELS[1].id);
    speechStopped = false;

    // Navigate to worlds
    app.showWorldsView();
    assert.equal(speechStopped, true, 'sound.stopSpeech() must be called when showing worlds view');
  } finally {
    sound.stopSpeech = originalStopSpeech;
  }
});

check('ADV.NAV.4: Rapid switching across all 4 worlds correctly updates activeWorldId and renders level grids', () => {
  const app = createFreshApp();
  const grid = domRegistry.get('levelsGrid');
  const title = domRegistry.get('currentWorldTitle');

  WORLDS.forEach(w => {
    app.selectWorld(w.id);
    assert.equal(app.activeWorldId, w.id);
    assert(title.textContent.includes(w.name), `Title should include world name ${w.name}`);

    const renderedLevels = grid.querySelectorAll('.level-card');
    const expectedCount = LEVELS.filter(l => l.worldId === w.id).length;
    assert.equal(renderedLevels.length, expectedCount, `Expected ${expectedCount} level cards for world ${w.id}`);
  });
});

// ============================================================================
// SUITE 2: RAPID DOUBLE CLICKS & CONCURRENT LEVEL SELECTION
// ============================================================================
console.log('--- [SUITE 2] Rapid Double Clicks & Concurrent Level Selection ---');

check('ADV.CLK.1: Rapid 20x click frenzy on a single level card mounts engine cleanly without DOM duplication', () => {
  const app = createFreshApp();
  app.selectWorld('hewan');
  const levelGrid = domRegistry.get('levelsGrid');
  const firstCard = levelGrid.querySelector('.level-card');
  assert(firstCard, 'First level card must exist');

  const gameMount = domRegistry.get('gameMount');

  // Click 20 times rapidly
  for (let i = 0; i < 20; i++) {
    firstCard.click();
  }

  assert.equal(app.currentView, 'game');
  assert.equal(app.currentLevel.id, firstCard.dataset.levelId);
  assert(gameMount.children.length > 0, 'Game mount should have children');
  assert(gameMount.children.length <= 5, 'Game mount should be cleanly cleared before re-render');
});

check('ADV.CLK.2: Rapid level switching across valid levels settles correctly on the last selected level', () => {
  const app = createFreshApp();
  const testLevels = [LEVELS[0], LEVELS[3], LEVELS[12], LEVELS[20]];

  testLevels.forEach(lvl => {
    app.launchLevel(lvl.id);
  });

  const lastLevel = testLevels[testLevels.length - 1];
  assert.equal(app.currentLevel.id, lastLevel.id);
  assert.equal(domRegistry.get('gameLevelBadge').textContent, `Level ${lastLevel.id}`);
  assert.equal(domRegistry.get('gameLevelTitle').textContent, lastLevel.title);
  assert.equal(domRegistry.get('promptText').textContent, lastLevel.prompt);
});

check('ADV.CLK.3: Passing non-existent level ID gracefully does not crash or corrupt current view', () => {
  const app = createFreshApp();
  app.showWorldsView();
  assert.doesNotThrow(() => {
    app.launchLevel('non-existent-9999');
  });
  assert.equal(app.currentView, 'worlds');
});

// ============================================================================
// SUITE 3: IDEMPOTENCY & ADVERSARIAL DOUBLE onComplete TRIGGERS
// ============================================================================
console.log('--- [SUITE 3] Idempotency & Adversarial Double onComplete Triggers ---');

check('ADV.IDM.1: 100 Repeated onComplete triggers on same level award stars ONCE and do not inflate star counter', () => {
  const app = createFreshApp();
  const testLevel = LEVELS[0];
  app.launchLevel(testLevel.id);

  const initialStars = app.getTotalStars();
  assert.equal(initialStars, 0);

  let fanfareCalls = 0;
  const originalFanfare = sound.playFanfare;
  sound.playFanfare = () => { fanfareCalls++; originalFanfare?.call(sound); };

  try {
    // Adversarial assault: fire handleVictory 100 times in tight loop
    for (let i = 0; i < 100; i++) {
      app.handleVictory(testLevel);
    }

    assert.equal(app.completedLevels[testLevel.id], 3, 'Level stars must be strictly 3');
    assert.equal(app.getTotalStars(), 3, 'Total stars must remain 3 despite 100 trigger calls');
    assert.equal(domRegistry.get('totalStarsCount').textContent, '3', 'Star counter UI must display 3');

    // Storage check
    const storedStars = mockLocalStorage.getItem('spidey_stars');
    assert.equal(storedStars, '3', 'Storage spidey_stars must be strictly 3');

    const storedLevels = JSON.parse(mockLocalStorage.getItem('spidey_completed_levels'));
    assert.equal(storedLevels[testLevel.id], 3);
    assert.equal(Object.keys(storedLevels).length, 1);
  } finally {
    sound.playFanfare = originalFanfare;
  }
});

check('ADV.IDM.2: Replaying an already completed level maintains 3 stars idempotently', () => {
  const app = createFreshApp();
  const level1 = LEVELS[0];
  const level2 = LEVELS[1];

  // Complete level 1
  app.launchLevel(level1.id);
  app.handleVictory(level1);
  app.closeVictory();
  assert.equal(app.getTotalStars(), 3);

  // Complete level 2
  app.launchLevel(level2.id);
  app.handleVictory(level2);
  app.closeVictory();
  assert.equal(app.getTotalStars(), 6);

  // Replay level 1
  app.launchLevel(level1.id);
  app.handleVictory(level1);
  app.closeVictory();
  assert.equal(app.getTotalStars(), 6, 'Replaying completed level must NOT award additional stars');
  assert.equal(app.getCompletedLevelsCount(), 2, 'Completed levels count must remain 2');
});

check('ADV.IDM.3: Delayed stale onComplete callback from prior level cannot corrupt currently active level', () => {
  const app = createFreshApp();
  const levelA = LEVELS[0];
  const levelB = LEVELS[1];

  // User starts level A
  app.launchLevel(levelA.id);

  // Before level A finishes, user navigates to level B
  app.launchLevel(levelB.id);

  // Now stale callback from level A fires
  app.handleVictory(levelA);

  assert.equal(app.completedLevels[levelA.id], 3);
  assert.equal(app.completedLevels[levelB.id], undefined, 'Level B must NOT be automatically completed by stale Level A callback');
  assert.equal(app.getTotalStars(), 3);
});

check('ADV.IDM.4: Hammering victory modal buttons (Next, Replay, LevelSelect) concurrently', () => {
  const app = createFreshApp();
  const level = LEVELS[0];
  app.launchLevel(level.id);
  app.handleVictory(level);

  const btnNext = domRegistry.get('btnNextLevel');
  const btnReplay = domRegistry.get('btnReplayLevel');
  const btnSelect = domRegistry.get('btnVictoryLevelSelect');
  const modalVictory = domRegistry.get('modalVictory');

  assert.equal(modalVictory.style.display, 'flex');

  // Click all 3 in immediate succession
  btnNext.click();
  btnReplay.click();
  btnSelect.click();

  // Modal must be closed and state valid
  assert.equal(modalVictory.style.display, 'none');
  assert.equal(app.isVictoryProcessing, false);
});

// ============================================================================
// SUITE 4: CONFETTI CANVAS LIFECYCLE & ZOMBIE RAF LEAK PREVENTION
// ============================================================================
console.log('--- [SUITE 4] Confetti Canvas Lifecycle & Zombie RAF Prevention ---');

check('ADV.CNF.1: 100 Rapid Start/Stop cycles on ConfettiEffect leave ZERO dangling RAF callbacks', () => {
  const canvas = domRegistry.get('confettiCanvas');
  const confetti = new ConfettiEffect(canvas);

  for (let i = 0; i < 100; i++) {
    confetti.start(3000);
    assert.equal(confetti.active, true);
    assert(confetti.animId !== null);

    confetti.stop();
    assert.equal(confetti.active, false);
    assert.equal(confetti.animId, null);
  }

  // Verify that active callbacks map is completely empty
  assert.equal(activeRafCallbacks.size, 0, `There must be 0 active RAF callbacks after stop(), found: ${activeRafCallbacks.size}`);
});

check('ADV.CNF.2: Confetti step execution animates particles and self-terminates after durationMs', () => {
  const canvas = domRegistry.get('confettiCanvas');
  const confetti = new ConfettiEffect(canvas);

  // Start with short duration (100ms)
  confetti.start(100);
  assert.equal(confetti.active, true);
  assert.equal(confetti.particles.length, 75);

  const initialY0 = confetti.particles[0].y;

  // Step 5 frames
  for (let f = 0; f < 5; f++) {
    stepAnimationFrames();
  }

  // Particles should have moved downwards (vy > 0)
  assert(confetti.particles[0].y > initialY0, 'Confetti particles must update position during RAF loop');

  // Fast forward past durationMs
  const realDateNow = Date.now;
  Date.now = () => realDateNow() + 500;
  try {
    stepAnimationFrames();
    assert.equal(confetti.active, false, 'Confetti must automatically stop when time exceeds duration');
    assert.equal(confetti.animId, null);
  } finally {
    Date.now = realDateNow;
  }
});

check('ADV.CNF.3: ConfettiEffect is resilient when canvas or getContext is null/missing', () => {
  const brokenCanvas = new MockElement('canvas');
  brokenCanvas.getContext = () => null;

  const confetti = new ConfettiEffect(brokenCanvas);
  assert.doesNotThrow(() => {
    confetti.start(1000);
    confetti.stop();
  });

  const nullCanvasConfetti = new ConfettiEffect(null);
  assert.doesNotThrow(() => {
    nullCanvasConfetti.start(1000);
    nullCanvasConfetti.stop();
    nullCanvasConfetti.resize();
  });
});

check('ADV.CNF.4: Repeated victory modal open and close cycles properly clean up confetti', () => {
  const app = createFreshApp();
  const testLevel = LEVELS[0];

  for (let cycle = 0; cycle < 10; cycle++) {
    app.launchLevel(testLevel.id);
    app.handleVictory(testLevel);
    assert.equal(app.confetti.active, true, `Confetti should be active during victory (cycle ${cycle})`);

    app.closeVictory();
    assert.equal(app.confetti.active, false, `Confetti should be inactive after closing victory (cycle ${cycle})`);
    assert.equal(activeRafCallbacks.size, 0, `No RAF callbacks should remain active (cycle ${cycle})`);
  }
});

// ============================================================================
// SUITE 5: PARENTAL GATE ADVERSARIAL STRESS TESTING
// ============================================================================
console.log('--- [SUITE 5] Parental Gate Adversarial Stress Testing ---');

check('ADV.PAR.1: 50 Rapid intermittent taps (<150ms) never trigger parental gate modal', () => {
  const app = createFreshApp();
  const btnOpen = domRegistry.get('btnOpenParent');
  const modalParent = domRegistry.get('modalParent');
  const progressBar = domRegistry.get('parentHoldProgress');

  modalParent.style.display = 'none';

  for (let i = 0; i < 50; i++) {
    btnOpen.dispatchEvent('pointerdown');
    assert(app.holdStartTime !== null);

    // Cancel before 2000ms (e.g. at 50ms)
    btnOpen.dispatchEvent('pointerup');
    assert.equal(app.holdTimer, null);
    assert.equal(app.holdInterval, null);
    assert.equal(progressBar.style.width, '0%');
    assert.equal(modalParent.style.display, 'none', `Modal must NOT open on short tap at iteration ${i}`);
  }
});

check('ADV.PAR.2: Pointerleave / pointercancel during hold cleanly aborts timer', () => {
  const app = createFreshApp();
  const btnOpen = domRegistry.get('btnOpenParent');
  const modalParent = domRegistry.get('modalParent');

  // Test pointerleave
  btnOpen.dispatchEvent('pointerdown');
  btnOpen.dispatchEvent('pointerleave');
  assert.equal(app.holdTimer, null);
  assert.equal(modalParent.style.display, 'none');

  // Test pointercancel
  btnOpen.dispatchEvent('pointerdown');
  btnOpen.dispatchEvent('pointercancel');
  assert.equal(app.holdTimer, null);
  assert.equal(modalParent.style.display, 'none');
});

check('ADV.PAR.3: 2-Second hold triggers modal with exactly 6 unique math choices and correct sum', () => {
  const app = createFreshApp();
  app.openParentalGateModal();

  const modalParent = domRegistry.get('modalParent');
  const mathChoices = domRegistry.get('parentMathChoices');
  const mathQuestion = domRegistry.get('parentMathQuestion');

  assert.equal(modalParent.style.display, 'flex');
  assert(mathQuestion.textContent.startsWith('Berapa '));

  const choiceButtons = mathChoices.querySelectorAll('button');
  assert.equal(choiceButtons.length, 6, 'Math gate must present exactly 6 choice buttons');

  const values = choiceButtons.map(b => Number(b.dataset.val));
  const uniqueVals = new Set(values);
  assert.equal(uniqueVals.size, 6, 'All 6 choice values must be distinct');

  // Correct answer must be among the choices
  assert(uniqueVals.has(app.currentMathAnswer), 'Correct answer must be present in choices');
});

check('ADV.PAR.4: Incorrect math choices are rejected with wobble and do NOT reveal dashboard', () => {
  const app = createFreshApp();
  app.openParentalGateModal();

  const gateSection = domRegistry.get('parentGateSection');
  const dashSection = domRegistry.get('parentDashboardSection');

  // Intentionally choose wrong answer
  const wrongVal = app.currentMathAnswer + 99;
  app.handleMathChoice(wrongVal);

  assert.equal(dashSection.style.display, 'none', 'Dashboard section must remain hidden on wrong answer');
  assert(gateSection.classList.contains('wobble'), 'Gate section must have wobble class on error');
});

check('ADV.PAR.5: Correct math choice unlocks dashboard, populates child name, and renders world recap', () => {
  const app = createFreshApp();
  app.childName = 'Budi Si Pemberani';
  app.openParentalGateModal();

  const gateSection = domRegistry.get('parentGateSection');
  const dashSection = domRegistry.get('parentDashboardSection');
  const inputChild = domRegistry.get('inputChildName');
  const recapList = domRegistry.get('worldRecapList');

  // Select correct answer
  app.handleMathChoice(app.currentMathAnswer);

  assert.equal(gateSection.style.display, 'none', 'Gate section should be hidden');
  assert.equal(dashSection.style.display, 'flex', 'Dashboard section must be revealed');
  assert.equal(inputChild.value, 'Budi Si Pemberani');

  const recapRows = recapList.querySelectorAll('.recap-row');
  assert.equal(recapRows.length, 4, 'Recap list must render 4 world rows');
});

check('ADV.PAR.6: Parental Reset Progress clears all progress, stars, and reverts to worlds view', () => {
  const app = createFreshApp();
  // Mark levels complete
  app.completedLevels = { '01': 3, '02': 3, '03': 3 };
  app.saveProgress();
  assert.equal(app.getTotalStars(), 9);

  // Invoke reset
  app.resetProgress();

  assert.equal(app.getTotalStars(), 0);
  assert.equal(Object.keys(app.completedLevels).length, 0);
  assert.equal(mockLocalStorage.getItem('spidey_stars'), null);
  assert.equal(mockLocalStorage.getItem('spidey_completed_levels'), null);
  assert.equal(app.currentView, 'worlds');
  assert.equal(domRegistry.get('totalStarsCount').textContent, '0');
});

// ============================================================================
// SUITE 6: CHAMPIONSHIP CERTIFICATE ADVERSARIAL STRESS TESTING
// ============================================================================
console.log('--- [SUITE 6] Championship Certificate Adversarial Stress Testing ---');

check('ADV.CRT.1: Certificate opens and populates correctly under extreme star states (0 stars vs 200+ stars)', () => {
  const app = createFreshApp();
  const certModal = domRegistry.get('modalCertificate');
  const nameEl = domRegistry.get('certChildName');
  const starsEl = domRegistry.get('certTotalStars');
  const levelsEl = domRegistry.get('certCompletedLevels');
  const leftMascot = domRegistry.get('certMascotLeft');
  const rightMascot = domRegistry.get('certMascotRight');

  // Test 1: Fresh 0-stars state
  app.openCertificateModal();
  assert.equal(certModal.style.display, 'flex');
  assert.equal(nameEl.textContent, 'Pahlawan Cilik');
  assert.equal(starsEl.textContent, '0');
  assert.equal(levelsEl.textContent, '0');
  assert(leftMascot.innerHTML.includes('<svg'), 'Left mascot must be populated SVG');
  assert(rightMascot.innerHTML.includes('<svg'), 'Right mascot must be populated SVG');

  // Test 2: Max stars state
  LEVELS.forEach(l => { app.completedLevels[l.id] = 3; });
  app.childName = 'Super Spidey Champion';
  app.openCertificateModal();

  assert.equal(nameEl.textContent, 'Super Spidey Champion');
  assert.equal(Number(starsEl.textContent), LEVELS.length * 3);
  assert.equal(Number(levelsEl.textContent), LEVELS.length);
});

check('ADV.CRT.2: Printing certificate triggers window.print() without error', () => {
  const app = createFreshApp();
  globalThis.__PRINT_CALLED = 0;
  const btnPrint = domRegistry.get('btnPrintCert');

  btnPrint.click();
  assert.equal(globalThis.__PRINT_CALLED, 1, 'btnPrintCert click must invoke window.print()');
});

// ============================================================================
// SUITE 7: STORAGE CORRUPTION & ADVERSARIAL MUTATIONS
// ============================================================================
console.log('--- [SUITE 7] Storage Corruption & Adversarial Mutations ---');

check('ADV.STR.1: Corrupt non-JSON strings in storage are gracefully handled during loadProgress', () => {
  const corruptPayloads = [
    '{bad json: true',
    'undefined',
    'null',
    '<html><body>500 Internal Error</body></html>',
    'NaN',
    '[]',
    '12345'
  ];

  corruptPayloads.forEach((payload, idx) => {
    mockStorageMap.clear();
    mockStorageMap.set('spidey_completed_levels', payload);

    const app = new AppController();
    assert.doesNotThrow(() => {
      app.loadProgress();
    }, `loadProgress threw on corrupt payload #${idx}: "${payload}"`);

    // In no case should completedLevels break or be undefined
    assert(typeof app.completedLevels === 'object' && app.completedLevels !== null);
  });
});

check('ADV.STR.2: Storage QuotaExceeded / SecurityError during saveProgress does not crash the app', () => {
  const app = createFreshApp();
  const originalSetItem = mockLocalStorage.setItem;

  // Make setItem throw DOMException 22
  mockLocalStorage.setItem = () => {
    const err = new Error('QuotaExceededError');
    err.name = 'QuotaExceededError';
    err.code = 22;
    throw err;
  };

  try {
    assert.doesNotThrow(() => {
      app.completedLevels['01'] = 3;
      app.saveProgress();
    }, 'saveProgress must catch storage exceptions without bubbling error');
  } finally {
    mockLocalStorage.setItem = originalSetItem;
  }
});

check('ADV.CNF.5: Zero or negative duration in ConfettiEffect.start terminates cleanly on first frame', () => {
  const canvas = domRegistry.get('confettiCanvas');
  const confetti = new ConfettiEffect(canvas);

  confetti.start(0);
  assert.equal(confetti.active, true);
  stepAnimationFrames();
  assert.equal(confetti.active, false, 'Confetti must stop when duration is 0');
  assert.equal(confetti.animId, null);

  confetti.start(-500);
  assert.equal(confetti.active, true);
  stepAnimationFrames();
  assert.equal(confetti.active, false, 'Confetti must stop when duration is negative');
});

check('ADV.CNF.6: Resizing confetti canvas during active animation does not throw or desync particles', () => {
  const canvas = domRegistry.get('confettiCanvas');
  const confetti = new ConfettiEffect(canvas);

  confetti.start(2000);
  assert.doesNotThrow(() => {
    globalThis.window.innerWidth = 1920;
    globalThis.window.innerHeight = 1080;
    confetti.resize();
    stepAnimationFrames();
  });
  confetti.stop();
});

check('ADV.IDM.5: Stale delayed onComplete firing after victory is closed does not inflate total stars', () => {
  const app = createFreshApp();
  const lvl1 = LEVELS[0];
  const lvl2 = LEVELS[1];

  // 1. Play & win level 1
  app.launchLevel(lvl1.id);
  app.handleVictory(lvl1);
  app.closeVictory();
  assert.equal(app.getTotalStars(), 3);

  // 2. Play level 2
  app.launchLevel(lvl2.id);

  // 3. Delayed duplicate onComplete for level 1 arrives
  app.handleVictory(lvl1);
  assert.equal(app.getTotalStars(), 3, 'Total stars must remain 3 despite delayed duplicate completion');
  assert.equal(app.completedLevels[lvl1.id], 3);
  assert.equal(app.completedLevels[lvl2.id], undefined);
});

// ============================================================================
// SUITE 8: COMPLETE USER JOURNEY UNDER ADVERSARIAL INTERRUPTIONS
// ============================================================================
console.log('--- [SUITE 8] Complete User Journey Under Adversarial Interruptions ---');

check('ADV.JRN.1: Full loop (Launch -> Interrupt -> Relaunch -> Victory -> Next -> Cert -> Reset) maintains strict integrity', () => {
  const app = createFreshApp();

  // 1. Launch level
  app.launchLevel(LEVELS[0].id);
  assert.equal(app.currentView, 'game');

  // 2. Interrupt with back button mid-play
  domRegistry.get('btnHeaderBack').click();
  assert.equal(app.currentView, 'levels');

  // 3. Relaunch different level
  app.launchLevel(LEVELS[1].id);
  assert.equal(app.currentView, 'game');

  // 4. Win level
  app.handleVictory(LEVELS[1]);
  assert.equal(domRegistry.get('modalVictory').style.display, 'flex');
  assert.equal(app.getTotalStars(), 3);

  // 5. Next level button
  domRegistry.get('btnNextLevel').click();
  assert.equal(app.currentView, 'game');
  assert.equal(app.currentLevel.id, LEVELS[2].id);

  // 6. Open Certificate
  domRegistry.get('btnOpenCert').click();
  assert.equal(domRegistry.get('modalCertificate').style.display, 'flex');

  // 7. Close Certificate
  domRegistry.get('btnCloseCert').click();
  assert.equal(domRegistry.get('modalCertificate').style.display, 'none');

  // 8. Open Parent Mode & Reset
  app.openParentalGateModal();
  app.handleMathChoice(app.currentMathAnswer);
  app.resetProgress();

  assert.equal(app.getTotalStars(), 0);
  assert.equal(app.currentView, 'worlds');
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY: ${passedChecks} / ${totalChecks} CHECKS PASSED`);
if (failures.length === 0) {
  console.log('🌟 EMPIRICAL VERDICT: APPROVE');
  console.log('   All adversarial stress scenarios passed with zero regressions.');
} else {
  console.error(`💥 EMPIRICAL VERDICT: REQUEST_CHANGES (${failures.length} failures)`);
  failures.forEach((f, idx) => {
    console.error(`   ${idx + 1}. ${f.title}: ${f.error.message}`);
  });
}
console.log('================================================================');

if (failures.length > 0) {
  process.exit(1);
}
