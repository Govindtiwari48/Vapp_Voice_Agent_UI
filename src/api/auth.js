/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

// Get API base URL from environment variables
// Falls back to default if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

/**
 * Sign up a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.phone - User phone number
 * @returns {Promise<Object>} Response with user data
 */
export const signup = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        return data;
    } catch (error) {
        // Handle network errors or JSON parsing errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
        }
        throw error;
    }
};

/**
 * Login an existing user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response with token and user data
 */
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        // Handle network errors or JSON parsing errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
        }
        throw error;
    }
};

/**
 * Get stored authentication token
 * @returns {string|null} Authentication token or null
 */
export const getToken = () => {
    return localStorage.getItem('authToken');
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null
 */
export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Store authentication token
 * @param {string} token - Authentication token
 */
export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

/**
 * Store user data
 * @param {Object} user - User data object
 */
export const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivity');
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
};

/**
 * Get last activity timestamp
 * @returns {number|null} Last activity timestamp or null
 */
export const getLastActivity = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? parseInt(lastActivity, 10) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

