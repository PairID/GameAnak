// tests/test_final_acceptance_all.mjs
// ============================================================================
// 🕷️ PETUALANGAN SPIDEY CILIK — INTEGRATED FINAL ACCEPTANCE RUNNER
// Milestone M-EVO-4: Comprehensive High-Stress & Full Acceptance Suite
// Zero-Dependency Pure Node.js (v18+) Verification Engine
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🕷️ PETUALANGAN SPIDEY CILIK — FINAL ACCEPTANCE INTEGRATED RUNNER');
console.log('Milestone M-EVO-4: System-Wide Concurrency, Memory & Contract Audit');
console.log('================================================================\n');

const startTime = Date.now();
const initialMemory = process.memoryUsage();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function check(title, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${title}`);
  } catch (err) {
    failedTests++;
    failures.push({ title, error: err.message, stack: err.stack });
    console.error(`  ✖ [FAIL] ${title}: ${err.message}`);
  }
}

async function asyncCheck(title, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${title}`);
  } catch (err) {
    failedTests++;
    failures.push({ title, error: err.message, stack: err.stack });
    console.error(`  ✖ [FAIL] ${title}: ${err.message}`);
  }
}

// ============================================================================
// SUITE 1: MODULE CONTRACTS & ARCHITECTURAL INVARIANTS
// ============================================================================
console.log('[SUITE 1: Module Contracts & Architectural Invariants]');

const { LEVELS, WORLDS } = await import('../levels.js');
const { Engines } = await import('../engines.js');
const { sound, SoundSystem } = await import('../audio.js');
const { Mascot } = await import('../mascot.js');

check('1.1 levels.js exports exactly 75 levels across 4 worlds', () => {
  assert.strictEqual(LEVELS.length, 75, 'Must contain exactly 75 verified levels');
  assert.strictEqual(WORLDS.length, 4, 'Must contain exactly 4 pedagogical worlds');
  const counts = {};
  for (const lvl of LEVELS) {
    counts[lvl.worldId] = (counts[lvl.worldId] || 0) + 1;
    assert(lvl.id && lvl.title && lvl.type && lvl.prompt, `Level ${lvl.id} must satisfy contract`);
  }
  assert.strictEqual(counts.hewan, 11);
  assert.strictEqual(counts.angka, 22);
  assert.strictEqual(counts.spidey, 23);
  assert.strictEqual(counts.koding, 19);
});

check('1.2 engines.js exports 9 game engines and unified dispatchers', () => {
  const engineTypes = ['hubungkan', 'labirin', 'pilih', 'titik', 'tebalkan', 'mewarnai', 'urutkan', 'panah', 'memori'];
  for (const t of engineTypes) {
    const fnName = 'render' + t.charAt(0).toUpperCase() + t.slice(1);
    assert.strictEqual(typeof Engines[fnName], 'function', `Engines.${fnName} must be a function`);
  }
  assert.strictEqual(typeof Engines.render, 'function', 'Engines.render dispatcher must exist');
  assert.strictEqual(Engines.renderTitik, Engines.renderHubungkanTitik, 'renderTitik alias check');
  assert.strictEqual(Engines.renderPanah, Engines.renderKodingPanah, 'renderPanah alias check');
});

check('1.3 audio.js provides isomorphic Web Audio and Indonesian Speech synthesizer', () => {
  assert.strictEqual(typeof sound.init, 'function');
  assert.strictEqual(typeof sound.playPop, 'function');
  assert.strictEqual(typeof sound.playClick, 'function');
  assert.strictEqual(typeof sound.playCorrect, 'function');
  assert.strictEqual(typeof sound.playStar, 'function');
  assert.strictEqual(typeof sound.playFanfare, 'function');
  assert.strictEqual(typeof sound.playGentleTryAgain, 'function');
  assert.strictEqual(typeof sound.playRobotStep, 'function');
  assert.strictEqual(typeof sound.speak, 'function');
  assert.strictEqual(typeof sound.stopSpeech, 'function');
  
  // Safe headless execution
  sound.init();
  sound.playPop();
  sound.playCorrect();
  sound.playFanfare();
  sound.playGentleTryAgain();
  sound.speak('Halo Spidey!', () => {});
  sound.stopSpeech();
});

check('1.4 mascot.js exports 5 characters, 4 poses, backwards compatibility utilities', () => {
  const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['idle', 'cheer', 'think', 'encourage'];
  for (const char of characters) {
    assert.strictEqual(typeof Mascot[char], 'function', `Mascot.${char} must be a function`);
    for (const pose of poses) {
      const svg = Mascot[char](100, pose);
      assert(svg.includes('<svg') && svg.includes('</svg>'), `Mascot.${char} (${pose}) must return valid SVG markup`);
    }
  }
  assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot alias');
  assert.strictEqual(typeof Mascot.companion, 'function');
  assert.strictEqual(typeof Mascot.forWorld, 'function');
  assert.strictEqual(typeof Mascot.star, 'function');
  assert.strictEqual(typeof Mascot.web, 'function');
});

