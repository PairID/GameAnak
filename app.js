// app.js - Core Single Page Application Controller for Petualangan Spidey Cilik
// Manages navigation, audio/TTS narration, victory celebration, parental gate,
// resilient localStorage persistence, and championship certificate.

import { sound } from './audio.js';
import { Mascot } from './mascot.js';
import { WORLDS, LEVELS } from './levels.js';
import { Engines } from './engines.js';

// ============================================================================
// 1. LIGHTWEIGHT CONFETTI PARTICLE SYSTEM
// ============================================================================
export class ConfettiEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    this.active = false;
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 800;
    this.canvas.height = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 600;
  }

  start(durationMs = 3800) {
    if (!this.canvas || !this.ctx) return;
    this.stop();
    this.active = true;
    this.resize();

    const colors = ['#EF4444', '#2563EB', '#FBBF24', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'];
    const shapes = ['star', 'ribbon', 'glint', 'disc'];
    const count = 95;
    const cw = this.canvas.width || 800;
    const ch = this.canvas.height || 600;

    this.particles = Array.from({ length: count }, (_, idx) => {
      const isFirework = idx < 65; // 65 particles launched in explosive radial burst
      const angle = isFirework
        ? (Math.PI * 1.05) + Math.random() * (Math.PI * 0.9)
        : Math.random() * Math.PI * 2;
      const speed = isFirework ? (Math.random() * 9 + 4) : (Math.random() * 3 + 1);

      return {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        x: isFirework ? (cw * 0.5 + (Math.random() - 0.5) * 80) : (Math.random() * cw),
        y: isFirework ? (ch * 0.55 + (Math.random() - 0.5) * 60) : ((Math.random() * -ch * 0.3) - 20),
        size: Math.random() * 8 + 6,
        w: Math.random() * 10 + 6,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: isFirework ? (Math.sin(angle) * speed - 2.5) : (Math.random() * 2.5 + 2),
        gravity: 0.16,
        drag: 0.986,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 9,
        wobble: Math.random() * Math.PI * 2,
        vWobble: Math.random() * 0.12 + 0.05
      };
    });

    const startTime = Date.now();
    const step = () => {
      if (!this.active) return;
      if (this.ctx && typeof this.ctx.clearRect === 'function') {
        this.ctx.clearRect(0, 0, this.canvas.width || 800, this.canvas.height || 600);
      }

      for (const p of this.particles) {
        p.vx *= p.drag;
        p.vy = (p.vy + p.gravity) * p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.wobble += p.vWobble;

        if (p.y > (this.canvas.height || 600) + 25) {
          p.y = -20;
          p.x = Math.random() * (this.canvas.width || 800);
          p.vy = Math.random() * 2.5 + 1.5;
        }

        if (this.ctx.save) this.ctx.save();
        if (this.ctx.translate) this.ctx.translate(p.x, p.y);
        if (this.ctx.rotate) this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          if (this.ctx.beginPath && this.ctx.moveTo && this.ctx.lineTo && this.ctx.fill) {
            this.ctx.beginPath();
            const spikes = 5;
            const outerR = p.size;
            const innerR = p.size * 0.45;
            let rot = (Math.PI / 2) * 3;
            const stepAngle = Math.PI / spikes;
            this.ctx.moveTo(0, -outerR);
            for (let i = 0; i < spikes; i++) {
              this.ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
              rot += stepAngle;
              this.ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
              rot += stepAngle;
            }
            if (this.ctx.closePath) this.ctx.closePath();
            this.ctx.fill();
          } else if (this.ctx.fillRect) {
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
        } else if (p.shape === 'glint') {
          if (this.ctx.beginPath && this.ctx.moveTo && this.ctx.lineTo && this.ctx.fill) {
            this.ctx.beginPath();
            const r = p.size * 1.1;
            const ir = p.size * 0.28;
            this.ctx.moveTo(0, -r);
            this.ctx.lineTo(ir, -ir);
            this.ctx.lineTo(r, 0);
            this.ctx.lineTo(ir, ir);
            this.ctx.lineTo(0, r);
            this.ctx.lineTo(-ir, ir);
            this.ctx.lineTo(-r, 0);
            this.ctx.lineTo(-ir, -ir);
            if (this.ctx.closePath) this.ctx.closePath();
            this.ctx.fill();
          } else if (this.ctx.fillRect) {
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
        } else if (p.shape === 'disc') {
          if (this.ctx.beginPath && this.ctx.arc && this.ctx.fill) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (this.ctx.fillRect) {
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
        } else {
          // 3D tumbling ribbon
          const scaleX = Math.cos(p.wobble);
          const rw = p.w * scaleX;
          if (this.ctx.fillRect) {
            this.ctx.fillRect(-rw / 2, -p.h / 2, rw, p.h);
          }
        }

        if (this.ctx.restore) this.ctx.restore();
      }

      if (Date.now() - startTime < durationMs) {
        if (typeof requestAnimationFrame === 'function') {
          this.animId = requestAnimationFrame(step);
        }
      } else {
        this.stop();
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      this.animId = requestAnimationFrame(step);
    }
  }

  stop() {
    this.active = false;
    if (this.animId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas && typeof this.ctx.clearRect === 'function') {
      this.ctx.clearRect(0, 0, this.canvas.width || 800, this.canvas.height || 600);
    }
  }
}

// ============================================================================
// 2. MAIN APPLICATION CONTROLLER
// ============================================================================
export class AppController {
  constructor() {
    // Current navigation state: 'worlds' | 'levels' | 'game'
    this.currentView = 'worlds';
    this.activeWorldId = null;
    this.currentLevel = null;
    this.isVictoryProcessing = false;

    // LocalStorage fallback cache
    this.completedLevels = {};
    this.childName = 'Pahlawan Cilik';

    // Hold timer references for parent gate
    this.holdTimer = null;
    this.holdInterval = null;
    this.holdStartTime = null;
    this.holdDurationMs = 2000;

    // Current Math challenge answer
    this.currentMathAnswer = null;

    // Confetti instance
    this.confetti = null;
    this.audioUnlocked = false;

    // Mascot & Victory reaction timers
    this.mascotRevertTimeout = null;
    this.victoryTimeouts = [];
  }

  // Safe LocalStorage helpers with graceful fallback
  safeStorageGet(key, fallback = null) {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallback;
      }
    } catch (e) {
      console.warn(`[Storage] Read failed for key "${key}":`, e);
    }
    return fallback;
  }

  safeStorageSet(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[Storage] Write failed for key "${key}":`, e);
    }
  }

  safeStorageRemove(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[Storage] Remove failed for key "${key}":`, e);
    }
  }

  loadProgress() {
    // 1. Child name
    const storedName = this.safeStorageGet('spidey_child_name') || this.safeStorageGet('child_name');
    if (storedName && typeof storedName === 'string') {
      this.childName = storedName.trim();
    }

    // 2. Completed levels map
    const storedMap = this.safeStorageGet('spidey_completed_levels');
    if (storedMap) {
      try {
        const parsed = JSON.parse(storedMap);
        if (parsed && typeof parsed === 'object') {
          this.completedLevels = parsed;
        }
      } catch (e) {
        console.warn('[Storage] Corrupt completed levels JSON, resetting to empty:', e);
        this.completedLevels = {};
      }
    } else {
      // Check legacy/cross-tier spidey_progress
      const legacyProgress = this.safeStorageGet('spidey_progress');
      if (legacyProgress) {
        try {
          const parsed = JSON.parse(legacyProgress);
          if (parsed && parsed.completedLevels) {
            this.completedLevels = parsed.completedLevels;
          }
        } catch {
          this.completedLevels = {};
        }
      }
    }
  }

  saveProgress() {
    this.safeStorageSet('spidey_child_name', this.childName);
    this.safeStorageSet('child_name', this.childName);

    const mapJson = JSON.stringify(this.completedLevels);
    this.safeStorageSet('spidey_completed_levels', mapJson);

    const totalStars = this.getTotalStars();
    this.safeStorageSet('spidey_stars', String(totalStars));
    this.safeStorageSet('stars_total', String(totalStars));

    const progressObj = {
      completedLevels: this.completedLevels,
      totalStars
    };
    this.safeStorageSet('spidey_progress', JSON.stringify(progressObj));
  }

  getTotalStars() {
    return Object.values(this.completedLevels).reduce((sum, stars) => sum + (Number(stars) || 0), 0);
  }

  getCompletedLevelsCount() {
    return Object.keys(this.completedLevels).length;
  }

  // Indonesian formatted date helper
  getFormattedDate() {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date();
    return `Tanggal: ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  init() {
    if (typeof document === 'undefined') return;

    this.loadProgress();

    // Initialize Confetti Canvas
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
      this.confetti = new ConfettiEffect(canvas);
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => this.confetti && this.confetti.resize());
      }
    }

    // Attach User Gesture Unlock for Web Audio API
    this.attachAudioUnlock();

    // Bind Navigation & UI Handlers
    this.bindHeaderControls();
    this.bindParentGateControls();
    this.bindCertificateControls();
    this.bindVictoryControls();
    this.bindSpeechInstructionBar();

    // Initial Render
    this.updateStarDisplay(false);
    this.renderWelcomeBanner();
    this.renderWorldsGrid();
    this.showWorldsView();

    // Listen for Mascot Emotion Bus Events
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('mascot-react', (e) => {
        this.reactMascot(e.detail?.emotion || 'cheer', e.detail?.text || 'Hebat!', e.detail?.durationMs);
      });
    }
  }

  // Dynamic Reactive Mascot Emotion Bus
  reactMascot(emotion = 'cheer', speechText = 'Hebat!', durationMs = 1500) {
    if (typeof document === 'undefined') return;
    const mascotBubble = document.getElementById('mascotBubble');
    if (!mascotBubble) return;

    if (this.mascotRevertTimeout) {
      clearTimeout(this.mascotRevertTimeout);
      this.mascotRevertTimeout = null;
    }

    const currentWorld = this.activeWorldId;
    const mascotSvg = (typeof Mascot.forWorld === 'function' && currentWorld)
      ? Mascot.forWorld(currentWorld, 72, emotion)
      : Mascot.hero(72, emotion);

    mascotBubble.innerHTML = `
      <div class="mascot-reactive-wrap" style="position:relative; width:72px; height:72px; display:flex; align-items:center; justify-content:center; animation:mascotPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);">
        ${mascotSvg}
        <div class="mascot-reaction-bubble" style="position:absolute; top:-28px; left:50%; transform:translateX(-50%); background:#FFFFFF; border:2.5px solid #1E293B; border-radius:14px; padding:3px 10px; font-size:0.85rem; font-weight:800; color:#1E293B; white-space:nowrap; box-shadow:0 3px 0 #1E293B; pointer-events:none; z-index:20; animation:bubblePopIn 0.3s ease-out;">
          ${speechText || 'Hebat! ⭐'}
        </div>
      </div>
    `;

    this.mascotRevertTimeout = setTimeout(() => {
      const idleSvg = (typeof Mascot.forWorld === 'function' && currentWorld)
        ? Mascot.forWorld(currentWorld, 72, 'happy')
        : Mascot.hero(72, 'happy');
      mascotBubble.innerHTML = idleSvg;
      this.mascotRevertTimeout = null;
    }, durationMs);
  }

  attachAudioUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (!this.audioUnlocked) {
        this.audioUnlocked = true;
        sound.init();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('click', unlock, { once: true });
  }

  updateStarDisplay(animate = false) {
    const totalEl = document.getElementById('totalStarsCount');
    const pillEl = document.getElementById('starCounter');
    const totalStars = this.getTotalStars();

    if (totalEl) {
      totalEl.textContent = String(totalStars);
    }

    if (animate && pillEl) {
      pillEl.classList.remove('shake');
      void pillEl.offsetWidth; // trigger reflow
      pillEl.classList.add('shake');
    }
  }

  // ==========================================================================
  // VIEW NAVIGATION & RENDERING
  // ==========================================================================
  showWorldsView() {
    this.currentView = 'worlds';
    sound.stopSpeech();

    const viewWorlds = document.getElementById('viewWorlds');
    const viewLevels = document.getElementById('viewLevels');
    const viewGame = document.getElementById('viewGame');
    const btnBack = document.getElementById('btnHeaderBack');
    const instructionBar = document.getElementById('instructionBar');

    if (viewWorlds) {
      viewWorlds.style.display = 'flex';
      viewWorlds.classList.add('active');
    }
    if (viewLevels) {
      viewLevels.style.display = 'none';
      viewLevels.classList.remove('active');
    }
    if (viewGame) {
      viewGame.style.display = 'none';
      viewGame.classList.remove('active');
    }
    if (btnBack) {
      btnBack.style.display = 'none';
    }
    if (instructionBar) {
      instructionBar.style.display = 'none';
    }

    this.renderWorldsGrid();
  }

  showLevelsView(worldId = null) {
    this.currentView = 'levels';
    sound.stopSpeech();

    if (worldId) {
      this.activeWorldId = worldId;
    }

    const viewWorlds = document.getElementById('viewWorlds');
    const viewLevels = document.getElementById('viewLevels');
    const viewGame = document.getElementById('viewGame');
    const btnBack = document.getElementById('btnHeaderBack');
    const instructionBar = document.getElementById('instructionBar');

    if (viewWorlds) {
      viewWorlds.style.display = 'none';
      viewWorlds.classList.remove('active');
    }
    if (viewLevels) {
      viewLevels.style.display = 'flex';
      viewLevels.classList.add('active');
    }
    if (viewGame) {
      viewGame.style.display = 'none';
      viewGame.classList.remove('active');
    }
    if (btnBack) {
      btnBack.style.display = 'flex';
    }
    if (instructionBar) {
      instructionBar.style.display = 'none';
    }

    this.renderLevelsGrid();
  }

  renderWelcomeBanner() {
    const welcomeMascot = document.getElementById('welcomeMascot');
    if (welcomeMascot) {
      welcomeMascot.innerHTML = Mascot.hero(90, 'wave');
    }
  }

  renderWorldsGrid() {
    const grid = document.getElementById('worldsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    WORLDS.forEach(world => {
      const worldLevels = LEVELS.filter(l => l.worldId === world.id);
      const completedCount = worldLevels.filter(l => this.completedLevels[l.id]).length;

      const card = document.createElement('div');
      card.className = `world-card world-card-${world.id}`;
      card.dataset.worldId = world.id;
      card.innerHTML = `
        <span class="world-icon">${world.emoji}</span>
        <h3 class="world-title">${world.name}</h3>
        <p class="world-desc">${world.desc}</p>
        <div class="levels-progress-pill">${completedCount} / ${worldLevels.length} Level</div>
      `;

      card.onclick = () => {
        sound.playPop();
        this.selectWorld(world.id);
      };

      grid.appendChild(card);
    });
  }

  selectWorld(worldId) {
    this.activeWorldId = worldId;
    this.showLevelsView(worldId);
  }

  renderLevelsGrid() {
    const grid = document.getElementById('levelsGrid');
    const titleEl = document.getElementById('currentWorldTitle');
    const progressEl = document.getElementById('currentWorldProgress');

    const world = WORLDS.find(w => w.id === this.activeWorldId) || WORLDS[0];
    const worldLevels = LEVELS.filter(l => l.worldId === world.id);
    const completedCount = worldLevels.filter(l => this.completedLevels[l.id]).length;

    if (titleEl) {
      titleEl.textContent = `${world.emoji} ${world.name}`;
    }
    if (progressEl) {
      progressEl.textContent = `${completedCount} / ${worldLevels.length} Level`;
    }

    if (!grid) return;
    grid.innerHTML = '';

    worldLevels.forEach(level => {
      const isDone = Boolean(this.completedLevels[level.id]);
      const card = document.createElement('div');
      card.className = `level-card ${isDone ? 'completed' : ''}`;
      card.dataset.levelId = level.id;
      card.innerHTML = `
        <span class="lvl-num">Level ${level.id}</span>
        <span class="lvl-icon">${world.emoji}</span>
        <span class="lvl-title">${level.title}</span>
        <div class="lvl-stars">
          ${Mascot.star(22, isDone)}
          ${Mascot.star(22, isDone)}
          ${Mascot.star(22, isDone)}
        </div>
      `;

      card.onclick = () => {
        sound.playPop();
        this.launchLevel(level.id);
      };

      grid.appendChild(card);
    });
  }

  // ==========================================================================
  // GAMEPLAY LIFECYCLE & ENGINE MOUNT
  // ==========================================================================
  launchLevel(levelId) {
    const level = LEVELS.find(l => String(l.id) === String(levelId));
    if (!level) {
      console.error(`[App] Level not found: ${levelId}`);
      return;
    }

    this.currentLevel = level;
    this.activeWorldId = level.worldId;
    this.currentView = 'game';
    this.isVictoryProcessing = false;

    // View Switching
    const viewWorlds = document.getElementById('viewWorlds');
    const viewLevels = document.getElementById('viewLevels');
    const viewGame = document.getElementById('viewGame');
    const btnBack = document.getElementById('btnHeaderBack');
    const instructionBar = document.getElementById('instructionBar');
    const badgeEl = document.getElementById('gameLevelBadge');
    const titleEl = document.getElementById('gameLevelTitle');
    const promptText = document.getElementById('promptText');
    const mascotBubble = document.getElementById('mascotBubble');
    const gameMount = document.getElementById('gameMount');

    if (viewWorlds) {
      viewWorlds.style.display = 'none';
      viewWorlds.classList.remove('active');
    }
    if (viewLevels) {
      viewLevels.style.display = 'none';
      viewLevels.classList.remove('active');
    }
    if (viewGame) {
      viewGame.style.display = 'flex';
      viewGame.classList.add('active');
    }
    if (btnBack) {
      btnBack.style.display = 'flex';
    }
    if (instructionBar) {
      instructionBar.style.display = 'flex';
    }

    if (badgeEl) badgeEl.textContent = `Level ${level.id}`;
    if (titleEl) titleEl.textContent = level.title;
    if (promptText) promptText.textContent = level.prompt;
    if (mascotBubble) {
      const currentWorld = level.worldId || this.activeWorldId;
      const initialSvg = (typeof Mascot.forWorld === 'function' && currentWorld)
        ? Mascot.forWorld(currentWorld, 72, 'happy')
        : Mascot.hero(72, 'happy');
      mascotBubble.innerHTML = initialSvg;
    }

    // Trigger Indonesian TTS
    this.speakLevelPrompt(level.prompt);

    // Mount Interactive Engine
    if (gameMount) {
      gameMount.innerHTML = '';
      Engines.render(gameMount, level, () => this.handleVictory(level));
    }
  }

  speakLevelPrompt(promptText) {
    if (!promptText) return;
    const speakerBtn = document.getElementById('btnSpeakPrompt');
    if (speakerBtn) speakerBtn.classList.add('speaking');

    sound.speak(promptText, () => {
      if (speakerBtn) speakerBtn.classList.remove('speaking');
    });
  }

  handleVictory(level) {
    // Idempotency guard against duplicate engine completion events
    if (this.isVictoryProcessing) return;
    this.isVictoryProcessing = true;

    // Stop ongoing speech
    sound.stopSpeech();

    // Record completion with 3 stars
    this.completedLevels[level.id] = 3;
    this.saveProgress();

    // Update Star counter in header with animation
    this.updateStarDisplay(true);

    // Track celebration timeouts for clean cancellation in closeVictory
    this.victoryTimeouts = this.victoryTimeouts || [];
    this.victoryTimeouts.forEach(t => clearTimeout(t));
    this.victoryTimeouts = [];

    // Phase 1 (T = 0ms): Jelly Modal Entrance & sound pop
    sound.playPop();
    const modalVictory = document.getElementById('modalVictory');
    const victoryMascot = document.getElementById('victoryMascot');
    const victoryStarsAnim = document.getElementById('victoryStarsAnim');
    const btnNext = document.getElementById('btnNextLevel');
    const btnReplay = document.getElementById('btnReplayLevel');
    const btnSelect = document.getElementById('btnVictoryLevelSelect');

    const currentWorld = level.worldId || this.activeWorldId;
    const cheerSvg = (typeof Mascot.forWorld === 'function' && currentWorld)
      ? Mascot.forWorld(currentWorld, 140, 'cheer')
      : Mascot.hero(140, 'cheer');

    if (victoryMascot) {
      victoryMascot.innerHTML = cheerSvg;
    }

    if (victoryStarsAnim) {
      victoryStarsAnim.innerHTML = `
        <span class="big-star star-drop-1" style="display:inline-block; opacity:1; transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">⭐</span>
        <span class="big-star star-drop-2" style="display:inline-block; opacity:1; transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">⭐</span>
        <span class="big-star star-drop-3" style="display:inline-block; opacity:1; transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">⭐</span>
      `;
    }

    if (modalVictory) {
      modalVictory.style.display = 'flex';
      const card = modalVictory.querySelector('.victory-card');
      if (card) {
        card.style.animation = 'jellyDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    }

    // Phase 2 (T = 150ms): Mascot Cheer Jump
    this.victoryTimeouts.push(setTimeout(() => {
      if (victoryMascot) {
        victoryMascot.style.animation = 'mascotCheer 0.8s ease-in-out infinite alternate';
      }
    }, 150));

    // Phase 3 (T = 300ms, 600ms, 900ms): Staggered 3-Star Drop with Cascading Chimes
    this.victoryTimeouts.push(setTimeout(() => {
      const s1 = victoryStarsAnim ? victoryStarsAnim.querySelector('.star-drop-1') : null;
      if (s1) {
        s1.style.transform = 'scale(1.25)';
        setTimeout(() => { s1.style.transform = 'scale(1)'; }, 180);
      }
      sound.playStar();
    }, 300));

    this.victoryTimeouts.push(setTimeout(() => {
      const s2 = victoryStarsAnim ? victoryStarsAnim.querySelector('.star-drop-2') : null;
      if (s2) {
        s2.style.transform = 'scale(1.25)';
        setTimeout(() => { s2.style.transform = 'scale(1)'; }, 180);
      }
      sound.playStar();
    }, 600));

    this.victoryTimeouts.push(setTimeout(() => {
      const s3 = victoryStarsAnim ? victoryStarsAnim.querySelector('.star-drop-3') : null;
      if (s3) {
        s3.style.transform = 'scale(1.35)';
        setTimeout(() => { s3.style.transform = 'scale(1)'; }, 180);
      }
      sound.playCorrect();
    }, 900));

    // Phase 4 (T = 1000ms): Full Fireworks Confetti Blast & Fanfare
    this.victoryTimeouts.push(setTimeout(() => {
      if (this.confetti) {
        this.confetti.start(4500);
      }
      sound.playFanfare();
    }, 1000));

    // Phase 5 (T = 1200ms): Interactive Buttons Inviting Pulse
    this.victoryTimeouts.push(setTimeout(() => {
      [btnNext, btnReplay, btnSelect].forEach(btn => {
        if (btn) btn.style.animation = 'jellyBreathe 1.8s infinite ease-in-out';
      });
    }, 1200));
  }

  closeVictory() {
    if (this.victoryTimeouts && Array.isArray(this.victoryTimeouts)) {
      this.victoryTimeouts.forEach(t => clearTimeout(t));
      this.victoryTimeouts = [];
    }
    const modalVictory = document.getElementById('modalVictory');
    if (modalVictory) {
      modalVictory.style.display = 'none';
      const card = modalVictory.querySelector('.victory-card');
      if (card) card.style.animation = '';
    }
    const victoryMascot = document.getElementById('victoryMascot');
    if (victoryMascot) victoryMascot.style.animation = '';

    const btnNext = document.getElementById('btnNextLevel');
    const btnReplay = document.getElementById('btnReplayLevel');
    const btnSelect = document.getElementById('btnVictoryLevelSelect');
    [btnNext, btnReplay, btnSelect].forEach(btn => {
      if (btn) btn.style.animation = '';
    });

    if (this.confetti) {
      this.confetti.stop();
    }
    this.isVictoryProcessing = false;
  }

  // ==========================================================================
  // EVENT BINDINGS
  // ==========================================================================
  bindHeaderControls() {
    const btnBack = document.getElementById('btnHeaderBack');
    if (btnBack) {
      btnBack.onclick = () => {
        sound.playClick();
        sound.stopSpeech();
        if (this.currentView === 'game') {
          this.showLevelsView();
        } else if (this.currentView === 'levels') {
          this.showWorldsView();
        }
      };
    }
  }

  bindSpeechInstructionBar() {
    const btnSpeak = document.getElementById('btnSpeakPrompt');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        sound.playPop();
        if (this.currentLevel && this.currentLevel.prompt) {
          this.speakLevelPrompt(this.currentLevel.prompt);
        }
      };
    }
  }

  bindVictoryControls() {
    const btnNext = document.getElementById('btnNextLevel');
    const btnReplay = document.getElementById('btnReplayLevel');
    const btnLevelSelect = document.getElementById('btnVictoryLevelSelect');

    if (btnNext) {
      btnNext.onclick = () => {
        sound.playClick();
        const currentWorld = this.activeWorldId;
        const currentId = this.currentLevel ? this.currentLevel.id : null;
        this.closeVictory();

        if (currentWorld && currentId) {
          const worldLevels = LEVELS.filter(l => l.worldId === currentWorld);
          const currentIdx = worldLevels.findIndex(l => String(l.id) === String(currentId));

          if (currentIdx !== -1 && currentIdx < worldLevels.length - 1) {
            // Next level in same world
            this.launchLevel(worldLevels[currentIdx + 1].id);
            return;
          }
        }
        // If finished all levels in world, return to levels grid
        this.showLevelsView();
      };
    }

    if (btnReplay) {
      btnReplay.onclick = () => {
        sound.playClick();
        const currentId = this.currentLevel ? this.currentLevel.id : null;
        this.closeVictory();
        if (currentId) {
          this.launchLevel(currentId);
        }
      };
    }

    if (btnLevelSelect) {
      btnLevelSelect.onclick = () => {
        sound.playClick();
        this.closeVictory();
        this.showLevelsView();
      };
    }
  }

  // ==========================================================================
  // PARENTAL GATE (2-SECOND HOLD + RANDOM MATH CHALLENGE)
  // ==========================================================================
  bindParentGateControls() {
    const btnOpenParent = document.getElementById('btnOpenParent');
    const progressBar = document.getElementById('parentHoldProgress');
    const modalParent = document.getElementById('modalParent');
    const btnCancelGate = document.getElementById('btnCancelParentGate');
    const btnCloseDash = document.getElementById('btnCloseParentDash');
    const btnSaveChild = document.getElementById('btnSaveChildName');
    const inputChild = document.getElementById('inputChildName');
    const btnTestSfx = document.getElementById('btnTestSfx');
    const btnTestTts = document.getElementById('btnTestTts');
    const btnReset = document.getElementById('btnResetProgress');

    if (!btnOpenParent) return;

    const resetHold = () => {
      if (this.holdTimer) clearTimeout(this.holdTimer);
      if (this.holdInterval) clearInterval(this.holdInterval);
      this.holdTimer = null;
      this.holdInterval = null;
      this.holdStartTime = null;
      if (progressBar) progressBar.style.width = '0%';
    };

    const startHold = (e) => {
      // Prevent accidental scrolling or text selections
      if (e && e.cancelable && e.type !== 'mousedown') {
        e.preventDefault();
      }
      resetHold();
      this.holdStartTime = Date.now();

      this.holdInterval = setInterval(() => {
        if (!this.holdStartTime) return;
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(100, (elapsed / this.holdDurationMs) * 100);
        if (progressBar) progressBar.style.width = `${progress}%`;
      }, 30);

      this.holdTimer = setTimeout(() => {
        resetHold();
        sound.playPop();
        this.openParentalGateModal();
      }, this.holdDurationMs);
    };

    // Pointer events for touch & desktop mice
    btnOpenParent.addEventListener('pointerdown', startHold);
    btnOpenParent.addEventListener('pointerup', resetHold);
    btnOpenParent.addEventListener('pointerleave', resetHold);
    btnOpenParent.addEventListener('pointercancel', resetHold);

    // Fallbacks
    btnOpenParent.addEventListener('touchstart', startHold, { passive: false });
    btnOpenParent.addEventListener('touchend', resetHold);
    btnOpenParent.addEventListener('touchcancel', resetHold);
    btnOpenParent.addEventListener('mousedown', startHold);
    btnOpenParent.addEventListener('mouseup', resetHold);
    btnOpenParent.addEventListener('mouseleave', resetHold);

    // Cancel gate button
    if (btnCancelGate) {
      btnCancelGate.onclick = () => {
        sound.playClick();
        if (modalParent) modalParent.style.display = 'none';
      };
    }

    // Close dashboard button
    if (btnCloseDash) {
      btnCloseDash.onclick = () => {
        sound.playClick();
        if (modalParent) modalParent.style.display = 'none';
      };
    }

    // Save Child Name
    if (btnSaveChild && inputChild) {
      btnSaveChild.onclick = () => {
        sound.playClick();
        const newName = inputChild.value.trim();
        if (newName) {
          this.childName = newName;
          this.saveProgress();
          // Brief feedback
          btnSaveChild.textContent = 'Tersimpan! ✅';
          setTimeout(() => {
            btnSaveChild.textContent = 'Simpan 💾';
          }, 1500);
        }
      };
    }

    // Test SFX
    if (btnTestSfx) {
      btnTestSfx.onclick = () => {
        sound.playFanfare();
      };
    }

    // Test TTS
    if (btnTestTts) {
      btnTestTts.onclick = () => {
        sound.speak('Halo Pahlawan Cilik! Suara pemandu Bahasa Indonesia siap membantumu bermain!');
      };
    }

    // Reset Progress
    if (btnReset) {
      btnReset.onclick = () => {
        const confirmed = typeof confirm === 'function' ?
          confirm('Apakah Ayah/Bunda yakin ingin menghapus seluruh bintang dan riwayat progres permainan?') : true;

        if (confirmed) {
          this.resetProgress();
          sound.playGentleTryAgain();
          if (modalParent) modalParent.style.display = 'none';
        }
      };
    }
  }

  openParentalGateModal() {
    const modalParent = document.getElementById('modalParent');
    const gateSection = document.getElementById('parentGateSection');
    const dashSection = document.getElementById('parentDashboardSection');
    const mathQuestion = document.getElementById('parentMathQuestion');
    const mathChoices = document.getElementById('parentMathChoices');

    if (!modalParent || !gateSection || !dashSection) return;

    // Reset sections
    gateSection.style.display = 'flex';
    dashSection.style.display = 'none';
    modalParent.style.display = 'flex';

    // Generate random single-digit addition: a + b
    const a = Math.floor(Math.random() * 8) + 2; // 2..9
    const b = Math.floor(Math.random() * 8) + 1; // 1..8
    const sum = a + b;
    this.currentMathAnswer = sum;

    if (mathQuestion) {
      mathQuestion.textContent = `Berapa ${a} + ${b}?`;
    }

    if (mathChoices) {
      mathChoices.innerHTML = '';
      // Create set of 6 distinct choices including sum
      const choiceSet = new Set([sum]);
      while (choiceSet.size < 6) {
        const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
        const candidate = sum + delta;
        if (candidate > 0 && candidate <= 20) {
          choiceSet.add(candidate);
        }
      }

      const choicesArr = Array.from(choiceSet).sort(() => Math.random() - 0.5);
      choicesArr.forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'math-choice-btn';
        btn.dataset.val = String(val);
        btn.textContent = String(val);

        btn.onclick = () => this.handleMathChoice(val);
        mathChoices.appendChild(btn);
      });
    }
  }

  handleMathChoice(chosenValue) {
    const modalParent = document.getElementById('modalParent');
    const gateSection = document.getElementById('parentGateSection');
    const dashSection = document.getElementById('parentDashboardSection');
    const inputChild = document.getElementById('inputChildName');

    if (Number(chosenValue) === Number(this.currentMathAnswer)) {
      // Correct! Unlock parental dashboard
      sound.playCorrect();
      if (gateSection) gateSection.style.display = 'none';
      if (dashSection) dashSection.style.display = 'flex';

      if (inputChild) {
        inputChild.value = this.childName;
      }
      this.renderWorldRecapList();
    } else {
      // Incorrect! Block access & gently wobble
      sound.playGentleTryAgain();
      if (gateSection) {
        gateSection.classList.remove('wobble');
        void gateSection.offsetWidth;
        gateSection.classList.add('wobble');
      }
      setTimeout(() => {
        if (modalParent) modalParent.style.display = 'none';
      }, 500);
    }
  }

  renderWorldRecapList() {
    const listEl = document.getElementById('worldRecapList');
    if (!listEl) return;

    listEl.innerHTML = '';
    WORLDS.forEach(w => {
      const worldLevels = LEVELS.filter(l => l.worldId === w.id);
      const doneCount = worldLevels.filter(l => this.completedLevels[l.id]).length;
      const starsCount = worldLevels.reduce((sum, l) => sum + (this.completedLevels[l.id] || 0), 0);

      const row = document.createElement('div');
      row.className = 'recap-row';
      row.innerHTML = `
        <span>${w.emoji} ${w.name}</span>
        <span>${doneCount} / ${worldLevels.length} Level (${starsCount} ⭐)</span>
      `;
      listEl.appendChild(row);
    });
  }

  resetProgress() {
    this.completedLevels = {};
    this.safeStorageRemove('spidey_stars');
    this.safeStorageRemove('spidey_completed_levels');
    this.safeStorageRemove('spidey_progress');
    this.safeStorageRemove('stars_total');

    this.updateStarDisplay(false);
    this.showWorldsView();
  }

  // ==========================================================================
  // CHAMPIONSHIP CERTIFICATE MODAL & PRINTING
  // ==========================================================================
  bindCertificateControls() {
    const btnOpenCert = document.getElementById('btnOpenCert');
    const modalCert = document.getElementById('modalCertificate');
    const btnPrintCert = document.getElementById('btnPrintCert');
    const btnCloseCert = document.getElementById('btnCloseCert');

    if (btnOpenCert) {
      btnOpenCert.onclick = () => {
        sound.playClick();
        this.openCertificateModal();
      };
    }

    if (btnPrintCert) {
      btnPrintCert.onclick = () => {
        sound.playClick();
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
        }
      };
    }

    if (btnCloseCert) {
      btnCloseCert.onclick = () => {
        sound.playClick();
        if (modalCert) modalCert.style.display = 'none';
      };
    }
  }

  openCertificateModal() {
    const modalCert = document.getElementById('modalCertificate');
    const nameEl = document.getElementById('certChildName');
    const starsEl = document.getElementById('certTotalStars');
    const levelsEl = document.getElementById('certCompletedLevels');
    const dateEl = document.getElementById('certIssueDate');
    const leftMascot = document.getElementById('certMascotLeft');
    const rightMascot = document.getElementById('certMascotRight');

    if (nameEl) nameEl.textContent = this.childName || 'Pahlawan Cilik';
    if (starsEl) starsEl.textContent = String(this.getTotalStars());
    if (levelsEl) levelsEl.textContent = String(this.getCompletedLevelsCount());
    if (dateEl) dateEl.textContent = this.getFormattedDate();

    if (leftMascot) leftMascot.innerHTML = Mascot.hero(70, 'wave');
    if (rightMascot) {
      const robotFn = Mascot.robot || Mascot.bot;
      rightMascot.innerHTML = robotFn(70, 'cheer');
    }

    if (modalCert) modalCert.style.display = 'flex';
  }
}

// Static Helper & Global Singleton Instance
AppController.reactMascot = (emotion, speechText, durationMs) => {
  if (typeof App !== 'undefined' && App && typeof App.reactMascot === 'function') {
    App.reactMascot(emotion, speechText, durationMs);
  }
};

export const App = new AppController();
if (typeof window !== 'undefined') {
  window.app = App;
  window.AppController = App;
}

// Auto-initialize when running in browser DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
}
