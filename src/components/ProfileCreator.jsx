/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';

/**
 * ProfileCreator - MySpace-style profile with music libraries, CGI generation, and categorized content
 * Features: Profile editor with all creative tools, music playlists per category, Spotify integration
 */
export function ProfileCreator({ userId }) {
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem(`profile_${userId}`);
        return saved ? JSON.parse(saved) : {
            displayName: '',
            bio: '',
            avatar: null,
            banner: null,
            theme: 'dark',
            categories: {
                'cgi-creations': { name: 'CGI & 3D Art', items: [], musicLibrary: [] },
                'graphic-design': { name: 'Graphic Design', items: [], musicLibrary: [] },
                'photo-edits': { name: 'Photo Edits', items: [], musicLibrary: [] },
                'audio-tracks': { name: 'Audio Productions', items: [], musicLibrary: [] },
                'videos': { name: 'Video Content', items: [], musicLibrary: [] },
                'animations': { name: 'Animations & GIFs', items: [], musicLibrary: [] }
            },
            defaultMusicLibrary: [], // Main profile music
            musicSettings: {
                enabled: true,
                autoPlay: false,
                pauseOnVideo: true,
                pauseOnAudio: true,
                continueOnImages: true,
                source: 'local', // 'local' or 'spotify'
                spotifyPlaylistId: '',
                volume: 0.7
            }
        };
    });

    const [editMode, setEditMode] = useState('profile'); // 'profile', 'cgi', 'graphics', 'photos', 'audio', 'videos'
    const [activeCategory, setActiveCategory] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentCategory, setCurrentCategory] = useState('default');
    const audioRef = useRef(null);

    // Save profile to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    }, [profile, userId]);

    // Handle audio playback
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying && currentTrack) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.volume = profile.musicSettings.volume;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack, profile.musicSettings.volume]);

    const handleFileUpload = (type, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (type === 'avatar') {
                setProfile({ ...profile, avatar: event.target.result });
            } else if (type === 'banner') {
                setProfile({ ...profile, banner: event.target.result });
            }
        };
        reader.readAsDataURL(file);
    };

    const addItemToCategory = (categoryId, item) => {
        const updatedCategories = { ...profile.categories };
        updatedCategories[categoryId].items.push(item);
        setProfile({ ...profile, categories: updatedCategories });
    };

    const addMusicToLibrary = (categoryId, track) => {
        if (categoryId === 'default') {
            setProfile({
                ...profile,
                defaultMusicLibrary: [...profile.defaultMusicLibrary, track]
            });
        } else {
            const updatedCategories = { ...profile.categories };
            updatedCategories[categoryId].musicLibrary.push(track);
            setProfile({ ...profile, categories: updatedCategories });
        }
    };

    const handleMusicFileUpload = (categoryId, e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);
                const track = {
                    id: `track_${Date.now()}_${Math.random()}`,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    url: url,
                    artist: 'Unknown Artist',
                    duration: 0,
                    source: 'local'
                };
                addMusicToLibrary(categoryId, track);
            }
        });
    };

    const playTrack = (track, categoryId) => {
        setCurrentTrack(track);
        setCurrentCategory(categoryId);
        setIsPlaying(true);
    };

    const pauseMusic = () => {
        setIsPlaying(false);
    };

    const resumeMusic = () => {
        setIsPlaying(true);
    };

    const skipTrack = (direction) => {
        const library = currentCategory === 'default'
            ? profile.defaultMusicLibrary
            : profile.categories[currentCategory]?.musicLibrary || [];

        const currentIndex = library.findIndex(t => t.id === currentTrack?.id);
        let nextIndex = currentIndex + direction;

        if (nextIndex < 0) nextIndex = library.length - 1;
        if (nextIndex >= library.length) nextIndex = 0;

        if (library[nextIndex]) {
            playTrack(library[nextIndex], currentCategory);
        }
    };

    const generateCGIAvatar = async () => {
        if (!profile.avatar) {
            alert('⚠️ Please upload a photo first!\n\nThe avatar generator needs a base image to work with.');
            return;
        }

        const confirmed = confirm('🎨 Generate Avatar\n\nThis will create a stylized avatar from your current photo.\n\nChoose a style:\n• OK = Anime Style (rounded, vibrant)\n• Cancel = Go back');

        if (!confirmed) return;

        try {
            // Create canvas for avatar generation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 400;
            canvas.height = 400;

            // Load the current avatar
            const img = new Image();
            img.onload = () => {
                // Draw circular avatar
                ctx.save();
                ctx.beginPath();
                ctx.arc(200, 200, 180, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Calculate aspect ratio fit
                const scale = Math.max(400 / img.width, 400 / img.height);
                const x = (400 / 2) - (img.width / 2) * scale;
                const y = (400 / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                ctx.restore();

                // Add anime-style border
                ctx.strokeStyle = '#FF1493';
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.arc(200, 200, 180, 0, Math.PI * 2);
                ctx.stroke();

                // Add inner glow
                ctx.strokeStyle = 'rgba(255, 20, 147, 0.3)';
                ctx.lineWidth = 20;
                ctx.beginPath();
                ctx.arc(200, 200, 170, 0, Math.PI * 2);
                ctx.stroke();

                // Convert to data URL and set as avatar
                const generated = canvas.toDataURL('image/png');
                setProfile({ ...profile, avatar: generated });
                alert('✅ Avatar generated successfully!\n\nYour new stylized avatar is ready.');
            };
            img.src = profile.avatar;
        } catch (error) {
            alert('❌ Avatar generation failed\n\nPlease try uploading a different image.');
            console.error('Avatar generation error:', error);
        }
    };

    const generateCGIBanner = async () => {
        if (!profile.banner) {
            alert('⚠️ Please upload a banner image first!\n\nThe banner generator needs a base image to work with.');
            return;
        }

        const style = confirm('🌌 Generate Banner\n\nThis will create a stylized banner from your current image.\n\nChoose a style:\n• OK = Gradient Overlay (vibrant colors)\n• Cancel = Go back');

        if (!style) return;

        try {
            // Create canvas for banner generation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1500;
            canvas.height = 500;

            // Load the current banner
            const img = new Image();
            img.onload = () => {
                // Draw banner with aspect ratio fit
                const scale = Math.max(1500 / img.width, 500 / img.height);
                const x = (1500 / 2) - (img.width / 2) * scale;
                const y = (500 / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Add gradient overlay
                const gradient = ctx.createLinearGradient(0, 0, 1500, 500);
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)');
                gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.4)');
                gradient.addColorStop(1, 'rgba(237, 66, 100, 0.6)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1500, 500);

                // Add edge glow
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 4;
                ctx.strokeRect(0, 0, 1500, 500);

                // Convert to data URL and set as banner
                const generated = canvas.toDataURL('image/jpeg', 0.95);
                setProfile({ ...profile, banner: generated });
                alert('✅ Banner generated successfully!\n\nYour new stylized banner is ready.');
            };
            img.src = profile.banner;
        } catch (error) {
            alert('❌ Banner generation failed\n\nPlease try uploading a different image.');
            console.error('Banner generation error:', error);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            minHeight: '100vh',
            color: 'white',
            padding: '40px 20px'
        }}>
            <audio ref={audioRef} onEnded={() => skipTrack(1)} />

            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '10px'
                    }}>
                        👤 Profile Creator
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.8 }}>
                        Create your MySpace-style profile • Add music libraries • Showcase your creations
                    </p>
                </div>

                {/* Mode Selector */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '30px',
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {[
                        { id: 'profile', name: 'Profile Setup', icon: '👤' },
                        { id: 'cgi', name: 'CGI Creations', icon: '🎨' },
                        { id: 'graphics', name: 'Graphic Design', icon: '🖼️' },
                        { id: 'photos', name: 'Photo Edits', icon: '📸' },
                        { id: 'audio', name: 'Audio Tracks', icon: '🎵' },
                        { id: 'videos', name: 'Videos', icon: '🎬' },
                        { id: 'music', name: 'Music Libraries', icon: '📚' }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setEditMode(mode.id)}
                            style={{
                                background: editMode === mode.id ? '#667eea' : 'rgba(255,255,255,0.1)',
                                border: editMode === mode.id ? '2px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                                padding: '15px 25px',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>{mode.icon}</span>
                            <span>{mode.name}</span>
                        </button>
                    ))}
                </div>

                {/* Profile Setup Mode */}
                {editMode === 'profile' && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        padding: '30px'
                    }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>📝 Profile Setup</h2>

                        {/* Banner */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '18px', marginBottom: '15px', fontWeight: 'bold' }}>
                                🌌 Profile Banner
                            </label>
                            <div style={{
                                height: '300px',
                                background: profile.banner
                                    ? `url(${profile.banner}) center/cover`
                                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '15px',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {!profile.banner && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '64px', marginBottom: '15px' }}>🖼️</div>
                                        <p style={{ fontSize: '18px' }}>Upload or generate your banner</p>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload('banner', e)}
                                    style={{ display: 'none' }}
                                    id="banner-upload"
                                />
                                <button
                                    onClick={() => document.getElementById('banner-upload').click()}
                                    style={buttonStyle}
                                >
                                    📁 Upload Banner
                                </button>
                                <button onClick={generateCGIBanner} style={{ ...buttonStyle, background: '#f093fb' }}>
                                    🎨 Generate CGI Banner
                                </button>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '18px', marginBottom: '15px', fontWeight: 'bold' }}>
                                👤 Profile Avatar
                            </label>
                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                <div style={{
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: '50%',
                                    background: profile.avatar
                                        ? `url(${profile.avatar}) center/cover`
                                        : 'linear-gradient(135deg, #667eea, #764ba2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '64px'
                                }}>
                                    {!profile.avatar && '👤'}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload('avatar', e)}
                                        style={{ display: 'none' }}
                                        id="avatar-upload"
                                    />
                                    <button
                                        onClick={() => document.getElementById('avatar-upload').click()}
                                        style={{ ...buttonStyle, marginBottom: '10px', display: 'block' }}
                                    >
                                        📁 Upload Avatar
                                    </button>
                                    <button onClick={generateCGIAvatar} style={{ ...buttonStyle, background: '#f093fb' }}>
                                        🎨 Generate CGI Avatar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={profile.displayName}
                                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                placeholder="Enter your display name"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>
                                Bio
                            </label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Tell people about yourself..."
                                rows="6"
                                style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                            />
                        </div>

                        <button
                            onClick={() => alert('✅ Profile saved!')}
                            style={{
                                ...buttonStyle,
                                background: '#4CAF50',
                                width: '100%',
                                fontSize: '18px',
                                padding: '20px'
                            }}
                        >
                            💾 Save Profile
                        </button>
                    </div>
                )}

                {/* Music Libraries Mode */}
                {editMode === 'music' && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        padding: '30px'
                    }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>📚 Music Libraries</h2>
                        <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '30px' }}>
                            Add music playlists that play when visitors browse different categories of your profile
                        </p>

                        {/* Music Settings */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>⚙️ Music Settings</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={profile.musicSettings.enabled}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            musicSettings: { ...profile.musicSettings, enabled: e.target.checked }
                                        })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>🎵 Enable Music</span>
                                </label>

                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={profile.musicSettings.autoPlay}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            musicSettings: { ...profile.musicSettings, autoPlay: e.target.checked }
                                        })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>▶️ Auto-Play on Visit</span>
                                </label>

                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={profile.musicSettings.pauseOnVideo}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            musicSettings: { ...profile.musicSettings, pauseOnVideo: e.target.checked }
                                        })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>🎬 Pause During Videos</span>
                                </label>

                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={profile.musicSettings.pauseOnAudio}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            musicSettings: { ...profile.musicSettings, pauseOnAudio: e.target.checked }
                                        })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>🎤 Pause During Audio Playback</span>
                                </label>

                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={profile.musicSettings.continueOnImages}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            musicSettings: { ...profile.musicSettings, continueOnImages: e.target.checked }
                                        })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>🖼️ Continue on Images/GIFs</span>
                                </label>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>
                                    Music Source:
                                </label>
                                <select
                                    value={profile.musicSettings.source}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        musicSettings: { ...profile.musicSettings, source: e.target.value }
                                    })}
                                    style={selectStyle}
                                >
                                    <option value="local">Local Files</option>
                                    <option value="spotify">Spotify Playlist</option>
                                </select>
                            </div>

                            {profile.musicSettings.source === 'spotify' && (
                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>
                                        Spotify Playlist ID:
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.musicSettings.spotifyPlaylistId}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            musicSettings: { ...profile.musicSettings, spotifyPlaylistId: e.target.value }
                                        })}
                                        placeholder="Enter Spotify playlist ID"
                                        style={inputStyle}
                                    />
                                    <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                                        Find in Spotify: Share → Copy Playlist Link → Extract ID from URL
                                    </p>
                                </div>
                            )}

                            <div style={{ marginTop: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>
                                    Volume: {Math.round(profile.musicSettings.volume * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={profile.musicSettings.volume}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        musicSettings: { ...profile.musicSettings, volume: parseFloat(e.target.value) }
                                    })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Default Music Library */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                                🎵 Main Profile Music ({profile.defaultMusicLibrary.length} tracks)
                            </h3>
                            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '15px' }}>
                                Plays on your main profile page
                            </p>

                            {profile.musicSettings.source === 'local' && (
                                <>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        multiple
                                        onChange={(e) => handleMusicFileUpload('default', e)}
                                        style={{ display: 'none' }}
                                        id="music-upload-default"
                                    />
                                    <button
                                        onClick={() => document.getElementById('music-upload-default').click()}
                                        style={{ ...buttonStyle, marginBottom: '15px' }}
                                    >
                                        📁 Add Tracks
                                    </button>
                                </>
                            )}

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {profile.defaultMusicLibrary.map((track, index) => (
                                    <div
                                        key={track.id}
                                        style={{
                                            background: currentTrack?.id === track.id ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.05)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => playTrack(track, 'default')}
                                    >
                                        <div style={{ fontSize: '24px' }}>
                                            {currentTrack?.id === track.id && isPlaying ? '▶️' : '🎵'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{track.name}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.7 }}>{track.artist}</div>
                                        </div>
                                        <div style={{ fontSize: '14px', opacity: 0.7 }}>
                                            Track {index + 1}
                                        </div>
                                    </div>
                                ))}
                                {profile.defaultMusicLibrary.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        <p>No tracks added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category Music Libraries */}
                        {Object.entries(profile.categories).map(([catId, category]) => (
                            <div
                                key={catId}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}
                            >
                                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                                    {category.name} Music ({category.musicLibrary.length} tracks)
                                </h3>
                                <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '15px' }}>
                                    Plays when visitors view your {category.name} category
                                </p>

                                {profile.musicSettings.source === 'local' && (
                                    <>
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            multiple
                                            onChange={(e) => handleMusicFileUpload(catId, e)}
                                            style={{ display: 'none' }}
                                            id={`music-upload-${catId}`}
                                        />
                                        <button
                                            onClick={() => document.getElementById(`music-upload-${catId}`).click()}
                                            style={{ ...buttonStyle, marginBottom: '15px' }}
                                        >
                                            📁 Add Tracks
                                        </button>
                                    </>
                                )}

                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {category.musicLibrary.map((track, index) => (
                                        <div
                                            key={track.id}
                                            style={{
                                                background: currentTrack?.id === track.id ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.05)',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                marginBottom: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            onClick={() => playTrack(track, catId)}
                                        >
                                            <div style={{ fontSize: '20px' }}>
                                                {currentTrack?.id === track.id && isPlaying ? '▶️' : '🎵'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{track.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {category.musicLibrary.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '14px' }}>
                                            No tracks added yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Music Player Widget (Always Visible) */}
                {profile.musicSettings.enabled && currentTrack && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        background: 'rgba(0,0,0,0.9)',
                        borderRadius: '15px',
                        padding: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        minWidth: '300px',
                        zIndex: 9999,
                        border: '2px solid #667eea'
                    }}>
                        <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '10px' }}>
                            Now Playing {currentCategory !== 'default' && `• ${profile.categories[currentCategory]?.name}`}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                            {currentTrack.name}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '15px' }}>
                            {currentTrack.artist}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => skipTrack(-1)} style={playerButtonStyle}>⏮️</button>
                            <button onClick={isPlaying ? pauseMusic : resumeMusic} style={playerButtonStyle}>
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>
                            <button onClick={() => skipTrack(1)} style={playerButtonStyle}>⏭️</button>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={profile.musicSettings.volume}
                                onChange={(e) => {
                                    const newVolume = parseFloat(e.target.value);
                                    setProfile({
                                        ...profile,
                                        musicSettings: { ...profile.musicSettings, volume: newVolume }
                                    });
                                    if (audioRef.current) audioRef.current.volume = newVolume;
                                }}
                                style={{ width: '100%' }}
                            />
                            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px', textAlign: 'center' }}>
                                🔊 {Math.round(profile.musicSettings.volume * 100)}%
                            </div>
                        </div>
                    </div>
                )}

                {/* Other creation modes (CGI, Graphics, Photos, Audio, Videos) */}
                {editMode !== 'profile' && editMode !== 'music' && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                            {editMode === 'cgi' && '🎨'}
                            {editMode === 'graphics' && '🖼️'}
                            {editMode === 'photos' && '📸'}
                            {editMode === 'audio' && '🎵'}
                            {editMode === 'videos' && '🎬'}
                        </div>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
                            {editMode === 'cgi' && 'CGI & 3D Creations'}
                            {editMode === 'graphics' && 'Graphic Design Gallery'}
                            {editMode === 'photos' && 'Photo Edit Showcase'}
                            {editMode === 'audio' && 'Audio Track Collection'}
                            {editMode === 'videos' && 'Video Portfolio'}
                        </h2>
                        <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '30px' }}>
                            Use the tools in the main dashboard to create content, then add them to your profile here!
                        </p>
                        <button style={{ ...buttonStyle, fontSize: '18px', padding: '20px 40px' }}>
                            📂 Import from Dashboard Creations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const buttonStyle = {
    background: '#667eea',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const inputStyle = {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '16px'
};

const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
};

const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '15px'
};

const playerButtonStyle = {
    background: 'rgba(102, 126, 234, 0.5)',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

export default ProfileCreator;
