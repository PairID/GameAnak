// selfcheck.mjs - Standalone Automated Verification Runner
// Comprehensive schema, engine, audio, mascot, and PWA integrity checker
// Zero external npm dependencies, executable via `node selfcheck.mjs`

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TEST HARNESS
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('============================================================');
console.log('🕷️ PETUALANGAN SPIDEY CILIK — SELF-CHECK VERIFICATION RUNNER');
console.log('Zero-Dependency Standalone Architectural & Integrity Suite');
console.log('============================================================\n');

// ============================================================================
// 1. MODULE IMPORTS & INTERFACE CONTRACTS
// ============================================================================
console.log('[Suite 1: Module Imports & Interface Contracts]');

let levelsModule, enginesModule, audioModule, mascotModule;

await test('1.1 Import levels.js and verify exports', async () => {
  levelsModule = await import('./levels.js');
  assert(levelsModule.LEVELS && Array.isArray(levelsModule.LEVELS), 'levels.js must export LEVELS array');
  assert(levelsModule.WORLDS && Array.isArray(levelsModule.WORLDS), 'levels.js must export WORLDS array');
});

await test('1.2 Import engines.js and verify dispatch API', async () => {
  enginesModule = await import('./engines.js');
  const { Engines } = enginesModule;
  assert(Engines && typeof Engines === 'object', 'engines.js must export Engines object');
  assert(typeof Engines.render === 'function', 'Engines.render must be a function');
  assert(typeof Engines.renderHubungkan === 'function', 'Engines.renderHubungkan must be a function');
  assert(typeof Engines.renderLabirin === 'function', 'Engines.renderLabirin must be a function');
  assert(typeof Engines.renderPilih === 'function', 'Engines.renderPilih must be a function');
  assert(typeof Engines.renderHubungkanTitik === 'function', 'Engines.renderHubungkanTitik must be a function');
  assert(typeof Engines.renderTebalkan === 'function', 'Engines.renderTebalkan must be a function');
  assert(typeof Engines.renderMewarnai === 'function', 'Engines.renderMewarnai must be a function');
  assert(typeof Engines.renderUrutkan === 'function', 'Engines.renderUrutkan must be a function');
  assert(typeof Engines.renderKodingPanah === 'function', 'Engines.renderKodingPanah must be a function');
  assert(typeof Engines.renderMemori === 'function', 'Engines.renderMemori must be a function');
  assert(typeof Engines.renderTitik === 'function', 'Engines.renderTitik alias must exist');
  assert(typeof Engines.renderPanah === 'function', 'Engines.renderPanah alias must exist');
});

await test('1.3 Import audio.js and verify SoundSystem contract', async () => {
  audioModule = await import('./audio.js');
  const { sound } = audioModule;
  assert(sound && typeof sound === 'object', 'audio.js must export sound instance');
  assert(typeof sound.init === 'function', 'sound.init must be a function');
  assert(typeof sound.speak === 'function', 'sound.speak must be a function');
  assert(typeof sound.stopSpeech === 'function', 'sound.stopSpeech must be a function');
  assert(typeof sound.playPop === 'function', 'sound.playPop must be a function');
  assert(typeof sound.playClick === 'function', 'sound.playClick must be a function');
  assert(typeof sound.playCorrect === 'function', 'sound.playCorrect must be a function');
  assert(typeof sound.playStar === 'function', 'sound.playStar must be a function');
  assert(typeof sound.playFanfare === 'function', 'sound.playFanfare must be a function');
  assert(typeof sound.playGentleTryAgain === 'function', 'sound.playGentleTryAgain must be a function');
  assert(typeof sound.playRobotStep === 'function', 'sound.playRobotStep must be a function');
});

