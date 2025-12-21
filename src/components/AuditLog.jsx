import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuditLog = ({ userId }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('sovereign_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      setEvents(data || []);
    };
    fetchEvents();
  }, [userId]);

  return (
    <div className="audit-log">
      <h2>📜 Sovereign Audit Log</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.type}</strong> — {event.description} <br />
            <small>{new Date(event.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};
