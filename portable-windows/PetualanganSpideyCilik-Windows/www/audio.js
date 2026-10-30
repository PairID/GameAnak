// audio.js - Synthesized Web Audio API sound effects and Indonesian Speech Narrator
// Procedural dual-harmonic synthesis for preschool commercial quality.
// 100% offline, zero external audio asset files needed.

export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.speechEnabled = true;
    this.sfxEnabled = true;
    this.currentUtterance = null;
    this.selectedVoice = null;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Indonesian voices
    this.selectedVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id')) ||
                         voices.find(v => v.lang.startsWith('ms')) || null;
  }

  // Speak Indonesian text aloud with child-friendly pitch and pacing
  speak(text, onEnd) {
    if (!this.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) setTimeout(onEnd, 300);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID';
      u.rate = 0.88; // Slightly gentle & slower for 3-4 yo
      u.pitch = 1.15; // Slightly cheerful & friendly
      if (!this.selectedVoice) this.loadVoices();
      if (this.selectedVoice) u.voice = this.selectedVoice;

      u.onend = () => { if (onEnd) onEnd(); };
      u.onerror = () => { if (onEnd) onEnd(); };
      this.currentUtterance = u;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('Speech error:', e);
      if (onEnd) onEnd();
    }
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // Synthesized Sound Effects (Dual-Harmonic Core)
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, freqEnd = null) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const safeFreq = Math.min(Math.max(Number(freq) || 220, 20), 20000);
    const safeFreqEnd = (freqEnd !== null && !isNaN(freqEnd)) ? Math.min(Math.max(Number(freqEnd), 20), 20000) : null;
    const now = this.ctx.currentTime || 0;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(safeFreq, now);
    if (safeFreqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(safeFreqEnd, now + duration);
    }

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Bubbly water-drop pop (frequency sweep with pitch-drop and quick high ping)
  playPop() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime || 0;

    // Voice 1: Main bubble pop (swoop 380Hz up to 680Hz and down to 320Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(380, now);
    osc1.frequency.exponentialRampToValueAtTime(680, now + 0.035);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.08);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Voice 2: High water droplet ping (sparkle pop transient at 1120Hz)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1120, now);
    osc2.frequency.exponentialRampToValueAtTime(840, now + 0.045);
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.045);
  }

  // Soft wooden block tactile tick
  playClick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime || 0;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.045);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.045);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(980, now);
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.02);
  }

  // Warm rising pentatonic chime with dual harmonics
  playCorrect() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime || 0;

        // Primary fundamental sine
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.22);
        gain1.gain.setValueAtTime(0.24, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.22);

        // Harmonic overtone (octave chime at 2x frequency)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now);
        gain2.gain.setValueAtTime(0.08, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.16);
      }, idx * 75);
    });
  }

  // Shimmering dual-voice sparkle arpeggio with high harmonic overtone
  playStar() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 880.00, 1174.66, 1479.98]; // D5, A5, D6, F#6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime || 0;

        // Voice 1: Main chime (triangle)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.32);

        // Voice 2: Shimmering sparkle (+9 cents detuned sine)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.005, now);
        gain2.gain.setValueAtTime(0.12, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.28);
      }, idx * 80);
    });
  }

  // Rich celebratory marimba/brass victory chord sequence with detuned dual voices
  playFanfare() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, h: 261.63, d: 0.14, wait: 0 },    // C5 + C4
      { f: 659.25, h: 329.63, d: 0.14, wait: 110 },  // E5 + E4
      { f: 783.99, h: 392.00, d: 0.16, wait: 220 },  // G5 + G4
      { f: 1046.50, h: 523.25, d: 0.42, wait: 350 }, // C6 + C5
      { f: 880.00,  h: 440.00, d: 0.16, wait: 500 }, // A5 + A4
      { f: 1046.50, h: 1318.51, d: 0.65, wait: 660 } // C6 + E6 triumphant chord
    ];

    melody.forEach(m => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime || 0;

        // Voice 1: Main melody (triangle)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(m.f, now);
        gain1.gain.setValueAtTime(0.26, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + m.d);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + m.d);

        // Voice 2: Warm harmony / overtone (sine)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(m.h, now);
        gain2.gain.setValueAtTime(0.14, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + m.d);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + m.d);
      }, m.wait);
    });
  }

  // Soothing, encouraging rising wobble (zero harshness, zero harsh tones, never punitive!)
  playGentleTryAgain() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime || 0;

    // Gentle warm wobble: 260Hz dips to 210Hz and swoops up to 280Hz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.24);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Cheerful high-tech synthetic servo blip
  playRobotStep() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime || 0;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(380, now);
    osc1.frequency.exponentialRampToValueAtTime(560, now + 0.08);
    gain1.gain.setValueAtTime(0.10, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(190, now);
    osc2.frequency.exponentialRampToValueAtTime(280, now + 0.08);
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.08);
  }
}

export const sound = new SoundSystem();
