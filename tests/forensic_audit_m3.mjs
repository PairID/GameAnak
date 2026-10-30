// tests/forensic_audit_m3.mjs - Independent Forensic Integrity Audit for Milestone 3
// (App Orchestration, Audio/TTS, Parental Gate & Certificate)
import fs from 'node:fs';
import assert from 'node:assert';

console.log('============================================================');
console.log('🔍 FORENSIC AUDIT SUITE — MILESTONE 3 (APP ORCHESTRATION)');
console.log('Verification of Authenticity, Randomness, Persistence & Security');
console.log('============================================================');

let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function report(name, pass, details = '') {
  if (pass) {
    passedChecks++;
    console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
  } else {
    failedChecks++;
    failures.push({ name, details });
    console.log(`[FAIL] ${name} ${details ? ': ' + details : ''}`);
  }
}

// ============================================================================
// PHASE 1: STATIC CODE ANALYSIS & PROHIBITED KEYWORDS IN app.js
// ============================================================================
console.log('\n--- PHASE 1: Static Code Analysis & Prohibited Keywords ---');

const appPath = 'app.js';
assert(fs.existsSync(appPath), 'app.js must exist');
const appCode = fs.readFileSync(appPath, 'utf8');

report('File Size Sanity', appCode.length > 5000 && appCode.split('\n').length >= 400, `${appCode.split('\n').length} lines, ${appCode.length} bytes`);

