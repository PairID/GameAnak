// tests/verify_m3.mjs - Comprehensive Verification Suite for Milestone 3
// Tests AppController, State Machine, Audio/TTS, Victory Flow, Persistence,
// Parental Gate, Championship Certificate, and Confetti Engine.

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('============================================================');
console.log('🕷️ RUNNING MILESTONE 3 VERIFICATION SUITE');
console.log('App Orchestration, Audio/TTS, Parental Gate & Certificate');
console.log('============================================================\n');

// ============================================================================
// LIGHTWEIGHT SYNTHETIC DOM ENVIRONMENT FOR ISOMORPHIC TESTING
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

const mockStorageMap = new Map();
const mockLocalStorage = {
  getItem: (k) => mockStorageMap.has(k) ? mockStorageMap.get(k) : null,
  setItem: (k, v) => mockStorageMap.set(k, String(v)),
  removeItem: (k) => mockStorageMap.delete(k),
  clear: () => mockStorageMap.clear()
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

// Set initial inline styles matching index.html
['btnHeaderBack', 'instructionBar', 'viewLevels', 'viewGame', 'modalVictory', 'modalCertificate', 'modalParent', 'parentDashboardSection'].forEach(id => {
  const el = domRegistry.get(id);
  if (el) el.style.display = 'none';
});
domRegistry.get('viewWorlds').style.display = 'flex';

// Import code under test
const { AppController, ConfettiEffect, App } = await import('../app.js');
const { sound } = await import('../audio.js');
const { WORLDS, LEVELS } = await import('../levels.js');

let passCount = 0;
let totalCount = 0;

function test(name, fn) {
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

async function asyncTest(name, fn) {
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
// TEST SUITE EXECUTION
// ============================================================================

console.log('--- 1. Module Exports & Subsystem Availability ---');
test('M3.EXP.1 AppController class and App singleton exist', () => {
  assert(AppController, 'AppController class must be exported');
  assert(App, 'App singleton instance must be exported');
  assert(App instanceof AppController, 'App must be instance of AppController');
  assert(ConfettiEffect, 'ConfettiEffect class must be exported');
});

test('M3.EXP.2 Core controller methods exist', () => {
  const methods = [
    'init', 'showWorldsView', 'showLevelsView', 'launchLevel', 'handleVictory',
    'closeVictory', 'openParentalGateModal', 'handleMathChoice', 'openCertificateModal',
    'resetProgress', 'saveProgress', 'loadProgress'
  ];
  methods.forEach(m => {
    assert.strictEqual(typeof App[m], 'function', `Method ${m} must exist on App`);
  });
});

console.log('\n--- 2. Resilient Storage Persistence & Fallbacks ---');
test('M3.STR.1 Storage Save & Load Roundtrip', () => {
  const app = new AppController();
  mockLocalStorage.clear();

  app.childName = 'Aisyah';
  app.completedLevels = { '01': 3, '02': 3, '03': 3 };
  app.saveProgress();

  assert.strictEqual(mockLocalStorage.getItem('spidey_child_name'), 'Aisyah');
  assert.strictEqual(mockLocalStorage.getItem('spidey_stars'), '9');
  assert.strictEqual(app.getTotalStars(), 9);
  assert.strictEqual(app.getCompletedLevelsCount(), 3);

  const newApp = new AppController();
  newApp.loadProgress();
  assert.strictEqual(newApp.childName, 'Aisyah');
  assert.strictEqual(newApp.completedLevels['01'], 3);
  assert.strictEqual(newApp.getTotalStars(), 9);
});

test('M3.STR.2 Storage Corrupt JSON Graceful Recovery', () => {
  const app = new AppController();
  mockLocalStorage.setItem('spidey_completed_levels', '{invalid-json');

  assert.doesNotThrow(() => app.loadProgress(), 'Corrupt JSON should not throw');
  assert.deepStrictEqual(app.completedLevels, {}, 'Corrupt JSON must reset to empty object');
});

test('M3.STR.3 QuotaExceeded / Security Exception Resilience', () => {
  const app = new AppController();
  const originalSet = mockLocalStorage.setItem;
  // Simulate private browsing quota error
  mockLocalStorage.setItem = () => {
    throw new Error('QuotaExceededError: DOM Exception 22');
  };

  assert.doesNotThrow(() => {
    app.safeStorageSet('test_key', 'val');
  }, 'safeStorageSet must not throw on storage quota errors');

  mockLocalStorage.setItem = originalSet;
});

console.log('\n--- 3. State Machine & View Transitions ---');
test('M3.NAV.1 Initial App State (Worlds View Active, Back Hidden)', () => {
  mockLocalStorage.clear();
  App.init();

  assert.strictEqual(App.currentView, 'worlds');
  assert.strictEqual(domRegistry.get('viewWorlds').style.display, 'flex');
  assert.strictEqual(domRegistry.get('viewLevels').style.display, 'none');
  assert.strictEqual(domRegistry.get('viewGame').style.display, 'none');
  assert.strictEqual(domRegistry.get('btnHeaderBack').style.display, 'none');
  assert.strictEqual(domRegistry.get('instructionBar').style.display, 'none');
});

test('M3.NAV.2 4 World Cards Dynamically Rendered with Progress', () => {
  App.renderWorldsGrid();
  const grid = domRegistry.get('worldsGrid');
  assert.strictEqual(grid.children.length, WORLDS.length, 'Must render cards for all worlds');

  WORLDS.forEach((w, idx) => {
    const card = grid.children[idx];
    assert.strictEqual(card.dataset.worldId, w.id);
    assert(card.innerHTML.includes(w.name), `Card must show world name ${w.name}`);
    assert(card.innerHTML.includes(w.emoji), `Card must show world emoji ${w.emoji}`);
    assert(card.innerHTML.includes('Level'), 'Card must show level progress pill');
  });
});

test('M3.NAV.3 Transition to Levels View on World Click', () => {
  App.selectWorld('hewan');

  assert.strictEqual(App.currentView, 'levels');
  assert.strictEqual(App.activeWorldId, 'hewan');
  assert.strictEqual(domRegistry.get('viewWorlds').style.display, 'none');
  assert.strictEqual(domRegistry.get('viewLevels').style.display, 'flex');
  assert.strictEqual(domRegistry.get('viewGame').style.display, 'none');
  assert.strictEqual(domRegistry.get('btnHeaderBack').style.display, 'flex', 'Back button must be visible in levels view');

  const titleEl = domRegistry.get('currentWorldTitle');
  assert(titleEl.textContent.includes('Hutan Satwa Lucu'), 'World title must update');
});

test('M3.NAV.4 Back Button from Levels to Worlds', () => {
  const backBtn = domRegistry.get('btnHeaderBack');
  backBtn.click();

  assert.strictEqual(App.currentView, 'worlds', 'Clicking back must return to worlds view');
  assert.strictEqual(domRegistry.get('viewWorlds').style.display, 'flex');
  assert.strictEqual(domRegistry.get('btnHeaderBack').style.display, 'none', 'Back button hidden on worlds view');
});

console.log('\n--- 4. Active Game Mounting & Indonesian Narration ---');
test('M3.GAM.1 Launch Level Mounts Engine & Updates DOM', () => {
  App.showLevelsView('hewan');
  App.launchLevel('01');

  assert.strictEqual(App.currentView, 'game');
  assert.strictEqual(domRegistry.get('viewGame').style.display, 'flex');
  assert.strictEqual(domRegistry.get('instructionBar').style.display, 'flex', 'Instruction bar visible in game');
  assert.strictEqual(domRegistry.get('gameLevelBadge').textContent, 'Level 01');
  assert.strictEqual(domRegistry.get('gameLevelTitle').textContent, 'Bantu Hewan Makan');
  assert.strictEqual(domRegistry.get('promptText').textContent, 'Tarik garis dari hewan ke makanan kesukaannya!');

  const mount = domRegistry.get('gameMount');
  assert(mount.children.length > 0, 'Game mount must have engine rendered elements');
});

test('M3.GAM.2 Speaker Button Replays Speech Prompt', () => {
  let spokenPrompt = null;
  const originalSpeak = sound.speak;
  sound.speak = (text, onEnd) => {
    spokenPrompt = text;
    if (onEnd) onEnd();
  };

  const btnSpeak = domRegistry.get('btnSpeakPrompt');
  btnSpeak.click();

  assert.strictEqual(spokenPrompt, 'Tarik garis dari hewan ke makanan kesukaannya!', 'Speaker button must replay level prompt');
  sound.speak = originalSpeak;
});

test('M3.GAM.3 Back Button from Game to Levels', () => {
  const backBtn = domRegistry.get('btnHeaderBack');
  backBtn.click();

  assert.strictEqual(App.currentView, 'levels', 'Clicking back in game returns to levels view');
  assert.strictEqual(domRegistry.get('viewLevels').style.display, 'flex');
  assert.strictEqual(domRegistry.get('instructionBar').style.display, 'none');
});

console.log('\n--- 5. Victory Celebration, Stars & Idempotency ---');
test('M3.VIC.1 Victory Callback Awards Stars & Shows Modal', () => {
  const lvl = LEVELS[0];
  App.launchLevel(lvl.id);

  assert.strictEqual(App.completedLevels[lvl.id], undefined);
  App.handleVictory(lvl);

  assert.strictEqual(App.completedLevels[lvl.id], 3, 'Level victory awards 3 stars');
  assert.strictEqual(domRegistry.get('totalStarsCount').textContent, '3');
  assert.strictEqual(domRegistry.get('modalVictory').style.display, 'flex', 'Victory modal opens');

  const victoryMascot = domRegistry.get('victoryMascot');
  assert(victoryMascot.innerHTML.includes('<svg'), 'Victory mascot rendered');
});

test('M3.VIC.2 Idempotency Guard on Double Victory Triggers', () => {
  const lvl = LEVELS[0];
  const starCountBefore = App.getTotalStars();

  // Trigger again while isVictoryProcessing = true
  App.handleVictory(lvl);
  const starCountAfter = App.getTotalStars();

  assert.strictEqual(starCountBefore, starCountAfter, 'Duplicate victory call must be ignored safely');
  App.closeVictory();
  assert.strictEqual(domRegistry.get('modalVictory').style.display, 'none');
});

test('M3.VIC.3 Victory Action: Next Level', () => {
  const firstLevel = LEVELS.find(l => l.worldId === 'hewan');
  App.launchLevel(firstLevel.id);
  App.handleVictory(firstLevel);

  const btnNext = domRegistry.get('btnNextLevel');
  btnNext.click();

  assert.strictEqual(domRegistry.get('modalVictory').style.display, 'none');
  assert.strictEqual(App.currentView, 'game');
  assert.strictEqual(App.currentLevel.id, '02', 'Next button advances to level 02');
});

test('M3.VIC.4 Victory Action: Replay Level', () => {
  App.handleVictory(App.currentLevel);
  const btnReplay = domRegistry.get('btnReplayLevel');
  btnReplay.click();

  assert.strictEqual(domRegistry.get('modalVictory').style.display, 'none');
  assert.strictEqual(App.currentView, 'game');
  assert.strictEqual(App.currentLevel.id, '02', 'Replay reloads current level');
});

console.log('\n--- 6. Parental Gate (2-Second Hold + Math Challenge) ---');
await asyncTest('M3.PAR.1 Accidental Tap (<2s) Blocked', async () => {
  const btnParent = domRegistry.get('btnOpenParent');
  const modalParent = domRegistry.get('modalParent');

  // Short tap (100ms)
  btnParent.dispatchEvent({ type: 'pointerdown' });
  await new Promise(r => setTimeout(r, 100));
  btnParent.dispatchEvent({ type: 'pointerup' });

  assert.strictEqual(modalParent.style.display, 'none', 'Tap under 2 seconds must NOT open parent gate');
});

await asyncTest('M3.PAR.2 2-Second Hold Unlocks Math Gate', async () => {
  App.holdDurationMs = 50; // Fast-forward for unit test
  const btnParent = domRegistry.get('btnOpenParent');
  const modalParent = domRegistry.get('modalParent');

  btnParent.dispatchEvent({ type: 'pointerdown' });
  await new Promise(r => setTimeout(r, 70));

  assert.strictEqual(modalParent.style.display, 'flex', '2-second hold opens parent modal');
  assert.strictEqual(domRegistry.get('parentGateSection').style.display, 'flex', 'Gate section active');
  assert.strictEqual(domRegistry.get('parentDashboardSection').style.display, 'none', 'Dashboard hidden');

  const q = domRegistry.get('parentMathQuestion').textContent;
  assert(q.includes('Berapa'), 'Displays math question');

  const choices = domRegistry.get('parentMathChoices');
  assert.strictEqual(choices.children.length, 6, 'Must generate 6 math choices');
  App.holdDurationMs = 2000; // Reset
});

test('M3.PAR.3 Incorrect Math Answer Rejected & Wobbles', () => {
  const modalParent = domRegistry.get('modalParent');
  const wrongVal = App.currentMathAnswer + 10;
  App.handleMathChoice(wrongVal);

  assert.strictEqual(domRegistry.get('parentDashboardSection').style.display, 'none', 'Dashboard still hidden');
  assert(domRegistry.get('parentGateSection').classList.contains('wobble'), 'Gate section shakes on error');
});

test('M3.PAR.4 Correct Math Answer Unlocks Dashboard & Child Name', () => {
  const modalParent = domRegistry.get('modalParent');
  App.handleMathChoice(App.currentMathAnswer);

  assert.strictEqual(domRegistry.get('parentGateSection').style.display, 'none', 'Gate hidden');
  assert.strictEqual(domRegistry.get('parentDashboardSection').style.display, 'flex', 'Dashboard revealed');

  const inputChild = domRegistry.get('inputChildName');
  inputChild.value = 'Raffasya';
  domRegistry.get('btnSaveChildName').click();

  assert.strictEqual(App.childName, 'Raffasya', 'Child name updated and persisted');
  assert.strictEqual(mockLocalStorage.getItem('spidey_child_name'), 'Raffasya');
});

test('M3.PAR.5 World Recap List Displays Correct Stats', () => {
  App.renderWorldRecapList();
  const recapList = domRegistry.get('worldRecapList');
  assert.strictEqual(recapList.children.length, WORLDS.length, 'Must list all 4 worlds');
});

test('M3.PAR.6 Safe Reset Progress Clears Data', () => {
  globalThis.confirm = () => true;
  domRegistry.get('btnResetProgress').click();

  assert.strictEqual(App.getTotalStars(), 0, 'Stars reset to 0');
  assert.strictEqual(App.getCompletedLevelsCount(), 0, 'Completed levels cleared');
  assert.strictEqual(App.currentView, 'worlds', 'Reset redirects to worlds view');
});

console.log('\n--- 7. Championship Certificate Modal & Print ---');
test('M3.CRT.1 Certificate Modal Populates Child Stats & Mascots', () => {
  App.childName = 'Sulthan';
  App.completedLevels = { '01': 3, '02': 3, '15': 3 };
  App.openCertificateModal();

  const modalCert = domRegistry.get('modalCertificate');
  assert.strictEqual(modalCert.style.display, 'flex');

  assert.strictEqual(domRegistry.get('certChildName').textContent, 'Sulthan');
  assert.strictEqual(domRegistry.get('certTotalStars').textContent, '9');
  assert.strictEqual(domRegistry.get('certCompletedLevels').textContent, '3');
  assert(domRegistry.get('certIssueDate').textContent.includes('Tanggal:'), 'Date formatted in Indonesian');

  assert(domRegistry.get('certMascotLeft').innerHTML.includes('<svg'), 'Left Spidey mascot rendered');
  assert(domRegistry.get('certMascotRight').innerHTML.includes('<svg'), 'Right Spideybot mascot rendered');
});

test('M3.CRT.2 Print Certificate Action Triggers window.print()', () => {
  globalThis.__PRINT_CALLED = false;
  domRegistry.get('btnPrintCert').click();
  assert.strictEqual(globalThis.__PRINT_CALLED, true, 'window.print() must be triggered');
});

test('M3.CRT.3 Close Certificate Closes Modal', () => {
  domRegistry.get('btnCloseCert').click();
  assert.strictEqual(domRegistry.get('modalCertificate').style.display, 'none');
});

console.log('\n--- 8. Confetti Animation Subsystem ---');
test('M3.CNF.1 Confetti Starts and Stops Cleanly', () => {
  const canvas = domRegistry.get('confettiCanvas');
  const effect = new ConfettiEffect(canvas);

  assert.strictEqual(effect.active, false);
  effect.start(100);
  assert.strictEqual(effect.active, true);
  assert.strictEqual(effect.particles.length, 75);

  effect.stop();
  assert.strictEqual(effect.active, false);
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n============================================================');
console.log(`📊 M3 VERIFICATION SUMMARY: ${passCount} / ${totalCount} PASSED`);
console.log('============================================================\n');

if (passCount === totalCount) {
  console.log('🌟 ALL MILESTONE 3 CHECKS VERIFIED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`❌ ${totalCount - passCount} CHECKS FAILED`);
  process.exit(1);
}
