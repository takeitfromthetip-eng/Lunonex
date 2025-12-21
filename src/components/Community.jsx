import React, { useState, useEffect } from 'react';
import './Community.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Community Component
 * Forums, events, discussions for creator communities
 */
export default function Community() {
    const [activeTab, setActiveTab] = useState('forums'); // forums, events, discussions
    const [forums, setForums] = useState([]);
    const [events, setEvents] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedForum, setSelectedForum] = useState(null);
    const [forumPosts, setForumPosts] = useState([]);
    
    const userId = localStorage.getItem('userId');
    const isCreator = localStorage.getItem('userTier') !== 'free';

    useEffect(() => {
        loadForums();
        loadEvents();
        loadDiscussions();
        loadStats();
    }, []);

    const loadForums = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/community/forums`);
            const data = await response.json();
            setForums(data.forums || []);
        } catch (error) {
            console.error('Failed to load forums:', error);
        }
        setLoading(false);
    };

    const loadEvents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/community/events`);
            const data = await response.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    };

    const loadDiscussions = async () => {
        try {
            const response = await fetch(`${API_URL}/api/community/discussions`);
            const data = await response.json();
            setDiscussions(data.discussions || []);
        } catch (error) {
            console.error('Failed to load discussions:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/community/stats`);
            const data = await response.json();
            setStats(data.stats || {});
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadForumPosts = async (forumId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/community/forums/${forumId}/posts?sort=recent`);
            const data = await response.json();
            setForumPosts(data.posts || []);
            setSelectedForum(forumId);
        } catch (error) {
            console.error('Failed to load forum posts:', error);
        }
        setLoading(false);
    };

    const handleRSVP = async (eventId) => {
        if (!userId) {
            alert('Please login to RSVP');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/community/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId })
            });
            if (response.ok) {
                alert('RSVP confirmed!');
                loadEvents();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to RSVP');
            }
        } catch (error) {
            console.error('RSVP failed:', error);
        }
    };

    const handleCreateForum = async () => {
        if (!isCreator) {
            alert('Only creators can create forums');
            return;
        }
        const name = prompt('Forum name:');
        const description = prompt('Forum description:');
        const category = prompt('Category (general/art/tech/events/support):');
        if (!name || !description || !category) return;

        try {
            const response = await fetch(`${API_URL}/api/community/forums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    creatorId: userId,
                    name,
                    description,
                    category,
                    isPrivate: false
                })
            });
            if (response.ok) {
                alert('Forum created!');
                loadForums();
            }
        } catch (error) {
            console.error('Failed to create forum:', error);
        }
    };

    const handleCreateEvent = async () => {
        if (!isCreator) {
            alert('Only creators can create events');
            return;
        }
        const title = prompt('Event title:');
        const description = prompt('Event description:');
        const startTime = prompt('Start time (YYYY-MM-DD HH:MM):');
        const capacity = prompt('Max attendees (0 for unlimited):');
        if (!title || !description || !startTime) return;

        try {
            const response = await fetch(`${API_URL}/api/community/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    creatorId: userId,
                    title,
                    description,
                    startTime,
                    capacity: parseInt(capacity) || null,
                    isPaid: false
                })
            });
            if (response.ok) {
                alert('Event created!');
                loadEvents();
            }
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    };

    return (
        <div className="community-container">
            <div className="community-header">
                <h1>🏘️ Community</h1>
                <p>Connect with creators and fans</p>
            </div>

            <div className="community-stats">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalForums || 0}</div>
                    <div className="stat-label">Forums</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalEvents || 0}</div>
                    <div className="stat-label">Events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalDiscussions || 0}</div>
                    <div className="stat-label">Discussions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalMembers || 0}</div>
                    <div className="stat-label">Members</div>
                </div>
            </div>

            <div className="community-tabs">
                <button 
                    className={activeTab === 'forums' ? 'active' : ''}
                    onClick={() => setActiveTab('forums')}
                >
                    💬 Forums
                </button>
                <button 
                    className={activeTab === 'events' ? 'active' : ''}
                    onClick={() => setActiveTab('events')}
                >
                    📅 Events
                </button>
                <button 
                    className={activeTab === 'discussions' ? 'active' : ''}
                    onClick={() => setActiveTab('discussions')}
                >
                    💭 Discussions
                </button>
            </div>

            {activeTab === 'forums' && (
                <div className="forums-section">
                    <div className="section-header">
                        <h2>Forums</h2>
                        {isCreator && (
                            <button className="create-btn" onClick={handleCreateForum}>
                                + Create Forum
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <div className="loading">Loading forums...</div>
                    ) : (
                        <div className="forums-grid">
                            {forums.map(forum => (
                                <div key={forum.id} className="forum-card" onClick={() => loadForumPosts(forum.id)}>
                                    <div className="forum-header">
                                        <h3>{forum.name}</h3>
                                        <span className="category-badge">{forum.category}</span>
                                    </div>
                                    <p className="forum-description">{forum.description}</p>
                                    <div className="forum-stats">
                                        <span>👥 {forum.member_count || 0} members</span>
                                        <span>💬 {forum.post_count || 0} posts</span>
                                    </div>
                                    {forum.is_private && <span className="private-badge">🔒 Private</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'events' && (
                <div className="events-section">
                    <div className="section-header">
                        <h2>Upcoming Events</h2>
                        {isCreator && (
                            <button className="create-btn" onClick={handleCreateEvent}>
                                + Create Event
                            </button>
                        )}
                    </div>
                    <div className="events-grid">
                        {events.map(event => (
                            <div key={event.id} className="event-card">
                                <div className="event-date">
                                    <div className="month">{new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}</div>
                                    <div className="day">{new Date(event.start_time).getDate()}</div>
                                </div>
                                <div className="event-content">
                                    <h3>{event.title}</h3>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-meta">
                                        <span>⏰ {new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>👥 {event.attendee_count || 0} attending</span>
                                        {event.capacity && <span>🎫 {event.capacity - (event.attendee_count || 0)} spots left</span>}
                                        {event.is_paid && <span>💰 Paid Event</span>}
                                    </div>
                                    <button 
                                        className="rsvp-btn"
                                        onClick={() => handleRSVP(event.id)}
                                    >
                                        RSVP
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'discussions' && (
                <div className="discussions-section">
                    <div className="section-header">
                        <h2>Community Discussions</h2>
                    </div>
                    <div className="discussions-list">
                        {discussions.map(discussion => (
                            <div key={discussion.id} className="discussion-card">
                                <h3>{discussion.title}</h3>
                                <p className="discussion-content">{discussion.content?.substring(0, 200)}...</p>
                                <div className="discussion-meta">
                                    <span>👤 {discussion.creator_username || 'Anonymous'}</span>
                                    <span>💬 {discussion.reply_count || 0} replies</span>
                                    <span>👁️ {discussion.view_count || 0} views</span>
                                    <span className="discussion-date">{new Date(discussion.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedForum && forumPosts.length > 0 && (
                <div className="forum-posts-modal">
                    <div className="modal-header">
                        <h2>Forum Posts</h2>
                        <button onClick={() => setSelectedForum(null)}>✕ Close</button>
                    </div>
                    <div className="posts-list">
                        {forumPosts.map(post => (
                            <div key={post.id} className="post-card">
                                <h4>{post.title}</h4>
                                <p>{post.content?.substring(0, 150)}...</p>
                                <div className="post-meta">
                                    <span>👤 {post.author_username}</span>
                                    <span>💬 {post.reply_count || 0} replies</span>
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