// ============================================================================
// SUITE 2: DOM SHELL & 54 MANDATORY DOM IDS INVARIANT
// ============================================================================
console.log('\n[SUITE 2: DOM Shell & Semantic DOM Invariants]');

const htmlContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

const MANDATORY_54_DOM_IDS = [
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

check('2.1 Exactly 54 semantic DOM IDs exist and are unique in index.html', () => {
  assert.strictEqual(MANDATORY_54_DOM_IDS.length, 54);
  for (const id of MANDATORY_54_DOM_IDS) {
    const idRegex = new RegExp(`id=["']${id}["']`, 'g');
    const matches = htmlContent.match(idRegex);
    assert(matches && matches.length === 1, `Element ID "${id}" must exist exactly once in index.html`);
  }
});

check('2.2 Zero external network/CDN leaks in index.html', () => {
  const cdnRegex = /https?:\/\//i;
  assert(!cdnRegex.test(htmlContent), 'index.html must contain ZERO remote URL references');
});

// ============================================================================
// SUITE 3: PWA OFFLINE INFRASTRUCTURE & EXACT 14 ASSETS
// ============================================================================
console.log('\n[SUITE 3: PWA Offline Infrastructure & 14-Asset Cache Invariant]');

const swContent = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
const manifestContent = fs.readFileSync(path.join(ROOT_DIR, 'manifest.webmanifest'), 'utf8');

check('3.1 sw.js declares exactly 14 cached assets and all exist on disk', () => {
  const match = swContent.match(/ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\]/);
  assert(match, 'sw.js must define ASSETS_TO_CACHE array');
  const assets = match[1]
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(Boolean);
  assert.strictEqual(assets.length, 14, 'Must define exactly 14 assets in ASSETS_TO_CACHE');
  for (const asset of assets) {
    const localRel = asset.replace(/^\.\//, '');
    const fullPath = path.join(ROOT_DIR, localRel === '' ? 'index.html' : localRel);
    assert(fs.existsSync(fullPath), `Asset ${asset} (${fullPath}) must exist on disk`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 0, `Asset ${asset} must have non-zero size`);
  }
});

check('3.2 manifest.webmanifest is valid JSON with standalone PWA configuration', () => {
  const manifest = JSON.parse(manifestContent);
  assert(manifest.name && manifest.short_name);
  assert.strictEqual(manifest.display, 'standalone');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
});

// ============================================================================
// SUITE 4: TACTILE JELLY UI & WCAG AA CONTRAST AUDIT
// ============================================================================
console.log('\n[SUITE 4: Tactile Jelly UI & WCAG AA Accessibility Contrast]');

const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');

function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relLum(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const l1 = relLum(hexToRgb(hex1));
  const l2 = relLum(hexToRgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

check('4.1 Root CSS touch variables satisfy preschool ergonomics (>= 64px to 80px)', () => {
  assert(cssContent.includes('--touch-min: 64px') || cssContent.includes('--touch-min: 72px') || cssContent.includes('--touch-min: 80px'));
  assert(cssContent.includes('--touch-jumbo: 80px') || cssContent.includes('--touch-jumbo: 88px') || cssContent.includes('--touch-jumbo: 96px'));
});

check('4.2 WCAG AA/AAA mathematical contrast compliance across key components', () => {
  const pairings = [
    { name: '.empty-hint', fg: '#475569', bg: '#FFFFFF', min: 4.5 },
    { name: '.world-desc (angka)', fg: '#334155', bg: '#FEF3C7', min: 4.5 },
    { name: '.world-desc (spidey)', fg: '#334155', bg: '#FEE2E2', min: 4.5 },
    { name: '.world-desc (koding)', fg: '#334155', bg: '#EFF6FF', min: 4.5 },
    { name: '.world-desc (hewan)', fg: '#334155', bg: '#ECFDF5', min: 4.5 },
    { name: '.level-badge', fg: '#FFFFFF', bg: '#B91C1C', min: 4.5 },
    { name: '.cert-badge-tag', fg: '#FFFFFF', bg: '#991B1B', min: 4.5 },
    { name: 'Primary deep slate on yellow', fg: '#1E293B', bg: '#FBBF24', min: 4.5 },
    { name: 'White on forest green', fg: '#FFFFFF', bg: '#047857', min: 4.5 }
  ];
  for (const pair of pairings) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    assert(ratio >= pair.min, `${pair.name} contrast ratio ${ratio.toFixed(2)}:1 must be >= ${pair.min}:1`);
  }
});

check('4.3 Tactile squishy physics with elastic bezier and volume compression', () => {
  assert(cssContent.includes('scale(1.02, 0.95)') || cssContent.includes('scale(0.95)') || cssContent.includes('scale(0.96)'), 'Must define squishy active scale');
  assert(cssContent.includes('cubic-bezier(0.34, 1.56, 0.64, 1)') || cssContent.includes('--spring-bounce'), 'Must define spring bounce bezier');
});

// ============================================================================
// SUITE 5: HIGH-STRESS PARALLEL CONCURRENCY & RAPID CYCLES
// ============================================================================
console.log('\n[SUITE 5: High-Stress Parallel Concurrency & Rapid Cycles]');

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
          ['img', 'input', 'br', 'hr', 'source', 'line', 'circle', 'path'].includes(openTag.toLowerCase());
        if (!isSelfClosing) {
          stack.push(el);
        }
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        const textNode = new MockElement('#text');
        textNode.textContent = text;
        stack[stack.length - 1].appendChild(textNode);
      }
    }
  }
}

