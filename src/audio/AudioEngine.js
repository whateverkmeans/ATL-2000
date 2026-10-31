// Vintage MPC Web Audio Engine with Hybrid Sample Player and Synthesizer Fallback

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isInitialized = false;

    // Buffer cache for real mp3 files: padId -> AudioBuffer
    this.sampleBuffers = new Map();
    // Failed files (to avoid re-fetching 404s): padId -> true
    this.failedSamples = new Set();
    // Loading promises
    this.loadingPromises = new Map();

    // Active playing nodes: padId -> { sourceNode, gainNode, stopFn }
    this.activeLoops = new Map();
    // Active one-shots: padId -> Set of { stopFn }
    this.activeOneShots = new Map();

    // Vocal pads for choke group (Pads 2, 8, 11, 12)
    this.vocalPadIds = new Set([2, 8, 11, 12]);

    // Master volume
    this.masterVolume = 0.85;

    // State listeners (for React UI updates)
    this.listeners = new Set();
  }

  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // Analyser for visualizer & VU meter
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  // Preload a sample file
  async loadSample(padId, url) {
    if (this.sampleBuffers.has(padId) || this.failedSamples.has(padId)) {
      return this.sampleBuffers.get(padId) || null;
    }
    if (this.loadingPromises.has(padId)) {
      return this.loadingPromises.get(padId);
    }

    const promise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (!this.ctx) this.init();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.sampleBuffers.set(padId, audioBuffer);
        return audioBuffer;
      } catch (err) {
        // Fallback to synth silently
        this.failedSamples.add(padId);
        return null;
      } finally {
        this.loadingPromises.delete(padId);
      }
    })();

    this.loadingPromises.set(padId, promise);
    return promise;
  }

  // Choke all playing vocal pads
  chokeVocals() {
    for (const id of this.vocalPadIds) {
      this.stopOneShot(id);
      if (this.activeLoops.has(id)) {
        this.stopLoop(id);
      }
    }
  }

  // Stop one-shot voices for a pad
  stopOneShot(padId) {
    const list = this.activeOneShots.get(padId);
    if (list) {
      for (const voice of list) {
        try {
          voice.stopFn();
        } catch (e) {}
      }
      list.clear();
    }
  }

  // Stop a specific loop
  stopLoop(padId) {
    const loop = this.activeLoops.get(padId);
    if (loop) {
      try {
        loop.stopFn();
      } catch (e) {}
      this.activeLoops.delete(padId);
    }
  }

  // Stop ALL playing sounds and loops
  stopAll() {
    // Stop all active loops
    for (const [padId, loop] of this.activeLoops.entries()) {
      try {
        loop.stopFn();
      } catch (e) {}
    }
    this.activeLoops.clear();

    // Stop all active one-shots
    for (const [padId, set] of this.activeOneShots.entries()) {
      for (const voice of set) {
        try {
          voice.stopFn();
        } catch (e) {}
      }
      set.clear();
    }
  }

  // Trigger One-Shot
  triggerOneShot(pad, chokeEnabled = false) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Handle choke if enabled and pad is a vocal pad
    if (chokeEnabled && this.vocalPadIds.has(pad.id)) {
      this.chokeVocals();
    } else {
      // Re-trigger pad cleanly by cutting previous sound of this same pad
      this.stopOneShot(pad.id);
    }

    const targetGain = pad.gain !== undefined ? pad.gain : 0.9;
    const buffer = this.sampleBuffers.get(pad.id);
    if (buffer) {
      this.playBufferOneShot(pad.id, buffer, targetGain);
    } else {
      // Synthesize
      this.playSynthesizedSound(pad.id, false, targetGain);
    }
  }

  // Trigger / Toggle Loop
  toggleLoop(pad, onStateChanged) {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const isCurrentlyLooping = this.activeLoops.has(pad.id);

    if (isCurrentlyLooping) {
      this.stopLoop(pad.id);
      if (onStateChanged) onStateChanged(false);
      return false;
    } else {
      const targetGain = pad.gain !== undefined ? pad.gain : (pad.id === 13 ? 0.55 : 0.9);
      const buffer = this.sampleBuffers.get(pad.id);
      if (buffer) {
        this.playBufferLoop(pad.id, buffer, targetGain);
      } else {
        this.playSynthesizedSound(pad.id, true, targetGain);
      }
      if (onStateChanged) onStateChanged(true);
      return true;
    }
  }

  // Play real buffer as One-Shot
  playBufferOneShot(padId, buffer, targetVolume = 0.9) {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(targetVolume, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(this.masterGain);

    const voice = {
      stopFn: () => {
        try {
          gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
          setTimeout(() => {
            try { source.stop(); } catch (e) {}
          }, 30);
        } catch (e) {}
      }
    };

    if (!this.activeOneShots.has(padId)) {
      this.activeOneShots.set(padId, new Set());
    }
    const set = this.activeOneShots.get(padId);
    set.add(voice);

    source.onended = () => {
      set.delete(voice);
    };

    source.start(0);
  }

  // Play real buffer as Loop
  playBufferLoop(padId, buffer, targetVolume = 0.9) {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.02);

    source.connect(gain);
    gain.connect(this.masterGain);

    const stopFn = () => {
      try {
        gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
        setTimeout(() => {
          try {
            source.stop();
            source.disconnect();
          } catch (e) {}
        }, 50);
      } catch (e) {}
    };

    this.activeLoops.set(padId, { sourceNode: source, gainNode: gain, stopFn });
    source.start(0);
  }

  // Synthesizer Fallback: Generates authentic musical stems & sounds at 118 BPM
  playSynthesizedSound(padId, isLoop = false) {
    const now = this.ctx.currentTime;
    const bpm = 118;
    const beatSec = 60 / bpm; // ~0.5085s
    const barSec = beatSec * 4; // ~2.034s

    switch (padId) {
      // Pad 9: Kick
      case 9: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(145, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.4);

        const voice = { stopFn: () => { try { osc.stop(); } catch (e) {} } };
        this.registerOneShotVoice(padId, voice);
        break;
      }

      // Pad 10: Clap
      case 10: {
        const bufferSize = this.ctx.sampleRate * 0.3;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1150, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = this.ctx.createGain();
        // 3 snappy clap pulses
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.015);
        gain.gain.setValueAtTime(0.9, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.035);
        gain.gain.setValueAtTime(1.0, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.3);

        const voice = { stopFn: () => { try { whiteNoise.stop(); } catch (e) {} } };
        this.registerOneShotVoice(padId, voice);
        break;
      }

      // Pad 8: Andre Vocal ("Yeah!")
      case 8: {
        this.synthTalkboxVocal(padId, 220, [350, 220, 277], 0.65, isLoop);
        break;
      }

      // Pad 11: Alayi (Middle-Eastern Soul Chop)
      case 11: {
        this.synthVocalChop(padId, 330, [330, 392, 440, 392], 0.8, isLoop);
        break;
      }

      // Pad 12: Andre Vocal 2 ("Love!")
      case 12: {
        this.synthTalkboxVocal(padId, 175, [175, 220, 261, 330], 0.9, isLoop);
        break;
      }

      // Pad 2: Fayek Alaya (One-Shot)
      case 2: {
        this.synthFayekAlayaMelody(padId, false);
        break;
      }

      // Pad 13: Loop Fayek Alaya
      case 13: {
        this.synthFayekAlayaMelody(padId, true);
        break;
      }

      // Pad 1: Drum Loop (118 BPM)
      case 1: {
        this.synthDrumLoop(padId);
        break;
      }

      // Pad 3: Bass 1 (Sub Groovy 808 Loop)
      case 3: {
        this.synthBassLoop(padId, 'deep');
        break;
      }

      // Pad 4: Bass 2 (Funky Synth Resonant Bass Loop)
      case 4: {
        this.synthBassLoop(padId, 'funky');
        break;
      }

      // Pad 5: Piano 2 (Neo-Soul Rhodes Progression Loop)
      case 5: {
        this.synthPianoLoop(padId, 'rhodes');
        break;
      }

      // Pad 6: Piano 1 (Warm Gospel Chord Loop)
      case 6: {
        this.synthPianoLoop(padId, 'acoustic');
        break;
      }

      // Pad 7: String Loop (Analog Vintage Strings)
      case 7: {
        this.synthStringLoop(padId);
        break;
      }

      default:
        break;
    }
  }

  registerOneShotVoice(padId, voice) {
    if (!this.activeOneShots.has(padId)) {
      this.activeOneShots.set(padId, new Set());
    }
    const set = this.activeOneShots.get(padId);
    set.add(voice);
  }

  // Synthesized Talkbox Vocal
  synthTalkboxVocal(padId, baseFreq, notes, duration, isLoop) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(650, now);
    filter1.Q.setValueAtTime(4.0, now);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'peaking';
    filter2.frequency.setValueAtTime(1400, now);
    filter2.gain.setValueAtTime(12, now);
    filter2.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Note pitch changes
    const stepTime = duration / notes.length;
    notes.forEach((freq, idx) => {
      osc.frequency.setTargetAtTime(freq, now + idx * stepTime, 0.03);
      filter1.frequency.setTargetAtTime(freq * 2.4, now + idx * stepTime, 0.04);
    });

    osc.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);

    const voice = {
      stopFn: () => {
        try {
          gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
          setTimeout(() => osc.stop(), 20);
        } catch (e) {}
      }
    };
    this.registerOneShotVoice(padId, voice);
  }

  // Synthesized Vocal Chop
  synthVocalChop(padId, baseFreq, notes, duration, isLoop) {
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'sawtooth';

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const stepTime = duration / notes.length;
    notes.forEach((freq, idx) => {
      osc1.frequency.setTargetAtTime(freq, now + idx * stepTime, 0.02);
      osc2.frequency.setTargetAtTime(freq * 1.005, now + idx * stepTime, 0.02);
      filter.frequency.setTargetAtTime(freq * 2.8, now + idx * stepTime, 0.03);
    });

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);

    const voice = {
      stopFn: () => {
        try {
          gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
          setTimeout(() => {
            try { osc1.stop(); osc2.stop(); } catch (e) {}
          }, 20);
        } catch (e) {}
      }
    };
    this.registerOneShotVoice(padId, voice);
  }

  // Synthesize Fayek Alaya iconic soul riff
  synthFayekAlayaMelody(padId, isLoop) {
    const playPhrase = (startTime) => {
      // Iconic soulful phrase in C minor (C4, Eb4, D4, C4, G3, Bb3, C4)
      const phrase = [
        { note: 261.63, dur: 0.35, offset: 0.0 },
        { note: 311.13, dur: 0.35, offset: 0.35 },
        { note: 293.66, dur: 0.25, offset: 0.70 },
        { note: 261.63, dur: 0.45, offset: 0.95 },
        { note: 196.00, dur: 0.30, offset: 1.40 },
        { note: 233.08, dur: 0.30, offset: 1.70 },
      ];

      const nodes = [];
      phrase.forEach(({ note, dur, offset }) => {
        const t = startTime + offset;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note, t);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(note * 0.998, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(2.5, t);

        const synthVol = isLoop ? 0.3 : 0.5;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(synthVol, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + dur + 0.02);
        osc2.start(t);
        osc2.stop(t + dur + 0.02);
        nodes.push({ osc, osc2, g });
      });

      return () => {
        nodes.forEach(n => {
          try {
            n.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
            n.osc.stop();
            n.osc2.stop();
          } catch (e) {}
        });
      };
    };

    if (!isLoop) {
      const stopVoice = playPhrase(this.ctx.currentTime);
      this.registerOneShotVoice(padId, { stopFn: stopVoice });
    } else {
      const beatSec = 60 / 118;
      const loopDurationMs = beatSec * 4 * 1000; // 1 bar repetition (~2.034s)
      playPhrase(this.ctx.currentTime);

      const intervalId = setInterval(() => {
        if (!this.activeLoops.has(padId)) {
          clearInterval(intervalId);
          return;
        }
        playPhrase(this.ctx.currentTime);
      }, loopDurationMs);

      this.activeLoops.set(padId, {
        stopFn: () => {
          clearInterval(intervalId);
        }
      });
    }
  }

  // Synthesized 118 BPM Drum Loop
  synthDrumLoop(padId) {
    const beatSec = 60 / 118; // ~0.5085s
    const barSec = beatSec * 4; // ~2.034s

    const playDrumBar = (startTime) => {
      // 16-step grid
      const stepSec = beatSec / 4; // 16th note
      const stopFns = [];

      // Kick hits on 0, 7, 10
      const kickSteps = [0, 7, 10];
      kickSteps.forEach(step => {
        const t = startTime + step * stepSec;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
        g.gain.setValueAtTime(0.85, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.25);
        stopFns.push(() => { try { osc.stop(); } catch (e) {} });
      });

      // Snare / Clap on beats 2 and 4 (steps 4 and 12)
      [4, 12].forEach(step => {
        const t = startTime + step * stepSec;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(1400, t);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        noise.connect(filt);
        filt.connect(g);
        g.connect(this.masterGain);
        noise.start(t);
        noise.stop(t + 0.2);
        stopFns.push(() => { try { noise.stop(); } catch (e) {} });
      });

      // Closed Hi-hats on 8th notes with subtle swing
      [0, 2, 4, 6, 8, 10, 12, 14].forEach((step, idx) => {
        const t = startTime + step * stepSec;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.setValueAtTime(8000, t);
        const g = this.ctx.createGain();
        const vol = idx % 2 === 0 ? 0.35 : 0.2;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        noise.connect(filt);
        filt.connect(g);
        g.connect(this.masterGain);
        noise.start(t);
        noise.stop(t + 0.05);
        stopFns.push(() => { try { noise.stop(); } catch (e) {} });
      });

      return () => {
        stopFns.forEach(fn => fn());
      };
    };

    playDrumBar(this.ctx.currentTime);
    const intervalMs = barSec * 1000;
    const intervalId = setInterval(() => {
      if (!this.activeLoops.has(padId)) {
        clearInterval(intervalId);
        return;
      }
      playDrumBar(this.ctx.currentTime);
    }, intervalMs);

    this.activeLoops.set(padId, {
      stopFn: () => {
        clearInterval(intervalId);
      }
    });
  }

  // Synthesized Bass Loop (Deep Sub or Funky Resonant)
  synthBassLoop(padId, mode = 'deep') {
    const beatSec = 60 / 118;
    const barSec = beatSec * 4;

    const playBassBar = (startTime) => {
      // Notes: C2 (65.41Hz), Eb2 (77.78Hz), F2 (87.31Hz), G2 (98.00Hz), Bb2 (116.54Hz)
      const pattern = mode === 'deep' 
        ? [
            { freq: 65.41, time: 0, dur: beatSec * 1.5 },
            { freq: 77.78, time: beatSec * 1.75, dur: beatSec * 0.75 },
            { freq: 87.31, time: beatSec * 2.75, dur: beatSec * 1.0 },
          ]
        : [
            { freq: 65.41, time: 0, dur: beatSec * 0.4 },
            { freq: 65.41, time: beatSec * 0.5, dur: beatSec * 0.4 },
            { freq: 98.00, time: beatSec * 1.25, dur: beatSec * 0.6 },
            { freq: 87.31, time: beatSec * 2.0, dur: beatSec * 0.4 },
            { freq: 116.54, time: beatSec * 2.75, dur: beatSec * 0.5 },
            { freq: 77.78, time: beatSec * 3.5, dur: beatSec * 0.4 },
          ];

      const stops = [];
      pattern.forEach(({ freq, time, dur }) => {
        const t = startTime + time;
        const osc = this.ctx.createOscillator();
        const filt = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        if (mode === 'deep') {
          osc.type = 'triangle';
          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(250, t);
          g.gain.setValueAtTime(0.01, t);
          g.gain.linearRampToValueAtTime(0.7, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        } else {
          osc.type = 'sawtooth';
          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(1400, t);
          filt.frequency.exponentialRampToValueAtTime(280, t + dur * 0.8);
          filt.Q.setValueAtTime(4.0, t);
          g.gain.setValueAtTime(0.01, t);
          g.gain.linearRampToValueAtTime(0.55, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }

        osc.frequency.setValueAtTime(freq, t);
        osc.connect(filt);
        filt.connect(g);
        g.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + dur + 0.05);
        stops.push(() => { try { osc.stop(); } catch (e) {} });
      });

      return () => stops.forEach(fn => fn());
    };

    playBassBar(this.ctx.currentTime);
    const intervalMs = barSec * 1000;
    const intervalId = setInterval(() => {
      if (!this.activeLoops.has(padId)) {
        clearInterval(intervalId);
        return;
      }
      playBassBar(this.ctx.currentTime);
    }, intervalMs);

    this.activeLoops.set(padId, {
      stopFn: () => {
        clearInterval(intervalId);
      }
    });
  }

  // Synthesized Piano Loop (Rhodes or Gospel Piano)
  synthPianoLoop(padId, type = 'rhodes') {
    const beatSec = 60 / 118;
    const barSec = beatSec * 4;

    const playChordBar = (startTime) => {
      // Chords: Cm7 (C, Eb, G, Bb) -> Abmaj7 (Ab, C, Eb, G)
      const chords = [
        {
          notes: [261.63, 311.13, 392.00, 466.16],
          time: 0,
          dur: beatSec * 1.8
        },
        {
          notes: [207.65, 261.63, 311.13, 392.00],
          time: beatSec * 2,
          dur: beatSec * 1.8
        }
      ];

      const stops = [];
      chords.forEach(({ notes, time, dur }) => {
        const t = startTime + time;
        notes.forEach(noteFreq => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();

          if (type === 'rhodes') {
            osc.type = 'sine';
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.18, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          } else {
            osc.type = 'triangle';
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.22, t + 0.015);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          }

          osc.frequency.setValueAtTime(noteFreq, t);
          osc.connect(g);
          g.connect(this.masterGain);

          osc.start(t);
          osc.stop(t + dur + 0.05);
          stops.push(() => { try { osc.stop(); } catch (e) {} });
        });
      });

      return () => stops.forEach(fn => fn());
    };

    playChordBar(this.ctx.currentTime);
    const intervalMs = barSec * 1000;
    const intervalId = setInterval(() => {
      if (!this.activeLoops.has(padId)) {
        clearInterval(intervalId);
        return;
      }
      playChordBar(this.ctx.currentTime);
    }, intervalMs);

    this.activeLoops.set(padId, {
      stopFn: () => {
        clearInterval(intervalId);
      }
    });
  }

  // Synthesized String Loop (Vintage Solina String Ensemble)
  synthStringLoop(padId) {
    const beatSec = 60 / 118;
    const barSec = beatSec * 4;

    const playStringBar = (startTime) => {
      // Rich sustained string pad: Eb4 (311.13), G4 (392.00), Bb4 (466.16), D5 (587.33)
      const freqs = [311.13, 392.00, 466.16, 587.33];
      const stops = [];

      freqs.forEach(freq => {
        // Multi-oscillator detuned ensemble
        [-6, 0, 6].forEach(cents => {
          const osc = this.ctx.createOscillator();
          const filt = this.ctx.createBiquadFilter();
          const g = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.detune.setValueAtTime(cents, startTime);
          osc.frequency.setValueAtTime(freq, startTime);

          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(1800, startTime);

          g.gain.setValueAtTime(0.001, startTime);
          g.gain.linearRampToValueAtTime(0.06, startTime + 0.35); // Slow string attack
          g.gain.setValueAtTime(0.06, startTime + barSec - 0.2);
          g.gain.linearRampToValueAtTime(0.001, startTime + barSec);

          osc.connect(filt);
          filt.connect(g);
          g.connect(this.masterGain);

          osc.start(startTime);
          osc.stop(startTime + barSec + 0.05);
          stops.push(() => { try { osc.stop(); } catch (e) {} });
        });
      });

      return () => stops.forEach(fn => fn());
    };

    playStringBar(this.ctx.currentTime);
    const intervalMs = barSec * 1000;
    const intervalId = setInterval(() => {
      if (!this.activeLoops.has(padId)) {
        clearInterval(intervalId);
        return;
      }
      playStringBar(this.ctx.currentTime);
    }, intervalMs);

    this.activeLoops.set(padId, {
      stopFn: () => {
        clearInterval(intervalId);
      }
    });
  }

  // Visualizer data helper (returns frequency array: 0-255)
  getByteFrequencyData(array) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array);
    }
  }

  // Time domain data helper for VU meter
  getByteTimeDomainData(array) {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(array);
    }
  }

  // Get RMS level (0.0 to 1.0) for VU meter
  getAudioLevel() {
    if (!this.analyser) return 0;
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(buffer);

    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const v = (buffer[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buffer.length);
    return Math.min(1, rms * 3.5); // scaled for dynamic needle deflection
  }
}

export const audioEngine = new AudioEngine();

