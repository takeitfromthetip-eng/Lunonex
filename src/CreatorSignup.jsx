import React, { useState } from "react";
import { canCreateAnotherAccount, registerNewAccount, getAccountCreationMessage } from "./utils/accountLimits";

const CreatorSignup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validate legal acceptance checkbox
    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      setLoading(false);
      return;
    }
    
    // Check account creation limits
    if (!canCreateAnotherAccount(email)) {
      setError(getAccountCreationMessage(email));
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const result = await response.json();
      if (result.success) {
        // Register this account creation
        registerNewAccount(email);
        
        // Track legal acceptance (CRITICAL for legal protection)
        if (result.userId) {
          fetch("/api/legal/track-acceptance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              userId: result.userId,
              termsVersion: 'v2.0',
              privacyVersion: 'v2.0'
            })
          }).catch(err => console.error('Legal acceptance tracking failed:', err));
          
          // Send welcome/friend request from owner
          fetch("/api/welcome/new-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: result.userId, email })
          }).catch(err => console.log('Welcome request failed:', err));
        }
        
        setReserved(true);
      } else {
        setError(result.error || "Signup failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8, background: "rgba(255,255,255,0.05)" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Reserve Your Creator Spot</h2>
      {reserved ? (
        <div style={{ color: "#22c55e", fontWeight: 600, textAlign: "center" }}>
          <strong>Success!</strong> Your spot is reserved.<br />You will be notified when the platform launches.
        </div>
      ) : (
        <form onSubmit={handleSubmit} aria-label="Creator signup form" autoComplete="on">
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="username" style={{ fontWeight: 500 }}>Username<br />
              <input id="username" name="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }} autoComplete="username" aria-required="true" aria-label="Username" />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ fontWeight: 500 }}>Email<br />
              <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }} autoComplete="email" aria-required="true" aria-label="Email" />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password" style={{ fontWeight: 500 }}>Password<br />
              <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }} autoComplete="new-password" aria-required="true" aria-label="Password" minLength="8" />
            </label>
          </div>
          
          {/* LEGALLY BINDING ACCEPTANCE CHECKBOX */}
          <div style={{ marginTop: 20, marginBottom: 20, padding: 12, background: "rgba(239, 68, 68, 0.05)", border: "2px solid #ef4444", borderRadius: 6 }}>
            <label htmlFor="acceptTerms" style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", fontSize: "0.9rem" }}>
              <input 
                id="acceptTerms" 
                name="acceptTerms" 
                type="checkbox" 
                checked={acceptTerms} 
                onChange={e => setAcceptTerms(e.target.checked)} 
                required 
                style={{ marginTop: 2, marginRight: 8, minWidth: 16, minHeight: 16, cursor: "pointer" }}
                aria-required="true"
              />
              <span style={{ lineHeight: 1.4 }}>
                I am at least <strong>18 years old</strong> and I have read, understood, and agree to the{' '}
                <a href="/legal/terms-of-service-v2.html" target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", textDecoration: "underline", fontWeight: 600 }}>Terms of Service</a>
                {' '}and{' '}
                <a href="/legal/privacy-policy-v2.html" target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", textDecoration: "underline", fontWeight: 600 }}>Privacy Policy</a>.
              </span>
            </label>
          </div>
          
          {error && <div style={{ color: "#ef4444", marginBottom: 12, textAlign: "center", fontWeight: 600 }}>{error}</div>}
          <button type="submit" style={{ width: "100%", padding: 12, background: loading ? "#a5b4fc" : (acceptTerms ? "#667eea" : "#94a3b8"), color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, fontSize: "1rem", cursor: loading ? "not-allowed" : (acceptTerms ? "pointer" : "not-allowed"), transition: "all 0.2s" }} disabled={loading || !acceptTerms}>{loading ? "Creating Account..." : "Sign Up"}</button>
          
          <div style={{ marginTop: 16, fontSize: "0.75rem", color: "#666", textAlign: "center" }}>
            By clicking "Sign Up", you provide your electronic signature, which has the same legal force as a handwritten signature under the E-SIGN Act.
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatorSignup;
