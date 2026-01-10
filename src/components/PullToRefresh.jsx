import React, { useState, useRef, useEffect } from 'react';
import './PullToRefresh.css';

/**
 * PullToRefresh - Native-style pull-to-refresh component
 * 
 * Usage:
 * <PullToRefresh onRefresh={async () => { await loadData(); }}>
 *   <YourContent />
 * </PullToRefresh>
 */
export const PullToRefresh = ({ children, onRefresh, disabled = false }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const touchStartY = useRef(0);
  const containerRef = useRef(null);
  
  const PULL_THRESHOLD = 80; // Distance to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    // Check if we're at the top of the scrollable container
    const checkScrollPosition = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        setCanPull(scrollTop === 0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  const handleTouchStart = (e) => {
    if (disabled || isRefreshing || !canPull) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (disabled || isRefreshing || !canPull) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    // Only pull down when at the top and pulling downward
    if (diff > 0) {
      // Apply resistance for smooth feel
      const resistance = 2.5;
      const distance = Math.min(diff / resistance, MAX_PULL);
      setPullDistance(distance);
      
      // Prevent default scroll behavior during pull
      if (distance > 5) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;
    
    // Trigger refresh if pulled past threshold
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Reset pull distance
    setPullDistance(0);
  };

  const getRefreshStatus = () => {
    if (isRefreshing) return 'Refreshing...';
    if (pullDistance >= PULL_THRESHOLD) return 'Release to refresh';
    if (pullDistance > 0) return 'Pull to refresh';
    return '';
  };

  const getSpinnerRotation = () => {
    if (isRefreshing) return 'spin';
    return pullDistance / PULL_THRESHOLD * 360;
  };

  return (
    <div className="pull-to-refresh-wrapper">
      {/* Refresh indicator */}
      <div 
        className="refresh-indicator"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance > 0 ? 1 : 0,
          pointerEvents: 'none'
        }}
      >
        <div 
          className={`refresh-spinner ${isRefreshing ? 'spinning' : ''}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${getSpinnerRotation()}deg)`
          }}
        >
          ↻
        </div>
        <span className="refresh-text">{getRefreshStatus()}</span>
      </div>

      {/* Content container */}
      <div
        ref={containerRef}
        className="pull-to-refresh-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
