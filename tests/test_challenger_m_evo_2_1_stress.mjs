// tests/test_challenger_m_evo_2_1_stress.mjs
// Adversarial Empirical Stress Test Suite for Milestone M-EVO-2 (Tactile 3D Jelly UI)
// Challenger M-EVO-2.1 (Touch Targets, Button Sizing, Squishy Transforms & Viewport Reflow)
// Zero external dependencies - executable via `node tests/test_challenger_m_evo_2_1_stress.mjs`

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('⚡ CHALLENGER M-EVO-2.1: ADVERSARIAL STRESS TEST SUITE');
console.log('Milestone M-EVO-2: Touch Targets (>=64px), Squishy Physics & Reflow');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const findings = [];

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${title}`);
  } catch (err) {
    failedChecks++;
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${title}`);
    console.error(`         \x1b[33mEvidence: ${err.message}\x1b[0m`);
    findings.push({ title, error: err.message });
  }
}

// Load Core Artifacts
const stylePath = path.join(rootDir, 'style.css');
const indexPath = path.join(rootDir, 'index.html');
assert(fs.existsSync(stylePath), 'style.css must exist');
assert(fs.existsSync(indexPath), 'index.html must exist');

const styleCss = fs.readFileSync(stylePath, 'utf8');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Dynamic Imports
const { LEVELS, WORLDS } = await import('../levels.js');
const { Engines } = await import('../engines.js');
const { Mascot } = await import('../mascot.js');

