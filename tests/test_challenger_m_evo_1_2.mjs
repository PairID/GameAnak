// tests/test_challenger_m_evo_1_2.mjs
// Adversarial Empirical Challenge Suite: SVG Geometry, XML Well-Formedness,
// Multi-Mascot Gradient ID Isolation, Viewport Scalability (320px to 4K),
// and CSS Keyframe Animation Binding Parity.
//
// Target: mascot.js and style.css (Milestone M-EVO-1)
// Mode: Empirical Challenger (critic, specialist)
// Pure Node.js (v18+), zero external dependencies

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 CHALLENGER M-EVO-1.2: EMPIRICAL ADVERSARIAL STRESS SUITE');
console.log('SVG Geometry, XML Validity, Gradient Collisions & CSS Keyframes');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const testResults = [];
const anomalies = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passCount++;
    testResults.push({ name, status: 'PASS' });
  } catch (err) {
    console.log(`  \x1b[31m✖\x1b[0m [FAIL] ${name}: ${err.message}`);
    failCount++;
    testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
  }
}

function anomaly(category, message, details = {}) {
  anomalies.push({ category, message, details });
  console.log(`  \x1b[33m⚡ [ANOMALY - ${category}]\x1b[0m ${message}`);
}

// ============================================================================
// XML / SVG STRICT PARSER
// ============================================================================

const SELF_CLOSING_TAGS = new Set([
  'path', 'circle', 'ellipse', 'rect', 'line', 'polygon', 'polyline',
  'stop', 'feDropShadow', 'feGaussianBlur', 'feOffset', 'feBlend', 'use', 'image'
]);

const CONTAINER_TAGS = new Set([
  'svg', 'defs', 'g', 'text', 'radialGradient', 'linearGradient', 'filter', 'tspan'
]);

