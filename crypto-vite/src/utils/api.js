// API Configuration and utilities
const API_BASE_URL = 'http://127.0.0.1:8000/api';
// API client with authentication
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Always check localStorage for the most current token
    const currentToken = localStorage.getItem('auth_token');
    if (currentToken && currentToken !== this.token) {
      this.token = currentToken;
    }
    return !!this.token;
  }

  // Get current token
  getToken() {
    // Always check localStorage for the most current token
    const currentToken = localStorage.getItem('auth_token');
    if (currentToken && currentToken !== this.token) {
      this.token = currentToken;
    }
    return this.token;
  }

  // Get authentication headers
  getHeaders() {
    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('auth_token');
    if (currentToken && currentToken !== this.token) {
      this.token = currentToken;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Don't send auth token for login/register/password reset endpoints
    const isAuthEndpoint = endpoint === '/auth/login' || 
                          endpoint === '/auth/register' ||
                          endpoint === '/auth/password/reset/request' ||
                          endpoint === '/auth/password/reset/verify' ||
                          endpoint === '/auth/password/reset/confirm';
    
    // Get base headers
    const baseHeaders = isAuthEndpoint ? {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    } : this.getHeaders();
    
    // Merge headers, but don't override Content-Type if it's explicitly set to undefined (for FormData)
    const headers = { ...baseHeaders, ...options.headers };
    
    // If body is FormData, remove Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
    
    const config = {
      headers,
      credentials: 'omit', // Don't send cookies to avoid CSRF issues
      ...options,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        
        // If we can't parse JSON, try to get text response for debugging
        try {
          const textResponse = await response.text();
          console.error('Raw response:', textResponse.substring(0, 500));
          throw new Error(`Invalid JSON response: ${response.status} ${response.statusText}`);
        } catch (textError) {
          throw new Error(`Invalid response: ${response.status} ${response.statusText}`);
        }
      }

      if (!response.ok) {
        console.error('API Error Response:', data);
        
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          console.log('401 Unauthorized - clearing token');
          this.setToken(null);
          
          // For API requests, throw a specific error
          throw new Error(data.message || 'Authentication required');
        }
        
        // Handle 404 Not Found specifically
        if (response.status === 404) {
          console.error('404 Not Found - Route does not exist or authentication failed');
          console.error('Request URL:', url);
          console.error('Request headers:', config.headers);
          
          // If this is a deposit submission, provide specific guidance
          if (endpoint === '/deposits/submit-with-proof') {
            console.error('🚨 Deposit submission failed with 404. Possible causes:');
            console.error('1. User not authenticated (check localStorage for auth_token)');
            console.error('2. Laravel server not running on port 8000');
            console.error('3. Route not properly registered');
            console.error('4. CORS or middleware issue');
          }
        }
        
        // Handle other HTTP errors
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Ensure we always have a proper error object with a message
      let errorToThrow;
      
      if (error && error.message) {
        errorToThrow = error;
      } else if (error && typeof error === 'string') {
        errorToThrow = new Error(error);
      } else if (error && error.toString) {
        errorToThrow = new Error(error.toString());
      } else {
        errorToThrow = new Error('Unknown API error occurred');
      }
      
      // Add more context for network errors
      if (error && error.name === 'TypeError' && error.message && error.message.includes('fetch')) {
        errorToThrow = new Error('Network error - please check your connection and ensure the server is running');
      }
      
      // Add debugging info
      console.error('Error details:', {
        originalError: error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorType: typeof error,
        finalErrorMessage: errorToThrow.message
      });
      
      throw errorToThrow;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    const requestOptions = {
      method: 'POST',
      ...options
    };

    // Handle FormData differently from regular JSON data
    if (data instanceof FormData) {
      requestOptions.body = data;
      // For FormData, don't set Content-Type - let the browser handle it
      // This preserves other headers like Authorization
    } else if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    // Debug logging for order approval
    if (endpoint.includes('/approve')) {
      console.log('🔍 Order approval debug:');
      console.log('- Endpoint:', endpoint);
      console.log('- Data:', data);
      console.log('- JSON body:', JSON.stringify(data));
      console.log('- Token exists:', !!this.token);
      console.log('- Request options:', requestOptions);
    }

    // Debug logging for deposit submission
    if (endpoint === '/deposits/submit-with-proof') {
      console.log('🔍 Deposit submission debug:');
      console.log('- Token exists:', !!this.token);
      console.log('- Token preview:', this.token ? this.token.substring(0, 20) + '...' : 'No token');
      console.log('- FormData keys:', data instanceof FormData ? Array.from(data.keys()) : 'Not FormData');
      console.log('- Request options:', requestOptions);
    }

    return this.request(endpoint, requestOptions);
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint, data = null) {
    const options = { method: 'DELETE' };
    if (data) {
      // For DELETE requests, some servers prefer query parameters over body
      // Try body first, but also support query parameter fallback
      options.body = JSON.stringify(data);
      
      // Also add as query parameters as fallback
      const queryParams = new URLSearchParams(data).toString();
      if (queryParams) {
        endpoint += (endpoint.includes('?') ? '&' : '?') + queryParams;
      }
    }
    return this.request(endpoint, options);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Authentication API calls
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getUser: () => apiClient.get('/auth/user'),
  
  // Password Reset
  requestPasswordReset: (email) => apiClient.post('/auth/password/reset/request', { email }),
  verifyResetToken: (email, token) => apiClient.post('/auth/password/reset/verify', { email, token }),
  confirmPasswordReset: (data) => apiClient.post('/auth/password/reset/confirm', data),
  
  // Email Verification
  sendEmailVerification: () => apiClient.post('/auth/send-verification'),
  verifyEmail: (token) => apiClient.get(`/auth/verify-email?token=${token}`),
  getEmailVerificationStatus: () => apiClient.get('/auth/verification-status'),
  
  // Two-Factor Authentication
  generateTwoFactorSecret: () => apiClient.post('/auth/2fa/generate'),
  confirmTwoFactor: (code) => apiClient.post('/auth/2fa/confirm', { code }),
  verifyTwoFactor: (email, code) => apiClient.post('/auth/2fa/verify', { email, code }),
  disableTwoFactor: (password) => apiClient.post('/auth/2fa/disable', { password }),
  regenerateRecoveryCodes: () => apiClient.post('/auth/2fa/recovery-codes'),
  getTwoFactorStatus: () => apiClient.get('/auth/2fa/status'),
  
  // OTP Verification
  generateOtp: (identifier, type, purpose) => apiClient.post('/auth/otp/generate', { identifier, type, purpose }),
  verifyOtp: (identifier, otpCode, type, purpose) => apiClient.post('/auth/otp/verify', { identifier, otp_code: otpCode, type, purpose }),
  getOtpStatus: (identifier, type, purpose) => apiClient.get(`/auth/otp/status?identifier=${identifier}&type=${type}&purpose=${purpose}`),
};

// Market Data API calls
export const marketAPI = {
  getCryptocurrencies: () => apiClient.get('/cryptocurrencies'),
  getMarketStatistics: () => apiClient.get('/cryptocurrencies/statistics'),
  getPriceHistory: (symbol, params) => apiClient.get(`/cryptocurrencies/${symbol}/price-history?${new URLSearchParams(params)}`),
  getCandlestickData: (symbol, params) => apiClient.get(`/cryptocurrencies/${symbol}/candlestick?${new URLSearchParams(params)}`),
  
  // WebSocket endpoints for real-time data
  getRealtimeMarketData: () => apiClient.get('/ws/market-data'),
  getPriceUpdates: (symbols) => apiClient.post('/ws/price-updates', { symbols }),
};

// Wallet API calls
export const walletAPI = {
  getWallets: () => apiClient.get('/wallets'),
  getWallet: (cryptocurrency) => apiClient.get(`/wallets/${cryptocurrency}`),
  getTransactions: (cryptocurrency, params) => apiClient.get(`/wallets/${cryptocurrency}/transactions?${new URLSearchParams(params)}`),
};

// Deposit API calls
export const depositAPI = {
  getDeposits: (params = {}) => {
    return apiClient.get(`/deposits?${new URLSearchParams(params)}`);
  },
  getDeposit: (id) => apiClient.get(`/deposits/${id}`),
  generateAddress: (currency) => apiClient.post('/deposits/generate-address', { currency }),
  createFiatDeposit: (data) => apiClient.post('/deposits/fiat', data),
  simulateCryptoDeposit: (data) => apiClient.post('/deposits/simulate-crypto', data),
};

// Withdrawal API calls
export const withdrawalAPI = {
  getWithdrawals: (params = {}) => apiClient.get(`/withdrawals?${new URLSearchParams(params)}`),
  getWithdrawal: (id) => apiClient.get(`/withdrawals/${id}`),
  createWithdrawal: (data) => apiClient.post('/withdrawals', data),
  verifyWithdrawal: (id, code) => apiClient.post(`/withdrawals/${id}/verify`, { verification_code: code }),
  verify2FA: (id, code) => apiClient.post(`/withdrawals/${id}/verify-2fa`, { two_factor_code: code }),
  cancelWithdrawal: (id) => apiClient.post(`/withdrawals/${id}/cancel`),
};

// Trading API calls
export const tradingAPI = {
  getOrders: (params) => apiClient.get(`/orders?${new URLSearchParams(params)}`),
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  cancelOrder: (orderId) => apiClient.delete(`/orders/${orderId}`),
  getOrderBook: (cryptocurrency) => apiClient.get(`/orderbook/${cryptocurrency}`),
};
// Admin API calls
export const adminAPI = {
  // Dashboard & Analytics
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getRealTimeMetrics: () => apiClient.get('/admin/real-time-metrics'),
  getSystemMetrics: () => apiClient.get('/admin/system-metrics'),
  
  // User Management
  getUsers: (params = {}) => apiClient.get(`/admin/users?${new URLSearchParams(params)}`),
  getUserDetails: (userId) => apiClient.get(`/admin/users/${userId}`),
  adjustUserBalance: (userId, data) => apiClient.post(`/admin/users/${userId}/adjust-balance`, data),
  toggleUserStatus: (userId) => apiClient.post(`/admin/users/${userId}/toggle-status`),
  
  // KYC Management
  getKycSubmissions: (params = {}) => apiClient.get(`/admin/kyc/submissions?${new URLSearchParams(params)}`),
  getKycStatistics: () => apiClient.get('/admin/kyc/statistics'),
  approveKyc: (documentId, data = {}) => apiClient.post(`/admin/kyc/${documentId}/approve`, data),
  rejectKyc: (documentId, data) => apiClient.post(`/admin/kyc/${documentId}/reject`, data),
  
  // Support System
  getSupportTickets: (params = {}) => apiClient.get(`/admin/support/tickets?${new URLSearchParams(params)}`),
  assignTicket: (ticketId, data) => apiClient.post(`/admin/support/tickets/${ticketId}/assign`, data),
  resolveTicket: (ticketId, data) => apiClient.post(`/admin/support/tickets/${ticketId}/resolve`, data),
  
  // Recent Transactions (Combined deposits and withdrawals)
  getRecentTransactions: (params = {}) => apiClient.get(`/admin/recent-transactions?${new URLSearchParams(params)}`),
  // Financial Management
  getDeposits: (params = {}) => apiClient.get(`/admin/transactions/deposits?${new URLSearchParams(params)}`),
  getWithdrawals: (params = {}) => apiClient.get(`/admin/transactions/withdrawals?${new URLSearchParams(params)}`),
  approveWithdrawal: (transactionId) => apiClient.post(`/admin/transactions/withdrawals/${transactionId}/approve`),
  rejectWithdrawal: (transactionId, data) => apiClient.post(`/admin/transactions/withdrawals/${transactionId}/reject`, data),

  // Deposit Approval System
  getDepositsForApproval: (params = {}) => apiClient.get(`/admin/deposits?${new URLSearchParams(params)}`),
  getDepositStatistics: () => apiClient.get('/admin/deposits/statistics'),
  getDepositDetails: (depositId) => apiClient.get(`/admin/deposits/${depositId}`),
  approveDeposit: (depositId, data = {}) => apiClient.post(`/admin/deposits/${depositId}/approve`, data),
  rejectDeposit: (depositId, data) => apiClient.post(`/admin/deposits/${depositId}/reject`, data),
  
  // Investment & Referral Management
  getInvestments: (params = {}) => apiClient.get(`/admin/investments?${new URLSearchParams(params)}`),
  cancelInvestment: (investmentId, data) => apiClient.post(`/admin/investments/${investmentId}/cancel`, data),
  getReferralPrograms: (params = {}) => apiClient.get(`/admin/referrals/programs?${new URLSearchParams(params)}`),
  updateCommissionRate: (programId, data) => apiClient.post(`/admin/referrals/programs/${programId}/commission-rate`, data),
  
  // Wallet Management
  getWallets: (params = {}) => apiClient.get(`/admin/wallets?${new URLSearchParams(params)}`),
  
  // Admin Wallet Management
  getAdminWallets: () => apiClient.get('/admin/wallets'),
  createAdminWallet: (data) => apiClient.post('/admin/wallets', data),
  updateAdminWallet: (id, data) => apiClient.put(`/admin/wallets/${id}`, data),
  deleteAdminWallet: (id) => apiClient.delete(`/admin/wallets/${id}`),
  toggleWalletStatus: (id) => apiClient.put(`/admin/wallets/${id}/toggle-status`),
  getWalletStats: () => apiClient.get('/admin/wallets/stats'),
  validateWalletAddress: (data) => apiClient.post('/admin/wallets/validate-address', data),
  
  // Trading Management
  getPendingOrders: (params = {}) => apiClient.get(`/admin/trading/pending-orders?${new URLSearchParams(params)}`),
  getAllOrders: (params = {}) => apiClient.get(`/admin/trading/all-orders?${new URLSearchParams(params)}`),
  getTradingStatistics: () => apiClient.get('/admin/trading/statistics'),
  approveOrder: (orderId, data) => apiClient.post(`/admin/trading/orders/${orderId}/approve`, data),
  
  // Security & Monitoring
  getSuspiciousActivities: () => apiClient.get('/admin/suspicious-activities'),
  overridePrice: (symbol, data) => apiClient.post(`/admin/cryptocurrencies/${symbol}/override-price`, data),
  setMaintenanceMode: (data) => apiClient.post('/admin/maintenance-mode', data),
};

// Export the client instance for direct use
export { apiClient };
export default apiClient;