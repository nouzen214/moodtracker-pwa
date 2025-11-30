// Load configuration from config.js (local development) or use defaults
// Firebase API key is PUBLIC and protected by Firebase Security Rules
// Gemini API key should be in config.js (not committed to GitHub)

let CONFIG = {
    FIREBASE_API_KEY: "AIzaSyCM10_89lNtUzOBIse37J2Mbc6qqPxncj0",
    DATABASE_URL: "https://mood-tracker-df3a2-default-rtdb.asia-southeast1.firebasedatabase.app/",
    GEMINI_KEY: "AIzaSyDJdJ7eF8afLIsbjlRrAYqPtlqZYKj6Eh0",
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
};

// Try to load from config.js if it exists (for local development)
try {
    if (typeof window.CONFIG !== 'undefined') {
        CONFIG = {
            ...CONFIG,
            ...window.CONFIG
        };
    }
} catch (e) {
    console.log('config.js not found, using defaults');
}

// Validate Gemini API key
if (!CONFIG.GEMINI_KEY) {
    console.warn('⚠️ Gemini API key not configured! AI chat will not work. Create web/config.js from config.js.example');
}

const FIREBASE_API_KEY = CONFIG.FIREBASE_API_KEY;
const DATABASE_URL = CONFIG.DATABASE_URL;
const GEMINI_KEY = CONFIG.GEMINI_KEY;
const GEMINI_API_URL = CONFIG.GEMINI_API_URL;

// Helper functions
function getAuthToken() {
    return localStorage.getItem('idToken');
}

function getUserId() {
    return localStorage.getItem('userId');
}

// Firebase REST API helpers
async function fbGet(path, auth = null) {
    try {
        path = path.replace(/^\//, '');
        let url = `${DATABASE_URL}${path}.json`;
        if (auth) url += `?auth=${auth}`;

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Firebase GET error:', error);
        return { error: error.message };
    }
}

async function fbPut(path, data, auth = null) {
    try {
        path = path.replace(/^\//, '');
        let url = `${DATABASE_URL}${path}.json`;
        if (auth) url += `?auth=${auth}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Firebase PUT error:', error);
        return { error: error.message };
    }
}

async function fbPost(path, data, auth = null) {
    try {
        path = path.replace(/^\//, '');
        let url = `${DATABASE_URL}${path}.json`;
        if (auth) url += `?auth=${auth}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Firebase POST error:', error);
        return { error: error.message };
    }
}

async function fbDelete(path, auth = null) {
    try {
        path = path.replace(/^\//, '');
        let url = `${DATABASE_URL}${path}.json`;
        if (auth) url += `?auth=${auth}`;

        const response = await fetch(url, { method: 'DELETE' });
        return await response.json();
    } catch (error) {
        console.error('Firebase DELETE error:', error);
        return { error: error.message };
    }
}

// Authentication APIs
const auth = {
    async signUp(fullname, email, password) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const uid = data.localId;
        const idToken = data.idToken;
        const role = email.endsWith('@admin.com') ? 'admin' : 'user';

        await fbPut(`users/${uid}`, { fullname, email, role }, idToken);

        return { success: true, uid, idToken, role };
    },

    async signIn(email, password) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const idToken = data.idToken;
        const uid = data.localId;

        const userInfo = await fbGet(`users/${uid}`, idToken) || {};
        const role = userInfo.role || 'user';

        localStorage.setItem('idToken', idToken);
        localStorage.setItem('userId', uid);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);

        return { success: true, uid, idToken, role, userInfo };
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
    async save(year, month, day, mood, intensity, reflection) {
        const userId = getUserId();
        const idToken = getAuthToken();

        const entry = {
            mood,
            intensity,
            reflection,
            timestamp: new Date().toISOString()
        };

        const existing = await fbGet(`moods/${userId}/${year}/${month}/${day}`, idToken);
        let moodList = Array.isArray(existing) ? existing : [];

        if (moodList.length >= 10) {
            throw new Error('Maximum 10 moods per day reached');
        }

        moodList.push(entry);
        return await fbPut(`moods/${userId}/${year}/${month}/${day}`, moodList, idToken);
    },

    async get(year, month) {
        const userId = getUserId();
        const idToken = getAuthToken();
        return await fbGet(`moods/${userId}/${year}/${month}`, idToken);
    },

    async getAll() {
        const userId = getUserId();
        const idToken = getAuthToken();
        return await fbGet(`moods/${userId}`, idToken);
    },

    async delete(year, month, day, index) {
        const userId = getUserId();
        const idToken = getAuthToken();

        const existing = await fbGet(`moods/${userId}/${year}/${month}/${day}`, idToken);
        if (Array.isArray(existing) && index >= 0 && index < existing.length) {
            existing.splice(index, 1);
            return await fbPut(`moods/${userId}/${year}/${month}/${day}`, existing, idToken);
        }
    },

    async deleteAll(year, month, day) {
        const userId = getUserId();
        const idToken = getAuthToken();
        return await fbPut(`moods/${userId}/${year}/${month}/${day}`, [], idToken);
    }
};

// AI Chat API
const ai = {
    async chat(message) {
        const url = `${GEMINI_API_URL}?key=${GEMINI_KEY}`;
        const systemInstruction = "You are a helpful Mood Tracker assistant. You must ONLY discuss topics related to mood, mental health, emotional well-being, and mindfulness. If the user asks about anything else, politely decline and steer the conversation back to their feelings.";

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemInstruction },
                            { text: message }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                })
            });

            const data = await response.json();
            console.log('Gemini API Response:', data);

            if (data.error) {
                console.error('Gemini API Error:', data.error);
                return { response: `API Error: ${data.error.message || 'Unknown error'}` };
            }

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return { response: data.candidates[0].content.parts[0].text };
            }

            if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
                return { response: "I'm sorry, but I can't respond to that specific message due to safety guidelines. Let's talk about your mood instead." };
            }

            if (data.candidates && data.candidates[0]?.finishReason) {
                console.warn('Gemini finish reason:', data.candidates[0].finishReason);
                return { response: `Response blocked (Reason: ${data.candidates[0].finishReason}). Please try rephrasing your message.` };
            }

            return { response: "Sorry, I couldn't generate a response. Please try again." };

        } catch (error) {
            console.error('Gemini API Exception:', error);
            return { response: `Error: ${error.message}. Please check your internet connection.` };
        }
    }
};

