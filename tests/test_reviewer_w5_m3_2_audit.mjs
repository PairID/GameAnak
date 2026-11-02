// tests/test_reviewer_w5_m3_2_audit.mjs
// Independent Adversarial Review & Forensic Audit for World 5 Milestone 3 (W5-M3)
// Reviewer: Reviewer 2 (reviewer, critic)
// Focus: Integrity, Anti-Cheating, 60fps GPU Animation Verification, Easing Curves,
// Vector Scaling & Clipping, Character/Costume Distinctness, XML AST Balance, Fuzzing.

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import { Mascot } from '../mascot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🕵️ REVIEWER 2 ADVERSARIAL AUDIT: WORLD 5 MILESTONE 3 (W5-M3)');
console.log('Target: mascot.js & style.css (GPU Keyframes, Costumes, Poses)');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;
const findings = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
    findings.push({ name, error: err.message, stack: err.stack });
    throw err;
  }
}

// Strict XML tag balance validator
function strictXmlValidate(rawSvg, context) {
  assert(typeof rawSvg === 'string', `${context}: SVG must be string`);
  const svgStr = rawSvg.trim();
  assert(svgStr.startsWith('<svg'), `${context}: SVG must start with <svg`);
  assert(svgStr.endsWith('</svg>'), `${context}: SVG must end with </svg>`);

  const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9_\-:]+)([^>]*?)>/g;
  const stack = [];
  let match;
  while ((match = tagRegex.exec(svgStr)) !== null) {
    if (match[0].startsWith('<!--')) continue;
    const isClosing = match[1] === '/';
    const tag = match[2];
    const attrs = match[3];
    const isSelfClosing = attrs.trim().endsWith('/');

    if (isClosing) {
      assert(stack.length > 0, `${context}: Unexpected closing tag </${tag}> with empty stack`);
      const top = stack.pop();
      assert.strictEqual(top, tag, `${context}: Tag mismatch, expected </${top}> but found </${tag}>`);
    } else if (!isSelfClosing) {
      stack.push(tag);
    }
  }
  assert.strictEqual(stack.length, 0, `${context}: Unclosed tags: ${stack.join(', ')}`);
}

// ============================================================================
// SECTION 1: INTEGRITY & ANTI-CHEATING AUDIT
// ============================================================================
console.log('--- [SECTION 1] Integrity & Anti-Cheating Audit ---');

test('1.1 Zero Facade: Mascot generator functions author authentic SVG vectors, not empty dummies', () => {
  const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  for (const char of characters) {
    const defaultSvg = Mascot[char]();
    assert(defaultSvg.length > 2000, `${char} SVG output must be substantial vector artwork (>2000 chars), got ${defaultSvg.length}`);
    assert(defaultSvg.includes('<defs>'), `${char} must contain <defs> for gradients or filters`);
    assert(defaultSvg.includes('viewBox='), `${char} must contain viewBox coordinate system`);
    assert(!defaultSvg.includes('TODO'), `${char} must not contain TODO placeholders`);
    assert(!defaultSvg.includes('FIXME'), `${char} must not contain FIXME placeholders`);
  }
});

test('1.2 Zero Hardcoding: Source code in mascot.js does not contain hardcoded test assertions or bypasses', () => {
  const mascotSource = fs.readFileSync(path.join(ROOT_DIR, 'mascot.js'), 'utf-8');
  assert(!mascotSource.includes('test_mascot_w5_verification'), 'mascot.js must not reference test file names');
  assert(!mascotSource.includes('isTestEnv'), 'mascot.js must not check test environment to alter logic');
  assert(!mascotSource.includes('process.env.NODE_ENV === "test"'), 'mascot.js must not contain test branch bypasses');
});

// ============================================================================
// SECTION 2: 60FPS GPU-ACCELERATED CSS KEYFRAME ANIMATIONS & EASING CURVES
// ============================================================================
console.log('\n--- [SECTION 2] 60fps GPU Animation & CSS Easing Curve Verification ---');

const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf-8');

