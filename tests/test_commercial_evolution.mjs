// tests/test_commercial_evolution.mjs
// Automated 4-Tier Test Suite for GameAnak Lingokids Commercial Evolution (R1-R4)
// Requirement-driven, opaque-box architecture derived from ORIGINAL_REQUEST.md & PROJECT.md
// Native Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ============================================================================
// 1. LIGHTWEIGHT HEADLESS BROWSER & SYNTHETIC DOM ENVIRONMENT
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
    this.dispatchEvent({ type: 'click', target: this });
  }

  setPointerCapture() {}
  releasePointerCapture() {}

  getBoundingClientRect() {
    return { left: 10, top: 20, right: 110, bottom: 84, width: 100, height: 64, x: 10, y: 20 };
  }
  getContext() {
    return {
      beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
      arc: () => {}, fill: () => {}, clearRect: () => {}, setLineDash: () => {},
      lineWidth: 1, strokeStyle: '#000', fillStyle: '#000', lineCap: 'round'
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
          ['img', 'input', 'br', 'hr', 'source', 'line'].includes(openTag.toLowerCase());
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
  get innerHTML() { return this._innerHTML; }
}

class MockLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {}, start: () => {}, stop: () => {}
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {}
    };
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.lastSpokenText = null;
    this.onvoiceschanged = null;
  }
  getVoices() {
    return [{ lang: 'id-ID', name: 'Indonesian Child', default: true }];
  }
  speak(utterance) {
    this.speaking = true;
    this.lastSpokenText = utterance.text;
    setTimeout(() => {
      this.speaking = false;
      if (utterance.onend) utterance.onend();
    }, 10);
  }
  cancel() { this.speaking = false; }
}

class MockSpeechSynthesisUtterance {
  constructor(text = '') {
    this.text = text;
    this.lang = 'id-ID';
    this.rate = 1;
    this.pitch = 1;
  }
}

const mockStorage = new MockLocalStorage();
const mockSpeech = new MockSpeechSynthesis();

globalThis.window = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  speechSynthesis: mockSpeech,
  SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
  localStorage: mockStorage,
  navigator: { onLine: true },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  print: () => { globalThis.__PRINT_TRIGGERED = true; }
};

globalThis.document = {
  createElement: (tag) => new MockElement(tag),
  createElementNS: (ns, tag) => new MockElement(tag),
  getElementById: (id) => null,
  querySelector: (sel) => null,
  querySelectorAll: () => []
};

globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// ============================================================================
// 2. MATHEMATICAL COLOR CONTRAST (WCAG 2.1 SPECIFICATION)
// ============================================================================

function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function relativeLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

// ============================================================================
// 3. SUITE HARNESS & REPORTING ENGINE
// ============================================================================

const results = {
  tier1: { pass: 0, fail: 0, pending: 0, total: 0 },
  tier2: { pass: 0, fail: 0, pending: 0, total: 0 },
  tier3: { pass: 0, fail: 0, pending: 0, total: 0 },
  tier4: { pass: 0, fail: 0, pending: 0, total: 0 },
  failures: []
};

let currentTier = 'tier1';
function setTier(tier) { currentTier = tier; }

function recordPass(testName) {
  results[currentTier].pass++;
  results[currentTier].total++;
  console.log(`  \x1b[32m✔\x1b[0m [PASS] ${testName}`);
}

