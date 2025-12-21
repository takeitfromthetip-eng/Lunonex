// Backend API Client for ForTheWeebs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper to make authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API
export const auth = {
  async signup(email, username, password) {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  async login(emailOrUsername, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  async getMe() {
    return apiRequest('/api/auth/me');
  },

  logout() {
    localStorage.removeItem('authToken');
  },
};

// Relationships API
export const relationships = {
  async follow(targetUserId) {
    return apiRequest('/api/relationships/follow', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  },

  async unfollow(targetUserId) {
    return apiRequest(`/api/relationships/follow/${targetUserId}`, { method: 'DELETE' });
  },

  async getFollowers() {
    return apiRequest('/api/relationships/followers');
  },

  async getFollowing() {
    return apiRequest('/api/relationships/following');
  },

  async sendFriendRequest(targetUserId) {
    return apiRequest('/api/relationships/friend-request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  },

  async acceptFriendRequest(targetUserId) {
    return apiRequest(`/api/relationships/friend-request/${targetUserId}/accept`, { method: 'POST' });
  },

  async removeFriend(friendId) {
    return apiRequest(`/api/relationships/friend/${friendId}`, { method: 'DELETE' });
  },

  async getFriends() {
    return apiRequest('/relationships/friends');
  },

  async blockUser(targetUserId) {
    return apiRequest('/relationships/block', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  },
};

// Subscriptions API
export const subscriptions = {
  async createCheckout(creatorId, tier, priceCents) {
    return apiRequest('/subscriptions/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ creatorId, tier, priceCents }),
    });
  },

  async checkSubscription(creatorId) {
    return apiRequest(`/subscriptions/check/${creatorId}`);
  },

  async getMySubscriptions() {
    return apiRequest('/subscriptions/my-subscriptions');
  },

  async getMySubscribers() {
    return apiRequest('/subscriptions/my-subscribers');
  },

  async cancel(subscriptionId) {
    return apiRequest(`/subscriptions/${subscriptionId}`, { method: 'DELETE' });
  },
};

// Posts API
export const posts = {
  async create(postData) {
    return apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async getFeed(limit = 50, offset = 0) {
    return apiRequest(`/api/posts/feed?limit=${limit}&offset=${offset}`);
  },

  async getPost(postId) {
    return apiRequest(`/api/posts/${postId}`);
  },

  async like(postId) {
    return apiRequest(`/api/posts/${postId}/like`, { method: 'POST' });
  },

  async share(postId) {
    return apiRequest(`/api/posts/${postId}/share`, { method: 'POST' });
  },

  async delete(postId) {
    return apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
  },
};

// Comments API
export const comments = {
  async getComments(postId, limit = 50, offset = 0) {
    return apiRequest(`/comments/${postId}?limit=${limit}&offset=${offset}`);
  },

  async create(postId, body, parentCommentId = null) {
    return apiRequest('/comments/create', {
      method: 'POST',
      body: JSON.stringify({ postId, body, parentCommentId }),
    });
  },

  async like(commentId) {
    return apiRequest(`/comments/${commentId}/like`, { method: 'POST' });
  },

  async getReplies(commentId, limit = 20, offset = 0) {
    return apiRequest(`/comments/${commentId}/replies?limit=${limit}&offset=${offset}`);
  },

  async delete(commentId) {
    return apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
  },
};

// Messages API
export const messages = {
  async getConversations() {
    return apiRequest('/messages/conversations');
  },

  async getConversation(conversationId, limit = 50, offset = 0) {
    return apiRequest(`/messages/conversation/${conversationId}?limit=${limit}&offset=${offset}`);
  },

  async send(recipientId, body, mediaUrls = [], conversationId = null) {
    return apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, body, mediaUrls, conversationId }),
    });
  },

  async markRead(messageId) {
    return apiRequest(`/messages/${messageId}/read`, { method: 'POST' });
  },

  async delete(messageId) {
    return apiRequest(`/messages/${messageId}`, { method: 'DELETE' });
  },

  async getUnreadCount() {
    return apiRequest('/messages/unread-count');
  },
};

// Notifications API
export const notifications = {
  async getAll(unreadOnly = false) {
    return apiRequest(`/notifications?unreadOnly=${unreadOnly}`);
  },

  async getUnreadCount() {
    return apiRequest('/notifications/unread-count');
  },

  async markAsRead(notificationId) {
    return apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
  },

  async markAllAsRead() {
    return apiRequest('/notifications/mark-all-read', { method: 'POST' });
  },

  async delete(notificationId) {
    return apiRequest(`/notifications/${notificationId}`, { method: 'DELETE' });
  },
};

// Stats API
export const stats = {
  async getUserStats(userId) {
    return apiRequest(`/stats/users/${userId}`);
  },

  async getRevenueStats(userId) {
    return apiRequest(`/stats/users/${userId}/revenue`);
  },

  async getDashboardStats() {
    return apiRequest('/stats/dashboard');
  },
};

// Default export with all modules
const api = {
  auth,
  relationships,
  subscriptions,
  posts,
  comments,
  messages,
  notifications,
  stats,
};

export default api;