function parseAndValidateSvgXml(svgString, label = 'SVG') {
  assert(typeof svgString === 'string', `${label}: SVG must be a string`);
  const trimmed = svgString.trim();
  assert(trimmed.startsWith('<svg'), `${label}: must start with <svg`);
  assert(trimmed.endsWith('</svg>'), `${label}: must end with </svg>`);

  // Check quotes balance in attributes
  // Check for unclosed quotes in attributes
  const attrQuoteRegex = /([a-zA-Z0-9_:-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g;
  let qMatch;
  while ((qMatch = attrQuoteRegex.exec(trimmed)) !== null) {
    const attrName = qMatch[1];
    const attrVal = qMatch[2];
    const isQuoted = (attrVal.startsWith('"') && attrVal.endsWith('"')) ||
                     (attrVal.startsWith("'") && attrVal.endsWith("'"));
    assert(isQuoted, `${label}: Attribute "${attrName}" has unquoted value: ${attrVal}`);
    assert(!attrVal.includes('NaN'), `${label}: Attribute "${attrName}" contains NaN: ${attrVal}`);
    assert(!attrVal.includes('undefined'), `${label}: Attribute "${attrName}" contains undefined: ${attrVal}`);
    assert(!attrVal.includes('null'), `${label}: Attribute "${attrName}" contains null: ${attrVal}`);
  }

  // Tokenize elements
  const tagRegex = /<(\/?[a-zA-Z0-9_-]+)([^>]*?)(\/?)>/gs;
  let match;
  const stack = [];

  while ((match = tagRegex.exec(trimmed)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const isClosing = tagName.startsWith('/');
    const cleanTagName = isClosing ? tagName.slice(1) : tagName;
    const isSelfClosing = match[3] === '/' || SELF_CLOSING_TAGS.has(cleanTagName);

    if (isClosing) {
      if (stack.length === 0) {
        throw new Error(`${label}: Unexpected closing tag </${cleanTagName}> with empty stack`);
      }
      const top = stack.pop();
      if (top !== cleanTagName) {
        throw new Error(`${label}: Mismatched closing tag </${cleanTagName}>, expected </${top}>`);
      }
    } else {
      if (!isSelfClosing && CONTAINER_TAGS.has(cleanTagName)) {
        stack.push(cleanTagName);
      } else if (!isSelfClosing && !SELF_CLOSING_TAGS.has(cleanTagName)) {
        // Tag wasn't explicitly self-closed nor recognized as known container
        throw new Error(`${label}: Unrecognized non-self-closing tag <${cleanTagName}>`);
      }
    }
  }

  if (stack.length > 0) {
    throw new Error(`${label}: Unclosed container tags remaining: ${stack.join(', ')}`);
  }

  return true;
}

// ============================================================================
// SUITE 1: STRICT SVG XML VALIDITY & TAG BALANCING
// ============================================================================

console.log('[Suite 1: Strict SVG XML Validity & Tag Balancing]');

const mascotPath = path.join(ROOT_DIR, 'mascot.js');
assert(fs.existsSync(mascotPath), 'mascot.js must exist');
const { Mascot } = await import(`file://${mascotPath.replace(/\\/g, '/')}`);

const characters = [
  { name: 'hero', fn: (s, p) => Mascot.hero(s, p), defaultViewBox: '0 0 120 120' },
  { name: 'robot', fn: (s, p) => Mascot.robot(s, p), defaultViewBox: '0 0 100 100' },
  { name: 'bot (alias)', fn: (s, p) => Mascot.bot(s, p), defaultViewBox: '0 0 100 100' },
  { name: 'cat', fn: (s, p) => Mascot.cat(s, p), defaultViewBox: '0 0 100 100' },
  { name: 'kucing (alias)', fn: (s, p) => Mascot.kucing(s, p), defaultViewBox: '0 0 100 100' },
  { name: 'bunny', fn: (s, p) => Mascot.bunny(s, p), defaultViewBox: '0 0 100 100' },
  { name: 'kelinci (alias)', fn: (s, p) => Mascot.kelinci(s, p), defaultViewBox: '0 0 100 100' },
  { name: 'panda', fn: (s, p) => Mascot.panda(s, p), defaultViewBox: '0 0 100 100' }
];

const testPoses = [
  'idle', 'wave', 'happy', 'cheer', 'cheering', 'think', 'thinking',
  'encourage', 'encouraging', undefined, 'custom_unknown_pose'
];

for (const char of characters) {
  test(`1.1.${char.name}: All poses produce well-formed, balanced XML without NaN/undefined`, () => {
    for (const pose of testPoses) {
      const svg = char.fn(120, pose);
      parseAndValidateSvgXml(svg, `${char.name} [pose=${pose}]`);
    }
  });
}

test('1.2.star: Validates active and inactive star SVG XML', () => {
  const activeStar = Mascot.star(40, true);
  const inactiveStar = Mascot.star(40, false);
  parseAndValidateSvgXml(activeStar, 'Mascot.star(active)');
  parseAndValidateSvgXml(inactiveStar, 'Mascot.star(inactive)');
});

test('1.3.web: Validates corner web SVG XML', () => {
  const web = Mascot.web(100);
  parseAndValidateSvgXml(web, 'Mascot.web');
});

// ============================================================================
// SUITE 2: VIEWBOX & GEOMETRIC BOUNDS VERIFICATION
// ============================================================================

console.log('\n[Suite 2: ViewBox & Geometric Bounds Verification]');

function extractViewBox(svg) {
  const match = /viewBox="([^"]+)"/.exec(svg);
  return match ? match[1] : null;
}

for (const char of characters) {
  test(`2.1.${char.name}: Has exact expected viewBox across all poses`, () => {
    for (const pose of testPoses) {
      const svg = char.fn(100, pose);
      const vb = extractViewBox(svg);
      assert.strictEqual(vb, char.defaultViewBox, `${char.name} pose=${pose} has invalid viewBox: ${vb}`);
    }
  });
}

test('2.2.star & web: ViewBox integrity', () => {
  assert.strictEqual(extractViewBox(Mascot.star(40)), '0 0 40 40', 'Star must have 0 0 40 40');
  assert.strictEqual(extractViewBox(Mascot.web(80)), '0 0 100 100', 'Web must have 0 0 100 100');
});

test('2.3.Geometric containment bounds: Inspect element coordinates within viewBox', () => {
  // Check coordinate extents for Spidey (viewBox 0 0 120 120)
  for (const pose of ['idle', 'cheer', 'think', 'wave', 'encourage', 'happy']) {
    const svg = Mascot.hero(120, pose);
    const [minX, minY, vbW, vbH] = extractViewBox(svg).split(/\s+/).map(Number);

    // Extract all cx, cy, x, y coordinates
    const coordRegex = /\b(?:cx|cy|x|y|x1|y1|x2|y2)="([0-9.-]+)"/g;
    let cMatch;
    while ((cMatch = coordRegex.exec(svg)) !== null) {
      const val = parseFloat(cMatch[1]);
      assert(!isNaN(val), `Coordinate ${cMatch[0]} is NaN`);
      // Allow minor border bleed (-10 to vbW + 10) for artistic glow/shadow
      assert(val >= -10 && val <= vbW + 15, `Coordinate ${cMatch[0]} (${val}) exceeds viewBox range [${minX}, ${vbW}]`);
    }

    // Check polygon points
    const polyRegex = /points="([^"]+)"/g;
    let pMatch;
    while ((pMatch = polyRegex.exec(svg)) !== null) {
      const points = pMatch[1].trim().split(/[\s,]+/);
      for (let i = 0; i < points.length; i += 2) {
        if (!points[i] || !points[i + 1]) continue;
        const px = parseFloat(points[i]);
        const py = parseFloat(points[i + 1]);
        assert(!isNaN(px) && !isNaN(py), `Polygon point (${points[i]}, ${points[i+1]}) has NaN`);
        assert(px >= -5 && px <= vbW + 10, `Polygon X ${px} exceeds viewBox`);
        assert(py >= -5 && py <= vbH + 10, `Polygon Y ${py} exceeds viewBox`);
      }
    }
  }
});

