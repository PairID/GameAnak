// tests/forensic_auditor_w5_m3_test.mjs
// Independent Forensic Audit Script for World 5 Milestone 3 (W5-M3)
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mascot } from '../mascot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
const mascotJs = fs.readFileSync(path.join(rootDir, 'mascot.js'), 'utf-8');

console.log('============================================================');
console.log('🔍 INDEPENDENT FORENSIC INTEGRITY AUDIT: W5-M3');
console.log('============================================================\n');

let passCount = 0;
let failCount = 0;

function auditCheck(desc, fn) {
  try {
    fn();
    passCount++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    failCount++;
    console.error(`  [FAIL] ${desc}: ${err.message}`);
  }
}

// Strict XML Tag Balancer
function validateXml(svgStr, context) {
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
      const top = stack.pop();
      if (top !== tag) {
        throw new Error(`XML mismatch in ${context}: expected </${top}>, found </${tag}>`);
      }
    } else if (!isSelfClosing) {
      stack.push(tag);
    }
  }
  if (stack.length > 0) {
    throw new Error(`XML unclosed tags in ${context}: ${stack.join(', ')}`);
  }
}

// Helper to extract nested brace blocks (like @keyframes { ... })
function extractBlock(src, keyword) {
  const idx = src.indexOf(keyword);
  if (idx === -1) return null;
  const startBrace = src.indexOf('{', idx);
  if (startBrace === -1) return null;
  let depth = 1;
  let i = startBrace + 1;
  while (i < src.length && depth > 0) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  return src.slice(startBrace + 1, i - 1);
}

// -------------------------------------------------------------
// 1. Zero-Stub & Real Vector Path Verification for Dynamic Costumes
// -------------------------------------------------------------
console.log('--- 1. Dynamic Costumes & Vector Accessories ---');

auditCheck('Detective Spidey renders genuine multi-layered SVG hat, badge, and magnifying glass', () => {
  const defaultSvg = Mascot.hero(120, 'wave', 'default');
  const detectiveSvg = Mascot.hero(120, 'wave', 'detective');

  assert.notStrictEqual(defaultSvg, detectiveSvg, 'Detective costume must differ from default');
  assert(detectiveSvg.length > defaultSvg.length + 500, 'Detective costume must add substantial vector markup (>500 chars)');
  
  // Deerstalker hat: crown, double brim/visor, tie ribbon
  assert(detectiveSvg.includes('Deerstalker Detective Hat'), 'Must have deerstalker hat comment/section');
  assert(detectiveSvg.includes('fill="#92400E"'), 'Hat crown must have rich brown fill');
  assert(detectiveSvg.includes('stroke="#78350F"'), 'Hat must have brown brim paths');
  assert(detectiveSvg.includes('circle cx="60" cy="8" r="2.2" fill="#F59E0B"'), 'Hat must have top ribbon button');
  
  // Detective Badge & Lapels
  assert(detectiveSvg.includes('Golden Detective Badge'), 'Must have badge section');
  assert(detectiveSvg.includes('polygon points="60,65 65,69 63,75 60,73 57,75 55,69"'), 'Must have golden star badge polygon');
  assert(detectiveSvg.includes('stroke="#B45309"'), 'Must have coat lapels');

  // Magnifying glass in hand for wave pose
  assert(detectiveSvg.includes('circle cx="102" cy="20" r="12" fill="#38BDF8" fill-opacity="0.25"'), 'Must have magnifying glass lens');
  assert(detectiveSvg.includes('stroke="#78350F" stroke-width="4.5"'), 'Must have wooden handle');
  validateXml(detectiveSvg, 'Detective Spidey Wave');
});

auditCheck('Detective Spidey magnifying glass dynamically shifts over eye during think/curious poses', () => {
  const detectiveThink = Mascot.hero(120, 'think', 'detective');
  const detectiveCurious = Mascot.hero(120, 'curious', 'detective');
  const detectiveWave = Mascot.hero(120, 'wave', 'detective');

  assert(detectiveThink.includes('circle cx="76" cy="38" r="14"'), 'Think pose magnifying glass must be centered over eye at (76, 38)');
  assert(detectiveCurious.includes('circle cx="76" cy="38" r="14"'), 'Curious pose magnifying glass must be centered over eye at (76, 38)');
  assert(!detectiveWave.includes('circle cx="76" cy="38" r="14"'), 'Wave pose magnifying glass must NOT be over eye');
  assert(detectiveWave.includes('circle cx="102" cy="20" r="12"'), 'Wave pose magnifying glass must be in hand at (102, 20)');
  validateXml(detectiveThink, 'Detective Spidey Think');
  validateXml(detectiveCurious, 'Detective Spidey Curious');
});

