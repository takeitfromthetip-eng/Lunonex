import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MicoAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Mico 🧠, your AI assistant powered by Microsoft Copilot!\n\nI can help you with:\n✅ Coding questions\n✅ How-to guides\n✅ Feature explanations\n✅ General assistance\n\n💡 Want a new feature? Type: /suggest [your idea]" }
    ]);
    const [input, setInput] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);

    const executeTool = async (toolName, toolInput) => {
        try {
            const response = await fetch(`${API_URL}/api/mico/execute-tool`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolName, toolInput })
            });
            return await response.json();
        } catch (error) {
            console.error(`Failed to execute ${toolName}:`, error);
            return { success: false, error: error.message };
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage = input.trim();

        // Check if it's a suggestion command
        if (userMessage.startsWith('/suggest ')) {
            await handleSuggestion(userMessage.slice(9).trim());
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsThinking(true);

        try {
            // Send message to Mico chat API
            const response = await fetch(`${API_URL}/api/mico/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get response');
            }

            // Show Claude's thinking/response
            if (data.response.content) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response.content
                }]);
            }

            // Execute any tools Claude wants to use
            if (data.response.toolUses && data.response.toolUses.length > 0) {
                for (const toolUse of data.response.toolUses) {
                    // Show tool execution in chat
                    setMessages(prev => [...prev, {
                        role: 'system',
                        content: `🔧 Executing: ${toolUse.name}...`
                    }]);

                    const toolResult = await executeTool(toolUse.name, toolUse.input);

                    // Show tool result
                    const resultText = toolResult.success
                        ? `✅ ${toolUse.name} completed`
                        : `❌ ${toolUse.name} failed: ${toolResult.error}`;

                    setMessages(prev => [...prev, {
                        role: 'system',
                        content: resultText
                    }]);

                    // If there are more tools to execute or Claude needs to continue,
                    // we'd send the tool results back to Claude here
                    // For now, showing results to user
                }
            }

            // Update conversation history
            setConversationHistory(data.conversationHistory || []);

        } catch (error) {
            console.error('Mico error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Service temporarily unavailable. Please try again or contact support.`
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSuggestion = async (suggestion) => {
        if (!suggestion || suggestion.length < 20) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: '⚠️ Suggestion too short. Please provide more details (at least 20 characters).'
            }]);
            setInput('');
            return;
        }

        setMessages(prev => [...prev, {
            role: 'user',
            content: `💡 Suggestion: ${suggestion}`
        }]);
        setInput('');
        setIsThinking(true);

        try {
            const response = await fetch(`${API_URL}/api/mico-suggestion-pipeline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'anonymous', // Set via auth context when available
                    email: 'anonymous@fortheweebs.com',
                    tier: 'free',
                    suggestion
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message
                }]);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Suggestion error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Failed to submit suggestion. Please try again.'
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    cursor: 'pointer',
                    fontSize: '1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Open Mico Assistant"
            >
                🧠
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            width: isMinimized ? '300px' : '380px',
            height: isMinimized ? '60px' : '500px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '16px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <div>
                        <div style={{ fontWeight: '700' }}>Mico AI Developer</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Claude-Powered</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        {isMinimized ? '□' : '_'}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : msg.role === 'system' ? 'center' : 'flex-start',
                                    maxWidth: msg.role === 'system' ? '90%' : '80%',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    background: msg.role === 'user' ? '#667eea' : msg.role === 'system' ? '#fef3c7' : '#f3f4f6',
                                    color: msg.role === 'user' ? '#fff' : '#1f2937',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    fontStyle: msg.role === 'system' ? 'italic' : 'normal'
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isThinking && (
                            <div style={{
                                alignSelf: 'flex-start',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                fontSize: '0.875rem'
                            }}>
                                🧠 Thinking...
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me to build something..."
                            disabled={isThinking}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                opacity: isThinking ? 0.6 : 1
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isThinking}
                            style={{
                                padding: '10px 16px',
                                background: isThinking ? '#9ca3af' : '#667eea',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isThinking ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
