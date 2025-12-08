/**
 * API Service
 * Centralized API service for all backend endpoints
 */

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

/**
 * Create headers with authentication
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object
 */
const createHeaders = (additionalHeaders = {}) => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...additionalHeaders
    };
};

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed response data
 */
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @throws {Error} Formatted error
 */
const handleError = (error) => {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
    }
    throw error;
};

// ============================================================================
// HEALTH CHECK & SYSTEM ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Get public URL
 * @returns {Promise<Object>} Public URL information
 */
export const getPublicUrl = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/public-url`);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * List available tools
 * @returns {Promise<Object>} Available tools list
 */
export const listTools = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/tools`);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Get TwiML template
 * @returns {Promise<Object>} TwiML template
 */
export const getTwimlTemplate = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/twiml`);
        return await response.text();
    } catch (error) {
        return handleError(error);
    }
};

// ============================================================================
// CALL MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all calls with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Records per page (max: 100, default: 20)
 * @param {string} params.startDate - Filter calls from this date (ISO 8601 format)
 * @param {string} params.endDate - Filter calls up to this date (ISO 8601 format)
 * @param {string} params.status - Filter by call status (ANSWERED, BUSY, NO ANSWER, etc.)
 * @returns {Promise<Object>} Paginated calls data
 */
export const getCalls = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.status) queryParams.append('status', params.status);

        const url = `${API_BASE_URL}/api/calls${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: createHeaders()
        });

        const result = await handleResponse(response);
        
        // Handle the new API response format
        if (result.success && result.data) {
            return {
                calls: result.data.calls || [],
                currentPage: result.data.pagination?.page || 1,
                totalPages: result.data.pagination?.totalPages || 1,
                totalRecords: result.data.pagination?.totalRecords || 0,
                limit: result.data.pagination?.limit || 20
            };
        }
        
        return {
            calls: [],
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            limit: 20
        };
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Get calls with date filter
 * @param {string} startDate - Start date (ISO 8601 format)
 * @param {string} endDate - End date (ISO 8601 format)
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 * @returns {Promise<Object>} Filtered calls data
 */
export const getCallsByDateRange = async (startDate, endDate, page = 1, limit = 20) => {
    return getCalls({ startDate, endDate, page, limit });
};

/**
 * Get calls with status filter
 * @param {string} status - Call status to filter by
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 * @returns {Promise<Object>} Filtered calls data
 */
export const getCallsByStatus = async (status, page = 1, limit = 20) => {
    return getCalls({ status, page, limit });
};

// ============================================================================
// DASHBOARD ANALYTICS ENDPOINTS
// ============================================================================

/**
 * Get dashboard overview
 * @param {Object} params - Query parameters
 * @param {string} params.range - Time range (weekly, monthly, total, custom)
 * @param {string} params.startDate - Start date for custom range (YYYY-MM-DD)
 * @param {string} params.endDate - End date for custom range (YYYY-MM-DD)
 * @returns {Promise<Object>} Dashboard overview metrics
 */
export const getDashboardOverview = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.range) queryParams.append('range', params.range);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        const url = `${API_BASE_URL}/api/dashboard/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: createHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Get detailed dashboard metrics
 * @param {Object} params - Query parameters
 * @param {string} params.range - Time range (weekly, monthly, total, custom)
 * @param {string} params.startDate - Start date for custom range (YYYY-MM-DD)
 * @param {string} params.endDate - End date for custom range (YYYY-MM-DD)
 * @returns {Promise<Object>} Detailed dashboard metrics
 */
export const getDashboardMetrics = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.range) queryParams.append('range', params.range);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        const url = `${API_BASE_URL}/api/dashboard/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: createHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Export dashboard data
 * @param {Object} exportParams - Export parameters
 * @param {string} exportParams.range - Time range (weekly, monthly, total, custom)
 * @param {string} exportParams.startDate - Start date for custom range (YYYY-MM-DD)
 * @param {string} exportParams.endDate - End date for custom range (YYYY-MM-DD)
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportDashboardData = async (exportParams) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/export`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify(exportParams)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Export failed');
        }

        // Return blob for file download
        return await response.blob();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Download exported dashboard data
 * @param {Object} exportParams - Export parameters
 * @param {string} filename - Filename for download (default: dashboard-export.xlsx)
 */
export const downloadDashboardExport = async (exportParams, filename = 'dashboard-export.xlsx') => {
    try {
        const blob = await exportDashboardData(exportParams);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Export downloaded successfully' };
    } catch (error) {
        return handleError(error);
    }
};

// ============================================================================
// WEBHOOK ENDPOINTS (for reference, typically called by external services)
// ============================================================================

/**
 * Send webhook data (for testing purposes)
 * @param {Object} webhookData - Webhook data to send
 * @returns {Promise<Object>} Webhook response
 */
export const sendWebhook = async (webhookData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });

        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date for API (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * Format datetime for API (ISO 8601)
 * @param {Date} date - Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeForAPI = (date) => {
    return date.toISOString();
};

/**
 * Get date range for predefined periods
 * @param {string} period - Period type (today, yesterday, last7, last15, last30, weekly, monthly)
 * @returns {Object} Object with startDate and endDate
 */
export const getDateRange = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case 'today':
            return {
                startDate: formatDateTimeForAPI(today),
                endDate: formatDateTimeForAPI(now)
            };

        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return {
                startDate: formatDateTimeForAPI(yesterday),
                endDate: formatDateTimeForAPI(today)
            };

        case 'last7':
        case 'weekly':
            const last7 = new Date(today);
            last7.setDate(last7.getDate() - 7);
            return {
                startDate: formatDateTimeForAPI(last7),
                endDate: formatDateTimeForAPI(now)
            };

        case 'last15':
            const last15 = new Date(today);
            last15.setDate(last15.getDate() - 15);
            return {
                startDate: formatDateTimeForAPI(last15),
                endDate: formatDateTimeForAPI(now)
            };

        case 'last30':
        case 'monthly':
            const last30 = new Date(today);
            last30.setDate(last30.getDate() - 30);
            return {
                startDate: formatDateTimeForAPI(last30),
                endDate: formatDateTimeForAPI(now)
            };

        default:
            return {
                startDate: null,
                endDate: null
            };
    }
};

// Export API base URL for direct use if needed
export { API_BASE_URL };

