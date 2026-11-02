// tests/test_reviewer_w5_m1_audit.mjs
// Independent Adversarial Review & Forensic Audit for World 5 Milestone 1
// Reviewer: Reviewer W5-M1.1
// Focus: Integrity, Anti-Cheating, Correctness of 4 Mini-Game Engines (pola, kode, beda, jumlah),
// Polymorphic Signatures, Exports & Aliases, Audio Synthesis, and Edge-Case Stress Testing.

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Robust synthetic DOM environment with stack-based HTML parser
class MockClassList {
  constructor() {
    this._set = new Set();
  }
  add(...classes) {
    classes.forEach(c => c && this._set.add(c));
  }
  remove(...classes) {
    classes.forEach(c => this._set.delete(c));
  }
  contains(c) {
    return this._set.has(c);
  }
  toString() {
    return Array.from(this._set).join(' ');
  }
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.classList = new MockClassList();
    this.children = [];
    this.parentElement = null;
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this._innerHTML = '';
    this._textContent = '';
    this.onclick = null;
    this.listeners = {};
  }

  get className() {
    return this.classList.toString();
  }
  set className(val) {
    this.classList = new MockClassList();
    if (val) val.split(/\s+/).forEach(c => c && this.classList.add(c));
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => c.textContent).join(' ');
  }
  set textContent(val) {
    this._textContent = String(val);
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'class') this.className = val;
    if (name === 'id') this.id = val;
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[key] = String(val);
    }
  }
  getAttribute(name) {
    return this.attributes[name] || null;
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  removeEventListener(type, fn) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== fn);
    }
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
    if (event.type === 'click' && typeof this.onclick === 'function') {
      this.onclick(event);
    }
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentElement = null;
    }
    return child;
  }
  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  contains(el) {
    let cur = el;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  getBoundingClientRect() {
    return { left: 10, top: 10, right: 100, bottom: 100, width: 90, height: 90 };
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      let match = false;
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (el.id === id || el.getAttribute('id') === id) match = true;
      } else if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        if (el.classList.contains(cls)) match = true;
      } else if (selector.startsWith('[data-')) {
        const m = selector.match(/\[data-([a-zA-Z0-9_-]+)(?:="([^"]+)")?\]/);
        if (m) {
          const key = m[1].replace(/-([a-z])/g, (_, l) => l.toUpperCase());
          if (m[2] !== undefined) {
            if (String(el.dataset[key]) === m[2]) match = true;
          } else {
            if (el.dataset[key] !== undefined) match = true;
          }
        }
      } else {
        if (el.tagName.toLowerCase() === selector.toLowerCase()) match = true;
      }

      if (match && el !== this) results.push(el);
      el.children.forEach(check);
    };

    this.children.forEach(check);
    return results;
  }

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
        const isSelfClosing = (attrs && attrs.trim().endsWith('/')) ||
          ['img', 'input', 'br', 'hr', 'source', 'line', 'circle', 'path', 'polygon', 'ellipse', 'rect'].includes(openTag.toLowerCase());
        if (!isSelfClosing) {
          stack.push(el);
        }
      } else if (closeTag) {
        if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
          stack.pop();
        }
      } else if (text && text.trim()) {
        if (stack.length > 0) {
          stack[stack.length - 1].textContent = text.trim();
        }
      }
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

