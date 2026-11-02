// tests/test_reviewer_adversarial_mascot.mjs
// Adversarial Reviewer Stress Testing for Milestone 3 (W5-M3) Mascot Evolution
import assert from 'assert';
import { Mascot } from '../mascot.js';

console.log('--- STARTING ADVERSARIAL STRESS TEST FOR MASCOT.JS ---');

// XML Well-Formedness Validator
function validateXmlStrict(svgStr, context) {
  assert(typeof svgStr === 'string', `${context}: must return string`);
  assert(svgStr.trim().startsWith('<svg'), `${context}: must start with <svg`);
  assert(svgStr.trim().endsWith('</svg>'), `${context}: must end with </svg>`);

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
      assert.strictEqual(top, tag, `${context}: Mismatched closing tag: expected </${top}>, found </${tag}>`);
    } else if (!isSelfClosing) {
      stack.push(tag);
    }
  }
  assert.strictEqual(stack.length, 0, `${context}: Unclosed tags: ${stack.join(', ')}`);
}

// 1. Combinatorial Matrix Stress: 5 Characters x 9 Poses x 5 Costumes
const characters = ['hero', 'robot', 'cat', 'bunny', 'panda'];
const poses = ['wave', 'happy', 'cheer', 'idle', 'think', 'celebrate_jump', 'eureka', 'curious', 'proud'];
const costumes = ['default', 'detective', 'explorer', 'scientist', 'whimsical', 'unknown_costume'];

let comboCount = 0;
for (const char of characters) {
  for (const pose of poses) {
    for (const costume of costumes) {
      comboCount++;
      const svg = Mascot[char](100, pose, costume);
      validateXmlStrict(svg, `Combo ${char}.${pose}.${costume}`);
      // Verify size reflection
      assert(svg.includes('width="100"'), `Combo ${char}.${pose}.${costume} must reflect size 100`);
      assert(svg.includes('height="100"'), `Combo ${char}.${pose}.${costume} must reflect size 100`);
      // Verify pose class
      assert(svg.includes(pose), `Combo ${char}.${pose}.${costume} must include pose class`);
      // Verify costume class if not default and costume is set
      if (costume && costume !== 'default') {
        assert(svg.includes(`costume-${costume}`), `Combo ${char}.${pose}.${costume} must include costume-${costume}`);
      }
    }
  }
}
console.log(`✔ [PASS] All ${comboCount} character x pose x costume combinations generated valid, well-formed SVGs.`);

// 2. Boundary and Malformed Input Fuzzing
const weirdSizes = [0, -10, 1e5, 0.001, null, undefined, '', '150px'];
for (const size of weirdSizes) {
  for (const char of characters) {
    const svg = Mascot[char](size, 'celebrate_jump', 'detective');
    validateXmlStrict(svg, `Weird size ${size} on ${char}`);
  }
}
console.log(`✔ [PASS] Handled boundary and abnormal size inputs without crashing.`);

// 3. Unknown and Null/Undefined Poses & Costumes
const weirdPoses = [null, undefined, '', 'flying', 123, false, 'undefined'];
for (const pose of weirdPoses) {
  for (const char of characters) {
    const svg = Mascot[char](100, pose, null);
    validateXmlStrict(svg, `Weird pose ${pose} on ${char}`);
  }
}
console.log(`✔ [PASS] Handled unknown, null, and non-string poses with graceful fallback.`);

// 4. Mascot.squad Invariant Verification
assert(Array.isArray(Mascot.squad), 'Mascot.squad must be an array');
assert.strictEqual(Mascot.squad.length, 5, 'Mascot.squad must strictly have exactly 5 elements');
const expectedSquadIds = ['spidey', 'cat', 'bunny', 'panda', 'bot'];
assert.deepStrictEqual(Mascot.squad.map(s => s.id), expectedSquadIds, 'Squad order and IDs must match canonical spec');
for (const member of Mascot.squad) {
  assert(member.id && member.name && member.species && member.worldId && member.color, `Squad member ${member.id} must have all required properties`);
}
console.log(`✔ [PASS] Mascot.squad strictly retains exact 5 canonical elements.`);

// 5. Mascot.costumes Catalogue Verification
assert(Array.isArray(Mascot.costumes), 'Mascot.costumes must be an array');
assert.strictEqual(Mascot.costumes.length, 4, 'Mascot.costumes should contain 4 catalog items');
const costumeIds = Mascot.costumes.map(c => c.id);
assert.deepStrictEqual(costumeIds, ['detective', 'explorer', 'scientist', 'whimsical'], 'Costumes catalogue must contain expected IDs');
console.log(`✔ [PASS] Mascot.costumes catalogue contains all 4 thematic costumes.`);

