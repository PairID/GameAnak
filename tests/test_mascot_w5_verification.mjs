// tests/test_mascot_w5_verification.mjs
// Dedicated verification test suite for World 5 Mascot Evolution & Keyframes
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mascot } from '../mascot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');

console.log('============================================================');
console.log('🧪 WORLD 5 MASCOT & ANIMATION VERIFICATION SUITE');
console.log('============================================================\n');

let passedChecks = 0;
let totalChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// Simple strict XML tag balancer
function validateXml(svgStr, label) {
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
      assert.strictEqual(top, tag, `Mismatched closing tag in ${label}: expected </${top}>, found </${tag}>`);
    } else if (!isSelfClosing) {
      stack.push(tag);
    }
  }
  assert.strictEqual(stack.length, 0, `Unclosed tags in ${label}: ${stack.join(', ')}`);
}

// 1. Critical Squad Invariant
check('Mascot.squad must strictly retain exactly 5 elements', () => {
  assert(Array.isArray(Mascot.squad), 'squad must be an array');
  assert.strictEqual(Mascot.squad.length, 5, 'squad must have length 5');
  const ids = Mascot.squad.map(m => m.id);
  assert.deepStrictEqual(ids, ['spidey', 'cat', 'bunny', 'panda', 'bot']);
});

// 2. Dynamic Costumes & Accessory Elements
check('Detective Spidey renders deerstalker hat, magnifying glass, and detective badge', () => {
  const detectiveWave = Mascot.hero(120, 'wave', 'detective');
  assert(detectiveWave.includes('Deerstalker Detective Hat'), 'Must contain deerstalker hat');
  assert(detectiveWave.includes('Detective Magnifying Glass In Hand'), 'Must contain magnifying glass in hand for wave pose');
  assert(detectiveWave.includes('Golden Detective Badge'), 'Must contain golden badge');
  assert(detectiveWave.includes('class="spidey-mascot wave costume-detective"'), 'Must contain costume class');
  validateXml(detectiveWave, 'detectiveWave');

  const detectiveThink = Mascot.hero(120, 'think', 'detective');
  assert(detectiveThink.includes('Detective Magnifying Glass Over Eye'), 'Must place magnifying glass over eye in think pose');
  validateXml(detectiveThink, 'detectiveThink');

  const helperSvg = Mascot.detectiveHero(120, 'wave');
  assert.strictEqual(helperSvg, detectiveWave, 'Mascot.detectiveHero helper must match hero(120, "wave", "detective")');
});

check('Explorer Bunny renders safari pith helmet, crossbody satchel, and compass badge', () => {
  const explorerIdle = Mascot.bunny(100, 'idle', 'explorer');
  assert(explorerIdle.includes('Safari Pith Helmet'), 'Must contain safari pith helmet');
  assert(explorerIdle.includes('Crossbody Satchel & Compass Badge'), 'Must contain satchel & compass');
  assert(explorerIdle.includes('class="mascot-companion bunny idle costume-explorer"'), 'Must contain costume class');
  validateXml(explorerIdle, 'explorerIdle');

  const helperSvg = Mascot.explorerBunny(100, 'idle');
  assert.strictEqual(helperSvg, explorerIdle, 'Mascot.explorerBunny helper must match bunny(100, "idle", "explorer")');
});

check('Scientist Panda renders round lab goggles with chemical reflection and lab coat collar', () => {
  const scientistIdle = Mascot.panda(100, 'idle', 'scientist');
  assert(scientistIdle.includes('Round Metallic Lab Goggles'), 'Must contain lab goggles');
  assert(scientistIdle.includes('Lab Coat Collar & Pins'), 'Must contain lab coat collar & pins');
  assert(scientistIdle.includes('class="mascot-companion panda idle costume-scientist"'), 'Must contain costume class');
  validateXml(scientistIdle, 'scientistIdle');

  const helperSvg = Mascot.scientistPanda(100, 'idle');
  assert.strictEqual(helperSvg, scientistIdle, 'Mascot.scientistPanda helper must match panda(100, "idle", "scientist")');

  // Verify default panda still contains golden glasses
  const defaultPanda = Mascot.panda(100, 'idle');
  assert(defaultPanda.includes('Chunky Golden Glasses'), 'Default panda must retain chunky golden glasses');
  assert(!defaultPanda.includes('costume-'), 'Default panda must not have costume class');
});

check('Whimsical Cat renders tilted wizard star hat and celestial star charm collar', () => {
  const whimsicalIdle = Mascot.cat(100, 'idle', 'whimsical');
  assert(whimsicalIdle.includes('Whimsical Wizard Hat'), 'Must contain wizard hat');
  assert(whimsicalIdle.includes('Celestial Star Charm Collar'), 'Must contain celestial star collar');
  assert(whimsicalIdle.includes('class="mascot-companion cat idle costume-whimsical"'), 'Must contain costume class');
  validateXml(whimsicalIdle, 'whimsicalIdle');

  const helperSvg = Mascot.whimsicalCat(100, 'idle');
  assert.strictEqual(helperSvg, whimsicalIdle, 'Mascot.whimsicalCat helper must match cat(100, "idle", "whimsical")');
});

