// tests/challenger_m5_viewport_stress.mjs
// Adversarial Empirical Stress Suite for Milestone 5:
// Responsive Viewports (390x844, 800x1280, 1024x768), Touch Ergonomics (>=64px), and PWA Offline Cache (13 Assets)
// Zero external dependencies - executable via `node tests/challenger_m5_viewport_stress.mjs`

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

async function challenge(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    testResults.push({ name, status: 'PASS' });
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    testResults.push({ name, status: 'FAIL', error: err.message });
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('⚡ CHALLENGER M5-2: EMPIRICAL VIEWPORT, TOUCH & OFFLINE STRESS');
console.log('Testing 390x844, 800x1280, 1024x768, Touch >= 64px, PWA 13 Assets');
console.log('================================================================\n');

// Load Core Project Artifacts
const swPath = path.join(ROOT_DIR, 'sw.js');
const manifestPath = path.join(ROOT_DIR, 'manifest.webmanifest');
const indexPath = path.join(ROOT_DIR, 'index.html');
const stylePath = path.join(ROOT_DIR, 'style.css');

const swContent = fs.readFileSync(swPath, 'utf8');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const styleContent = fs.readFileSync(stylePath, 'utf8');

// Dynamic Imports
const { LEVELS, WORLDS } = await import('../levels.js');
const { Engines } = await import('../engines.js');
const { sound } = await import('../audio.js');
const { Mascot } = await import('../mascot.js');

// ============================================================================
// SUITE 1: PWA OFFLINE CACHE COMPLETENESS (13 ASSETS) & SERVICE WORKER INTEGRITY
// ============================================================================
console.log('[Suite 1: PWA Offline Cache Completeness (13 Assets) & SW Integrity]');

// 1.1 Parse ASSETS_TO_CACHE
function extractPreCacheList(code) {
  const match = code.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error('Could not find ASSETS_TO_CACHE in sw.js');
  return match[1]
    .split(',')
    .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

const preCacheAssets = extractPreCacheList(swContent);

await challenge('1.1 Exact 14 assets defined in sw.js ASSETS_TO_CACHE', () => {
  assert.strictEqual(
    preCacheAssets.length,
    14,
    `Expected exactly 14 assets in ASSETS_TO_CACHE, but got ${preCacheAssets.length}: ${JSON.stringify(preCacheAssets)}`
  );
});

await challenge('1.2 Physical existence and non-zero size for all 14 cached assets', () => {
  const expectedItems = [
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

  for (const exp of expectedItems) {
    assert(preCacheAssets.includes(exp), `Asset ${exp} missing from ASSETS_TO_CACHE list`);
    const resolvedPath = exp === './' ? path.join(ROOT_DIR, 'index.html') : path.join(ROOT_DIR, exp.replace(/^\.\//, ''));
    assert(fs.existsSync(resolvedPath), `Cached file does not physically exist: ${resolvedPath}`);
    const stat = fs.statSync(resolvedPath);
    assert(stat.size > 0, `Cached file is empty (0 bytes): ${resolvedPath}`);
  }
});

await challenge('1.3 Zero un-cached local assets or remote CDN leaks in index.html', () => {
  const linkHrefs = [...indexContent.matchAll(/<link\s+[^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
  const scriptSrcs = [...indexContent.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)].map(m => m[1]);
  const imgSrcs = [...indexContent.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi)].map(m => m[1]);

  const allRefs = [...new Set([...linkHrefs, ...scriptSrcs, ...imgSrcs])];
  const normalizedCacheList = preCacheAssets.map(p => p.replace(/^\.\//, ''));

  for (const ref of allRefs) {
    assert(!ref.startsWith('http://') && !ref.startsWith('https://'), `Remote leak in index.html: ${ref}`);
    const norm = ref.replace(/^\.\//, '');
    assert(normalizedCacheList.includes(norm), `index.html references un-cached asset: ${ref}`);
  }
});

await challenge('1.4 Manifest icons match cached icons and are valid SVG vectors', () => {
  const manifest = JSON.parse(manifestContent);
  assert(Array.isArray(manifest.icons), 'manifest must have icons array');
  assert(manifest.icons.length >= 3, 'manifest must have at least 3 icons');

  for (const icon of manifest.icons) {
    const normSrc = './' + icon.src.replace(/^\.\//, '').replace(/^\//, '');
    assert(preCacheAssets.includes(normSrc), `Manifest icon ${icon.src} not in ASSETS_TO_CACHE`);

    const iconPath = path.join(ROOT_DIR, icon.src.replace(/^\.\//, '').replace(/^\//, ''));
    assert(fs.existsSync(iconPath), `Manifest icon file does not exist: ${iconPath}`);

    const svgContent = fs.readFileSync(iconPath, 'utf8');
    assert(svgContent.includes('<svg') && svgContent.includes('</svg>'), `Icon ${icon.src} is not valid SVG`);
  }
});

await challenge('1.5 Service worker simulation: pre-cache, cache match, offline navigation fallback', async () => {
  const cacheStorage = new Map();
  const mockCache = {
    addAll: async (urls) => {
      for (const u of urls) {
        cacheStorage.set(u, { status: 200, body: 'cached-content:' + u });
      }
    },
    match: async (req) => {
      const url = typeof req === 'string' ? req : req.url;
      return cacheStorage.get(url) || null;
    },
    put: async (req, resp) => {
      const url = typeof req === 'string' ? req : req.url;
      cacheStorage.set(url, resp);
    }
  };

  // Precache
  await mockCache.addAll(preCacheAssets);
  assert.strictEqual(cacheStorage.size, 14, 'Expected 14 items in cache storage');

  // Cache hit
  const hit = await mockCache.match('./style.css');
  assert(hit && hit.status === 200, 'Expected cache hit for ./style.css');

  // Offline fallback simulation
  const reqModeNavigate = { url: './unknown-page', mode: 'navigate' };
  let fallbackResponse = await mockCache.match(reqModeNavigate);
  if (!fallbackResponse && reqModeNavigate.mode === 'navigate') {
    fallbackResponse = await mockCache.match('./index.html');
  }
  assert(fallbackResponse && fallbackResponse.status === 200, 'Offline navigate request must fallback to ./index.html');
});

// ============================================================================
// SUITE 2: TOUCH ERGONOMICS & MINIMUM TARGET SIZES (>= 64px)
// ============================================================================
console.log('\n[Suite 2: Touch Ergonomics & Minimum Target Sizes (>= 64px)]');

// Parse CSS declarations
function parseCssRules(css) {
  const rules = [];
  const regex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    rules.push({ selector, body });
  }
  return rules;
}

const parsedRules = parseCssRules(styleContent);

function getPropertyValues(selectorSnippet, propName) {
  const values = [];
  for (const r of parsedRules) {
    if (r.selector.includes(selectorSnippet)) {
      const propRegex = new RegExp(`(?<![a-z-])${propName}\\s*:\\s*([^;]+);`, 'gi');
      let pm;
      while ((pm = propRegex.exec(r.body)) !== null) {
        values.push({ selector: r.selector, value: pm[1].trim() });
      }
    }
  }
  return values;
}

await challenge('2.1 Primary root touch ergonomics variables defined >= 64px', () => {
  const touchMin = styleContent.match(/--touch-min:\s*(\d+)px/);
  const touchJumbo = styleContent.match(/--touch-jumbo:\s*(\d+)px/);

  assert(touchMin, 'style.css must define --touch-min');
  assert(touchJumbo, 'style.css must define --touch-jumbo');

  const minVal = parseInt(touchMin[1], 10);
  const jumboVal = parseInt(touchJumbo[1], 10);

  assert(minVal >= 64, `--touch-min must be >= 64px, got ${minVal}px`);
  assert(jumboVal >= 80, `--touch-jumbo must be >= 80px, got ${jumboVal}px`);
});

await challenge('2.2 Jumbo Speaker Button (🔊) touch size >= 64px across desktop & mobile', () => {
  const widths = getPropertyValues('.jumbo-speaker-btn', 'width');
  const heights = getPropertyValues('.jumbo-speaker-btn', 'height');
  const minWidths = getPropertyValues('.jumbo-speaker-btn', 'min-width');
  const minHeights = getPropertyValues('.jumbo-speaker-btn', 'min-height');

  assert(widths.length > 0 && heights.length > 0, 'jumbo-speaker-btn dimensions must be defined');

  // Check every explicit width/height
  for (const w of widths) {
    const val = parseInt(w.value, 10);
    assert(val >= 64, `Speaker button width in ${w.selector} is ${w.value} (< 64px)`);
  }
  for (const h of heights) {
    const val = parseInt(h.value, 10);
    assert(val >= 64, `Speaker button height in ${h.selector} is ${h.value} (< 64px)`);
  }
  for (const mw of minWidths) {
    const val = parseInt(mw.value, 10);
    assert(val >= 64, `Speaker button min-width in ${mw.selector} is ${mw.value} (< 64px)`);
  }
});

await challenge('2.3 World Cards and Level Cards touch dimensions >= 64px', () => {
  const worldCardsMinH = getPropertyValues('.world-card', 'min-height');
  assert(worldCardsMinH.length > 0, 'world-card min-height must be defined');
  assert(parseInt(worldCardsMinH[0].value, 10) >= 120, `world-card min-height is ${worldCardsMinH[0].value}`);

  const lvlCardMinH = getPropertyValues('.level-card', 'min-height');
  const lvlCardMinW = getPropertyValues('.level-card', 'min-width');
  assert(parseInt(lvlCardMinH[0].value, 10) >= 64, `level-card min-height is ${lvlCardMinH[0].value}`);
  assert(lvlCardMinW[0].value.includes('touch-min') || parseInt(lvlCardMinW[0].value, 10) >= 64, 'level-card min-width must be >= 64px');
});

await challenge('2.4 Engine 1 (Hubungkan) Pair item cards touch targets >= 64px', () => {
  const pairMinH = getPropertyValues('.pair-item', 'min-height');
  const pairMinW = getPropertyValues('.pair-item', 'min-width');
  assert(pairMinH.length > 0, 'pair-item min-height must be defined');
  assert(parseInt(pairMinH[0].value, 10) >= 64, `pair-item min-height is ${pairMinH[0].value} (< 64px)`);
  assert(pairMinW[0].value.includes('touch-min') || parseInt(pairMinW[0].value, 10) >= 64, 'pair-item min-width must be >= 64px');
});

await challenge('2.5 Engine 2 (Labirin) D-pad navigation buttons >= 64px', () => {
  const navW = getPropertyValues('.nav-btn', 'width');
  const navH = getPropertyValues('.nav-btn', 'height');
  const navMinW = getPropertyValues('.nav-btn', 'min-width');
  const navMinH = getPropertyValues('.nav-btn', 'min-height');

  assert(navW.length > 0 && navH.length > 0, 'nav-btn dimensions must be defined');
  assert(parseInt(navW[0].value, 10) >= 64, `nav-btn width is ${navW[0].value} (< 64px)`);
  assert(parseInt(navH[0].value, 10) >= 64, `nav-btn height is ${navH[0].value} (< 64px)`);
  assert(navMinW[0].value.includes('touch-min') || parseInt(navMinW[0].value, 10) >= 64, 'nav-btn min-width must be >= 64px');
  assert(navMinH[0].value.includes('touch-min') || parseInt(navMinH[0].value, 10) >= 64, 'nav-btn min-height must be >= 64px');
});

await challenge('2.6 Engine 3 (Pilih) Choice cards and math choice buttons >= 64px', () => {
  const choiceMinH = getPropertyValues('.choice-btn', 'min-height');
  const choiceMinW = getPropertyValues('.choice-btn', 'min-width');
  assert(parseInt(choiceMinH[0].value, 10) >= 64, `choice-btn min-height is ${choiceMinH[0].value} (< 64px)`);
  assert(choiceMinW[0].value.includes('touch-min') || parseInt(choiceMinW[0].value, 10) >= 64, 'choice-btn min-width must be >= 64px');

  const mathMinH = getPropertyValues('.math-choice-btn', 'min-height');
  const mathMinW = getPropertyValues('.math-choice-btn', 'min-width');
  assert(parseInt(mathMinH[0].value, 10) >= 64, `math-choice-btn min-height is ${mathMinH[0].value} (< 64px)`);
  assert(mathMinW[0].value.includes('touch-min') || parseInt(mathMinW[0].value, 10) >= 64, 'math-choice-btn min-width must be >= 64px');
});

await challenge('2.7 Engine 5 (Tebalkan) & Engine 7 (Urutkan) Action buttons and slots >= 64px', () => {
  const traceClearMinH = getPropertyValues('.trace-clear-btn', 'min-height');
  const traceClearMinW = getPropertyValues('.trace-clear-btn', 'min-width');
  assert(parseInt(traceClearMinH[0].value, 10) >= 64, `trace button min-height is ${traceClearMinH[0].value}`);
  assert(parseInt(traceClearMinW[0].value, 10) >= 64, `trace button min-width is ${traceClearMinW[0].value}`);

  const orderSlotMinW = getPropertyValues('.order-slot', 'min-width');
  const orderSlotMinH = getPropertyValues('.order-slot', 'min-height');
  assert(parseInt(orderSlotMinW[0].value, 10) >= 64, `order-slot min-width is ${orderSlotMinW[0].value}`);
  assert(parseInt(orderSlotMinH[0].value, 10) >= 64, `order-slot min-height is ${orderSlotMinH[0].value}`);

  const orderItemMinW = getPropertyValues('.order-item-btn', 'min-width');
  const orderItemMinH = getPropertyValues('.order-item-btn', 'min-height');
  assert(parseInt(orderItemMinW[0].value, 10) >= 64, `order-item-btn min-width is ${orderItemMinW[0].value}`);
  assert(parseInt(orderItemMinH[0].value, 10) >= 64, `order-item-btn min-height is ${orderItemMinH[0].value}`);
});

await challenge('2.8 Engine 8 (Panah) Command buttons, Run/Reset & Engine 9 (Memori) Cards >= 64px', () => {
  const arrowW = getPropertyValues('.arrow-cmd-btn', 'width');
  const arrowH = getPropertyValues('.arrow-cmd-btn', 'height');
  assert(parseInt(arrowW[0].value, 10) >= 64, `arrow-cmd-btn width is ${arrowW[0].value}`);
  assert(parseInt(arrowH[0].value, 10) >= 64, `arrow-cmd-btn height is ${arrowH[0].value}`);

  const progMinH = getPropertyValues('#runProgBtn', 'min-height');
  assert(parseInt(progMinH[0].value, 10) >= 64, `run/reset program button min-height is ${progMinH[0].value}`);

  const memMinW = getPropertyValues('.memory-card', 'min-width');
  const memMinH = getPropertyValues('.memory-card', 'min-height');
  assert(parseInt(memMinW[0].value, 10) >= 64, `memory-card min-width is ${memMinW[0].value}`);
  assert(parseInt(memMinH[0].value, 10) >= 64, `memory-card min-height is ${memMinH[0].value}`);
});

await challenge('2.9 Secondary control buttons satisfy WCAG touch minimum >= 44px', () => {
  const headerMinW = getPropertyValues('.header-btn', 'min-width');
  const headerMinH = getPropertyValues('.header-btn', 'min-height');
  assert(parseInt(headerMinW[0].value, 10) >= 44, `header-btn min-width is ${headerMinW[0].value} (< 44px)`);
  assert(parseInt(headerMinH[0].value, 10) >= 44, `header-btn min-height is ${headerMinH[0].value} (< 44px)`);

  const swatchMinW = getPropertyValues('.color-swatch', 'min-width');
  const swatchMinH = getPropertyValues('.color-swatch', 'min-height');
  assert(parseInt(swatchMinW[0].value, 10) >= 44, `color-swatch min-width is ${swatchMinW[0].value} (< 44px)`);
  assert(parseInt(swatchMinH[0].value, 10) >= 44, `color-swatch min-height is ${swatchMinH[0].value} (< 44px)`);

  const dotNodeW = getPropertyValues('.dot-node', 'width');
  const dotNodeH = getPropertyValues('.dot-node', 'height');
  assert(parseInt(dotNodeW[0].value, 10) >= 44, `dot-node width is ${dotNodeW[0].value} (< 44px)`);
  assert(parseInt(dotNodeH[0].value, 10) >= 44, `dot-node height is ${dotNodeH[0].value} (< 44px)`);
});

// ============================================================================
// SUITE 3: RESPONSIVE VIEWPORT CONSTRAINTS (390x844, 800x1280, 1024x768)
// ============================================================================
console.log('\n[Suite 3: Responsive Viewport Constraints (390x844, 800x1280, 1024x768)]');

await challenge('3.1 Viewport meta tag properly configured for mobile/tablet responsive scaling', () => {
  const viewportMatch = indexContent.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
  assert(viewportMatch, 'index.html must have a viewport meta tag');
  const content = viewportMatch[1];
  assert(content.includes('width=device-width'), 'viewport meta must include width=device-width');
  assert(content.includes('initial-scale=1.0') || content.includes('initial-scale=1'), 'viewport meta must include initial-scale=1');
  assert(content.includes('viewport-fit=cover'), 'viewport meta should include viewport-fit=cover for notch/island support');
});

await challenge('3.2 Global overflow-x: hidden prevents unintentional horizontal scrolling on phone (390px)', () => {
  assert(
    styleContent.includes('overflow-x: hidden'),
    'Global CSS must enforce overflow-x: hidden on html/body'
  );
  assert(
    styleContent.includes('box-sizing: border-box'),
    'Universal reset must apply box-sizing: border-box'
  );
});

await challenge('3.3 Phone Portrait (390x844) Layout Constraints Check', () => {
  // Check for fixed pixel widths that could exceed 390px
  const fixedWidthRegex = /([^{}]+)\{([^{}]+)\}/g;
  let m;
  const offendingRules = [];
  while ((m = fixedWidthRegex.exec(styleContent)) !== null) {
    const sel = m[1].trim();
    const body = m[2].trim();
    // Ignore print media query
    if (sel.includes('@media print')) continue;
    const wMatch = body.match(/(?<![a-z-])width:\s*(\d+)px/i);
    if (wMatch) {
      const px = parseInt(wMatch[1], 10);
      if (px > 360) {
        offendingRules.push({ sel, px });
      }
    }
  }

  assert.strictEqual(
    offendingRules.length,
    0,
    `Found CSS selectors with fixed width > 360px that could overflow 390px phone: ${JSON.stringify(offendingRules)}`
  );

  // Verify mobile media query collapses two-column layouts to single-column
  assert(styleContent.includes('@media (max-width: 480px)'), 'Mobile media query (max-width: 480px) must exist');
  assert(styleContent.includes('.pairs-grid'), 'pairs-grid must be styled');
  assert(styleContent.includes('.options-grid'), 'options-grid must be styled');
});

await challenge('3.4 Canvas & Graphic containers scale safely within 390px phone width', () => {
  // Check canvas wrappers (traceCanvas, titik-canvas-wrapper)
  const traceBoxW = styleContent.match(/\.canvas-wrapper[^{]*\{[^}]*width:\s*(\d+)px/);
  assert(traceBoxW, 'Canvas wrapper width must be explicitly defined');
  const traceW = parseInt(traceBoxW[1], 10);
  assert(traceW <= 350, `Trace canvas width (${traceW}px) must be <= 350px to fit in 390px screen with margins`);
  assert(styleContent.includes('max-width: 100%'), 'Canvas wrapper must declare max-width: 100%');
});

await challenge('3.5 Tablet Portrait (800x1280) Multi-column Expansion Check', () => {
  assert(styleContent.includes('@media (min-width: 768px)'), 'Tablet breakpoint @media (min-width: 768px) must exist');
  
  // Verify worlds-grid expands to 2 columns on tablet
  const tabletBlock = styleContent.slice(styleContent.indexOf('@media (min-width: 768px)'));
  assert(tabletBlock.includes('.worlds-grid'), 'Tablet media query must format worlds-grid');
  assert(tabletBlock.includes('grid-template-columns: repeat(2, 1fr)'), 'worlds-grid must use 2 columns on tablet');
});

await challenge('3.6 Tablet Landscape (1024x768) App-Root Width Capping & Spacing Check', () => {
  const rootMaxW = styleContent.match(/\.app-root\s*\{[^}]*max-width:\s*(\d+)px/);
  assert(rootMaxW, '.app-root must define max-width');
  const maxW = parseInt(rootMaxW[1], 10);
  assert(maxW >= 1000 && maxW <= 1280, `.app-root max-width should be 1000-1280px (got ${maxW}px) for tablet landscape`);
  assert(styleContent.includes('margin: 0 auto'), '.app-root must be centered with margin: 0 auto');
});

// ============================================================================
// SUITE 4: DYNAMIC DOM ENGINE RENDERING AT VIEWPORT BOUNDARIES
// ============================================================================
console.log('\n[Suite 4: Dynamic DOM Engine Rendering at Viewport Boundaries]');

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.style = {};
    this.dataset = {};
    this._classes = new Set();
    this.attributes = new Map();
    this.innerHTMLContent = '';
  }
  get classList() {
    return {
      add: (...cls) => cls.forEach(c => c && c.split(/\s+/).forEach(x => this._classes.add(x))),
      remove: (...cls) => cls.forEach(c => this._classes.delete(c)),
      contains: (c) => this._classes.has(c),
      toggle: (c) => this._classes.has(c) ? (this._classes.delete(c), false) : (this._classes.add(c), true)
    };
  }
  get className() { return Array.from(this._classes).join(' '); }
  set className(val) {
    this._classes.clear();
    if (val) val.split(/\s+/).filter(Boolean).forEach(c => this._classes.add(c));
  }
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) || null; }
  appendChild(child) { this.children.push(child); return child; }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }
  set innerHTML(val) {
    this.innerHTMLContent = val;
    this.children = [];
    // Basic mock parser for template strings
    const idMatches = [...val.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]);
    const classMatches = [...val.matchAll(/class=["']([^"']+)["']/g)].map(m => m[1]);
    for (const id of idMatches) {
      const el = new MockElement('div');
      el.id = id;
      this.children.push(el);
    }
  }
  get innerHTML() { return this.innerHTMLContent; }
  querySelector(sel) {
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      return this._findDeep(el => el.id === id);
    }
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      return this._findDeep(el => el.classList.contains(cls));
    }
    return this.children[0] || null;
  }
  querySelectorAll(sel) {
    const results = [];
    this._collectDeep(sel, results);
    return results;
  }
  _findDeep(predicate) {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const found = child._findDeep(predicate);
      if (found) return found;
    }
    return null;
  }
  _collectDeep(sel, results) {
    const isClass = sel.startsWith('.');
    const isId = sel.startsWith('#');
    const target = sel.slice(1);
    for (const child of this.children) {
      if (isClass && child.classList.contains(target)) results.push(child);
      else if (isId && child.id === target) results.push(child);
      child._collectDeep(sel, results);
    }
  }
  getBoundingClientRect() {
    return { top: 0, left: 0, width: 340, height: 340, right: 340, bottom: 340 };
  }
  getContext() {
    return {
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      fillText: () => {},
      setLineDash: () => {},
      lineWidth: 1,
      strokeStyle: '#000',
      fillStyle: '#000',
      lineCap: 'round',
      lineJoin: 'round'
    };
  }
  addEventListener() {}
  removeEventListener() {}
}

// Global document mock for Node.js
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => new MockElement('div')
  };
}

await challenge('4.1 All 9 Game Engines render without throwing on synthetic mobile container', () => {
  const engineSampleLevels = [
    LEVELS.find(l => l.type === 'hubungkan'),
    LEVELS.find(l => l.type === 'labirin'),
    LEVELS.find(l => l.type === 'pilih'),
    LEVELS.find(l => l.type === 'titik'),
    LEVELS.find(l => l.type === 'tebalkan'),
    LEVELS.find(l => l.type === 'mewarnai'),
    LEVELS.find(l => l.type === 'urutkan'),
    LEVELS.find(l => l.type === 'panah'),
    LEVELS.find(l => l.type === 'memori')
  ];

  assert.strictEqual(engineSampleLevels.filter(Boolean).length, 9, 'Must find 1 sample level for each of the 9 engines');

  for (const lvl of engineSampleLevels) {
    const container = new MockElement('div');
    container.style.width = '390px'; // Phone viewport width
    let completed = false;
    Engines.render(container, lvl, () => { completed = true; });
    assert(container.children.length > 0 || container.innerHTML.length > 0, `Engine ${lvl.type} produced empty output`);
  }
});

// ============================================================================
// SUMMARY & VERDICT CALCULATION
// ============================================================================
console.log('\n================================================================');
console.log('📊 CHALLENGER M5-2 EMPIRICAL TEST SUMMARY');
console.log('================================================================');
console.log(`Total Adversarial Checks: ${totalTests}`);
console.log(`Passed:                   ${passedTests}`);
console.log(`Failed:                   ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error(`❌ VERDICT: REQUEST_CHANGES — ${failedTests} empirical test(s) failed.`);
  process.exit(1);
} else {
  console.log('✔ VERDICT: APPROVE — All empirical viewport, touch ergonomics, and offline cache tests passed cleanly!');
  process.exit(0);
}