await test('1.4 Import mascot.js and verify Mascot SVG generators', async () => {
  mascotModule = await import('./mascot.js');
  const { Mascot } = mascotModule;
  assert(Mascot && typeof Mascot === 'object', 'mascot.js must export Mascot object');
  assert(typeof Mascot.hero === 'function', 'Mascot.hero must be a function');
  assert(typeof Mascot.robot === 'function', 'Mascot.robot must be a function');
  assert(typeof Mascot.bot === 'function', 'Mascot.bot must be a function');
  assert(typeof Mascot.star === 'function', 'Mascot.star must be a function');
  assert(typeof Mascot.web === 'function', 'Mascot.web must be a function');
});

// ============================================================================
// 2. LEVEL QUANTITY & 4-WORLD DISTRIBUTION
// ============================================================================
console.log('\n[Suite 2: Level Quantity & 4-World Distribution]');

await test('2.1 Level Count: LEVELS.length >= 70', () => {
  const { LEVELS } = levelsModule;
  assert(LEVELS.length >= 70, `Expected at least 70 levels, found ${LEVELS.length}`);
  console.log(`      Found ${LEVELS.length} verified educational levels.`);
});

await test('2.2 4 Worlds Distribution', () => {
  const { LEVELS, WORLDS } = levelsModule;
  assert.strictEqual(WORLDS.length, 4, 'Must have exactly 4 worlds');
  const worldIds = WORLDS.map(w => w.id);
  assert(worldIds.includes('hewan'), 'Hutan Satwa (hewan) world missing');
  assert(worldIds.includes('angka'), 'Kota Angka (angka) world missing');
  assert(worldIds.includes('spidey'), 'Markas Pahlawan (spidey) world missing');
  assert(worldIds.includes('koding'), 'Lab Robot (koding) world missing');

  const distribution = {};
  LEVELS.forEach(lvl => {
    assert(worldIds.includes(lvl.worldId), `Level ${lvl.id} has invalid worldId: ${lvl.worldId}`);
    distribution[lvl.worldId] = (distribution[lvl.worldId] || 0) + 1;
  });

  assert(distribution.hewan > 0, 'World hewan has no levels');
  assert(distribution.angka > 0, 'World angka has no levels');
  assert(distribution.spidey > 0, 'World spidey has no levels');
  assert(distribution.koding > 0, 'World koding has no levels');

  console.log(`      Distribution: hewan=${distribution.hewan}, angka=${distribution.angka}, spidey=${distribution.spidey}, koding=${distribution.koding}`);
});

await test('2.3 Universal Level Object Contract', () => {
  const { LEVELS } = levelsModule;
  const validEngineTypes = new Set([
    'hubungkan', 'labirin', 'pilih', 'titik', 'tebalkan',
    'mewarnai', 'urutkan', 'panah', 'memori'
  ]);

  const ids = new Set();
  LEVELS.forEach(lvl => {
    assert(lvl.id, `Level missing id: ${JSON.stringify(lvl)}`);
    assert(!ids.has(lvl.id), `Duplicate level id: ${lvl.id}`);
    ids.add(lvl.id);

    assert(lvl.title && typeof lvl.title === 'string', `Level ${lvl.id} missing title`);
    assert(lvl.type && validEngineTypes.has(lvl.type), `Level ${lvl.id} has invalid type: ${lvl.type}`);
    assert(lvl.prompt && typeof lvl.prompt === 'string', `Level ${lvl.id} missing prompt`);
  });
});

// ============================================================================
// 3. SCHEMA INTEGRITY ACROSS 9 GAME ENGINES
// ============================================================================
console.log('\n[Suite 3: Schema Integrity Across All 9 Game Engines]');

await test('3.1 Engine 1 (hubungkan) Schema & Validity', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'hubungkan');
  assert(levels.length > 0, 'Must have hubungkan levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.pairs) && lvl.pairs.length > 0, `Level ${lvl.id} pairs must be non-empty array`);
    lvl.pairs.forEach((p, idx) => {
      assert(typeof p.left === 'string' && p.left.trim().length > 0, `Level ${lvl.id} pair ${idx} left is invalid`);
      assert(typeof p.right === 'string' && p.right.trim().length > 0, `Level ${lvl.id} pair ${idx} right is invalid`);
    });
  });
});