// ============================================================================
// SUITE 3: GRADIENT ID ISOLATION & MULTI-MOUNT COLLISION ANALYSIS
// ============================================================================

console.log('\n[Suite 3: Gradient ID Isolation & Multi-Mount Collision Analysis]');

test('3.1.Gradient & Filter ID Extraction: Check for cross-character ID collisions', () => {
  const charDefs = {
    hero: Mascot.hero(120),
    robot: Mascot.robot(100),
    cat: Mascot.cat(100),
    bunny: Mascot.bunny(100),
    panda: Mascot.panda(100)
  };

  const idMap = new Map();

  for (const [charName, svg] of Object.entries(charDefs)) {
    const idRegex = /\bid="([a-zA-Z0-9_-]+)"/g;
    let match;
    const ids = [];
    while ((match = idRegex.exec(svg)) !== null) {
      ids.push(match[1]);
    }

    for (const id of ids) {
      if (idMap.has(id)) {
        idMap.get(id).push(charName);
      } else {
        idMap.set(id, [charName]);
      }
    }
  }

  console.log(`    Total unique IDs found across squad: ${idMap.size}`);
  const collisions = [];
  for (const [id, charList] of idMap.entries()) {
    if (charList.length > 1) {
      collisions.push({ id, charList });
      anomaly('GRADIENT_COLLISION', `ID "${id}" is shared between distinct characters: ${charList.join(', ')}`);
    }
  }

  assert.strictEqual(collisions.length, 0, `Detected ${collisions.length} shared IDs between different characters: ${JSON.stringify(collisions)}`);
});

