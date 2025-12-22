import React, { useState, useEffect } from 'react';

/**
 * FAQ Component with Embedded Legal Documents
 * Shows signed documents with user's signature date
 */
export default function FAQ() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [signedDocs, setSignedDocs] = useState({});

  useEffect(() => {
    // Load signed document dates
    const legalAccepted = localStorage.getItem('legalAccepted');
    const legalAcceptedDate = localStorage.getItem('legalAcceptedDate');
    const userEmail = localStorage.getItem('userEmail');

    setSignedDocs({
      accepted: legalAccepted === 'true',
      date: legalAcceptedDate || new Date().toISOString(),
      email: userEmail
    });
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const faqSections = [
    {
      id: 'getting-started',
      title: '🚀 Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" on the homepage, accept the legal documents, fill in your details, choose your tier, and customize your profile. You only need to do this once!'
        },
        {
          q: 'How many accounts can I create?',
          a: 'Regular users get 1 account. VIPs and $1000 tier members get 3 accounts. The owner has unlimited accounts.'
        },
        {
          q: 'What is the onboarding process?',
          a: 'New users follow: 1) Accept Legal Documents → 2) Create Account → 3) Choose Payment Tier → 4) Customize Profile → 5) Access Dashboard'
        }
      ]
    },
    {
      id: 'tiers',
      title: '💎 Membership Tiers',
      questions: [
        {
          q: 'What are the different tiers?',
          a: '$50, $100, $250, $500, and $1000 tiers. Each tier unlocks everything below it plus additional features. The first 100 people (including 13 lifetime VIPs) who reach $1000 get unlimited free access to all creator content.'
        },
        {
          q: 'Can I upgrade my tier?',
          a: 'Yes! When you upgrade, you only pay the difference. For example, if you paid $250 and upgrade to $500, you only pay $250 more.'
        },
        {
          q: 'What does the $1000 tier include?',
          a: 'All superpowers and premium features. The first 100 members (87 paid + 13 lifetime VIPs) also get free access to all creator content forever!'
        }
      ]
    },
    {
      id: 'features',
      title: '✨ Features & Tools',
      questions: [
        {
          q: 'What is Mico?',
          a: 'Mico is your AI assistant, always available to help answer questions, guide you through features, and provide support. Click the Mico widget anytime!'
        },
        {
          q: 'How do I customize my profile?',
          a: 'Go to your Dashboard → Profile Settings. You can customize your bio, avatar, banner, theme, and much more!'
        },
        {
          q: 'What widgets are available?',
          a: 'Mico AI Assistant, Bug Reporter, Quick Actions, Achievement System, and more. All widgets can be hidden/shown as needed.'
        }
      ]
    },
    {
      id: 'creators',
      title: '🎨 For Creators',
      questions: [
        {
          q: 'How do I set prices for my content?',
          a: 'In your Creator Dashboard, you can set custom prices and choose payment frequencies: pay-per-view, daily, weekly, monthly, or yearly.'
        },
        {
          q: 'Can I charge different prices for different content?',
          a: 'Yes! You can set a regular subscription frequency AND create special releases with custom one-time pricing.'
        },
        {
          q: 'How do I get paid?',
          a: 'Choose your payout method in Settings: Stripe to bank account, debit card, or crypto wallet. You control your payment schedule.'
        }
      ]
    },
    {
      id: 'security',
      title: '🔒 Security & Privacy',
      questions: [
        {
          q: 'Is my data safe?',
          a: 'Yes! We use industry-standard encryption, secure authentication, and never sell your data. Read our Privacy Policy below for full details.'
        },
        {
          q: 'What is 2-Factor Authentication?',
          a: '2FA adds an extra layer of security by requiring a code sent to your email when logging in. Enable it in Settings → Security.'
        },
        {
          q: 'Can I stay logged in?',
          a: 'Yes! Check "Stay logged in" when signing in. Your session will last 30 days, then you\'ll need to log in again.'
        }
      ]
    },
    {
      id: 'game-engine',
      title: '🎮 Game Engine',
      questions: [
        {
          q: 'How do I use the Game Engine?',
          a: 'Go to Dashboard → Game Engine tab. Drag nodes from the toolbar (Events, Actions, Conditions, etc.), connect them by clicking outputs and inputs, then press Play to test your game logic. No coding required!'
        },
        {
          q: 'What are the different node types?',
          a: 'Event nodes (On Start, On Click, On Collision), Action nodes (Move, Rotate, Play Sound), Condition nodes (If, Compare), Math nodes (Add, Multiply), Variable nodes (Get/Set), and GameObject nodes (Create/Destroy).'
        },
        {
          q: 'Can I save my game scripts?',
          a: 'Yes! Click "Export" to save your script as JSON. You can share it or load it later. Scripts contain all nodes, connections, and settings.'
        },
        {
          q: 'How do I make objects move?',
          a: 'Create an "On Start" or "On Click" event node, connect it to a "Move" action node, set X/Y values in the node properties, then connect the output to continue your logic.'
        }
      ]
    },
    {
      id: 'workflows',
      title: '🔗 Cross-Tool Workflows',
      questions: [
        {
          q: 'What are workflows?',
          a: 'Workflows let you chain multiple tools together for seamless production. For example: Design → Game Engine → Audio → Video. Track progress and never lose your place!'
        },
        {
          q: 'How do I create a workflow?',
          a: 'Go to Dashboard → Workflows tab. Choose a template (Design to Game, Photo to Video, etc.) or build custom by adding tool steps. Save workflows to reuse them.'
        },
        {
          q: 'Can workflows open tools automatically?',
          a: 'Yes! Click "Open Tool" on any workflow step to jump directly to that tool tab. When you complete a step, mark it done to track progress.'
        },
        {
          q: 'Can I export workflows?',
          a: 'Absolutely! Click "Export JSON" to save workflows and share them with collaborators or reuse on different projects.'
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: '🤖 AI Assistant',
      questions: [
        {
          q: 'How do I customize my AI Assistant?',
          a: 'Dashboard → AI Assistant tab. Use sliders to customize body (height, weight, breasts, genitals, face, skin, hair, nails). Choose gender (Female/Male/Both). Apply presets (petite, athletic, curvy, etc.) or customize everything yourself!'
        },
        {
          q: 'Can I see my AI Assistant in 3D?',
          a: 'Yes! The Live Preview shows your AI Assistant in full 3D. Click and drag to rotate 360°, scroll to zoom, right-click to pan. All customizations update in real-time.'
        },
        {
          q: 'How does voice chat work?',
          a: 'Click "Start Listening" to talk to your AI Assistant. She responds with different personalities (Friendly, Flirty, Professional, Playful). Say commands like "strip", "pose", "generate video", or "play music".'
        },
        {
          q: 'What voice commands are available?',
          a: 'Try: "Strip for me", "Strike a pose", "Generate video of you with [song name]", "Capture still frames", "Create a video", "Open photo editor", "Play [music]".'
        }
      ]
    },
    {
      id: 'effects',
      title: '🎨 Post & Profile Effects',
      questions: [
        {
          q: 'How do I add effects to my social posts?',
          a: 'In Social Feed, look for the Effects panel when creating a post. Choose visual filters (glow, neon, cyberpunk), animations (bounce, pulse, rotate), or audio effects (whoosh, chime, pop).'
        },
        {
          q: 'Can I animate my profile avatar?',
          a: 'Yes! Choose from Spinning Avatar, Glowing Avatar, Pulsing Avatar, or Rainbow Border. Effects apply to your profile picture on all posts and comments.'
        },
        {
          q: 'What visual filters are available?',
          a: '8 filters: Glow, Blur Background, Grayscale, Sepia, Neon, Vintage, Cyberpunk, Rainbow. All include CSS animations for maximum impact.'
        }
      ]
    },
    {
      id: 'drawing-tablet',
      title: '🖊️ Drawing Tablet Support',
      questions: [
        {
          q: 'Does Lunonex support drawing tablets?',
          a: 'YES! Full support for Wacom, Huion, XP-Pen, and all tablets with stylus. Pressure sensitivity controls brush size and opacity. Tilt detection included.'
        },
        {
          q: 'How do I enable pressure sensitivity?',
          a: 'Go to Photo Editor → Brush Settings. "Pressure Sensitivity" is enabled by default. Your brush size and opacity will respond to how hard you press your stylus.'
        },
        {
          q: 'What tablet features are supported?',
          a: 'Pressure sensitivity (0-100%), stylus tilt detection (X/Y angles), pen vs mouse detection, and real-time pressure feedback. Works seamlessly with all major tablets.'
        }
      ]
    },
    {
      id: 'offline',
      title: '💾 Offline & Desktop App',
      questions: [
        {
          q: 'Can I use Lunonex offline?',
          a: 'Yes! Download the .exe desktop app. TensorFlow.js AI models are bundled, so you can use AI features (face detection, body segmentation, content generation) completely offline.'
        },
        {
          q: 'Where do I download the desktop app?',
          a: 'Dashboard → Settings → Download Desktop App. The .exe is 200MB+ and includes all offline AI capabilities. Install once, use forever.'
        },
        {
          q: 'What works offline?',
          a: 'Photo editing, video editing, audio production, game engine, AI assistant (voice chat, 3D model), workflows, and all AI models (face detection, pose estimation, body segmentation).'
        }
      ]
    },
    {
      id: 'legal',
      title: '📜 Legal Documents',
      questions: [
        {
          q: 'Where can I review the legal documents I signed?',
          a: 'Right here in this FAQ! Scroll down to see the Terms of Service and Privacy Policy you agreed to.'
        },
        {
          q: 'When did I accept these documents?',
          a: signedDocs.accepted 
            ? `You accepted on ${new Date(signedDocs.date).toLocaleDateString()} at ${new Date(signedDocs.date).toLocaleTimeString()}`
            : 'You have not accepted the legal documents yet.'
        }
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
        ❓ Frequently Asked Questions
      </h1>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '3rem' }}>
        Everything you need to know about lunonex
      </p>

      {/* FAQ Sections */}
      {faqSections.map(section => (
        <div key={section.id} style={{ marginBottom: '2rem' }}>
          <h2 
            onClick={() => toggleSection(section.id)}
            style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              cursor: 'pointer',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {section.title}
            <span>{expandedSection === section.id ? '▼' : '▶'}</span>
          </h2>
          
          {expandedSection === section.id && (
            <div style={{ padding: '0 1rem' }}>
              {section.questions.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Q: {item.q}
                  </h3>
                  <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
                    A: {item.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Embedded Legal Documents */}
      {signedDocs.accepted && (
        <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
            📜 Your Signed Documents
          </h2>
          <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem' }}>
            Signed by {signedDocs.email} on {new Date(signedDocs.date).toLocaleDateString()}
          </p>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Terms of Service</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
              You accepted the lunonex Terms of Service, which govern your use of the platform,
              including content creation, monetization, and community guidelines.
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Privacy Policy</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
              You accepted our Privacy Policy, which explains how we collect, use, and protect your data.
              We never sell your information to third parties.
            </p>
          </div>

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
            Legal proof: Accepted {new Date(signedDocs.date).toISOString()}
          </p>
        </div>
      )}
    </div>
  );
}
