// tests/forensic_audit_m2.mjs - Independent Forensic Audit Suite for Milestone 2
import fs from 'node:fs';
import assert from 'node:assert';

console.log('============================================================');
console.log('🔍 FORENSIC AUDIT SUITE — MILESTONE 2 (UI SHELL & MASCOTS)');
console.log('============================================================');

let passedChecks = 0;
let failedChecks = 0;

function report(name, pass, details = '') {
  if (pass) {
    passedChecks++;
    console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
  } else {
    failedChecks++;
    console.log(`[FAIL] ${name} ${details ? ': ' + details : ''}`);
  }
}

// --------------------------------------------------------------------------
// 1. ZERO FABRICATION & PROHIBITED KEYWORDS CHECK
// --------------------------------------------------------------------------
console.log('\n--- PHASE 1: Zero Fabrication & Anti-Cheating Keyword Check ---');

const deliverables = [
  'index.html',
  'style.css',
  'mascot.js',
  'icons/favicon.svg',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
  'icons/icon-maskable.svg'
];

const suspiciousTerms = [
  { term: 'TODO', regex: /\bTODO\b/i },
  { term: 'FIXME', regex: /\bFIXME\b/i },
  { term: 'LOREM IPSUM', regex: /lorem\s+ipsum/i },
  { term: 'STUB', regex: /\bstub\b/i },
  { term: 'DUMMY', regex: /\bdummy\b/i },
  { term: 'PLACEHOLDER TEXT', regex: /placeholder text/i },
  { term: 'MOCK IMPLEMENTATION', regex: /mock implementation/i },
  { term: 'HARDCODED PASS', regex: /return\s+true\s*\/\/\s*bypass/i }
];

for (const file of deliverables) {
  assert(fs.existsSync(file), `File ${file} must exist`);
  const content = fs.readFileSync(file, 'utf8');
  let clean = true;
  for (const { term, regex } of suspiciousTerms) {
    const match = content.match(regex);
    if (match) {
      report(`Suspicious term in ${file}`, false, `Found "${match[0]}"`);
      clean = false;
    }
  }
  if (clean) {
    report(`Zero fabrication in ${file}`, true, 'No stubs, mocks, or placeholders');
  }
}

// --------------------------------------------------------------------------
// 2. DOM STRUCTURE & ID UNIQUENESS CHECK (index.html)
// --------------------------------------------------------------------------
console.log('\n--- PHASE 2: DOM Hierarchy, Semantic Shell & Accessibility ---');

const html = fs.readFileSync('index.html', 'utf8');
report('HTML5 Doctype', html.startsWith('<!DOCTYPE html>'));
report('Indonesian Language tag', html.includes('<html lang="id">'));
report('Responsive Meta Viewport with viewport-fit=cover', html.includes('viewport-fit=cover'));
report('Theme Color #EF4444', html.includes('content="#EF4444"'));
report('Manifest Link', html.includes('href="manifest.webmanifest"'));
report('Style.css Link', html.includes('href="style.css"'));
report('Module Scripts Modulepreload', html.includes('rel="modulepreload" href="audio.js"'));

const idRegex = /id="([^"]+)"/g;
let match;
const allIds = [];
const idCounts = {};
while ((match = idRegex.exec(html)) !== null) {
  const id = match[1];
  allIds.push(id);
  idCounts[id] = (idCounts[id] || 0) + 1;
}

const duplicateIds = Object.entries(idCounts).filter(([_, count]) => count > 1);
report('DOM ID Uniqueness', duplicateIds.length === 0, `${allIds.length} IDs checked, 0 duplicates`);

