
import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./vendor-prefixes.css"; // Browser compatibility fixes
import { LegalDocumentsList } from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";

const userId = "demo-user";

function AppFlow() {
  const [step, setStep] = useState(0);

  // Simulate legal acceptance callback
  const handleLegalAccepted = () => setStep(1);
  const handleSignupComplete = () => setStep(2);

  return (
    <React.StrictMode>
  <div style={{background:'#222', color:'#FFD700', padding:'8px 0', textAlign:'center', fontWeight:700, fontSize:'1.1rem'}}>DEBUG: Onboarding Flow v2.0.0 - {new Date().toLocaleString()}</div>
      {step === 0 && (
        <div>
          <LegalDocumentsList userId={userId} />
          <button onClick={handleLegalAccepted} style={{marginTop:24, padding:12, fontWeight:600}}>Accept & Continue</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <CreatorSignup />
          <button onClick={handleSignupComplete} style={{marginTop:24, padding:12, fontWeight:600}}>Continue to Payment</button>
        </div>
      )}
      {step === 2 && (
        <PaymentModule />
      )}
    </React.StrictMode>
  );
}

ReactDOM.render(
  <AppFlow />,
  document.getElementById("root")
);
