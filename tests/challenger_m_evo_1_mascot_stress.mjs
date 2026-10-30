// tests/challenger_m_evo_1_mascot_stress.mjs
// Adversarial Empirical Stress Test Suite for Milestone M-EVO-1: Lingokids Character & Mascot System
// Authored by Challenger M-EVO-1.1 (critic & specialist)
// Pure native Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🕷️ CHALLENGER M-EVO-1.1: ADVERSARIAL MASCOT API STRESS TEST SUITE');
console.log('Target: mascot.js (Lingokids Character & Animal Squad System)');
console.log('Author: Empirical Challenger (Critic & Specialist)');
console.log('================================================================\n');

// Import target under test
const mascotModulePath = path.join(rootDir, 'mascot.js');
assert(fs.existsSync(mascotModulePath), 'mascot.js must exist at project root');
const { Mascot } = await import('../mascot.js');

let totalChecks = 0;
let passedChecks = 0;
const failures = [];
const telemetry = {
  extremeSizeTested: 0,
  posesTested: 0,
  xmlValidatedCount: 0,
  sequentialIterations: 0,
  sequentialDurationMs: 0,
  throughputOpsSec: 0,
  memoryDeltaMB: 0
};

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

// Strict XML Lexer & Validator (Validates well-formedness, tag balance, and attributes)
function validateXmlSvg(xmlString, label = 'SVG') {
  const errors = [];
  const tagStack = [];
  const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9_\-:]+)([^>]*?)>/g;
  let match;

  const trimmed = xmlString.trim();
  if (!trimmed.startsWith('<svg')) {
    errors.push(`${label} does not start with <svg`);
  }
  if (!trimmed.endsWith('</svg>')) {
    errors.push(`${label} does not end with </svg>`);
  }

  while ((match = tagRegex.exec(xmlString)) !== null) {
    const fullMatch = match[0];
    if (fullMatch.startsWith('<!--')) continue; // Skip comments

    const isClosing = match[1] === '/';
    const tagName = match[2];
    const attrs = match[3] || '';

    // Check duplicate attributes
    const attrRegex = /([a-zA-Z0-9_\-:]+)\s*=\s*(['"])([\s\S]*?)\2/g;
    let attrMatch;
    const attrNames = new Set();
    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1];
      if (attrNames.has(attrName)) {
        errors.push(`Duplicate attribute '${attrName}' on <${tagName}> in ${label}`);
      }
      attrNames.add(attrName);
    }

    const isSelfClosing = attrs.trim().endsWith('/');

    if (isSelfClosing) {
      if (isClosing) {
        errors.push(`Invalid self-closing syntax on closing tag </${tagName} /> in ${label}`);
      }
      continue;
    }

    if (!isClosing) {
      tagStack.push({ tag: tagName, index: match.index });
    } else {
      if (tagStack.length === 0) {
        errors.push(`Unexpected closing tag </${tagName}> without opening in ${label}`);
      } else {
        const top = tagStack.pop();
        if (top.tag !== tagName) {
          errors.push(`Tag nesting mismatch: expected </${top.tag}> but found </${tagName}> in ${label}`);
        }
      }
    }
  }

  if (tagStack.length > 0) {
    errors.push(`Unclosed tags remain at EOF in ${label}: ${tagStack.map(t => `<${t.tag}>`).join(', ')}`);
  }

  return errors;
}

