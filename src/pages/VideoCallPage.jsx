/* eslint-disable */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoCall from '../components/VideoCall';
import { useAuth } from '../contexts/AuthContext';

/**
 * Video Call Page - Wrapper for video call functionality
 * Route: /call/:callId
 */
export default function VideoCallPage() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { user, userTier } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch call details and participants
    const loadCallDetails = async () => {
      try {
        const response = await fetch(`/api/calls/${callId}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Call not found');
        }

        const data = await response.json();
        setParticipants(data.participants || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load call:', error);
        alert('Could not load call details');
        navigate('/dashboard');
      }
    };

    if (callId && user) {
      loadCallDetails();
    }
  }, [callId, user, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1a1a1a',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        Loading call...
      </div>
    );
  }

  return (
    <div>
      <VideoCall callId={callId} participants={participants} />
    </div>
  );
}
