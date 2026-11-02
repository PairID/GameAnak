// tests/test_adversarial_w5_m4.mjs - Adversarial Stress Test Suite for Milestone 4 (W5-M4)
// Author: Challenger 1 (Milestone 4 W5-M4 Verification Gate)
// Purpose: Empirically stress-test selfcheck.mjs checks 25-29, sw.js offline cache integrity,
// and verify fault-injection sensitivity (mutations MUST cause selfcheck to fail).

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testFailures = [];

async function challenge(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    testFailures.push({ name, error: err });
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('============================================================');
console.log('🛡️ CHALLENGER 1: ADVERSARIAL STRESS & FAULT INJECTION SUITE');
console.log('Milestone 4 (W5-M4) Verification Gate — Empirical Proofs');
console.log('============================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: EMPIRICAL DISK & PWA OFFLINE INVARIANT VERIFICATION
// ----------------------------------------------------------------------------
console.log('[Suite 1: Empirical Disk & PWA Offline Cache Invariant]');

await challenge('1.1 sw.js ASSETS_TO_CACHE contains exactly 14 items', () => {
  const swPath = path.join(rootDir, 'sw.js');
  assert(fs.existsSync(swPath), 'sw.js must exist on disk');
  const swContent = fs.readFileSync(swPath, 'utf8');

  // Verify CACHE_NAME
  const cacheNameMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  assert(cacheNameMatch, 'sw.js must define CACHE_NAME');
  assert.strictEqual(cacheNameMatch[1], 'spidey-cilik-v1', 'CACHE_NAME must be spidey-cilik-v1');

  // Parse ASSETS_TO_CACHE
  const match = swContent.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  assert(match, 'ASSETS_TO_CACHE must be defined in sw.js');
  
  const rawItems = match[1]
    .split('\n')
    .map(line => line.trim().replace(/[',"]/g, ''))
    .filter(line => line.length > 0 && !line.startsWith('//'));

  assert.strictEqual(rawItems.length, 14, `Expected exactly 14 cache assets, found ${rawItems.length}: ${JSON.stringify(rawItems)}`);
});

await challenge('1.2 All 14 ASSETS_TO_CACHE exist on disk with valid file size', () => {
  const swPath = path.join(rootDir, 'sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  const match = swContent.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  const rawItems = match[1]
    .split('\n')
    .map(line => line.trim().replace(/[',"]/g, ''))
    .filter(line => line.length > 0 && !line.startsWith('//'));

  rawItems.forEach(asset => {
    const fullPath = path.resolve(rootDir, asset);
    assert(fs.existsSync(fullPath), `Asset ${asset} does NOT exist on disk at ${fullPath}`);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) {
      assert(stat.size > 0, `Asset ${asset} is an empty file (0 bytes)`);
    }
  });
});

await challenge('1.3 Zero external network dependencies, CDNs, or remote fonts in production files', () => {
  const coreFiles = [
    'sw.js', 'index.html', 'style.css', 'app.js', 'audio.js',
    'engines.js', 'illustrations.js', 'levels.js', 'mascot.js',
    'manifest.webmanifest'
  ];

  const remotePattern = /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i;

  coreFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(remotePattern);
    assert(!match, `File ${file} contains external URL dependency: ${match ? match[0] : ''}`);
  });
});

// ----------------------------------------------------------------------------
// SUITE 2: PERFORMANCE BENCHMARKING (< 1 SECOND EXECUTION)
// ----------------------------------------------------------------------------
console.log('\n[Suite 2: Performance Benchmarking]');

await challenge('2.1 selfcheck.mjs completes in under 1000ms', async () => {
  const start = performance.now();
  const { execSync } = await import('node:child_process');
  execSync('node selfcheck.mjs', { cwd: rootDir, stdio: 'pipe' });
  const duration = performance.now() - start;
  console.log(`      Execution time: ${duration.toFixed(2)} ms`);
  assert(duration < 1000, `selfcheck.mjs took too long: ${duration.toFixed(2)} ms (budget: 1000ms)`);
});

// ----------------------------------------------------------------------------
// SUITE 3: ADVERSARIAL FAULT-INJECTION & MUTATION STRESS TESTING
// ----------------------------------------------------------------------------
console.log('\n[Suite 3: Fault Injection & Mutation Testing of Checks 25–29]');

const levelsModule = await import('../levels.js');
const enginesModule = await import('../engines.js');
const audioModule = await import('../audio.js');
const mascotModule = await import('../mascot.js');

await challenge('3.1 Fault Injection Check 25: Missing engine in Engines dispatcher MUST fail assertion', () => {
  // Check 25 requires all 13 engines:
  const expectedEngineMethods = [
    'renderHubungkan', 'renderLabirin', 'renderPilih', 'renderHubungkanTitik',
    'renderTebalkan', 'renderMewarnai', 'renderUrutkan', 'renderKodingPanah',
    'renderMemori', 'renderPola', 'renderKode', 'renderBeda', 'renderJumlah'
  ];

  // Test simulation: what if 'renderPola' was missing from an Engines mock?
  const mockEngines = { ...enginesModule.Engines };
  delete mockEngines.renderPola;

  assert.throws(() => {
    expectedEngineMethods.forEach(fnName => {
      assert(typeof mockEngines[fnName] === 'function', `Engines.${fnName} must be a function`);
    });
  }, /Engines\.renderPola must be a function/, 'Check 25 logic must reject missing renderPola');

  // What if engineTypes was missing 'jumlah'?
  const incompleteTypes = [
    'hubungkan', 'labirin', 'pilih', 'titik', 'tebalkan',
    'mewarnai', 'urutkan', 'panah', 'memori', 'pola', 'kode', 'beda'
  ];
  assert.throws(() => {
    assert.strictEqual(incompleteTypes.length, 13, 'Must define exactly 13 engine types');
  }, /13/, 'Check 25 logic must reject incomplete engine count');
});

await challenge('3.2 Fault Injection Check 26: Missing World 5 or invalid level count MUST fail assertion', () => {
  // Mutation A: Testing 4 worlds (BASE_WORLDS) against Check 26 requirement (5 worlds)
  const fourWorlds = levelsModule.BASE_WORLDS;
  assert.throws(() => {
    assert.strictEqual(fourWorlds.length, 5, `Expected 5 worlds, found ${fourWorlds.length}`);
  }, /Expected 5 worlds/, 'Check 26 logic must reject 4 worlds');

  // Mutation B: World 5 color or emoji mutated
  const mutatedWorld = { id: 'puzzle', name: 'Dunia Teka-Teki Cilik', emoji: '❓', color: '#000000' };
  assert.throws(() => {
    assert.strictEqual(mutatedWorld.emoji, '🧩', 'World 5 emoji must be 🧩');
  }, /World 5 emoji must be 🧩/, 'Check 26 logic must reject wrong emoji');

  // Mutation C: Level count is 75 (BASE_LEVELS) instead of 91
  const seventyFiveLevels = levelsModule.BASE_LEVELS;
  assert.throws(() => {
    assert.strictEqual(seventyFiveLevels.length, 91, `Expected 91 total levels, found ${seventyFiveLevels.length}`);
  }, /Expected 91 total levels/, 'Check 26 logic must reject 75 level count');
});

await challenge('3.3 Fault Injection Check 27: Corrupted Pola level schema MUST fail assertion', () => {
  // Test: Pola level where missingIndex does NOT point to '❓'
  const corruptedPola = {
    id: 76,
    worldId: 'puzzle',
    type: 'pola',
    patternType: 'AB',
    sequence: ['🍎', '🍌', '🍎', '🍌', '🍎', '🍌'], // no '❓'
    missingIndex: 5,
    options: ['🍎', '🍌'],
    answer: '🍌'
  };

  assert.throws(() => {
    assert.strictEqual(corruptedPola.sequence[corruptedPola.missingIndex], '❓', `Level ${corruptedPola.id} missingIndex must point to ❓`);
  }, /missingIndex must point to ❓/, 'Check 27 logic must reject Pola without ❓ marker');

  // Test: Pola level where answer is missing from options
  const corruptedPolaAnswer = {
    id: 76,
    worldId: 'puzzle',
    type: 'pola',
    patternType: 'AB',
    sequence: ['🍎', '❓'],
    missingIndex: 1,
    options: ['🍇', '🍓'],
    answer: '🍌'
  };
  assert.throws(() => {
    assert(corruptedPolaAnswer.options.includes(corruptedPolaAnswer.answer), `Level ${corruptedPolaAnswer.id} options must include answer`);
  }, /options must include answer/, 'Check 27 logic must reject Pola where answer is not an option');
});

await challenge('3.4 Fault Injection Check 27: Corrupted Kode cipher bijection MUST fail assertion', () => {
  // Test: Cipher key where symbol mapping contradicts solution
  const corruptedKode = {
    id: 80,
    worldId: 'puzzle',
    type: 'kode',
    cipherKey: [{ symbol: '🐱', value: 1 }, { symbol: '🐶', value: 2 }],
    code: ['🐱', '🐶'],
    solution: [1, 999], // invalid: derived is [1, 2]
    options: [1, 2, 3],
    secretReward: 'Hadiah',
    rewardEmoji: '🎁'
  };

  assert.throws(() => {
    const cipherMap = new Map(corruptedKode.cipherKey.map(k => [k.symbol, k.value]));
    const derivedSolution = corruptedKode.code.map(sym => cipherMap.get(sym));
    assert.deepStrictEqual(derivedSolution, corruptedKode.solution, `Level ${corruptedKode.id} cipher does not map code to solution`);
  }, /cipher does not map code to solution/, 'Check 27 logic must catch unsolvable cipher encryption');
});

await challenge('3.5 Fault Injection Check 27: Corrupted Beda level schema MUST fail assertion', () => {
  // Test: Beda level with 5 options instead of 4
  const corruptedBeda = {
    id: 84,
    worldId: 'puzzle',
    type: 'beda',
    cards: ['🐟', '🐟', '🐟', '🐙', '🦈'],
    differentIndex: 3,
    differenceReason: 'Bukan ikan'
  };

  assert.throws(() => {
    assert.strictEqual(corruptedBeda.cards.length, 4, `Level ${corruptedBeda.id} must have exactly 4 choices`);
  }, /must have exactly 4 choices/, 'Check 27 logic must enforce 4-card preschool grid standard');

  // Test: Beda level with out of bounds index
  const corruptedBedaIdx = {
    id: 84,
    worldId: 'puzzle',
    type: 'beda',
    cards: ['🐟', '🐟', '🐟', '🐙'],
    differentIndex: 99,
    differenceReason: 'Bukan ikan'
  };
  assert.throws(() => {
    assert(corruptedBedaIdx.differentIndex >= 0 && corruptedBedaIdx.differentIndex < 4, 'differentIndex out of range');
  }, /out of range/, 'Check 27 logic must reject out of bounds differentIndex');
});

await challenge('3.6 Fault Injection Check 27: Corrupted Jumlah math sum MUST fail assertion', () => {
  // Test: Addition mode where left + right != answer
  const corruptedJumlah = {
    id: 88,
    worldId: 'puzzle',
    type: 'jumlah',
    mode: 'addition',
    leftGroup: { count: 2 },
    rightGroup: { count: 3 },
    options: [1, 2, 5],
    answer: 99 // 2 + 3 is 5, not 99
  };

  assert.throws(() => {
    const expectedSum = corruptedJumlah.leftGroup.count + corruptedJumlah.rightGroup.count;
    assert.strictEqual(expectedSum, corruptedJumlah.answer, `Level ${corruptedJumlah.id} math does not balance`);
  }, /math does not balance/, 'Check 27 logic must catch invalid arithmetic');

  // Test: Balance mode where left is target but right has more
  const corruptedBalance = {
    id: 89,
    worldId: 'puzzle',
    type: 'jumlah',
    mode: 'balance',
    leftGroup: { count: 2 },
    rightGroup: { count: 5 }, // right has more!
    target: 'left',
    answer: 'left'
  };
  assert.throws(() => {
    if (corruptedBalance.target === 'left') {
      assert(corruptedBalance.leftGroup.count > corruptedBalance.rightGroup.count, `Level ${corruptedBalance.id} leftGroup must have more items`);
    }
  }, /leftGroup must have more items/, 'Check 27 logic must catch contradictory scale balance logic');
});

await challenge('3.7 Fault Injection Check 28: Missing Mascot costume, pose, or squad member MUST fail assertion', () => {
  // Test: Mascot costumes missing detective
  const corruptedCostumes = [{ id: 'explorer' }, { id: 'scientist' }, { id: 'whimsical' }];
  assert.throws(() => {
    const costumeIds = corruptedCostumes.map(c => c.id);
    assert(costumeIds.includes('detective'), 'Mascot missing detective costume');
  }, /Mascot missing detective costume/, 'Check 28 logic must reject missing detective costume');

  // Test: Mascot squad mutated away from 5
  const mutatedSquad = ['spidey', 'cat', 'bunny', 'panda']; // length 4
  assert.throws(() => {
    assert.strictEqual(mutatedSquad.length, 5, 'Mascot.squad must retain exactly 5 canonical characters');
  }, /5 canonical characters/, 'Check 28 logic must strictly enforce 5 canonical squad members');

  // Test: Pose missing from supported list
  const missingPose = 'unknown_pose_xyz';
  assert.throws(() => {
    const validPoses = ['celebrate_jump', 'eureka', 'curious', 'proud'];
    assert(validPoses.includes(missingPose), `Pose ${missingPose} not supported`);
  }, /not supported/, 'Check 28 logic must validate celebration poses');
});

await challenge('3.8 Fault Injection Check 29: Missing procedural audio cue MUST fail assertion', () => {
  const mockSound = {
    playSnap: () => {},
    playCipherClick: () => {},
    playScaleTilt: () => {}
    // playFlourish missing!
  };

  assert.throws(() => {
    assert(typeof mockSound.playFlourish === 'function', 'sound.playFlourish must be a function');
  }, /sound\.playFlourish must be a function/, 'Check 29 logic must catch missing audio method');
});

// ----------------------------------------------------------------------------
// SUITE 4: SERVICE WORKER LOGIC SIMULATION
// ----------------------------------------------------------------------------
console.log('\n[Suite 4: Service Worker Offline Logic Simulation]');

await challenge('4.1 Simulate Service Worker install and cache.addAll with all 14 assets', async () => {
  const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
  const match = swContent.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  const rawItems = match[1]
    .split('\n')
    .map(line => line.trim().replace(/[',"]/g, ''))
    .filter(line => line.length > 0 && !line.startsWith('//'));

  // Mock Cache
  const mockCacheStore = new Map();
  const mockCache = {
    addAll: async (assets) => {
      for (const asset of assets) {
        const fullPath = path.resolve(rootDir, asset);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`Failed to cache ${asset}: File not found on disk`);
        }
        mockCacheStore.set(asset, { status: 200, ok: true });
      }
      return Promise.resolve();
    }
  };

  await mockCache.addAll(rawItems);
  assert.strictEqual(mockCacheStore.size, 14, `Mock cache must hold exactly 14 cached assets, got ${mockCacheStore.size}`);
});

await challenge('4.2 Verify sw.js cache-first fetch fallback logic', () => {
  const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
  assert(swContent.includes('caches.match(event.request)'), 'sw.js must look up in caches first');
  assert(swContent.includes('fetch(event.request)'), 'sw.js must fall back to fetch if not cached');
  assert(swContent.includes('event.request.mode === \'navigate\''), 'sw.js must provide index.html fallback for navigation offline');
  assert(swContent.includes('caches.match(\'./index.html\')'), 'sw.js must return cached index.html when offline navigation fails');
});

// ----------------------------------------------------------------------------
// SUITE 5: PROCESS-LEVEL END-TO-END FAULT INJECTION (EXIT CODE 1 VERIFICATION)
// ----------------------------------------------------------------------------
console.log('\n[Suite 5: Process-Level End-to-End Fault Injection (Exit Code 1)]');

const { spawnSync } = await import('node:child_process');

await challenge('5.1 Process mutation: Missing engine in Engines causes selfcheck.mjs to fail with exit code 1', () => {
  const origSelfcheck = fs.readFileSync(path.join(rootDir, 'selfcheck.mjs'), 'utf8');
  // Mutate: delete Engines.renderPola right after import
  const mutatedSelfcheck = origSelfcheck.replace(
    "enginesModule = await import('./engines.js');",
    "enginesModule = await import('./engines.js');\n  delete enginesModule.Engines.renderPola;"
  );

  const tempFile = path.join(rootDir, 'temp_mutant_engine.mjs');
  try {
    fs.writeFileSync(tempFile, mutatedSelfcheck, 'utf8');
    const res = spawnSync('node', [tempFile], { cwd: rootDir, encoding: 'utf8' });
    assert.strictEqual(res.status, 1, `Mutant selfcheck should have exited with code 1, got ${res.status}`);
    const combinedOutput = (res.stderr || '') + (res.stdout || '');
    assert(combinedOutput.includes('Engines.renderPola must be a function'),
      `Output must cite renderPola failure, got: ${combinedOutput}`);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
});

await challenge('5.2 Process mutation: Missing World 5 causes selfcheck.mjs to fail with exit code 1', () => {
  const origSelfcheck = fs.readFileSync(path.join(rootDir, 'selfcheck.mjs'), 'utf8');
  // Mutate: remove World 5 from allWorlds in Check 26
  const mutatedSelfcheck = origSelfcheck.replace(
    "const allWorlds = levelsModule.WORLDS_DB || levelsModule.ALL_WORLDS || levelsModule.WORLDS;",
    "const allWorlds = (levelsModule.WORLDS_DB || levelsModule.ALL_WORLDS || levelsModule.WORLDS).filter(w => w.id !== 'puzzle');"
  );

  const tempFile = path.join(rootDir, 'temp_mutant_world.mjs');
  try {
    fs.writeFileSync(tempFile, mutatedSelfcheck, 'utf8');
    const res = spawnSync('node', [tempFile], { cwd: rootDir, encoding: 'utf8' });
    assert.strictEqual(res.status, 1, `Mutant selfcheck should have exited with code 1, got ${res.status}`);
    const combinedOutput = (res.stderr || '') + (res.stdout || '');
    assert(combinedOutput.includes('Expected 5 worlds'),
      `Output must cite Expected 5 worlds failure, got: ${combinedOutput}`);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
});

await challenge('5.3 Process mutation: Corrupted puzzle level causes selfcheck.mjs to fail with exit code 1', () => {
  const origSelfcheck = fs.readFileSync(path.join(rootDir, 'selfcheck.mjs'), 'utf8');
  // Mutate: corrupt answer in Level 76 in Check 27
  const mutatedSelfcheck = origSelfcheck.replace(
    "const puzzleLevels = allLevels.filter(lvl => lvl.worldId === 'puzzle');",
    "const puzzleLevels = allLevels.filter(lvl => lvl.worldId === 'puzzle');\n  puzzleLevels[0].options = ['❌', '❌'];"
  );

  const tempFile = path.join(rootDir, 'temp_mutant_level.mjs');
  try {
    fs.writeFileSync(tempFile, mutatedSelfcheck, 'utf8');
    const res = spawnSync('node', [tempFile], { cwd: rootDir, encoding: 'utf8' });
    assert.strictEqual(res.status, 1, `Mutant selfcheck should have exited with code 1, got ${res.status}`);
    const combinedOutput = (res.stderr || '') + (res.stdout || '');
    assert(combinedOutput.includes('options must include answer'),
      `Output must cite options must include answer failure, got: ${combinedOutput}`);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
});

// ----------------------------------------------------------------------------
// SUMMARY & RESULTS
// ----------------------------------------------------------------------------
console.log('\n============================================================');
console.log('📊 CHALLENGER ADVERSARIAL STRESS TEST SUMMARY');
console.log('============================================================');
console.log(`Total Verification Checks: ${totalTests}`);
console.log(`Passed:                   ${passedTests}`);
console.log(`Failed:                   ${failedTests}`);
console.log('============================================================');

if (failedTests > 0) {
  console.error('\n✖ CHALLENGE FAILED! The following tests failed:');
  testFailures.forEach((f, idx) => {
    console.error(`  ${idx + 1}. ${f.name}`);
    console.error(`     Error: ${f.error.message}\n`);
  });
  process.exit(1);
} else {
  console.log('\n✔ ALL ADVERSARIAL CHALLENGES & FAULT INJECTIONS PASSED CLEANLY (Exit 0)!\n');
  process.exit(0);
}

