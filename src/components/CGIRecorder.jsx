/* eslint-disable */
import { useState, useRef } from 'react';

/**
 * CGI Video Recorder - Records processed video with effects
 * Supports WebM recording with configurable quality and format
 */
export default function CGIRecorder({ videoProcessorRef }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Start recording
  const startRecording = () => {
    if (!videoProcessorRef?.current) {
      alert('Video processor not initialized');
      return;
    }

    try {
      // Get the canvas stream from CGI processor
      const canvas = videoProcessorRef.current.canvasRef?.current;
      if (!canvas) {
        alert('Canvas not available');
        return;
      }

      // Capture stream at 60fps
      const stream = canvas.captureStream(60);

      // Add audio if available
      if (videoProcessorRef.current.stream) {
        const audioTracks = videoProcessorRef.current.stream.getAudioTracks();
        audioTracks.forEach(track => stream.addTrack(track));
      }

      // Configure MediaRecorder
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000 // 5 Mbps for high quality
      };

      // Fallback to vp8 if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }

      // Fallback to default if neither supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        downloadRecording(chunks);
      };

      // Start recording
      mediaRecorder.start(1000); // Capture data every 1 second
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Update duration every second
      recordingIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(duration);
      }, 1000);

      console.log('✅ Recording started:', options.mimeType);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Recording failed: ' + error.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingDuration(0);

      console.log('⏹️ Recording stopped');
    }
  };

  // Download recorded video
  const downloadRecording = (chunks) => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cgi-recording-${Date.now()}.webm`;
    a.click();

    URL.revokeObjectURL(url);

    console.log('💾 Recording downloaded');
  };

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cgi-recorder">
      {!isRecording ? (
        <button onClick={startRecording} className="btn-record start">
          <span className="record-icon">⏺️</span>
          Start Recording
        </button>
      ) : (
        <div className="recording-controls">
          <button onClick={stopRecording} className="btn-record stop">
            <span className="record-icon recording-pulse">⏺️</span>
            Stop Recording
          </button>
          <div className="recording-duration">
            {formatDuration(recordingDuration)}
          </div>
        </div>
      )}

      <style jsx>{`
        .cgi-recorder {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .recording-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-record {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-record.start {
          background: #dc2626;
          color: white;
        }

        .btn-record.start:hover {
          background: #b91c1c;
          transform: scale(1.05);
        }

        .btn-record.stop {
          background: #404040;
          color: white;
        }

        .btn-record.stop:hover {
          background: #505050;
        }

        .record-icon {
          font-size: 18px;
        }

        .recording-pulse {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .recording-duration {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
          padding: 8px 16px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 6px;
          border: 2px solid #dc2626;
        }
      `}</style>
    </div>
  );
}