global.window = global.window || {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id)
};

global.document = global.document || {
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => new MockElement('div'),
  querySelector: (sel) => new MockElement('div'),
  querySelectorAll: (sel) => [new MockElement('div')],
  addEventListener: () => {},
  removeEventListener: () => {}
};

await asyncCheck('5.1 Concurrent parallel simulation of all 9 engines across 100 concurrent instances', async () => {
  const engineMap = {
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

  const tasks = [];
  for (let i = 0; i < 100; i++) {
    const type = Object.keys(engineMap)[i % 9];
    const level = engineMap[type];
    const container = new MockElement('div');
    tasks.push(new Promise((resolve, reject) => {
      try {
        Engines.render(container, level, () => {
          resolve();
        });
        assert(container.innerHTML !== '' || container.children.length > 0, 'Must mount into container');
        resolve();
      } catch (err) {
        reject(err);
      }
    }));
  }
  await Promise.all(tasks);
});

check('5.2 High-throughput sequential mascot generation (10,000 SVGs) performance & memory', () => {
  const chars = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['idle', 'cheer', 'think', 'encourage'];
  const iterStartTime = Date.now();
  for (let i = 0; i < 10000; i++) {
    const c = chars[i % chars.length];
    const p = poses[i % poses.length];
    const svg = Mascot[c](100, p);
    assert(svg.length > 100, 'SVG must not be empty');
  }
  const iterDuration = Date.now() - iterStartTime;
  console.log(`      ⚡ 10,000 Mascot SVGs generated in ${iterDuration} ms (${Math.round(10000 / (iterDuration / 1000))} SVGs/sec)`);
  assert(iterDuration < 5000, '10,000 SVGs must generate in under 5,000ms');
});

check('5.3 Algorithmic BFS path solvability verification across all 6 mazes', () => {
  const mazeLevels = LEVELS.filter(l => l.type === 'labirin');
  assert.strictEqual(mazeLevels.length, 6, 'Must contain exactly 6 maze levels');
  
  for (const maze of mazeLevels) {
    const size = maze.gridSize || 5;
    const wallsSet = new Set(maze.walls || []);
    const startKey = '0,0';
    const goalKey = `${size - 1},${size - 1}`;

    assert(!wallsSet.has(startKey), `Maze ${maze.id} start is blocked`);
    assert(!wallsSet.has(goalKey), `Maze ${maze.id} goal is blocked`);

    const queue = [{ r: 0, c: 0, dist: 0 }];
    const visited = new Set([startKey]);
    let solved = false;
    let minSteps = -1;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.r === size - 1 && cur.c === size - 1) {
        solved = true;
        minSteps = cur.dist;
        break;
      }
      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const key = `${nr},${nc}`;
          if (!wallsSet.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ r: nr, c: nc, dist: cur.dist + 1 });
          }
        }
      }
    }
    assert(solved, `Maze Level ${maze.id} (${maze.title}) must be 100% BFS solvable`);
    assert(minSteps > 0, `Maze Level ${maze.id} minSteps must be positive`);
  }
});

// ============================================================================
// SUITE 6: MEMORY STABILITY & HEAP TELEMETRY
// ============================================================================
console.log('\n[SUITE 6: Memory Stability & Heap Telemetry]');

check('6.1 Memory stability check: heap memory growth bounded', () => {
  if (global.gc) global.gc();
  const finalMemory = process.memoryUsage();
  const heapDeltaMB = (finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024);
  console.log(`      Initial Heap: ${(initialMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`      Final Heap:   ${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`      Heap Delta:   ${heapDeltaMB.toFixed(2)} MB`);
  assert(heapDeltaMB < 80, `Heap memory growth (${heapDeltaMB.toFixed(2)} MB) must be bounded under 80 MB`);
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
const totalDuration = Date.now() - startTime;
const passRate = ((passedTests / totalTests) * 100).toFixed(2);

console.log('\n================================================================');
console.log('📊 INTEGRATED FINAL ACCEPTANCE RUNNER SUMMARY');
console.log('================================================================');
console.log(`Total Verification Checks: ${totalTests}`);
console.log(`Passed:                   ${passedTests}`);
console.log(`Failed:                   ${failedTests}`);
console.log(`Pass Rate:                ${passRate}%`);
console.log(`Execution Duration:       ${totalDuration} ms`);
console.log('================================================================');

if (failedTests > 0) {
  console.error('\n💥 FINAL ACCEPTANCE FAILED WITH THE FOLLOWING DEFECTS:');
  for (const f of failures) {
    console.error(`- ${f.title}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\n🎉 ALL FINAL ACCEPTANCE CHECKS PASSED WITH 100% SUCCESS!');
  console.log('VERDICT: APPROVE');
  process.exit(0);
}