auditCheck('Explorer Bunny renders genuine safari pith helmet, satchel, and compass rose', () => {
  const defaultSvg = Mascot.bunny(100, 'idle', 'default');
  const explorerSvg = Mascot.bunny(100, 'idle', 'explorer');

  assert.notStrictEqual(defaultSvg, explorerSvg, 'Explorer Bunny must differ from default');
  assert(explorerSvg.length > defaultSvg.length + 300, 'Explorer costume must add substantial markup (>300 chars)');

  // Safari Pith Helmet
  assert(explorerSvg.includes('Safari Pith Helmet'), 'Must have Safari Pith Helmet section');
  assert(explorerSvg.includes('fill="#FDE68A"'), 'Pith helmet crown must have safari khaki fill');
  assert(explorerSvg.includes('fill="#F59E0B"'), 'Pith helmet brim must have amber rim');
  assert(explorerSvg.includes('stroke="#047857"'), 'Pith helmet must have emerald green band');

  // Crossbody Satchel & Compass
  assert(explorerSvg.includes('Crossbody Satchel & Compass Badge'), 'Must have satchel section');
  assert(explorerSvg.includes('stroke="#92400E" stroke-width="3"'), 'Must have leather crossbody strap');
  assert(explorerSvg.includes('circle cx="50" cy="72" r="5" fill="#FBBF24"'), 'Must have golden compass casing');
  assert(explorerSvg.includes('stroke="#EF4444"'), 'Must have red compass needle lines');
  validateXml(explorerSvg, 'Explorer Bunny Idle');
});

auditCheck('Scientist Panda renders metallic lab goggles, coat collar, green beaker badge & pocket pens', () => {
  const defaultSvg = Mascot.panda(100, 'idle', 'default');
  const scientistSvg = Mascot.panda(100, 'idle', 'scientist');

  assert.notStrictEqual(defaultSvg, scientistSvg, 'Scientist Panda must differ from default');
  assert(scientistSvg.length > defaultSvg.length + 400, 'Scientist costume must add substantial markup (>400 chars)');

  // Lab Goggles
  assert(scientistSvg.includes('Round Metallic Lab Goggles with Chemical Reflection'), 'Must have lab goggles section');
  assert(scientistSvg.includes('stroke="#334155" stroke-width="3.5"'), 'Must have goggle elastic strap');
  assert(scientistSvg.includes('circle cx="36" cy="42" r="12" fill="#38BDF8" fill-opacity="0.25"'), 'Must have left goggle lens');
  assert(scientistSvg.includes('circle cx="64" cy="42" r="12" fill="#38BDF8" fill-opacity="0.25"'), 'Must have right goggle lens');
  assert(scientistSvg.includes('stroke="#FFFFFF" stroke-width="2.2"'), 'Must have chemical specular reflection streak');

  // Lab Coat Collar & Pins
  assert(scientistSvg.includes('Lab Coat Collar & Pins'), 'Must have lab coat collar section');
  assert(scientistSvg.includes('polygon points="50,71 47,77 53,77" fill="#10B981"'), 'Must have green beaker badge');
  assert(scientistSvg.includes('line x1="38" y1="72" x2="38" y2="67" stroke="#EF4444"'), 'Must have red pocket pen');
  assert(scientistSvg.includes('line x1="41" y1="72" x2="41" y2="66" stroke="#3B82F6"'), 'Must have blue pocket pen');

  // Verify Default Panda still renders Chunky Golden Glasses and NOT Lab Goggles
  assert(defaultSvg.includes('Chunky Golden Glasses'), 'Default panda must retain chunky golden glasses');
  assert(defaultSvg.includes('stroke="#FBBF24" stroke-width="3"'), 'Default panda must have golden glasses stroke');
  assert(!defaultSvg.includes('Round Metallic Lab Goggles'), 'Default panda must not have lab goggles markup');
  assert(!defaultSvg.includes('fill-opacity="0.25"'), 'Default panda must not have goggle tint');
  validateXml(scientistSvg, 'Scientist Panda Idle');
  validateXml(defaultSvg, 'Default Panda Idle');
});