// Verify critical UI hierarchy
report('Header back button', html.includes('id="btnHeaderBack"'));
report('Header title Spidey Cilik', html.includes('id="headerTitle"'));
report('Star counter display', html.includes('id="starCounter"') && html.includes('id="totalStarsCount"'));
report('Certificate trigger button', html.includes('id="btnOpenCert"'));
report('Parent mode trigger button with hold indicator', html.includes('id="btnOpenParent"') && html.includes('id="parentHoldProgress"'));
report('Instruction bar with jumbo speaker', html.includes('id="instructionBar"') && html.includes('id="btnSpeakPrompt"'));
report('Instruction prompt text & mascot bubble', html.includes('id="promptText"') && html.includes('id="mascotBubble"'));
report('Three main views container', html.includes('id="viewWorlds"') && html.includes('id="viewLevels"') && html.includes('id="viewGame"'));
report('Game mount anchor for engines', html.includes('id="gameMount"'));
report('Victory modal with confetti canvas', html.includes('id="modalVictory"') && html.includes('id="confettiCanvas"'));
report('Certificate modal with printable sheet', html.includes('id="modalCertificate"') && html.includes('id="printableCertificate"'));
report('Parental modal with math gate & dashboard', html.includes('id="modalParent"') && html.includes('id="parentGateSection"') && html.includes('id="parentDashboardSection"'));

// --------------------------------------------------------------------------
// 3. TACTILE STICKER DESIGN SYSTEM & CSS COMPLIANCE (style.css)
// --------------------------------------------------------------------------
console.log('\n--- PHASE 3: Tactile Sticker Design System & Responsive CSS ---');

const css = fs.readFileSync('style.css', 'utf8');
report('Warm Eye-Friendly Background (#FFF9F0)', css.includes('#FFF9F0'));
report('Spidey Red Palette (#EF4444)', css.includes('#EF4444'));
report('Web Blue Palette (#2563EB)', css.includes('#2563EB'));
report('Sun Yellow Palette (#FBBF24)', css.includes('#FBBF24'));
report('Leaf Green Palette (#10B981)', css.includes('#10B981'));
report('Purple Accent Palette (#8B5CF6)', css.includes('#8B5CF6'));
report('Dark Slate Border (#1E293B)', css.includes('#1E293B'));
report('Thick 3.5px Solid Border Definition', css.includes('--border-thick: 3.5px solid #1E293B'));
report('Layered 3D Tactile Sticker Shadows', css.includes('--sticker-shadow: 0 6px 0 #1E293B'));
report('Minimum Touch Target 64px Definition', css.includes('--touch-min: 64px'));
report('Jumbo Touch Target 80px Definition', css.includes('--touch-jumbo: 80px'));
report('Touch Manipulation & Safe Overscroll', css.includes('touch-action: manipulation') && css.includes('overscroll-behavior: none'));
report('Prevent Unintended Text Selection', css.includes('user-select: none'));
report('Trace Canvas Touch-Action: None', css.includes('#traceCanvas') && css.includes('touch-action: none'));
report('Non-Punitive Gentle Wobble Keyframes', css.includes('@keyframes gentleWobble'));
report('Mascot Floating Keyframes', css.includes('@keyframes mascotFloat'));
report('Star Pulse Keyframes', css.includes('@keyframes starPulse'));
report('Star Pop Celebration Keyframes', css.includes('@keyframes starPop'));
report('3D Card Flip Perspective & Preserve-3D', css.includes('perspective: 1000px') && css.includes('transform-style: preserve-3d'));
report('3D Card Backface Visibility Hidden', css.includes('backface-visibility: hidden'));
report('Card Flip 180deg Transform', css.includes('rotateY(180deg)'));
report('Print Media Query (@media print)', css.includes('@media print'));
report('Print A4 Landscape Setup', css.includes('size: A4 landscape'));
report('Print Chrome Hidden (!important)', css.includes('.app-header') && css.includes('display: none !important'));
report('Mobile Portrait Media Query (<= 480px)', css.includes('@media (max-width: 480px)'));
report('Tablet Landscape Media Query (>= 768px)', css.includes('@media (min-width: 768px)'));

// --------------------------------------------------------------------------
// 4. MASCOT SYSTEM VECTOR VALIDATION & DYNAMIC RENDERING (mascot.js)
// --------------------------------------------------------------------------
console.log('\n--- PHASE 4: Vector Mascot System & Pose Variety ---');