await test('3.2 Engine 2 (labirin) Schema, Bounds & BFS Solvability', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'labirin');
  assert(levels.length > 0, 'Must have labirin levels');
  levels.forEach(lvl => {
    const size = lvl.gridSize || 5;
    assert(size >= 4, `Level ${lvl.id} gridSize must be >= 4, got ${size}`);
    assert(Array.isArray(lvl.walls), `Level ${lvl.id} walls must be an array`);

    const wallsSet = new Set(lvl.walls);
    const startKey = '0,0';
    const goalKey = `${size - 1},${size - 1}`;

    assert(!wallsSet.has(startKey), `Level ${lvl.id} start position (0,0) is blocked by wall`);
    assert(!wallsSet.has(goalKey), `Level ${lvl.id} goal position (${goalKey}) is blocked by wall`);

    // Verify BFS solvability
    const queue = [{ r: 0, c: 0 }];
    const visited = new Set([startKey]);
    let reached = false;

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.r === size - 1 && cur.c === size - 1) {
        reached = true;
        break;
      }
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const key = `${nr},${nc}`;
          if (!wallsSet.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ r: nr, c: nc });
          }
        }
      }
    }

    assert(reached, `Level ${lvl.id} labirin is NOT solvable from (0,0) to (${goalKey})`);
  });
});

await test('3.3 Engine 3 (pilih) Schema & Option Soundness', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'pilih');
  assert(levels.length > 0, 'Must have pilih levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.items) && lvl.items.length > 0, `Level ${lvl.id} items must be non-empty array`);
    lvl.items.forEach((item, idx) => {
      assert(Array.isArray(item.options) && item.options.length >= 1, `Level ${lvl.id} item ${idx} options empty`);
      const hasAnswerIndex = item.answerIndex !== undefined && item.answerIndex >= 0 && item.answerIndex < item.options.length;
      const hasAnswer = item.answer !== undefined;
      assert(hasAnswerIndex || hasAnswer, `Level ${lvl.id} item ${idx} has no valid answer or answerIndex`);
    });
  });
});

await test('3.4 Engine 4 (titik) Schema & Contiguous Sequence', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'titik');
  assert(levels.length > 0, 'Must have titik levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.dots) && lvl.dots.length >= 3, `Level ${lvl.id} dots must have >= 3 points`);
    assert(lvl.revealEmoji && typeof lvl.revealEmoji === 'string', `Level ${lvl.id} missing revealEmoji`);
    
    // Check 1..N contiguous numbering
    for (let i = 0; i < lvl.dots.length; i++) {
      const dot = lvl.dots[i];
      assert.strictEqual(dot.num, i + 1, `Level ${lvl.id} dot ${i} num is ${dot.num}, expected ${i + 1}`);
      assert(typeof dot.x === 'number' && dot.x >= 0 && dot.x <= 100, `Level ${lvl.id} dot ${i} x coordinate out of bounds`);
      assert(typeof dot.y === 'number' && dot.y >= 0 && dot.y <= 100, `Level ${lvl.id} dot ${i} y coordinate out of bounds`);
    }
  });
});

await test('3.5 Engine 5 (tebalkan) Schema & Preset Paths', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'tebalkan');
  assert(levels.length > 0, 'Must have tebalkan levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.traceItems) && lvl.traceItems.length > 0, `Level ${lvl.id} traceItems must be non-empty`);
    lvl.traceItems.forEach((item, idx) => {
      assert(item.label && typeof item.label === 'string', `Level ${lvl.id} traceItem ${idx} missing label`);
      assert(item.pathType && typeof item.pathType === 'string', `Level ${lvl.id} traceItem ${idx} missing pathType`);
    });
  });
});