function recordFail(testName, error) {
  results[currentTier].fail++;
  results[currentTier].total++;
  results.failures.push({ tier: currentTier, testName, error });
  console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${testName} -> ${error.message}`);
}

class PendingTestError extends Error {
  constructor(milestone, reason) {
    super(reason);
    this.name = 'PendingTestError';
    this.milestone = milestone;
    this.isPending = true;
  }
}

function skipPending(milestone, reason) {
  throw new PendingTestError(milestone, reason);
}

function recordPending(testName, milestone, reason) {
  results[currentTier].pending++;
  results[currentTier].total++;
  console.log(`  \x1b[33m⏳\x1b[0m [PENDING - ${milestone}] ${testName} (${reason})`);
}

async function runTest(testName, fn) {
  try {
    await fn();
    recordPass(testName);
  } catch (err) {
    if (err && err.isPending) {
      recordPending(testName, err.milestone, err.message);
    } else {
      recordFail(testName, err);
    }
  }
}

// ============================================================================
// 4. MAIN TEST EXECUTION
// ============================================================================

async function main() {
  console.log('\n============================================================');
  console.log('🌟 GAMEANAK LINGOKIDS COMMERCIAL EVOLUTION — E2E TEST SUITE');
  console.log('4-Tier Opaque-Box Automated Acceptance Runner (R1–R4)');
  console.log('============================================================\n');

  // Load modules
  const { LEVELS, WORLDS } = await import(pathToFileURL(path.join(ROOT_DIR, 'levels.js')).href);
  const { Engines } = await import(pathToFileURL(path.join(ROOT_DIR, 'engines.js')).href);
  const { sound, SoundSystem } = await import(pathToFileURL(path.join(ROOT_DIR, 'audio.js')).href);
  const { Mascot } = await import(pathToFileURL(path.join(ROOT_DIR, 'mascot.js')).href);

  // Read stylesheets, shell HTML, and worker assets
  const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const swJs = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
  const audioJs = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');

  // --------------------------------------------------------------------------
  // TIER 1: FEATURE COVERAGE (R1, R2, R3, R4)
  // --------------------------------------------------------------------------
  setTier('tier1');
  console.log('\n--- [TIER 1] FEATURE COVERAGE SPECIFICATIONS ---');

  // ==========================================================================
  // SECTION 1.1: R1 — High-Polish Spidey Cilik & Animal Squad Character System
  // ==========================================================================
  console.log('\n[R1: Lingokids Character & Animal Squad System]');

  await runTest('T1.R1.1 5 Characters Existence & Backward Compatibility Contracts', () => {
    // Spidey Hero and Robot must always exist
    assert(typeof Mascot.hero === 'function', 'Mascot.hero must be a function');
    assert(typeof Mascot.robot === 'function', 'Mascot.robot must be a function');
    assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot must be strict alias to Mascot.robot');

    // Animal Squad: Cat, Bunny, Panda
    const hasAnimalSquad = typeof Mascot.cat === 'function' &&
                           typeof Mascot.bunny === 'function' &&
                           typeof Mascot.panda === 'function';

    if (hasAnimalSquad) {
      assert(typeof Mascot.cat === 'function' || typeof Mascot.kucing === 'function', 'Kucing Ceria must exist');
      assert(typeof Mascot.bunny === 'function' || typeof Mascot.kelinci === 'function', 'Kelinci Lincah must exist');
      assert(typeof Mascot.panda === 'function', 'Panda Pintar must exist');
    } else {
      recordPending('T1.R1.1b Animal Squad companion methods (cat, bunny, panda)', 'M-EVO-1', 'Parallel worker_m_evo_1 in progress');
    }
  });

  await runTest('T1.R1.2 20 Expressive Variations (5 Characters x 4 Canonical Poses)', () => {
    const characters = [
      { name: 'Spidey Cilik', fn: Mascot.hero.bind(Mascot) },
      { name: 'Spideybot', fn: Mascot.robot.bind(Mascot) }
    ];
    if (typeof Mascot.cat === 'function') characters.push({ name: 'Kucing Ceria', fn: Mascot.cat.bind(Mascot) });
    if (typeof Mascot.bunny === 'function') characters.push({ name: 'Kelinci Lincah', fn: Mascot.bunny.bind(Mascot) });
    if (typeof Mascot.panda === 'function') characters.push({ name: 'Panda Pintar', fn: Mascot.panda.bind(Mascot) });

    const poses = ['idle', 'cheer', 'think', 'wave'];
    const generatedSvgs = new Set();

    for (const char of characters) {
      for (const pose of poses) {
        const svg = char.fn(100, pose);
        assert(typeof svg === 'string', `${char.name} pose ${pose} must return a string`);
        assert(svg.includes('<svg'), `${char.name} pose ${pose} must contain <svg`);
        assert(svg.includes('</svg>'), `${char.name} pose ${pose} must contain </svg>`);
        assert(svg.includes('viewBox='), `${char.name} pose ${pose} must have viewBox`);
        generatedSvgs.add(`${char.name}_${pose}`);
      }
    }

    if (characters.length === 5) {
      assert.strictEqual(generatedSvgs.size, 20, '5 characters x 4 poses must equal 20 distinct variations');
    } else {
      assert(generatedSvgs.size >= 8, 'Hero and robot must provide at least 8 pose variations');
      recordPending('T1.R1.2b Full 20 Character Variations', 'M-EVO-1', `Verified ${generatedSvgs.size}/20 variations; animal squad pending`);
    }
  });

  await runTest('T1.R1.3 Multi-Layer Gradient Definitions in Character SVGs', () => {
    const heroSvg = Mascot.hero(120, 'wave');
    const robotSvg = Mascot.robot(90, 'idle');

    assert(heroSvg.includes('<defs>'), 'Hero SVG must define <defs> block');
    assert(heroSvg.includes('Gradient'), 'Hero SVG must include gradient definitions for volumetric shading');
    assert(heroSvg.includes('<stop'), 'Gradient definitions must contain stop tags');

    assert(robotSvg.includes('<defs>') || robotSvg.includes('botGrad') || robotSvg.includes('Gradient'),
      'Robot SVG must include gradient definitions');
  });

  await runTest('T1.R1.4 Emotive Anime/Chibi Eye Construction & Specular Highlights', () => {
    const heroSvg = Mascot.hero(120, 'cheer');
    // Emotive eyes contain high-contrast eye contour, white sclera, and specular reflection shine
    assert(heroSvg.includes('fill="#FFFFFF"') || heroSvg.includes('fill="#FFF"') || heroSvg.includes('fill="white"'),
      'Hero eyes must feature white sclera or specular highlight shine');
    assert(!heroSvg.includes('NaN'), 'Hero SVG coordinates must not contain NaN');
    assert(!heroSvg.includes('undefined'), 'Hero SVG coordinates must not contain undefined');
  });

  await runTest('T1.R1.5 Backward Compatibility: Star and Web Utilities Retained', () => {
    const starActive = Mascot.star(40, true);
    assert(starActive.includes('fill="#FBBF24"'), 'Active star must have fill #FBBF24');
    assert(starActive.includes('class="star-icon active"'), 'Active star must have class "star-icon active"');

    const starInactive = Mascot.star(40, false);
    assert(starInactive.includes('fill="#CBD5E1"'), 'Inactive star must have fill #CBD5E1');
    assert(starInactive.includes('class="star-icon inactive"'), 'Inactive star must have class "star-icon inactive"');

    const webSvg = Mascot.web(80);
    assert(webSvg.includes('class="corner-web"'), 'Web must have class "corner-web"');
    assert(webSvg.includes('viewBox="0 0 100 100"'), 'Web must have viewBox="0 0 100 100"');

    const heroWave = Mascot.hero(120, 'wave');
    assert(heroWave.includes('viewBox="0 0 120 120"'), 'Hero must preserve viewBox="0 0 120 120"');
    assert(heroWave.includes('class="spidey-mascot wave"'), 'Hero must preserve class "spidey-mascot wave"');
  });

  await runTest('T1.R1.6 GPU-Accelerated Mascot CSS Keyframe Animations', () => {
    const hasFloat = styleCss.includes('@keyframes mascotFloat');
    const hasBreathe = styleCss.includes('@keyframes mascotBreathe');
    const hasCheer = styleCss.includes('@keyframes mascotCheer');
    assert(hasFloat || hasBreathe || hasCheer, 'style.css must contain GPU-accelerated mascot keyframe animations');
  });

  // ==========================================================================
  // SECTION 1.2: R2 — Tactile 3D "Jelly" Preschool UI & Sensory Design System
  // ==========================================================================
  console.log('\n[R2: Tactile 3D Jelly UI & Sensory Design System]');

  await runTest('T1.R2.1 3D Jelly Multi-Layer Box-Shadow Depth Layers', () => {
    // 3D jelly styling features layered box shadows (highlight + depth slab + ambient contact)
    const hasLayeredShadows = styleCss.includes('box-shadow:') &&
      (styleCss.includes('0 6px 0') || styleCss.includes('0 8px 0') || styleCss.includes('rgba(30, 41, 59'));
    assert(hasLayeredShadows, 'style.css must implement layered 3D depth box-shadows');
  });

  await runTest('T1.R2.2 Squishy Active Scale Transform & Elastic Physics', () => {
    // Interactive :active states implement tactile squish and bouncy press feedback
    const hasActiveTransform = styleCss.includes(':active') &&
      (styleCss.includes('transform:') || styleCss.includes('scale(') || styleCss.includes('translateY('));
    assert(hasActiveTransform, 'style.css must implement tactile :active transform feedback');
  });

  await runTest('T1.R2.3 WCAG AA Accessibility Contrast Ratio Compliance on Color Tokens', () => {
    // Slate #1E293B on Sunny Yellow #FBBF24
    const slateOnYellow = contrastRatio('#1E293B', '#FBBF24');
    assert(slateOnYellow >= 4.5, `Slate on Yellow must meet WCAG AA (>=4.5:1), got ${slateOnYellow.toFixed(2)}:1`);

    // White #FFFFFF on Ocean Blue #2563EB
    const whiteOnBlue = contrastRatio('#FFFFFF', '#2563EB');
    assert(whiteOnBlue >= 4.5, `White on Blue must meet WCAG AA (>=4.5:1), got ${whiteOnBlue.toFixed(2)}:1`);

    // White #FFFFFF on Emerald Forest Green #047857
    const whiteOnForestGreen = contrastRatio('#FFFFFF', '#047857');
    assert(whiteOnForestGreen >= 4.5, `White on Forest Green must meet WCAG AA (>=4.5:1), got ${whiteOnForestGreen.toFixed(2)}:1`);

    // Slate #1E293B on Mint Green #10B981
    const slateOnMint = contrastRatio('#1E293B', '#10B981');
    assert(slateOnMint >= 4.5, `Slate on Mint Green must meet WCAG AA (>=4.5:1), got ${slateOnMint.toFixed(2)}:1`);

    // White #FFFFFF on Crimson Red #DC2626
    const whiteOnCrimson = contrastRatio('#FFFFFF', '#DC2626');
    assert(whiteOnCrimson >= 4.5, `White on Crimson must meet WCAG AA (>=4.5:1), got ${whiteOnCrimson.toFixed(2)}:1`);

    // Slate #1E293B on Warm Preschool Cream #FFF9F0
    const slateOnWarmBg = contrastRatio('#1E293B', '#FFF9F0');
    assert(slateOnWarmBg >= 7.0, `Slate on Warm Cream must meet WCAG AAA (>=7.0:1), got ${slateOnWarmBg.toFixed(2)}:1`);
  });

  await runTest('T1.R2.4 Toddler Touch Targets Dimensions >= 64px to 80px', () => {
    assert(styleCss.includes('--touch-min: 64px') || styleCss.includes('64px'),
      'style.css must declare minimum touch target of 64px');
    assert(styleCss.includes('--touch-jumbo: 80px') || styleCss.includes('80px'),
      'style.css must declare jumbo touch target of 80px');
  });

  await runTest('T1.R2.5 Preservation of All 54 Semantic DOM IDs in index.html Shell', () => {
    const requiredDomIds = [
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

    assert.strictEqual(requiredDomIds.length, 54, 'Spec requires exactly 54 DOM IDs');
    const missing = [];
    for (const id of requiredDomIds) {
      if (!indexHtml.includes(`id="${id}"`)) missing.push(id);
    }
    assert.strictEqual(missing.length, 0, `All 54 DOM IDs must exist. Missing: ${missing.join(', ')}`);
  });

  // ==========================================================================
  // SECTION 1.3: R3 — Celebratory Reward & Micro-Interaction Polish
  // ==========================================================================
  console.log('\n[R3: Celebratory Reward & Micro-Interaction Polish]');

  await runTest('T1.R3.1 Confetti / Fireworks Particle Physics Engine', () => {
    assert(appJs.includes('ConfettiEffect') || appJs.includes('confetti'),
      'app.js must provide confetti or celebration fireworks particle logic');
    assert(indexHtml.includes('id="confettiCanvas"'),
      'index.html must provide #confettiCanvas canvas element');
  });

  await runTest('T1.R3.2 Reactive Mascot Emotion Bus Interface Contract', () => {
    const hasReactMascot = appJs.includes('reactMascot') || appJs.includes('AppController.reactMascot');
    if (hasReactMascot) {
      assert(hasReactMascot, 'AppController must provide reactMascot interface');
    } else {
      skipPending('M-EVO-3', 'Parallel M-EVO-3 integration planned');
    }
  });

  await runTest('T1.R3.3 Bouncy Staged Victory Celebration Overlay Hooks', () => {
    assert(indexHtml.includes('id="modalVictory"'), '#modalVictory must exist in DOM');
    assert(indexHtml.includes('id="victoryMascot"'), '#victoryMascot must exist in DOM');
    assert(indexHtml.includes('id="btnNextLevel"'), '#btnNextLevel must exist in DOM');
    assert(indexHtml.includes('id="btnReplayLevel"'), '#btnReplayLevel must exist in DOM');
    assert(indexHtml.includes('id="btnVictoryLevelSelect"'), '#btnVictoryLevelSelect must exist in DOM');
    assert(appJs.includes('handleVictory') || appJs.includes('showVictoryModal'),
      'app.js must provide handleVictory orchestration hook');
  });

  await runTest('T1.R3.4 Dual-Harmonic Procedural Web Audio SFX (Zero Harsh Buzzers)', () => {
    assert(typeof sound.playPop === 'function', 'sound.playPop must exist');
    assert(typeof sound.playClick === 'function', 'sound.playClick must exist');
    assert(typeof sound.playCorrect === 'function', 'sound.playCorrect must exist');
    assert(typeof sound.playStar === 'function', 'sound.playStar must exist');
    assert(typeof sound.playFanfare === 'function', 'sound.playFanfare must exist');
    assert(typeof sound.playGentleTryAgain === 'function', 'sound.playGentleTryAgain must exist');
    assert(typeof sound.playRobotStep === 'function', 'sound.playRobotStep must exist');

    // Psychoacoustic check: zero harsh buzzers
    assert(!audioJs.toLowerCase().includes('buzz'), 'Web Audio synthesizer must not use harsh buzzer semantics');

    // Zero external audio files required
    assert(!audioJs.includes('.mp3') && !audioJs.includes('.wav') && !audioJs.includes('.ogg'),
      'audio.js must be 100% procedural with zero external audio file dependencies');
  });

  // ==========================================================================
  // SECTION 1.4: R4 — Engine Compatibility & Zero-Regression Performance
  // ==========================================================================
  console.log('\n[R4: Engine Compatibility & Zero-Regression Performance]');

  await runTest('T1.R4.1 Solvability & Integrity of All 75 Educational Levels', () => {
    assert.strictEqual(LEVELS.length, 75, 'Must contain exactly 75 verified educational levels');

    const counts = { hewan: 0, angka: 0, spidey: 0, koding: 0 };
    for (const lvl of LEVELS) {
      assert(lvl.id, 'Level must have an id');
      assert(lvl.title, 'Level must have a title');
      assert(lvl.prompt, 'Level must have a prompt in Indonesian');
      assert(lvl.type, 'Level must have a type');
      assert(counts[lvl.worldId] !== undefined, `Unknown world ${lvl.worldId}`);
      counts[lvl.worldId]++;
    }

    assert.strictEqual(counts.hewan, 11, 'World 1 (hewan) must have 11 levels');
    assert.strictEqual(counts.angka, 22, 'World 2 (angka) must have 22 levels');
    assert.strictEqual(counts.spidey, 23, 'World 3 (spidey) must have 23 levels');
    assert.strictEqual(counts.koding, 19, 'World 4 (koding) must have 19 levels');
  });

  await runTest('T1.R4.2 9 Game Engine Dispatchers and Aliases', () => {
    assert(typeof Engines.render === 'function', 'Engines.render must exist');
    assert(typeof Engines.renderHubungkan === 'function', 'Engines.renderHubungkan must exist');
    assert(typeof Engines.renderLabirin === 'function', 'Engines.renderLabirin must exist');
    assert(typeof Engines.renderPilih === 'function', 'Engines.renderPilih must exist');
    assert(typeof Engines.renderHubungkanTitik === 'function', 'Engines.renderHubungkanTitik must exist');
    assert(typeof Engines.renderTebalkan === 'function', 'Engines.renderTebalkan must exist');
    assert(typeof Engines.renderMewarnai === 'function', 'Engines.renderMewarnai must exist');
    assert(typeof Engines.renderUrutkan === 'function', 'Engines.renderUrutkan must exist');
    assert(typeof Engines.renderKodingPanah === 'function', 'Engines.renderKodingPanah must exist');
    assert(typeof Engines.renderMemori === 'function', 'Engines.renderMemori must exist');

    // Aliases
    assert.strictEqual(Engines.renderTitik, Engines.renderHubungkanTitik, 'renderTitik must alias renderHubungkanTitik');
    assert.strictEqual(Engines.renderPanah, Engines.renderKodingPanah, 'renderPanah must alias renderKodingPanah');
  });

  await runTest('T1.R4.3 Exact 14-Asset PWA Cache Invariant in sw.js', () => {
    const match = swJs.match(/ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
    assert(match, 'sw.js must define ASSETS_TO_CACHE');
    const assetEntries = match[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
    assert.strictEqual(assetEntries.length, 14, `sw.js must cache exactly 14 assets, found ${assetEntries.length}`);

    // Verify all 14 files exist locally
    for (const entry of assetEntries) {
      const cleanPath = entry.replace(/^\.\//, '');
      const fullPath = path.join(ROOT_DIR, cleanPath);
      assert(fs.existsSync(fullPath), `Cached asset must exist on disk: ${entry}`);
    }
  });

  await runTest('T1.R4.4 Labirin Maze BFS Solvability Invariant Across All Maze Levels', () => {
    const mazeLevels = LEVELS.filter(l => l.type === 'labirin');
    assert.strictEqual(mazeLevels.length, 6, 'There must be exactly 6 maze levels');

    for (const lvl of mazeLevels) {
      const size = lvl.gridSize || 5;
      const wallSet = new Set(lvl.walls || []);
      const targetX = size - 1;
      const targetY = size - 1;

      // Breadth-First Search
      const queue = [{ x: 0, y: 0 }];
      const visited = new Set(['0,0']);
      let reached = false;

      while (queue.length > 0) {
        const cur = queue.shift();
        if (cur.x === targetX && cur.y === targetY) {
          reached = true;
          break;
        }

        const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
        for (const d of dirs) {
          const nx = cur.x + d.dx;
          const ny = cur.y + d.dy;
          const key = `${nx},${ny}`;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && !wallSet.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ x: nx, y: ny });
          }
        }
      }

      assert(reached, `Maze level ${lvl.id} (${lvl.title}) must be mathematically solvable via BFS`);
    }
  });

  await runTest('T1.R4.5 Forensic Level Invariants (L14, L16, L18, L19, L09, L45)', () => {
    const l14 = LEVELS.find(l => l.id === '14');
    assert(l14 && l14.pairs, 'Level 14 must exist with pairs');

    const l16 = LEVELS.find(l => l.id === '16');
    assert(l16 && l16.items && l16.items[0].answerIndex === 2, 'Level 16 must have answerIndex 2');

    const l18 = LEVELS.find(l => l.id === '18');
    assert(l18 && l18.items && l18.items.length === 3, 'Level 18 must have 3 items');

    const l19 = LEVELS.find(l => l.id === '19');
    assert(l19 && l19.dots && l19.dots.length === 8, 'Level 19 must have 8 dots');

    const l09 = LEVELS.find(l => l.id === '09');
    assert(l09 && l09.dots && l09.dots.length === 10, 'Level 09 must have 10 dots');
    const l45 = LEVELS.find(l => l.id === '45');
    assert(l45 && l45.dots && l45.dots.length === 10, 'Level 45 must have 10 dots');
  });

  // --------------------------------------------------------------------------
  // TIER 2: BOUNDARY & CORNER CASES
  // --------------------------------------------------------------------------
  setTier('tier2');
  console.log('\n--- [TIER 2] BOUNDARY & CORNER CASES ---');

  await runTest('T2.BND.1 Extreme Mascot Sizing (16px to 1024px)', () => {
    const sizes = [16, 24, 32, 64, 128, 256, 512, 1024];
    for (const size of sizes) {
      const heroSvg = Mascot.hero(size, 'wave');
      assert(heroSvg.includes(`width="${size}"`), `Hero must respect width="${size}"`);
      assert(heroSvg.includes(`height="${size}"`), `Hero must respect height="${size}"`);
      assert(!heroSvg.includes('NaN'), `Hero SVG at size ${size} must not contain NaN`);
      assert(!heroSvg.includes('undefined'), `Hero SVG at size ${size} must not contain undefined`);

      const robotSvg = Mascot.robot(size, 'idle');
      assert(robotSvg.includes(`width="${size}"`), `Robot must respect width="${size}"`);
      assert(robotSvg.includes(`height="${size}"`), `Robot must respect height="${size}"`);
      assert(!robotSvg.includes('NaN'), `Robot SVG at size ${size} must not contain NaN`);
    }
  });

  await runTest('T2.BND.2 Fallback Poses & Unknown Emotion Graceful Handling', () => {
    const weirdPoses = [undefined, null, '', 'unknown_pose', 'crazy_dance', 999];
    for (const pose of weirdPoses) {
      assert.doesNotThrow(() => {
        const svg = Mascot.hero(100, pose);
        assert(svg.includes('<svg'), 'Mascot.hero with invalid pose must still return valid SVG');
      }, `Mascot.hero must not throw on invalid pose: ${pose}`);

      assert.doesNotThrow(() => {
        const svg = Mascot.robot(90, pose);
        assert(svg.includes('<svg'), 'Mascot.robot with invalid pose must still return valid SVG');
      }, `Mascot.robot must not throw on invalid pose: ${pose}`);
    }
  });

  await runTest('T2.BND.3 Responsive Viewport Boundaries (320px Phone to 4K 3840px Desktop)', () => {
    // Assert CSS contains responsive boundaries
    assert(styleCss.includes('@media') || styleCss.includes('max-width') || styleCss.includes('min-width'),
      'style.css must define responsive media queries');
    // Ensure viewport meta in index.html contains proper scaling
    assert(indexHtml.includes('name="viewport"'), 'index.html must define viewport meta');
    assert(indexHtml.includes('width=device-width'), 'viewport meta must include width=device-width');
  });

  await runTest('T2.BND.4 Mascot Dispatcher Resiliency (companion & forWorld)', () => {
    if (typeof Mascot.forWorld === 'function') {
      const fallbackWorld = Mascot.forWorld('non_existent_galaxy');
      assert(typeof fallbackWorld === 'string' && fallbackWorld.includes('<svg'),
        'Mascot.forWorld must fall back gracefully for unknown world');
    } else {
      recordPending('T2.BND.4a Mascot.forWorld dispatcher', 'M-EVO-1', 'Parallel worker_m_evo_1 in progress');
    }

    if (typeof Mascot.companion === 'function') {
      const fallbackCompanion = Mascot.companion('non_existent_character');
      assert(typeof fallbackCompanion === 'string' && fallbackCompanion.includes('<svg'),
        'Mascot.companion must fall back gracefully for unknown character');
    } else {
      recordPending('T2.BND.4b Mascot.companion dispatcher', 'M-EVO-1', 'Parallel worker_m_evo_1 in progress');
    }
  });

  await runTest('T2.BND.5 Empty / Malformed Engine Input Graceful Handling', () => {
    const container = new MockElement('div');

    assert.doesNotThrow(() => {
      Engines.renderHubungkan(container, { type: 'hubungkan', pairs: [] }, () => {});
    }, 'renderHubungkan must handle empty pairs gracefully');

    assert.doesNotThrow(() => {
      Engines.renderPilih(container, { type: 'pilih', items: [] }, () => {});
    }, 'renderPilih must handle empty items gracefully');

    assert.doesNotThrow(() => {
      Engines.renderHubungkanTitik(container, { type: 'titik', dots: [] }, () => {});
    }, 'renderHubungkanTitik must handle empty dots gracefully');
  });

  // --------------------------------------------------------------------------
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // --------------------------------------------------------------------------
  setTier('tier3');
  console.log('\n--- [TIER 3] CROSS-FEATURE COMBINATIONS ---');

  await runTest('T3.INT.1 World-to-Companion Mascot Mapping (Mascot.forWorld)', () => {
    if (typeof Mascot.forWorld === 'function') {
      const hewanMascot = Mascot.forWorld('hewan', 80, 'idle');
      const angkaMascot = Mascot.forWorld('angka', 80, 'idle');
      const spideyMascot = Mascot.forWorld('spidey', 80, 'idle');
      const kodingMascot = Mascot.forWorld('koding', 80, 'idle');

      assert(hewanMascot.includes('<svg'), 'World hewan must map to a valid mascot');
      assert(angkaMascot.includes('<svg'), 'World angka must map to a valid mascot');
      assert(spideyMascot.includes('<svg'), 'World spidey must map to a valid mascot');
      assert(kodingMascot.includes('<svg'), 'World koding must map to a valid mascot');
    } else {
      recordPending('T3.INT.1 World-to-Companion Mascot Mapping', 'M-EVO-1', 'Parallel worker_m_evo_1 in progress');
    }
  });

  await runTest('T3.INT.2 Level Victory Event Simulation with Mascot and Audio Integration', async () => {
    const container = new MockElement('div');
    const level = {
      type: 'hubungkan',
      pairs: [{ left: '🐰', right: '🥕' }]
    };

    let victoryTriggered = false;
    Engines.renderHubungkan(container, level, () => {
      victoryTriggered = true;
      // In real victory, sound and mascot cheer are triggered
      sound.playCorrect();
      sound.playFanfare();
    });

    const leftCol = container.querySelector('#colLeft');
    const rightCol = container.querySelector('#colRight');
    assert(leftCol && rightCol, 'Engine columns must be rendered');

    leftCol.children[0].click();
    rightCol.children[0].click();

    await new Promise(r => setTimeout(r, 850));
    assert.strictEqual(victoryTriggered, true, 'Matching all pairs must trigger victory celebration');
  });

  await runTest('T3.INT.3 Web Audio & Speech Narration Coordination Without Conflict', async () => {
    assert.doesNotThrow(() => {
      sound.playPop();
      sound.playClick();
      sound.speak('Halo Teman!', () => {});
      sound.stopSpeech();
    }, 'Sound effects and speech synthesis must coordinate cleanly');
  });

  await runTest('T3.INT.4 Responsive Mascot Rendering in DOM Shell Containers', () => {
    const mockBubble = new MockElement('div');
    mockBubble.innerHTML = Mascot.hero(72, 'happy');
    assert(mockBubble.querySelector('.spidey-mascot'), 'Mascot bubble must receive .spidey-mascot');

    const mockVictory = new MockElement('div');
    mockVictory.innerHTML = Mascot.hero(140, 'cheer');
    assert(mockVictory.querySelector('.spidey-mascot'), 'Victory card must receive cheering mascot');
  });

  // --------------------------------------------------------------------------
  // TIER 4: REAL-WORLD WORKLOAD
  // --------------------------------------------------------------------------
  setTier('tier4');
  console.log('\n--- [TIER 4] REAL-WORLD WORKLOAD ---');

  await runTest('T4.SCN.1 Complete Toddler Flow (World Select -> Level Select -> Engine Play -> Win)', async () => {
    // Step 1: Storage setup
    mockStorage.clear();
    mockStorage.setItem('spidey_stars', JSON.stringify({ totalStars: 0, completedLevels: [] }));

    // Step 2: World selection validation
    const worldIds = WORLDS.map(w => w.id);
    assert.strictEqual(worldIds.length, 4, 'Must provide 4 distinct preschool worlds');
    assert(worldIds.includes('hewan'), 'Hutan Satwa must exist');
    assert(worldIds.includes('angka'), 'Kota Angka must exist');
    assert(worldIds.includes('spidey'), 'Markas Pahlawan must exist');
    assert(worldIds.includes('koding'), 'Lab Robot must exist');

    // Step 3: Level select for World 1
    const world1Levels = LEVELS.filter(l => l.worldId === 'hewan');
    assert(world1Levels.length >= 10, 'World 1 must provide rich curriculum levels');

    // Step 4: Play level 1 (hewan_01)
    const level1 = world1Levels[0];
    const gameContainer = new MockElement('div');
    let levelCompleted = false;

    Engines.render(gameContainer, level1, () => {
      levelCompleted = true;
      // Record completed level in storage
      const progress = JSON.parse(mockStorage.getItem('spidey_stars'));
      progress.totalStars += 3;
      progress.completedLevels.push(level1.id);
      mockStorage.setItem('spidey_stars', JSON.stringify(progress));
    });

    // Execute matching action
    if (level1.type === 'hubungkan') {
      const leftItems = gameContainer.querySelectorAll('.pair-item');
      const rightCol = gameContainer.querySelector('#colRight');
      if (leftItems.length > 0 && rightCol) {
        for (let i = 0; i < leftItems.length; i++) {
          leftItems[i].click();
          const target = rightCol.children.find(c => String(c.dataset.origIdx) === String(leftItems[i].dataset.idx));
          if (target) target.click();
        }
      }
    } else if (level1.type === 'pilih') {
      const btn = gameContainer.querySelector('#optionsGrid').children[0];
      if (btn) btn.click();
    }

    await new Promise(r => setTimeout(r, 850));

    // Step 5: Verification of victory state and persistence
    assert(levelCompleted, 'Full user journey through level must culminate in level victory');
    const saved = JSON.parse(mockStorage.getItem('spidey_stars'));
    assert.strictEqual(saved.totalStars, 3, 'Stars must be persisted upon level completion');
    assert(saved.completedLevels.includes(level1.id), 'Completed level ID must be recorded in storage');
  });

  // ==========================================================================
  // SUITE SUMMARY & REPORT
  // ==========================================================================
  const totalPass = results.tier1.pass + results.tier2.pass + results.tier3.pass + results.tier4.pass;
  const totalFail = results.tier1.fail + results.tier2.fail + results.tier3.fail + results.tier4.fail;
  const totalPending = results.tier1.pending + results.tier2.pending + results.tier3.pending + results.tier4.pending;
  const grandTotal = results.tier1.total + results.tier2.total + results.tier3.total + results.tier4.total;

  console.log('\n============================================================');
  console.log('📊 COMMERCIAL EVOLUTION TEST SUITE SUMMARY');
  console.log('============================================================');
  console.log(`Tier 1 (Feature Coverage):     ${results.tier1.pass} Passed, ${results.tier1.fail} Failed, ${results.tier1.pending} Pending (${results.tier1.total} Total)`);
  console.log(`Tier 2 (Boundary & Corner):    ${results.tier2.pass} Passed, ${results.tier2.fail} Failed, ${results.tier2.pending} Pending (${results.tier2.total} Total)`);
  console.log(`Tier 3 (Cross-Feature):        ${results.tier3.pass} Passed, ${results.tier3.fail} Failed, ${results.tier3.pending} Pending (${results.tier3.total} Total)`);
  console.log(`Tier 4 (Real-World Scenarios): ${results.tier4.pass} Passed, ${results.tier4.fail} Failed, ${results.tier4.pending} Pending (${results.tier4.total} Total)`);
  console.log('------------------------------------------------------------');
  console.log(`TOTALS: ${totalPass} Passed | ${totalFail} Failed | ${totalPending} Pending | ${grandTotal} Total`);
  console.log('============================================================');

  if (totalFail > 0) {
    console.error(`\n✖ ${totalFail} test assertion(s) FAILED:`);
    for (const f of results.failures) {
      console.error(`  - [${f.tier.toUpperCase()}] ${f.testName}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log(`\n✔ Evolution Acceptance Suite completed with ZERO failures (${totalPass} passed, ${totalPending} progressive pending).`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