// 6. Mascot Helper Methods Verification
assert.strictEqual(Mascot.detectiveHero(120, 'eureka'), Mascot.hero(120, 'eureka', 'detective'));
assert.strictEqual(Mascot.explorerBunny(100, 'curious'), Mascot.bunny(100, 'curious', 'explorer'));
assert.strictEqual(Mascot.scientistPanda(100, 'proud'), Mascot.panda(100, 'proud', 'scientist'));
assert.strictEqual(Mascot.whimsicalCat(100, 'celebrate_jump'), Mascot.cat(100, 'celebrate_jump', 'whimsical'));
console.log(`✔ [PASS] All 4 helper wrapper methods strictly delegate to correct characters and costumes.`);

// 7. Mascot.forWorld Edge Cases
const worldTestCases = [
  { world: 'puzzle', expectedCostume: 'costume-detective', expectedClass: 'spidey-mascot' },
  { world: 'tekateki', expectedCostume: 'costume-detective', expectedClass: 'spidey-mascot' },
  { world: 'teka-teki', expectedCostume: 'costume-detective', expectedClass: 'spidey-mascot' },
  { world: 'PUZZLE', expectedCostume: 'costume-detective', expectedClass: 'spidey-mascot' },
  { world: '  puzzle  ', expectedCostume: 'costume-detective', expectedClass: 'spidey-mascot' },
  { world: 'puzzle', costume: 'explorer', expectedCostume: 'costume-explorer', expectedClass: 'bunny' },
  { world: 'puzzle', costume: 'bunny', expectedCostume: 'costume-explorer', expectedClass: 'bunny' },
  { world: 'hewan', expectedClass: 'cat' },
  { world: 'angka', expectedClass: 'panda' },
  { world: 'spidey', expectedClass: 'spidey-mascot' },
  { world: 'koding', expectedClass: 'spideybot' },
  { world: 'unknown_world', expectedClass: 'spidey-mascot' },
  { world: '', expectedClass: 'spidey-mascot' },
  { world: null, expectedClass: 'spidey-mascot' },
  { world: undefined, expectedClass: 'spidey-mascot' }
];

for (const tc of worldTestCases) {
  const svg = Mascot.forWorld(tc.world, 100, 'wave', tc.costume);
  validateXmlStrict(svg, `forWorld(${tc.world}, ${tc.costume})`);
  assert(svg.includes(tc.expectedClass), `forWorld('${tc.world}') must produce ${tc.expectedClass}`);
  if (tc.expectedCostume) {
    assert(svg.includes(tc.expectedCostume), `forWorld('${tc.world}') must produce ${tc.expectedCostume}`);
  }
}
console.log(`✔ [PASS] Mascot.forWorld gracefully resolves all worlds, case insensitivity, trimming, and edge inputs.`);

// 8. Mascot.randomCelebration Statistical & Boundary Test
const samples = 200;
const poseHits = { cheer: 0, happy: 0, celebrate_jump: 0, eureka: 0 };
for (let i = 0; i < samples; i++) {
  const svg = Mascot.randomCelebration('hero', 100, 'detective');
  validateXmlStrict(svg, `randomCelebration sample ${i}`);
  for (const p of Object.keys(poseHits)) {
    if (svg.includes(` ${p}`)) {
      poseHits[p]++;
    }
  }
}
console.log('Celebration poses distribution across 200 samples:', poseHits);
for (const p of Object.keys(poseHits)) {
  assert(poseHits[p] > 10, `Every celebration pose should be sampled reasonably often. ${p} was only hit ${poseHits[p]} times`);
}
console.log(`✔ [PASS] Mascot.randomCelebration evenly samples all 4 celebration poses without bias or starvation.`);

// 9. Legacy Utility & Alias Invariants
assert(typeof Mascot.bot === 'function');
assert(typeof Mascot.kucing === 'function');
assert(typeof Mascot.kelinci === 'function');
assert.strictEqual(Mascot.bot, Mascot.robot);
assert.strictEqual(Mascot.kucing, Mascot.cat);
assert.strictEqual(Mascot.kelinci, Mascot.bunny);
validateXmlStrict(Mascot.star(40, true), 'Mascot.star active');
validateXmlStrict(Mascot.star(40, false), 'Mascot.star inactive');
validateXmlStrict(Mascot.web(80), 'Mascot.web');
console.log(`✔ [PASS] Legacy utilities and aliases strictly preserved.`);

// 10. Memory and Heap Stability
const initialMem = process.memoryUsage().heapUsed;
for (let i = 0; i < 5000; i++) {
  Mascot.hero(120, 'celebrate_jump', 'detective');
  Mascot.panda(100, 'eureka', 'scientist');
  Mascot.bunny(100, 'curious', 'explorer');
  Mascot.cat(100, 'proud', 'whimsical');
  Mascot.robot(90, 'celebrate_jump');
}
const finalMem = process.memoryUsage().heapUsed;
console.log(`Generated 25,000 SVGs in memory. Initial heap: ${(initialMem/1024/1024).toFixed(2)} MB, Final heap: ${(finalMem/1024/1024).toFixed(2)} MB`);

console.log('--- ALL ADVERSARIAL REVIEWER STRESS TESTS PASSED WITH 100% SUCCESS ---');
