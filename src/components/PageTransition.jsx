import React, { useEffect, useState } from 'react';
import './PageTransition.css';

export function PageTransition({ children, isActive }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!show && !isActive) return null;

  return (
    <div className={`page-transition ${isActive ? 'active' : 'exit'}`}>
      {children}
    </div>
  );
}

export function FadeIn({ children, delay = 0 }) {
  return (
    <div className="fade-in" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function SlideUp({ children, delay = 0 }) {
  return (
    <div className="slide-up" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
