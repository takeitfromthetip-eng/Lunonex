import React from 'react';
import ReactDOM from 'react-dom/client';
import { Settings } from './components/Settings';
import { supabase } from './lib/supabase';

function SettingsPage() {
  const [userId, setUserId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setUserId(session.user.id);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return <Settings userId={userId} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsPage />
  </React.StrictMode>
);
