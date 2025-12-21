import React, { useEffect, useState } from 'react';

export default function EngagementTracker({ children }) {
  const [sessionStart] = useState(Date.now());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const trackEvent = (event) => {
      const eventData = {
        type: event.type,
        target: event.target.tagName,
        timestamp: Date.now(),
        sessionTime: Date.now() - sessionStart
      };
      setEvents(prev => [...prev.slice(-99), eventData]); // Keep last 100 events
    };

    // Track clicks
    document.addEventListener('click', trackEvent);

    // Track session duration
    const sessionInterval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      console.log(`Session duration: ${duration}s, Events: ${events.length}`);
    }, 60000); // Log every minute

    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('User left page', { sessionTime: Date.now() - sessionStart, totalEvents: events.length });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('click', trackEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(sessionInterval);

      // Send analytics on unmount
      const finalDuration = Math.floor((Date.now() - sessionStart) / 1000);
      console.log('Session ended', {
        duration: finalDuration,
        totalEvents: events.length,
        events: events.slice(-10) // Last 10 events
      });
    };
  }, [sessionStart, events.length]);

  return <>{children}</>;
}