await test('3.6 Engine 6 (mewarnai) Schema, Palette & Shapes', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'mewarnai');
  assert(levels.length > 0, 'Must have mewarnai levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.palette) && lvl.palette.length >= 2, `Level ${lvl.id} palette must have >= 2 colors`);
    assert(Array.isArray(lvl.shapes) && lvl.shapes.length > 0, `Level ${lvl.id} shapes must be non-empty array`);
    lvl.shapes.forEach((s, idx) => {
      assert(s.id, `Level ${lvl.id} shape ${idx} missing id`);
      assert(s.type, `Level ${lvl.id} shape ${idx} missing type`);
    });
  });
});

await test('3.7 Engine 7 (urutkan) Schema & Order Contiguity', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'urutkan');
  assert(levels.length > 0, 'Must have urutkan levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.items) && lvl.items.length >= 2, `Level ${lvl.id} items must have >= 2 elements`);
    const orders = lvl.items.map(it => it.step !== undefined ? it.step : it.size);
    const sorted = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      assert.strictEqual(sorted[i], i + 1, `Level ${lvl.id} expected contiguous order 1..${sorted.length}`);
    }
  });
});

await test('3.8 Engine 8 (panah) Schema, Grid & Program Simulation', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'panah');
  assert(levels.length > 0, 'Must have panah levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.grid) && lvl.grid.length > 0, `Level ${lvl.id} grid must be 2D array`);
    assert(Array.isArray(lvl.correctProgram) && lvl.correctProgram.length > 0, `Level ${lvl.id} correctProgram non-empty`);

    // Locate Robot 'R' and Goal 'G'
    let robotPos = null;
    let goalPos = null;
    for (let r = 0; r < lvl.grid.length; r++) {
      for (let c = 0; c < lvl.grid[r].length; c++) {
        if (lvl.grid[r][c] === 'R') robotPos = { r, c };
        if (lvl.grid[r][c] === 'G') goalPos = { r, c };
      }
    }
    assert(robotPos, `Level ${lvl.id} grid missing Robot ('R') start position`);
    assert(goalPos, `Level ${lvl.id} grid missing Goal ('G') target position`);

    // Simulate correctProgram
    let cur = { ...robotPos };
    for (const cmd of lvl.correctProgram) {
      if (cmd === '➡️') cur.c++;
      else if (cmd === '⬅️') cur.c--;
      else if (cmd === '⬇️') cur.r++;
      else if (cmd === '⬆️') cur.r--;
      else assert.fail(`Unknown program arrow: ${cmd}`);

      assert(cur.r >= 0 && cur.r < lvl.grid.length && cur.c >= 0 && cur.c < lvl.grid[0].length,
        `Level ${lvl.id} program moves robot out of grid bounds`);
      assert(lvl.grid[cur.r][cur.c] !== 'X', `Level ${lvl.id} program hits obstacle 'X' at (${cur.r},${cur.c})`);
    }
    assert.strictEqual(cur.r, goalPos.r, `Level ${lvl.id} program did not reach goal row`);
    assert.strictEqual(cur.c, goalPos.c, `Level ${lvl.id} program did not reach goal col`);
  });
});

await test('3.9 Engine 9 (memori) Schema & Card Pairs', () => {
  const levels = levelsModule.LEVELS.filter(l => l.type === 'memori');
  assert(levels.length > 0, 'Must have memori levels');
  levels.forEach(lvl => {
    assert(Array.isArray(lvl.pairs) && lvl.pairs.length >= 2, `Level ${lvl.id} pairs must have >= 2 pairs`);
    lvl.pairs.forEach((p, idx) => {
      assert(p.id, `Level ${lvl.id} pair ${idx} missing id`);
      assert(p.emoji, `Level ${lvl.id} pair ${idx} missing emoji`);
    });
  });
});

// ============================================================================
// 4. AUDIO & SOUND SYSTEM HEADLESS SAFETY
// ============================================================================
console.log('\n[Suite 4: Audio & Sound System Headless Safety]');

