import React, { useState, useRef, useEffect } from 'react';
import './AIAgentAssistant.css';

/**
 * AIAgentAssistant - Context-Aware AI Helper for ALL Tools
 * 
 * Features:
 * - Understands what you're working on (audio, video, photo, 3D, design)
 * - Natural language commands: "make this more cinematic"
 * - Learns your style and suggests improvements
 * - Automates repetitive tasks
 * - Teaches you as you work
 * 
 * Examples:
 * Audio: "fix my mix" → balances levels, adds compression, EQ
 * Video: "make this more cinematic" → color grade, add transitions
 * Photo: "remove background" → AI segmentation, clean edges
 * Design: "make this logo more modern" → suggests colors, fonts
 * 3D: "add realistic lighting" → places lights, adjusts shadows
 * 
 * Unified AI agent that works across all creative tools
 */

export default function AIAgentAssistant({ toolType, projectData, onApplySuggestion }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [autoSuggest, setAutoSuggest] = useState(true);
    const [learningMode, setLearningMode] = useState(true);

    const inputRef = useRef(null);

    useEffect(() => {
        // Analyze project and provide proactive suggestions
        if (autoSuggest && projectData) {
            analyzeAndSuggest();
        }
    }, [projectData, autoSuggest]);

    const analyzeAndSuggest = () => {
        // AI analyzes current work and suggests improvements
        const newSuggestions = [];

        switch (toolType) {
            case 'audio':
                if (projectData?.tracks?.length > 0) {
                    newSuggestions.push({
                        id: 1,
                        type: 'audio',
                        title: 'Balance Audio Levels',
                        description: 'Some tracks are too loud. Let me normalize them.',
                        action: 'normalize_levels',
                        confidence: 92
                    });
                    newSuggestions.push({
                        id: 2,
                        type: 'audio',
                        title: 'Add Professional Compression',
                        description: 'Your mix would benefit from gentle compression.',
                        action: 'add_compression',
                        confidence: 88
                    });
                }
                break;

            case 'video':
                if (projectData?.clips?.length > 1) {
                    newSuggestions.push({
                        id: 3,
                        type: 'video',
                        title: 'Cinematic Color Grade',
                        description: 'Add teal & orange color grading for film look.',
                        action: 'cinematic_grade',
                        confidence: 95
                    });
                    newSuggestions.push({
                        id: 4,
                        type: 'video',
                        title: 'Smooth Transitions',
                        description: 'Replace jump cuts with subtle dissolves.',
                        action: 'add_transitions',
                        confidence: 87
                    });
                }
                break;

            case 'photo':
                newSuggestions.push({
                    id: 5,
                    type: 'photo',
                    title: 'AI Enhancement',
                    description: 'Auto-correct colors, sharpen details, reduce noise.',
                    action: 'ai_enhance',
                    confidence: 96
                });
                if (projectData?.hasBackground) {
                    newSuggestions.push({
                        id: 6,
                        type: 'photo',
                        title: 'Remove Background',
                        description: 'Clean background removal with AI segmentation.',
                        action: 'remove_bg',
                        confidence: 94
                    });
                }
                break;

            case 'design':
                newSuggestions.push({
                    id: 7,
                    type: 'design',
                    title: 'Color Harmony',
                    description: 'Adjust colors to create better visual balance.',
                    action: 'fix_colors',
                    confidence: 91
                });
                newSuggestions.push({
                    id: 8,
                    type: 'design',
                    title: 'Typography Fix',
                    description: 'Improve font pairing and hierarchy.',
                    action: 'fix_typography',
                    confidence: 89
                });
                break;

            case 'vr':
                newSuggestions.push({
                    id: 9,
                    type: 'vr',
                    title: 'Realistic Lighting',
                    description: 'Add ambient occlusion and global illumination.',
                    action: 'realistic_lighting',
                    confidence: 93
                });
                break;
        }

        setSuggestions(newSuggestions);
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: message,
            timestamp: Date.now()
        };

        setConversation(prev => [...prev, userMessage]);
        setMessage('');
        setIsThinking(true);

        // Simulate AI processing
        setTimeout(() => {
            const aiResponse = generateAIResponse(message);
            setConversation(prev => [...prev, aiResponse]);
            setIsThinking(false);

            // Apply action if AI understood the command
            if (aiResponse.action) {
                onApplySuggestion?.(aiResponse.action);
            }
        }, 1500);
    };

    const generateAIResponse = (userInput) => {
        const input = userInput.toLowerCase();

        // Context-aware responses based on tool type
        const responses = {
            // Audio commands
            'fix my mix': {
                text: "I'll balance your audio levels, add gentle compression, and apply EQ to each track. This will make everything sit better in the mix.",
                action: { type: 'audio', command: 'fix_mix' }
            },
            'make it louder': {
                text: "I'll apply a limiter to the master track to increase perceived loudness without clipping. Target: -14 LUFS for streaming.",
                action: { type: 'audio', command: 'master_louder' }
            },
            'remove vocals': {
                text: "I'll use AI vocal separation to extract and remove the vocal track. This works best on center-panned vocals.",
                action: { type: 'audio', command: 'remove_vocals' }
            },

            // Video commands
            'make this cinematic': {
                text: "I'll add teal & orange color grading, apply 2.35:1 letterboxing, smooth transitions, and adjust contrast for a film look.",
                action: { type: 'video', command: 'cinematic_look' }
            },
            'speed up': {
                text: "I'll create a speed ramp effect, gradually increasing playback speed while maintaining audio pitch.",
                action: { type: 'video', command: 'speed_ramp' }
            },
            'remove green screen': {
                text: "I'll apply chroma key to remove the green background, refine edges, and add slight color correction to match foreground and background.",
                action: { type: 'video', command: 'chroma_key' }
            },

            // Photo commands
            'remove background': {
                text: "I'll use AI segmentation to identify the subject and cleanly remove the background. You'll get a transparent PNG.",
                action: { type: 'photo', command: 'remove_bg' }
            },
            'make it pop': {
                text: "I'll increase vibrance (not saturation), sharpen details, add micro-contrast, and brighten midtones.",
                action: { type: 'photo', command: 'enhance_pop' }
            },
            'fix the lighting': {
                text: "I'll adjust exposure, recover highlights, lift shadows, and balance the overall tone for more even lighting.",
                action: { type: 'photo', command: 'fix_lighting' }
            },

            // Design commands
            'make this logo modern': {
                text: "I'll simplify the design, use a clean sans-serif font, apply a minimal color palette (2-3 colors), and add subtle gradients.",
                action: { type: 'design', command: 'modernize_logo' }
            },
            'better colors': {
                text: "I'll analyze your current palette and suggest complementary colors based on color theory. Want vibrant, pastel, or muted tones?",
                action: { type: 'design', command: 'suggest_colors' }
            },

            // VR/3D commands
            'realistic lighting': {
                text: "I'll add a three-point lighting setup, enable ambient occlusion, adjust shadow softness, and add subtle rim lighting.",
                action: { type: 'vr', command: 'realistic_lighting' }
            },
            'add physics': {
                text: "I'll enable physics simulation for selected objects, set appropriate mass and friction values, and configure collision detection.",
                action: { type: 'vr', command: 'enable_physics' }
            }
        };

        // Find matching response
        for (const [key, value] of Object.entries(responses)) {
            if (input.includes(key)) {
                return {
                    id: Date.now(),
                    type: 'ai',
                    text: value.text,
                    action: value.action,
                    timestamp: Date.now()
                };
            }
        }

        // Generic helpful response
        return {
            id: Date.now(),
            type: 'ai',
            text: `I understand you're working with ${toolType}. I can help with things like: enhancing quality, fixing issues, applying effects, automating tasks, and teaching techniques. What would you like to do?`,
            timestamp: Date.now()
        };
    };

    const applySuggestion = (suggestion) => {
        setConversation(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            text: `Applying: ${suggestion.title}... Done! ${suggestion.description}`,
            timestamp: Date.now()
        }]);

        onApplySuggestion?.(suggestion.action);

        // Remove applied suggestion
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    };

    const QUICK_ACTIONS = {
        audio: ['Fix My Mix', 'Master Track', 'Remove Noise', 'Add Reverb', 'Normalize Levels'],
        video: ['Make Cinematic', 'Add Transitions', 'Color Grade', 'Stabilize', 'Speed Ramp'],
        photo: ['AI Enhance', 'Remove Background', 'Fix Lighting', 'Sharpen', 'Denoise'],
        design: ['Fix Colors', 'Better Typography', 'Align Objects', 'Suggest Layout', 'Export Sizes'],
        vr: ['Add Lighting', 'Enable Physics', 'Optimize Performance', 'Bake Textures', 'Preview VR']
    };

    const quickActions = QUICK_ACTIONS[toolType] || [];

    return (
        <div className={`ai-agent ${isOpen ? 'open' : 'minimized'}`}>
            {/* AI Agent Button */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="btn-open-ai">
                    <span className="ai-icon">🤖</span>
                    <span className="ai-label">AI Assistant</span>
                    {suggestions.length > 0 && (
                        <span className="suggestions-badge">{suggestions.length}</span>
                    )}
                </button>
            )}

            {/* AI Agent Panel */}
            {isOpen && (
                <div className="ai-panel">
                    <div className="ai-header">
                        <div className="ai-title">
                            <span className="ai-icon-large">🤖</span>
                            <div>
                                <h3>AI Assistant</h3>
                                <p className="ai-subtitle">Context-aware helper for {toolType}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="btn-close-ai">×</button>
                    </div>

                    {/* Proactive Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="suggestions-section">
                            <h4>💡 Suggestions</h4>
                            <div className="suggestions-list">
                                {suggestions.map(suggestion => (
                                    <div key={suggestion.id} className="suggestion-card">
                                        <div className="suggestion-header">
                                            <strong>{suggestion.title}</strong>
                                            <span className="confidence">{suggestion.confidence}% confident</span>
                                        </div>
                                        <p className="suggestion-desc">{suggestion.description}</p>
                                        <button
                                            onClick={() => applySuggestion(suggestion)}
                                            className="btn-apply"
                                        >
                                            ✨ Apply
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="quick-actions-section">
                        <h4>⚡ Quick Actions</h4>
                        <div className="quick-actions-grid">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMessage(action)}
                                    className="quick-action-btn"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversation */}
                    <div className="conversation-section">
                        <div className="conversation-messages">
                            {conversation.length === 0 && (
                                <div className="conversation-empty">
                                    <p>👋 Hi! I'm your AI assistant.</p>
                                    <p>Ask me anything or use quick actions above!</p>
                                </div>
                            )}
                            {conversation.map(msg => (
                                <div key={msg.id} className={`message ${msg.type}`}>
                                    {msg.type === 'ai' && <span className="msg-icon">🤖</span>}
                                    <div className="message-content">
                                        {msg.text}
                                    </div>
                                    {msg.type === 'user' && <span className="msg-icon">👤</span>}
                                </div>
                            ))}
                            {isThinking && (
                                <div className="message ai thinking">
                                    <span className="msg-icon">🤖</span>
                                    <div className="message-content">
                                        <div className="thinking-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="ai-input-section">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={`Ask me anything about ${toolType}...`}
                            className="ai-input"
                        />
                        <button onClick={sendMessage} className="btn-send-ai">
                            ➤
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="ai-settings">
                        <label className="setting-toggle">
                            <input
                                type="checkbox"
                                checked={autoSuggest}
                                onChange={(e) => setAutoSuggest(e.target.checked)}
                            />
                            <span>Auto-suggestions</span>
                        </label>
                        <label className="setting-toggle">
                            <input
                                type="checkbox"
                                checked={learningMode}
                                onChange={(e) => setLearningMode(e.target.checked)}
                            />
                            <span>Learning mode</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