auditCheck('Whimsical Cat renders wizard cone hat with golden star tip and celestial star collar', () => {
  const defaultSvg = Mascot.cat(100, 'idle', 'default');
  const whimsicalSvg = Mascot.cat(100, 'idle', 'whimsical');

  assert.notStrictEqual(defaultSvg, whimsicalSvg, 'Whimsical Cat must differ from default');
  assert(whimsicalSvg.length > defaultSvg.length + 300, 'Whimsical costume must add substantial markup (>300 chars)');

  // Wizard hat
  assert(whimsicalSvg.includes('Whimsical Wizard Hat'), 'Must have wizard hat section');
  assert(whimsicalSvg.includes('fill="#8B5CF6"'), 'Must have purple hat cone');
  assert(whimsicalSvg.includes('polygon points="82,2 84,0 86,2 88,1 87,4" fill="#FBBF24"'), 'Must have golden star on hat tip');
  assert(whimsicalSvg.includes('fill="#FEF08A"'), 'Must have hat star sparkle circles');

  // Celestial collar
  assert(whimsicalSvg.includes('Celestial Star Charm Collar'), 'Must have celestial collar section');
  assert(whimsicalSvg.includes('stroke="#EC4899"'), 'Must have pink collar ribbon');
  assert(whimsicalSvg.includes('polygon points="50,62 52,67 57,67 53,70 55,75 50,72 45,75 47,70 43,67 48,67" fill="#FBBF24"'), 'Must have golden star pendant');
  validateXml(whimsicalSvg, 'Whimsical Cat Idle');
});

// -------------------------------------------------------------
// 2. Pose Distinctness & Structural Variation
// -------------------------------------------------------------
console.log('\n--- 2. Pose Distinctness & Structural Variation ---');

const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
const newPoses = ['celebrate_jump', 'eureka', 'curious', 'proud'];
const baselinePoses = ['wave', 'idle'];

auditCheck('The 4 new poses are pairwise distinct and distinct from baseline across all 5 characters', () => {
  for (const char of characters) {
    const svgs = {};
    for (const pose of [...newPoses, ...baselinePoses]) {
      const svg = Mascot[char](100, pose).trim();
      validateXml(svg, `${char}.${pose}`);
      svgs[pose] = svg;
    }

    // Verify all 4 new poses are distinct from each other and baseline
    const testSet = [...newPoses, 'idle', 'wave'];
    for (let i = 0; i < testSet.length; i++) {
      for (let j = i + 1; j < testSet.length; j++) {
        const p1 = testSet[i];
        const p2 = testSet[j];
        // Strip class attribute to compare inner SVG geometry
        const stripClass = s => s.replace(/class="[^"]*"/g, '');
        assert.notStrictEqual(
          stripClass(svgs[p1]),
          stripClass(svgs[p2]),
          `Character ${char}: Pose ${p1} and ${p2} have identical SVG geometry! Cosmetic duplicate detected!`
        );
      }
    }
  }
});

