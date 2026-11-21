// API Configuration
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal && (window.location.port === '8080' || window.location.port === '3000')
    ? 'http://localhost:8000'
    : window.location.origin;
const API_TIMEOUT = 10000;

// API Client
class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('access_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('access_token', token);
    }

    getToken() {
        return this.token;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add Authorization header for all non-auth endpoints
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            ...options,
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error: ${endpoint}`, error);
            throw error;
        }
    }

    // ============ AUTHENTICATION ============
    async googleSignIn(token, profile = {}) {
        return this.request('/auth/google', {
            method: 'POST',
            body: { token, ...profile },
        });
    }

    async firebaseSignIn(token, profile = {}) {
        return this.googleSignIn(token, profile);
    }

    async githubSignIn(code) {
        return this.request('/auth/github', {
            method: 'POST',
            body: { code },
        });
    }

    async registerUser(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async updateUserProfile(updates) {
        return this.request('/auth/me', {
            method: 'PUT',
            body: updates,
        });
    }

    // ============ SUBJECTS ============
    async getJobRoles() {
        return this.request('/subjects/job-roles');
    }

    async getSubjectsByJobRole(jobRole) {
        return this.request(`/subjects/by-role?job_role=${encodeURIComponent(jobRole)}`);
    }

    async getAllSubjects() {
        return this.request('/subjects/all');
    }

    // ============ EXAMS ============
    async startExam(subject, jobRole) {
        return this.request('/exams/start', {
            method: 'POST',
            body: { subject, job_role: jobRole },
        });
    }

    async getExamStatus(examId) {
        return this.request(`/exams/${examId}`);
    }

    async submitAnswer(examId, questionId, answer, timeSpent) {
        return this.request(`/exams/submit-answer?exam_id=${encodeURIComponent(examId)}`, {
            method: 'POST',
            body: {
                question_id: questionId,
                answer,
                time_spent: timeSpent,
            },
        });
    }

    async completeExam(examId) {
        return this.request(`/exams/complete/${examId}`, {
            method: 'POST',
        });
    }

    async getExamHistory() {
        return this.request('/exams/history');
    }

    // ============ PROCTORING ============
    async startProctoring(examId) {
        return this.request(`/proctoring/start/${examId}`, {
            method: 'POST',
        });
    }

    async getProctoringStatus(examId) {
        return this.request(`/proctoring/status/${examId}`);
    }

    async logProctoringViolation(examId, violationType, severity, description) {
        return this.request(`/proctoring/log-violation/${examId}`, {
            method: 'POST',
            body: {
                violation_type: violationType,
                severity,
                description,
            },
        });
    }

    getWebSocketURL(examId) {
        return `ws://localhost:8000/proctoring/ws/${examId}/${localStorage.getItem('user_id')}`;
    }
}

// Global API Client Instance
const api = new APIClient();

// Utility Functions
function showLoading(show = true) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
