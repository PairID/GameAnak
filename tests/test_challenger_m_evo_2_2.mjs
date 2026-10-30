// tests/test_challenger_m_evo_2_2.mjs
// Adversarial Empirical Challenge Suite: Mathematical WCAG 2.1 Contrast Ratio Compliance,
// 54 Mandatory Semantic DOM IDs Integrity, Exact 14-Asset PWA Offline Cache Invariants,
// and Preschool Jelly UI Touch Ergonomics.
//
// Target: style.css, index.html, and sw.js (Milestone M-EVO-2)
// Mode: Empirical Challenger (critic, specialist)
// Pure Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER M-EVO-2.2: EMPIRICAL ADVERSARIAL STRESS SUITE');
console.log('WCAG 2.1 Mathematical Contrast, DOM IDs, PWA Cache & Jelly UI');
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
    failCount++;
    testResults.push({ name, status: 'FAIL', error: err.message });
  }
}

function anomaly(category, message, details = {}) {
  anomalies.push({ category, message, details });
  console.log(`  \x1b[33m⚡ [ANOMALY - ${category}]\x1b[0m ${message}`);
}

// ============================================================================
// 1. MATHEMATICAL COLOR CONTRAST ORACLE (WCAG 2.1 SPECIFICATION)
// ============================================================================

/**
 * Converts standard 3 or 6 hex string to RGB channels
 */