// Messages API
const messages = {
    async get() {
        const userId = getUserId();
        const idToken = getAuthToken();
        return await fbGet(`messages/${userId}`, idToken);
    },

    async getUnreadCount() {
        const msgs = await this.get();
        if (!msgs || typeof msgs !== 'object') return 0;

        return Object.values(msgs).filter(m =>
            typeof m === 'object' && m.status === 'new'
        ).length;
    },

    async markAsRead() {
        const userId = getUserId();
        const idToken = getAuthToken();
        const msgs = await this.get();

        if (msgs && typeof msgs === 'object') {
            Object.keys(msgs).forEach(key => {
                if (msgs[key].status === 'new') {
                    msgs[key].status = 'read';
                }
            });
            return await fbPut(`messages/${userId}`, msgs, idToken);
        }
    }
};

// Admin APIs
const admin = {
    async getAllUsers() {
        const adminId = getUserId();
        const idToken = getAuthToken();

        const allUsers = await fbGet('users', idToken);
        if (!allUsers || typeof allUsers !== 'object') return {};

        const assignedUsers = {};
        Object.entries(allUsers).forEach(([uid, userData]) => {
            if (userData && userData.assigned_admin === adminId) {
                assignedUsers[uid] = userData;
            }
        });

        return assignedUsers;
    },

    async getUserMoods(userId, year, month) {
        const idToken = getAuthToken();
        return await fbGet(`moods/${userId}/${year}/${month}`, idToken);
    },

    async getUserAllMoods(userId) {
        const idToken = getAuthToken();
        return await fbGet(`moods/${userId}`, idToken);
    },

    async sendRecommendation(userId, message) {
        const idToken = getAuthToken();
        const messageData = {
            timestamp: new Date().toISOString(),
            message: message.trim(),
            status: 'new'
        };
        return await fbPost(`messages/${userId}`, messageData, idToken);
    },

    async deleteUser(userId) {
        const idToken = getAuthToken();
        await fbDelete(`users/${userId}`, idToken);
        await fbDelete(`moods/${userId}`, idToken);
        await fbDelete(`messages/${userId}`, idToken);
        return { success: true };
    }
};

// Admin Selection API
const adminSelection = {
    async getAvailableAdmins() {
        const userId = getUserId();
        const idToken = getAuthToken();
        const allUsers = await fbGet('users', idToken);

        if (!allUsers || typeof allUsers !== 'object') return {};

        const admins = {};
        Object.entries(allUsers).forEach(([uid, userData]) => {
            if (userData && userData.role === 'admin' && uid !== userId) {
                admins[uid] = userData;
            }
        });

        return admins;
    },

    async assignAdmin(adminId) {
        const userId = getUserId();
        const idToken = getAuthToken();
        return await fbPut(`users/${userId}/assigned_admin`, adminId, idToken);
    }
};