await test('4.1 SoundSystem Headless Node.js Execution Without Error', () => {
  const { sound } = audioModule;
  assert.doesNotThrow(() => sound.init(), 'sound.init() threw in Node.js');
  assert.doesNotThrow(() => sound.playPop(), 'sound.playPop() threw in Node.js');
  assert.doesNotThrow(() => sound.playClick(), 'sound.playClick() threw in Node.js');
  assert.doesNotThrow(() => sound.playCorrect(), 'sound.playCorrect() threw in Node.js');
  assert.doesNotThrow(() => sound.playStar(), 'sound.playStar() threw in Node.js');
  assert.doesNotThrow(() => sound.playFanfare(), 'sound.playFanfare() threw in Node.js');
  assert.doesNotThrow(() => sound.playGentleTryAgain(), 'sound.playGentleTryAgain() threw in Node.js');
  assert.doesNotThrow(() => sound.playRobotStep(), 'sound.playRobotStep() threw in Node.js');
  assert.doesNotThrow(() => sound.speak('Tes suara pahlawan'), 'sound.speak() threw in Node.js');
  assert.doesNotThrow(() => sound.stopSpeech(), 'sound.stopSpeech() threw in Node.js');
});

await test('4.2 Zero External Audio Assets Required', () => {
  const audioCode = fs.readFileSync(path.join(__dirname, 'audio.js'), 'utf8');
  assert(!audioCode.includes('.mp3'), 'audio.js must not load external .mp3 files');
  assert(!audioCode.includes('.wav'), 'audio.js must not load external .wav files');
  assert(!audioCode.includes('.ogg'), 'audio.js must not load external .ogg files');
});

// ============================================================================
// 5. MASCOT SVG VECTOR ART GENERATOR INTEGRITY
// ============================================================================
console.log('\n[Suite 5: Mascot SVG Vector Art Generator Integrity]');

await test('5.1 Mascot.hero SVG Generator', () => {
  const { Mascot } = mascotModule;
  const svgWave = Mascot.hero(100, 'wave');
  const svgCheer = Mascot.hero(120, 'cheer');
  assert(svgWave.includes('<svg') && svgWave.includes('</svg>'), 'hero(wave) must return valid SVG markup');
  assert(svgCheer.includes('<svg') && svgCheer.includes('</svg>'), 'hero(cheer) must return valid SVG markup');
});

await test('5.2 Mascot.bot and Mascot.robot SVG Generators', () => {
  const { Mascot } = mascotModule;
  const svgBot = Mascot.bot(90, 'idle');
  const svgRobot = Mascot.robot(90, 'cheer');
  assert(svgBot.includes('<svg') && svgBot.includes('</svg>'), 'bot() must return valid SVG markup');
  assert(svgRobot.includes('<svg') && svgRobot.includes('</svg>'), 'robot() must return valid SVG markup');
});

await test('5.3 Mascot.star and Mascot.web SVG Generators', () => {
  const { Mascot } = mascotModule;
  const svgStarActive = Mascot.star(40, true);
  const svgStarInactive = Mascot.star(40, false);
  const svgWeb = Mascot.web(80);
  assert(svgStarActive.includes('<svg') && svgStarActive.includes('</svg>'), 'star(active) must return valid SVG markup');
  assert(svgStarInactive.includes('<svg') && svgStarInactive.includes('</svg>'), 'star(inactive) must return valid SVG markup');
  assert(svgWeb.includes('<svg') && svgWeb.includes('</svg>'), 'web() must return valid SVG markup');
});

// ============================================================================
// 6. PWA INFRASTRUCTURE (MANIFEST & SERVICE WORKER)
// ============================================================================
console.log('\n[Suite 6: PWA Infrastructure (Manifest & Service Worker)]');

