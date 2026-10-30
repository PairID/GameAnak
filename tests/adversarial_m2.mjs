// tests/adversarial_m2.mjs
// Adversarial Empirical Stress Test Suite for Milestone 2: UI Shell, Tactile Sticker Design & Mascots
// Written by Challenger 1 (critic & specialist)
// Pure Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER 1: ADVERSARIAL STRESS TEST SUITE (MILESTONE 2)');
console.log('UI Shell (index.html), Tactile Sticker Design (style.css) & Mascots');
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
// PART 1: ADVERSARIAL HTML PARSING & STRUCTURAL INTEGRITY OF index.html
// ============================================================================
console.log('--- [PART 1] Adversarial HTML Parsing & Structural Integrity (index.html) ---');

const htmlPath = path.join(rootDir, 'index.html');
assert(fs.existsSync(htmlPath), 'index.html must exist at project root');
const html = fs.readFileSync(htmlPath, 'utf8');

// 1.1 Strict HTML Tag Hierarchy & Tag Balance via State Machine
check('HTML tag lexer: Zero unclosed tags, correct nesting LIFO, valid void tags', () => {
  const voidTags = new Set([
    '!doctype', 'meta', 'link', 'img', 'input', 'br', 'hr',
    'source', 'wbr', 'col', 'param', 'embed', 'base', 'area'
  ]);

  const tagStack = [];
  const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9]+)([^>]*?)>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    if (fullMatch.startsWith('<!--')) continue; // Skip comments

    const isClosing = match[1] === '/';
    const tagName = match[2].toLowerCase();
    const attrs = match[3] || '';

    if (voidTags.has(tagName)) {
      if (isClosing) {
        throw new Error(`Void tag <${tagName}> must not have a closing tag </${tagName}>`);
      }
      continue;
    }

    if (!isClosing) {
      if (attrs.trim().endsWith('/')) continue;
      tagStack.push({ tag: tagName, index: match.index });
    } else {
      if (tagStack.length === 0) {
        throw new Error(`Unexpected closing tag </${tagName}> with empty stack at char ${match.index}`);
      }
      const top = tagStack.pop();
      if (top.tag !== tagName) {
        throw new Error(`Mismatched tag: expected </${top.tag}>, found </${tagName}> at char ${match.index}`);
      }
    }
  }

  if (tagStack.length > 0) {
    const unclosed = tagStack.map(t => `<${t.tag}>`).join(', ');
    throw new Error(`Unclosed tags remain at EOF: ${unclosed}`);
  }
});

// 1.2 ID Uniqueness & Strict Attribute Syntax
const extractedIds = new Map();
check('No duplicate IDs exist anywhere in index.html', () => {
  const idRegex = /\sid=["']([^"']+)["']/g;
  let m;
  while ((m = idRegex.exec(html)) !== null) {
    const id = m[1];
    if (extractedIds.has(id)) {
      throw new Error(`Duplicate ID detected: "${id}" at positions ${extractedIds.get(id)} and ${m.index}`);
    }
    extractedIds.set(id, m.index);
  }
  assert(extractedIds.size > 0, 'index.html must have defined IDs');
});

// 1.3 Label-For Reference Integrity
check('All <label for="..."> attributes reference valid existing IDs', () => {
  const labelForRegex = /<label[^>]*\sfor=["']([^"']+)["'][^>]*>/g;
  let m;
  let labelCount = 0;
  while ((m = labelForRegex.exec(html)) !== null) {
    labelCount++;
    const targetId = m[1];
    assert(extractedIds.has(targetId), `<label for="${targetId}"> references non-existent ID "${targetId}"`);
  }
  assert(labelCount > 0, 'Expected at least one label for parental settings');
});

