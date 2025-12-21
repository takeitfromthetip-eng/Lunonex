import React, { useState, useEffect } from 'react';
import './QuickAccessWidget.css';

/**
 * QuickAccessWidget - Customizable floating widget wheel
 * Users can add their favorite tools/pages for quick access
 * Works on desktop and mobile
 */
export default function QuickAccessWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('quickAccessItems');
    return saved ? JSON.parse(saved) : [
      { id: 1, icon: '🎨', label: 'Create', action: '/create' },
      { id: 2, icon: '📊', label: 'Analytics', action: '/analytics' },
      { id: 3, icon: '💰', label: 'Earnings', action: '/earnings' },
      { id: 4, icon: '⚙️', label: 'Settings', action: '/settings' },
    ];
  });
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('quickAccessPosition');
    return saved ? JSON.parse(saved) : { x: 24, y: window.innerHeight - 176 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quickAccessItems', JSON.stringify(items));
  }, [items]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('quickAccessPosition', JSON.stringify(position));
  }, [position]);

  const handleItemClick = (item) => {
    if (isEditing) return;
    
    // Handle action (navigate or trigger function)
    if (item.action.startsWith('/')) {
      window.location.href = item.action;
    } else if (item.action.startsWith('http')) {
      window.open(item.action, '_blank');
    } else {
      // Custom action handler
      console.log('Execute action:', item.action);
    }
    setIsOpen(false);
  };

  const addItem = () => {
    const icon = prompt('Enter emoji icon (e.g., 🚀):');
    const label = prompt('Enter label:');
    const action = prompt('Enter URL or path (e.g., /dashboard or https://...):');
    
    if (icon && label && action) {
      const newItem = {
        id: Date.now(),
        icon,
        label,
        action
      };
      setItems([...items, newItem]);
    }
  };

  const removeItem = (id) => {
    if (confirm('Remove this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const editItem = (item) => {
    const icon = prompt('Enter emoji icon:', item.icon);
    const label = prompt('Enter label:', item.label);
    const action = prompt('Enter URL or path:', item.action);
    
    if (icon !== null && label !== null && action !== null) {
      setItems(items.map(i => 
        i.id === item.id 
          ? { ...i, icon, label, action }
          : i
      ));
    }
  };

  // Calculate positions for items in a circle
  const getItemPosition = (index, total) => {
    const radius = 100;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  // Dragging handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.quick-access-item')) return; // Don't drag when clicking items
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (e.target.closest('.quick-access-item')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragOffset.x,
      y: touch.clientY - dragOffset.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`quick-access-widget ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Center button */}
      <button 
        className="quick-access-center"
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Access"
      >
        <span className="icon">{isOpen ? '✕' : '⚡'}</span>
      </button>

      {/* Radial items */}
      {isOpen && (
        <>
          <div className="quick-access-items">
            {items.map((item, index) => {
              const pos = getItemPosition(index, items.length);
              return (
                <button
                  key={item.id}
                  className="quick-access-item"
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`
                  }}
                  onClick={() => handleItemClick(item)}
                  title={item.label}
                >
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-label">{item.label}</span>
                  {isEditing && (
                    <div className="item-actions">
                      <button 
                        className="edit-btn"
                        onClick={(e) => { e.stopPropagation(); editItem(item); }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Edit controls */}
          <div className="quick-access-controls">
            <button 
              className="control-btn"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'Done Editing' : 'Edit Items'}
            >
              {isEditing ? '✓' : '⚙️'}
            </button>
            {isEditing && (
              <button 
                className="control-btn add-btn"
                onClick={addItem}
                title="Add Item"
              >
                ➕
              </button>
            )}
          </div>
        </>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <div className="drag-indicator">
          <span>↔️</span>
        </div>
      )}
    </div>
  );
}
