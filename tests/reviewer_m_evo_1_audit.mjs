// tests/reviewer_m_evo_1_audit.mjs
// Independent Adversarial Review & Forensic Audit for Milestone M-EVO-1
// Reviewer: Reviewer M-EVO-1.1
// Focus: Lingokids Preschool Vector Quality, Chubby Anatomy, Anime Eyes,
// Rosy Cheeks, Dynamic Mouths, 5 Characters x 4 Poses, Dispatchers,
// Backward Compatibility, Stress Testing, and Integrity.

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  ✔ [PASS] ${title}`);
  } catch (err) {
    failedChecks++;
    failures.push({ title, error: err });
    console.log(`  ✖ [FAIL] ${title} -> ${err.message}`);
  }
}

async function runAudit() {
  console.log('============================================================');
  console.log('🔍 REVIEWER M-EVO-1.1 ADVERSARIAL FORENSIC AUDIT (MASCOT SYSTEM)');
  console.log('============================================================\n');

  const { Mascot } = await import('../mascot.js');
  const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'style.css'), 'utf8');

  // --------------------------------------------------------------------------
  // SUITE 1: INTEGRITY & ANTI-CHEATING VERIFICATION
  // --------------------------------------------------------------------------
  console.log('[Suite 1: Integrity & Anti-Cheating Verification]');

  check('1.1 Zero hardcoded test return values in mascot.js', () => {
    const rawCode = fs.readFileSync(path.join(ROOT_DIR, 'mascot.js'), 'utf8');
    assert(!rawCode.includes('// mock'), 'mascot.js must not contain mock markers');
    assert(!rawCode.includes('// dummy'), 'mascot.js must not contain dummy markers');
    assert(!rawCode.includes('// placeholder'), 'mascot.js must not contain placeholder markers');
    assert(!rawCode.includes('// stub'), 'mascot.js must not contain stub markers');
    assert(!rawCode.includes('TODO'), 'mascot.js must not contain unfulfilled TODO markers');
    assert(!rawCode.includes('FIXME'), 'mascot.js must not contain FIXME markers');
  });

  check('1.2 Authentic Procedural Rendering (Dynamic sizes produce dynamic SVG attributes)', () => {
    const s1 = Mascot.hero(64, 'idle');
    const s2 = Mascot.hero(144, 'idle');
    assert(s1.includes('width="64"') && s1.includes('height="64"'), 'Size 64 must be dynamically reflected');
    assert(s2.includes('width="144"') && s2.includes('height="144"'), 'Size 144 must be dynamically reflected');
    assert.notStrictEqual(s1, s2, 'Different sizes must produce distinct SVG outputs');
  });

  // --------------------------------------------------------------------------
  // SUITE 2: 5 CHARACTERS X 4 POSES COMPLETENESS & CANONICAL CONTRACTS
  // --------------------------------------------------------------------------
  console.log('\n[Suite 2: 5 Characters x 4 Poses Completeness]');

  const characters = [
    { id: 'hero', name: 'Spidey Cilik', fn: (s, p) => Mascot.hero(s, p), rootClass: 'spidey-mascot' },
    { id: 'robot', name: 'Spideybot / Bot Sahabat', fn: (s, p) => Mascot.robot(s, p), rootClass: 'spideybot' },
    { id: 'cat', name: 'Kucing Ceria', fn: (s, p) => Mascot.cat(s, p), rootClass: 'cat' },
    { id: 'bunny', name: 'Kelinci Lincah', fn: (s, p) => Mascot.bunny(s, p), rootClass: 'bunny' },
    { id: 'panda', name: 'Panda Pintar', fn: (s, p) => Mascot.panda(s, p), rootClass: 'panda' }
  ];

  const canonicalPoses = ['idle', 'cheer', 'think', 'wave'];

  for (const c of characters) {
    check(`2.${characters.indexOf(c) + 1} Character [${c.name}]: All 4 canonical poses exist and are distinct`, () => {
      const svgs = {};
      for (const p of canonicalPoses) {
        const svg = c.fn(100, p);
        assert(typeof svg === 'string', `${c.id} ${p} must return string`);
        assert(svg.includes('<svg') && svg.includes('</svg>'), `${c.id} ${p} must contain valid svg tags`);
        assert(svg.includes(c.rootClass), `${c.id} ${p} must contain rootClass ${c.rootClass}`);
        assert(svg.includes(p), `${c.id} ${p} must contain pose class ${p}`);
        svgs[p] = svg;
      }
      // Ensure all 4 poses produce distinct visual markup
      assert.notStrictEqual(svgs.idle, svgs.cheer, `${c.id}: idle must differ from cheer`);
      assert.notStrictEqual(svgs.cheer, svgs.think, `${c.id}: cheer must differ from think`);
      assert.notStrictEqual(svgs.think, svgs.wave, `${c.id}: think must differ from wave`);
      assert.notStrictEqual(svgs.idle, svgs.wave, `${c.id}: idle must differ from wave`);
    });
  }

  // --------------------------------------------------------------------------
  // SUITE 3: LINGOKIDS PRESCHOOL ART QUALITY CRITERIA
  // --------------------------------------------------------------------------
  console.log('\n[Suite 3: Lingokids Preschool Art Quality Criteria]');

  check('3.1 Multi-Stop Radial & Linear Gradients for Volumetric Depth', () => {
    const charsWithGrads = [
      { name: 'hero', svg: Mascot.hero(100, 'cheer'), expected: ['spideyHeadGrad', 'spideySuitGrad', 'spideyBlueGrad', 'spideyEyeGrad'] },
      { name: 'robot', svg: Mascot.robot(100, 'idle'), expected: ['botDomeGrad', 'botVisorGrad', 'botGearGrad'] },
      { name: 'cat', svg: Mascot.cat(100, 'wave'), expected: ['catCoatGrad', 'catBibGrad', 'catEyeGrad'] },
      { name: 'bunny', svg: Mascot.bunny(100, 'think'), expected: ['bunnyFurGrad', 'bunnyPinkGrad', 'bunnyEyeGrad'] },
      { name: 'panda', svg: Mascot.panda(100, 'cheer'), expected: ['pandaWhiteGrad', 'pandaBlackGrad', 'pandaEyeGrad'] }
    ];

    for (const item of charsWithGrads) {
      assert(item.svg.includes('<defs>'), `${item.name} SVG must contain <defs> block`);
      for (const gradId of item.expected) {
        assert(item.svg.includes(`id="${gradId}"`), `${item.name} SVG must contain gradient ${gradId}`);
        assert(item.svg.includes(`url(#${gradId})`), `${item.name} SVG must reference url(#${gradId})`);
      }
    }
  });

  check('3.2 Chubby Squircle / Organic Toddler Anatomy', () => {
    const hero = Mascot.hero(120, 'wave');
    assert(hero.includes('rx="37" ry="32"') || hero.includes('ellipse'), 'Hero must feature chubby squircle head');
    assert(hero.includes('rx="16"'), 'Hero must feature rounded chubby bean torso');

    const cat = Mascot.cat(100, 'idle');
    assert(cat.includes('rx="25" ry="20"'), 'Cat must feature chubby pear body');
    assert(cat.includes('rx="32" ry="26"'), 'Cat must feature chubby kitten head');

    const bunny = Mascot.bunny(100, 'idle');
    assert(bunny.includes('rx="24" ry="20"'), 'Bunny must feature chubby egg tummy');
    assert(bunny.includes('rx="30" ry="24"'), 'Bunny must feature round chubby head');

    const panda = Mascot.panda(100, 'idle');
    assert(panda.includes('rx="26" ry="20"'), 'Panda must feature plump body');
    assert(panda.includes('rx="33" ry="27"'), 'Panda must feature giant huggable head');
  });

  check('3.3 Anime Chibi Eyes with Dual Specular Reflections (All organic characters)', () => {
    const organicChars = [
      { name: 'hero', svg: Mascot.hero(100, 'cheer') },
      { name: 'cat', svg: Mascot.cat(100, 'cheer') },
      { name: 'bunny', svg: Mascot.bunny(100, 'cheer') },
      { name: 'panda', svg: Mascot.panda(100, 'cheer') }
    ];

    for (const c of organicChars) {
      // Must have white specular glints
      const whiteGlints = (c.svg.match(/fill="#FFFFFF"/g) || []).length;
      assert(whiteGlints >= 4, `${c.name} must have at least 4 white glints (dual glints x 2 eyes), found ${whiteGlints}`);
    }

    // Robot in idle/wave has round sparkling digital eyes with dual specular highlights
    const robot = Mascot.robot(100, 'idle');
    const robotGlints = (robot.match(/fill="#FFFFFF"/g) || []).length;
    assert(robotGlints >= 4, `Robot in idle must feature dual digital specular shines, found ${robotGlints}`);
  });

  check('3.4 Rosy Cheek Blush Pills', () => {
    const hero = Mascot.hero(100, 'idle');
    assert(hero.includes('#FF8A80'), 'Hero must have coral rosy cheek pills');

    const cat = Mascot.cat(100, 'idle');
    assert(cat.includes('#F472B6') && cat.includes('opacity="0.6"'), 'Cat must have soft pink rosy cheeks');

    const bunny = Mascot.bunny(100, 'idle');
    assert(bunny.includes('#F472B6') && bunny.includes('opacity="0.6"'), 'Bunny must have soft pink rosy cheeks');

    const panda = Mascot.panda(100, 'idle');
    assert(panda.includes('#FDA4AF') && panda.includes('opacity="0.7"'), 'Panda must have rosy cheeks');
  });

  check('3.5 Dynamic Expressive Preschool Mouths', () => {
    // Hero mouths
    const heroCheer = Mascot.hero(100, 'cheer');
    assert(heroCheer.includes('#F43F5E'), 'Hero cheer mouth must feature joyful pink tongue');
    const heroThink = Mascot.hero(100, 'think');
    assert(heroThink.includes('stroke="#1E293B"'), 'Hero think mouth must feature curious curve');

    // Robot visor digital expressions
    const robotCheer = Mascot.robot(100, 'cheer');
    assert(robotCheer.includes('Q 38 48 43 54'), 'Robot cheer must feature happy digital arc eyes (^ ^)');
    const robotThink = Mascot.robot(100, 'think');
    assert(robotThink.includes('stroke-dasharray="2 1"'), 'Robot think must feature radar scanning display');

    // Bunny buck tooth smile
    const bunnyIdle = Mascot.bunny(100, 'idle');
    assert(bunnyIdle.includes('width="3"') && bunnyIdle.includes('height="2.5"'), 'Bunny must feature cute buck tooth');
  });

  // --------------------------------------------------------------------------
  // SUITE 4: UNIVERSAL POLYMORPHIC DISPATCHERS
  // --------------------------------------------------------------------------
  console.log('\n[Suite 4: Universal Polymorphic Dispatchers]');

  check('4.1 Mascot.companion() polymorphic character resolution', () => {
    const cases = [
      { input: 'hero', expectedClass: 'spidey-mascot' },
      { input: 'spidey', expectedClass: 'spidey-mascot' },
      { input: 'HERO', expectedClass: 'spidey-mascot' },
      { input: 'bot', expectedClass: 'spideybot' },
      { input: 'robot', expectedClass: 'spideybot' },
      { input: 'spideybot', expectedClass: 'spideybot' },
      { input: 'cat', expectedClass: 'cat' },
      { input: 'kucing', expectedClass: 'cat' },
      { input: ' CAT ', expectedClass: 'cat' },
      { input: 'bunny', expectedClass: 'bunny' },
      { input: 'kelinci', expectedClass: 'bunny' },
      { input: 'rabbit', expectedClass: 'bunny' },
      { input: 'panda', expectedClass: 'panda' },
      { input: 'PANDA', expectedClass: 'panda' },
      { input: 'unknown_creature', expectedClass: 'spidey-mascot' } // Fallback to hero
    ];

    for (const testCase of cases) {
      const svg = Mascot.companion(testCase.input, 90, 'cheer');
      assert(svg.includes(testCase.expectedClass), `companion("${testCase.input}") must contain ${testCase.expectedClass}`);
      assert(svg.includes('cheer'), `companion("${testCase.input}") must pass pose "cheer" through`);
    }
  });

  check('4.2 Mascot.forWorld() world companion auto-resolver', () => {
    const worldMappings = [
      { world: 'hewan', expectedClass: 'cat' },
      { world: 'HEWAN', expectedClass: 'cat' },
      { world: 'angka', expectedClass: 'panda' },
      { world: 'spidey', expectedClass: 'spidey-mascot' },
      { world: 'koding', expectedClass: 'spideybot' },
      { world: 'space_station', expectedClass: 'spidey-mascot' } // Fallback to hero
    ];

    for (const w of worldMappings) {
      const svg = Mascot.forWorld(w.world, 85, 'think');
      assert(svg.includes(w.expectedClass), `forWorld("${w.world}") must contain ${w.expectedClass}`);
      assert(svg.includes('think'), `forWorld("${w.world}") must pass pose "think" through`);
    }
  });

  check('4.3 Mascot.squad metadata catalog structure', () => {
    assert(Array.isArray(Mascot.squad), 'Mascot.squad must be an array');
    assert.strictEqual(Mascot.squad.length, 5, 'Mascot.squad must contain exactly 5 members');
    const ids = Mascot.squad.map(m => m.id);
    assert(ids.includes('spidey'), 'squad must include spidey');
    assert(ids.includes('cat'), 'squad must include cat');
    assert(ids.includes('bunny'), 'squad must include bunny');
    assert(ids.includes('panda'), 'squad must include panda');
    assert(ids.includes('bot'), 'squad must include bot');

    for (const member of Mascot.squad) {
      assert(member.id && member.name && member.species && member.worldId && member.color,
        `Member ${member.id} must have all metadata fields`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 5: 100% STRICT BACKWARD COMPATIBILITY
  // --------------------------------------------------------------------------
  console.log('\n[Suite 5: 100% Strict Backward Compatibility]');

  check('5.1 Alias identity guarantees', () => {
    assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot must strictly equal Mascot.robot');
    assert.strictEqual(Mascot.kucing, Mascot.cat, 'Mascot.kucing must strictly equal Mascot.cat');
    assert.strictEqual(Mascot.kelinci, Mascot.bunny, 'Mascot.kelinci must strictly equal Mascot.bunny');
  });

  check('5.2 All 8 legacy poses on Mascot.hero strictly supported', () => {
    const legacyHeroPoses = ['wave', 'happy', 'cheer', 'cheering', 'think', 'thinking', 'encourage', 'encouraging'];
    for (const pose of legacyHeroPoses) {
      const svg = Mascot.hero(120, pose);
      assert(svg.includes('viewBox="0 0 120 120"'), `Hero pose ${pose} must preserve viewBox 0 0 120 120`);
      assert(svg.includes(`class="spidey-mascot ${pose}"`), `Hero pose ${pose} must preserve class "spidey-mascot ${pose}"`);
      assert(svg.includes('id="stickerGlow"'), `Hero pose ${pose} must preserve stickerGlow filter`);
      assert(svg.includes('filter="url(#stickerGlow)"'), `Hero pose ${pose} must apply stickerGlow filter`);
    }
  });

  check('5.3 All legacy poses on Mascot.robot strictly supported', () => {
    const legacyRobotPoses = ['idle', 'cheer', 'happy', 'think', 'thinking', 'wave'];
    for (const pose of legacyRobotPoses) {
      const svg = Mascot.robot(100, pose);
      assert(svg.includes('viewBox="0 0 100 100"'), `Robot pose ${pose} must preserve viewBox 0 0 100 100`);
      assert(svg.includes(`class="spideybot ${pose}"`), `Robot pose ${pose} must preserve class "spideybot ${pose}"`);
    }
  });

  check('5.4 Mascot.star exact backward compatibility', () => {
    const active = Mascot.star(40, true);
    assert(active.includes('viewBox="0 0 40 40"'), 'Star viewBox must be 0 0 40 40');
    assert(active.includes('class="star-icon active"'), 'Active star class must be "star-icon active"');
    assert(active.includes('fill="#FBBF24"'), 'Active star fill must be #FBBF24');
    assert(active.includes('stroke="#D97706"'), 'Active star stroke must be #D97706');

    const inactive = Mascot.star(40, false);
    assert(inactive.includes('class="star-icon inactive"'), 'Inactive star class must be "star-icon inactive"');
    assert(inactive.includes('fill="#CBD5E1"'), 'Inactive star fill must be #CBD5E1');
    assert(inactive.includes('stroke="#94A3B8"'), 'Inactive star stroke must be #94A3B8');
  });

  check('5.5 Mascot.web exact backward compatibility', () => {
    const web = Mascot.web(80);
    assert(web.includes('viewBox="0 0 100 100"'), 'Web viewBox must be 0 0 100 100');
    assert(web.includes('class="corner-web"'), 'Web class must be "corner-web"');
    assert(web.includes('stroke="#CBD5E1"'), 'Web stroke must be #CBD5E1');
  });

  // --------------------------------------------------------------------------
  // SUITE 6: ADVERSARIAL STRESS TESTING & BOUNDARY DEFENSE
  // --------------------------------------------------------------------------
  console.log('\n[Suite 6: Adversarial Stress Testing & Boundary Defense]');

  check('6.1 Extreme & Boundary Size Parameters', () => {
    const edgeSizes = [0, 1, 8, 16, 50, 100, 500, 2048, '100%', '80px', undefined, null];
    for (const size of edgeSizes) {
      assert.doesNotThrow(() => {
        const svg = Mascot.hero(size, 'wave');
        assert(svg.includes('<svg'), `Hero failed on size: ${size}`);
      }, `Hero should handle size: ${size}`);

      assert.doesNotThrow(() => {
        const svg = Mascot.robot(size, 'idle');
        assert(svg.includes('<svg'), `Robot failed on size: ${size}`);
      }, `Robot should handle size: ${size}`);
    }
  });

  check('6.2 Malformed & Adversarial Pose Strings', () => {
    const weirdPoses = ['', '   ', 'FLYING_NINJA', 'undefined', 'null', 9999, false, true, '<script>alert(1)</script>'];
    for (const pose of weirdPoses) {
      assert.doesNotThrow(() => {
        const svg = Mascot.hero(100, pose);
        assert(svg.includes('<svg') && svg.includes('</svg>'), `Hero must not throw on weird pose: ${pose}`);
      });
      assert.doesNotThrow(() => {
        const svg = Mascot.robot(100, pose);
        assert(svg.includes('<svg') && svg.includes('</svg>'), `Robot must not throw on weird pose: ${pose}`);
      });
      assert.doesNotThrow(() => {
        const svg = Mascot.cat(100, pose);
        assert(svg.includes('<svg') && svg.includes('</svg>'), `Cat must not throw on weird pose: ${pose}`);
      });
      assert.doesNotThrow(() => {
        const svg = Mascot.bunny(100, pose);
        assert(svg.includes('<svg') && svg.includes('</svg>'), `Bunny must not throw on weird pose: ${pose}`);
      });
      assert.doesNotThrow(() => {
        const svg = Mascot.panda(100, pose);
        assert(svg.includes('<svg') && svg.includes('</svg>'), `Panda must not throw on weird pose: ${pose}`);
      });
    }
  });

  check('6.3 XML / SVG Tag Balance Across All Generated SVGs', () => {
    // Verify opening and closing tag counts match for container elements
    const testSvgs = [
      Mascot.hero(100, 'cheer'),
      Mascot.hero(100, 'think'),
      Mascot.hero(100, 'wave'),
      Mascot.hero(100, 'idle'),
      Mascot.robot(100, 'cheer'),
      Mascot.robot(100, 'think'),
      Mascot.robot(100, 'idle'),
      Mascot.cat(100, 'cheer'),
      Mascot.bunny(100, 'cheer'),
      Mascot.panda(100, 'cheer'),
      Mascot.star(40, true),
      Mascot.web(80)
    ];

    for (const svg of testSvgs) {
      const openSvg = (svg.match(/<svg/g) || []).length;
      const closeSvg = (svg.match(/<\/svg>/g) || []).length;
      assert.strictEqual(openSvg, closeSvg, 'SVG open/close count mismatch');

      const openDefs = (svg.match(/<defs>/g) || []).length;
      const closeDefs = (svg.match(/<\/defs>/g) || []).length;
      assert.strictEqual(openDefs, closeDefs, 'Defs open/close count mismatch');

      const openG = (svg.match(/<g[\s>]/g) || []).length;
      const closeG = (svg.match(/<\/g>/g) || []).length;
      assert.strictEqual(openG, closeG, 'Group <g> open/close count mismatch');
    }
  });

  check('6.4 High-Throughput Performance (10,000 mascot calls)', () => {
    const start = Date.now();
    for (let i = 0; i < 2000; i++) {
      Mascot.hero(100, 'wave');
      Mascot.robot(90, 'cheer');
      Mascot.cat(100, 'think');
      Mascot.bunny(100, 'cheer');
      Mascot.panda(100, 'idle');
    }
    const duration = Date.now() - start;
    assert(duration < 2000, `10,000 calls must finish under 2000ms, took ${duration}ms`);
  });

  // --------------------------------------------------------------------------
  // SUITE 7: CSS KEYFRAME ANIMATION INTEGRITY
  // --------------------------------------------------------------------------
  console.log('\n[Suite 7: CSS Keyframe Animation Integrity]');

  check('7.1 Mascot CSS classes use GPU-accelerated transforms', () => {
    assert(styleCss.includes('.spidey-mascot'), 'style.css must target .spidey-mascot');
    assert(styleCss.includes('.spideybot'), 'style.css must target .spideybot');
    assert(styleCss.includes('.mascot-companion'), 'style.css must target .mascot-companion');
    assert(styleCss.includes('transform-origin: center bottom'), 'Base transform-origin must be center bottom');
    assert(styleCss.includes('will-change: transform'), 'will-change: transform must be declared for 60fps rendering');
  });

  check('7.2 4 Pose Animation Keyframes defined cleanly in style.css', () => {
    assert(styleCss.includes('@keyframes mascotBreathe'), 'mascotBreathe must be defined');
    assert(styleCss.includes('@keyframes mascotCheer'), 'mascotCheer must be defined');
    assert(styleCss.includes('@keyframes mascotThink'), 'mascotThink must be defined');
    assert(styleCss.includes('@keyframes mascotWave'), 'mascotWave must be defined');
    assert(styleCss.includes('@keyframes antennaGlow'), 'antennaGlow must be defined');
  });

  check('7.3 No CSS animation collision with existing structural containers', () => {
    // .mascot-avatar, .banner-mascot, .victory-mascot keep mascotFloat
    assert(styleCss.includes('.mascot-avatar'), '.mascot-avatar retained');
    assert(styleCss.includes('.banner-mascot'), '.banner-mascot retained');
    assert(styleCss.includes('.victory-mascot'), '.victory-mascot retained');
    assert(styleCss.includes('@keyframes mascotFloat'), '@keyframes mascotFloat retained without regression');
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`📊 AUDIT EXECUTION SUMMARY: ${passedChecks} Passed | ${failedChecks} Failed | ${totalChecks} Total`);
  console.log('============================================================');

  if (failedChecks > 0) {
    console.log('\n❌ DETECTED FAILURES:');
    for (const f of failures) {
      console.log(`  - ${f.title}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log('\n✔ ALL AUDIT VERIFICATIONS PASSED CLEANLY (Zero integrity violations).');
  }
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