// Global window mock
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};
global.document = {
  createElement: (tag) => new MockElement(tag),
  createElementNS: (ns, tag) => new MockElement(tag),
  elementFromPoint: () => null,
  body: new MockElement('body')
};

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
  console.log('🔍 REVIEWER W5-M1.1 INDEPENDENT AUDIT & ADVERSARIAL STRESS TEST');
  console.log('============================================================\n');

  const { Engines } = await import('../engines.js');
  const { sound } = await import('../audio.js');

  // --------------------------------------------------------------------------
  // SUITE 1: INTEGRITY & ZERO-FABRICATION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('[Suite 1: Integrity, Anti-Cheating & Source Hygiene]');

  check('1.1 Zero hardcoded level.id branches in engines.js', () => {
    const rawCode = fs.readFileSync(path.join(ROOT_DIR, 'engines.js'), 'utf8');
    assert(!/level\.id\s*===/.test(rawCode), 'engines.js must not contain hardcoded level.id checks');
    assert(!/test_/.test(rawCode), 'engines.js must not contain test-specific branching');
    assert(!rawCode.includes('// dummy'), 'engines.js must not contain dummy markers');
    assert(!rawCode.includes('// mock'), 'engines.js must not contain mock markers');
    assert(!rawCode.includes('// stub'), 'engines.js must not contain stub markers');
  });

  check('1.2 Zero hardcoded level branches in audio.js', () => {
    const rawAudio = fs.readFileSync(path.join(ROOT_DIR, 'audio.js'), 'utf8');
    assert(!rawAudio.includes('// dummy'), 'audio.js must not contain dummy markers');
    assert(!rawAudio.includes('// stub'), 'audio.js must not contain stub markers');
    assert(!rawAudio.includes('TODO'), 'audio.js must not contain unresolved TODO markers');
  });

  // --------------------------------------------------------------------------
  // SUITE 2: ENGINE 'POLA' (Complete the Pattern / Cognitive Sequencing)
  // --------------------------------------------------------------------------
  console.log('\n[Suite 2: Engine "pola" Verification & Stress Test]');

  check('2.1 Pola: Renders sequence train, drop slot ❓, and option buttons', () => {
    const container = new MockElement('div');
    const level = {
      type: 'pola',
      sequence: ['🍎', '🍌', '🍎', '❓'],
      answer: '🍌',
      options: ['🍎', '🍌', '🍇']
    };
    Engines.renderPola(container, level, () => {});

    const missing = container.querySelector('#missingSlot');
    assert(missing, 'Missing slot #missingSlot must be rendered');
    assert.strictEqual(missing.dataset.expected, '🍌', 'Drop slot must expect correct answer');

    const optsTray = container.querySelector('#patternOptionsTray');
    assert(optsTray, 'Pattern options tray #patternOptionsTray must exist');
    assert.strictEqual(optsTray.children.length, 3, 'Must render exactly 3 option buttons');
  });

  check('2.2 Pola: Correct tap triggers onComplete and advances', (done) => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'pola',
      sequence: ['⭐', '🌙', '⭐', '❓'],
      answer: '🌙',
      options: ['⭐', '🌙']
    };
    Engines.renderPola(container, level, () => {
      completed = true;
    });

    const optsTray = container.querySelector('#patternOptionsTray');
    const correctBtn = optsTray.children.find(b => String(b.dataset.val) === '🌙');
    assert(correctBtn, 'Correct option button must exist');

    // Simulate click
    correctBtn.onclick();
    assert(correctBtn.classList.contains('correct'), 'Button must receive .correct class');

    // Fast-forward timeout
    setTimeout(() => {
      assert(completed, 'onComplete callback must be called on pattern solve');
    }, 850);
  });

  check('2.3 Pola: Wrong tap triggers gentle try-again without finishing', () => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'pola',
      sequence: ['🔺', '🟦', '🔺', '❓'],
      answer: '🟦',
      options: ['🔺', '🟦']
    };
    Engines.renderPola(container, level, () => { completed = true; });

    const optsTray = container.querySelector('#patternOptionsTray');
    const wrongBtn = optsTray.children.find(b => String(b.dataset.val) === '🔺');
    wrongBtn.onclick();

    assert(wrongBtn.classList.contains('shake'), 'Wrong button must receive .shake class');
    assert(!completed, 'Wrong choice must not trigger onComplete');
  });

  check('2.4 Pola: Multi-step pattern progression', (done) => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'pola',
      items: [
        { sequence: ['1', '2', '❓'], answer: '3', options: ['3', '4'] },
        { sequence: ['A', 'B', '❓'], answer: 'C', options: ['C', 'D'] }
      ]
    };
    Engines.renderPola(container, level, () => { completed = true; });

    // Step 1
    let optsTray = container.querySelector('#patternOptionsTray');
    let btn = optsTray.children.find(b => String(b.dataset.val) === '3');
    btn.onclick();

    setTimeout(() => {
      // Step 2
      optsTray = container.querySelector('#patternOptionsTray');
      btn = optsTray.children.find(b => String(b.dataset.val) === 'C');
      btn.onclick();

      setTimeout(() => {
        assert(completed, 'Multi-step pattern must complete all steps and call onComplete');
      }, 850);
    }, 850);
  });

  // --------------------------------------------------------------------------
  // SUITE 3: ENGINE 'KODE' (Crack the Code / Symbol Cipher)
  // --------------------------------------------------------------------------
  console.log('\n[Suite 3: Engine "kode" Verification & Stress Test]');

  check('3.1 Kode: Renders legend badges, challenge row, and number keypad', () => {
    const container = new MockElement('div');
    const level = {
      type: 'kode',
      cipherKey: [
        { symbol: '🐱', value: '1' },
        { symbol: '🐶', value: '2' },
        { symbol: '🐰', value: '3' }
      ],
      code: ['🐱', '🐰', '🐶'],
      secretReward: 'Harta Karun 💎',
      rewardEmoji: '💎'
    };
    Engines.renderKode(container, level, () => {});

    const legend = container.querySelector('.cipher-legend-bar');
    assert(legend, 'Cipher legend bar must be rendered');

    const row = container.querySelector('#codeChallengeRow');
    assert(row, 'Code challenge row #codeChallengeRow must exist');
    assert.strictEqual(row.children.length, 3, 'Must render 3 code slots');

    const keypad = container.querySelector('#kodeKeypad');
    assert(keypad, 'Keypad #kodeKeypad must exist');
    assert(keypad.children.length >= 4, 'Keypad must render digits 1, 2, 3 and backspace');
  });

  check('3.2 Kode: Keypad click decodes slot and reveals reward on completion', (done) => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'kode',
      cipherKey: [
        { symbol: '🔴', value: '4' },
        { symbol: '🔵', value: '7' }
      ],
      code: ['🔴', '🔵'],
      secretReward: 'Bintang Emas ⭐',
      rewardEmoji: '⭐'
    };
    Engines.renderKode(container, level, () => { completed = true; });

    const keypad = container.querySelector('#kodeKeypad');
    const btn4 = keypad.children.find(b => String(b.dataset.val) === '4');
    const btn7 = keypad.children.find(b => String(b.dataset.val) === '7');

    // Click '4' for slot 0
    btn4.onclick();
    const slot0 = container.querySelector('#codeSlot0');
    assert.strictEqual(slot0.textContent, '4', 'Slot 0 must be filled with 4');

    // Click '7' for slot 1
    btn7.onclick();
    const slot1 = container.querySelector('#codeSlot1');
    assert.strictEqual(slot1.textContent, '7', 'Slot 1 must be filled with 7');

    const overlay = container.querySelector('#secretRewardOverlay');
    assert(overlay && overlay.style.display === 'flex', 'Reward overlay must be displayed flex on completion');

    setTimeout(() => {
      assert(completed, 'onComplete must be called after secret code solved');
    }, 1500);
  });

  check('3.3 Kode: Backspace button clears active slot in multi-char code', () => {
    const container = new MockElement('div');
    const level = {
      type: 'kode',
      cipherKey: [
        { symbol: 'A', value: '1' },
        { symbol: 'B', value: '2' }
      ],
      code: ['A', 'B']
    };
    Engines.renderKode(container, level, () => {});

    const keypad = container.querySelector('#kodeKeypad');
    const btn1 = keypad.children.find(b => String(b.dataset.val) === '1');
    const backspace = keypad.children.find(b => b.classList.contains('keypad-backspace'));

    // Fill slot 0
    btn1.onclick();
    assert.strictEqual(container.querySelector('#codeSlot0').textContent, '1');

    // Click slot 0 to re-focus it
    const col0 = container.querySelector('.code-col');
    col0.onclick();

    // Backspace
    backspace.onclick();
    assert.strictEqual(container.querySelector('#codeSlot0').textContent, '_', 'Backspace must clear slot 0 to _');
  });

  // --------------------------------------------------------------------------
  // SUITE 4: ENGINE 'BEDA' (Visual Discrimination / Odd-One-Out)
  // --------------------------------------------------------------------------
  console.log('\n[Suite 4: Engine "beda" Verification & Stress Test]');

  check('4.1 Beda: Renders tactile cards grid and rotation styling', () => {
    const container = new MockElement('div');
    const level = {
      type: 'beda',
      question: 'Cari yang terbalik!',
      options: [
        { label: '🚀', rotation: 0 },
        { label: '🚀', rotation: 0 },
        { label: '🚀', rotation: 180, isDifferent: true },
        { label: '🚀', rotation: 0 }
      ],
      answerIndex: 2
    };
    Engines.renderBeda(container, level, () => {});

    const grid = container.querySelector('#bedaGrid');
    assert(grid, 'Grid #bedaGrid must exist');
    assert.strictEqual(grid.children.length, 4, 'Must render 4 cards');
    assert(grid.children[2].innerHTML.includes('rotate(180deg)'), 'Rotated card must have rotation transform style');
  });

  check('4.2 Beda: Correct card adds glow-spot and finishes', (done) => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'beda',
      options: ['🍎', '🍎', '🍐', '🍎'],
      answerIndex: 2
    };
    Engines.renderBeda(container, level, () => { completed = true; });

    const grid = container.querySelector('#bedaGrid');
    const correctCard = grid.children[2];
    correctCard.onclick();

    assert(correctCard.classList.contains('glow-spot'), 'Correct card must receive glow-spot');

    setTimeout(() => {
      assert(completed, 'onComplete must be called after correct odd-one-out pick');
    }, 750);
  });

  check('4.3 Beda: Wrong card triggers shake without finish', () => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'beda',
      options: ['🐱', '🐶', '🐱', '🐱'],
      answerIndex: 1
    };
    Engines.renderBeda(container, level, () => { completed = true; });

    const grid = container.querySelector('#bedaGrid');
    const wrongCard = grid.children[0];
    wrongCard.onclick();

    assert(wrongCard.classList.contains('shake'), 'Wrong card must receive .shake');
    assert(!completed, 'Wrong card must not complete level');
  });

  // --------------------------------------------------------------------------
  // SUITE 5: ENGINE 'JUMLAH' (Visual Math & Balance)
  // --------------------------------------------------------------------------
  console.log('\n[Suite 5: Engine "jumlah" Verification & Stress Test]');

  check('5.1 Jumlah: Balance mode renders tilting beam, fruit clusters and touch pans', () => {
    const container = new MockElement('div');
    const level = {
      type: 'jumlah',
      mode: 'balance',
      leftGroup: { item: '🍎', count: 4 },
      rightGroup: { item: '🍎', count: 2 },
      target: 'left'
    };
    Engines.renderJumlah(container, level, () => {});

    const svg = container.querySelector('.balance-svg');
    assert(svg, 'Balance SVG must be rendered');
    assert(container.innerHTML.includes('rotate('), 'SVG must include rotation transform for crossbeam');

    const panLeft = container.querySelector('#panLeft');
    const panRight = container.querySelector('#panRight');
    assert(panLeft && panRight, 'Both pan touch zones must exist');

    const leftFruits = panLeft.querySelectorAll('.pan-fruit-item');
    assert.strictEqual(leftFruits.length, 4, 'Pan left must render exactly 4 fruits');
  });

  check('5.2 Jumlah: Balance mode correct selection triggers win', (done) => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'jumlah',
      mode: 'balance',
      leftGroup: { item: '🍊', count: 2 },
      rightGroup: { item: '🍊', count: 5 },
      target: 'right'
    };
    Engines.renderJumlah(container, level, () => { completed = true; });

    const panRight = container.querySelector('#panRight');
    panRight.onclick();

    setTimeout(() => {
      assert(completed, 'Tapping heavier pan must trigger onComplete');
    }, 850);
  });

  check('5.3 Jumlah: Addition mode renders baskets and handles number choice', (done) => {
    const container = new MockElement('div');
    let completed = false;
    const level = {
      type: 'jumlah',
      mode: 'addition',
      leftGroup: { item: '🍓', count: 3 },
      rightGroup: { item: '🍓', count: 2 },
      answer: 5,
      options: [4, 5, 6]
    };
    Engines.renderJumlah(container, level, () => { completed = true; });

    const optTray = container.querySelector('#mathOptionsTray');
    assert(optTray, 'Math options tray must exist');
    assert.strictEqual(optTray.children.length, 3, 'Must render 3 number choice buttons');

    const correctBtn = optTray.children.find(b => String(b.dataset.val) === '5');
    assert(correctBtn, 'Button for 5 must exist');
    correctBtn.onclick();

    const resultBasket = container.querySelector('#resultBasket');
    assert(resultBasket.classList.contains('correct'), 'Result basket must be marked correct');

    setTimeout(() => {
      assert(completed, 'Addition mode must call onComplete after correct number');
    }, 850);
  });

  // --------------------------------------------------------------------------
  // SUITE 6: POLYMORPHIC DISPATCHER & EXPORTS
  // --------------------------------------------------------------------------
  console.log('\n[Suite 6: Polymorphic Dispatcher & Export Invariants]');

  check('6.1 Polymorphic Engines.render: supports (container, level, onComplete)', () => {
    const container = new MockElement('div');
    let called = false;
    Engines.render(container, { type: 'pola', sequence: ['A', '❓'], answer: 'B', options: ['B'] }, () => {
      called = true;
    });
    assert(container.querySelector('#missingSlot'), 'Rendered pola via (container, level, onComplete)');
  });

  check('6.2 Polymorphic Engines.render: supports (level, container, onWin, onFail)', () => {
    const container = new MockElement('div');
    let called = false;
    Engines.render({ type: 'kode', code: ['🕷️'], cipherKey: [{ symbol: '🕷️', value: '1' }] }, container, () => {
      called = true;
    });
    assert(container.querySelector('#kodeKeypad'), 'Rendered kode via (level, container, onWin)');
  });

  check('6.3 Explicit method exports and legacy aliases preserved', () => {
    assert(typeof Engines.renderPola === 'function', 'Engines.renderPola must be function');
    assert(typeof Engines.renderKode === 'function', 'Engines.renderKode must be function');
    assert(typeof Engines.renderBeda === 'function', 'Engines.renderBeda must be function');
    assert(typeof Engines.renderJumlah === 'function', 'Engines.renderJumlah must be function');
    assert(typeof Engines.renderTitik === 'function', 'Engines.renderTitik alias preserved');
    assert(typeof Engines.renderPanah === 'function', 'Engines.renderPanah alias preserved');
    assert.strictEqual(Engines.renderTitik, Engines.renderHubungkanTitik, 'renderTitik must equal renderHubungkanTitik');
    assert.strictEqual(Engines.renderPanah, Engines.renderKodingPanah, 'renderPanah must equal renderKodingPanah');
  });

  // --------------------------------------------------------------------------
  // SUITE 7: PROCEDURAL WEB AUDIO FOUNDATION
  // --------------------------------------------------------------------------
  console.log('\n[Suite 7: Procedural Web Audio Synthesis Foundation]');

  check('7.1 Audio methods exist and run safely in Node.js headless environment', () => {
    assert(typeof sound.playSnap === 'function', 'sound.playSnap exists');
    assert(typeof sound.playCipherClick === 'function', 'sound.playCipherClick exists');
    assert(typeof sound.playScaleTilt === 'function', 'sound.playScaleTilt exists');
    assert(typeof sound.playFlourish === 'function', 'sound.playFlourish exists');

    // Execute headless
    sound.playSnap();
    sound.playCipherClick();
    sound.playScaleTilt();
    sound.playFlourish();
  });

  check('7.2 Audio mute toggle respects sfxEnabled', () => {
    sound.sfxEnabled = false;
    sound.playSnap();
    sound.playCipherClick();
    sound.playScaleTilt();
    sound.playFlourish();
    sound.sfxEnabled = true;
  });

  // --------------------------------------------------------------------------
  // SUITE 8: ADVERSARIAL STRESS & CORNER CASES
  // --------------------------------------------------------------------------
  console.log('\n[Suite 8: Adversarial Stress & Corner Cases]');

  check('8.1 Empty items/code array safely calls onComplete without crash', () => {
    let polaCompleted = false;
    Engines.renderPola(new MockElement('div'), { type: 'pola', items: [] }, () => { polaCompleted = true; });
    assert(polaCompleted, 'Pola with empty items must immediately call onComplete');

    let kodeCompleted = false;
    Engines.renderKode(new MockElement('div'), { type: 'kode', code: [] }, () => { kodeCompleted = true; });
    assert(kodeCompleted, 'Kode with empty code must immediately call onComplete');

    let bedaCompleted = false;
    Engines.renderBeda(new MockElement('div'), { type: 'beda', items: [] }, () => { bedaCompleted = true; });
    assert(bedaCompleted, 'Beda with empty items must immediately call onComplete');
  });

  check('8.2 Idempotency: Rapid duplicate clicks do not corrupt state or trigger multiple onCompletes', () => {
    const container = new MockElement('div');
    let winCount = 0;
    const level = {
      type: 'beda',
      options: ['A', 'B', 'A'],
      answerIndex: 1
    };
    Engines.renderBeda(container, level, () => { winCount++; });

    const card = container.querySelector('#bedaGrid').children[1];
    card.onclick();
    card.onclick();
    card.onclick();

    setTimeout(() => {
      assert.strictEqual(winCount, 1, 'Only exactly 1 win callback must fire despite triple click');
    }, 750);
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  setTimeout(() => {
    console.log('\n============================================================');
    console.log('📊 AUDIT EXECUTION SUMMARY');
    console.log('============================================================');
    console.log(`Total Checks:   ${totalChecks}`);
    console.log(`Passed:         ${passedChecks}`);
    console.log(`Failed:         ${failedChecks}`);
    console.log('============================================================\n');

    if (failedChecks > 0) {
      console.error(`✖ AUDIT FAILED with ${failedChecks} errors.`);
      process.exit(1);
    } else {
      console.log('✔ ALL AUDIT VERIFICATION CHECKS PASSED PERFECTLY (Exit 0)!');
      process.exit(0);
    }
  }, 2000);
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