test('2.1 Pure GPU Transforms: All 4 keyframes exclusively animate GPU-composited transform properties', () => {
  const targetKeyframes = ['mascotCelebrateJump', 'mascotEureka', 'mascotCurious', 'mascotProud'];
  
  for (const kfName of targetKeyframes) {
    const kfRegex = new RegExp(`@keyframes\\s+${kfName}\\s*\\{([\\s\\S]*?)\\}`, 'm');
    const match = styleCss.match(kfRegex);
    assert(match, `style.css must define @keyframes ${kfName}`);
    
    const body = match[1];
    // Check that animated properties inside keyframe body are only transform properties
    // Non-GPU layout-inducing properties: top, left, bottom, right, width, height, margin, padding
    const layoutProperties = [
      /\btop\s*:/i, /\bleft\s*:/i, /\bbottom\s*:/i, /\bright\s*:/i,
      /\bwidth\s*:/i, /\bheight\s*:/i, /\bmargin\s*:/i, /\bpadding\s*:/i,
      /\bbackground\s*:/i
    ];
    for (const prop of layoutProperties) {
      assert(!prop.test(body), `@keyframes ${kfName} must not animate layout property ${prop}`);
    }
    assert(body.includes('transform:'), `@keyframes ${kfName} must animate transform`);
  }
});

test('2.2 Easing Curves & Timing: Celebrate Jump utilizes spring overshoot cubic-bezier, others use smooth ease', () => {
  // Check celebration jump cubic-bezier
  const jumpRuleMatch = styleCss.match(/\.spidey-mascot\.celebrate_jump[\s\S]*?animation:\s*([^\n;]+)/);
  assert(jumpRuleMatch, 'celebrate_jump animation rule must exist');
  const jumpAnimationVal = jumpRuleMatch[1];
  assert(jumpAnimationVal.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'celebrate_jump must use cubic-bezier(0.34, 1.56, 0.64, 1) overshoot');
  assert(jumpAnimationVal.includes('1.2s'), 'celebrate_jump must have 1.2s duration');

  // Check eureka
  const eurekaRuleMatch = styleCss.match(/\.spidey-mascot\.eureka[\s\S]*?animation:\s*([^\n;]+)/);
  assert(eurekaRuleMatch, 'eureka animation rule must exist');
  assert(eurekaRuleMatch[1].includes('1.8s ease-in-out'), 'eureka must use 1.8s ease-in-out');

  // Check curious
  const curiousRuleMatch = styleCss.match(/\.spidey-mascot\.curious[\s\S]*?animation:\s*([^\n;]+)/);
  assert(curiousRuleMatch, 'curious animation rule must exist');
  assert(curiousRuleMatch[1].includes('2.4s ease-in-out'), 'curious must use 2.4s ease-in-out');

  // Check proud
  const proudRuleMatch = styleCss.match(/\.spidey-mascot\.proud[\s\S]*?animation:\s*([^\n;]+)/);
  assert(proudRuleMatch, 'proud animation rule must exist');
  assert(proudRuleMatch[1].includes('2.6s ease-in-out'), 'proud must use 2.6s ease-in-out');
});

test('2.3 Selector Coverage: All 3 mascot selector families are bound for each new pose', () => {
  const families = ['.spidey-mascot', '.spideybot', '.mascot-companion'];
  const poses = ['celebrate_jump', 'eureka', 'curious', 'proud'];

  for (const pose of poses) {
    for (const fam of families) {
      const selector = `${fam}.${pose}`;
      assert(styleCss.includes(selector), `style.css must bind selector ${selector}`);
    }
  }
});

test('2.4 Hardware Compositing Attributes: will-change and transform-origin properly set', () => {
  // Base rule
  const baseBlock = styleCss.match(/\.spidey-mascot,\s*\.spideybot,\s*\.mascot-companion\s*\{([^}]+)\}/);
  assert(baseBlock, 'Base mascot selector block must exist');
  assert(baseBlock[1].includes('will-change: transform'), 'Base block must declare will-change: transform');
  assert(baseBlock[1].includes('transform-origin: center bottom'), 'Base block must declare transform-origin: center bottom');

  // Specific pose blocks
  const posesWithCustomOrigins = [
    { pose: 'celebrate_jump', origin: 'center bottom' },
    { pose: 'eureka', origin: 'center bottom' },
    { pose: 'curious', origin: '50% 75%' }, // head tilt pivot
    { pose: 'proud', origin: 'center bottom' }
  ];

  for (const { pose, origin } of posesWithCustomOrigins) {
    const ruleMatch = styleCss.match(new RegExp(`\\.spidey-mascot\\.${pose}[\\s\\S]*?\\{([^}]+)\\}`));
    assert(ruleMatch, `Pose block for .spidey-mascot.${pose} must exist`);
    assert(ruleMatch[1].includes(`transform-origin: ${origin}`), `Pose ${pose} must specify transform-origin: ${origin}`);
    assert(ruleMatch[1].includes('will-change: transform'), `Pose ${pose} must specify will-change: transform`);
  }
});

