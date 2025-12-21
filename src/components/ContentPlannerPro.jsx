import React, { useState } from 'react';
import { ContentPlanner as ContentPlannerOriginal } from './ContentPlanner';

/**
 * ContentPlannerPro - Professional content scheduling interface
 * Industry-standard UI inspired by Notion, Asana, Monday.com
 */
export function ContentPlannerPro({ userId }) {
    const [activeView, setActiveView] = useState('calendar');
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

    const VIEWS = [
        { id: 'calendar', name: 'Calendar View', icon: '📅' },
        { id: 'timeline', name: 'Timeline', icon: '📊' },
        { id: 'kanban', name: 'Kanban Board', icon: '📋' },
        { id: 'list', name: 'List View', icon: '📝' },
        { id: 'analytics', name: 'Analytics', icon: '📈' }
    ];

    return (
        <div className="content-planner-pro">
            {/* Professional Header */}
            <div className="professional-header" style={{
                background: '#2d2d2d',
                borderBottom: '1px solid #3e3e3e',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#cccccc' }}>
                        📅 Content Planner
                    </h2>

                    {/* View Selector Dropdown */}
                    <select
                        value={activeView}
                        onChange={(e) => setActiveView(e.target.value)}
                        style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '4px',
                            padding: '8px 32px 8px 12px',
                            color: '#cccccc',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '200px'
                        }}
                    >
                        {VIEWS.map(view => (
                            <option key={view.id} value={view.id}>
                                {view.icon} {view.name}
                            </option>
                        ))}
                    </select>

                    {/* Quick Actions */}
                    <button
                        style={{
                            background: '#4a9eff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>+</span>
                        <span>New Content</span>
                    </button>
                </div>

                {/* Right-side controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        style={{
                            background: 'transparent',
                            border: '1px solid #3e3e3e',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            color: '#cccccc',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                        style={{
                            background: leftPanelCollapsed ? '#404040' : 'transparent',
                            border: '1px solid #3e3e3e',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            color: '#cccccc',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        title="Toggle Sidebar"
                    >
                        📁
                    </button>
                    <button
                        onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                        style={{
                            background: rightPanelCollapsed ? '#404040' : 'transparent',
                            border: '1px solid #3e3e3e',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            color: '#cccccc',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        title="Toggle Details"
                    >
                        ℹ️
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div style={{
                display: 'flex',
                height: 'calc(100vh - 61px)',
                background: '#1e1e1e'
            }}>
                {/* Left Panel - Calendars/Filters */}
                {!leftPanelCollapsed && (
                    <div style={{
                        width: '280px',
                        background: '#252525',
                        borderRight: '1px solid #3e3e3e',
                        overflowY: 'auto',
                        padding: '16px'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#999',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '12px'
                            }}>
                                Views
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {VIEWS.map(view => (
                                    <button
                                        key={view.id}
                                        onClick={() => setActiveView(view.id)}
                                        style={{
                                            background: activeView === view.id ? '#404040' : 'transparent',
                                            border: activeView === view.id ? '1px solid #555' : '1px solid transparent',
                                            borderRadius: '4px',
                                            padding: '10px 12px',
                                            color: activeView === view.id ? '#ffffff' : '#cccccc',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{view.icon}</span>
                                        <span>{view.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Types */}
                        <div style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '6px',
                            padding: '16px',
                            marginTop: '20px'
                        }}>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Content Types
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { icon: '🎥', name: 'Videos', count: 12, color: '#ef4444' },
                                    { icon: '📸', name: 'Photos', count: 8, color: '#3b82f6' },
                                    { icon: '📝', name: 'Blog Posts', count: 5, color: '#8b5cf6' },
                                    { icon: '🎙️', name: 'Podcasts', count: 3, color: '#f59e0b' },
                                    { icon: '📱', name: 'Social Media', count: 24, color: '#10b981' }
                                ].map((type, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px',
                                            background: '#252525',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d2d'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#252525'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '16px' }}>{type.icon}</span>
                                            <span style={{ fontSize: '12px', color: '#cccccc' }}>{type.name}</span>
                                        </div>
                                        <span style={{
                                            fontSize: '11px',
                                            color: type.color,
                                            background: `${type.color}20`,
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontWeight: 600
                                        }}>
                                            {type.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Filters */}
                        <div style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '6px',
                            padding: '16px',
                            marginTop: '16px'
                        }}>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Status
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'Draft', color: '#6b7280' },
                                    { label: 'Scheduled', color: '#3b82f6' },
                                    { label: 'Published', color: '#10b981' },
                                    { label: 'In Review', color: '#f59e0b' }
                                ].map((status, idx) => (
                                    <label
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '12px',
                                            color: '#cccccc',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            style={{ accentColor: status.color }}
                                        />
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '3px',
                                                background: status.color
                                            }}
                                        />
                                        <span>{status.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Center - Main Content Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: '#1a1a1a',
                    padding: '20px'
                }}>
                    <ContentPlannerOriginal userId={userId} />
                </div>

                {/* Right Panel - Details */}
                {!rightPanelCollapsed && (
                    <div style={{
                        width: '320px',
                        background: '#252525',
                        borderLeft: '1px solid #3e3e3e',
                        overflowY: 'auto',
                        padding: '16px'
                    }}>
                        <h3 style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '16px'
                        }}>
                            Content Details
                        </h3>

                        {/* Schedule Info */}
                        <div style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '6px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '12px'
                            }}>
                                This Week
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px'
                                }}>
                                    <span style={{ color: '#999' }}>Scheduled</span>
                                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>8 items</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px'
                                }}>
                                    <span style={{ color: '#999' }}>Published</span>
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>5 items</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px'
                                }}>
                                    <span style={{ color: '#999' }}>Drafts</span>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>12 items</span>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '6px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '12px'
                            }}>
                                Upcoming Deadlines
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { title: 'Video Edit', date: 'Today, 3:00 PM', urgent: true },
                                    { title: 'Blog Post', date: 'Tomorrow, 9:00 AM', urgent: false },
                                    { title: 'Social Posts', date: 'Friday, 12:00 PM', urgent: false }
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '10px',
                                            background: '#252525',
                                            borderRadius: '4px',
                                            borderLeft: `3px solid ${item.urgent ? '#ef4444' : '#3b82f6'}`
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            marginBottom: '4px'
                                        }}>
                                            {item.title}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#999'
                                        }}>
                                            {item.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '6px',
                            padding: '16px'
                        }}>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '12px'
                            }}>
                                Performance
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '11px',
                                        color: '#999',
                                        marginBottom: '6px'
                                    }}>
                                        <span>Publishing Rate</span>
                                        <span style={{ color: '#10b981' }}>+12%</span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        background: '#2d2d2d',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: '75%',
                                            background: 'linear-gradient(90deg, #10b981, #059669)',
                                            borderRadius: '3px'
                                        }} />
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '11px',
                                        color: '#999',
                                        marginBottom: '6px'
                                    }}>
                                        <span>Engagement</span>
                                        <span style={{ color: '#3b82f6' }}>+8%</span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        background: '#2d2d2d',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: '60%',
                                            background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                                            borderRadius: '3px'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .content-planner-pro {
          background: #1e1e1e;
          color: #cccccc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }

        .content-planner-pro select:focus,
        .content-planner-pro button:focus,
        .content-planner-pro input:focus {
          outline: 2px solid #4a9eff;
          outline-offset: 2px;
        }

        .content-planner-pro button:hover {
          opacity: 0.9;
        }

        .content-planner-pro input[type="checkbox"] {
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}
