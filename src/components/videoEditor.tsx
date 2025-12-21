/* eslint-disable */
import { useState } from 'react';

// Minimal Timeline component for demonstration
function Timeline({ tracks }: { tracks: Array<any> }) {
  return (
    <div>
      <h3>Timeline</h3>
      <ul>
        {tracks.map((track, i) => (
          <li key={i}>
            {track.type} - {track.source} (Effects: {track.effects.join(', ')})
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VideoEditor() {
  const [tracks, setTracks] = useState<Array<{
    type: 'video' | 'audio';
    source: string;
    start: number;
    end: number | null;
    effects: string[];
  }>>([]);

  function addTrack(type: 'video' | 'audio', source: string) {
    const newTrack = { type, source, start: 0, end: null, effects: [] };
    setTracks([...tracks, newTrack]);
  }

  function applyEffect(trackIndex: number, effect: string) {
    setTracks(prev => {
      const updated = [...prev];
      if (updated[trackIndex]) {
        updated[trackIndex] = {
          ...updated[trackIndex],
          effects: [...updated[trackIndex].effects, effect],
        };
      }
      return updated;
    });
  }

  return <Timeline tracks={tracks} />;
}