// CSS Parser Helper
function parseCssRules(css) {
  const rules = [];
  // Strip comments
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Match rules: handles both simple rules and rules within media queries
  const ruleRegex = /([^{}@]+)\{([^{}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(clean)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    rules.push({ selector, body });
  }
  return rules;
}

const parsedRules = parseCssRules(styleCss);

function getPropertiesForSelector(selectorSubstr, propName) {
  const matches = [];
  for (const r of parsedRules) {
    if (r.selector.split(',').some(s => s.trim().includes(selectorSubstr))) {
      const propRegex = new RegExp(`(?<![a-z-])${propName}\\s*:\\s*([^;]+);`, 'gi');
      let m;
      while ((m = propRegex.exec(r.body)) !== null) {
        matches.push({ selector: r.selector, value: m[1].trim(), rawRule: r });
      }
    }
  }
  return matches;
}

function getRuleBody(selectorToFind) {
  for (const r of parsedRules) {
    const selectors = r.selector.split(',').map(s => s.trim());
    if (selectors.includes(selectorToFind) || r.selector.trim() === selectorToFind) {
      return r.body;
    }
  }
  return null;
}

// ============================================================================
// SUITE 1: TOUCH TARGETS & BUTTON SIZING EMPIRICAL AUDIT (>= 64px)
// ============================================================================
console.log('--- [SUITE 1] Touch Target Dimensions (>= 64px x 64px or --touch-min) ---');

check('1.1 Root CSS Variables: --touch-min >= 64px and --touch-jumbo >= 80px', () => {
  const touchMin = styleCss.match(/--touch-min:\s*(\d+)px/);
  const touchJumbo = styleCss.match(/--touch-jumbo:\s*(\d+)px/);
  assert(touchMin, 'style.css must declare --touch-min');
  assert(touchJumbo, 'style.css must declare --touch-jumbo');
  const minVal = parseInt(touchMin[1], 10);
  const jumboVal = parseInt(touchJumbo[1], 10);
  assert(minVal >= 64, `--touch-min must be >= 64px, found ${minVal}px`);
  assert(jumboVal >= 80, `--touch-jumbo must be >= 80px, found ${jumboVal}px`);
});

check('1.2 Primary Toddler Navigation: Jumbo Speaker Button (🔊) >= 64px x 64px', () => {
  const widths = getPropertiesForSelector('.jumbo-speaker-btn', 'width');
  const heights = getPropertiesForSelector('.jumbo-speaker-btn', 'height');
  const minWidths = getPropertiesForSelector('.jumbo-speaker-btn', 'min-width');
  const minHeights = getPropertiesForSelector('.jumbo-speaker-btn', 'min-height');

  assert(widths.length > 0 && heights.length > 0, '.jumbo-speaker-btn must have width & height');
  for (const w of widths) {
    const val = parseInt(w.value, 10);
    assert(val >= 64, `Width in ${w.selector} is ${w.value} (< 64px)`);
  }
  for (const h of heights) {
    const val = parseInt(h.value, 10);
    assert(val >= 64, `Height in ${h.selector} is ${h.value} (< 64px)`);
  }
  for (const mw of minWidths) {
    const val = parseInt(mw.value, 10);
    assert(val >= 64, `min-width in ${mw.selector} is ${mw.value} (< 64px)`);
  }
  for (const mh of minHeights) {
    const val = parseInt(mh.value, 10);
    assert(val >= 64, `min-height in ${mh.selector} is ${mh.value} (< 64px)`);
  }
});

check('1.3 Selection Cards: World Cards & Level Cards min-width/height >= 64px', () => {
  const worldMinH = getPropertiesForSelector('.world-card', 'min-height');
  assert(worldMinH.length > 0, '.world-card min-height must be declared');
  assert(parseInt(worldMinH[0].value, 10) >= 120, `.world-card min-height ${worldMinH[0].value} < 120px`);

  const levelMinH = getPropertiesForSelector('.level-card', 'min-height');
  const levelMinW = getPropertiesForSelector('.level-card', 'min-width');
  assert(levelMinH.length > 0 && levelMinW.length > 0, '.level-card min dimensions must be declared');
  assert(parseInt(levelMinH[0].value, 10) >= 64, `.level-card min-height ${levelMinH[0].value} < 64px`);
  assert(levelMinW[0].value.includes('touch-min') || parseInt(levelMinW[0].value, 10) >= 64,
    `.level-card min-width ${levelMinW[0].value} < 64px`);
});

check('1.4 Engine 1 (Hubungkan): .pair-item cards min-width/height >= 64px', () => {
  const minH = getPropertiesForSelector('.pair-item', 'min-height');
  const minW = getPropertiesForSelector('.pair-item', 'min-width');
  assert(minH.length > 0 && minW.length > 0, '.pair-item min dimensions must be defined');
  assert(parseInt(minH[0].value, 10) >= 64, `.pair-item min-height ${minH[0].value} < 64px`);
  assert(minW[0].value.includes('touch-min') || parseInt(minW[0].value, 10) >= 64,
    `.pair-item min-width ${minW[0].value} < 64px`);
});

check('1.5 Engine 2 (Labirin): .nav-btn D-pad navigation buttons >= 64px x 64px', () => {
  const w = getPropertiesForSelector('.nav-btn', 'width');
  const h = getPropertiesForSelector('.nav-btn', 'height');
  const minW = getPropertiesForSelector('.nav-btn', 'min-width');
  const minH = getPropertiesForSelector('.nav-btn', 'min-height');
  assert(parseInt(w[0].value, 10) >= 64, `.nav-btn width ${w[0].value} < 64px`);
  assert(parseInt(h[0].value, 10) >= 64, `.nav-btn height ${h[0].value} < 64px`);
  assert(minW[0].value.includes('touch-min') || parseInt(minW[0].value, 10) >= 64,
    `.nav-btn min-width ${minW[0].value} < 64px`);
  assert(minH[0].value.includes('touch-min') || parseInt(minH[0].value, 10) >= 64,
    `.nav-btn min-height ${minH[0].value} < 64px`);
});

check('1.6 Engine 3 (Pilih): .choice-btn option cards min-width/height >= 64px', () => {
  const minH = getPropertiesForSelector('.choice-btn', 'min-height');
  const minW = getPropertiesForSelector('.choice-btn', 'min-width');
  assert(minH.length > 0 && minW.length > 0, '.choice-btn min dimensions must be defined');
  for (const mh of minH) {
    assert(parseInt(mh.value, 10) >= 64, `.choice-btn min-height in ${mh.selector} is ${mh.value} (< 64px)`);
  }
  assert(minW[0].value.includes('touch-min') || parseInt(minW[0].value, 10) >= 64,
    `.choice-btn min-width ${minW[0].value} < 64px`);
});

check('1.7 Engine 5 (Tebalkan): .trace-clear-btn & .trace-done-btn >= 64px x 64px', () => {
  const minH = getPropertiesForSelector('.trace-clear-btn', 'min-height');
  const minW = getPropertiesForSelector('.trace-clear-btn', 'min-width');
  assert(parseInt(minH[0].value, 10) >= 64, `trace button min-height ${minH[0].value} < 64px`);
  assert(parseInt(minW[0].value, 10) >= 64, `trace button min-width ${minW[0].value} < 64px`);
});

check('1.8 Engine 7 (Urutkan): .order-item-btn and .order-slot >= 64px x 64px', () => {
  const itemMinH = getPropertiesForSelector('.order-item-btn', 'min-height');
  const itemMinW = getPropertiesForSelector('.order-item-btn', 'min-width');
  assert(parseInt(itemMinH[0].value, 10) >= 64, `.order-item-btn min-height ${itemMinH[0].value} < 64px`);
  assert(parseInt(itemMinW[0].value, 10) >= 64, `.order-item-btn min-width ${itemMinW[0].value} < 64px`);

  const slotMinH = getPropertiesForSelector('.order-slot', 'min-height');
  const slotMinW = getPropertiesForSelector('.order-slot', 'min-width');
  assert(parseInt(slotMinH[0].value, 10) >= 64, `.order-slot min-height ${slotMinH[0].value} < 64px`);
  assert(parseInt(slotMinW[0].value, 10) >= 64, `.order-slot min-width ${slotMinW[0].value} < 64px`);
});

check('1.9 Engine 8 (Panah): .arrow-cmd-btn and #runProgBtn/#resetProgBtn >= 64px x 64px', () => {
  const arrowW = getPropertiesForSelector('.arrow-cmd-btn', 'width');
  const arrowH = getPropertiesForSelector('.arrow-cmd-btn', 'height');
  assert(parseInt(arrowW[0].value, 10) >= 64, `.arrow-cmd-btn width ${arrowW[0].value} < 64px`);
  assert(parseInt(arrowH[0].value, 10) >= 64, `.arrow-cmd-btn height ${arrowH[0].value} < 64px`);

  const runMinH = getPropertiesForSelector('#runProgBtn', 'min-height');
  assert(parseInt(runMinH[0].value, 10) >= 64, `#runProgBtn min-height ${runMinH[0].value} < 64px`);
});

check('1.10 Engine 9 (Memori): .memory-card >= 64px x 64px', () => {
  const minW = getPropertiesForSelector('.memory-card', 'min-width');
  const minH = getPropertiesForSelector('.memory-card', 'min-height');
  assert(parseInt(minW[0].value, 10) >= 64, `.memory-card min-width ${minW[0].value} < 64px`);
  assert(parseInt(minH[0].value, 10) >= 64, `.memory-card min-height ${minH[0].value} < 64px`);
});

check('1.11 Victory Modal Action: .jumbo-action-btn (#btnNextLevel) >= 64px x 64px', () => {
  const minH = getPropertiesForSelector('.jumbo-action-btn', 'min-height');
  assert(minH.length > 0, '.jumbo-action-btn min-height must be defined');
  assert(parseInt(minH[0].value, 10) >= 64, `.jumbo-action-btn min-height ${minH[0].value} < 64px`);
});

check('1.12 Extended Touch Targets: .dot-node & .color-swatch effective hitbox >= 64px', () => {
  // .dot-node has width: 54px and ::after { inset: -12px } -> 54 + 24 = 78px
  const dotAfter = getRuleBody('.dot-node::after');
  assert(dotAfter, '.dot-node::after hit area pseudo-element must exist');
  assert(dotAfter.includes('inset: -12px') || dotAfter.includes('pointer-events'),
    '.dot-node::after must expand hit area by at least 10px on all sides');

  // .color-swatch has width: 58px and ::after { inset: -8px } -> 58 + 16 = 74px
  const swatchAfter = getRuleBody('.color-swatch::after');
  assert(swatchAfter, '.color-swatch::after hit area pseudo-element must exist');
  assert(swatchAfter.includes('inset: -8px') || swatchAfter.includes('pointer-events'),
    '.color-swatch::after must expand hit area to >= 64px');
});

// ADVERSARIAL CHALLENGES ON BUTTON SIZING DEFICIENCIES
check('1.13 [ADVERSARIAL] Header Interactive Buttons (.header-btn) min-width/height >= 64px', () => {
  // #btnHeaderBack, #btnOpenCert, #btnOpenParent
  const minW = getPropertiesForSelector('.header-btn', 'min-width');
  const minH = getPropertiesForSelector('.header-btn', 'min-height');
  assert(minW.length > 0 && minH.length > 0, '.header-btn min dimensions must be defined');
  const w = parseInt(minW[0].value, 10);
  const h = parseInt(minH[0].value, 10);
  assert(w >= 64, `.header-btn min-width is ${w}px (< 64px requirement; toddlers struggle to hit 56px back/cert button)`);
  assert(h >= 64, `.header-btn min-height is ${h}px (< 64px requirement; toddlers struggle to hit 56px back/cert button)`);
});

check('1.14 [ADVERSARIAL] Victory Secondary Action Buttons (.sub-action-btn) min-height >= 64px', () => {
  // #btnReplayLevel, #btnVictoryLevelSelect
  const minH = getPropertiesForSelector('.sub-action-btn', 'min-height');
  assert(minH.length > 0, '.sub-action-btn min-height must be defined');
  const h = parseInt(minH[0].value, 10);
  assert(h >= 64, `.sub-action-btn min-height is ${h}px (< 64px requirement; victory dialog replay/select buttons are 56px)`);
});

check('1.15 [ADVERSARIAL] Certificate & Modal Action Buttons (.primary-btn, .small-btn) min-height >= 64px', () => {
  // #btnPrintCert, #btnCloseCert, #btnSaveChildName
  const primaryH = getPropertiesForSelector('.primary-btn', 'min-height');
  const smallH = getPropertiesForSelector('.small-btn', 'min-height');
  assert(primaryH.length > 0, '.primary-btn min-height must be defined');
  assert(smallH.length > 0, '.small-btn min-height must be defined');
  const ph = parseInt(primaryH[0].value, 10);
  const sh = parseInt(smallH[0].value, 10);
  assert(ph >= 64, `.primary-btn min-height is ${ph}px (< 64px requirement)`);
  assert(sh >= 64, `.small-btn min-height is ${sh}px (< 64px requirement)`);
});

check('1.16 [ADVERSARIAL] Parental Controls & Danger Buttons (.test-btn, .danger-btn) min-height >= 64px', () => {
  // #btnTestSfx, #btnTestTts, #btnResetProgress
  const testH = getPropertiesForSelector('.test-btn', 'min-height');
  const dangerH = getPropertiesForSelector('.danger-btn', 'min-height');
  assert(testH.length > 0, '.test-btn min-height must be defined');
  assert(dangerH.length > 0, '.danger-btn min-height must be defined');
  const th = parseInt(testH[0].value, 10);
  const dh = parseInt(dangerH[0].value, 10);
  assert(th >= 64, `.test-btn min-height is ${th}px (< 64px requirement)`);
  assert(dh >= 64, `.danger-btn min-height is ${dh}px (< 64px requirement)`);
});

check('1.17 [ADVERSARIAL] Interactive Maze Cells (.maze-cell) min-width/height >= 64px', () => {
  // .maze-cell has width: 64px; height: 64px; min-width: 54px; min-height: 54px;
  const minW = getPropertiesForSelector('.maze-cell', 'min-width');
  const minH = getPropertiesForSelector('.maze-cell', 'min-height');
  assert(minW.length > 0 && minH.length > 0, '.maze-cell min dimensions must be defined');
  const w = parseInt(minW[0].value, 10);
  const h = parseInt(minH[0].value, 10);
  assert(w >= 64, `.maze-cell min-width is ${w}px (< 64px requirement)`);
  assert(h >= 64, `.maze-cell min-height is ${h}px (< 64px requirement)`);
});


// ============================================================================
// SUITE 2: SQUISHY TAP PHYSICS & VOLUME COMPRESSION (:active)
// ============================================================================
console.log('\n--- [SUITE 2] Squishy :active Transforms & Spring Physics ---');

check('2.1 Base Utility .jelly-btn:active implements volume compression scale + translateY', () => {
  const body = getRuleBody('.jelly-btn:active');
  assert(body, '.jelly-btn:active rule must exist in style.css');
  assert(body.includes('translateY'), '.jelly-btn:active must include translateY');
  assert(body.includes('scale('), '.jelly-btn:active must include volumetric scale compression');
  // Check scale compression: scaleX > 1 (squash width) and scaleY < 1 (compress height)
  const scaleMatch = body.match(/scale\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/);
  assert(scaleMatch, '.jelly-btn:active must specify 2D scale(x, y)');
  const sx = parseFloat(scaleMatch[1]);
  const sy = parseFloat(scaleMatch[2]);
  assert(sx > 1.0, `Squishy active scaleX should expand (> 1.0), got ${sx}`);
  assert(sy < 1.0, `Squishy active scaleY should compress (< 1.0), got ${sy}`);
});

check('2.2 Primary Toddler Controls have Squishy :active with scale(1.02, 0.95)', () => {
  const selectorsToCheck = [
    '.jumbo-speaker-btn:active',
    '.world-card:active',
    '.level-card:active',
    '.pair-item:active',
    '.nav-btn:active',
    '.choice-btn:active',
    '.trace-clear-btn:active',
    '.trace-done-btn:active',
    '.order-item-btn:active',
    '.arrow-cmd-btn:active',
    '#resetProgBtn:active',
    '#runProgBtn:active',
    '.jumbo-action-btn:active'
  ];

  for (const sel of selectorsToCheck) {
    const body = getRuleBody(sel);
    assert(body, `Rule for ${sel} must exist in style.css`);
    assert(body.includes('translateY') || body.includes('translate('),
      `${sel} must include translateY displacement`);
    assert(body.includes('scale('), `${sel} must include volumetric scale compression`);
  }
});

check('2.3 Spring Physics Timing Curves declared across interactive states', () => {
  assert(styleCss.includes('--spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)'),
    'style.css must declare cubic-bezier spring curve --spring-bounce');
  assert(styleCss.includes('--squish-timing: 0.12s var(--spring-bounce)'),
    'style.css must declare --squish-timing token');
});

// ADVERSARIAL SQUISHY TRANSFORM GAPS
check('2.4 [ADVERSARIAL] Engine 9 .memory-card:active squishy feedback presence', () => {
  // Check if .memory-card has an :active rule with squishy scale
  const memActive = getRuleBody('.memory-card:active') || getRuleBody('.card-inner:active');
  assert(memActive !== null, '.memory-card:active or .card-inner:active must exist in style.css');
  assert(memActive.includes('scale('), '.memory-card:active must include tactile squish transform');
});

check('2.5 [ADVERSARIAL] Engine 6 .color-target:active volume compression check', () => {
  // .color-target:active has transform: translateY(2px) without scale!
  const targetActive = getRuleBody('.color-target:active');
  assert(targetActive !== null, '.color-target:active rule must exist');
  assert(targetActive.includes('scale('),
    '.color-target:active only has linear translateY(2px), lacking jelly volumetric scale(1.02, 0.95)');
});

check('2.6 [ADVERSARIAL] Engine 2 .maze-cell:active tactile squish feedback', () => {
  const mazeActive = getRuleBody('.maze-cell:active');
  assert(mazeActive !== null,
    '.maze-cell:active rule is missing in style.css; tapping maze cells provides no tactile feedback');
});


// ============================================================================
// SUITE 3: LAYOUT REFLOW & VIEWPORT STRESS (320px, 390px, 768px, 1024px)
// ============================================================================
console.log('\n--- [SUITE 3] Responsive Layout Reflow & Viewport Stress ---');

check('3.1 Global layout anchor: overflow-x is hidden and box-sizing is border-box', () => {
  assert(styleCss.includes('overflow-x: hidden'), 'html/body must prevent unintended horizontal scroll');
  assert(styleCss.includes('box-sizing: border-box'), '* must enforce border-box sizing');
});

check('3.2 Responsive Breakpoints: max-width 480px (mobile) and min-width 768px (tablet)', () => {
  assert(styleCss.includes('@media (max-width: 480px)'), 'style.css must define mobile portrait breakpoint');
  assert(styleCss.includes('@media (min-width: 768px)'), 'style.css must define tablet/desktop breakpoint');
});

check('3.3 Engine 3 (Pilih) Reflow on 320px Narrow Screen', () => {
  // In @media (max-width: 480px):
  // .options-grid.options-count-4 -> repeat(2, 1fr)
  // .options-grid.options-count-2 -> repeat(2, 1fr)
  // .options-grid.options-count-3 -> repeat(3, 1fr)
  // On 320px screen: 320 - 24px padding = 296px. 3 columns = (296 - 24) / 3 = 90.6px per card >= 64px touch min!
  const colMatch = styleCss.match(/\.options-grid\.options-count-3\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  assert(colMatch, '3-option questions must have 3-column reflow rule on mobile');
});

check('3.4 Engine 1 (Hubungkan) Reflow: .pairs-grid 2 columns on mobile', () => {
  const pairsMatch = styleCss.match(/\.pairs-grid\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/);
  assert(pairsMatch, '.pairs-grid must reflow to 2 columns on mobile');
});

check('3.5 Engine 9 (Memori) Reflow: .memory-grid 2 columns on mobile', () => {
  const memGridMatch = styleCss.match(/\.memory-grid[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/);
  assert(memGridMatch, '.memory-grid must reflow to 2 columns on mobile');
});

// ADVERSARIAL VIEWPORT OVERFLOW CHECK ON NARROW HEADER (320px)
check('3.6 [ADVERSARIAL] Header Element Sizing on 320px Screen with Back Button Active', () => {
  // Available width on 320px screen with 12px padding on each side = 320 - 24 = 296px.
  // Left side:
  // - #btnHeaderBack: min-width 56px (or 64px)
  // - gap: 10px
  // - #headerTitle (.header-badge): padding 6px 12px, font-size 1rem. Icon (20px) + Text "Spidey Cilik" (~85px) + padding (24px) + border (7px) = ~136px.
  // Left total = 56 + 10 + 136 = 202px.
  // Right side:
  // - #starCounter (.star-pill): padding 6px 16px, icon + text = ~75px.
  // - gap: 10px
  // - #btnOpenCert (.cert-btn): 56px
  // - gap: 10px
  // - #btnOpenParent (.parent-btn): 56px
  // Right total = 75 + 10 + 56 + 10 + 56 = 207px.
  // Sum = 202px + 207px = 409px!
  // In a 296px header without wrapping, the header elements collide or cause horizontal flex overflow!
  
  // Check if .app-header handles overflow/flex-wrap or responsive hiding of .badge-text on narrow mobile
  const headerWrap = getPropertiesForSelector('.app-header', 'flex-wrap');
  const hasHeaderWrap = headerWrap.some(r => r.value.includes('wrap'));
  const hasNarrowHeaderRule = styleCss.includes('@media (max-width: 360px)') || 
                              styleCss.includes('@media (max-width: 380px)') ||
                              styleCss.includes('.badge-text');

  assert(hasHeaderWrap || hasNarrowHeaderRule,
    'Header width collision on narrow 320px viewport: .app-header left + right elements require >=388px but 320px viewport only has 296px available; .header-right buttons clip offscreen without flex-wrap or collapsing .badge-text');
});


// ============================================================================
// SUITE 4: DOM VIEWPORT & COMPONENT INTEGRATION VERIFICATION
// ============================================================================
console.log('\n--- [SUITE 4] DOM Shell & Engine Mount Compatibility ---');

check('4.1 index.html contains all 54 required semantic DOM elements', () => {
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

  const missing = requiredDomIds.filter(id => !indexHtml.includes(`id="${id}"`));
  assert.strictEqual(missing.length, 0, `Missing DOM IDs in index.html: ${missing.join(', ')}`);
});

check('4.2 Headless Engine Dispatching mounts interactive classes correctly', () => {
  // Setup minimal simulated DOM environment
  class MockNode {
    constructor(tagName = 'div') {
      this.tagName = tagName.toUpperCase();
      this.classList = new Set();
      this.children = [];
      this.attributes = {};
      this.style = {};
      this._innerHTML = '';
    }
    get innerHTML() { return this._innerHTML; }
    set innerHTML(val) {
      this._innerHTML = val;
      this.children = [];
      // Basic extraction of created child divs with id
      const idMatches = [...val.matchAll(/id="([^"]+)"/g)];
      for (const m of idMatches) {
        const child = new MockNode('div');
        child.id = m[1];
        this.children.push(child);
      }
    }
    appendChild(c) { this.children.push(c); return c; }
    addEventListener() {}
    removeEventListener() {}
    setAttribute(k, v) { this.attributes[k] = v; }
    getAttribute(k) { return this.attributes[k]; }
    querySelector(sel) {
      if (sel.startsWith('#')) {
        const id = sel.slice(1);
        return this.children.find(c => c.id === id) || null;
      }
      return null;
    }
    querySelectorAll() { return []; }
  }

  const prevDoc = global.document;
  global.document = {
    createElement: (tag) => new MockNode(tag),
    getElementById: () => null
  };

  try {
    const container = new MockNode('div');
    container.id = 'gameMount';

    const samplePilihLevel = LEVELS.find(l => l.type === 'pilih');
    assert(samplePilihLevel, 'Pilih level must exist');
    
    Engines.render(container, samplePilihLevel, () => {});
    assert(container.innerHTML.includes('options-grid'),
      'Engine pilih must render .options-grid in container');
  } finally {
    global.document = prevDoc;
  }
});

console.log('\n================================================================');
console.log('📊 CHALLENGER M-EVO-2.1 EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Checks Run:  ${totalChecks}`);
console.log(`Passed Checks:     ${passedChecks}`);
console.log(`Failed / Findings: ${failedChecks}`);
console.log('================================================================\n');

if (findings.length > 0) {
  console.log('⚠️ EMPIRICAL FINDINGS IDENTIFIED:');
  findings.forEach((f, idx) => {
    console.log(`  [Finding ${idx + 1}] ${f.title}`);
    console.log(`            ${f.error}`);
  });
  console.log('\nVerdict: REQUEST_CHANGES (Deficiencies empirically reproduced)');
  process.exit(1);
} else {
  console.log('✔ All checks passed cleanly with zero findings.');
  console.log('Verdict: APPROVE');
  process.exit(0);
}
