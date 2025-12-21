import React, { useState, useEffect } from 'react';
import './Education.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Education Component
 * Courses, tutorials, mentorship, certifications
 */
export default function Education() {
    const [activeTab, setActiveTab] = useState('courses'); // courses, tutorials, mentors, certifications
    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        loadCourses();
        loadTutorials();
        loadMentors();
        loadCertifications();
        if (userId) {
            loadMyCourses();
        }
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/education/courses`);
            const data = await response.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Failed to load courses:', error);
        }
        setLoading(false);
    };

    const loadMyCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/api/education/my-courses/${userId}`);
            const data = await response.json();
            setMyCourses(data.enrollments || []);
        } catch (error) {
            console.error('Failed to load my courses:', error);
        }
    };

    const loadTutorials = async () => {
        try {
            const response = await fetch(`${API_URL}/api/education/tutorials`);
            const data = await response.json();
            setTutorials(data.tutorials || []);
        } catch (error) {
            console.error('Failed to load tutorials:', error);
        }
    };

    const loadMentors = async () => {
        try {
            const response = await fetch(`${API_URL}/api/education/mentors`);
            const data = await response.json();
            setMentors(data.mentors || []);
        } catch (error) {
            console.error('Failed to load mentors:', error);
        }
    };

    const loadCertifications = async () => {
        try {
            const response = await fetch(`${API_URL}/api/education/certifications`);
            const data = await response.json();
            setCertifications(data.certifications || []);
        } catch (error) {
            console.error('Failed to load certifications:', error);
        }
    };

    const loadCourseDetails = async (courseId) => {
        try {
            const response = await fetch(`${API_URL}/api/education/course/${courseId}?userId=${userId || ''}`);
            const data = await response.json();
            setSelectedCourse(data);
        } catch (error) {
            console.error('Failed to load course details:', error);
        }
    };

    const handleEnroll = async (courseId, price) => {
        if (!userId) {
            alert('Please login to enroll');
            return;
        }
        
        if (price === 0) {
            // Free course - instant enrollment
            try {
                const response = await fetch(`${API_URL}/api/education/course/enroll`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ courseId, userId })
                });
                if (response.ok) {
                    alert('Enrolled successfully!');
                    loadMyCourses();
                }
            } catch (error) {
                console.error('Enrollment failed:', error);
            }
        } else {
            // Paid course - Stripe payment
            alert('Redirecting to payment... (Stripe integration)');
            // Stripe checkout can be implemented here
        }
    };

    const handleRequestMentorship = async (mentorId) => {
        if (!userId) {
            alert('Please login to request mentorship');
            return;
        }
        const message = prompt('Tell the mentor what you want to learn:');
        const duration = prompt('Session duration (hours):');
        if (!message || !duration) return;

        try {
            const response = await fetch(`${API_URL}/api/education/mentorship/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    mentorId,
                    menteeId: userId,
                    message,
                    durationHours: parseFloat(duration)
                })
            });
            if (response.ok) {
                alert('Mentorship request sent!');
            }
        } catch (error) {
            console.error('Failed to request mentorship:', error);
        }
    };

    return (
        <div className="education-container">
            <div className="education-header">
                <h1>🎓 Education</h1>
                <p>Learn from the best creators</p>
            </div>

            <div className="education-tabs">
                <button 
                    className={activeTab === 'courses' ? 'active' : ''}
                    onClick={() => setActiveTab('courses')}
                >
                    📚 Courses
                </button>
                {userId && (
                    <button 
                        className={activeTab === 'my-courses' ? 'active' : ''}
                        onClick={() => setActiveTab('my-courses')}
                    >
                        📖 My Courses
                    </button>
                )}
                <button 
                    className={activeTab === 'tutorials' ? 'active' : ''}
                    onClick={() => setActiveTab('tutorials')}
                >
                    🎬 Tutorials
                </button>
                <button 
                    className={activeTab === 'mentors' ? 'active' : ''}
                    onClick={() => setActiveTab('mentors')}
                >
                    👨‍🏫 Mentors
                </button>
                <button 
                    className={activeTab === 'certifications' ? 'active' : ''}
                    onClick={() => setActiveTab('certifications')}
                >
                    🏆 Certifications
                </button>
            </div>

            {activeTab === 'courses' && (
                <div className="courses-section">
                    <h2>Available Courses</h2>
                    {loading ? (
                        <div className="loading">Loading courses...</div>
                    ) : (
                        <div className="courses-grid">
                            {courses.map(course => (
                                <div key={course.id} className="course-card" onClick={() => loadCourseDetails(course.id)}>
                                    <div className="course-thumbnail">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} />
                                        ) : (
                                            <div className="placeholder-thumbnail">📚</div>
                                        )}
                                        {course.is_free ? (
                                            <span className="price-badge free">FREE</span>
                                        ) : (
                                            <span className="price-badge">${course.price}</span>
                                        )}
                                    </div>
                                    <div className="course-content">
                                        <h3>{course.title}</h3>
                                        <p className="instructor">by {course.instructor_username}</p>
                                        <p className="course-description">{course.description?.substring(0, 100)}...</p>
                                        <div className="course-meta">
                                            <span>⏱️ {course.duration_hours}h</span>
                                            <span>📊 {course.level}</span>
                                            <span>⭐ {course.average_rating?.toFixed(1) || 'New'}</span>
                                        </div>
                                        <div className="course-stats">
                                            <span>👥 {course.enrollment_count || 0} enrolled</span>
                                        </div>
                                        <button 
                                            className="enroll-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEnroll(course.id, course.price);
                                            }}
                                        >
                                            {course.is_free ? 'Enroll Free' : `Enroll $${course.price}`}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'my-courses' && (
                <div className="my-courses-section">
                    <h2>My Enrolled Courses</h2>
                    <div className="courses-grid">
                        {myCourses.map(enrollment => (
                            <div key={enrollment.id} className="course-card enrolled">
                                <div className="course-thumbnail">
                                    {enrollment.thumbnail_url ? (
                                        <img src={enrollment.thumbnail_url} alt={enrollment.course_title} />
                                    ) : (
                                        <div className="placeholder-thumbnail">📚</div>
                                    )}
                                    <div className="progress-overlay">
                                        <div className="progress-circle">
                                            <span>{enrollment.progress_percentage || 0}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="course-content">
                                    <h3>{enrollment.course_title}</h3>
                                    <p className="instructor">by {enrollment.instructor_username}</p>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="course-meta">
                                        <span>Started: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                                        {enrollment.completed_at && (
                                            <span>✅ Completed</span>
                                        )}
                                    </div>
                                    <button className="continue-btn">Continue Learning</button>
                                </div>
                            </div>
                        ))}
                        {myCourses.length === 0 && (
                            <div className="empty-state">
                                <p>You haven't enrolled in any courses yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'tutorials' && (
                <div className="tutorials-section">
                    <h2>Free Tutorials</h2>
                    <div className="tutorials-grid">
                        {tutorials.map(tutorial => (
                            <div key={tutorial.id} className="tutorial-card">
                                <div className="tutorial-thumbnail">
                                    {tutorial.thumbnail_url ? (
                                        <img src={tutorial.thumbnail_url} alt={tutorial.title} />
                                    ) : (
                                        <div className="placeholder-thumbnail">🎬</div>
                                    )}
                                    <span className="duration-badge">{tutorial.duration_minutes}m</span>
                                </div>
                                <div className="tutorial-content">
                                    <h3>{tutorial.title}</h3>
                                    <p className="creator">by {tutorial.creator_username}</p>
                                    <div className="tutorial-meta">
                                        <span>📊 {tutorial.difficulty}</span>
                                        <span>👁️ {tutorial.view_count || 0} views</span>
                                    </div>
                                    <button className="watch-btn">Watch Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'mentors' && (
                <div className="mentors-section">
                    <h2>Find a Mentor</h2>
                    <div className="mentors-grid">
                        {mentors.map(mentor => (
                            <div key={mentor.id} className="mentor-card">
                                <div className="mentor-avatar">
                                    {mentor.avatar_url ? (
                                        <img src={mentor.avatar_url} alt={mentor.username} />
                                    ) : (
                                        <div className="placeholder-avatar">👨‍🏫</div>
                                    )}
                                </div>
                                <div className="mentor-content">
                                    <h3>{mentor.username}</h3>
                                    <p className="mentor-bio">{mentor.bio?.substring(0, 100)}...</p>
                                    <div className="specialties">
                                        {mentor.specialties?.slice(0, 3).map((spec, i) => (
                                            <span key={i} className="specialty-badge">{spec}</span>
                                        ))}
                                    </div>
                                    <div className="mentor-meta">
                                        <span>⭐ {mentor.rating?.toFixed(1) || 'New'}</span>
                                        <span>👥 {mentor.total_sessions || 0} sessions</span>
                                        <span>💰 ${mentor.hourly_rate}/hr</span>
                                    </div>
                                    <button 
                                        className="request-btn"
                                        onClick={() => handleRequestMentorship(mentor.id)}
                                    >
                                        Request Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'certifications' && (
                <div className="certifications-section">
                    <h2>Earn Certifications</h2>
                    <div className="certifications-grid">
                        {certifications.map(cert => (
                            <div key={cert.id} className="certification-card">
                                <div className="cert-badge">🏆</div>
                                <h3>{cert.name}</h3>
                                <p className="cert-description">{cert.description}</p>
                                <div className="cert-requirements">
                                    <strong>Requirements:</strong>
                                    <ul>
                                        {cert.requirements?.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="cert-stats">
                                    <span>🏅 {cert.issued_count || 0} issued</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedCourse && (
                <div className="course-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedCourse.title}</h2>
                            <button onClick={() => setSelectedCourse(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p className="instructor">Instructor: {selectedCourse.instructor_username}</p>
                            <p className="description">{selectedCourse.description}</p>
                            <div className="modules">
                                <h3>Course Modules</h3>
                                {selectedCourse.modules?.map((module, i) => (
                                    <div key={i} className="module">
                                        <h4>{module.title}</h4>
                                        <span>{module.lesson_count} lessons</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