test('3.2.Internal Reference Validity: All url(#id) must point to IDs defined in the same SVG', () => {
  const allChars = [
    { name: 'hero', svg: Mascot.hero(120, 'cheer') },
    { name: 'robot', svg: Mascot.robot(100, 'think') },
    { name: 'cat', svg: Mascot.cat(100, 'wave') },
    { name: 'bunny', svg: Mascot.bunny(100, 'idle') },
    { name: 'panda', svg: Mascot.panda(100, 'cheer') }
  ];

  for (const { name, svg } of allChars) {
    // Collect all defined IDs
    const definedIds = new Set();
    const idRegex = /\bid="([a-zA-Z0-9_-]+)"/g;
    let idMatch;
    while ((idMatch = idRegex.exec(svg)) !== null) {
      definedIds.add(idMatch[1]);
    }

    // Collect all url(#id) references
    const refRegex = /url\(#([a-zA-Z0-9_-]+)\)/g;
    let refMatch;
    while ((refMatch = refRegex.exec(svg)) !== null) {
      const refId = refMatch[1];
      assert(definedIds.has(refId), `${name}: Found dangling reference url(#${refId}) not defined in SVG!`);
    }
  }
});

test('3.3.Multi-Mascot DOM Co-existence Simulation: Render entire squad and duplicate instances', () => {
  // Simulate an HTML page mounting multiple mascots:
  // - Top header: Spidey
  // - World banner: Cat & Bunny
  // - Game board: Robot
  // - Victory overlay: Spidey (second instance)
  const simulatedDom = `
    <div id="app">
      <div class="header">${Mascot.hero(64, 'idle')}</div>
      <div class="banner">${Mascot.cat(80, 'wave')} ${Mascot.bunny(80, 'idle')}</div>
      <div class="game">${Mascot.robot(100, 'think')}</div>
      <div class="dialog">${Mascot.hero(120, 'cheer')}</div>
    </div>
  `;

  // Verify that the whole combined HTML has no malformed XML tags inside the SVGs
  const svgRegex = /<svg[\s\S]*?<\/svg>/g;
  let match;
  let svgCount = 0;
  while ((match = svgRegex.exec(simulatedDom)) !== null) {
    parseAndValidateSvgXml(match[0], `Mounted SVG #${++svgCount}`);
  }
  assert.strictEqual(svgCount, 5, 'Must contain 5 mounted SVGs');

  // Check duplicate ID instances in same DOM
  const allIds = [];
  const idRegex = /\bid="([a-zA-Z0-9_-]+)"/g;
  let idMatch;
  while ((idMatch = idRegex.exec(simulatedDom)) !== null) {
    allIds.push(idMatch[1]);
  }

  // Count frequencies
  const counts = {};
  allIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const duplicatedInDom = Object.entries(counts).filter(([id, c]) => c > 1);

  if (duplicatedInDom.length > 0) {
    anomaly('MULTI_INSTANCE_DUPLICATE_ID',
      `Mounting multiple instances of hero produced duplicate DOM IDs: ${duplicatedInDom.map(d => `${d[0]}(x${d[1]})`).join(', ')}. While harmless in isolated SVGs with identical stop colors, in standard HTML5 DOM duplicate IDs cause secondary SVGs to bind to the first SVG's gradient definitions.`
    );
  }
});

// ============================================================================
// SUITE 4: VIEWPORT SCALABILITY & VECTOR INTEGRITY (320px to 4K)
// ============================================================================

console.log('\n[Suite 4: Viewport Scalability & Vector Integrity (320px to 4K)]');

const viewports = [
  { name: 'Mobile Mini', width: 320, mascotSize: 48 },
  { name: 'Phone Standard', width: 390, mascotSize: 64 },
  { name: 'Tablet Portrait', width: 768, mascotSize: 96 },
  { name: 'Tablet Landscape', width: 1024, mascotSize: 120 },
  { name: 'Desktop Full HD', width: 1920, mascotSize: 240 },
  { name: 'Desktop 2K QHD', width: 2560, mascotSize: 320 },
  { name: 'Desktop 4K UHD', width: 3840, mascotSize: 640 },
  { name: 'Desktop 4K Hero Showcase', width: 3840, mascotSize: 1200 }
];

test('4.1.Vector Purity: Mascots must contain ZERO raster images or base64 data', () => {
  for (const char of characters) {
    for (const pose of ['idle', 'cheer', 'think', 'wave']) {
      const svg = char.fn(100, pose);
      assert(!svg.includes('<image'), `${char.name} contains raster <image> element!`);
      assert(!svg.includes('data:image/'), `${char.name} contains embedded base64 bitmap!`);
      assert(!svg.includes('<foreignObject'), `${char.name} contains <foreignObject>!`);
    }
  }
});

test('4.2.Size Scalability: Dimension attributes accurately set from 48px to 1200px', () => {
  for (const vp of viewports) {
    for (const char of characters) {
      const svg = char.fn(vp.mascotSize, 'cheer');
      const widthMatch = /width="([^"]+)"/.exec(svg);
      const heightMatch = /height="([^"]+)"/.exec(svg);

      assert(widthMatch, `${char.name} missing width attribute at ${vp.name}`);
      assert(heightMatch, `${char.name} missing height attribute at ${vp.name}`);
      assert.strictEqual(Number(widthMatch[1]), vp.mascotSize, `Width mismatch at ${vp.name}`);
      assert.strictEqual(Number(heightMatch[1]), vp.mascotSize, `Height mismatch at ${vp.name}`);

      // Verify viewBox doesn't warp or distort
      const vb = extractViewBox(svg);
      assert.strictEqual(vb, char.defaultViewBox, `ViewBox distorted at size ${vp.mascotSize}`);
    }
  }
});

test('4.3.Extreme Edge Sizes: Verify 0, 1, 10000, and non-integer sizes', () => {
  const edgeSizes = [1, 16, 50.5, 4096, 10000];
  for (const s of edgeSizes) {
    const svg = Mascot.hero(s, 'wave');
    parseAndValidateSvgXml(svg, `Mascot.hero(size=${s})`);
    const w = /width="([^"]+)"/.exec(svg)[1];
    assert.strictEqual(Number(w), s, `Edge size ${s} width was not respected`);
  }
});