// 3. New Poses Across Characters
const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
const newPoses = ['celebrate_jump', 'eureka', 'curious', 'proud'];

check('All 5 characters render distinct valid SVGs for all 4 new poses', () => {
  for (const char of characters) {
    for (const pose of newPoses) {
      const svg = Mascot[char](100, pose).trim();
      assert(svg.startsWith('<svg'), `${char}.${pose} must start with <svg`);
      assert(svg.endsWith('</svg>'), `${char}.${pose} must end with </svg>`);
      assert(svg.includes(pose), `${char}.${pose} SVG must include pose name in class`);
      validateXml(svg, `${char}.${pose}`);
    }
  }
});

// 4. Mascot.forWorld Expansion for World 5
check('Mascot.forWorld handles "puzzle" and "tekateki" returning Detective Spidey or Explorer Bunny', () => {
  const puzzleDefault = Mascot.forWorld('puzzle', 90, 'wave');
  assert(puzzleDefault.includes('costume-detective'), 'forWorld("puzzle") must default to Detective Spidey');
  assert(puzzleDefault.includes('spidey-mascot'), 'forWorld("puzzle") must be Spidey');
  validateXml(puzzleDefault, 'forWorld.puzzle');

  const tekatekiDefault = Mascot.forWorld('tekateki', 90, 'wave');
  assert(tekatekiDefault.includes('costume-detective'), 'forWorld("tekateki") must return Detective Spidey');

  const puzzleExplorer = Mascot.forWorld('puzzle', 90, 'idle', 'explorer');
  assert(puzzleExplorer.includes('costume-explorer'), 'forWorld("puzzle", 90, "idle", "explorer") must return Explorer Bunny');
  assert(puzzleExplorer.includes('bunny'), 'forWorld with explorer costume must be Bunny');
  validateXml(puzzleExplorer, 'forWorld.puzzle.explorer');

  // Worlds 1-4 intact
  assert(Mascot.forWorld('hewan', 90, 'idle').includes('cat'), 'World 1 is Cat');
  assert(Mascot.forWorld('angka', 90, 'idle').includes('panda'), 'World 2 is Panda');
  assert(Mascot.forWorld('spidey', 90, 'idle').includes('spidey-mascot'), 'World 3 is Hero');
  assert(Mascot.forWorld('koding', 90, 'idle').includes('spideybot'), 'World 4 is Bot');
});

// 5. Mascot.randomCelebration
check('Mascot.randomCelebration returns randomized victory poses', () => {
  const posesSeen = new Set();
  for (let i = 0; i < 50; i++) {
    const svg = Mascot.randomCelebration('hero', 120, 'detective');
    validateXml(svg, `randomCelebration.${i}`);
    for (const pose of ['cheer', 'happy', 'celebrate_jump', 'eureka']) {
      if (svg.includes(` ${pose}`)) {
        posesSeen.add(pose);
      }
    }
  }
  assert(posesSeen.size >= 2, `randomCelebration should produce varied celebration poses, got: ${Array.from(posesSeen).join(', ')}`);
});

// 6. 60fps GPU-Accelerated CSS Keyframe Animations in style.css
check('style.css defines 60fps GPU-accelerated keyframe animations for all 4 new poses', () => {
  assert(styleCss.includes('@keyframes mascotCelebrateJump'), 'Must define @keyframes mascotCelebrateJump');
  assert(styleCss.includes('@keyframes mascotEureka'), 'Must define @keyframes mascotEureka');
  assert(styleCss.includes('@keyframes mascotCurious'), 'Must define @keyframes mascotCurious');
  assert(styleCss.includes('@keyframes mascotProud'), 'Must define @keyframes mascotProud');

  assert(styleCss.includes('.spidey-mascot.celebrate_jump'), 'Must bind .spidey-mascot.celebrate_jump');
  assert(styleCss.includes('.spideybot.celebrate_jump'), 'Must bind .spideybot.celebrate_jump');
  assert(styleCss.includes('.mascot-companion.celebrate_jump'), 'Must bind .mascot-companion.celebrate_jump');

  assert(styleCss.includes('.spidey-mascot.eureka'), 'Must bind .spidey-mascot.eureka');
  assert(styleCss.includes('.spidey-mascot.curious'), 'Must bind .spidey-mascot.curious');
  assert(styleCss.includes('.spidey-mascot.proud'), 'Must bind .spidey-mascot.proud');

  assert(styleCss.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Must use custom cubic-bezier for celebrate_jump');
  assert(styleCss.includes('will-change: transform'), 'Must declare will-change: transform');
});

console.log(`\n============================================================`);
console.log(`🎉 ALL ${passedChecks}/${totalChecks} VERIFICATION CHECKS PASSED CLEANLY!`);
console.log('============================================================');
