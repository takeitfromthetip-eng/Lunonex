/* eslint-disable */
/**
 * Web Audio Processor - Real audio effects and processing
 * Implements professional audio effects using Web Audio API
 * Supports local processing and cloud project sync
 */

import { storageManager, STORES } from './storageManager';

class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.tracks = new Map(); // trackId -> { source, gainNode, effects, ... }
    this.masterGain = null;
    this.analyser = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Web Audio API
   */
  async init() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // Analyzer for visualizations
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.masterGain.connect(this.analyser);

      this.isInitialized = true;
      console.log('✅ Web Audio API initialized');
    } catch (error) {
      console.error('Audio init error:', error);
      throw error;
    }
  }

  /**
   * Create audio track from file
   */
  async createTrack(trackId, audioFile, options = {}) {
    await this.init();

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume || 1.0;

      // Create stereo panner for pan control
      const panNode = this.audioContext.createStereoPanner();
      panNode.pan.value = options.pan || 0;

      // Connect chain: source -> gain -> pan -> master
      source.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(this.masterGain);

      // Store track data
      this.tracks.set(trackId, {
        source,
        gainNode,
        panNode,
        audioBuffer,
        effects: [],
        isMuted: false,
        isSolo: false,
        fileName: audioFile.name
      });

      return { duration: audioBuffer.duration, sampleRate: audioBuffer.sampleRate };

    } catch (error) {
      console.error('Track creation error:', error);
      throw error;
    }
  }

  /**
   * Apply effect to track
   */
  applyEffect(trackId, effectType, options = {}) {
    const track = this.tracks.get(trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);

    let effectNode;

    switch (effectType) {
      case 'reverb':
        effectNode = this.createReverb(options);
        break;
      case 'delay':
        effectNode = this.createDelay(options);
        break;
      case 'compressor':
        effectNode = this.createCompressor(options);
        break;
      case 'distortion':
        effectNode = this.createDistortion(options);
        break;
      case 'eq':
        effectNode = this.createEQ(options);
        break;
      case 'chorus':
        effectNode = this.createChorus(options);
        break;
      case 'phaser':
        effectNode = this.createPhaser(options);
        break;
      case 'flanger':
        effectNode = this.createFlanger(options);
        break;
      case 'bitcrusher':
        effectNode = this.createBitcrusher(options);
        break;
      default:
        throw new Error(`Unknown effect: ${effectType}`);
    }

    // Insert effect into chain
    const panNode = track.panNode;
    panNode.disconnect();
    panNode.connect(effectNode.input);
    effectNode.output.connect(this.masterGain);

    track.effects.push({ type: effectType, node: effectNode, options });

    return effectNode;
  }

  /**
   * Create reverb effect
   */
  createReverb(options = {}) {
    const { decay = 2, preDelay = 0.05 } = options;

    const convolver = this.audioContext.createConvolver();
    const impulse = this.createImpulseResponse(decay, preDelay);
    convolver.buffer = impulse;

    return { input: convolver, output: convolver };
  }

  /**
   * Create impulse response for reverb
   */
  createImpulseResponse(decay, preDelay) {
    const rate = this.audioContext.sampleRate;
    const length = rate * decay;
    const impulse = this.audioContext.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / rate;
      impulseL[i] = (Math.random() * 2 - 1) * Math.exp(-n / decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.exp(-n / decay);
    }

    return impulse;
  }

  /**
   * Create delay effect
   */
  createDelay(options = {}) {
    const { time = 0.5, feedback = 0.4, mix = 0.5 } = options;

    const delay = this.audioContext.createDelay(5.0);
    delay.delayTime.value = time;

    const feedbackNode = this.audioContext.createGain();
    feedbackNode.gain.value = feedback;

    const mixNode = this.audioContext.createGain();
    mixNode.gain.value = mix;

    delay.connect(feedbackNode);
    feedbackNode.connect(delay);
    delay.connect(mixNode);

    return { input: delay, output: mixNode };
  }

  /**
   * Create compressor effect
   */
  createCompressor(options = {}) {
    const {
      threshold = -24,
      knee = 30,
      ratio = 12,
      attack = 0.003,
      release = 0.25
    } = options;

    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = threshold;
    compressor.knee.value = knee;
    compressor.ratio.value = ratio;
    compressor.attack.value = attack;
    compressor.release.value = release;

    return { input: compressor, output: compressor };
  }

  /**
   * Create distortion effect
   */
  createDistortion(options = {}) {
    const { amount = 50 } = options;

    const waveshaper = this.audioContext.createWaveShaper();
    waveshaper.curve = this.makeDistortionCurve(amount);
    waveshaper.oversample = '4x';

    return { input: waveshaper, output: waveshaper };
  }

  /**
   * Create distortion curve
   */
  makeDistortionCurve(amount) {
    const k = amount;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    return curve;
  }

  /**
   * Create EQ (3-band)
   */
  createEQ(options = {}) {
    const { low = 0, mid = 0, high = 0 } = options;

    const lowShelf = this.audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 320;
    lowShelf.gain.value = low;

    const mid1 = this.audioContext.createBiquadFilter();
    mid1.type = 'peaking';
    mid1.frequency.value = 1000;
    mid1.Q.value = 0.5;
    mid1.gain.value = mid;

    const highShelf = this.audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 3200;
    highShelf.gain.value = high;

    // Chain them
    lowShelf.connect(mid1);
    mid1.connect(highShelf);

    return { input: lowShelf, output: highShelf };
  }

  /**
   * Create chorus effect
   */
  createChorus(options = {}) {
    const { rate = 1.5, depth = 0.002, feedback = 0.1 } = options;

    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = rate;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = depth;

    const delay = this.audioContext.createDelay();
    delay.delayTime.value = 0.020;

    const feedbackNode = this.audioContext.createGain();
    feedbackNode.gain.value = feedback;

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    delay.connect(feedbackNode);
    feedbackNode.connect(delay);

    lfo.start();

    return { input: delay, output: delay, lfo };
  }

  /**
   * Create phaser effect
   */
  createPhaser(options = {}) {
    const { rate = 0.5, depth = 1, stages = 4 } = options;

    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = rate;

    const filters = [];
    for (let i = 0; i < stages; i++) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.value = 350 + i * 100;
      filters.push(filter);
    }

    // Chain filters
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(filters[0].frequency);

    lfo.start();

    return { input: filters[0], output: filters[filters.length - 1], lfo };
  }

  /**
   * Create flanger effect
   */
  createFlanger(options = {}) {
    return this.createChorus({ ...options, depth: 0.005 });
  }

  /**
   * Create bitcrusher effect
   */
  createBitcrusher(options = {}) {
    const { bits = 4, normfreq = 0.1 } = options;

    const bufferSize = 4096;
    const processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    const step = Math.pow(0.5, bits);
    const phaser = 0;
    const last = 0;

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const sample = input[i];
        output[i] = step * Math.floor(sample / step + 0.5);
      }
    };

    return { input: processor, output: processor };
  }

  /**
   * Record track
   */
  async startRecording(trackId, options = {}) {
    await this.init();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: options.echoCancellation !== false,
          noiseSuppression: options.noiseSuppression !== false,
          autoGainControl: options.autoGainControl !== false
        } 
      });

      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([blob], `recording_${trackId}.webm`, { type: 'audio/webm' });
        
        // Create track from recording
        await this.createTrack(trackId, audioFile);

        // Save to storage
        if (options.userId) {
          await storageManager.saveLocal(STORES.AUDIO, {
            userId: options.userId,
            name: audioFile.name,
            blob,
            type: 'audio/webm',
            size: blob.size,
            trackId
          });
        }
      };

      mediaRecorder.start();

      this.tracks.set(trackId, {
        ...this.tracks.get(trackId),
        mediaRecorder,
        stream
      });

      return mediaRecorder;

    } catch (error) {
      console.error('Recording error:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(trackId) {
    const track = this.tracks.get(trackId);
    if (!track?.mediaRecorder) return;

    track.mediaRecorder.stop();
    track.stream.getTracks().forEach(t => t.stop());
  }

  /**
   * Set track volume
   */
  setVolume(trackId, volume) {
    const track = this.tracks.get(trackId);
    if (track?.gainNode) {
      track.gainNode.gain.value = volume;
    }
  }

  /**
   * Set track pan
   */
  setPan(trackId, pan) {
    const track = this.tracks.get(trackId);
    if (track?.panNode) {
      track.panNode.pan.value = pan;
    }
  }

  /**
   * Mute/unmute track
   */
  setMute(trackId, muted) {
    const track = this.tracks.get(trackId);
    if (track?.gainNode) {
      track.isMuted = muted;
      track.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  /**
   * Solo track
   */
  setSolo(trackId, solo) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    track.isSolo = solo;

    // If soloing, mute all other tracks
    if (solo) {
      this.tracks.forEach((t, id) => {
        if (id !== trackId) {
          t.gainNode.gain.value = 0;
        } else {
          t.gainNode.gain.value = 1;
        }
      });
    } else {
      // Unmute all non-muted tracks
      this.tracks.forEach((t) => {
        if (!t.isMuted) {
          t.gainNode.gain.value = 1;
        }
      });
    }
  }

  /**
   * Get audio analyser data for visualizations
   */
  getAnalyserData() {
    if (!this.analyser) return null;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return { dataArray, bufferLength };
  }

  /**
   * Export mixed audio
   */
  async exportAudio(format = 'wav', userId = null) {
    // This requires MediaRecorder or offline audio context
    // Simplified version - in production use OfflineAudioContext
    const dest = this.audioContext.createMediaStreamDestination();
    this.masterGain.connect(dest);

    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        if (userId) {
          await storageManager.saveLocal(STORES.AUDIO, {
            userId,
            name: `export_${Date.now()}.webm`,
            blob,
            type: 'audio/webm',
            size: blob.size
          });
        }

        resolve({ blob, url });
      };

      mediaRecorder.onerror = reject;

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 100); // Quick capture
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.tracks.forEach(track => {
      if (track.source) track.source.disconnect();
      if (track.gainNode) track.gainNode.disconnect();
      if (track.panNode) track.panNode.disconnect();
    });
    
    this.tracks.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton
export const audioProcessor = new AudioProcessor();