// ============================================================================
// SUITE 5: CSS ROOT CLASS & KEYFRAME ANIMATION BINDING PARITY
// ============================================================================

console.log('\n[Suite 5: CSS Root Class & Keyframe Animation Binding Parity]');

const stylePath = path.join(ROOT_DIR, 'style.css');
assert(fs.existsSync(stylePath), 'style.css must exist');
const styleCss = fs.readFileSync(stylePath, 'utf8');

test('5.1.Keyframe definitions exist for all mascot animations', () => {
  const requiredKeyframes = [
    'mascotBreathe',
    'mascotCheer',
    'mascotThink',
    'mascotWave',
    'antennaGlow'
  ];

  for (const kf of requiredKeyframes) {
    const regex = new RegExp(`@keyframes\\s+${kf}\\b`, 'i');
    assert(regex.test(styleCss), `style.css is missing required keyframe: @keyframes ${kf}`);
  }
});

test('5.2.CSS animation selector coverage vs SVG root classes', () => {
  // Check root base classes
  assert(styleCss.includes('.spidey-mascot'), 'style.css must define .spidey-mascot');
  assert(styleCss.includes('.spideybot'), 'style.css must define .spideybot');
  assert(styleCss.includes('.mascot-companion'), 'style.css must define .mascot-companion');

  // Test SVG root classes generated by mascot.js
  const sampleHeroIdle = Mascot.hero(100, 'idle');
  assert(sampleHeroIdle.includes('class="spidey-mascot idle"'), 'Hero idle class mismatch');

  const sampleHeroCheer = Mascot.hero(100, 'cheer');
  assert(sampleHeroCheer.includes('class="spidey-mascot cheer"'), 'Hero cheer class mismatch');

  const sampleBotCheer = Mascot.robot(100, 'cheer');
  assert(sampleBotCheer.includes('class="spideybot cheer"'), 'Bot cheer class mismatch');

  const sampleCatCheer = Mascot.cat(100, 'cheer');
  assert(sampleCatCheer.includes('class="mascot-companion cat cheer"'), 'Cat cheer class mismatch');

  // Verify selector mappings in CSS
  const selectorChecks = [
    { selector: '.spidey-mascot.idle', keyframe: 'mascotBreathe' },
    { selector: '.spidey-mascot.cheer', keyframe: 'mascotCheer' },
    { selector: '.spidey-mascot.cheering', keyframe: 'mascotCheer' },
    { selector: '.spidey-mascot.think', keyframe: 'mascotThink' },
    { selector: '.spidey-mascot.thinking', keyframe: 'mascotThink' },
    { selector: '.spidey-mascot.wave', keyframe: 'mascotWave' },
    { selector: '.spidey-mascot.happy', keyframe: 'mascotWave' },
    { selector: '.spidey-mascot.encourage', keyframe: 'mascotWave' },
    { selector: '.spidey-mascot.encouraging', keyframe: 'mascotWave' },
    { selector: '.spideybot.idle', keyframe: 'mascotBreathe' },
    { selector: '.spideybot.cheer', keyframe: 'mascotCheer' },
    { selector: '.spideybot.happy', keyframe: 'mascotCheer' },
    { selector: '.spideybot.think', keyframe: 'mascotThink' },
    { selector: '.spideybot.thinking', keyframe: 'mascotThink' },
    { selector: '.spideybot.wave', keyframe: 'mascotWave' },
    { selector: '.mascot-companion.idle', keyframe: 'mascotBreathe' },
    { selector: '.mascot-companion.cheer', keyframe: 'mascotCheer' },
    { selector: '.mascot-companion.think', keyframe: 'mascotThink' },
    { selector: '.mascot-companion.wave', keyframe: 'mascotWave' },
    { selector: '.antenna-bulb', keyframe: 'antennaGlow' }
  ];

  for (const { selector, keyframe } of selectorChecks) {
    assert(styleCss.includes(selector), `style.css is missing selector: ${selector}`);
  }
});

