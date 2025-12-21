/* eslint-disable */
import React, { useState } from 'react';
import './AICharacterTraining.css';

/**
 * AI Character Training Interface - $1000 Super Admin Powers exclusive
 * 
 * Upload custom datasets to train AI on your own anime characters/style
 * Used across ALL tools: photo enhancement, design generation, video editing, etc.
 */

export const AICharacterTraining = ({ userId, hasSuperAdminPowers }) => {
    const [trainingData, setTrainingData] = useState([]);
    const [characterName, setCharacterName] = useState('');
    const [characterDescription, setCharacterDescription] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [training, setTraining] = useState(false);
    const [trainedModels, setTrainedModels] = useState([
        {
            id: 1,
            name: 'My Waifu Style',
            type: 'Character Recognition',
            status: 'trained',
            accuracy: 94.2,
            images: 250,
            trainedAt: '2025-11-09'
        }
    ]);

    if (!hasSuperAdminPowers) {
        return (
            <div className="ai-training-locked">
                <div className="lock-message">
                    <h2>🧠 AI Character Training (Locked)</h2>
                    <p>This feature requires the <strong>$1000 Super Admin Powers</strong> tier.</p>
                    <p>Train custom AI models on your own anime characters and style.</p>
                    <button className="upgrade-button" onClick={() => window.location.href = '/?premium=true'}>
                        Unlock $1000 Tier
                    </button>
                </div>
            </div>
        );
    }

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        setUploadedFiles([...uploadedFiles, ...newFiles]);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
    };

    const startTraining = async () => {
        if (uploadedFiles.length < 20) {
            alert('⚠️ Please upload at least 20 images for effective training.\n\nRecommended: 50-200 images for best results.');
            return;
        }

        if (!characterName) {
            alert('Please provide a character/style name');
            return;
        }

        setTraining(true);

        // Simulate training process
        setTimeout(() => {
            const newModel = {
                id: Date.now(),
                name: characterName,
                description: characterDescription,
                type: 'Custom Character Model',
                status: 'trained',
                accuracy: (85 + Math.random() * 12).toFixed(1),
                images: uploadedFiles.length,
                trainedAt: new Date().toLocaleDateString(),
                usageCount: 0
            };

            setTrainedModels([newModel, ...trainedModels]);
            setTraining(false);
            setCharacterName('');
            setCharacterDescription('');
            setUploadedFiles([]);

            alert(`🎉 AI Model Trained Successfully!\n\nModel: ${newModel.name}\nAccuracy: ${newModel.accuracy}%\nImages Used: ${newModel.images}\n\nThis model is now available across ALL your tools:\n• Photo enhancement\n• Design generation\n• Comic creation\n• Video editing\n• AR/VR content\n\nStart using it in any tool!`);
        }, 3000);
    };

    const deleteModel = (modelId) => {
        if (confirm('Delete this AI model? This cannot be undone.')) {
            setTrainedModels(trainedModels.filter(m => m.id !== modelId));
        }
    };

    return (
        <div className="ai-training-container">
            {/* Header */}
            <div className="ai-training-header">
                <h1>🧠 AI Character Training</h1>
                <p className="header-subtitle">
                    Train custom AI models on your own anime characters and style.
                    Use them across ALL tools: photos, design, comics, video, AR/VR, and more.
                </p>
                <div className="exclusivity-badge">
                    👑 $1000 Tier Exclusive Feature
                </div>
            </div>

            {/* Training Section */}
            <div className="training-section">
                <h2>Train New AI Model</h2>

                <div className="training-grid">
                    {/* Upload Area */}
                    <div className="upload-section">
                        <h3>1. Upload Training Images</h3>
                        <p className="upload-instruction">
                            Upload 20-200 images of your character/style. More images = better accuracy.
                        </p>

                        <div className="upload-area" onClick={() => document.getElementById('training-file-input').click()}>
                            <span className="upload-icon">📁</span>
                            <p>Click to upload images</p>
                            <small>PNG, JPG - Multiple files supported</small>
                            <input
                                id="training-file-input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="uploaded-files-grid">
                                {uploadedFiles.map(file => (
                                    <div key={file.id} className="uploaded-file">
                                        <img src={file.preview} alt={file.name} />
                                        <button className="remove-file-btn" onClick={() => removeFile(file.id)}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="upload-stats">
                            <strong>{uploadedFiles.length}</strong> images uploaded
                            {uploadedFiles.length < 20 && (
                                <span className="upload-warning"> (need {20 - uploadedFiles.length} more)</span>
                            )}
                        </div>
                    </div>

                    {/* Model Details */}
                    <div className="model-details-section">
                        <h3>2. Configure AI Model</h3>

                        <div className="form-group">
                            <label>Character/Style Name *</label>
                            <input
                                type="text"
                                placeholder="e.g., My Custom Waifu"
                                value={characterName}
                                onChange={(e) => setCharacterName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                placeholder="Describe the character's features, style, clothing, etc."
                                value={characterDescription}
                                onChange={(e) => setCharacterDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="training-tips">
                            <h4>💡 Training Tips:</h4>
                            <ul>
                                <li>Use high-quality images (at least 512x512px)</li>
                                <li>Include varied angles and poses</li>
                                <li>Consistent lighting helps accuracy</li>
                                <li>20-50 images: Good</li>
                                <li>50-100 images: Better</li>
                                <li>100-200 images: Best</li>
                            </ul>
                        </div>

                        <button
                            className="train-button"
                            onClick={startTraining}
                            disabled={training || uploadedFiles.length < 20 || !characterName}
                        >
                            {training ? '🔄 Training AI Model...' : '🚀 Start Training'}
                        </button>

                        {training && (
                            <div className="training-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '45%' }}></div>
                                </div>
                                <p>Training in progress... This may take 2-5 minutes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trained Models */}
            <div className="trained-models-section">
                <h2>Your Trained AI Models</h2>
                <p className="models-subtitle">
                    These models work across ALL your tools automatically. Select them when generating content.
                </p>

                <div className="models-grid">
                    {trainedModels.map(model => (
                        <div key={model.id} className="model-card">
                            <div className="model-header">
                                <h3>{model.name}</h3>
                                <span className={`status-badge ${model.status}`}>
                                    {model.status === 'trained' ? '✅ Ready' : '⏳ Training'}
                                </span>
                            </div>

                            <div className="model-stats">
                                <div className="stat">
                                    <span className="stat-label">Accuracy</span>
                                    <span className="stat-value">{model.accuracy}%</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Training Images</span>
                                    <span className="stat-value">{model.images}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Times Used</span>
                                    <span className="stat-value">{model.usageCount || 0}</span>
                                </div>
                            </div>

                            <p className="model-description">{model.description || 'No description'}</p>
                            <p className="model-date">Trained: {model.trainedAt}</p>

                            <div className="model-actions">
                                <button className="use-model-btn">Use in Tools</button>
                                <button className="retrain-btn">Retrain</button>
                                <button className="delete-btn" onClick={() => deleteModel(model.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="how-it-works-section">
                <h2>🎯 How Custom AI Models Work</h2>
                <div className="how-it-works-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Upload & Train</h3>
                        <p>Upload 20-200 images of your character. AI learns unique features and style.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Auto-Available</h3>
                        <p>Model becomes available across ALL tools: Photo, Design, Comics, Video, AR/VR.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Generate Content</h3>
                        <p>Select your model when creating content. AI generates in your exact style.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">4</div>
                        <h3>Improve Over Time</h3>
                        <p>Retrain with more images anytime to improve accuracy and results.</p>
                    </div>
                </div>
            </div>

            {/* Use Cases */}
            <div className="use-cases-section">
                <h2>💡 Use Cases</h2>
                <div className="use-cases-grid">
                    <div className="use-case-card">
                        <span className="use-case-icon">📸</span>
                        <h4>Photo Enhancement</h4>
                        <p>AI recognizes your character in photos and enhances with your trained style</p>
                    </div>
                    <div className="use-case-card">
                        <span className="use-case-icon">🎨</span>
                        <h4>Design Generation</h4>
                        <p>Generate new artwork in your character's exact style automatically</p>
                    </div>
                    <div className="use-case-card">
                        <span className="use-case-icon">📚</span>
                        <h4>Comic Creation</h4>
                        <p>AI maintains character consistency across all comic panels</p>
                    </div>
                    <div className="use-case-card">
                        <span className="use-case-icon">🎬</span>
                        <h4>Video Content</h4>
                        <p>Animate your character with AI motion and style transfer</p>
                    </div>
                    <div className="use-case-card">
                        <span className="use-case-icon">🎭</span>
                        <h4>AR/VR Models</h4>
                        <p>Generate 3D models matching your 2D character's style</p>
                    </div>
                    <div className="use-case-card">
                        <span className="use-case-icon">🤖</span>
                        <h4>Auto-Generation</h4>
                        <p>Set AI to auto-generate content in your style daily/weekly</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICharacterTraining;
