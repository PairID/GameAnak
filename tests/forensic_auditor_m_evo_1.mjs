// tests/forensic_auditor_m_evo_1.mjs
// Independent Forensic Audit Script for Milestone M-EVO-1
// Zero-Dependency, Native Node.js (v18+)

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('============================================================');
console.log('🔎 FORENSIC AUDIT RUNNER: MILESTONE M-EVO-1');
console.log('   Lingokids Character & Mascot System Independent Audit');
console.log('============================================================\n');

let passCount = 0;
let failCount = 0;
const findings = [];

function check(title, condition, details = '') {
  if (condition) {
    passCount++;
    console.log(`[PASS] ${title} ${details ? '(' + details + ')' : ''}`);
  } else {
    failCount++;
    const msg = `[FAIL] ${title} ${details ? ': ' + details : ''}`;
    console.error(msg);
    findings.push(msg);
  }
}

// ----------------------------------------------------------------------------
// PHASE 1: SOURCE CODE ANALYSIS & ZERO FABRICATION
// ----------------------------------------------------------------------------
console.log('--- PHASE 1: Zero Fabrication & Anti-Cheating Analysis ---');

const mascotContent = fs.readFileSync(path.join(ROOT_DIR, 'mascot.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');

const bannedTerms = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bSTUB\b/i,
  /\bPLACEHOLDER\b/i,
  /\bLOREM\s+IPSUM\b/i,
  /\bMOCK\b/i,
  /\bTEMP_DATA\b/i,
  /return\s+["']dummy/i,
  /return\s+["']placeholder/i,
  /return\s+["']<svg><\/svg>["']/i
];

for (const pattern of bannedTerms) {
  const matchMascot = mascotContent.match(pattern);
  check(`Banned term in mascot.js: ${pattern}`, !matchMascot, matchMascot ? `Found: ${matchMascot[0]}` : 'Clean');
}

// Check for facade functions (functions returning static trivial constants)
const isFacadeHero = /hero\s*\([^)]*\)\s*\{\s*return\s+['"`][^'"`]{0,50}['"`];?\s*\}/.test(mascotContent);
const isFacadeRobot = /robot\s*\([^)]*\)\s*\{\s*return\s+['"`][^'"`]{0,50}['"`];?\s*\}/.test(mascotContent);
const isFacadeCat = /cat\s*\([^)]*\)\s*\{\s*return\s+['"`][^'"`]{0,50}['"`];?\s*\}/.test(mascotContent);
const isFacadeBunny = /bunny\s*\([^)]*\)\s*\{\s*return\s+['"`][^'"`]{0,50}['"`];?\s*\}/.test(mascotContent);
const isFacadePanda = /panda\s*\([^)]*\)\s*\{\s*return\s+['"`][^'"`]{0,50}['"`];?\s*\}/.test(mascotContent);

check('Facade detection hero()', !isFacadeHero, 'Contains rich procedural generation');
check('Facade detection robot()', !isFacadeRobot, 'Contains rich procedural generation');
check('Facade detection cat()', !isFacadeCat, 'Contains rich procedural generation');
check('Facade detection bunny()', !isFacadeBunny, 'Contains rich procedural generation');
check('Facade detection panda()', !isFacadePanda, 'Contains rich procedural generation');

// ----------------------------------------------------------------------------
// PHASE 2: GEOMETRIC & VECTOR AUTHENTICITY VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- PHASE 2: Geometric & Vector Authenticity Verification ---');

const { Mascot } = await import(pathToFileURL(path.join(ROOT_DIR, 'mascot.js')).href);

check('Mascot is non-null object', typeof Mascot === 'object' && Mascot !== null);

const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];

for (const char of characters) {
  check(`Mascot.${char} is a function`, typeof Mascot[char] === 'function');
  const svg = Mascot[char](100, 'idle');
  
  // Verify standard SVG markers
  const startsWithSvg = svg.includes('<svg') && svg.includes('</svg>');
  check(`${char}: Valid root <svg> envelope`, startsWithSvg);
  
  const hasDefs = svg.includes('<defs>') && svg.includes('</defs>');
  check(`${char}: Has <defs> section for gradients/filters`, hasDefs);
  
  const gradCount = (svg.match(/<(radialGradient|linearGradient)\b/g) || []).length;
  check(`${char}: Has multiple gradients`, gradCount >= 2, `Found ${gradCount} gradients`);
  
  const pathMatches = svg.match(/<path[^>]+d="([^"]+)"/g) || [];
  check(`${char}: Has authentic vector paths`, pathMatches.length >= 3, `Found ${pathMatches.length} paths`);
  
  // Verify paths have non-empty valid coordinates
  let allPathsValid = true;
  for (const p of pathMatches) {
    const dMatch = p.match(/d="([^"]+)"/);
    if (!dMatch || dMatch[1].trim().length < 5) {
      allPathsValid = false;
      break;
    }
    // Check for NaN or undefined in coordinates
    if (dMatch[1].includes('NaN') || dMatch[1].includes('undefined')) {
      allPathsValid = false;
      break;
    }
  }
  check(`${char}: All path data strings are valid without NaN/undefined`, allPathsValid);
  
  // Verify eye highlights & specular circles
  const circleMatches = (svg.match(/<circle\b/g) || []).length;
  const ellipseMatches = (svg.match(/<ellipse\b/g) || []).length;
  check(`${char}: Rich circular/elliptical anatomy & eye shines`, (circleMatches + ellipseMatches) >= 4, `Circles: ${circleMatches}, Ellipses: ${ellipseMatches}`);
  
  // Total byte size > 2500 chars (not a toy placeholder)
  check(`${char}: Substantial vector complexity (> 2500 chars)`, svg.length > 2500, `Length: ${svg.length} chars`);
}

// Verify character visual differentiation (pairwise similarity check)
console.log('\n--- PHASE 2B: Inter-Character Geometric Differentiation ---');
const charSvgs = {};
for (const char of characters) {
  // Strip common defs and classes to compare character-specific geometry
  charSvgs[char] = Mascot[char](100, 'idle')
    .replace(/<defs>[\s\S]*?<\/defs>/, '')
    .replace(/class="[^"]*"/, '')
    .trim();
}

for (let i = 0; i < characters.length; i++) {
  for (let j = i + 1; j < characters.length; j++) {
    const c1 = characters[i];
    const c2 = characters[j];
    const isDistinct = charSvgs[c1] !== charSvgs[c2];
    check(`Differentiation: ${c1} vs ${c2}`, isDistinct, 'Geometries are uniquely authored');
  }
}

// ----------------------------------------------------------------------------
// PHASE 3: POSE DIFFERENTIATION VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- PHASE 3: Pose Differentiation Verification (Real Anatomical Changes) ---');

const canonicalPoses = ['idle', 'cheer', 'think', 'wave'];

for (const char of characters) {
  console.log(`Checking poses for: ${char}`);
  const poseSvgs = {};
  for (const pose of canonicalPoses) {
    const raw = Mascot[char](100, pose);
    // Strip root <svg ... class="..."> so we compare purely internal SVG markup
    const internalMarkup = raw
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '')
      .trim();
    poseSvgs[pose] = internalMarkup;
  }
  
  for (let i = 0; i < canonicalPoses.length; i++) {
    for (let j = i + 1; j < canonicalPoses.length; j++) {
      const p1 = canonicalPoses[i];
      const p2 = canonicalPoses[j];
      const internal1 = poseSvgs[p1];
      const internal2 = poseSvgs[p2];
      const isInternalDifferent = internal1 !== internal2;
      const charDiff = Math.abs(internal1.length - internal2.length);
      check(
        `Pose diff [${char}]: ${p1} vs ${p2}`,
        isInternalDifferent && (charDiff > 0 || internal1 !== internal2),
        `Internal markup differs by ${charDiff} chars`
      );
    }
  }
}

// Additional check: Spidey Cilik historical poses
console.log('\n--- PHASE 3B: Spidey Cilik Historical Poses Check ---');
const heroHistoricalPoses = ['wave', 'happy', 'cheer', 'cheering', 'think', 'thinking', 'encourage', 'encouraging', 'idle'];
for (const p of heroHistoricalPoses) {
  const svg = Mascot.hero(100, p);
  const hasClass = svg.includes(`class="spidey-mascot ${p}"`);
  const hasVb = svg.includes('viewBox="0 0 120 120"');
  check(`Hero historical pose: ${p}`, hasClass && hasVb, `Length: ${svg.length} chars`);
}

// Additional check: Robot historical poses
const robotHistoricalPoses = ['idle', 'cheer', 'happy', 'think', 'thinking', 'wave'];
for (const p of robotHistoricalPoses) {
  const svg = Mascot.robot(90, p);
  const hasClass = svg.includes(`class="spideybot ${p}"`);
  const hasVb = svg.includes('viewBox="0 0 100 100"');
  check(`Robot historical pose: ${p}`, hasClass && hasVb, `Length: ${svg.length} chars`);
}

// ----------------------------------------------------------------------------
// PHASE 4: NETWORK CALLS & EXTERNAL ASSETS AUDIT
// ----------------------------------------------------------------------------
console.log('\n--- PHASE 4: Network Calls & External Assets Audit ---');

const bannedNetworkPatterns = [
  /\bfetch\s*\(/i,
  /\bXMLHttpRequest\b/i,
  /\baxios\b/i,
  /\bWebSocket\b/i,
  /\bimportScripts\b/i,
  /https?:\/\/(?!www\.w3\.org)/i, // Allow w3.org XML namespaces
  /\bdata:image\/(?!svg)/i,        // Disallow base64 raster images
  /\.png\b/i,
  /\.jpg\b/i,
  /\.jpeg\b/i,
  /\.webp\b/i,
  /\.gif\b/i,
  /\.mp3\b/i,
  /\.wav\b/i,
  /\.ogg\b/i
];

for (const pattern of bannedNetworkPatterns) {
  const match = mascotContent.match(pattern);
  check(`Network / binary leak check (${pattern})`, !match, match ? `Detected: ${match[0]}` : 'Clean');
}

// Check newly added binary files in git / filesystem
const iconFiles = fs.readdirSync(path.join(ROOT_DIR, 'icons'));
for (const f of iconFiles) {
  const ext = path.extname(f).toLowerCase();
  check(`Icon file format: ${f}`, ext === '.svg', `Allowed SVG vector only, found ${ext}`);
}

// ----------------------------------------------------------------------------
// PHASE 5: COMPANION DISPATCHER & WORLD RESOLVER VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- PHASE 5: Companion Dispatcher & World Resolver Verification ---');

check('Mascot.squad exists and is array', Array.isArray(Mascot.squad));
check('Mascot.squad has exactly 5 members', Mascot.squad.length === 5);

const expectedSquadIds = ['spidey', 'cat', 'bunny', 'panda', 'bot'];
const actualSquadIds = Mascot.squad.map(s => s.id);
check('Mascot.squad IDs match expected', JSON.stringify(actualSquadIds) === JSON.stringify(expectedSquadIds));

// Universal companion dispatcher
check('companion("cat") routes to cat', Mascot.companion('cat', 100, 'idle').includes('class="mascot-companion cat idle"'));
check('companion("bunny") routes to bunny', Mascot.companion('bunny', 100, 'idle').includes('class="mascot-companion bunny idle"'));
check('companion("panda") routes to panda', Mascot.companion('panda', 100, 'idle').includes('class="mascot-companion panda idle"'));
check('companion("robot") routes to robot', Mascot.companion('robot', 90, 'idle').includes('class="spideybot idle"'));
check('companion("spidey") routes to hero', Mascot.companion('spidey', 120, 'wave').includes('class="spidey-mascot wave"'));

// World resolver
check('forWorld("hewan") routes to cat', Mascot.forWorld('hewan', 100, 'cheer').includes('class="mascot-companion cat cheer"'));
check('forWorld("angka") routes to panda', Mascot.forWorld('angka', 100, 'cheer').includes('class="mascot-companion panda cheer"'));
check('forWorld("spidey") routes to hero', Mascot.forWorld('spidey', 120, 'cheer').includes('class="spidey-mascot cheer"'));
check('forWorld("koding") routes to robot', Mascot.forWorld('koding', 90, 'cheer').includes('class="spideybot cheer"'));
check('forWorld("unknown") falls back to hero', Mascot.forWorld('unknown', 120, 'cheer').includes('class="spidey-mascot cheer"'));

// Backward compatibility contracts
check('Mascot.bot === Mascot.robot', Mascot.bot === Mascot.robot);
check('Mascot.kucing === Mascot.cat', Mascot.kucing === Mascot.cat);
check('Mascot.kelinci === Mascot.bunny', Mascot.kelinci === Mascot.bunny);
check('Mascot.star(40, true) has active fill', Mascot.star(40, true).includes('fill="#FBBF24"'));
check('Mascot.star(40, false) has inactive fill', Mascot.star(40, false).includes('fill="#CBD5E1"'));
check('Mascot.web(80) has corner-web class', Mascot.web(80).includes('class="corner-web"'));

// ----------------------------------------------------------------------------
// PHASE 6: CSS MICRO-ANIMATIONS VERIFICATION (style.css)
// ----------------------------------------------------------------------------
console.log('\n--- PHASE 6: CSS Micro-Animations Verification ---');

const expectedKeyframes = [
  '@keyframes mascotBreathe',
  '@keyframes mascotCheer',
  '@keyframes mascotThink',
  '@keyframes mascotWave',
  '@keyframes antennaGlow',
  '@keyframes mascotFloat'
];

for (const kf of expectedKeyframes) {
  check(`CSS keyframe exists: ${kf}`, cssContent.includes(kf));
}

const expectedSelectors = [
  '.spidey-mascot',
  '.spideybot',
  '.mascot-companion',
  '.spidey-mascot.idle',
  '.spidey-mascot.cheer',
  '.spidey-mascot.think',
  '.spidey-mascot.wave',
  '.antenna-bulb'
];

for (const sel of expectedSelectors) {
  check(`CSS selector exists: ${sel}`, cssContent.includes(sel));
}

// ----------------------------------------------------------------------------
// PHASE 7: ADVERSARIAL BOUNDARY & STRESS TESTS
// ----------------------------------------------------------------------------
console.log('\n--- PHASE 7: Adversarial Boundary & Stress Tests ---');

// Test 1: Sizing extremes
const sizes = [0, -10, 16, 240, 1024, NaN, undefined, null];
let sizingClean = true;
for (const s of sizes) {
  try {
    const res = Mascot.hero(s, 'wave');
    if (!res || !res.includes('<svg')) sizingClean = false;
  } catch (e) {
    sizingClean = false;
  }
}
check('Adversarial sizing extremes (0, -10, 1024, NaN, undefined, null) handle gracefully', sizingClean);

// Test 2: Unknown pose fallback
const strangePoses = ['', 'weird_pose', 'UNKNOWN', '12345', null, undefined];
let poseFallbackClean = true;
for (const p of strangePoses) {
  try {
    const res = Mascot.cat(100, p);
    // Should fall back to default/idle pose SVG without crashing
    if (!res || !res.includes('<svg') || !res.includes('</svg>')) poseFallbackClean = false;
  } catch (e) {
    poseFallbackClean = false;
  }
}
check('Unknown / malformed pose strings fall back safely without crashing', poseFallbackClean);

// Test 3: XSS / Malicious injection into pose or companion name
const maliciousInput = '<script>alert(1)</script>';
let xssSafe = true;
try {
  const out = Mascot.companion(maliciousInput, 100, 'idle');
  // It should safely resolve to hero fallback without executing code
  if (!out.includes('<svg')) xssSafe = false;
} catch (e) {
  xssSafe = false;
}
check('Malicious string in companion() resolves safely to fallback', xssSafe);

// ----------------------------------------------------------------------------
// SUMMARY & BINARY VERDICT
// ----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`📊 AUDIT SUMMARY: ${passCount} Checks Passed | ${failCount} Checks Failed`);
console.log('============================================================');

if (failCount === 0) {
  console.log('🏁 BINARY VERDICT: CLEAN');
  process.exit(0);
} else {
  console.error('🚨 BINARY VERDICT: INTEGRITY VIOLATION');
  process.exit(1);
}
