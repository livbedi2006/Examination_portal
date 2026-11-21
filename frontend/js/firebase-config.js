// ==========================================
// Firebase Configuration for Google Sign-In
// ==========================================

// Default configuration placeholder
// You can either:
// 1. Replace the placeholder values below with your Firebase project credentials
// 2. Set them in .env (FIREBASE_API_KEY, FIREBASE_PROJECT_ID, etc.)
// 3. Or enter them in the app using the "Configure Firebase" button in the UI
const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
};

/**
 * Get active Firebase configuration
 * Priority: 1. localStorage, 2. window.FIREBASE_CONFIG (from backend /config/frontend), 3. DEFAULT_FIREBASE_CONFIG
 */
function getFirebaseConfig() {
    try {
        const stored = localStorage.getItem('firebase_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.apiKey && !parsed.apiKey.includes('YOUR_FIREBASE')) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Could not read firebase_config from localStorage:', e);
    }

    if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && !window.FIREBASE_CONFIG.apiKey.includes('YOUR_FIREBASE')) {
        return window.FIREBASE_CONFIG;
    }

    return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Check if Firebase has valid non-placeholder credentials
 */
function isFirebaseConfigured() {
    const config = getFirebaseConfig();
    return Boolean(
        config &&
        config.apiKey &&
        !config.apiKey.includes('YOUR_FIREBASE') &&
        config.projectId &&
        !config.projectId.includes('YOUR_FIREBASE')
    );
}

/**
 * Save Firebase configuration to localStorage
 */
function saveFirebaseConfig(config) {
    if (!config || !config.apiKey) return false;
    localStorage.setItem('firebase_config', JSON.stringify(config));
    window.FIREBASE_CONFIG = config;
    
    // Reset firebase app if already initialized
    try {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
            firebase.apps.forEach(app => app.delete());
        }
    } catch (e) {
        console.warn('Error resetting Firebase apps:', e);
    }
    
    return true;
}

/**
 * Initialize Firebase Application & Authentication
 */
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return null;
    }

    const config = getFirebaseConfig();

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
            console.log('Firebase initialized successfully with project:', config.projectId);
        }
        return firebase.auth();
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return null;
    }
}
