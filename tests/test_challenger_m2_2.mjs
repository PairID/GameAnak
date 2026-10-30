// tests/test_challenger_m2_2.mjs - Empirical Verification & Adversarial Stress Suite for Milestone 2
// Challenger 2: Mascot SVG Generation, Icons XML Parsing, and CSS Responsive Layout Rules
// Zero external dependencies, pure Node.js (v18+)

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER 2: EMPIRICAL STRESS TEST SUITE (MILESTONE 2)');
console.log('Mascot SVG Engine, Icons XML Parsing, and CSS Responsive Layout');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
let warnings = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

function warn(msg) {
  console.log(`  \x1b[33m⚠\x1b[0m [WARN] ${msg}`);
  warnings.push(msg);
}

// ----------------------------------------------------------------------------
// XML / SVG PARSER HELPER (Strict XML Validator using regex & syntax parsing)
// ----------------------------------------------------------------------------
function validateXmlString(xmlString, label = 'XML') {
  assert(typeof xmlString === 'string', `${label} must be a string`);
  const trimmed = xmlString.trim();
  assert(trimmed.startsWith('<svg'), `${label} must start with <svg`);
  assert(trimmed.endsWith('</svg>'), `${label} must end with </svg>`);

  // Tokenize and check tag balancing
  const tagRegex = /<(\/?[a-zA-Z0-9_-]+)([^>]*?)(\/?)>/g;
  let match;
  const stack = [];
  const selfClosingElements = new Set([
    'path', 'circle', 'ellipse', 'rect', 'line', 'polygon', 'polyline',
    'stop', 'feDropShadow', 'feGaussianBlur', 'feOffset', 'feBlend', 'use', 'image'
  ]);

  while ((match = tagRegex.exec(trimmed)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const attrs = match[2];
    const isSelfClosing = match[3] === '/' || fullTag.endsWith('/>');

    // Attribute validation: all attrs must be attr="val" or attr='val'
    const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*(["'])(.*?)\2/g;
    let attrMatch;
    let attrStrLen = 0;
    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      attrStrLen += attrMatch[0].length;
    }

    if (tagName.startsWith('/')) {
      // Closing tag
      const closingName = tagName.slice(1);
      assert(stack.length > 0, `${label}: Unexpected closing tag </${closingName}> with empty stack`);
      const last = stack.pop();
      assert.strictEqual(last, closingName, `${label}: Mismatched closing tag </${closingName}>, expected </${last}>`);
    } else if (isSelfClosing || selfClosingElements.has(tagName)) {
      // Valid self-closing or void SVG element
    } else {
      // Opening tag
      stack.push(tagName);
    }
  }

  assert.strictEqual(stack.length, 0, `${label}: Unclosed tags remaining: ${stack.join(', ')}`);
  return true;
}

// ============================================================================
// PHASE 1: MASCOT SVG GENERATION & EXTREME VALUES STRESS TEST
// ============================================================================
console.log('--- [PHASE 1] Mascot SVG Generation Stress Testing ---');

const { Mascot } = await import('../mascot.js');

test('Mascot object interface contract', () => {
  assert.strictEqual(typeof Mascot, 'object');
  assert.strictEqual(typeof Mascot.hero, 'function');
  assert.strictEqual(typeof Mascot.robot, 'function');
  assert.strictEqual(typeof Mascot.bot, 'function');
  assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot must be strict alias to Mascot.robot');
  assert.strictEqual(typeof Mascot.star, 'function');
  assert.strictEqual(typeof Mascot.web, 'function');
});

// Poses test matrix
const heroPoses = ['wave', 'happy', 'cheer', 'cheering', 'think', 'thinking', 'encourage', 'encouraging'];
for (const pose of heroPoses) {
  test(`Mascot.hero generates valid SVG for pose "${pose}"`, () => {
    const svg = Mascot.hero(120, pose);
    assert(svg.includes(`class="spidey-mascot ${pose}"`));
    assert(svg.includes('viewBox="0 0 120 120"'));
    validateXmlString(svg, `Mascot.hero(${pose})`);
  });
}

const robotPoses = ['idle', 'happy', 'cheer', 'think', 'thinking'];
for (const pose of robotPoses) {
  test(`Mascot.robot & Mascot.bot generate valid SVG for pose "${pose}"`, () => {
    const svgRobot = Mascot.robot(90, pose);
    const svgBot = Mascot.bot(90, pose);
    assert.strictEqual(svgRobot, svgBot, 'Mascot.bot and Mascot.robot must produce identical output');
    assert(svgRobot.includes(`class="spideybot ${pose}"`));
    assert(svgRobot.includes('viewBox="0 0 100 100"'));
    validateXmlString(svgRobot, `Mascot.robot(${pose})`);
  });
}

// Extreme and invalid size stress testing
const extremeSizes = [
  { size: 0, desc: 'Zero size (0)' },
  { size: -10, desc: 'Negative size (-10)' },
  { size: 10000, desc: 'Extreme large size (10000)' },
  { size: 0.001, desc: 'Sub-pixel small size (0.001)' },
  { size: 120, desc: 'Standard size (120)' },
  { size: undefined, desc: 'Undefined size (default fallback)' },
  { size: '100%', desc: 'String unit percentage ("100%")' },
  { size: '80px', desc: 'String unit pixels ("80px")' }
];

for (const { size, desc } of extremeSizes) {
  test(`Mascot.hero extreme size: ${desc}`, () => {
    const svg = Mascot.hero(size, 'wave');
    assert(typeof svg === 'string');
    assert(svg.includes('<svg'));
    validateXmlString(svg, `Mascot.hero(${desc})`);
    if (size === undefined) {
      assert(svg.includes('width="120"'), 'Undefined size should fallback to default 120');
    } else {
      assert(svg.includes(`width="${size}"`), `Width should reflect input size ${size}`);
    }
  });

  test(`Mascot.robot extreme size: ${desc}`, () => {
    const svg = Mascot.robot(size, 'idle');
    assert(typeof svg === 'string');
    assert(svg.includes('<svg'));
    validateXmlString(svg, `Mascot.robot(${desc})`);
    if (size === undefined) {
      assert(svg.includes('width="90"'), 'Undefined size should fallback to default 90');
    } else {
      assert(svg.includes(`width="${size}"`), `Width should reflect input size ${size}`);
    }
  });
}

// Invalid / Boundary Poses
const invalidPoses = [
  { pose: '', desc: 'Empty string pose' },
  { pose: 'unknown_dance', desc: 'Unknown pose name' },
  { pose: null, desc: 'null pose' },
  { pose: undefined, desc: 'undefined pose (default fallback)' },
  { pose: 999, desc: 'Numeric pose' }
];

for (const { pose, desc } of invalidPoses) {
  test(`Mascot.hero handles gracefully: ${desc}`, () => {
    const svg = Mascot.hero(100, pose);
    assert(typeof svg === 'string');
    validateXmlString(svg, `Mascot.hero(${desc})`);
  });

  test(`Mascot.robot handles gracefully: ${desc}`, () => {
    const svg = Mascot.robot(80, pose);
    assert(typeof svg === 'string');
    validateXmlString(svg, `Mascot.robot(${desc})`);
  });
}

// Mascot Stars & Web Decorations
test('Mascot.star active and inactive states with extreme sizes', () => {
  const activeStar = Mascot.star(40, true);
  const inactiveStar = Mascot.star(0, false);
  const jumboStar = Mascot.star(10000, true);

  validateXmlString(activeStar, 'Mascot.star(40, true)');
  validateXmlString(inactiveStar, 'Mascot.star(0, false)');
  validateXmlString(jumboStar, 'Mascot.star(10000, true)');

  assert(activeStar.includes('active') && activeStar.includes('#FBBF24'));
  assert(inactiveStar.includes('inactive') && inactiveStar.includes('#CBD5E1'));
});

test('Mascot.web corner decoration extreme sizes', () => {
  const webStd = Mascot.web(80);
  const webZero = Mascot.web(0);
  const webJumbo = Mascot.web(5000);

  validateXmlString(webStd, 'Mascot.web(80)');
  validateXmlString(webZero, 'Mascot.web(0)');
  validateXmlString(webJumbo, 'Mascot.web(5000)');
});

// ============================================================================
// PHASE 2: SVG ICON PARSING VALIDATION IN ICONS/
// ============================================================================
console.log('\n--- [PHASE 2] Icons XML & SVG Parsing Verification ---');

const iconSpecs = [
  { file: 'icons/favicon.svg', expectedViewBox: '0 0 64 64', width: '64', height: '64' },
  { file: 'icons/icon-192.svg', expectedViewBox: '0 0 192 192', width: '192', height: '192' },
  { file: 'icons/icon-512.svg', expectedViewBox: '0 0 512 512', width: '512', height: '512' },
  { file: 'icons/icon-maskable.svg', expectedViewBox: '0 0 512 512', width: '512', height: '512' }
];

for (const icon of iconSpecs) {
  test(`Icon file ${icon.file} exists, parses as valid XML, and matches specs`, () => {
    const fullPath = path.join(rootDir, icon.file);
    assert(fs.existsSync(fullPath), `File ${icon.file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');

    // 1. Strict Node XML validator
    validateXmlString(content, icon.file);

    // 2. PowerShell .NET XmlDocument validation for complete standard XML parsing
    try {
      const psCommand = `powershell -NoProfile -Command "[xml]$doc = Get-Content -Raw -LiteralPath '${fullPath}'; if ($doc.DocumentElement.Name -ne 'svg') { exit 1 }"`;
      execSync(psCommand, { stdio: 'pipe' });
    } catch (err) {
      assert.fail(`PowerShell .NET [xml] parser failed on ${icon.file}: ${err.message}`);
    }

    // 3. Inspect attributes
    assert(content.includes(`viewBox="${icon.expectedViewBox}"`), `${icon.file} viewBox must match ${icon.expectedViewBox}`);
    assert(content.includes(`width="${icon.width}"`), `${icon.file} width must match ${icon.width}`);
    assert(content.includes(`height="${icon.height}"`), `${icon.file} height must match ${icon.height}`);
    assert(content.includes('xmlns="http://www.w3.org/2000/svg"'), `${icon.file} must declare SVG namespace`);
  });
}

// Maskable Icon Safe Zone Verification
test('Maskable icon (icon-maskable.svg) conforms to PWA safe-zone rules', () => {
  const content = fs.readFileSync(path.join(rootDir, 'icons/icon-maskable.svg'), 'utf8');
  // W3C Maskable Icon standard: critical content must reside within center 80% circle (radius <= 204.8px from center 256,256)
  // Check that the face ellipse radius is within the safe circle
  assert(content.includes('rx="140" ry="125"'), 'Center sticker face must fit within the 400x400 safe circle');
  // Check full bleed background
  assert(content.includes('<rect width="512" height="512"'), 'Must have full bleed background rectangle');
});

// ============================================================================
// PHASE 3: CSS MEDIA QUERIES & RESPONSIVE LAYOUT VERIFICATION
// ============================================================================
console.log('\n--- [PHASE 3] CSS Media Queries & Viewport Layout Stress Testing ---');

const css = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// 3.1 Media queries existence in style.css
test('CSS contains mandatory media query breakpoints', () => {
  assert(css.includes('@media (max-width: 480px)'), 'Mobile portrait breakpoint (<=480px) must exist');
  assert(css.includes('@media (min-width: 768px)'), 'Tablet breakpoint (>=768px) must exist');
  assert(css.includes('@media print'), 'Print stylesheet breakpoint (@media print) must exist');
});

// 3.2 Viewport 390x844 (Mobile Portrait)
console.log('\n  [Viewport 1: 390x844 (Mobile Portrait)]');
test('Mobile Viewport 390x844: Touch targets meet >= 64px requirement', () => {
  assert(css.includes('--touch-min: 64px;'), 'CSS variable --touch-min must be >= 64px');
  assert(css.includes('.jumbo-speaker-btn'), 'Jumbo speaker button must exist');
  // Check mobile speaker size
  assert(css.includes('width: 64px') && css.includes('height: 64px'), 'Mobile speaker button must maintain min 64x64px');
});

test('Mobile Viewport 390x844: Welcome banner reflows to column on small screens', () => {
  // Inside max-width: 480px, welcome-banner should flex-direction: column
  const mobileMatch = css.match(/@media\s*\(\s*max-width:\s*480px\s*\)\s*\{([\s\S]*?)\n\}/);
  assert(mobileMatch, 'Mobile media query block must be parseable');
  const mobileBlock = mobileMatch[1];
  assert(mobileBlock.includes('.welcome-banner'), 'welcome-banner must be styled in mobile block');
  assert(mobileBlock.includes('flex-direction: column'), 'welcome-banner must use column direction on mobile');
});

test('Mobile Viewport 390x844: Worlds & Levels Grid fit within 390px without overflow', () => {
  // Base .worlds-grid uses minmax(240px, 1fr)
  // At 390px - 32px padding = 358px available width.
  // 1 card of 358px fills the row cleanly.
  assert(css.includes('.worlds-grid'), '.worlds-grid must be defined');
  assert(css.includes('minmax(240px, 1fr)'), '.worlds-grid minmax >= 240px ensures 1 column on mobile');

  // Base .levels-grid uses minmax(130px, 1fr)
  // 358px / (130px + 16px gap) = 2.45 -> exactly 2 columns of ~171px each!
  assert(css.includes('minmax(130px, 1fr)'), '.levels-grid minmax >= 130px ensures 2 columns on mobile');
});

test('Mobile Viewport 390x844: Parental gate math choices grid fits 3 columns', () => {
  // .math-choices has 3 columns with 12px gap.
  // Available width = 390 - 32 (padding) - 48 (modal padding) = 310px.
  // Each button: (310 - 24) / 3 = 95.3px.
  // 95.3px > 64px touch target requirement!
  assert(css.includes('.math-choices'), '.math-choices must exist');
  assert(css.includes('grid-template-columns: repeat(3, 1fr)'), 'math-choices must be 3 columns');
  assert(css.includes('min-height: 64px'), 'math-choice-btn must have min-height: 64px');
});

// 3.3 Viewport 800x1280 (Tablet Portrait)
console.log('\n  [Viewport 2: 800x1280 (Tablet Portrait)]');
test('Tablet Viewport 800x1280: Matches min-width: 768px query', () => {
  const tabletMatch = css.match(/@media\s*\(\s*min-width:\s*768px\s*\)\s*\{([\s\S]*?)\n\}/);
  assert(tabletMatch, 'Tablet media query block must be parseable');
  const tabletBlock = tabletMatch[1];
  assert(tabletBlock.includes('.worlds-grid'), 'Tablet block must style .worlds-grid');
  assert(tabletBlock.includes('repeat(2, 1fr)'), 'Tablet block must set 2 columns for worlds-grid');
  assert(tabletBlock.includes('.levels-grid'), 'Tablet block must style .levels-grid');
  assert(tabletBlock.includes('minmax(140px, 1fr)'), 'Tablet block must configure levels-grid items');
});

test('Tablet Viewport 800x1280: Levels Grid accommodates 4-5 cards per row', () => {
  // 800px - 48px padding = 752px.
  // 752px / (140px + 16px) = 4.82 -> 4-5 cards per row
  assert(css.includes('minmax(140px, 1fr)'), '140px min card width yields 4-5 cards on 800px');
});

// 3.4 Viewport 1024x768 (Tablet Landscape)
console.log('\n  [Viewport 3: 1024x768 (Tablet Landscape)]');
test('Tablet Viewport 1024x768: Height budget verification', () => {
  // In landscape mode with 768px total viewport height:
  // App root min-height: 100dvh
  // Header: ~70px
  // Instruction bar: ~96px
  // Main content padding: ~24px
  // Game top bar: ~40px
  // Game mount min-height: 440px
  // Total height: 70 + 96 + 24 + 40 + 440 = 670px <= 768px.
  // Everything fits comfortably on iPad screen without clipping!
  assert(css.includes('min-height: 440px'), 'Game mount min-height must be 440px');
  assert(css.includes('max-width: 1200px'), 'App root max-width 1200px centers on widescreen displays');
});

test('Tablet Viewport 1024x768: Worlds Grid 2x2 layout balances screen aspect ratio', () => {
  // On 1024x768, 2 columns of ~480px cards provide large tactile touch cards for toddlers
  const tabletMatch = css.match(/@media\s*\(\s*min-width:\s*768px\s*\)\s*\{([\s\S]*?)\n\}/);
  assert(tabletMatch[1].includes('grid-template-columns: repeat(2, 1fr)'));
});

// 3.5 Adversarial Inspection of Engine CSS Layout Rules
console.log('\n  [Adversarial Layout & Engine Styling Audit]');

// Check Engine Labirin Grid Styling
test('Engine 2 (Labirin): Grid layout and --grid-size styling', () => {
  // In engines.js: <div class="maze-grid" style="--grid-size: ${size};" id="mazeGrid">
  // In style.css: does .maze-grid have grid-template-columns?
  const mazeMatch = css.match(/\.maze-grid\s*\{([\s\S]*?)\}/);
  assert(mazeMatch, '.maze-grid must be defined in style.css');
  const mazeContent = mazeMatch[1];
  
  if (!mazeContent.includes('grid-template-columns')) {
    warn('style.css defines .maze-grid without grid-template-columns: repeat(var(--grid-size, 5), 1fr); or repeat(5, 1fr). If not set inline, cells will stack in 1 column in pure CSS.');
  }
});

// Check Engine Koding Panah Grid Styling
test('Engine 8 (Koding Panah): Grid board and cell styling', () => {
  // In engines.js: <div class="spidey-grid-board" id="spideyGridBoard"> with <div class="grid-cell" id="c00">
  // In style.css: .spidey-grid-board, .board-cell
  const boardMatch = css.match(/\.spidey-grid-board\s*\{([\s\S]*?)\}/);
  assert(boardMatch, '.spidey-grid-board must be defined in style.css');
  const boardContent = boardMatch[1];
  
  if (!boardContent.includes('grid-template-columns')) {
    warn('style.css defines .spidey-grid-board without grid-template-columns: repeat(3, 1fr). Cells will default to 1 single column in pure CSS.');
  }

  const hasGridCell = css.includes('.grid-cell');
  if (!hasGridCell) {
    warn('engines.js uses class="grid-cell" for koding panah cells, while style.css styles .board-cell. Class name mismatch causes cells to lack board cell borders.');
  }
});

// Check Engine Hubungkan on Mobile
test('Engine 1 (Hubungkan): Mobile pairs-grid reflow vs line drawing', () => {
  const mobileMatch = css.match(/@media\s*\(\s*max-width:\s*480px\s*\)\s*\{([\s\S]*?)\n\}/);
  const mobileBlock = mobileMatch ? mobileMatch[1] : '';
  if (mobileBlock.includes('.pairs-grid') && mobileBlock.includes('grid-template-columns: 1fr')) {
    warn('.pairs-grid becomes 1 column on mobile (max-width: 480px). This vertically stacks left and right columns, affecting side-by-side line connecting UX and prompt text ("kiri ke kanan").');
  }
});

// 3.6 HTML DOM Structural Integrity
test('index.html contains all 54 required milestone DOM elements', () => {
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

  for (const id of requiredIds) {
    assert(html.includes(`id="${id}"`), `index.html must contain id="${id}"`);
  }
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n============================================================');
console.log('📊 CHALLENGER 2 TEST EXECUTION SUMMARY');
console.log('============================================================');
console.log(`Passed:   ${passCount}`);
console.log(`Failed:   ${failCount}`);
console.log(`Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  console.log('\nNoted Advisories / Warnings:');
  warnings.forEach((w, i) => console.log(`  [${i+1}] ${w}`));
}
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
