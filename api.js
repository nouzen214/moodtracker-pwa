// API Configuration
const API_BASE_URL = 'https://mood-tracker-backend-02wl.onrender.com/api';

// Helper function to get stored auth token
function getAuthToken() {
    return localStorage.getItem('idToken');
}

// Helper function to get stored user ID
function getUserId() {
    return localStorage.getItem('userId');
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication APIs
const auth = {
    async signUp(fullname, email, password) {
        const result = await apiCall('/signup', 'POST', { fullname, email, password });
        return result;
    },

    async signIn(email, password) {
        const result = await apiCall('/signin', 'POST', { email, password });
        if (result.idToken && result.localId) {
            localStorage.setItem('idToken', result.idToken);
            localStorage.setItem('userId', result.localId);
            localStorage.setItem('userRole', result.role);
            localStorage.setItem('userEmail', email);
        }
        return result;
    },

    signOut() {
        localStorage.clear();
        window.location.href = 'index.html';
    },

    isAuthenticated() {
        return !!getAuthToken();
    },

    getRole() {
        return localStorage.getItem('userRole');
    }
};

// Mood APIs
const moods = {
    async save(date, mood, intensity, reflection) {
        const token = getAuthToken();
        const userId = getUserId();
        return await apiCall('/save_mood', 'POST', {
            uid: userId,
            date, mood, intensity, reflection,
            id_token: token
        });
    },

    async get() {
        const token = getAuthToken();
        const userId = getUserId();
        return await apiCall('/get_moods', 'POST', {
            uid: userId,
            id_token: token
        });
    },

    async delete(date, index) {
        const token = getAuthToken();
        const userId = getUserId();
        return await apiCall('/delete_mood', 'POST', {
            uid: userId,
            date, index,
            id_token: token
        });
    },

    async deleteAll(date) {
        const token = getAuthToken();
        const userId = getUserId();
        return await apiCall('/delete_all_moods', 'POST', {
            uid: userId,
            date,
            id_token: token
        });
    }
};

// AI Chat API
const ai = {
    async chat(message, history = []) {
        const token = getAuthToken();
        const userId = getUserId();
        return await apiCall('/ai_chat', 'POST', {
            uid: userId,
            message,
            history,
            id_token: token
        });
    }
};

// Admin APIs
const admin = {
    async getAllUsers() {
        const token = getAuthToken();
        const userId = getUserId();
        return await apiCall('/get_all_users', 'POST', {
            admin_uid: userId,
            id_token: token
        });
    }
};

// Health check
async function checkHealth() {
    try {
        const result = await apiCall('/health');
        console.log('Backend health:', result);
        return result;
    } catch (error) {
        console.error('Backend is offline:', error);
        return null;
    }
}