// ============================================================================
// SECTION 3: VECTOR RENDERING, SCALING & NON-CLIPPING AUDIT
// ============================================================================
console.log('\n--- [SECTION 3] Vector Rendering, Non-Clipping & Geometric Scale Audit ---');

test('3.1 ViewBox and Scale Invariance across Viewports (24px to 1024px)', () => {
  const testSizes = [24, 48, 80, 120, 240, 512, 1024];
  const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  
  for (const size of testSizes) {
    for (const char of characters) {
      const svg = Mascot[char](size, 'celebrate_jump');
      assert(svg.includes(`width="${size}"`), `${char} at size ${size} must set width="${size}"`);
      assert(svg.includes(`height="${size}"`), `${char} at size ${size} must set height="${size}"`);
      assert(svg.includes('viewBox="0 0 '), `${char} must retain fixed coordinate viewBox`);
      assert(!svg.includes('NaN'), `${char} at size ${size} must not generate NaN coordinates`);
      assert(!svg.includes('undefined'), `${char} at size ${size} must not generate undefined attributes`);
      strictXmlValidate(svg, `${char}.${size}.celebrate_jump`);
    }
  }
});

test('3.2 Non-Clipping Vector Envelope Audit: Coordinates remain within internal viewBox margins', () => {
  // Parse numeric coordinates in paths, circles, rects, ellipses
  const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['celebrate_jump', 'eureka', 'curious', 'proud'];
  const costumes = ['default', 'detective', 'explorer', 'scientist', 'whimsical'];

  for (const char of characters) {
    for (const pose of poses) {
      for (const costume of costumes) {
        const svg = Mascot[char](100, pose, costume);
        strictXmlValidate(svg, `${char}.${pose}.${costume}`);

        // Check for coordinates outside reasonable bounds (-30 to 150 for viewBox 100 or 120)
        // Extract all numeric attributes
        const coordRegex = /\b(?:cx|cy|x|y|x1|y1|x2|y2|r|rx|ry)="(-?\d+(?:\.\d+)?)"/g;
        let match;
        while ((match = coordRegex.exec(svg)) !== null) {
          const val = parseFloat(match[1]);
          assert(!isNaN(val), `Coordinate value cannot be NaN in ${char}.${pose}.${costume}`);
          // Extreme out of bounds check
          assert(val >= -50 && val <= 180, `Coordinate ${val} is wildly outside viewBox in ${char}.${pose}.${costume}`);
        }
      }
    }
  }
});

test('3.3 Transform Vertical Displacement Headroom: celebrate_jump translateY(-16px) does not clip in standard containers', () => {
  // In mascotCelebrateJump:
  // Keyframe: 35% { transform: translateY(-16px) scale(0.92, 1.08); }
  // With transform-origin: center bottom, top expands upward by 16px + (height * 0.08).
  // Verify that game containers holding mascots (.victory-mascot, .banner-mascot, .mascot-avatar) do NOT set overflow: hidden.
  const containerClasses = ['.victory-mascot', '.banner-mascot', '.mascot-avatar'];
  for (const cls of containerClasses) {
    const ruleMatch = styleCss.match(new RegExp(`${cls.replace('.', '\\.')}\\s*\\{([^}]+)\\}`));
    assert(ruleMatch, `style.css must define ${cls}`);
    assert(!ruleMatch[1].includes('overflow: hidden'), `${cls} must not enforce overflow: hidden which would clip jumping mascots`);
  }
});

// ============================================================================
// SECTION 4: CHARACTER & COSTUME SYSTEM DIVERSITY & COMBINATORIAL UNIQUENESS
// ============================================================================
console.log('\n--- [SECTION 4] Costume System & Anatomical Pose Distinctness ---');

test('4.1 Intra-Character Pose Distinctness: All 4 new poses produce distinct vector markup', () => {
  const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['celebrate_jump', 'eureka', 'curious', 'proud'];

  for (const char of characters) {
    const svgs = {};
    for (const pose of poses) {
      svgs[pose] = Mascot[char](100, pose);
    }

    // Verify all pairwise comparisons are distinct
    for (let i = 0; i < poses.length; i++) {
      for (let j = i + 1; j < poses.length; j++) {
        const p1 = poses[i];
        const p2 = poses[j];
        assert.notStrictEqual(svgs[p1], svgs[p2], `${char} pose ${p1} and ${p2} must produce distinct SVGs`);
      }
    }
  }
});