auditCheck('Specific geometric elements verify authentic pose anatomy for all 4 new poses', () => {
  // celebrate_jump: high airborne arms / paws
  assert(Mascot.hero(100, 'celebrate_jump').includes('d="M 35 66 Q 14 38 18 16"'), 'Spidey celebrate_jump arm reaches high up to (18, 16)');
  assert(Mascot.robot(100, 'celebrate_jump').includes('rx="16" ry="5" fill="#F97316"'), 'Spideybot celebrate_jump fires rocket thruster');
  assert(Mascot.cat(100, 'celebrate_jump').includes('circle cx="26" cy="42" r="3" fill="#FCA5A5"'), 'Cat celebrate_jump displays pink paw pads');
  assert(Mascot.bunny(100, 'celebrate_jump').includes('d="M 45 53 Q 50 62 55 53 Z" fill="#1E293B"'), 'Bunny celebrate_jump has open joyful mouth');
  assert(Mascot.panda(100, 'celebrate_jump').includes('text x="10" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#FBBF24" stroke="#D97706" stroke-width="0.5">3</text>'), 'Panda celebrate_jump has floating math celebratory symbol 3');

  // eureka: lightbulb or star epiphany above head
  assert(Mascot.hero(100, 'eureka').includes('ellipse cx="60" cy="6" rx="6" ry="7" fill="#FDE047"'), 'Spidey eureka has bright lightbulb over head');
  assert(Mascot.robot(100, 'eureka').includes('ellipse cx="38" cy="53" rx="5" ry="6" fill="#22D3EE"'), 'Spideybot eureka has glowing visor eyes');
  assert(Mascot.cat(100, 'eureka').includes('polygon points="50,6 52,11 57,11 53,14 55,19 50,16 45,19 47,14 43,11 48,11" fill="#FBBF24"'), 'Cat eureka has bright gold star overhead');
  assert(Mascot.bunny(100, 'eureka').includes('polygon points="50,4 52,9 57,9 53,12 55,17 50,14 45,17 47,12 43,9 48,9" fill="#FBBF24"'), 'Bunny eureka has epiphany spark overhead');
  assert(Mascot.panda(100, 'eureka').includes('ellipse cx="50" cy="6" rx="5.5" ry="6.5" fill="#FDE047"'), 'Panda eureka has glowing epiphany bulb overhead');

  // curious: head tilt and question mark accent
  assert(Mascot.hero(100, 'curious').includes('stroke="#38BDF8" stroke-width="2.6" stroke-linecap="round" fill="none"'), 'Spidey curious has cyan question mark accent');
  assert(Mascot.cat(100, 'curious').includes('stroke="#FBBF24" stroke-width="2" stroke-linecap="round" fill="none"'), 'Cat curious has gold question mark accent');
  assert(Mascot.bunny(100, 'curious').includes('stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" fill="none"'), 'Bunny curious has purple question mark accent');
  assert(Mascot.panda(100, 'curious').includes('stroke="#F59E0B" stroke-width="2" stroke-linecap="round" fill="none"'), 'Panda curious has amber question mark accent');

  // proud: hands/paws on hips
  assert(Mascot.hero(100, 'proud').includes('d="M 35 66 Q 18 72 32 82"'), 'Spidey proud has hands firmly planted on hips');
  assert(Mascot.cat(100, 'proud').includes('ellipse cx="32" cy="78" rx="6" ry="7"'), 'Cat proud has paws on hips');
  assert(Mascot.bunny(100, 'proud').includes('ellipse cx="32" cy="74" rx="6" ry="6"'), 'Bunny proud has paws on hips');
  assert(Mascot.panda(100, 'proud').includes('ellipse cx="30" cy="76" rx="7" ry="7"'), 'Panda proud has paws on hips');
});

// -------------------------------------------------------------
// 3. CSS Keyframe Animations & GPU Hardware Acceleration
// -------------------------------------------------------------
console.log('\n--- 3. CSS Keyframe Animations & 60fps Properties ---');

auditCheck('style.css defines genuine, distinct keyframes for all 4 new poses', () => {
  const kfCelebrate = extractBlock(styleCss, '@keyframes mascotCelebrateJump');
  const kfEureka = extractBlock(styleCss, '@keyframes mascotEureka');
  const kfCurious = extractBlock(styleCss, '@keyframes mascotCurious');
  const kfProud = extractBlock(styleCss, '@keyframes mascotProud');

  assert(kfCelebrate, 'mascotCelebrateJump keyframe must exist');
  assert(kfEureka, 'mascotEureka keyframe must exist');
  assert(kfCurious, 'mascotCurious keyframe must exist');
  assert(kfProud, 'mascotProud keyframe must exist');

  // Check that all 4 keyframe bodies are completely distinct
  const bodies = [kfCelebrate, kfEureka, kfCurious, kfProud].map(b => b.trim());
  const uniqueBodies = new Set(bodies);
  assert.strictEqual(uniqueBodies.size, 4, 'All 4 mascot keyframes must have unique animation definitions');

  // Check specific animation parameters
  assert(kfCelebrate.includes('-16px'), 'CelebrateJump must perform high 16px leap');
  assert(kfCelebrate.includes('scale(0.92, 1.08)'), 'CelebrateJump must perform squash/stretch');
  assert(kfCurious.includes('rotate(-5deg)'), 'Curious keyframe must tilt head by -5deg');
  assert(kfProud.includes('scale(1.04, 1.02)'), 'Proud keyframe must puff chest scale(1.04, 1.02)');
});

