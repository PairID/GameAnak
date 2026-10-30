// tests/verify_m2.mjs - Independent verification test for Milestone 2 UI Shell
import fs from 'node:fs';
import assert from 'node:assert';

console.log('--- Verifying Milestone 2 UI Shell & Tactile Sticker Design ---');

// 1. Verify index.html
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('<!DOCTYPE html>'), 'index.html must be valid HTML5');
assert(html.includes('lang="id"'), 'index.html must specify lang="id"');
assert(html.includes('manifest.webmanifest'), 'index.html must link to manifest');
assert(html.includes('style.css'), 'index.html must link to style.css');
assert(html.includes('icons/favicon.svg'), 'index.html must link to favicon');

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
  assert(html.includes(`id="${id}"`), `index.html must contain element with id="${id}"`);
}
console.log(`✔ Verified all ${requiredIds.length} required DOM IDs exist in index.html`);

// 2. Verify style.css
const css = fs.readFileSync('style.css', 'utf8');
assert(css.includes('#FFF9F0'), 'Warm palette #FFF9F0 must exist');
assert(css.includes('#EF4444'), 'Spidey Red #EF4444 must exist');
assert(css.includes('#2563EB'), 'Web Blue #2563EB must exist');
assert(css.includes('#FBBF24'), 'Sun Yellow #FBBF24 must exist');
assert(css.includes('#10B981'), 'Forest Green #10B981 must exist');
assert(css.includes('#8B5CF6'), 'Purple Accent #8B5CF6 must exist');
assert(css.includes('gentleWobble'), 'Gentle wobble keyframe animation must exist');
assert(css.includes('touch-action: manipulation'), 'touch-action: manipulation must exist');
assert(css.includes('#traceCanvas'), 'traceCanvas must have styling');
assert(css.includes('touch-action: none'), 'traceCanvas must have touch-action: none');
assert(css.includes('user-select: none'), 'user-select: none must be defined');
assert(css.includes('64px'), 'Minimum touch target >=64px must be defined');
assert(css.includes('@media print'), '@media print rules must exist');
assert(css.includes('.memory-card'), 'Memory card 3D flip rules must exist');
assert(css.includes('preserve-3d'), 'preserve-3d for cards must exist');
console.log('✔ Verified all design tokens, animations, touch constraints & print rules in style.css');

// 3. Verify mascot.js
const { Mascot } = await import('../mascot.js');
assert.strictEqual(typeof Mascot.hero, 'function', 'Mascot.hero must be a function');
assert.strictEqual(typeof Mascot.robot, 'function', 'Mascot.robot must be a function');
assert.strictEqual(Mascot.bot, Mascot.robot, 'Mascot.bot alias must reference Mascot.robot');
assert(Mascot.hero(100, 'wave').includes('<svg'), 'hero wave produces SVG');
assert(Mascot.hero(100, 'happy').includes('<svg'), 'hero happy produces SVG');
assert(Mascot.hero(100, 'cheer').includes('<svg'), 'hero cheer produces SVG');
assert(Mascot.hero(100, 'think').includes('<svg'), 'hero think produces SVG');
assert(Mascot.hero(100, 'encourage').includes('<svg'), 'hero encourage produces SVG');
assert(Mascot.robot(90, 'cheer').includes('<svg'), 'robot cheer produces SVG');
console.log('✔ Verified Mascot system with poses & bot alias');

// 4. Verify icons
const iconFiles = ['icons/favicon.svg', 'icons/icon-192.svg', 'icons/icon-512.svg', 'icons/icon-maskable.svg'];
for (const f of iconFiles) {
  assert(fs.existsSync(f), `Icon ${f} must exist`);
  const content = fs.readFileSync(f, 'utf8');
  assert(content.includes('<svg') && content.includes('</svg>'), `Icon ${f} must contain valid SVG`);
}
console.log(`✔ Verified all ${iconFiles.length} PWA/favicon vector icons exist and are valid SVGs`);

console.log('--- ALL M2 VERIFICATION CHECKS PASSED PERFECTLY ---');