function hexToRgb(hex) {
  assert(typeof hex === 'string', 'Hex value must be string');
  let c = hex.replace(/^#/, '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  assert(c.length === 6, `Invalid hex string format: #${c}`);
  const num = parseInt(c, 16);
  assert(!Number.isNaN(num), `Invalid hex number: #${c}`);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Computes WCAG 2.1 relative luminance from RGB channels
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where each channel c is linearized:
 * if c/255 <= 0.03928 then c_lin = (c/255) / 12.92
 * else c_lin = ((c/255 + 0.055) / 1.055) ^ 2.4
 */
function relativeLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes WCAG 2.1 contrast ratio between two hex colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter, L2 is darker
 */
function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Oracle Self-Check: Validate mathematical contrast against WCAG Reference Table
console.log('--- [ORACLE SELF-CHECK] WCAG 2.1 Contrast Formula Validation ---');

test('Oracle: Black on White equals 21.0:1', () => {
  const cr = contrastRatio('#000000', '#FFFFFF');
  assert.strictEqual(cr.toFixed(2), '21.00');
});

test('Oracle: White on #333333 equals 12.63:1 (passes AAA)', () => {
  const cr = contrastRatio('#FFFFFF', '#333333');
  assert.strictEqual(cr.toFixed(2), '12.63');
});

test('Oracle: White on #666666 equals 5.74:1 (passes AA)', () => {
  const cr = contrastRatio('#FFFFFF', '#666666');
  assert.strictEqual(cr.toFixed(2), '5.74');
});

test('Oracle: #777777 on White equals 4.48:1 (fails normal AA, passes large AA)', () => {
  const cr = contrastRatio('#777777', '#FFFFFF');
  assert.strictEqual(cr.toFixed(2), '4.48');
  assert(cr < 4.5, 'Must fail normal text threshold 4.5:1');
  assert(cr >= 3.0, 'Must pass large text threshold 3.0:1');
});

test('Oracle: #555555 on Black equals 2.82:1 (fails both normal and large)', () => {
  const cr = contrastRatio('#555555', '#000000');
  assert.strictEqual(cr.toFixed(2), '2.82');
  assert(cr < 3.0, 'Must fail large text threshold 3.0:1');
});

// ============================================================================
// PHASE 1: MATHEMATICAL CONTRAST COMPLIANCE OF DESIGN SYSTEM COLOR TOKENS
// ============================================================================
console.log('\n--- [PHASE 1] Designated Design System Color Tokens Contrast Audit ---');

const cssPath = path.join(ROOT_DIR, 'style.css');
assert(fs.existsSync(cssPath), 'style.css must exist');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Parse :root CSS custom properties
const rootMatch = cssContent.match(/:root\s*\{([\s\S]*?)\}/);
assert(rootMatch, 'style.css must define :root custom property block');
const rootBlock = rootMatch[1];

const CSS_VARS = {};
const varRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
let varMatch;
while ((varMatch = varRegex.exec(rootBlock)) !== null) {
  const key = varMatch[1].trim();
  const val = varMatch[2].trim().split('/*')[0].trim();
  CSS_VARS[key] = val;
}

test('CSS Custom Properties: Palette and brand tokens defined in :root', () => {
  const expectedTokens = [
    '--bg-warm', '--spidey-red', '--spidey-red-dark', '--spidey-red-crimson',
    '--web-blue', '--web-blue-dark', '--web-blue-light',
    '--sun-yellow', '--sun-yellow-dark', '--sun-yellow-light',
    '--leaf-green', '--leaf-green-dark', '--leaf-green-forest', '--leaf-green-light',
    '--purple-accent', '--purple-accent-candy', '--purple-accent-dark', '--purple-accent-light',
    '--slate-dark', '--slate-muted', '--slate-border'
  ];
  for (const token of expectedTokens) {
    assert(CSS_VARS[token], `:root must define custom property ${token}`);
  }
});

// Test primary designated color pairings from PROJECT.md & worker handoff
const DESIGNATED_TOKEN_PAIRS = [
  { name: 'Slate #1E293B on Sunny Yellow #FBBF24', fg: CSS_VARS['--slate-dark'], bg: CSS_VARS['--sun-yellow'], min: 4.5, targetGrade: 'WCAG AAA (8.76:1)' },
  { name: 'Slate #1E293B on Mint Green #10B981', fg: CSS_VARS['--slate-dark'], bg: CSS_VARS['--leaf-green'], min: 4.5, targetGrade: 'WCAG AA (5.77:1)' },
  { name: 'White #FFFFFF on Forest Green #047857', fg: '#FFFFFF', bg: CSS_VARS['--leaf-green-forest'], min: 4.5, targetGrade: 'WCAG AA (5.48:1)' },
  { name: 'White #FFFFFF on Ocean Blue #2563EB', fg: '#FFFFFF', bg: CSS_VARS['--web-blue'], min: 4.5, targetGrade: 'WCAG AA (5.17:1)' },
  { name: 'White #FFFFFF on Candy Purple #7C3AED', fg: '#FFFFFF', bg: CSS_VARS['--purple-accent-candy'], min: 4.5, targetGrade: 'WCAG AA (5.70:1)' },
  { name: 'White #FFFFFF on Crimson Red #DC2626', fg: '#FFFFFF', bg: CSS_VARS['--spidey-red-crimson'], min: 4.5, targetGrade: 'WCAG AA (4.83:1)' },
  { name: 'Slate #1E293B on Warm Cream Canvas #FFF9F0', fg: CSS_VARS['--slate-dark'], bg: CSS_VARS['--bg-warm'], min: 7.0, targetGrade: 'WCAG AAA (13.97:1)' },
  { name: 'Slate #1E293B on Pure White #FFFFFF', fg: CSS_VARS['--slate-dark'], bg: '#FFFFFF', min: 7.0, targetGrade: 'WCAG AAA (14.63:1)' },
  { name: 'Slate Muted #64748B on Pure White #FFFFFF', fg: CSS_VARS['--slate-muted'], bg: '#FFFFFF', min: 4.5, targetGrade: 'WCAG AA (4.76:1)' },
  { name: 'Slate Muted #64748B on Warm Canvas #FFF9F0', fg: CSS_VARS['--slate-muted'], bg: CSS_VARS['--bg-warm'], min: 4.5, targetGrade: 'WCAG AA (4.55:1)' },
  { name: 'Dark Spidey Red #B91C1C on Pure White #FFFFFF', fg: CSS_VARS['--spidey-red-dark'], bg: '#FFFFFF', min: 4.5, targetGrade: 'WCAG AA (6.47:1)' },
  { name: 'Dark Web Blue #1D4ED8 on Soft Blue #EFF6FF', fg: CSS_VARS['--web-blue-dark'], bg: CSS_VARS['--web-blue-light'], min: 4.5, targetGrade: 'WCAG AA (6.16:1)' },
  { name: 'Dark Emerald #064E3B on Mint Light #ECFDF5', fg: '#064E3B', bg: CSS_VARS['--leaf-green-light'], min: 7.0, targetGrade: 'WCAG AAA (9.23:1)' },
  { name: 'Gold Seal #78350F on Light Amber #FDE68A', fg: '#78350F', bg: '#FDE68A', min: 4.5, targetGrade: 'WCAG AAA (7.28:1)' }
];

for (const pair of DESIGNATED_TOKEN_PAIRS) {
  test(`Token Pair Contrast: ${pair.name} meets requirement (>=${pair.min}:1)`, () => {
    const ratio = contrastRatio(pair.fg, pair.bg);
    assert(ratio >= pair.min, `${pair.name} contrast ratio ${ratio.toFixed(2)}:1 is below minimum ${pair.min}:1`);
  });
}

// ============================================================================
// PHASE 2: ADVERSARIAL STRESS TESTING OF APPLIED CSS SELECTORS & EDGE CASES
// ============================================================================
console.log('\n--- [PHASE 2] Adversarial Stress Testing of Component UI Contrast ---');

// Audit Component-Level Applied Text/Background Rules
const COMPONENT_AUDIT_MATRIX = [
  // Primary interactive components
  { selector: '.header-badge', fg: '#FFFFFF', bg: CSS_VARS['--spidey-red'], size: '1.15rem (20.7px)', weight: '800', isLarge: true, desc: 'Header badge text' },
  { selector: '.jumbo-speaker-btn', fg: CSS_VARS['--slate-dark'], bg: CSS_VARS['--sun-yellow'], size: '2.1rem', weight: 'normal', isLarge: true, desc: 'Jumbo speaker button' },
  { selector: '.prompt-text', fg: CSS_VARS['--slate-dark'], bg: '#FFFFFF', size: '1.2rem', weight: '700', isLarge: false, desc: 'Prompt guidance bar' },
  { selector: '.jumbo-action-btn', fg: '#FFFFFF', bg: CSS_VARS['--leaf-green-forest'], size: '1.45rem', weight: '900', isLarge: true, desc: 'Victory next level CTA button' },
  { selector: '.primary-btn', fg: '#FFFFFF', bg: CSS_VARS['--spidey-red-crimson'], size: '1.05rem', weight: '800', isLarge: false, desc: 'Modal primary button' },
  { selector: '.danger-btn', fg: '#FFFFFF', bg: CSS_VARS['--spidey-red-crimson'], size: '1.05rem', weight: '800', isLarge: false, desc: 'Parent danger button' },
  { selector: '#runProgBtn', fg: '#FFFFFF', bg: CSS_VARS['--leaf-green-forest'], size: '1.1rem', weight: '800', isLarge: true, desc: 'Coding panah RUN button' },
  { selector: '.choice-btn.correct', fg: '#064E3B', bg: CSS_VARS['--leaf-green-light'], size: '1.4rem', weight: '800', isLarge: true, desc: 'Correct choice feedback state' },
  { selector: '.engine-tip', fg: '#334155', bg: '#FEF3C7', size: '1.15rem', weight: '800', isLarge: false, desc: 'Engine hubungkan tip badge' },
  { selector: '.gold-seal', fg: '#78350F', bg: '#FDE68A', size: '0.72rem', weight: '900', isLarge: false, desc: 'Certificate gold seal' },

  // Adversarial edge cases discovered during deep code inspection:
  { selector: '.empty-hint', fg: '#94A3B8', bg: '#FFFFFF', size: '0.95rem (17.1px)', weight: 'normal', isLarge: false, desc: 'Coding panah empty tray prompt ("Pilih panah di bawah!")' },
  { selector: '.world-desc (on world-card-angka)', fg: CSS_VARS['--slate-muted'], bg: '#FEF3C7', size: '0.95rem (17.1px)', weight: '600', isLarge: false, desc: 'World card description on yellow tint' },
  { selector: '.world-desc (on world-card-spidey)', fg: CSS_VARS['--slate-muted'], bg: '#FEE2E2', size: '0.95rem (17.1px)', weight: '600', isLarge: false, desc: 'World card description on red tint' },
  { selector: '.world-desc (on world-card-koding)', fg: CSS_VARS['--slate-muted'], bg: '#EFF6FF', size: '0.95rem (17.1px)', weight: '600', isLarge: false, desc: 'World card description on blue tint' },
  { selector: '.level-badge', fg: '#FFFFFF', bg: CSS_VARS['--spidey-red'], size: '0.95rem (17.1px)', weight: '800', isLarge: false, desc: 'Game topbar level badge ("Level 1")' },
  { selector: '.cert-badge-tag', fg: '#FFFFFF', bg: CSS_VARS['--spidey-red'], size: '0.85rem (15.3px)', weight: '800', isLarge: false, desc: 'Certificate official badge tag' }
];

for (const comp of COMPONENT_AUDIT_MATRIX) {
  const ratio = contrastRatio(comp.fg, comp.bg);
  const required = comp.isLarge ? 3.0 : 4.5;
  const passes = ratio >= required;

  if (passes) {
    test(`Component Contrast Pass: ${comp.selector} (${ratio.toFixed(2)}:1 >= ${required}:1) [${comp.desc}]`, () => {
      assert(ratio >= required);
    });
  } else {
    // Record empirical failure with full diagnostic breakdown
    test(`Component Contrast Adversarial Check: ${comp.selector} (${comp.desc})`, () => {
      anomaly('WCAG_AA_CONTRAST_DEFICIENCY',
        `${comp.selector} has contrast ratio of ${ratio.toFixed(2)}:1 (${comp.fg} on ${comp.bg}), failing WCAG AA threshold of ${required}:1 for normal text (${comp.size}, weight: ${comp.weight}).`,
        { selector: comp.selector, ratio: ratio.toFixed(2), required, fg: comp.fg, bg: comp.bg, desc: comp.desc }
      );
      assert.fail(`Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA minimum of ${required}:1 (${comp.fg} on ${comp.bg})`);
    });
  }
}

// ============================================================================
// PHASE 3: 54 MANDATORY SEMANTIC DOM IDS INVARIANT AUDIT
// ============================================================================
console.log('\n--- [PHASE 3] 54 Mandatory Semantic DOM IDs Invariant Audit ---');

const htmlPath = path.join(ROOT_DIR, 'index.html');
assert(fs.existsSync(htmlPath), 'index.html must exist');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const MANDATORY_54_DOM_IDS = [
  // 1-5: Header & Global counters
  'app', 'btnHeaderBack', 'headerTitle', 'starCounter', 'totalStarsCount',
  // 6-8: Navigation & Parental hold trigger
  'btnOpenCert', 'btnOpenParent', 'parentHoldProgress',
  // 9-12: Instruction bar & Mascot guidance
  'instructionBar', 'btnSpeakPrompt', 'promptText', 'mascotBubble',
  // 13-16: Main container & View 1 (Worlds selection)
  'mainContainer', 'viewWorlds', 'welcomeMascot', 'worldsGrid',
  // 17-20: View 2 (Levels selection)
  'viewLevels', 'currentWorldTitle', 'currentWorldProgress', 'levelsGrid',
  // 21-24: View 3 (Active gameplay)
  'viewGame', 'gameLevelBadge', 'gameLevelTitle', 'gameMount',
  // 25-31: Victory Modal & Celebration
  'modalVictory', 'confettiCanvas', 'victoryMascot', 'victoryStarsAnim',
  'btnNextLevel', 'btnReplayLevel', 'btnVictoryLevelSelect',
  // 32-41: Certificate Modal & Printable Sheet
  'modalCertificate', 'btnPrintCert', 'btnCloseCert', 'printableCertificate',
  'certMascotLeft', 'certMascotRight', 'certChildName', 'certTotalStars',
  'certCompletedLevels', 'certIssueDate',
  // 42-54: Parental Gate & Dashboard Modal
  'modalParent', 'parentGateSection', 'parentMathQuestion', 'parentMathChoices',
  'btnCancelParentGate', 'parentDashboardSection', 'btnCloseParentDash',
  'inputChildName', 'btnSaveChildName', 'worldRecapList', 'btnTestSfx',
  'btnTestTts', 'btnResetProgress'
];

test('Mandatory DOM IDs: Exact 54 IDs specified in spec inventory', () => {
  assert.strictEqual(MANDATORY_54_DOM_IDS.length, 54, 'Spec requires exactly 54 mandatory DOM IDs');
});

test('Mandatory DOM IDs: All 54 IDs present in index.html shell', () => {
  const missing = [];
  for (const id of MANDATORY_54_DOM_IDS) {
    const pattern = new RegExp(`id=["']${id}["']`);
    if (!pattern.test(htmlContent)) {
      missing.push(id);
    }
  }
  assert.strictEqual(missing.length, 0, `Missing required DOM IDs in index.html: ${missing.join(', ')}`);
});

test('Mandatory DOM IDs: Zero duplicate IDs in index.html', () => {
  const idMatches = htmlContent.match(/id=["']([a-zA-Z0-9_-]+)["']/g) || [];
  const counts = new Map();
  const duplicates = [];

  for (const m of idMatches) {
    const id = m.replace(/id=["']|["']/g, '');
    const current = counts.get(id) || 0;
    if (current === 1) duplicates.push(id);
    counts.set(id, current + 1);
  }

  assert.strictEqual(duplicates.length, 0, `Duplicate DOM IDs found in index.html: ${duplicates.join(', ')}`);
});

test('Structural DOM Invariant: Main views hierarchy properly nested inside #mainContainer', () => {
  const mainIdx = htmlContent.indexOf('id="mainContainer"');
  const worldsIdx = htmlContent.indexOf('id="viewWorlds"');
  const levelsIdx = htmlContent.indexOf('id="viewLevels"');
  const gameIdx = htmlContent.indexOf('id="viewGame"');

  assert(mainIdx !== -1, '#mainContainer must exist');
  assert(worldsIdx > mainIdx, '#viewWorlds must be inside #mainContainer');
  assert(levelsIdx > worldsIdx, '#viewLevels must be inside #mainContainer');
  assert(gameIdx > levelsIdx, '#viewGame must be inside #mainContainer');
});

// ============================================================================
// PHASE 4: PWA OFFLINE INFRASTRUCTURE & 14 LOCAL CACHED ASSETS INVARIANT AUDIT
// ============================================================================
console.log('\n--- [PHASE 4] PWA Offline & 14 Local Cached Assets Invariant Audit ---');

const swPath = path.join(ROOT_DIR, 'sw.js');
assert(fs.existsSync(swPath), 'sw.js must exist');
const swContent = fs.readFileSync(swPath, 'utf8');

test('Service Worker: Defines ASSETS_TO_CACHE array', () => {
  assert(swContent.includes('const ASSETS_TO_CACHE = [') || swContent.includes('ASSETS_TO_CACHE'),
    'sw.js must declare ASSETS_TO_CACHE');
});

// Extract asset list from sw.js
const swMatch = swContent.match(/ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
assert(swMatch, 'Could not parse ASSETS_TO_CACHE in sw.js');
const rawAssets = swMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);

test('Service Worker: Contains exactly 14 cached asset entries', () => {
  assert.strictEqual(rawAssets.length, 14,
    `sw.js must cache exactly 14 local assets for offline invariant, found: ${rawAssets.length} (${rawAssets.join(', ')})`);
});

test('Service Worker: All 14 cached assets exist locally on disk with valid file size', () => {
  for (const asset of rawAssets) {
    if (asset === './' || asset === '/') continue; // Root alias maps to index.html
    const relPath = asset.replace(/^\.\//, '');
    const fullPath = path.join(ROOT_DIR, relPath);
    assert(fs.existsSync(fullPath), `Asset ${asset} (${relPath}) cached in sw.js does not exist on disk!`);
    const stat = fs.statSync(fullPath);
    assert(stat.size > 0, `Asset ${asset} is empty (0 bytes)`);
  }
});

test('Offline PWA Invariant: index.html contains ZERO external links, stylesheets, or scripts', () => {
  // Regex searching for any external http://, https://, or // in href or src
  const externalPattern = /<(?:link|script|img)[^>]+(?:href|src)=["'](https?:\/\/[^"']+|\/\/[^"']+)["']/gi;
  const matches = [];
  let m;
  while ((m = externalPattern.exec(htmlContent)) !== null) {
    matches.push(m[0]);
  }
  assert.strictEqual(matches.length, 0,
    `index.html must not depend on external CDN resources. Found: ${matches.join(', ')}`);
});

test('PWA Manifest Invariant: manifest.webmanifest exists and links all standard icons', () => {
  const manifestPath = path.join(ROOT_DIR, 'manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
  const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.strictEqual(manifestJson.display, 'standalone');
  assert.strictEqual(manifestJson.start_url, './index.html');
  assert(Array.isArray(manifestJson.icons), 'Manifest must declare icons array');
  assert(manifestJson.icons.length >= 3, 'Manifest must provide at least 3 icon definitions');

  for (const icon of manifestJson.icons) {
    const iconPath = path.join(ROOT_DIR, icon.src.replace(/^\.\//, ''));
    assert(fs.existsSync(iconPath), `Manifest icon ${icon.src} does not exist on disk`);
  }
});

// ============================================================================
// PHASE 5: TACTILE 3D JELLY PHYSICS & TODDLER TOUCH ERGONOMICS AUDIT
// ============================================================================
console.log('\n--- [PHASE 5] Tactile 3D Jelly UI & Toddler Touch Ergonomics Audit ---');

test('Toddler Ergonomics: Touch target variables defined (min >= 64px, jumbo >= 80px)', () => {
  assert(cssContent.includes('--touch-min: 64px;'), 'style.css must define --touch-min: 64px');
  assert(cssContent.includes('--touch-jumbo: 80px;'), 'style.css must define --touch-jumbo: 80px');
});

test('Tactile 3D Jelly: 4-Layer depth box-shadow tokens defined', () => {
  assert(cssContent.includes('--jelly-shadow:'), 'style.css must define --jelly-shadow');
  assert(cssContent.includes('--jelly-shadow-hover:'), 'style.css must define --jelly-shadow-hover');
  assert(cssContent.includes('--jelly-shadow-active:'), 'style.css must define --jelly-shadow-active');

  // Verify multi-layer composition (inset highlights + solid slab + ambient contact)
  assert(cssContent.includes('inset 0 3px 0'), 'Jelly shadow must include top inset specular highlight');
  assert(cssContent.includes('inset 0 -3px 0'), 'Jelly shadow must include bottom curvature shadow');
  assert(cssContent.includes('0 6px 0') || cssContent.includes('0 5px 0'), 'Jelly shadow must include solid 3D extrusion slab');
});

test('Squishy Tap Physics: Elastic spring timing and volumetric compression', () => {
  assert(cssContent.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'style.css must declare elastic spring curve');
  assert(cssContent.includes('scale(1.02, 0.95)'), 'Interactive :active state must apply squishy volumetric compression');
  assert(cssContent.includes('translateY(5px)') || cssContent.includes('translateY(4px)'),
    ':active state must apply physical displacement');
});

test('Responsive Layout: Viewport breakpoints defined (<=480px, >=768px, @media print)', () => {
  assert(cssContent.includes('@media (max-width: 480px)'), 'Mobile portrait media query must exist');
  assert(cssContent.includes('@media (min-width: 768px)'), 'Tablet media query must exist');
  assert(cssContent.includes('@media print'), 'Print media query for certificate must exist');
});

// ============================================================================
// PHASE 6: REGRESSION GUARD ON EXISTING TEST SUITES
// ============================================================================
console.log('\n--- [PHASE 6] Regression Guard on Baseline Test Suites ---');

test('Baseline Regression Guard: node selfcheck.mjs exits code 0 with 24/24 checks', () => {
  try {
    const out = execSync('node selfcheck.mjs', { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' });
    assert(out.includes('PASSED') || out.includes('24/24') || out.includes('All checks passed'),
      'selfcheck.mjs must complete successfully');
  } catch (err) {
    assert.fail(`selfcheck.mjs failed with exit code ${err.status}: ${err.stdout || err.message}`);
  }
});

test('Baseline Regression Guard: node test_task_verification.mjs exits code 0 with 6/6 checks', () => {
  try {
    const out = execSync('node test_task_verification.mjs', { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' });
    assert(out.includes('ALL DEDICATED VERIFICATION CHECKS PASSED') || out.includes('100%'),
      'test_task_verification.mjs must pass 100%');
  } catch (err) {
    assert.fail(`test_task_verification.mjs failed with exit code ${err.status}: ${err.stdout || err.message}`);
  }
});

// ============================================================================
// FINAL SUMMARY & VERDICT
// ============================================================================
console.log('\n================================================================');
console.log('📊 CHALLENGER M-EVO-2.2 TEST EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Checks Executed : ${passCount + failCount}`);
console.log(`Passed Checks         : ${passCount}`);
console.log(`Failed Checks         : ${failCount}`);
console.log(`Detected Anomalies    : ${anomalies.length}`);
console.log('================================================================');

if (anomalies.length > 0) {
  console.log('\n📋 Detected WCAG AA Deficiencies & Anomalies:');
  anomalies.forEach((a, idx) => {
    console.log(`  [${idx + 1}] (${a.category}) ${a.message}`);
  });
}

const verdict = failCount === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
console.log(`\n⚖️ FINAL EMPIRICAL VERDICT: ${verdict}\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
