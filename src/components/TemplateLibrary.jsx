/* eslint-disable */
// TemplateLibrary.jsx
// 50+ free templates - no more blank canvas syndrome
// Professional templates available at no extra cost

import React, { useState } from 'react';
import './TemplateLibrary.css';

const TemplateLibrary = ({ toolType, onSelectTemplate }) => {
    const [category, setCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const templates = {
        video: [
            { id: 'v1', name: 'Cinematic Intro', category: 'intro', preview: '🎬', description: 'Epic cinematic opener with particles', tags: ['cinematic', 'epic', 'intro'], downloads: 15420 },
            { id: 'v2', name: 'Lower Thirds Pack', category: 'overlay', preview: '📺', description: '10 animated lower thirds', tags: ['overlay', 'lower-third', 'professional'], downloads: 12304 },
            { id: 'v3', name: 'Transition Bundle', category: 'transition', preview: '⚡', description: '20 smooth transitions', tags: ['transition', 'smooth', 'pack'], downloads: 18765 },
            { id: 'v4', name: 'YouTube Outro', category: 'outro', preview: '👍', description: 'Subscribe + social media outro', tags: ['youtube', 'outro', 'subscribe'], downloads: 9876 },
            { id: 'v5', name: 'Vlog Template', category: 'full', preview: '📹', description: 'Complete vlog editing template', tags: ['vlog', 'youtube', 'complete'], downloads: 7654 },
            { id: 'v6', name: 'Product Showcase', category: 'commercial', preview: '📦', description: '3D product rotation template', tags: ['product', 'commercial', '3d'], downloads: 5432 },
            { id: 'v7', name: 'Social Media Pack', category: 'social', preview: '📱', description: 'IG/TikTok vertical templates', tags: ['social', 'vertical', 'mobile'], downloads: 11234 },
            { id: 'v8', name: 'Wedding Slideshow', category: 'slideshow', preview: '💒', description: 'Romantic photo slideshow', tags: ['wedding', 'slideshow', 'romantic'], downloads: 4321 },
            { id: 'v9', name: 'Travel Montage', category: 'montage', preview: '✈️', description: 'Fast-paced travel video', tags: ['travel', 'montage', 'fast'], downloads: 6543 },
            { id: 'v10', name: 'Music Video', category: 'music', preview: '🎵', description: 'Beat-synced music video template', tags: ['music', 'beat', 'sync'], downloads: 8765 }
        ],
        photo: [
            { id: 'p1', name: 'Portrait Retouch', category: 'portrait', preview: '👤', description: 'Professional portrait preset', tags: ['portrait', 'retouch', 'professional'], downloads: 23104 },
            { id: 'p2', name: 'Cinematic Grade', category: 'color', preview: '🎬', description: 'Teal and orange cinematic look', tags: ['cinematic', 'color', 'grade'], downloads: 19876 },
            { id: 'p3', name: 'Black & White', category: 'bw', preview: '⚫', description: 'Classic B&W with contrast', tags: ['black-white', 'classic', 'contrast'], downloads: 15420 },
            { id: 'p4', name: 'Golden Hour', category: 'light', preview: '🌅', description: 'Warm sunset tones', tags: ['sunset', 'warm', 'golden'], downloads: 17654 },
            { id: 'p5', name: 'Moody Dark', category: 'dark', preview: '🌑', description: 'Dark and moody aesthetic', tags: ['dark', 'moody', 'dramatic'], downloads: 12345 },
            { id: 'p6', name: 'Vintage Film', category: 'vintage', preview: '📷', description: 'Old film camera look', tags: ['vintage', 'film', 'retro'], downloads: 10234 },
            { id: 'p7', name: 'Product Photo', category: 'product', preview: '📦', description: 'Clean product photography', tags: ['product', 'clean', 'commercial'], downloads: 8765 },
            { id: 'p8', name: 'Food Photography', category: 'food', preview: '🍔', description: 'Appetizing food presets', tags: ['food', 'restaurant', 'appetizing'], downloads: 9876 },
            { id: 'p9', name: 'Landscape Epic', category: 'landscape', preview: '🏔️', description: 'Dramatic landscape enhancement', tags: ['landscape', 'nature', 'dramatic'], downloads: 14321 },
            { id: 'p10', name: 'Street Photography', category: 'street', preview: '🏙️', description: 'Urban street style', tags: ['street', 'urban', 'city'], downloads: 7654 }
        ],
        audio: [
            { id: 'a1', name: 'Podcast Master', category: 'podcast', preview: '🎙️', description: 'Full podcast mastering chain', tags: ['podcast', 'master', 'voice'], downloads: 11234 },
            { id: 'a2', name: 'Music Master', category: 'music', preview: '🎵', description: 'Professional music mastering', tags: ['music', 'master', 'professional'], downloads: 9876 },
            { id: 'a3', name: 'Vocal Tuning', category: 'vocal', preview: '🎤', description: 'Auto-tune and vocal effects', tags: ['vocal', 'autotune', 'effects'], downloads: 8765 },
            { id: 'a4', name: 'Bass Boost', category: 'mixing', preview: '🔊', description: 'Deep bass enhancement', tags: ['bass', 'boost', 'mixing'], downloads: 12345 },
            { id: 'a5', name: 'Lo-Fi Hip Hop', category: 'genre', preview: '🎹', description: 'Chill lo-fi processing', tags: ['lofi', 'chill', 'hiphop'], downloads: 15420 },
            { id: 'a6', name: 'Radio Ready', category: 'master', preview: '📻', description: 'Commercial radio loudness', tags: ['radio', 'loud', 'commercial'], downloads: 7654 },
            { id: 'a7', name: 'Acoustic Guitar', category: 'instrument', preview: '🎸', description: 'Warm acoustic guitar tone', tags: ['acoustic', 'guitar', 'warm'], downloads: 6543 },
            { id: 'a8', name: 'Electronic Dance', category: 'genre', preview: '🎧', description: 'EDM mastering template', tags: ['edm', 'dance', 'electronic'], downloads: 10234 },
            { id: 'a9', name: 'Audiobook', category: 'voice', preview: '📖', description: 'Clean audiobook narration', tags: ['audiobook', 'narration', 'clean'], downloads: 5432 },
            { id: 'a10', name: 'Cinematic Score', category: 'cinematic', preview: '🎬', description: 'Epic film score mix', tags: ['cinematic', 'score', 'epic'], downloads: 8765 }
        ],
        design: [
            { id: 'd1', name: 'Modern Logo', category: 'logo', preview: '✨', description: 'Minimalist logo template', tags: ['logo', 'minimal', 'modern'], downloads: 19876 },
            { id: 'd2', name: 'Business Card', category: 'print', preview: '💼', description: 'Professional business card', tags: ['business', 'card', 'print'], downloads: 14321 },
            { id: 'd3', name: 'Flyer Design', category: 'print', preview: '📄', description: 'Event flyer template', tags: ['flyer', 'event', 'print'], downloads: 12345 },
            { id: 'd4', name: 'Instagram Post', category: 'social', preview: '📱', description: 'IG post template pack', tags: ['instagram', 'social', 'post'], downloads: 23104 },
            { id: 'd5', name: 'YouTube Thumbnail', category: 'youtube', preview: '📺', description: 'Clickable thumbnail design', tags: ['youtube', 'thumbnail', 'clickbait'], downloads: 17654 },
            { id: 'd6', name: 'Presentation', category: 'presentation', preview: '📊', description: 'Business presentation template', tags: ['presentation', 'business', 'slides'], downloads: 11234 },
            { id: 'd7', name: 'Poster Design', category: 'print', preview: '🖼️', description: 'Movie poster style', tags: ['poster', 'movie', 'print'], downloads: 9876 },
            { id: 'd8', name: 'Branding Kit', category: 'branding', preview: '🎨', description: 'Complete brand identity', tags: ['branding', 'identity', 'complete'], downloads: 15420 },
            { id: 'd9', name: 'Infographic', category: 'info', preview: '📊', description: 'Data visualization template', tags: ['infographic', 'data', 'visual'], downloads: 8765 },
            { id: 'd10', name: 'Menu Design', category: 'restaurant', preview: '🍽️', description: 'Restaurant menu template', tags: ['menu', 'restaurant', 'food'], downloads: 7654 }
        ],
        vr: [
            { id: 'vr1', name: 'VR Gallery', category: 'environment', preview: '🖼️', description: 'Art gallery VR space', tags: ['gallery', 'art', 'museum'], downloads: 4321 },
            { id: 'vr2', name: 'Sci-Fi Cockpit', category: 'scifi', preview: '🚀', description: 'Spaceship interior', tags: ['scifi', 'spaceship', 'cockpit'], downloads: 6543 },
            { id: 'vr3', name: 'Nature Scene', category: 'nature', preview: '🌲', description: 'Forest environment', tags: ['nature', 'forest', 'outdoor'], downloads: 5432 },
            { id: 'vr4', name: 'City Street', category: 'urban', preview: '🏙️', description: 'Urban city walkthrough', tags: ['city', 'urban', 'street'], downloads: 7654 },
            { id: 'vr5', name: 'Lighting Setup', category: 'lighting', preview: '💡', description: '3-point lighting preset', tags: ['lighting', 'professional', 'setup'], downloads: 8765 },
            { id: 'vr6', name: 'Physics Preset', category: 'physics', preview: '⚙️', description: 'Realistic physics setup', tags: ['physics', 'realistic', 'simulation'], downloads: 4321 },
            { id: 'vr7', name: 'VR Game UI', category: 'ui', preview: '🎮', description: 'Game interface template', tags: ['ui', 'game', 'interface'], downloads: 9876 },
            { id: 'vr8', name: 'Interior Room', category: 'interior', preview: '🏠', description: 'Living room scene', tags: ['interior', 'room', 'home'], downloads: 6543 },
            { id: 'vr9', name: 'Ocean Scene', category: 'nature', preview: '🌊', description: 'Underwater environment', tags: ['ocean', 'water', 'underwater'], downloads: 5432 },
            { id: 'vr10', name: 'AR Marker', category: 'ar', preview: '📱', description: 'AR tracking template', tags: ['ar', 'marker', 'mobile'], downloads: 7654 }
        ]
    };

    const currentTemplates = templates[toolType] || [];

    const filteredTemplates = currentTemplates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = category === 'all' || template.category === category;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(currentTemplates.map(t => t.category))];

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        onSelectTemplate && onSelectTemplate(template);
        alert(`✅ Template loaded: ${template.name}\n\nYou can now customize this template!`);
    };

    return (
        <div className="template-library">
            <div className="library-header">
                <h2>📚 Template Library</h2>
                <p>{currentTemplates.length} free templates - Start creating instantly!</p>
            </div>

            <div className="library-controls">
                <input
                    type="text"
                    className="search-templates"
                    placeholder="Search templates, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="category-pills">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-pill ${category === cat ? 'active' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="templates-grid">
                {filteredTemplates.length === 0 ? (
                    <div className="no-templates">
                        <p>No templates found</p>
                        <p>Try a different search or category</p>
                    </div>
                ) : (
                    filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="template-card"
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <div className="template-preview">
                                <span className="preview-icon">{template.preview}</span>
                                <div className="template-overlay">
                                    <button className="btn-use-template">Use Template</button>
                                </div>
                            </div>
                            <div className="template-details">
                                <h3>{template.name}</h3>
                                <p className="template-description">{template.description}</p>
                                <div className="template-tags">
                                    {template.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="template-stats">
                                    <span>⬇️ {template.downloads.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TemplateLibrary;