// Coordinate attribute scanner for NaN checks
function findNanInCoordinateAttributes(svgString) {
  // Checks cx, cy, r, rx, ry, x, y, x1, y1, x2, y2, d, points on inner elements
  // We strip root <svg> first so we test purely element geometry coordinates
  const innerSvg = svgString.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const coordRegex = /(cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|d|points)\s*=\s*(['"])(.*?)\2/gi;
  const nanOccurrences = [];
  let m;
  while ((m = coordRegex.exec(innerSvg)) !== null) {
    const attrName = m[1];
    const attrVal = m[3];
    if (attrVal.includes('NaN')) {
      nanOccurrences.push({ attrName, attrVal, match: m[0] });
    }
  }
  return nanOccurrences;
}

// ============================================================================
// SUITE 1: ARCHITECTURAL & INTERFACE CONTRACT INTEGRITY
// ============================================================================
console.log('--- [SUITE 1] Architectural & Interface Contract Integrity ---');

check('1.1 All 5 character methods exist on Mascot object', () => {
  const requiredMethods = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  for (const method of requiredMethods) {
    assert.strictEqual(typeof Mascot[method], 'function', `Mascot.${method} must be a function`);
  }
});

check('1.2 Backward compatible aliases strictly match canonical functions', () => {
  assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot must strictly equal Mascot.robot');
  assert.strictEqual(Mascot.kucing, Mascot.cat, 'Mascot.kucing must strictly equal Mascot.cat');
  assert.strictEqual(Mascot.kelinci, Mascot.bunny, 'Mascot.kelinci must strictly equal Mascot.bunny');
});

check('1.3 Backward compatible utility generators: Mascot.star and Mascot.web exist', () => {
  assert.strictEqual(typeof Mascot.star, 'function', 'Mascot.star must be a function');
  assert.strictEqual(typeof Mascot.web, 'function', 'Mascot.web must be a function');

  const filledStar = Mascot.star(40, true);
  assert(filledStar.includes('fill="#FBBF24"'), 'Active star must have golden fill #FBBF24');
  assert(filledStar.includes('class="star-icon active"'), 'Active star must have class star-icon active');

  const inactiveStar = Mascot.star(40, false);
  assert(inactiveStar.includes('fill="#CBD5E1"'), 'Inactive star must have gray fill #CBD5E1');
  assert(inactiveStar.includes('class="star-icon inactive"'), 'Inactive star must have class star-icon inactive');

  const web = Mascot.web(80);
  assert(web.includes('class="corner-web"'), 'Web must have class corner-web');
  assert(web.includes('viewBox="0 0 100 100"'), 'Web must have viewBox 0 0 100 100');
});

check('1.4 Mascot.squad metadata catalogue is complete and schema-valid', () => {
  assert(Array.isArray(Mascot.squad), 'Mascot.squad must be an array');
  assert.strictEqual(Mascot.squad.length, 5, 'Mascot.squad must have exactly 5 character profiles');

  const expectedIds = ['spidey', 'cat', 'bunny', 'panda', 'bot'];
  const actualIds = Mascot.squad.map(m => m.id);
  assert.deepStrictEqual(actualIds, expectedIds, `Squad IDs mismatch: ${JSON.stringify(actualIds)}`);

  for (const member of Mascot.squad) {
    assert(member.id && typeof member.id === 'string', 'Squad member must have string id');
    assert(member.name && typeof member.name === 'string', 'Squad member must have string name');
    assert(member.species && typeof member.species === 'string', 'Squad member must have string species');
    assert(member.worldId && typeof member.worldId === 'string', 'Squad member must have string worldId');
    assert(member.color && member.color.startsWith('#'), 'Squad member must have hex color');
  }
});

check('1.5 Mascot.companion polymorphic dispatcher maps all aliases and falls back to hero', () => {
  const tests = [
    { input: 'hero', expectedChar: 'hero' },
    { input: 'spidey', expectedChar: 'hero' },
    { input: 'bot', expectedChar: 'robot' },
    { input: 'robot', expectedChar: 'robot' },
    { input: 'spideybot', expectedChar: 'robot' },
    { input: 'cat', expectedChar: 'cat' },
    { input: 'kucing', expectedChar: 'cat' },
    { input: 'bunny', expectedChar: 'bunny' },
    { input: 'kelinci', expectedChar: 'bunny' },
    { input: 'rabbit', expectedChar: 'bunny' },
    { input: 'panda', expectedChar: 'panda' },
    { input: 'unknown_alien', expectedChar: 'hero' },
    { input: '', expectedChar: 'hero' },
    { input: null, expectedChar: 'hero' },
    { input: undefined, expectedChar: 'hero' }
  ];

  for (const { input, expectedChar } of tests) {
    const result = Mascot.companion(input, 100, 'idle');
    const expected = Mascot[expectedChar](100, 'idle');
    assert.strictEqual(result, expected, `Mascot.companion('${input}') must resolve to ${expectedChar}`);
  }
});

check('1.6 Mascot.forWorld auto-resolver correctly maps 4 worlds and falls back to hero', () => {
  const worldMappings = [
    { world: 'hewan', expectedChar: 'cat' },
    { world: 'angka', expectedChar: 'panda' },
    { world: 'spidey', expectedChar: 'hero' },
    { world: 'koding', expectedChar: 'robot' },
    { world: 'unknown_galaxy', expectedChar: 'hero' },
    { world: '', expectedChar: 'hero' },
    { world: null, expectedChar: 'hero' },
    { world: undefined, expectedChar: 'hero' }
  ];

  for (const { world, expectedChar } of worldMappings) {
    const result = Mascot.forWorld(world, 90, 'wave');
    const expected = Mascot[expectedChar](90, 'wave');
    assert.strictEqual(result, expected, `Mascot.forWorld('${world}') must resolve to ${expectedChar}`);
  }
});

// ============================================================================
// SUITE 2: ADVERSARIAL EXTREME SIZE PARAMETERS STRESS TESTING
// ============================================================================
console.log('\n--- [SUITE 2] Adversarial Extreme Size Parameters Stress Testing ---');

const extremeSizes = [
  0,
  -10,
  -1,
  1,
  16,
  64,
  120,
  256,
  1024,
  4096,
  65536,
  NaN,
  null,
  undefined,
  Infinity,
  -Infinity,
  '100',
  '50%'
];

const characters = ['hero', 'robot', 'cat', 'bunny', 'panda', 'star', 'web'];

check('2.1 Zero-crash execution across 126 extreme size x character invocations', () => {
  for (const char of characters) {
    for (const size of extremeSizes) {
      telemetry.extremeSizeTested++;
      assert.doesNotThrow(() => {
        let svg;
        if (char === 'star') svg = Mascot.star(size, true);
        else if (char === 'web') svg = Mascot.web(size);
        else svg = Mascot[char](size, 'wave');

        assert(typeof svg === 'string', `${char}(${size}) must return a string`);
        assert(svg.trim().startsWith('<svg'), `${char}(${size}) must start with <svg`);
        assert(svg.trim().endsWith('</svg>'), `${char}(${size}) must end with </svg>`);
      }, `Mascot.${char}(${size}) threw an uncaught error`);
    }
  }
});

check('2.2 Absolute coordinate integrity: ZERO NaN in any inner coordinate attributes', () => {
  let totalNanCoords = 0;
  const nanDetails = [];

  for (const char of characters) {
    for (const size of extremeSizes) {
      let svg;
      if (char === 'star') svg = Mascot.star(size, true);
      else if (char === 'web') svg = Mascot.web(size);
      else svg = Mascot[char](size, 'wave');

      const nanList = findNanInCoordinateAttributes(svg);
      if (nanList.length > 0) {
        totalNanCoords += nanList.length;
        nanDetails.push({ char, size, nanList });
      }
    }
  }

  assert.strictEqual(
    totalNanCoords,
    0,
    `Found ${totalNanCoords} NaN coordinate attributes across extreme sizes: ${JSON.stringify(nanDetails)}`
  );
});

check('2.3 Fixed viewBox coordinate architecture preserves layout invariant at extreme scales', () => {
  for (const size of [1, 16, 120, 256, 1024, 4096]) {
    const hero = Mascot.hero(size, 'wave');
    assert(hero.includes('viewBox="0 0 120 120"'), `Hero must maintain fixed 120x120 viewBox at size ${size}`);

    const robot = Mascot.robot(size, 'idle');
    assert(robot.includes('viewBox="0 0 100 100"'), `Robot must maintain fixed 100x100 viewBox at size ${size}`);

    const cat = Mascot.cat(size, 'idle');
    assert(cat.includes('viewBox="0 0 100 100"'), `Cat must maintain fixed 100x100 viewBox at size ${size}`);

    const bunny = Mascot.bunny(size, 'idle');
    assert(bunny.includes('viewBox="0 0 100 100"'), `Bunny must maintain fixed 100x100 viewBox at size ${size}`);

    const panda = Mascot.panda(size, 'idle');
    assert(panda.includes('viewBox="0 0 100 100"'), `Panda must maintain fixed 100x100 viewBox at size ${size}`);
  }
});

// ============================================================================
// SUITE 3: BOUNDARY & UNKNOWN POSES STRESS TESTING
// ============================================================================
console.log('\n--- [SUITE 3] Boundary & Unknown Poses Stress Testing ---');

const boundaryPoses = [
  'idle',
  'cheer',
  'cheering',
  'think',
  'thinking',
  'wave',
  'encourage',
  'encouraging',
  'happy',
  'unknown',
  'super_jump',
  '',
  null,
  undefined,
  123,
  0,
  false,
  true,
  'CHEER',
  'HAPPY',
  'THINK',
  'WAVE',
  'IDLE',
  '   ',
  '\n\t'
];

check('3.1 Zero-crash execution across 125 boundary pose x character invocations', () => {
  const squadChars = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  for (const char of squadChars) {
    for (const pose of boundaryPoses) {
      telemetry.posesTested++;
      assert.doesNotThrow(() => {
        const svg = Mascot[char](100, pose);
        assert(typeof svg === 'string', `${char}('${pose}') must return a string`);
        assert(svg.trim().startsWith('<svg') && svg.trim().endsWith('</svg>'), `${char}('${pose}') must return valid SVG`);
      }, `Mascot.${char}('${pose}') threw an unexpected error`);
    }
  }
});

check('3.2 Graceful fallback: unknown/adversarial poses fall back to default poses without corrupting markup', () => {
  // For hero, unknown poses fall back to default 'wave'
  const heroUnknown = Mascot.hero(100, 'unregistered_dance');
  const heroWave = Mascot.hero(100, 'wave');
  // Body markup must match default wave (except for class name which retains the input)
  assert(heroUnknown.includes('M 85 66 Q 106 50 102 32'), 'Hero unknown pose must render waving right arm fallback');

  // For cat, unknown poses fall back to default 'idle'
  const catUnknown = Mascot.cat(100, 'alien_mood');
  assert(catUnknown.includes('cx="38" cy="82" rx="6" ry="7"'), 'Cat unknown pose must render idle resting paws fallback');

  // For bunny, unknown poses fall back to default 'idle'
  const bunnyUnknown = Mascot.bunny(100, 'unknown');
  assert(bunnyUnknown.includes('cx="44" cy="74" rx="6" ry="6"'), 'Bunny unknown pose must render idle tucked paws fallback');

  // For panda, unknown poses fall back to default 'idle'
  const pandaUnknown = Mascot.panda(100, 'unknown');
  assert(pandaUnknown.includes('cx="38" cy="80" rx="7" ry="7"'), 'Panda unknown pose must render idle tummy paws fallback');
});

// ============================================================================
// SUITE 4: CHARACTER & POSE COMBINATORIAL DISTINCTNESS (5x4 MATRIX)
// ============================================================================
console.log('\n--- [SUITE 4] Character & Pose Combinatorial Distinctness (5x4 Matrix) ---');

const canonicalPoses = ['idle', 'cheer', 'think', 'wave'];
const activeCharacters = ['hero', 'robot', 'cat', 'bunny', 'panda'];

check('4.1 Intra-Character Distinctness: All 4 canonical poses produce distinct SVGs for each character', () => {
  for (const char of activeCharacters) {
    const poseRenderings = {};
    for (const pose of canonicalPoses) {
      poseRenderings[pose] = Mascot[char](100, pose);
    }

    // Pairwise comparison of all 6 pose pairs per character
    for (let i = 0; i < canonicalPoses.length; i++) {
      for (let j = i + 1; j < canonicalPoses.length; j++) {
        const p1 = canonicalPoses[i];
        const p2 = canonicalPoses[j];
        assert.notStrictEqual(
          poseRenderings[p1],
          poseRenderings[p2],
          `Collision detected: ${char} pose '${p1}' is identical to '${p2}'`
        );
      }
    }
  }
});

check('4.2 Inter-Character Distinctness: All 5 characters are completely unique in markup & anatomy', () => {
  for (const pose of canonicalPoses) {
    const charRenderings = {};
    for (const char of activeCharacters) {
      charRenderings[char] = Mascot[char](100, pose);
    }

    // Pairwise cross-character comparison (10 pairs per pose)
    for (let i = 0; i < activeCharacters.length; i++) {
      for (let j = i + 1; j < activeCharacters.length; j++) {
        const c1 = activeCharacters[i];
        const c2 = activeCharacters[j];
        assert.notStrictEqual(
          charRenderings[c1],
          charRenderings[c2],
          `Collision detected: character '${c1}' is identical to '${c2}' in pose '${pose}'`
        );
      }
    }
  }
});

check('4.3 Visual Anatomy & Lingokids Aesthetic Markers Verification', () => {
  // Spidey Cilik: chubby anatomy, web filaments, Spidey Red gradient, anime eyes
  const hero = Mascot.hero(120, 'wave');
  assert(hero.includes('#spideyHeadGrad'), 'Hero must feature radial volumetric head gradient');
  assert(hero.includes('#spideyEyeGrad'), 'Hero must feature blue anime chibi eye gradient');
  assert(hero.includes('#FF8A80'), 'Hero must feature toddler rosy cheek blush');
  assert(hero.includes('#1E293B'), 'Hero must feature tactile deep slate border');

  // Spideybot: glowing antenna, brass gears, digital visor pill
  const bot = Mascot.robot(90, 'cheer');
  assert(bot.includes('#botDomeGrad'), 'Bot must feature volumetric dome gradient');
  assert(bot.includes('antenna-bulb'), 'Bot must feature glowing antenna beacon');
  assert(bot.includes('#botGearGrad'), 'Bot must feature brass cheek gears');
  assert(bot.includes('#botVisorGrad'), 'Bot must feature digital eye visor pill');

  // Kucing Ceria: fluffy tail, kitten ears, coral heart nose, emerald eyes, whiskers
  const cat = Mascot.cat(100, 'cheer');
  assert(cat.includes('#catCoatGrad'), 'Cat must feature warm orange coat gradient');
  assert(cat.includes('#catEyeGrad'), 'Cat must feature emerald anime eye gradient');
  assert(cat.includes('FCA5A5'), 'Cat must feature pink paw pads');

  // Kelinci Lincah: upright and floppy velvet ears, cotton-ball tail, bowtie, buck tooth smile
  const bunny = Mascot.bunny(100, 'wave');
  assert(bunny.includes('#bunnyFurGrad'), 'Bunny must feature pearl white fur gradient');
  assert(bunny.includes('#bunnyEyeGrad'), 'Bunny must feature violet anime eye gradient');
  assert(bunny.includes('#38BDF8'), 'Bunny must feature turquoise bowtie');

  // Panda Pintar: fuzzy ears, black eye patches, chunky golden glasses, warm amber eyes
  const panda = Mascot.panda(100, 'think');
  assert(panda.includes('#pandaWhiteGrad'), 'Panda must feature plush white body gradient');
  assert(panda.includes('#pandaBlackGrad'), 'Panda must feature velvet black patches gradient');
  assert(panda.includes('#pandaEyeGrad'), 'Panda must feature warm amber anime eye gradient');
  assert(panda.includes('stroke="#FBBF24" stroke-width="3"'), 'Panda must feature chunky golden glasses');
});

// ============================================================================
// SUITE 5: STRICT XML / SVG STRUCTURAL WELL-FORMEDNESS
// ============================================================================
console.log('\n--- [SUITE 5] Strict XML / SVG Structural Well-Formedness ---');

check('5.1 Comprehensive XML AST validation across all 5 characters x 5 canonical poses + utilities', () => {
  const testMatrix = [
    { name: 'hero', fn: pose => Mascot.hero(120, pose) },
    { name: 'robot', fn: pose => Mascot.robot(90, pose) },
    { name: 'cat', fn: pose => Mascot.cat(100, pose) },
    { name: 'bunny', fn: pose => Mascot.bunny(100, pose) },
    { name: 'panda', fn: pose => Mascot.panda(100, pose) }
  ];

  const poses = ['idle', 'cheer', 'think', 'wave', 'happy'];
  const allErrors = [];

  for (const { name, fn } of testMatrix) {
    for (const pose of poses) {
      telemetry.xmlValidatedCount++;
      const svg = fn(pose);
      const errors = validateXmlSvg(svg, `${name}.${pose}`);
      if (errors.length > 0) {
        allErrors.push(...errors);
      }
    }
  }

  // Also validate star and web
  telemetry.xmlValidatedCount += 3;
  allErrors.push(...validateXmlSvg(Mascot.star(40, true), 'star.active'));
  allErrors.push(...validateXmlSvg(Mascot.star(40, false), 'star.inactive'));
  allErrors.push(...validateXmlSvg(Mascot.web(80), 'web'));

  assert.strictEqual(
    allErrors.length,
    0,
    `XML validation errors encountered (${allErrors.length}): ${allErrors.slice(0, 10).join('; ')}`
  );
});

// ============================================================================
// SUITE 6: RAPID SEQUENTIAL GENERATION (10,000 SVGs STRESS & MEMORY HARNESS)
// ============================================================================
console.log('\n--- [SUITE 6] Rapid Sequential Generation (10,000 SVGs Stress & Memory Harness) ---');

check('6.1 Rapid sequential generation of 10,000 mascot SVGs: CPU overhead, throughput & memory leak audit', () => {
  const iterationCount = 10000;
  const chars = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['idle', 'cheer', 'think', 'wave', 'encourage', 'happy'];

  if (global.gc) {
    global.gc();
  }

  const memBefore = process.memoryUsage();
  const startTime = performance.now();

  let firstHash = null;
  let matchesFirstCount = 0;

  for (let i = 0; i < iterationCount; i++) {
    const char = chars[i % chars.length];
    const pose = poses[i % poses.length];
    const size = 60 + (i % 140);

    const svg = Mascot[char](size, pose);

    // Verify determinism on every 30th call (hero, 120, 'wave')
    if (i % 30 === 0) {
      const sample = Mascot.hero(120, 'wave');
      if (firstHash === null) {
        firstHash = sample;
      } else {
        if (sample === firstHash) matchesFirstCount++;
      }
    }
  }

  const endTime = performance.now();
  const durationMs = endTime - startTime;

  if (global.gc) {
    global.gc();
  }

  const memAfter = process.memoryUsage();
  const heapDeltaBytes = memAfter.heapUsed - memBefore.heapUsed;
  const heapDeltaMB = heapDeltaBytes / (1024 * 1024);
  const throughputOpsSec = Math.round(iterationCount / (durationMs / 1000));

  telemetry.sequentialIterations = iterationCount;
  telemetry.sequentialDurationMs = Math.round(durationMs * 100) / 100;
  telemetry.throughputOpsSec = throughputOpsSec;
  telemetry.memoryDeltaMB = Math.round(heapDeltaMB * 100) / 100;

  console.log(`      ⚡ Generated ${iterationCount.toLocaleString()} SVGs in ${durationMs.toFixed(2)} ms`);
  console.log(`      ⚡ Throughput: ${throughputOpsSec.toLocaleString()} SVGs/second`);
  console.log(`      ⚡ Average latency: ${((durationMs / iterationCount) * 1000).toFixed(2)} µs/SVG`);
  console.log(`      ⚡ Initial Heap: ${(memBefore.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`      ⚡ Final Heap:   ${(memAfter.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`      ⚡ Heap Delta:   ${heapDeltaMB.toFixed(2)} MB`);

  // Assertions
  assert(durationMs < 2000, `Execution time (${durationMs.toFixed(2)}ms) exceeded generous 2000ms threshold`);
  assert(throughputOpsSec > 5000, `Throughput (${throughputOpsSec} ops/s) fell below 5000 ops/s baseline`);
  assert(heapDeltaMB < 20, `Heap growth (${heapDeltaMB.toFixed(2)}MB) indicates potential memory leak (> 20MB)`);
});

// ============================================================================
// SUITE 7: CSS KEYFRAME ANIMATIONS & INTEGRATION AUDIT
// ============================================================================
console.log('\n--- [SUITE 7] CSS Keyframe Animations & Class Compatibility Audit ---');

const cssPath = path.join(rootDir, 'style.css');
assert(fs.existsSync(cssPath), 'style.css must exist at project root');
const css = fs.readFileSync(cssPath, 'utf8');

check('7.1 Pure CSS GPU-accelerated mascot keyframe animations defined in style.css', () => {
  const expectedKeyframes = [
    '@keyframes mascotBreathe',
    '@keyframes mascotCheer',
    '@keyframes mascotThink',
    '@keyframes mascotWave',
    '@keyframes mascotFloat'
  ];

  for (const kf of expectedKeyframes) {
    assert(css.includes(kf), `style.css must define keyframe ${kf}`);
  }
});

check('7.2 CSS selector binding for mascot classes and pose states', () => {
  const expectedSelectors = [
    '.spidey-mascot',
    '.spideybot',
    '.mascot-companion',
    '.star-icon'
  ];

  for (const sel of expectedSelectors) {
    assert(css.includes(sel), `style.css must define styles for ${sel}`);
  }
});

// ============================================================================
// SUITE 8: ADVERSARIAL FUZZING, GRADIENT NAMESPACES & HASH IDEMPOTENCE
// ============================================================================
console.log('\n--- [SUITE 8] Adversarial Fuzzing, Gradient Namespaces & Hash Idempotence ---');

check('8.1 Adversarial Fuzzing: 1,000 randomized chaotic inputs execute without throwing', () => {
  const fuzzFns = [Mascot.hero, Mascot.robot, Mascot.cat, Mascot.bunny, Mascot.panda];
  const chaoticValues = [
    undefined, null, NaN, Infinity, -Infinity,
    0, -1, 1e7, -1e7, 3.14159,
    '', '   ', '✨🎉🚀', 'مرحبا', '你好', 'Привет',
    '"><script>alert(1)</script>', 'style="color:red"',
    {}, [], [1, 2], { pose: 'cheer' }, true, false, () => {}
  ];

  for (let i = 0; i < 1000; i++) {
    const fn = fuzzFns[i % fuzzFns.length];
    const chaoticSize = chaoticValues[(i * 7) % chaoticValues.length];
    const chaoticPose = chaoticValues[(i * 13) % chaoticValues.length];

    assert.doesNotThrow(() => {
      const result = fn(chaoticSize, chaoticPose);
      assert(typeof result === 'string', 'Fuzz execution must return a string');
    }, `Fuzz failure at iteration ${i} with size=${String(chaoticSize)} pose=${String(chaoticPose)}`);
  }
});

check('8.2 Pure functional idempotence: byte-for-byte deterministic hash stability', () => {
  const chars = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['idle', 'cheer', 'think', 'wave'];

  for (const char of chars) {
    for (const pose of poses) {
      const reference = Mascot[char](120, pose);
      for (let run = 0; run < 10; run++) {
        const sample = Mascot[char](120, pose);
        assert.strictEqual(
          sample,
          reference,
          `Idempotence violation: ${char}(120, '${pose}') produced non-deterministic output on run ${run}`
        );
      }
    }
  }
});

check('8.3 SVG Defs Gradient Namespace Isolation (Zero Cross-Character Collision)', () => {
  // Extract all id="..." from <defs> in each character
  const defIdRegex = /id=["']([^"']+)["']/g;
  const charDefIds = new Map();

  for (const char of ['hero', 'robot', 'cat', 'bunny', 'panda']) {
    const svg = Mascot[char](100, 'idle');
    const defsMatch = svg.match(/<defs>([\s\S]*?)<\/defs>/);
    assert(defsMatch, `${char} must include <defs> section`);
    const ids = [];
    let m;
    while ((m = defIdRegex.exec(defsMatch[1])) !== null) {
      ids.push(m[1]);
    }
    assert(ids.length > 0, `${char} must define at least one gradient or filter in <defs>`);
    charDefIds.set(char, ids);
  }

  // Cross-compare definitions across characters (except shared filter like stickerGlow if any)
  const charactersList = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  for (let i = 0; i < charactersList.length; i++) {
    for (let j = i + 1; j < charactersList.length; j++) {
      const c1 = charactersList[i];
      const c2 = charactersList[j];
      const ids1 = charDefIds.get(c1).filter(id => id !== 'stickerGlow');
      const ids2 = charDefIds.get(c2).filter(id => id !== 'stickerGlow');
      for (const id1 of ids1) {
        assert(
          !ids2.includes(id1),
          `Gradient ID collision: '${id1}' is defined in both ${c1} and ${c2}, risking visual corruption`
        );
      }
    }
  }
});

// ============================================================================
// EXECUTION SUMMARY & TELEMETRY
// ============================================================================
console.log('\n================================================================');
console.log('📊 CHALLENGER M-EVO-1.1 STRESS TEST EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Verification Checks: ${totalChecks}`);
console.log(`Passed Checks:             ${passedChecks}`);
console.log(`Failed Checks:             ${failures.length}`);
console.log('----------------------------------------------------------------');
console.log(`Telemetry:`);
console.log(`- Extreme Size Invocations Tested:     ${telemetry.extremeSizeTested}`);
console.log(`- Boundary Pose Invocations Tested:     ${telemetry.posesTested}`);
console.log(`- SVGs Strict XML Validated:           ${telemetry.xmlValidatedCount}`);
console.log(`- Sequential Generation Iterations:    ${telemetry.sequentialIterations.toLocaleString()}`);
console.log(`- Sequential Generation Wall Time:     ${telemetry.sequentialDurationMs} ms`);
console.log(`- Batch Throughput:                    ${telemetry.throughputOpsSec.toLocaleString()} ops/sec`);
console.log(`- Memory Heap Delta:                   ${telemetry.memoryDeltaMB} MB`);
console.log('================================================================\n');

if (failures.length === 0) {
  console.log('\x1b[32m✔ VERDICT: APPROVE — mascot.js passes all adversarial stress gates with zero defects.\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m✖ VERDICT: REQUEST_CHANGES — ${failures.length} check(s) failed.\x1b[0m\n`);
  process.exit(1);
}
