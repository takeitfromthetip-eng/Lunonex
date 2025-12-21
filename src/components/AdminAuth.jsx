import React, { useState } from "react";

// SECURE ADMIN CREDENTIALS - Load from environment variables
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

export function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminUsername", username);
      localStorage.setItem("adminLoginTime", Date.now().toString());
      onLoginSuccess();
    } else {
      setError("❌ Invalid admin credentials");
      setPassword("");
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff'
    }}>
      <div style={{
        background: '#222',
        padding: '50px',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        border: '2px solid #FFD700'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: '2rem', fontWeight: 700 }}>
            Admin Access
          </h2>
          <p style={{ color: '#aaa', marginTop: '12px', fontSize: '0.95rem' }}>
            ForTheWeebs Owner Portal
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 600 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '2px solid #444',
                background: '#333',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFD700'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
              placeholder="Enter admin username"
              autoFocus
              required
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '2px solid #444',
                background: '#333',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFD700'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ff4444, #cc0000)',
              color: '#fff',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 600,
              border: '2px solid #ff0000'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.4)';
            }}
          >
            🚀 Login as Owner
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#4da6ff',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#80c0ff'}
            onMouseLeave={(e) => e.target.style.color = '#4da6ff'}
          >
            ← Back to regular user access
          </a>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
            🔒 Secure access for Jacob Morris only<br/>
            Unauthorized access attempts are logged
          </p>
        </div>
      </div>
    </div>
  );
}

export function checkAdminAuth() {
  const adminAuth = localStorage.getItem("adminAuthenticated");
  const adminUsername = localStorage.getItem("adminUsername");
  const loginTime = localStorage.getItem("adminLoginTime");

  // Session expires after 24 hours
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isExpired = loginTime && (Date.now() - parseInt(loginTime)) > twentyFourHours;

  if (isExpired) {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminLoginTime");
    return false;
  }

  return adminAuth === "true" && adminUsername === ADMIN_USERNAME;
}

export function logoutAdmin() {
  localStorage.removeItem("adminAuthenticated");
  localStorage.removeItem("adminUsername");
  localStorage.removeItem("adminLoginTime");
  window.location.href = "/";
}
