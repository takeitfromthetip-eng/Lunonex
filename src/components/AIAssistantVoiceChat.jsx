import React, { useState, useEffect, useRef } from 'react';

const AIAssistantVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processCommand = async (text) => {
    // Pattern-based offline AI processing
    const lowerText = text.toLowerCase();
    let aiResponse = '';
    let action = null;

    // Strip/undress commands
    if (lowerText.includes('strip') || lowerText.includes('undress') || lowerText.includes('take off')) {
      action = { type: 'animate', animation: 'strip' };
      const responses = {
        friendly: "Okay! Starting the animation...",
        flirty: "Mmm, as you wish~ Watch me strip for you...",
        professional: "Initiating disrobing animation sequence.",
        playful: "Hehe, here we go! Let me show you~",
      };
      aiResponse = responses[personality];
      if (window.aiAssistantAnimator) {
        window.aiAssistantAnimator.playAnimation('strip');
      }
    }
    // Pose commands
    else if (lowerText.includes('pose') || lowerText.includes('position')) {
      action = { type: 'pose', pose: 'custom' };
      aiResponse = "Striking a pose for you! Would you like me to capture this?";
      if (window.aiAssistantAnimator) {
        window.aiAssistantAnimator.playAnimation('pose');
      }
    }
    // Video generation with AI assistant
    else if (lowerText.includes('generate video') || lowerText.includes('create video of you')) {
      action = { type: 'generateVideo', subject: 'self' };
      const music = lowerText.match(/with (.*?) (?:song|music|soundtrack|album)/);
      const soundtrack = music ? music[1] : null;
      aiResponse = soundtrack
        ? `Creating a video of me with "${soundtrack}"! This will take a moment...`
        : "Creating a video of me for you! This will take a moment...";
      if (window.videoGenerator) {
        window.videoGenerator.generate({
          subject: 'ai_assistant',
          poses: 'strip_sequence',
          soundtrack: soundtrack,
          captureFrames: true
        });
      }
    }
    // Still frame capture
    else if (lowerText.includes('still frame') || lowerText.includes('capture') || lowerText.includes('screenshot')) {
      action = { type: 'captureFrame' };
      aiResponse = "Capturing still frames from each pose!";
      if (window.aiAssistantAnimator) {
        window.aiAssistantAnimator.captureFrames();
      }
    }
    // Music/soundtrack request
    else if (lowerText.includes('soundtrack') || lowerText.includes('music') || lowerText.includes('play')) {
      const album = lowerText.match(/(?:with|use|play)\s+(.+?)(?:\s+album|\s+by|\s+soundtrack|$)/);
      if (album) {
        action = { type: 'audio', track: album[1].trim() };
        aiResponse = `Playing "${album[1].trim()}" for you!`;
        if (window.audioPlayer) {
          window.audioPlayer.play(album[1].trim());
        }
      }
    }
    // Content creation commands
    else if (lowerText.includes('create') || lowerText.includes('make') || lowerText.includes('generate')) {
      if (lowerText.includes('video')) {
        aiResponse = "Opening video editor! What would you like to create?";
        action = { type: 'navigate', tab: 'video' };
      } else if (lowerText.includes('image') || lowerText.includes('picture') || lowerText.includes('photo')) {
        aiResponse = "Opening photo editor! Let's create something beautiful!";
        action = { type: 'navigate', tab: 'photo' };
      } else if (lowerText.includes('music') || lowerText.includes('song')) {
        aiResponse = "Opening audio studio! Let's make some music!";
        action = { type: 'navigate', tab: 'audio' };
      } else {
        aiResponse = "I'm ready to help you create something amazing! What would you like to make?";
      }
    }
    // Personality responses
    else if (lowerText.includes('how are you') || lowerText.includes('hello') || lowerText.includes('hi')) {
      const greetings = {
        friendly: "Hi there! I'm doing great! How can I assist you today?",
        flirty: "Hey sweetie~ I'm doing wonderful now that you're here. What can I do for you?",
        professional: "Good day. I'm functioning optimally. How may I assist you?",
        playful: "Hehe, I'm fantastic! Ready to create something fun together!",
      };
      aiResponse = greetings[personality] || greetings.friendly;
    }
    // Action commands
    else if (lowerText.includes('show me') || lowerText.includes('display') || lowerText.includes('open')) {
      aiResponse = "Opening the requested view for you!";
    }
    else {
      // Default conversational response
      aiResponse = "I hear you! Let me help with that.";
    }

    setResponse(aiResponse);
    speak(aiResponse);

    // Execute tab navigation if needed
    if (action && action.type === 'navigate') {
      setTimeout(() => {
        const event = new CustomEvent('ai-navigate', { detail: { tab: action.tab } });
        window.dispatchEvent(event);
      }, 1000);
    }
  };

  const speak = (text) => {
    if (synthRef.current && text) {
      // Stop any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Personality-based voice settings
      const voiceSettings = {
        friendly: { pitch: 1.1, rate: 1.0 },
        flirty: { pitch: 1.3, rate: 0.9 },
        professional: { pitch: 1.0, rate: 1.1 },
        playful: { pitch: 1.4, rate: 1.2 },
      };

      const settings = voiceSettings[personality] || voiceSettings.friendly;
      utterance.pitch = settings.pitch;
      utterance.rate = settings.rate;

      // Select voice (prefer female voices)
      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira'));
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🎤 Voice Chat with AI Assistant</h2>
        <select
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          style={styles.select}
        >
          <option value="friendly">Friendly</option>
          <option value="flirty">Flirty</option>
          <option value="professional">Professional</option>
          <option value="playful">Playful</option>
        </select>
      </div>

      <div style={styles.visualizer}>
        {isListening && (
          <div style={styles.waveform}>
            <div style={{...styles.wave, animationDelay: '0s'}}></div>
            <div style={{...styles.wave, animationDelay: '0.1s'}}></div>
            <div style={{...styles.wave, animationDelay: '0.2s'}}></div>
            <div style={{...styles.wave, animationDelay: '0.3s'}}></div>
            <div style={{...styles.wave, animationDelay: '0.4s'}}></div>
          </div>
        )}
        {isSpeaking && (
          <div style={styles.speaking}>
            <span style={styles.speakingDot}>●</span>
            <span style={styles.speakingDot}>●</span>
            <span style={styles.speakingDot}>●</span>
          </div>
        )}
      </div>

      <div style={styles.transcript}>
        <h3>You said:</h3>
        <p>{transcript || 'Start speaking...'}</p>
      </div>

      <div style={styles.response}>
        <h3>Assistant:</h3>
        <p>{response || 'Waiting for your command...'}</p>
      </div>

      <div style={styles.controls}>
        {!isListening ? (
          <button onClick={startListening} style={styles.micButton}>
            🎤 Start Listening
          </button>
        ) : (
          <button onClick={stopListening} style={{...styles.micButton, background: '#ef4444'}}>
            ⏸ Stop Listening
          </button>
        )}
      </div>

      <div style={styles.features}>
        <h3>Try saying:</h3>
        <ul>
          <li>"Create a video about nature"</li>
          <li>"Generate an image of a sunset"</li>
          <li>"Make me some electronic music"</li>
          <li>"Show me my projects"</li>
          <li>"Hello, how are you?"</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
    borderRadius: '20px',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  select: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#3d3d5c',
    color: 'white',
    fontSize: '1rem',
  },
  visualizer: {
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  waveform: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  wave: {
    width: '4px',
    height: '40px',
    background: '#667eea',
    borderRadius: '2px',
    animation: 'wave 1s ease-in-out infinite',
  },
  speaking: {
    display: 'flex',
    gap: '10px',
  },
  speakingDot: {
    fontSize: '2rem',
    color: '#10b981',
    animation: 'pulse 1s ease-in-out infinite',
  },
  transcript: {
    background: 'rgba(0,0,0,0.3)',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  response: {
    background: 'rgba(102, 126, 234, 0.2)',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    border: '2px solid #667eea',
  },
  controls: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  micButton: {
    padding: '1rem 3rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '50px',
    background: '#10b981',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  features: {
    background: 'rgba(0,0,0,0.2)',
    padding: '1.5rem',
    borderRadius: '12px',
  },
};

export default AIAssistantVoiceChat;