const { Mascot } = await import('../mascot.js');

report('Mascot Object Export', typeof Mascot === 'object' && Mascot !== null);
report('Mascot.hero Functionality', typeof Mascot.hero === 'function');
report('Mascot.robot Functionality', typeof Mascot.robot === 'function');
report('Mascot.star Functionality', typeof Mascot.star === 'function');
report('Mascot.web Functionality', typeof Mascot.web === 'function');
report('Mascot.bot Alias to Mascot.robot', Mascot.bot === Mascot.robot);

const poses = ['wave', 'happy', 'cheer', 'cheering', 'think', 'thinking', 'encourage', 'encouraging'];
for (const p of poses) {
  const svg = Mascot.hero(100, p);
  const isValid = svg.includes('<svg') && svg.includes('</svg>') && svg.includes('viewBox="0 0 120 120"') && svg.includes(`class="spidey-mascot ${p}"`);
  report(`Mascot.hero pose: ${p}`, isValid, `Length: ${svg.length} chars`);
}

const robotPoses = ['idle', 'cheer', 'happy', 'think', 'thinking'];
for (const p of robotPoses) {
  const svg = Mascot.robot(90, p);
  const isValid = svg.includes('<svg') && svg.includes('</svg>') && svg.includes('viewBox="0 0 100 100"') && svg.includes(`class="spideybot ${p}"`);
  report(`Mascot.robot pose: ${p}`, isValid, `Length: ${svg.length} chars`);
}

const starActive = Mascot.star(40, true);
const starInactive = Mascot.star(40, false);
report('Mascot.star active state', starActive.includes('fill="#FBBF24"') && starActive.includes('active'));
report('Mascot.star inactive state', starInactive.includes('fill="#CBD5E1"') && starInactive.includes('inactive'));

const webSvg = Mascot.web(80);
report('Mascot.web corner decoration', webSvg.includes('<svg') && webSvg.includes('class="corner-web"'));

// --------------------------------------------------------------------------
// 5. PWA & FAVICON VECTOR ASSETS INTEGRITY (icons/)
// --------------------------------------------------------------------------
console.log('\n--- PHASE 5: PWA Icon Scalable Vector Graphics Integrity ---');

const iconSpecs = [
  { file: 'icons/favicon.svg', w: '64', h: '64', vb: '0 0 64 64' },
  { file: 'icons/icon-192.svg', w: '192', h: '192', vb: '0 0 192 192' },
  { file: 'icons/icon-512.svg', w: '512', h: '512', vb: '0 0 512 512' },
  { file: 'icons/icon-maskable.svg', w: '512', h: '512', vb: '0 0 512 512' }
];

for (const spec of iconSpecs) {
  const content = fs.readFileSync(spec.file, 'utf8');
  const hasSvgTag = content.includes('<svg') && content.includes('</svg>');
  const hasWidth = content.includes(`width="${spec.w}"`);
  const hasHeight = content.includes(`height="${spec.h}"`);
  const hasVb = content.includes(`viewBox="${spec.vb}"`);
  const hasDef = content.includes('<defs>');
  const hasPaths = content.includes('<path') || content.includes('<ellipse') || content.includes('<polygon');
  
  report(
    `Vector Icon: ${spec.file}`,
    hasSvgTag && hasWidth && hasHeight && hasVb && hasDef && hasPaths,
    `${spec.w}x${spec.h}, ${content.length} bytes, genuine vectors`
  );
}

// --------------------------------------------------------------------------
// 6. SUMMARY & VERDICT
// --------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`📊 FORENSIC AUDIT SUMMARY: ${passedChecks} Passed | ${failedChecks} Failed`);
console.log('============================================================');

if (failedChecks === 0) {
  console.log('🏁 VERDICT: CLEAN');
  process.exit(0);
} else {
  console.log('🚨 VERDICT: INTEGRITY VIOLATION');
  process.exit(1);
}