test('4.2 Costume Specificity: Costumes render designated accessories', () => {
  // Detective Spidey
  const detectiveSvg = Mascot.hero(120, 'wave', 'detective');
  assert(detectiveSvg.includes('costume-detective'), 'Must include costume-detective class');
  assert(detectiveSvg.includes('Deerstalker Detective Hat'), 'Must render deerstalker hat');
  assert(detectiveSvg.includes('Golden Detective Badge'), 'Must render detective badge');

  // Explorer Bunny
  const explorerSvg = Mascot.bunny(100, 'idle', 'explorer');
  assert(explorerSvg.includes('costume-explorer'), 'Must include costume-explorer class');
  assert(explorerSvg.includes('Safari Pith Helmet'), 'Must render safari pith helmet');
  assert(explorerSvg.includes('Crossbody Satchel'), 'Must render crossbody satchel');

  // Scientist Panda
  const scientistSvg = Mascot.panda(100, 'idle', 'scientist');
  assert(scientistSvg.includes('costume-scientist'), 'Must include costume-scientist class');
  assert(scientistSvg.includes('Round Metallic Lab Goggles'), 'Must render round lab goggles');
  assert(scientistSvg.includes('Lab Coat Collar'), 'Must render lab coat collar');

  // Whimsical Cat
  const whimsicalSvg = Mascot.cat(100, 'idle', 'whimsical');
  assert(whimsicalSvg.includes('costume-whimsical'), 'Must include costume-whimsical class');
  assert(whimsicalSvg.includes('Whimsical Wizard Hat'), 'Must render wizard hat');
  assert(whimsicalSvg.includes('Celestial Star Charm Collar'), 'Must render star charm collar');
});

test('4.3 Dynamic Magnifying Glass Adaptation in Detective Spidey', () => {
  // In idle/wave: in hand
  const waveDetective = Mascot.hero(120, 'wave', 'detective');
  assert(waveDetective.includes('Magnifying Glass In Hand'), 'Wave pose holds magnifying glass in hand');

  // In think/curious: over eye
  const thinkDetective = Mascot.hero(120, 'think', 'detective');
  assert(thinkDetective.includes('Magnifying Glass Over Eye'), 'Think pose positions magnifying glass over eye');

  const curiousDetective = Mascot.hero(120, 'curious', 'detective');
  assert(curiousDetective.includes('Magnifying Glass Over Eye'), 'Curious pose positions magnifying glass over eye');
});

test('4.4 Invariant Protection: Mascot.squad length is strictly 5 and schema-complete', () => {
  assert.strictEqual(Mascot.squad.length, 5, 'Mascot.squad.length must be exactly 5');
  const requiredFields = ['id', 'name', 'species', 'worldId', 'color'];
  for (const member of Mascot.squad) {
    for (const field of requiredFields) {
      assert(member[field], `squad member ${member.id} must have property ${field}`);
    }
  }
  // Decoupled costumes catalog check
  assert(Array.isArray(Mascot.costumes), 'Mascot.costumes must be an array');
  assert.strictEqual(Mascot.costumes.length, 4, 'Mascot.costumes must contain 4 entries');
});

// ============================================================================
// SECTION 5: DISPATCHERS & RESOLVERS
// ============================================================================
console.log('\n--- [SECTION 5] Companion Dispatcher & World Resolver Verification ---');

test('5.1 Mascot.companion polymorphic resolution with costume support', () => {
  assert(Mascot.companion('detective').includes('costume-detective'), 'companion("detective") returns Detective Spidey');
  assert(Mascot.companion('explorer').includes('costume-explorer'), 'companion("explorer") returns Explorer Bunny');
  assert(Mascot.companion('scientist').includes('costume-scientist'), 'companion("scientist") returns Scientist Panda');
  assert(Mascot.companion('whimsical').includes('costume-whimsical'), 'companion("whimsical") returns Whimsical Cat');
  
  // Custom costume passed through nameOrId
  assert(Mascot.companion('hero', 100, 'idle', 'detective').includes('costume-detective'), 'companion with costume param');
  assert(Mascot.companion('panda', 100, 'idle', 'scientist').includes('costume-scientist'), 'companion panda with scientist costume');
});