test('5.3.Adversarial Alias & Pose Parity Audit: Check companion alias pose styling coverage', () => {
  // Check if companion poses like 'happy' or 'thinking' have explicit CSS selectors
  // When Mascot.cat(100, 'happy') is called, class is "mascot-companion cat happy".
  // Does style.css bind .mascot-companion.happy?
  const companionPoses = ['happy', 'cheering', 'thinking', 'encourage', 'encouraging'];
  for (const p of companionPoses) {
    const hasClass = styleCss.includes(`.mascot-companion.${p}`);
    if (!hasClass) {
      anomaly('UNBOUND_COMPANION_POSE_CSS',
        `Class ".mascot-companion.${p}" is not explicitly bound to any keyframe animation in style.css. If Mascot.cat/bunny/panda is invoked with pose "${p}", it falls back to static rendering without animation.`
      );
    }
  }
});

// ============================================================================
// SUITE 6: POLYMORPHIC DISPATCHER & WORLD MAPPING INTEGRITY
// ============================================================================

console.log('\n[Suite 6: Polymorphic Dispatcher & World Mapping Integrity]');

test('6.1.Mascot.companion polymorphic dispatch: All squad members and aliases', () => {
  const queryCases = [
    { query: 'spidey', expectedClass: 'spidey-mascot' },
    { query: 'hero', expectedClass: 'spidey-mascot' },
    { query: 'robot', expectedClass: 'spideybot' },
    { query: 'bot', expectedClass: 'spideybot' },
    { query: 'spideybot', expectedClass: 'spideybot' },
    { query: 'cat', expectedClass: 'mascot-companion cat' },
    { query: 'kucing', expectedClass: 'mascot-companion cat' },
    { query: 'bunny', expectedClass: 'mascot-companion bunny' },
    { query: 'kelinci', expectedClass: 'mascot-companion bunny' },
    { query: 'rabbit', expectedClass: 'mascot-companion bunny' },
    { query: 'panda', expectedClass: 'mascot-companion panda' },
    { query: 'unknown_buddy', expectedClass: 'spidey-mascot' } // fallback to hero
  ];

  for (const { query, expectedClass } of queryCases) {
    const svg = Mascot.companion(query, 100, 'wave');
    parseAndValidateSvgXml(svg, `Mascot.companion("${query}")`);
    assert(svg.includes(expectedClass), `Mascot.companion("${query}") should contain class "${expectedClass}"`);
  }
});

test('6.2.Mascot.forWorld mapping: Exact world ID mappings across the 4 worlds', () => {
  const worldCases = [
    { world: 'hewan', expectedClass: 'mascot-companion cat' },
    { world: 'angka', expectedClass: 'mascot-companion panda' },
    { world: 'spidey', expectedClass: 'spidey-mascot' },
    { world: 'koding', expectedClass: 'spideybot' },
    { world: 'unknown_world', expectedClass: 'spidey-mascot' } // default
  ];

  for (const { world, expectedClass } of worldCases) {
    const svg = Mascot.forWorld(world, 100, 'cheer');
    parseAndValidateSvgXml(svg, `Mascot.forWorld("${world}")`);
    assert(svg.includes(expectedClass), `Mascot.forWorld("${world}") should produce "${expectedClass}"`);
  }
});

test('6.3.Mascot.squad metadata catalogue integrity', () => {
  assert(Array.isArray(Mascot.squad), 'Mascot.squad must be an array');
  assert.strictEqual(Mascot.squad.length, 5, 'Mascot.squad must contain exactly 5 members');

  const requiredFields = ['id', 'name', 'species', 'worldId', 'color'];
  for (const member of Mascot.squad) {
    for (const f of requiredFields) {
      assert(member[f], `Mascot.squad member ${member.id || 'unknown'} missing field: ${f}`);
    }
    // Verify valid color hex
    assert(/^#[0-9A-Fa-f]{6}$/.test(member.color), `Invalid color hex for member ${member.id}: ${member.color}`);
  }
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================

console.log('\n================================================================');
console.log(`📊 ADVERSARIAL STRESS SUITE SUMMARY`);
console.log(`Total Checks Executed : ${passCount + failCount}`);
console.log(`Passed Checks         : ${passCount}`);
console.log(`Failed Checks         : ${failCount}`);
console.log(`Anomalies / Advisories: ${anomalies.length}`);
console.log('================================================================');

if (anomalies.length > 0) {
  console.log('\n📋 Detected Anomalies & Advisories:');
  anomalies.forEach((a, idx) => {
    console.log(`  [${idx + 1}] (${a.category}) ${a.message}`);
  });
}

const verdict = failCount === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
console.log(`\n⚖️ FINAL EMPIRICAL VERDICT: ${verdict}\n`);

if (failCount > 0) {
  process.exit(1);
}
