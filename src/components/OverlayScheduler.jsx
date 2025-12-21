import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const OverlayScheduler = ({ userId }) => {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      const { data } = await supabase
        .from('overlay_schedule')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });
      setSchedule(data || []);
    };
    fetchSchedule();
  }, [userId]);

  const now = new Date();
  const activeOverlay = schedule.find(
    (slot) =>
      new Date(slot.start_time) <= now && new Date(slot.end_time) >= now
  );

  return (
    <div className="overlay-scheduler">
      <h2>🕒 Overlay Scheduler</h2>
      {activeOverlay ? (
        <div>
          <p>🎬 Active Overlay: {activeOverlay.preset_name}</p>
          <p>
            ⏱️ {new Date(activeOverlay.start_time).toLocaleTimeString()} →{' '}
            {new Date(activeOverlay.end_time).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <p>No overlay active right now.</p>
      )}
    </div>
  );
};