auditCheck('style.css binds all 3 mascot selectors with will-change and transform-origin', () => {
  assert(styleCss.includes('.spidey-mascot.celebrate_jump'), 'Must select .spidey-mascot.celebrate_jump');
  assert(styleCss.includes('.spideybot.celebrate_jump'), 'Must select .spideybot.celebrate_jump');
  assert(styleCss.includes('.mascot-companion.celebrate_jump'), 'Must select .mascot-companion.celebrate_jump');

  assert(styleCss.includes('.spidey-mascot.eureka'), 'Must select .spidey-mascot.eureka');
  assert(styleCss.includes('.spidey-mascot.curious'), 'Must select .spidey-mascot.curious');
  assert(styleCss.includes('.spidey-mascot.proud'), 'Must select .spidey-mascot.proud');

  assert(styleCss.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Must use spring bounce bezier for jump');
  assert(styleCss.includes('will-change: transform'), 'Must declare will-change: transform for GPU rendering');
});

// -------------------------------------------------------------
// 4. Invariants, Contract Safety & Backward Compatibility
// -------------------------------------------------------------
console.log('\n--- 4. Invariants, Contracts & Backward Compatibility ---');

auditCheck('Mascot.squad strictly retains exactly 5 canonical elements in original order', () => {
  assert(Array.isArray(Mascot.squad), 'squad must be an array');
  assert.strictEqual(Mascot.squad.length, 5, 'squad.length must strictly equal 5');
  const ids = Mascot.squad.map(s => s.id);
  assert.deepStrictEqual(ids, ['spidey', 'cat', 'bunny', 'panda', 'bot']);
});

auditCheck('Mascot.costumes catalog provides clean decoupled metadata', () => {
  assert(Array.isArray(Mascot.costumes), 'Mascot.costumes must be an array');
  assert.strictEqual(Mascot.costumes.length, 4, 'Mascot.costumes must contain 4 entries');
  const costumeIds = Mascot.costumes.map(c => c.id);
  assert.deepStrictEqual(costumeIds, ['detective', 'explorer', 'scientist', 'whimsical']);
});

auditCheck('Mascot.forWorld handles World 5 while preserving Worlds 1-4 intact', () => {
  assert(Mascot.forWorld('puzzle').includes('costume-detective'), 'World 5 defaults to Detective Spidey');
  assert(Mascot.forWorld('tekateki').includes('costume-detective'), 'World 5 alias tekateki defaults to Detective Spidey');
  assert(Mascot.forWorld('teka-teki').includes('costume-detective'), 'World 5 alias teka-teki defaults to Detective Spidey');
  assert(Mascot.forWorld('puzzle', 90, 'idle', 'explorer').includes('costume-explorer'), 'World 5 with explorer costume returns Explorer Bunny');

  // Worlds 1-4
  assert(Mascot.forWorld('hewan').includes('mascot-companion cat'), 'World 1 is Cat');
  assert(Mascot.forWorld('angka').includes('mascot-companion panda'), 'World 2 is Panda');
  assert(Mascot.forWorld('spidey').includes('spidey-mascot'), 'World 3 is Spidey Hero');
  assert(Mascot.forWorld('koding').includes('spideybot'), 'World 4 is Spideybot');
});

auditCheck('Mascot.randomCelebration produces varied celebration poses under sampling', () => {
  const celebrationPoses = ['cheer', 'happy', 'celebrate_jump', 'eureka'];
  const counts = { cheer: 0, happy: 0, celebrate_jump: 0, eureka: 0 };
  
  for (let i = 0; i < 200; i++) {
    const svg = Mascot.randomCelebration('hero', 100, 'detective');
    for (const pose of celebrationPoses) {
      if (svg.includes(` ${pose}`)) {
        counts[pose]++;
      }
    }
  }

  for (const pose of celebrationPoses) {
    assert(counts[pose] > 10, `randomCelebration must sample pose ${pose} (got ${counts[pose]}/200)`);
  }
});

// -------------------------------------------------------------
// 5. Anti-Cheating & Integrity Forensics
// -------------------------------------------------------------
console.log('\n--- 5. Anti-Cheating & Integrity Forensics ---');

auditCheck('No hardcoded test bypasses or environment spoofing in mascot.js or style.css', () => {
  const forbiddenPatterns = [
    /process\.env/i,
    /NODE_ENV/i,
    /__test__/i,
    /isTest/i,
    /mock/i,
    /bypass/i,
    /fake/i,
    /return true/i
  ];

  for (const pat of forbiddenPatterns) {
    assert(!pat.test(mascotJs), `mascot.js must not contain forbidden pattern: ${pat}`);
  }
});

auditCheck('Zero empty strings, placeholder texts, or dummy stubs in mascot.js generator methods', () => {
  const dummyPatterns = [
    /TODO/i,
    /FIXME/i,
    /dummy/i,
    /placeholder/i,
    /lorem ipsum/i,
    /return\s*""\s*;/
  ];

  for (const pat of dummyPatterns) {
    assert(!pat.test(mascotJs), `mascot.js must not contain dummy placeholder pattern: ${pat}`);
  }
});

console.log('\n============================================================');
console.log(`🏁 FORENSIC AUDIT COMPLETE: ${passCount} PASSED | ${failCount} FAILED`);
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
}