const prohibitedPatterns = [
  { term: 'TODO/FIXME', regex: /\b(TODO|FIXME)\b/i },
  { term: 'Mock/Stub Pattern', regex: /\b(mock|stub|dummy|fake|cheat|bypass)\b/i },
  { term: 'Test Mode Bypass Flag', regex: /\b(__test|isTest|test_mode|testMode|skipGate)\b/i },
  { term: 'Hardcoded Pass Return', regex: /return\s+true\s*;\s*\/\/\s*bypass/i },
  { term: 'Predefined Math Results Table', regex: /const\s+MATH_QUESTIONS\s*=/i },
  { term: 'Hardcoded Level Stars Constant', regex: /completedLevels\s*=\s*\{\s*["']H1["']\s*:\s*3/i }
];

for (const { term, regex } of prohibitedPatterns) {
  const match = appCode.match(regex);
  report(`Prohibited pattern check: ${term}`, match === null, match ? `Found "${match[0]}"` : 'Clean');
}

// Verify existence of core exports
report('Exports AppController class', /export\s+class\s+AppController\b/.test(appCode));
report('Exports ConfettiEffect class', /export\s+class\s+ConfettiEffect\b/.test(appCode));
report('Exports App singleton instance', /export\s+const\s+App\s*=\s*new\s+AppController\(/.test(appCode));

// Verify imports
report('Imports sound from audio.js', /import\s+\{\s*sound\s*\}\s+from\s+['"]\.\/audio\.js['"]/.test(appCode));
report('Imports Mascot from mascot.js', /import\s+\{\s*Mascot\s*\}\s+from\s+['"]\.\/mascot\.js['"]/.test(appCode));
report('Imports WORLDS & LEVELS from levels.js', /import\s+\{[^}]*WORLDS[^}]*LEVELS[^}]*\}\s+from\s+['"]\.\/levels\.js['"]/.test(appCode));
report('Imports Engines from engines.js', /import\s+\{\s*Engines\s*\}\s+from\s+['"]\.\/engines\.js['"]/.test(appCode));

// ============================================================================
// PHASE 2: BEHAVIORAL TESTING IN SYNTHETIC ISOMORPHIC DOM
// ============================================================================
console.log('\n--- PHASE 2: Dynamic Behavioral Verification ---');

// Setup mock DOM environment
class MockClassList {
  constructor() { this._set = new Set(); }
  add(...c) { c.forEach(x => x && x.split(/\s+/).filter(Boolean).forEach(i => this._set.add(i))); }
  remove(...c) { c.forEach(x => x && x.split(/\s+/).filter(Boolean).forEach(i => this._set.delete(i))); }
  contains(c) { return this._set.has(c); }
  toString() { return Array.from(this._set).join(' '); }
}

class MockElement {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this._classList = new MockClassList();
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = new Map();
    this._textContent = '';
    this._innerHTML = '';
    this.parentNode = null;
  }
  get className() { return this._classList.toString(); }
  set className(v) {
    this._classList = new MockClassList();
    if (v) v.split(/\s+/).filter(Boolean).forEach(c => this._classList.add(c));
  }
  get classList() { return this._classList; }
  get textContent() {
    if (this._textContent) return this._textContent;
    return this.children.map(c => c.textContent).join(' ');
  }
  set textContent(v) { this._textContent = String(v); this.children = []; }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    if (!html) return;
    const tagRegex = /<([a-z0-9-]+)([^>]*)>|<\/([a-z0-9-]+)>|([^<]+)/gi;
    let stack = [this];
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const [, openTag, attrs, closeTag, text] = match;
      if (openTag) {
        const el = new MockElement(openTag);
        if (attrs) {
          const attrRegex = /([a-z0-9_-]+)(?:=["']([^"']*)["'])?/gi;
          let amatch;
          while ((amatch = attrRegex.exec(attrs)) !== null) {
            el.setAttribute(amatch[1], amatch[2] || '');
          }
        }
        stack[stack.length - 1].appendChild(el);
        const isSelfClosing = (attrs && attrs.trim().endsWith('/')) || ['img', 'input', 'br', 'hr', 'source', 'line'].includes(openTag.toLowerCase());
        if (!isSelfClosing) stack.push(el);
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        if (stack.length > 0) stack[stack.length - 1]._textContent = text.trim();
      }
    }
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'id') this.id = String(v);
    if (k === 'class') this.className = String(v);
    if (k.startsWith('data-')) {
      const prop = k.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[prop] = String(v);
    }
  }
  getAttribute(k) { return this.attributes[k] ?? null; }
  appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
  addEventListener(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
  }
  removeEventListener(event, handler) {
    if (!this.listeners.has(event)) return;
    const arr = this.listeners.get(event);
    const idx = arr.indexOf(handler);
    if (idx !== -1) arr.splice(idx, 1);
  }
  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event.type;
    const evt = typeof event === 'string'
      ? { type, target: this, preventDefault: () => {} }
      : Object.assign({ preventDefault: () => {} }, event);
    if (typeof this[`on${type}`] === 'function') this[`on${type}`](evt);
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(h => h(evt));
    }
  }
  click() { this.dispatchEvent('click'); }
  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }
  querySelectorAll(sel) {
    const results = [];
    const walk = (node) => {
      for (const ch of node.children) {
        if (sel.startsWith('#') && ch.id === sel.slice(1)) results.push(ch);
        else if (sel.startsWith('.') && ch.classList.contains(sel.slice(1))) results.push(ch);
        else if (ch.tagName.toLowerCase() === sel.toLowerCase()) results.push(ch);
        walk(ch);
      }
    };
    walk(this);
    return results;
  }
}

const mockStorageMap = new Map();
const mockLocalStorage = {
  getItem: (k) => mockStorageMap.has(k) ? mockStorageMap.get(k) : null,
  setItem: (k, v) => mockStorageMap.set(k, String(v)),
  removeItem: (k) => mockStorageMap.delete(k),
  clear: () => mockStorageMap.clear(),
  get length() { return mockStorageMap.size; }
};

const domElements = new Map();
function getOrCreateElement(id, tag = 'div') {
  if (!domElements.has(id)) {
    const el = new MockElement(tag, id);
    domElements.set(id, el);
  }
  return domElements.get(id);
}

// Global window/document mocks
global.localStorage = mockLocalStorage;
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {},
  removeEventListener: () => {},
  print: () => { global.window._printed = true; }
};
global.document = {
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => new MockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  readyState: 'complete'
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Import app modules dynamically
const { AppController, ConfettiEffect } = await import('../app.js');
const { sound } = await import('../audio.js');
const { WORLDS, LEVELS } = await import('../levels.js');
const { Engines } = await import('../engines.js');

report('AppController imported successfully', typeof AppController === 'function');
report('ConfettiEffect imported successfully', typeof ConfettiEffect === 'function');

// ============================================================================
// PHASE 3: MATH GATE AUTHENTICITY & ENTROPY AUDIT
// ============================================================================
console.log('\n--- PHASE 3: Parental Gate Math Challenge Randomness & Entropy ---');

const controller = new AppController();

// Populate required DOM elements for parent modal
getOrCreateElement('modalParent');
getOrCreateElement('parentGateSection');
getOrCreateElement('parentDashboardSection');
getOrCreateElement('parentMathQuestion');
getOrCreateElement('parentMathChoices');
getOrCreateElement('inputChildName', 'input');
getOrCreateElement('worldRecapList');

const numTrials = 1000;
const generatedQuestions = new Set();
const generatedAnswers = [];
const slotDistribution = [0, 0, 0, 0, 0, 0];
let distinctChoiceCountPass = true;
let answerPresentInChoicesPass = true;

for (let i = 0; i < numTrials; i++) {
  controller.openParentalGateModal();
  const qText = getOrCreateElement('parentMathQuestion').textContent;
  const ans = controller.currentMathAnswer;
  generatedQuestions.add(qText);
  generatedAnswers.push(ans);

  // Parse a and b
  const match = qText.match(/Berapa\s+(\d+)\s*\+\s*(\d+)\?/);
  assert(match, `Question format must match: ${qText}`);
  const a = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);
  assert.strictEqual(a + b, ans, 'Generated answer must match arithmetic sum');
  assert(a >= 2 && a <= 9, `Operand a (${a}) must be in range 2..9`);
  assert(b >= 1 && b <= 8, `Operand b (${b}) must be in range 1..8`);

  const choiceContainer = getOrCreateElement('parentMathChoices');
  assert.strictEqual(choiceContainer.children.length, 6, 'Must generate exactly 6 choice buttons');

  const choiceValues = choiceContainer.children.map(c => parseInt(c.dataset.val, 10));
  const uniqueChoices = new Set(choiceValues);
  if (uniqueChoices.size !== 6) distinctChoiceCountPass = false;
  if (!uniqueChoices.has(ans)) answerPresentInChoicesPass = false;

  const ansIndex = choiceValues.indexOf(ans);
  if (ansIndex >= 0 && ansIndex < 6) {
    slotDistribution[ansIndex]++;
  }
}

report('Entropy: Unique math questions generated', generatedQuestions.size > 20, `${generatedQuestions.size} distinct questions in 1000 trials`);
report('Choices Authenticity: All 6 choices strictly unique across 1000 trials', distinctChoiceCountPass);
report('Choices Authenticity: Correct answer always included in options', answerPresentInChoicesPass);

// Verify shuffle randomness across slots: each slot should be chosen between 10% and 25% of the time (expected ~16.7%)
const minSlot = Math.min(...slotDistribution);
const maxSlot = Math.max(...slotDistribution);
console.log(`   Slot distribution across 6 positions: [${slotDistribution.join(', ')}]`);
report('Entropy: Correct answer position uniformly distributed across all 6 slots', minSlot > 80 && maxSlot < 300, `Min=${minSlot}, Max=${maxSlot} out of 1000`);

// Test math answer verification behavior
controller.openParentalGateModal();
const currentCorrect = controller.currentMathAnswer;
const wrongCandidate = currentCorrect === 5 ? 6 : 5;

// Wrong answer test
let gentleSoundPlayed = false;
sound.playGentleTryAgain = () => { gentleSoundPlayed = true; };
controller.handleMathChoice(wrongCandidate);

const gateSection = getOrCreateElement('parentGateSection');
const dashSection = getOrCreateElement('parentDashboardSection');
report('Security: Wrong answer does NOT reveal dashboard', dashSection.style.display !== 'flex');
report('Security: Wrong answer triggers non-punitive wobble', gateSection.classList.contains('wobble'));
report('Security: Wrong answer plays gentle prompt audio', gentleSoundPlayed);

// Correct answer test
let correctSoundPlayed = false;
sound.playCorrect = () => { correctSoundPlayed = true; };
controller.handleMathChoice(currentCorrect);

report('Access: Correct answer reveals parent dashboard', dashSection.style.display === 'flex');
report('Access: Correct answer hides gate question', gateSection.style.display === 'none');
report('Access: Correct answer plays success chime', correctSoundPlayed);
report('Recap: World recap list is populated genuinely', getOrCreateElement('worldRecapList').children.length === 4);

// ============================================================================
// PHASE 4: ZERO FABRICATION & LOCALSTORAGE PERSISTENCE INTEGRITY
// ============================================================================
console.log('\n--- PHASE 4: Zero Fabrication & LocalStorage Persistence ---');

mockStorageMap.clear();
const freshCtrl = new AppController();
freshCtrl.loadProgress();

report('Zero Fabrication: Initial state has 0 stars', freshCtrl.getTotalStars() === 0);
report('Zero Fabrication: Initial completed levels map is empty', freshCtrl.getCompletedLevelsCount() === 0);
report('Default Child Name is "Pahlawan Cilik"', freshCtrl.childName === 'Pahlawan Cilik');

// Simulate real level victory
const sampleLevel = LEVELS[0]; // e.g. H1
freshCtrl.handleVictory(sampleLevel);

report('Authentic Progress: Completing level H1 awards exactly 3 stars', freshCtrl.getTotalStars() === 3);
report('Authentic Progress: Exactly 1 level marked complete', freshCtrl.getCompletedLevelsCount() === 1);
report('Authentic Progress: Only H1 marked in completedLevels', freshCtrl.completedLevels[sampleLevel.id] === 3);

// Verify localStorage records
const storedLevels = JSON.parse(mockLocalStorage.getItem('spidey_completed_levels'));
const storedStars = parseInt(mockLocalStorage.getItem('spidey_stars'), 10);
const storedProgress = JSON.parse(mockLocalStorage.getItem('spidey_progress'));

report('Storage Authenticity: spidey_completed_levels contains exactly H1', Object.keys(storedLevels).length === 1 && storedLevels[sampleLevel.id] === 3);
report('Storage Authenticity: spidey_stars matches 3', storedStars === 3);
report('Storage Authenticity: spidey_progress structure matches runtime state', storedProgress.totalStars === 3 && storedProgress.completedLevels[sampleLevel.id] === 3);

// Idempotent replay: Replaying level H1 must NOT inflate stars
freshCtrl.isVictoryProcessing = false;
freshCtrl.handleVictory(sampleLevel);
report('Integrity: Replaying same level does NOT fabricate or duplicate stars', freshCtrl.getTotalStars() === 3);

// Completing a second distinct level
const level2 = LEVELS[1];
freshCtrl.isVictoryProcessing = false;
freshCtrl.handleVictory(level2);
report('Authentic Accumulation: Completing 2 levels gives 6 stars', freshCtrl.getTotalStars() === 6);
report('Authentic Accumulation: Completed levels count is 2', freshCtrl.getCompletedLevelsCount() === 2);

// Resilience to corrupted JSON (no fabrication of default progress)
mockLocalStorage.setItem('spidey_completed_levels', '{corrupted_json:::');
const recoveryCtrl = new AppController();
recoveryCtrl.loadProgress();
report('Resilience: Corrupted storage JSON resets cleanly to 0 stars without hallucinating fake levels', recoveryCtrl.getTotalStars() === 0 && recoveryCtrl.getCompletedLevelsCount() === 0);

// Reset progress verification
freshCtrl.resetProgress();
report('Reset: resetProgress clears completedLevels to 0', freshCtrl.getTotalStars() === 0);
report('Reset: Storage keys removed completely', mockLocalStorage.getItem('spidey_stars') === null && mockLocalStorage.getItem('spidey_completed_levels') === null);

// ============================================================================
// PHASE 5: APPLICATION ORCHESTRATION & STATE MACHINE INTEGRITY
// ============================================================================
console.log('\n--- PHASE 5: Application Orchestration & State Machine ---');

// Populate DOM elements needed for state machine
getOrCreateElement('viewWorlds');
getOrCreateElement('viewLevels');
getOrCreateElement('viewGame');
getOrCreateElement('btnHeaderBack');
getOrCreateElement('instructionBar');
getOrCreateElement('worldsGrid');
getOrCreateElement('levelsGrid');
getOrCreateElement('gameMount');
getOrCreateElement('gameLevelBadge');
getOrCreateElement('gameLevelTitle');
getOrCreateElement('promptText');
getOrCreateElement('mascotBubble');
getOrCreateElement('modalVictory');
getOrCreateElement('modalCertificate');
getOrCreateElement('certChildName');
getOrCreateElement('certTotalStars');
getOrCreateElement('certCompletedLevels');
getOrCreateElement('certIssueDate');
getOrCreateElement('certMascotLeft');
getOrCreateElement('certMascotRight');
getOrCreateElement('confettiCanvas', 'canvas');
getOrCreateElement('totalStarsCount');

const app = new AppController();
app.init();

report('Initial State: View is "worlds"', app.currentView === 'worlds');
report('Initial State: viewWorlds display is flex', getOrCreateElement('viewWorlds').style.display === 'flex');
report('Initial State: Back button is hidden', getOrCreateElement('btnHeaderBack').style.display === 'none');
report('Initial State: 4 World cards rendered in DOM', getOrCreateElement('worldsGrid').children.length === 4);

// Select World 'angka'
app.selectWorld('angka');
report('State Transition: View transitions to "levels"', app.currentView === 'levels');
report('State Transition: viewLevels display is flex', getOrCreateElement('viewLevels').style.display === 'flex');
report('State Transition: Back button becomes visible', getOrCreateElement('btnHeaderBack').style.display === 'flex');
const angkaLevelCards = getOrCreateElement('levelsGrid').children;
const expectedAngkaCount = LEVELS.filter(l => l.worldId === 'angka').length;
report('State Transition: Level cards match world count', angkaLevelCards.length === expectedAngkaCount, `${angkaLevelCards.length} cards`);

// Launch level A1
const angkaLevel = LEVELS.find(l => l.worldId === 'angka');
let engineRenderCalled = false;
let spokenText = '';
Engines.render = (mount, lvl, cb) => {
  engineRenderCalled = true;
  assert.strictEqual(lvl.id, angkaLevel.id);
  assert(typeof cb === 'function');
};
sound.speak = (txt, cb) => { spokenText = txt; if (cb) cb(); };

app.launchLevel(angkaLevel.id);
report('Gameplay Launch: View transitions to "game"', app.currentView === 'game');
report('Gameplay Launch: Engines.render invoked genuinely with mount and callback', engineRenderCalled);
report('Gameplay Launch: Prompt text displayed in DOM', getOrCreateElement('promptText').textContent === angkaLevel.prompt);
report('Gameplay Launch: TTS spokenText matches level prompt verbatim', spokenText === angkaLevel.prompt);

// Back button behavior
getOrCreateElement('btnHeaderBack').click();
report('Navigation: Back from Game returns to Levels', app.currentView === 'levels');

getOrCreateElement('btnHeaderBack').click();
report('Navigation: Back from Levels returns to Worlds', app.currentView === 'worlds');

// Championship Certificate Modal
app.childName = 'Arka Satria';
freshCtrl.completedLevels = { 'H1': 3, 'H2': 3 };
app.completedLevels = { 'H1': 3, 'H2': 3 };
app.openCertificateModal();

report('Certificate: Modal display is flex', getOrCreateElement('modalCertificate').style.display === 'flex');
report('Certificate: Child name populated correctly', getOrCreateElement('certChildName').textContent === 'Arka Satria');
report('Certificate: Total stars populated correctly (6)', getOrCreateElement('certTotalStars').textContent === '6');
report('Certificate: Completed levels count populated correctly (2)', getOrCreateElement('certCompletedLevels').textContent === '2');
report('Certificate: Issue date in Indonesian format', getOrCreateElement('certIssueDate').textContent.startsWith('Tanggal: '));

// Print certificate
global.window._printed = false;
const btnPrintCert = getOrCreateElement('btnPrintCert');
app.bindCertificateControls();
btnPrintCert.click();
report('Certificate: Print action invokes window.print()', global.window._printed === true);

// ============================================================================
// PHASE 6: CONFETTI SUBSYSTEM
// ============================================================================
console.log('\n--- PHASE 6: Confetti Subsystem Authenticity ---');
const canvasMock = {
  getContext: () => ({
    clearRect: () => {},
    save: () => {},
    translate: () => {},
    rotate: () => {},
    fillRect: () => {},
    restore: () => {}
  }),
  width: 800,
  height: 600
};
const confetti = new ConfettiEffect(canvasMock);
confetti.start(100);
report('Confetti: Initializes 75 particles with colors and velocities', confetti.particles.length === 75);
report('Confetti: Active status set to true', confetti.active === true);
confetti.stop();
report('Confetti: Stop cleanly deactivates animation', confetti.active === false && confetti.animId === null);

// ============================================================================
// AUDIT SUMMARY
// ============================================================================
console.log('\n============================================================');
console.log(`📊 FORENSIC AUDIT SUMMARY: ${passedChecks} / ${passedChecks + failedChecks} CHECKS PASSED`);
if (failedChecks === 0) {
  console.log('🌟 VERDICT: CLEAN — ZERO INTEGRITY VIOLATIONS DETECTED');
} else {
  console.log('🚨 VERDICT: INTEGRITY VIOLATION — REJECT WORK PRODUCT');
  console.log('Failures:', failures);
}
console.log('============================================================');

process.exit(failedChecks === 0 ? 0 : 1);
