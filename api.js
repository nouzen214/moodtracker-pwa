// API Configuration
const API_BASE_URL = 'https://mood-tracker-backend-02wl.onrender.com/api';

// Helper function to get stored auth token (using user_id as token since backend doesn't provide one)
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
        // Backend expects: email, password, fullname
        const result = await apiCall('/signup', 'POST', { fullname, email, password });
        return result;
    },

    async signIn(email, password) {
        // Backend expects: email (password is ignored by backend currently but we send it)
        const result = await apiCall('/signin', 'POST', { email, password });

        // FIX: Handle backend response format
        // Backend returns: { success: true, user_id: "...", user_data: { ... } }
        if (result.success && result.user_id) {
            // Backend doesn't return idToken, so we use user_id as a token for now to satisfy isAuthenticated
            localStorage.setItem('idToken', result.user_id);
            localStorage.setItem('userId', result.user_id);

            // Extract role from user_data
            const role = (result.user_data && result.user_data.role) ? result.user_data.role : 'user';
            localStorage.setItem('userRole', role);

            localStorage.setItem('userEmail', email);

            // Add role to result for index.html to use
            result.role = role;
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
    async save(dateStr, mood, intensity, reflection) {
        const userId = getUserId();
        // Parse YYYY-MM-DD
        const [year, month, day] = dateStr.split('-');

        // Backend expects: user_id, year, month, day, mood, note
        return await apiCall('/save_mood', 'POST', {
            user_id: userId,
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            mood: mood,
            note: reflection // Backend calls it 'note'
            // intensity is not supported by backend save_mood yet, but we can append it to note if needed
            // For now, we'll just send what the backend supports
        });
    },

    async get() {
        const userId = getUserId();
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Backend expects: user_id, year, month
        const result = await apiCall('/get_moods', 'POST', {
            user_id: userId,
            year: year,
            month: month
        });

        // Transform backend response to match frontend expectation: { moods: { YYYY: { MM: { DD: ... } } } }
        // Backend returns: { moods: { DD: [ { mood: '...', ... } ] } } (structure depends on firebase)
        // We need to wrap it to match the calendar's expected structure

        const formattedMoods = {};
        if (result.moods) {
            formattedMoods[year] = {};
            formattedMoods[year][month] = result.moods;
        }

        return { moods: formattedMoods };
    },

    async delete(dateStr, index) {
        const userId = getUserId();
        const [year, month, day] = dateStr.split('-');

        return await apiCall('/delete_mood', 'POST', {
            user_id: userId,
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            index: index
        });
    },

    async deleteAll(dateStr) {
        const userId = getUserId();
        const [year, month, day] = dateStr.split('-');

        return await apiCall('/delete_all_moods', 'POST', {
            user_id: userId,
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day)
        });
    }
};

// AI Chat API
const ai = {
    async chat(message, history = []) {
        const userId = getUserId();
        // Backend expects: user_id, message
        return await apiCall('/ai_chat', 'POST', {
            user_id: userId,
            message: message
        });
    }
};

// Admin APIs
const admin = {
    async getAllUsers() {
        const userId = getUserId();
        // Backend expects: admin_id
        return await apiCall('/get_all_users', 'POST', {
            admin_id: userId
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