test('5.2 Mascot.forWorld auto-resolver for World 5 (puzzle/tekateki)', () => {
  assert(Mascot.forWorld('puzzle').includes('costume-detective'), 'forWorld("puzzle") defaults to Detective Spidey');
  assert(Mascot.forWorld('tekateki').includes('costume-detective'), 'forWorld("tekateki") defaults to Detective Spidey');
  assert(Mascot.forWorld('teka-teki').includes('costume-detective'), 'forWorld("teka-teki") defaults to Detective Spidey');
  
  // Explorer costume override
  assert(Mascot.forWorld('puzzle', 90, 'idle', 'explorer').includes('costume-explorer'), 'forWorld("puzzle", ..., "explorer") returns Explorer Bunny');
  assert(Mascot.forWorld('puzzle', 90, 'idle', 'bunny').includes('costume-explorer'), 'forWorld("puzzle", ..., "bunny") returns Explorer Bunny');

  // Worlds 1-4 intact
  assert(Mascot.forWorld('hewan').includes('cat'), 'World 1 is cat');
  assert(Mascot.forWorld('angka').includes('panda'), 'World 2 is panda');
  assert(Mascot.forWorld('spidey').includes('spidey-mascot'), 'World 3 is hero');
  assert(Mascot.forWorld('koding').includes('spideybot'), 'World 4 is robot');
});

test('5.3 Mascot.randomCelebration produces valid SVGs with diverse celebration poses', () => {
  const seenPoses = new Set();
  for (let i = 0; i < 100; i++) {
    const svg = Mascot.randomCelebration('hero', 120, 'detective');
    strictXmlValidate(svg, `randomCelebration.${i}`);
    for (const pose of ['cheer', 'happy', 'celebrate_jump', 'eureka']) {
      if (svg.includes(` ${pose}`)) {
        seenPoses.add(pose);
      }
    }
  }
  assert.strictEqual(seenPoses.size, 4, `randomCelebration over 100 runs must encounter all 4 celebration poses, found: ${Array.from(seenPoses).join(', ')}`);
});

// ============================================================================
// SECTION 6: ADVERSARIAL STRESS, FUZZING & PERFORMANCE
// ============================================================================
console.log('\n--- [SECTION 6] Adversarial Boundary, Fuzzing & Performance Audit ---');

test('6.1 Adversarial boundary inputs (null, undefined, malicious characters, NaN)', () => {
  const boundaryInputs = [
    null, undefined, '', '   ', 0, -1, 999999, NaN,
    'unknown_pose', 'super_jump', 'CHEER', 'curious_tilt',
    false, true, 123
  ];

  for (const input of boundaryInputs) {
    // Should not throw or crash
    const svg1 = Mascot.hero(input, input, input);
    assert(typeof svg1 === 'string' && svg1.trim().startsWith('<svg'), `hero must handle input ${input}`);
    strictXmlValidate(svg1, `hero.${input}`);

    const svg2 = Mascot.companion(input, input, input, input);
    assert(typeof svg2 === 'string' && svg2.trim().startsWith('<svg'), `companion must handle input ${input}`);
    strictXmlValidate(svg2, `companion.${input}`);

    const svg3 = Mascot.forWorld(input);
    assert(typeof svg3 === 'string' && svg3.trim().startsWith('<svg'), `forWorld must handle input ${input}`);
    strictXmlValidate(svg3, `forWorld.${input}`);
  }
});

test('6.2 Rapid sequential generation stress (10,000 SVGs performance & memory harness)', () => {
  const iterations = 10000;
  const chars = ['hero', 'robot', 'cat', 'bunny', 'panda'];
  const poses = ['celebrate_jump', 'eureka', 'curious', 'proud'];
  const costumes = ['detective', 'explorer', 'scientist', 'whimsical', 'default'];

  if (global.gc) global.gc();
  const memBefore = process.memoryUsage().heapUsed;
  const startTime = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    const char = chars[i % chars.length];
    const pose = poses[i % poses.length];
    const costume = costumes[i % costumes.length];
    const svg = Mascot[char](100, pose, costume);
    assert(svg.length > 500, 'Generated SVG must not be empty');
  }

  const endTime = process.hrtime.bigint();
  if (global.gc) global.gc();
  const memAfter = process.memoryUsage().heapUsed;

  const durationMs = Number(endTime - startTime) / 1e6;
  const opsPerSec = (iterations / (durationMs / 1000)).toFixed(0);
  const memDeltaMb = ((memAfter - memBefore) / 1024 / 1024).toFixed(2);

  console.log(`      ⚡ Performance: 10,000 SVGs in ${durationMs.toFixed(2)} ms (${Number(opsPerSec).toLocaleString()} SVGs/sec)`);
  console.log(`      ⚡ Memory Delta: ${memDeltaMb} MB`);

  assert(durationMs < 500, `Generating 10,000 SVGs must take <500ms, took ${durationMs}ms`);
});

console.log('\n================================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} AUDIT CHECKS PASSED WITH ZERO DEFECTS!`);
console.log('================================================================\n');