await test('6.1 manifest.webmanifest exists and validates schema', () => {
  const manifestPath = path.join(__dirname, 'manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
  const content = fs.readFileSync(manifestPath, 'utf8');
  let json;
  assert.doesNotThrow(() => { json = JSON.parse(content); }, 'manifest.webmanifest must be valid JSON');

  assert.strictEqual(json.name, 'Petualangan Spidey Cilik - Game Edukasi Balita');
  assert.strictEqual(json.short_name, 'Spidey Cilik');
  assert.strictEqual(json.display, 'standalone');
  assert.strictEqual(json.theme_color, '#EF4444');
  assert.strictEqual(json.background_color, '#FFF9F0');
  assert.strictEqual(json.start_url, './index.html');
  assert(Array.isArray(json.icons) && json.icons.length >= 4, 'Manifest must declare at least 4 icons');

  // Verify referenced icon files exist on disk
  json.icons.forEach(icon => {
    const iconFile = path.join(__dirname, icon.src);
    assert(fs.existsSync(iconFile), `Icon file declared in manifest missing: ${icon.src}`);
  });
});

await test('6.2 sw.js exists and implements Cache-First strategy', () => {
  const swPath = path.join(__dirname, 'sw.js');
  assert(fs.existsSync(swPath), 'sw.js must exist');
  const swCode = fs.readFileSync(swPath, 'utf8');

  // Check required cache assets
  const requiredAssets = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './audio.js',
    './engines.js',
    './levels.js',
    './mascot.js',
    './manifest.webmanifest'
  ];
  requiredAssets.forEach(asset => {
    assert(swCode.includes(asset), `sw.js missing pre-cache entry for ${asset}`);
  });

  // Check lifecycle hooks and caching patterns
  assert(swCode.includes('addEventListener(\'install\'') || swCode.includes('addEventListener("install"'), 'sw.js must handle install event');
  assert(swCode.includes('addEventListener(\'activate\'') || swCode.includes('addEventListener("activate"'), 'sw.js must handle activate event');
  assert(swCode.includes('addEventListener(\'fetch\'') || swCode.includes('addEventListener("fetch"'), 'sw.js must handle fetch event');
  assert(swCode.includes('caches.match'), 'sw.js must use caches.match for cache-first strategy');
  assert(swCode.includes('caches.open'), 'sw.js must use caches.open');
  assert(swCode.includes('skipWaiting'), 'sw.js must call skipWaiting');
  assert(swCode.includes('clients.claim'), 'sw.js must call clients.claim');
  assert(swCode.includes('throw err') || swCode.includes('Response.error'), 'sw.js fetch catch handler must harden against TypeError');
});

await test('6.3 Service Worker registration in index.html or app.js', () => {
  const indexHtmlPath = path.join(__dirname, 'index.html');
  const appJsPath = path.join(__dirname, 'app.js');
  const indexHtml = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf8') : '';
  const appJs = fs.existsSync(appJsPath) ? fs.readFileSync(appJsPath, 'utf8') : '';

  const swRegRegex = /navigator\.serviceWorker\.register\s*\(\s*['"]\.\/sw\.js['"]\)/;
  const isRegistered = swRegRegex.test(indexHtml) || swRegRegex.test(appJs);
  assert(isRegistered, 'Service Worker registration (navigator.serviceWorker.register) missing from index.html and app.js');

  const hasGuard = indexHtml.includes("'serviceWorker' in navigator") || appJs.includes("'serviceWorker' in navigator");
  assert(hasGuard, 'Service Worker registration must be guarded with "serviceWorker" in navigator');
});

// ============================================================================
// SUMMARY & EXIT REPORT
// ============================================================================
console.log('\n============================================================');
console.log('📊 SELF-CHECK EXECUTION SUMMARY');
console.log('============================================================');
console.log(`Total Verification Checks: ${totalTests}`);
console.log(`Passed:                   ${passedTests}`);
console.log(`Failed:                   ${failedTests}`);
console.log('============================================================');

if (failedTests > 0) {
  console.error('\n✖ SELF-CHECK FAILED! The following tests failed:');
  failures.forEach((f, idx) => {
    console.error(`  ${idx + 1}. ${f.name}`);
    console.error(`     Error: ${f.error.message}\n`);
  });
  process.exit(1);
} else {
  console.log('\n✔ ALL SELF-CHECK VERIFICATIONS PASSED CLEANLY (Exit 0)!\n');
  process.exit(0);
}
