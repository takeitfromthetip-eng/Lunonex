/**
 * Media recording utilities for capturing CGI-processed video
 */

export class CGIRecorder {
  constructor(stream) {
    this.stream = stream;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  start(options = {}) {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    const defaultOptions = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000 // 2.5 Mbps
    };

    // Fallback to vp8 if vp9 not supported
    if (!MediaRecorder.isTypeSupported(defaultOptions.mimeType)) {
      defaultOptions.mimeType = 'video/webm;codecs=vp8';
    }

    const finalOptions = { ...defaultOptions, ...options };

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, finalOptions);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
    this.isRecording = true;
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  async download(filename = 'cgi-recording.webm') {
    const blob = await this.stop();
    
    if (!blob) {
      console.warn('No recording to download');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  getRecordingDuration() {
    if (!this.mediaRecorder) return 0;
    // Estimate based on chunks (rough approximation)
    return this.recordedChunks.length * 0.1; // seconds
  }

  isSupported() {
    return typeof MediaRecorder !== 'undefined' && 
           MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
  }
}

/**
 * Screenshot utility for CGI video
 */
export class CGIScreenshot {
  static capture(canvas, format = 'png') {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, `image/${format}`);
    });
  }

  static async download(canvas, filename = 'cgi-screenshot.png') {
    const blob = await CGIScreenshot.capture(canvas);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  static toDataURL(canvas, format = 'png', quality = 1.0) {
    return canvas.toDataURL(`image/${format}`, quality);
  }
}

/**
 * Stream utilities
 */
export class StreamUtils {
  static async captureFrame(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    
    return canvas;
  }

  static cloneStream(stream) {
    return new MediaStream(stream.getTracks().map(track => track.clone()));
  }

  static stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  static getStreamStats(stream) {
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    return {
      hasVideo: videoTracks.length > 0,
      hasAudio: audioTracks.length > 0,
      videoSettings: videoTracks[0]?.getSettings() || null,
      audioSettings: audioTracks[0]?.getSettings() || null,
      active: stream.active
    };
  }

  static async testMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        videoinput: devices.filter(d => d.kind === 'videoinput'),
        audioinput: devices.filter(d => d.kind === 'audioinput'),
        audiooutput: devices.filter(d => d.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return null;
    }
  }
}

export default {
  CGIRecorder,
  CGIScreenshot,
  StreamUtils
};