// 1.4 Verification of All 54 Required DOM IDs from Specifications
const required54Ids = [
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

check('All 54 required specification IDs are present in index.html', () => {
  const missing = required54Ids.filter(id => !extractedIds.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing required IDs in index.html: ${missing.join(', ')}`);
  }
});

// 1.5 Local Resource Links Integrity
check('Referenced M1 & M2 local asset files exist and are accessible', () => {
  const localAssets = [
    { tag: '<link rel="stylesheet">', relPath: 'style.css' },
    { tag: '<link rel="icon">', relPath: 'icons/favicon.svg' },
    { tag: '<link rel="apple-touch-icon">', relPath: 'icons/icon-192.svg' },
    { tag: '<link rel="modulepreload">', relPath: 'audio.js' },
    { tag: '<link rel="modulepreload">', relPath: 'mascot.js' },
    { tag: '<link rel="modulepreload">', relPath: 'levels.js' },
    { tag: '<link rel="modulepreload">', relPath: 'engines.js' }
  ];

  for (const asset of localAssets) {
    const full = path.join(rootDir, asset.relPath);
    assert(fs.existsSync(full), `Asset ${asset.relPath} referenced by ${asset.tag} not found on disk`);
    const stat = fs.statSync(full);
    assert(stat.size > 0, `Asset ${asset.relPath} is empty (0 bytes)`);
  }
});

// 1.6 Verify View Panels & Modal Overlays initial states
check('View panels and modals have proper semantic markup and initial visibility hooks', () => {
  assert(html.includes('id="viewWorlds"'), 'viewWorlds panel exists');
  assert(html.includes('id="viewLevels"'), 'viewLevels panel exists');
  assert(html.includes('id="viewGame"'), 'viewGame panel exists');
  assert(html.includes('id="modalVictory"'), 'modalVictory overlay exists');
  assert(html.includes('id="modalCertificate"'), 'modalCertificate overlay exists');
  assert(html.includes('id="modalParent"'), 'modalParent overlay exists');
  assert(html.includes('id="gameMount"'), 'gameMount engine mount container exists');
  assert(html.includes('id="confettiCanvas"'), 'confettiCanvas element exists');
});

// ============================================================================
// PART 2: ADVERSARIAL CSS INTEGRITY & TOKEN VERIFICATION OF style.css
// ============================================================================
console.log('\n--- [PART 2] Adversarial CSS Syntax & Token Conformance (style.css) ---');

const cssPath = path.join(rootDir, 'style.css');
assert(fs.existsSync(cssPath), 'style.css must exist at project root');
const css = fs.readFileSync(cssPath, 'utf8');

// 2.1 CSS Brace Balance & Comment Integrity
check('style.css brace balance and comments: 0 unmatched braces, 0 unclosed comments', () => {
  let strippedCss = '';
  let inComment = false;
  for (let i = 0; i < css.length; i++) {
    if (!inComment && css[i] === '/' && css[i + 1] === '*') {
      inComment = true;
      i++;
    } else if (inComment && css[i] === '*' && css[i + 1] === '/') {
      inComment = false;
      i++;
    } else if (!inComment) {
      strippedCss += css[i];
    }
  }
  if (inComment) {
    throw new Error('Unclosed comment /* detected in style.css');
  }

  let openCount = 0;
  for (let i = 0; i < strippedCss.length; i++) {
    if (strippedCss[i] === '{') openCount++;
    if (strippedCss[i] === '}') {
      openCount--;
      if (openCount < 0) {
        throw new Error(`Unexpected closing brace '}' at position ${i} in style.css`);
      }
    }
  }
  if (openCount !== 0) {
    throw new Error(`Unmatched braces in style.css: ${openCount} open block(s) unclosed`);
  }
});

// 2.2 Warm Palette & Tactile Tokens
check('Tactile sticker tokens defined in :root (warm palette, thick borders, shadows, touch target)', () => {
  const requiredTokens = [
    '--bg-warm: #FFF9F0',
    '--spidey-red: #EF4444',
    '--web-blue: #2563EB',
    '--sun-yellow: #FBBF24',
    '--leaf-green: #10B981',
    '--purple-accent: #8B5CF6',
    '--border-thick: 3.5px solid #1E293B',
    '--sticker-shadow:',
    '--touch-min: 64px'
  ];

  for (const token of requiredTokens) {
    assert(css.includes(token), `Required CSS custom property "${token}" missing from style.css`);
  }
});

// 2.3 Toddler Ergonomics & Accidental Gestures Protection
check('Toddler ergonomics: user-select none, touch-action manipulation, traceCanvas touch-action none', () => {
  assert(/user-select:\s*none/i.test(css), 'user-select: none must be present');
  assert(/touch-action:\s*manipulation/i.test(css), 'touch-action: manipulation must be present');
  assert(/#traceCanvas\s*\{[^}]*touch-action:\s*none/i.test(css), '#traceCanvas must specify touch-action: none');
  assert(/overscroll-behavior:\s*none/i.test(css), 'overscroll-behavior: none must be set to prevent pull-to-refresh');
});

// 2.4 Educational Feedback Keyframes
check('Keyframe animations: gentleWobble (educational mistake feedback), mascotFloat, starPop/Pulse', () => {
  assert(css.includes('@keyframes gentleWobble'), '@keyframes gentleWobble must exist');
  assert(css.includes('@keyframes mascotFloat'), '@keyframes mascotFloat must exist');
  assert(css.includes('@keyframes starPop') || css.includes('@keyframes starPulse'), 'Star celebration animation must exist');
});

// 2.5 3D Card Flip Implementation
check('3D Card flip engine rules: perspective, transform-style preserve-3d, backface-visibility', () => {
  assert(css.includes('perspective:'), '3D perspective rule must exist for card flipping');
  assert(css.includes('preserve-3d'), 'transform-style: preserve-3d must exist for cards');
  assert(css.includes('backface-visibility'), 'backface-visibility: hidden must exist for card faces');
});

// 2.6 Print Stylesheet Conformance
check('@media print stylesheet properly hides UI shell and styles certificate on A4 landscape', () => {
  assert(css.includes('@media print'), '@media print block must exist');
  const printBlockMatch = css.match(/@media print\s*\{([\s\S]*?)\n\}/);
  assert(printBlockMatch, '@media print block must be extractable');
  const printCss = printBlockMatch[1];
  assert(printCss.includes('.app-header') || printCss.includes('display: none !important'), 'Header must be hidden on print');
  assert(printCss.includes('.instruction-bar') || printCss.includes('.modal-overlay'), 'Instruction bar / overlay must be hidden on print');
  assert(printCss.includes('#printableCertificate') || printCss.includes('.certificate-sheet'), 'Printable certificate must be styled in print mode');
});

// ============================================================================
// PART 3: SELECTOR COVERAGE STRESS TEST (index.html & ALL 9 ENGINES)
// ============================================================================
console.log('\n--- [PART 3] Selector Coverage Stress Test (index.html & 9 Engines) ---');

// Helper to check if a class or ID selector pattern exists in style.css
function hasSelector(name) {
  const clean = name.replace(/^[.#]/, '');
  const pattern = new RegExp(`(?:\\.|#)${clean}\\b`);
  return pattern.test(css);
}

// 3.1 Verify index.html Primary Container & Component Rules
check('style.css provides rules for all major UI shell components from index.html', () => {
  const criticalShellComponents = [
    'app-root', 'app-header', 'header-left', 'header-right', 'header-badge',
    'badge-icon', 'header-btn', 'back-btn', 'star-pill', 'star-icon',
    'cert-btn', 'parent-btn', 'hold-progress', 'instruction-bar',
    'jumbo-speaker-btn', 'prompt-text', 'mascot-avatar', 'main-content',
    'view-panel', 'active', 'welcome-banner', 'banner-mascot', 'banner-text',
    'worlds-grid', 'levels-header', 'levels-progress-pill', 'levels-grid',
    'game-topbar', 'level-badge', 'level-title', 'game-mount',
    'modal-overlay', 'modal-card', 'victory-card', 'victory-mascot',
    'victory-stars', 'victory-title', 'victory-subtitle', 'victory-actions',
    'jumbo-action-btn', 'secondary-actions', 'sub-action-btn', 'cert-card-wrapper',
    'cert-card-actions', 'no-print', 'certificate-sheet', 'cert-border',
    'cert-corner', 'cert-header', 'cert-logo-box', 'cert-badge-tag',
    'cert-main-title', 'cert-lead', 'cert-recipient-box', 'recipient-name',
    'recipient-underline', 'cert-body-text', 'cert-stats-row', 'cert-stat-badge',
    'cert-footer', 'cert-sign-col', 'sign-date', 'sign-line', 'cert-seal-col',
    'gold-seal', 'sign-name', 'sign-title', 'parent-modal-card', 'parent-gate-box',
    'gate-icon', 'gate-instruction', 'math-question', 'math-choices', 'text-btn',
    'parent-dashboard-box', 'dashboard-header', 'close-icon-btn', 'settings-group',
    'input-with-save', 'progress-summary-box', 'world-recap-list', 'audio-test-box',
    'test-btn-row', 'test-btn', 'danger-zone-box', 'danger-btn'
  ];

  const missing = criticalShellComponents.filter(c => !hasSelector(c));
  if (missing.length > 0) {
    throw new Error(`Missing CSS rules in style.css for UI shell components: ${missing.join(', ')}`);
  }
});

// 3.2 Verify Engine 1: Hubungkan (Tarik Garis / Tap Pasangan)
check('Engine 1 (Hubungkan): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-hubungkan')) missing.push('.engine-hubungkan');
  if (!hasSelector('pairs-grid')) missing.push('.pairs-grid');
  if (!hasSelector('col-left')) missing.push('.col-left');
  if (!hasSelector('col-right')) missing.push('.col-right');
  if (!hasSelector('line-canvas')) missing.push('.line-canvas');
  if (!hasSelector('pair-item')) missing.push('.pair-item');
  if (!hasSelector('dot-connector')) missing.push('.dot-connector');
  if (!hasSelector('engine-tip')) missing.push('.engine-tip (Tip instruction bar under grid)');

  if (missing.length > 0) {
    throw new Error(`Engine 1 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.3 Verify Engine 2: Labirin (Maze Navigasi Sentuh)
check('Engine 2 (Labirin): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-labirin')) missing.push('.engine-labirin');
  if (!hasSelector('maze-grid')) missing.push('.maze-grid');
  if (!hasSelector('maze-cell')) missing.push('.maze-cell');
  if (!hasSelector('nav-btn')) missing.push('.nav-btn');
  if (!hasSelector('maze-header')) missing.push('.maze-header (Start & Goal legend banner)');

  if (missing.length > 0) {
    throw new Error(`Engine 2 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.4 Verify Engine 3: Pilih Jawaban (Multiple Choice Jumbo)
check('Engine 3 (Pilih Jawaban): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-pilih')) missing.push('.engine-pilih');
  if (!hasSelector('question-display')) missing.push('.question-display');
  if (!hasSelector('sequence-display')) missing.push('.sequence-display');
  if (!hasSelector('choice-btn')) missing.push('.choice-btn');
  // engines.js renders <span class="seq-badge"> while style.css has .seq-item, .seq-box
  if (!hasSelector('seq-badge')) missing.push('.seq-badge (Rendered by engines.js line 237, style.css only has .seq-item)');

  if (missing.length > 0) {
    throw new Error(`Engine 3 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.5 Verify Engine 4: Hubungkan Titik (Connect The Dots 1-10)
check('Engine 4 (Hubungkan Titik): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-titik')) missing.push('.engine-titik');
  if (!hasSelector('titik-canvas-wrapper')) missing.push('.titik-canvas-wrapper');
  if (!hasSelector('titik-svg')) missing.push('.titik-svg');
  if (!hasSelector('dot-node')) missing.push('.dot-node');
  if (!hasSelector('reveal-overlay')) missing.push('.reveal-overlay');
  if (!hasSelector('titik-counter')) missing.push('.titik-counter (Counter bar below canvas)');
  if (!hasSelector('current-target')) missing.push('.current-target (Current target number highlight)');

  if (missing.length > 0) {
    throw new Error(`Engine 4 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.6 Verify Engine 5: Tebalkan Garis (Finger Tracing Guide)
check('Engine 5 (Tebalkan): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-tebalkan')) missing.push('.engine-tebalkan');
  if (!hasSelector('traceCanvas')) missing.push('#traceCanvas');
  if (!hasSelector('trace-actions')) missing.push('.trace-actions');
  // engines.js renders <div class="trace-box"> while style.css has .canvas-wrapper
  if (!hasSelector('trace-box')) missing.push('.trace-box (Rendered by engines.js line 386, style.css only has .canvas-wrapper)');
  if (!hasSelector('trace-title')) missing.push('.trace-title (Title label above canvas)');

  if (missing.length > 0) {
    throw new Error(`Engine 5 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.7 Verify Engine 6: Mewarnai Bentuk & Pixel Art
check('Engine 6 (Mewarnai): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-mewarnai')) missing.push('.engine-mewarnai');
  if (!hasSelector('palette-bar')) missing.push('.palette-bar');
  if (!hasSelector('color-swatch')) missing.push('.color-swatch');
  // engines.js renders <div class="coloring-canvas" id="coloringCanvas"> while style.css has .shapes-grid, .canvas-container
  if (!hasSelector('coloring-canvas') && !hasSelector('coloringCanvas')) {
    missing.push('.coloring-canvas / #coloringCanvas (Rendered by engines.js line 508, style.css only has .shapes-grid)');
  }

  if (missing.length > 0) {
    throw new Error(`Engine 6 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.8 Verify Engine 7: Urutkan (1-2-3 / Kecil ke Besar)
check('Engine 7 (Urutkan): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-urutkan')) missing.push('.engine-urutkan');
  if (!hasSelector('order-slot')) missing.push('.order-slot');
  if (!hasSelector('items-pool')) missing.push('.items-pool');
  if (!hasSelector('order-item-btn')) missing.push('.order-item-btn');
  // engines.js renders <div class="target-slots" id="slotsRow"> while style.css has .slots-row
  if (!hasSelector('target-slots') && !hasSelector('slotsRow')) {
    missing.push('.target-slots / #slotsRow (Rendered by engines.js line 564, style.css only has .slots-row)');
  }

  if (missing.length > 0) {
    throw new Error(`Engine 7 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.9 Verify Engine 8: Koding Panah (Grid Coding Spideybot)
check('Engine 8 (Koding Panah): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-panah')) missing.push('.engine-panah');
  if (!hasSelector('spidey-grid-board')) missing.push('.spidey-grid-board');
  if (!hasSelector('program-tray')) missing.push('.program-tray');
  if (!hasSelector('program-slots')) missing.push('.program-slots');
  if (!hasSelector('cmd-chip')) missing.push('.cmd-chip');
  if (!hasSelector('arrows-palette')) missing.push('.arrows-palette');
  if (!hasSelector('arrow-cmd-btn')) missing.push('.arrow-cmd-btn');
  // engines.js renders <div class="grid-cell"> while style.css has .board-cell
  if (!hasSelector('grid-cell')) missing.push('.grid-cell (Rendered by engines.js line 621-629, style.css only has .board-cell)');
  if (!hasSelector('tray-label')) missing.push('.tray-label (Rendered by engines.js line 633, style.css only has .tray-title)');

  if (missing.length > 0) {
    throw new Error(`Engine 8 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// 3.10 Verify Engine 9: Kartu Memori
check('Engine 9 (Kartu Memori): Selector parity between engines.js and style.css', () => {
  const missing = [];
  if (!hasSelector('engine-memori')) missing.push('.engine-memori');
  if (!hasSelector('memory-card')) missing.push('.memory-card');
  if (!hasSelector('card-inner')) missing.push('.card-inner');
  if (!hasSelector('card-front')) missing.push('.card-front');
  if (!hasSelector('card-back')) missing.push('.card-back');
  // engines.js renders <div class="cards-grid" id="memoryCardsGrid"> while style.css has .memory-grid
  if (!hasSelector('cards-grid') && !hasSelector('memoryCardsGrid')) {
    missing.push('.cards-grid / #memoryCardsGrid (Rendered by engines.js line 726, style.css only has .memory-grid)');
  }

  if (missing.length > 0) {
    throw new Error(`Engine 9 selectors missing from style.css: ${missing.join(', ')}`);
  }
});

// ============================================================================
// PART 4: MASCOT SYSTEM & ASSET INTEGRITY
// ============================================================================
console.log('\n--- [PART 4] Mascot System & Vector Asset Verification ---');

const { Mascot } = await import('../mascot.js');

check('Mascot.hero generates valid SVG stickers across all requested poses (wave, happy, cheer, think, encourage)', () => {
  const poses = ['wave', 'happy', 'cheer', 'cheering', 'think', 'thinking', 'encourage', 'encouraging'];
  for (const pose of poses) {
    const raw = Mascot.hero(120, pose);
    const svgMarkup = typeof raw === 'string' ? raw.trim() : '';
    assert(svgMarkup.startsWith('<svg') && svgMarkup.endsWith('</svg>'), `Mascot.hero '${pose}' must produce valid <svg>...</svg>`);
    assert(svgMarkup.includes('viewBox="0 0 120 120"'), `Mascot.hero '${pose}' must have viewBox 0 0 120 120`);
    assert(svgMarkup.includes('#E53E3E') || svgMarkup.includes('#EF4444'), `Mascot.hero '${pose}' must include Spidey Red`);
  }
});

check('Mascot.robot and Mascot.bot alias produce identical valid SVG output with poses', () => {
  assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot alias must strictly equal Mascot.robot');
  const poses = ['default', 'happy', 'cheer', 'thinking'];
  for (const pose of poses) {
    const raw = Mascot.robot(90, pose);
    const svgMarkup = typeof raw === 'string' ? raw.trim() : '';
    assert(svgMarkup.startsWith('<svg') && svgMarkup.endsWith('</svg>'), `Mascot.robot('${pose}') produces valid SVG`);
    assert(svgMarkup.includes('viewBox="0 0 100 100"'), 'Robot must have viewBox 0 0 100 100');
    assert(svgMarkup.includes('#2563EB') || svgMarkup.includes('#3B82F6'), 'Robot must feature blue chassis');
  }
});

check('Mascot.star and Mascot.web generators function correctly', () => {
  const filledStar = Mascot.star(40, true).trim();
  const emptyStar = Mascot.star(40, false).trim();
  const webCorner = Mascot.web(80).trim();

  assert(filledStar.includes('<svg') && filledStar.includes('#FBBF24'), 'Filled star is golden yellow');
  assert(emptyStar.includes('<svg'), 'Empty star produces SVG');
  assert(webCorner.includes('<svg'), 'Web corner produces SVG');
});

check('Vector icons in icons/ are valid XML/SVG with required dimensions', () => {
  const icons = [
    { file: 'icons/favicon.svg', expectedSize: 64 },
    { file: 'icons/icon-192.svg', expectedSize: 192 },
    { file: 'icons/icon-512.svg', expectedSize: 512 },
    { file: 'icons/icon-maskable.svg', expectedSize: 512 }
  ];

  for (const ic of icons) {
    const fullPath = path.join(rootDir, ic.file);
    assert(fs.existsSync(fullPath), `Icon ${ic.file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8').trim();
    assert(content.includes('<svg'), `Icon ${ic.file} must contain <svg>`);
    assert(content.includes('</svg>'), `Icon ${ic.file} must close with </svg>`);
    assert(content.includes(`width="${ic.expectedSize}"`), `Icon ${ic.file} must specify width="${ic.expectedSize}"`);
    assert(content.includes(`height="${ic.expectedSize}"`), `Icon ${ic.file} must specify height="${ic.expectedSize}"`);
  }
});

// ============================================================================
// PART 5: FULL E2E SUITE VERIFICATION EXECUTION
// ============================================================================
console.log('\n--- [PART 5] Executing test_e2e.mjs Verification ---');

check('Running test_e2e.mjs yields 0 failures', () => {
  const out = execSync('node test_e2e.mjs', { cwd: rootDir, encoding: 'utf8' });
  assert(out.includes('0 Failed'), 'test_e2e.mjs output must report 0 Failed');
  assert(out.includes('E2E Suite PASSED with 0 failures'), 'test_e2e.mjs must pass successfully');
});

// ============================================================================
// SUMMARY & VERDICT CALCULATION
// ============================================================================
console.log('\n================================================================');
console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY: ${passedChecks}/${totalChecks} PASSED`);
if (failures.length > 0) {
  console.log(`❌ FAILURES DETECTED: ${failures.length}`);
  failures.forEach((f, idx) => {
    console.log(`  ${idx + 1}. [FAIL] ${f.title}`);
    console.log(`     Details: ${f.error.message}`);
  });
  console.log('\n🏁 EMPIRICAL VERDICT: REQUEST_CHANGES');
} else {
  console.log('🎉 ALL ADVERSARIAL STRESS CHECKS PASSED WITH ZERO FAILURES!');
  console.log('\n🏁 EMPIRICAL VERDICT: APPROVE');
}
console.log('================================================================\n');
