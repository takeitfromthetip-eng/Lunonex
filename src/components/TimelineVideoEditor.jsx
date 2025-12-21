/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import './TimelineVideoEditor.css';

export default function TimelineVideoEditor({ user }) {
  const [project, setProject] = useState({
    name: 'Untitled Project',
    duration: 0,
    fps: 30,
    resolution: '1920x1080'
  });

  const [tracks, setTracks] = useState([
    { id: 'video-1', type: 'video', name: 'Video Track 1', clips: [], locked: false, muted: false },
    { id: 'video-2', type: 'video', name: 'Video Track 2', clips: [], locked: false, muted: false },
    { id: 'audio-1', type: 'audio', name: 'Audio Track 1', clips: [], locked: false, muted: false },
    { id: 'text-1', type: 'text', name: 'Text Overlay', clips: [], locked: false, muted: false }
  ]);

  const [selectedClip, setSelectedClip] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState('select');
  const [showEffects, setShowEffects] = useState(false);
  const [showTransitions, setShowTransitions] = useState(false);

  const timelineRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const playbackInterval = useRef(null);

  const effects = [
    { id: 'blur', name: 'Blur', icon: '🌫️' },
    { id: 'grayscale', name: 'Grayscale', icon: '⬛' },
    { id: 'sepia', name: 'Sepia', icon: '🟤' },
    { id: 'brightness', name: 'Brightness', icon: '☀️' },
    { id: 'contrast', name: 'Contrast', icon: '🎚️' },
    { id: 'saturation', name: 'Saturation', icon: '🌈' },
    { id: 'hue-rotate', name: 'Hue Rotate', icon: '🎨' },
    { id: 'invert', name: 'Invert', icon: '🔄' }
  ];

  const transitions = [
    { id: 'fade', name: 'Fade', icon: '⚪' },
    { id: 'dissolve', name: 'Dissolve', icon: '✨' },
    { id: 'wipe', name: 'Wipe', icon: '➡️' },
    { id: 'slide', name: 'Slide', icon: '📱' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' },
    { id: 'rotate', name: 'Rotate', icon: '🔄' }
  ];

  useEffect(() => {
    if (playing) {
      playbackInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + (1 / project.fps);
          if (next >= project.duration) {
            setPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000 / project.fps);
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [playing, project.fps, project.duration]);

  const handleFileUpload = async (e, trackId) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const clip = {
        id: `clip-${Date.now()}-${Math.random()}`,
        name: file.name,
        file: file,
        url: URL.createObjectURL(file),
        duration: 5, // Would be calculated from actual file
        startTime: currentTime,
        effects: [],
        transition: null,
        volume: 1,
        speed: 1,
        opacity: 1
      };

      setTracks(prev => prev.map(track => {
        if (track.id === trackId) {
          return {
            ...track,
            clips: [...track.clips, clip]
          };
        }
        return track;
      }));

      // Update project duration if needed
      const endTime = currentTime + clip.duration;
      if (endTime > project.duration) {
        setProject(prev => ({ ...prev, duration: endTime }));
      }
    }
  };

  const handleClipSelect = (clip) => {
    setSelectedClip(clip);
  };

  const handleClipMove = (clipId, trackId, newStartTime) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.map(clip => 
            clip.id === clipId 
              ? { ...clip, startTime: Math.max(0, newStartTime) }
              : clip
          )
        };
      }
      return track;
    }));
  };

  const handleClipTrim = (clipId, trackId, newDuration) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.map(clip => 
            clip.id === clipId 
              ? { ...clip, duration: Math.max(0.1, newDuration) }
              : clip
          )
        };
      }
      return track;
    }));
  };

  const handleClipDelete = (clipId, trackId) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.filter(clip => clip.id !== clipId)
        };
      }
      return track;
    }));
    
    if (selectedClip?.id === clipId) {
      setSelectedClip(null);
    }
  };

  const handleClipSplit = (clipId, trackId) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const clipIndex = track.clips.findIndex(c => c.id === clipId);
        if (clipIndex === -1) return track;
        
        const clip = track.clips[clipIndex];
        const splitTime = currentTime - clip.startTime;
        
        if (splitTime <= 0 || splitTime >= clip.duration) return track;
        
        const newClips = [...track.clips];
        const clip1 = { ...clip, duration: splitTime };
        const clip2 = { 
          ...clip, 
          id: `clip-${Date.now()}-${Math.random()}`,
          startTime: clip.startTime + splitTime,
          duration: clip.duration - splitTime
        };
        
        newClips.splice(clipIndex, 1, clip1, clip2);
        
        return { ...track, clips: newClips };
      }
      return track;
    }));
  };

  const addEffect = (effectId) => {
    if (!selectedClip) return;
    
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(clip => 
        clip.id === selectedClip.id
          ? { ...clip, effects: [...clip.effects, { id: effectId, intensity: 50 }] }
          : clip
      )
    })));
  };

  const addTransition = (transitionId) => {
    if (!selectedClip) return;
    
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(clip => 
        clip.id === selectedClip.id
          ? { ...clip, transition: { id: transitionId, duration: 0.5 } }
          : clip
      )
    })));
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    setPlaying(false);
  };

  const exportVideo = async () => {
    // In production, this would send to render farm
    alert('Exporting video to render queue...');
    
    const exportData = {
      project,
      tracks: tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => ({
          ...clip,
          file: null, // Remove file object for serialization
          url: clip.url
        }))
      }))
    };
    
    console.log('Export data:', exportData);
  };

  const addTrack = (type) => {
    const newTrack = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${tracks.filter(t => t.type === type).length + 1}`,
      clips: [],
      locked: false,
      muted: false
    };
    
    setTracks([...tracks, newTrack]);
  };

  const deleteTrack = (trackId) => {
    if (tracks.length === 1) {
      alert('Cannot delete the last track');
      return;
    }
    
    setTracks(tracks.filter(t => t.id !== trackId));
  };

  const toggleTrackLock = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, locked: !track.locked }
        : track
    ));
  };

  const toggleTrackMute = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, muted: !track.muted }
        : track
    ));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * project.fps);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timeline-video-editor">
      <div className="editor-header">
        <div className="project-info">
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProject({...project, name: e.target.value})}
            className="project-name-input"
          />
          <div className="project-meta">
            {project.resolution} • {project.fps}fps • {formatTime(project.duration)}
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={() => addTrack('video')} className="add-track-btn">
            + Video Track
          </button>
          <button onClick={() => addTrack('audio')} className="add-track-btn">
            + Audio Track
          </button>
          <button onClick={exportVideo} className="export-btn">
            🎬 Export
          </button>
        </div>
      </div>

      <div className="editor-workspace">
        <div className="sidebar-left">
          <div className="tool-panel">
            <h3>Tools</h3>
            <div className="tools">
              <button 
                className={tool === 'select' ? 'active' : ''}
                onClick={() => setTool('select')}
                title="Select"
              >
                ⬆️
              </button>
              <button 
                className={tool === 'cut' ? 'active' : ''}
                onClick={() => setTool('cut')}
                title="Cut"
              >
                ✂️
              </button>
              <button 
                className={tool === 'razor' ? 'active' : ''}
                onClick={() => setTool('razor')}
                title="Razor"
              >
                🔪
              </button>
              <button 
                className={tool === 'zoom' ? 'active' : ''}
                onClick={() => setTool('zoom')}
                title="Zoom"
              >
                🔍
              </button>
            </div>
          </div>

          <div className="effects-panel">
            <h3 onClick={() => setShowEffects(!showEffects)}>
              Effects {showEffects ? '▼' : '▶'}
            </h3>
            {showEffects && (
              <div className="effects-list">
                {effects.map(effect => (
                  <button
                    key={effect.id}
                    onClick={() => addEffect(effect.id)}
                    disabled={!selectedClip}
                    className="effect-btn"
                  >
                    <span>{effect.icon}</span>
                    <span>{effect.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="transitions-panel">
            <h3 onClick={() => setShowTransitions(!showTransitions)}>
              Transitions {showTransitions ? '▼' : '▶'}
            </h3>
            {showTransitions && (
              <div className="transitions-list">
                {transitions.map(transition => (
                  <button
                    key={transition.id}
                    onClick={() => addTransition(transition.id)}
                    disabled={!selectedClip}
                    className="transition-btn"
                  >
                    <span>{transition.icon}</span>
                    <span>{transition.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="editor-main">
          <div className="preview-section">
            <div className="video-preview" ref={videoPreviewRef}>
              {selectedClip ? (
                <div className="preview-content">
                  {selectedClip.file?.type.startsWith('video') ? (
                    <video src={selectedClip.url} />
                  ) : (
                    <img src={selectedClip.url} alt={selectedClip.name} />
                  )}
                </div>
              ) : (
                <div className="preview-placeholder">
                  <p>No clip selected</p>
                </div>
              )}
            </div>
            
            <div className="playback-controls">
              <button onClick={() => handleSeek(0)}>⏮️</button>
              <button onClick={togglePlay}>{playing ? '⏸️' : '▶️'}</button>
              <button onClick={() => handleSeek(project.duration)}>⏭️</button>
              <div className="timecode">{formatTime(currentTime)}</div>
            </div>
          </div>

          <div className="timeline-section" ref={timelineRef}>
            <div className="timeline-controls">
              <button onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}>➖</button>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(5, zoom + 0.2))}>➕</button>
            </div>

            <div className="timeline-ruler">
              {Array.from({ length: Math.ceil(project.duration) + 1 }).map((_, i) => (
                <div key={i} className="ruler-mark" style={{ left: `${i * 100 * zoom}px` }}>
                  <span>{formatTime(i)}</span>
                </div>
              ))}
            </div>

            <div className="playhead" style={{ left: `${currentTime * 100 * zoom}px` }} />

            <div className="tracks">
              {tracks.map(track => (
                <div key={track.id} className="track">
                  <div className="track-header">
                    <div className="track-name">{track.name}</div>
                    <div className="track-controls">
                      <button 
                        onClick={() => toggleTrackMute(track.id)}
                        className={track.muted ? 'active' : ''}
                        title="Mute"
                      >
                        🔇
                      </button>
                      <button 
                        onClick={() => toggleTrackLock(track.id)}
                        className={track.locked ? 'active' : ''}
                        title="Lock"
                      >
                        🔒
                      </button>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, track.id)}
                        accept={track.type === 'video' ? 'video/*' : track.type === 'audio' ? 'audio/*' : 'image/*'}
                        style={{ display: 'none' }}
                        id={`upload-${track.id}`}
                        multiple
                      />
                      <label htmlFor={`upload-${track.id}`} className="upload-btn">
                        +
                      </label>
                      <button 
                        onClick={() => deleteTrack(track.id)}
                        title="Delete Track"
                        className="delete-track-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="track-content">
                    {track.clips.map(clip => (
                      <div
                        key={clip.id}
                        className={`clip ${selectedClip?.id === clip.id ? 'selected' : ''}`}
                        style={{
                          left: `${clip.startTime * 100 * zoom}px`,
                          width: `${clip.duration * 100 * zoom}px`
                        }}
                        onClick={() => handleClipSelect(clip)}
                      >
                        <div className="clip-content">
                          <div className="clip-name">{clip.name}</div>
                          {clip.effects.length > 0 && (
                            <div className="clip-effects">
                              {clip.effects.map(e => effects.find(ef => ef.id === e.id)?.icon).join(' ')}
                            </div>
                          )}
                          {clip.transition && (
                            <div className="clip-transition">
                              {transitions.find(t => t.id === clip.transition.id)?.icon}
                            </div>
                          )}
                        </div>
                        <button 
                          className="clip-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClipDelete(clip.id, track.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-right">
          {selectedClip && (
            <div className="properties-panel">
              <h3>Clip Properties</h3>
              
              <div className="property">
                <label>Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedClip.opacity * 100}
                  onChange={(e) => {
                    const value = Number(e.target.value) / 100;
                    setTracks(prev => prev.map(track => ({
                      ...track,
                      clips: track.clips.map(c => 
                        c.id === selectedClip.id ? { ...c, opacity: value } : c
                      )
                    })));
                  }}
                />
                <span>{Math.round(selectedClip.opacity * 100)}%</span>
              </div>

              <div className="property">
                <label>Speed</label>
                <input
                  type="range"
                  min="25"
                  max="400"
                  value={selectedClip.speed * 100}
                  onChange={(e) => {
                    const value = Number(e.target.value) / 100;
                    setTracks(prev => prev.map(track => ({
                      ...track,
                      clips: track.clips.map(c => 
                        c.id === selectedClip.id ? { ...c, speed: value } : c
                      )
                    })));
                  }}
                />
                <span>{selectedClip.speed}x</span>
              </div>

              <div className="property">
                <label>Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedClip.volume * 100}
                  onChange={(e) => {
                    const value = Number(e.target.value) / 100;
                    setTracks(prev => prev.map(track => ({
                      ...track,
                      clips: track.clips.map(c => 
                        c.id === selectedClip.id ? { ...c, volume: value } : c
                      )
                    })));
                  }}
                />
                <span>{Math.round(selectedClip.volume * 100)}%</span>
              </div>

              <div className="property-actions">
                <button onClick={() => {
                  const trackId = tracks.find(t => t.clips.some(c => c.id === selectedClip.id))?.id;
                  if (trackId) handleClipSplit(selectedClip.id, trackId);
                }}>
                  ✂️ Split at Playhead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
