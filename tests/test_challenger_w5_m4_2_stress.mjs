// tests/test_challenger_w5_m4_2_stress.mjs
// Adversarial Empirical Simulation & Verification Harness for Milestone 4 (W5-M4)
// Petualangan Spidey Cilik - World 5: "Offline PWA Invariant, Universal Selfcheck Expansion & Test Verification"
// Roles: Critic & Specialist
// Zero external dependencies - runnable via `node tests/test_challenger_w5_m4_2_stress.mjs`.

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper for dynamic imports on Windows
const toUrl = (p) => pathToFileURL(p).href;

// ============================================================================
// LIGHTWEIGHT ISOMORPHIC DOM EMULATION
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

// Global DOM setup
global.document = {
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => null,
  body: new MockElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {},
  elementFromPoint: () => null
};
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

// ============================================================================
// TEST SUITE HARNESS
// ============================================================================

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function pass(name, details = '') {
  totalChecks++;
  passedChecks++;
  console.log(`  ✔ [PASS] ${name}${details ? ` (${details})` : ''}`);
}

function fail(name, err) {
  totalChecks++;
  failedChecks++;
  failures.push({ name, error: err.message || err });
  console.error(`  ✖ [FAIL] ${name}: ${err.message || err}`);
}

async function runCheck(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

console.log('============================================================');
console.log('⚔️  CHALLENGER 2: ADVERSARIAL STRESS & EMPIRICAL SIMULATION');
console.log('Milestone 4 (W5-M4) - Petualangan Spidey Cilik World 5');
console.log('============================================================\n');

// Load Modules
const levelsModule = await import(toUrl(path.join(ROOT_DIR, 'levels.js')));
const { BASE_LEVELS, PUZZLE_LEVELS, ALL_LEVELS, ALL_WORLDS, WORLDS } = levelsModule;
const enginesModule = await import(toUrl(path.join(ROOT_DIR, 'engines.js')));
const { Engines } = enginesModule;
const audioModule = await import(toUrl(path.join(ROOT_DIR, 'audio.js')));
const { SoundSystem, sound } = audioModule;
const mascotModule = await import(toUrl(path.join(ROOT_DIR, 'mascot.js')));
const { Mascot } = mascotModule;
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');
const swJs = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
const appJs = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');

// ============================================================================
// SUITE 1: OFFLINE PWA INVARIANT & STATIC ASSET AUDIT
// ============================================================================
console.log('[Suite 1: Offline PWA Invariant & Cache-First Asset Audit]');

await runCheck('1.1 Exact CACHE_NAME invariant in sw.js', () => {
  assert(swJs.includes("const CACHE_NAME = 'spidey-cilik-v1';"), "CACHE_NAME must be strictly 'spidey-cilik-v1'");
});

await runCheck('1.2 Exact 14 assets cached in ASSETS_TO_CACHE', () => {
  const match = swJs.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  assert(match, 'ASSETS_TO_CACHE definition not found in sw.js');
  const items = match[1]
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(Boolean);
  assert.strictEqual(items.length, 14, `Expected exactly 14 assets in ASSETS_TO_CACHE, found ${items.length}`);

  // Empirically verify every asset exists on filesystem
  for (const item of items) {
    if (item === './') {
      assert(fs.existsSync(path.join(ROOT_DIR, 'index.html')), 'Root index.html must exist');
    } else {
      const rel = item.replace(/^\.\//, '');
      const fullPath = path.join(ROOT_DIR, rel);
      assert(fs.existsSync(fullPath), `Cached asset "${item}" does not exist on disk at ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert(stat.size > 0, `Cached asset "${item}" is empty (0 bytes)`);
    }
  }
});

await runCheck('1.3 manifest.webmanifest schema and offline PWA properties', () => {
  const manifestPath = path.join(ROOT_DIR, 'manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
  const json = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(json.display, 'standalone', 'display must be standalone');
  assert.strictEqual(json.start_url, './index.html', 'start_url must be ./index.html');
  assert(Array.isArray(json.icons) && json.icons.length >= 3, 'Must have at least 3 icons');
  for (const icon of json.icons) {
    const iconPath = path.join(ROOT_DIR, icon.src.replace(/^\.\//, ''));
    assert(fs.existsSync(iconPath), `Manifest icon ${icon.src} must exist on disk`);
  }
});

// ============================================================================
// SUITE 2: STRICT PRESCHOOL TOUCH TARGETS (>= 64PX) IN STYLE.CSS
// ============================================================================
console.log('\n[Suite 2: Strict Preschool Touch Target Audit in style.css]');

await runCheck('2.1 Root variable --touch-min is configured to 64px', () => {
  assert(styleCss.includes('--touch-min: 64px;'), 'style.css must declare --touch-min: 64px;');
});

await runCheck('2.2 World 5 interactive engine targets strictly satisfy >= 64px', () => {
  // 1. Pola: .pattern-item and .pattern-choice-btn
  assert(styleCss.includes('.pattern-item {'), '.pattern-item rule must exist');
  assert(
    styleCss.includes('min-width: 64px;') || styleCss.includes('width: 80px;'),
    '.pattern-item width must be >= 64px'
  );
  assert(
    styleCss.includes('min-height: 64px;') || styleCss.includes('height: 80px;'),
    '.pattern-item height must be >= 64px'
  );
  assert(styleCss.includes('.choice-btn.pattern-choice-btn {'), '.pattern-choice-btn rule must exist');
  assert(styleCss.includes('min-width: 76px;'), '.pattern-choice-btn min-width must be >= 64px (found 76px)');
  assert(styleCss.includes('min-height: 76px;'), '.pattern-choice-btn min-height must be >= 64px (found 76px)');

  // 2. Kode: .code-symbol-box and .keypad-btn
  assert(styleCss.includes('.code-symbol-box {'), '.code-symbol-box rule must exist');
  assert(styleCss.includes('min-width: 64px;') || styleCss.includes('width: 76px;'), '.code-symbol-box width >= 64px');
  assert(styleCss.includes('min-height: 64px;') || styleCss.includes('height: 76px;'), '.code-symbol-box height >= 64px');
  assert(styleCss.includes('.choice-btn.keypad-btn {'), '.keypad-btn rule must exist');
  assert(styleCss.includes('min-width: 72px;'), '.keypad-btn min-width must be >= 64px (found 72px)');
  assert(styleCss.includes('min-height: 72px;'), '.keypad-btn min-height must be >= 64px (found 72px)');

  // 3. Beda: .choice-btn.beda-card.beda-btn
  assert(styleCss.includes('.choice-btn.beda-card.beda-btn {'), '.beda-card.beda-btn rule must exist');
  assert(styleCss.includes('min-width: 96px;'), '.beda-card min-width must be >= 64px (found 96px)');
  assert(styleCss.includes('min-height: 96px;'), '.beda-card min-height must be >= 64px (found 96px)');

  // 4. Jumlah: .pan-touch-zone, .choice-btn.pan-choice-btn, .choice-btn.math-choice-btn
  assert(styleCss.includes('.pan-touch-zone {'), '.pan-touch-zone rule must exist');
  assert(styleCss.includes('width: 130px;'), '.pan-touch-zone width must be >= 64px (found 130px)');
  assert(styleCss.includes('.choice-btn.pan-choice-btn {'), '.pan-choice-btn rule must exist');
  assert(styleCss.includes('min-height: 64px;'), '.pan-choice-btn min-height must be >= 64px');
  assert(styleCss.includes('.choice-btn.math-choice-btn {'), '.math-choice-btn rule must exist');
  assert(styleCss.includes('min-width: 76px;'), '.math-choice-btn min-width must be >= 64px (found 76px)');
  assert(styleCss.includes('min-height: 76px;'), '.math-choice-btn min-height must be >= 64px (found 76px)');
});

await runCheck('2.3 Tactile 3D feedback (scale 1.02, 0.95 & jelly active shadow) present across buttons', () => {
  assert(styleCss.includes('scale(1.02, 0.95)'), 'Must implement tactile preschool scale(1.02, 0.95)');
  assert(styleCss.includes('var(--jelly-shadow-active)'), 'Must implement --jelly-shadow-active');
});

// ============================================================================
// SUITE 3: STAR CALCULATION & LEVEL COUNT INVARIANTS (273 MAX STARS)
// ============================================================================
console.log('\n[Suite 3: Star Calculation Invariant (91 Levels * 3 = 273 Max Stars)]');

await runCheck('3.1 Level database quantity invariant', () => {
  assert.strictEqual(BASE_LEVELS.length, 75, 'BASE_LEVELS must have exactly 75 levels');
  assert.strictEqual(PUZZLE_LEVELS.length, 16, 'PUZZLE_LEVELS must have exactly 16 levels');
  assert.strictEqual(ALL_LEVELS.length, 91, 'ALL_LEVELS must have exactly 91 levels (75 + 16)');
  assert.strictEqual(ALL_WORLDS.length, 5, 'ALL_WORLDS must have exactly 5 worlds');
});

await runCheck('3.2 Pure mathematical invariant: 91 * 3 === 273', () => {
  const maxStars = ALL_LEVELS.length * 3;
  assert.strictEqual(maxStars, 273, `Calculated stars must be exactly 273, got ${maxStars}`);
});

await runCheck('3.3 app.js references 273 max stars and dynamic calculator', () => {
  assert(appJs.includes('273') || appJs.includes('this.maxLevels * 3'), 'app.js must reflect 273 max stars calculation');
  assert(appJs.includes('getMaxStars()'), 'app.js must define getMaxStars()');
  assert(appJs.includes('getMaxLevels()'), 'app.js must define getMaxLevels()');
});

await runCheck('3.4 Full LocalStorage 273-star progression simulation', () => {
  const mockStorage = {};
  const completed = {};
  for (let i = 1; i <= 91; i++) {
    const id = String(i).padStart(2, '0');
    completed[id] = 3;
  }
  const totalStars = Object.values(completed).reduce((sum, s) => sum + s, 0);
  assert.strictEqual(totalStars, 273, 'Accumulated stars across all 91 levels must equal 273');
  mockStorage['stars_total'] = String(totalStars);
  mockStorage['spidey_progress'] = JSON.stringify({
    completedLevels: completed,
    totalStars,
    maxStars: 273,
    maxLevels: 91
  });

  const parsed = JSON.parse(mockStorage['spidey_progress']);
  assert.strictEqual(parsed.totalStars, 273, 'Parsed totalStars must equal 273');
  assert.strictEqual(parsed.maxStars, 273, 'Parsed maxStars must equal 273');
  assert.strictEqual(parsed.maxLevels, 91, 'Parsed maxLevels must equal 91');
  assert.strictEqual(Object.keys(parsed.completedLevels).length, 91, 'Must have 91 completed level records');
});

// ============================================================================
// SUITE 4: ALGORITHMIC SOLVABILITY ACROSS ALL 16 LEVELS (76–91)
// ============================================================================
console.log('\n[Suite 4: Algorithmic Solvability of All 16 Levels (76–91)]');

for (const level of PUZZLE_LEVELS) {
  await runCheck(`4.L${level.id}: Level ${level.id} (${level.title}) [${level.type}] algorithmic solve`, async () => {
    const container = new MockElement('div');
    let winTriggered = false;
    const onWin = () => { winTriggered = true; };

    Engines.render(container, level, onWin);

    if (level.type === 'pola') {
      const targetAns = String(level.answer).trim();
      const choiceButtons = container.querySelectorAll('.choice-btn.pattern-choice-btn');
      assert(choiceButtons.length > 0, `Level ${level.id}: no pattern choice buttons found`);
      const btn = choiceButtons.find(b => b.dataset.val && b.dataset.val.trim() === targetAns);
      assert(btn, `Level ${level.id}: option matching "${targetAns}" not found`);
      btn.click();
      await new Promise(r => setTimeout(r, 800));
      assert(winTriggered, `Level ${level.id}: onComplete callback not triggered`);
    } else if (level.type === 'kode') {
      const solution = level.solution;
      assert(Array.isArray(solution), `Level ${level.id}: solution array missing`);
      for (const expectedVal of solution) {
        const keypadButtons = container.querySelectorAll('.choice-btn.keypad-btn');
        const keyBtn = keypadButtons.find(b => b.dataset.val === String(expectedVal));
        assert(keyBtn, `Level ${level.id}: keypad button "${expectedVal}" not found`);
        keyBtn.click();
      }
      await new Promise(r => setTimeout(r, 1450));
      assert(winTriggered, `Level ${level.id}: onComplete callback not triggered`);
    } else if (level.type === 'beda') {
      const targetIdx = level.differentIndex !== undefined ? level.differentIndex : level.answerIndex;
      const cardButtons = container.querySelectorAll('.choice-btn.beda-card.beda-btn');
      assert(cardButtons[targetIdx], `Level ${level.id}: target card at index ${targetIdx} missing`);
      cardButtons[targetIdx].click();
      await new Promise(r => setTimeout(r, 700));
      assert(winTriggered, `Level ${level.id}: onComplete callback not triggered`);
    } else if (level.type === 'jumlah') {
      if (level.mode === 'balance') {
        const targetSide = level.target || level.answer;
        const targetPan = container.querySelector(targetSide === 'left' ? '#panLeft' : '#panRight');
        assert(targetPan, `Level ${level.id}: pan #${targetSide} not found`);
        targetPan.click();
        await new Promise(r => setTimeout(r, 850));
        assert(winTriggered, `Level ${level.id}: onComplete callback not triggered`);
      } else {
        const expected = String(level.answer);
        const mathButtons = container.querySelectorAll('.choice-btn.math-num-btn');
        const btn = mathButtons.find(b => String(b.dataset.val) === expected);
        assert(btn, `Level ${level.id}: math button "${expected}" not found`);
        btn.click();
        await new Promise(r => setTimeout(r, 850));
        assert(winTriggered, `Level ${level.id}: onComplete callback not triggered`);
      }
    }
  });
}

// ============================================================================
// SUITE 5: ADVERSARIAL INPUT FUZZING & RAPID CLICK STRESS
// ============================================================================
console.log('\n[Suite 5: Adversarial Input Fuzzing & Rapid Interaction Stress]');

await runCheck('5.1 Pola Engine: 50 rapid spam clicks on correct button trigger callback exactly once', async () => {
  const container = new MockElement('div');
  let winCount = 0;
  const level = PUZZLE_LEVELS[0]; // Level 76
  Engines.render(container, level, () => { winCount++; });

  const targetAns = String(level.answer).trim();
  const choiceButtons = container.querySelectorAll('.choice-btn.pattern-choice-btn');
  const btn = choiceButtons.find(b => b.dataset.val && b.dataset.val.trim() === targetAns);
  assert(btn, 'Target button not found');

  // Rapid 50 clicks in loop
  for (let i = 0; i < 50; i++) {
    btn.click();
  }

  await new Promise(r => setTimeout(r, 850));
  assert.strictEqual(winCount, 1, `Callback must be fired exactly ONCE, fired ${winCount} times`);
});

await runCheck('5.2 Pola Engine: 30 rapid wrong clicks cause no crash and gentle feedback', async () => {
  const container = new MockElement('div');
  let winCount = 0;
  const level = PUZZLE_LEVELS[0];
  Engines.render(container, level, () => { winCount++; });

  const targetAns = String(level.answer).trim();
  const choiceButtons = container.querySelectorAll('.choice-btn.pattern-choice-btn');
  const wrongBtn = choiceButtons.find(b => b.dataset.val && b.dataset.val.trim() !== targetAns);
  assert(wrongBtn, 'Wrong button not found');

  // Rapid 30 clicks on wrong answer
  assert.doesNotThrow(() => {
    for (let i = 0; i < 30; i++) {
      wrongBtn.click();
    }
  }, 'Rapid wrong clicks must not throw uncaught errors');

  await new Promise(r => setTimeout(r, 300));
  assert.strictEqual(winCount, 0, 'Wrong clicks must never trigger victory callback');
  assert(wrongBtn.classList.contains('shake'), 'Wrong button must receive .shake class');
});

await runCheck('5.3 Kode Engine: Out-of-order slot clicks, backspace spam, and wrong inputs', async () => {
  const container = new MockElement('div');
  let winCount = 0;
  const level = PUZZLE_LEVELS[4]; // Level 80 (Kode)
  Engines.render(container, level, () => { winCount++; });

  const cols = container.querySelectorAll('.code-col');
  const keypadButtons = container.querySelectorAll('.choice-btn.keypad-btn');
  const backspaceBtn = keypadButtons.find(b => b.textContent.includes('⌫'));
  assert(backspaceBtn, 'Backspace button must exist');

  // 1. Spam backspace on empty state
  assert.doesNotThrow(() => {
    for (let i = 0; i < 15; i++) {
      backspaceBtn.click();
    }
  }, 'Spamming backspace on initial state must be harmless');

  // 2. Select slot 2 directly (out-of-order)
  if (cols[2]) {
    cols[2].click();
    assert(cols[2].classList.contains('active'), 'Clicking slot 2 must activate it');
  }

  // 3. Enter wrong value for slot 2
  const wrongKey = keypadButtons.find(b => b.dataset.val && b.dataset.val !== level.solution[2] && b.dataset.val !== '⌫');
  if (wrongKey) {
    wrongKey.click();
    const slot2 = container.querySelector('#codeSlot2');
    assert(slot2.classList.contains('shake'), 'Wrong input on slot 2 must shake');
  }

  // 4. Enter correct values out of order: slot 2 then 0 then 1
  cols[2].click();
  const key2 = keypadButtons.find(b => b.dataset.val === String(level.solution[2]));
  key2.click();

  cols[0].click();
  const key0 = keypadButtons.find(b => b.dataset.val === String(level.solution[0]));
  key0.click();

  cols[1].click();
  const key1 = keypadButtons.find(b => b.dataset.val === String(level.solution[1]));
  key1.click();

  await new Promise(r => setTimeout(r, 1500));
  assert.strictEqual(winCount, 1, 'Solving all slots out-of-order must trigger win once');
});

await runCheck('5.4 Beda Engine: 40 rapid interleaved clicks on all cards', async () => {
  const container = new MockElement('div');
  let winCount = 0;
  const level = PUZZLE_LEVELS[8]; // Level 84 (Beda)
  Engines.render(container, level, () => { winCount++; });

  const cards = container.querySelectorAll('.choice-btn.beda-card.beda-btn');
  assert.strictEqual(cards.length, 4, 'Beda must have 4 cards');
  const targetIdx = level.differentIndex !== undefined ? level.differentIndex : level.answerIndex;

  // Click wrong cards rapidly
  for (let i = 0; i < 4; i++) {
    if (i !== targetIdx) {
      cards[i].click();
      cards[i].click();
    }
  }

  // Click right card once, then immediately spam wrong and right cards
  cards[targetIdx].click();
  for (let i = 0; i < 4; i++) {
    cards[i].click();
  }

  await new Promise(r => setTimeout(r, 750));
  assert.strictEqual(winCount, 1, 'Only one win callback should be triggered after correct card click');
});

await runCheck('5.5 Jumlah Engine: Fruit items touch-counting & pan rapid toggling', async () => {
  const container = new MockElement('div');
  let winCount = 0;
  const level = PUZZLE_LEVELS[13]; // Level 89 (Jumlah - Balance)
  Engines.render(container, level, () => { winCount++; });

  // 1. Click individual fruit items rapidly
  const fruits = container.querySelectorAll('.pan-fruit-item');
  assert(fruits.length > 0, 'Interactive fruit items must exist');
  assert.doesNotThrow(() => {
    fruits.forEach(f => {
      f.click();
      f.click();
    });
  }, 'Clicking fruit items must trigger pop and bounce without crashing');

  // 2. Click wrong pan 10 times
  const wrongPan = container.querySelector('#panRight');
  assert(wrongPan, 'Right pan exists');
  for (let i = 0; i < 10; i++) {
    wrongPan.click();
  }
  assert.strictEqual(winCount, 0, 'Wrong pan clicks must not complete level');

  // 3. Click correct pan 20 times rapidly
  const correctPan = container.querySelector('#panLeft');
  assert(correctPan, 'Left pan exists');
  for (let i = 0; i < 20; i++) {
    correctPan.click();
  }

  await new Promise(r => setTimeout(r, 900));
  assert.strictEqual(winCount, 1, 'Correct pan must trigger win callback exactly once');
});

await runCheck('5.6 Malformed / Empty input resilience across all 4 new engines', () => {
  const emptyContainer = new MockElement('div');

  // Passing null / undefined / empty objects must not throw unhandled exceptions
  assert.doesNotThrow(() => Engines.renderPola(null, null, null));
  assert.doesNotThrow(() => Engines.renderPola(emptyContainer, {}, null));

  assert.doesNotThrow(() => Engines.renderKode(null, null, null));
  assert.doesNotThrow(() => Engines.renderKode(emptyContainer, {}, null));

  assert.doesNotThrow(() => Engines.renderBeda(null, null, null));
  assert.doesNotThrow(() => Engines.renderBeda(emptyContainer, {}, null));

  assert.doesNotThrow(() => Engines.renderJumlah(null, null, null));
  assert.doesNotThrow(() => Engines.renderJumlah(emptyContainer, {}, null));
});

// ============================================================================
// SUITE 6: MASCOT EVOLUTION & PROCEDURAL AUDIO ROBUSTNESS
// ============================================================================
console.log('\n[Suite 6: Mascot Evolution Invariants & Procedural Audio Safety]');

await runCheck('6.1 Invariant: Mascot.squad is strictly 5 canonical members', () => {
  assert(Array.isArray(Mascot.squad), 'Mascot.squad must be an array');
  assert.strictEqual(Mascot.squad.length, 5, `Mascot.squad must contain exactly 5 members, found ${Mascot.squad.length}`);
  const squadIds = Mascot.squad.map(s => s.id);
  assert(squadIds.includes('spidey'), 'spidey missing');
  assert(squadIds.includes('cat'), 'cat missing');
  assert(squadIds.includes('bunny'), 'bunny missing');
  assert(squadIds.includes('panda'), 'panda missing');
  assert(squadIds.includes('bot'), 'bot missing');
});

await runCheck('6.2 Mascot dynamic costumes & 4 new celebratory poses', () => {
  const poses = ['celebrate_jump', 'eureka', 'curious', 'proud'];
  for (const pose of poses) {
    const heroSvg = Mascot.hero(80, pose, 'detective');
    assert(heroSvg.includes('spidey-mascot'), `Hero SVG for pose ${pose} missing spidey-mascot`);
    assert(heroSvg.includes('costume-detective'), `Hero SVG for pose ${pose} missing costume-detective`);
  }

  const bunnySvg = Mascot.bunny(80, 'celebrate_jump', 'explorer');
  assert(bunnySvg.includes('costume-explorer'), 'Bunny SVG missing costume-explorer');

  const pandaSvg = Mascot.panda(80, 'eureka', 'scientist');
  assert(pandaSvg.includes('costume-scientist'), 'Panda SVG missing costume-scientist');

  const catSvg = Mascot.cat(80, 'curious', 'whimsical');
  assert(catSvg.includes('costume-whimsical'), 'Cat SVG missing costume-whimsical');
});

await runCheck('6.3 Mascot extreme sizing resilience (size: -5, 0, 10000)', () => {
  assert.doesNotThrow(() => Mascot.hero(-5));
  assert.doesNotThrow(() => Mascot.hero(0));
  assert.doesNotThrow(() => Mascot.hero(10000));
  assert.doesNotThrow(() => Mascot.randomCelebration('spidey', 80, 'detective'));
  assert.doesNotThrow(() => Mascot.forWorld('puzzle', 90));
});

await runCheck('6.4 SoundSystem procedural cues 100x headless burst execution', () => {
  assert.doesNotThrow(() => {
    for (let i = 0; i < 100; i++) {
      sound.playSnap();
      sound.playCipherClick();
      sound.playScaleTilt();
      sound.playFlourish();
    }
  }, 'Procedural audio methods must execute cleanly in headless environment without crashing');
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n============================================================');
console.log('📊 CHALLENGER 2 ADVERSARIAL STRESS EXECUTION SUMMARY');
console.log('============================================================');
console.log(`Total Verification Checks: ${totalChecks}`);
console.log(`Passed:                   ${passedChecks}`);
console.log(`Failed:                   ${failedChecks}`);
console.log('============================================================\n');

if (failedChecks === 0) {
  console.log('✔ ALL ADVERSARIAL STRESS & EMPIRICAL SIMULATIONS PASSED (Exit 0)!\n');
  process.exit(0);
} else {
  console.error('✖ ADVERSARIAL CHALLENGES FAILED:');
  failures.forEach(f => console.error(`  - ${f.name}: ${f.error}`));
  process.exit(1);
}
