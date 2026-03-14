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

  // Get authentication headers
  getHeaders() {
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
    
    // Don't send auth token for login/register endpoints
    const isAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register';
    const headers = isAuthEndpoint ? {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    } : this.getHeaders();
    
    const config = {
      headers,
      credentials: 'omit', // Don't send cookies to avoid CSRF issues
      ...options,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    console.log('Headers:', config.headers);

    try {
      const response = await fetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error(`Invalid JSON response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('API Error Response:', data);
        
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          console.log('401 Unauthorized - clearing token');
          this.setToken(null);
          throw new Error('Unauthorized - token expired or invalid');
        }
        
        // Handle other HTTP errors
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Re-throw with more context
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
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
  requestPasswordReset: (email) => apiClient.post('/auth/password/reset', { email }),
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
  getPriceHistory: (symbol, params) => apiClient.get(`/cryptocurrencies/${symbol}/price-history?${new URLSearchParams(params)}`),
  getCandlestickData: (symbol, params) => apiClient.get(`/cryptocurrencies/${symbol}/candlestick?${new URLSearchParams(params)}`),
};

// Wallet API calls
export const walletAPI = {
  getWallets: () => apiClient.get('/wallets'),
  getWallet: (cryptocurrency) => apiClient.get(`/wallets/${cryptocurrency}`),
  getTransactions: (cryptocurrency, params) => apiClient.get(`/wallets/${cryptocurrency}/transactions?${new URLSearchParams(params)}`),
};

// Deposit API calls
export const depositAPI = {
  getDeposits: (params = {}) => apiClient.get(`/deposits?${new URLSearchParams(params)}`),
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
  
  // Financial Management
  getDeposits: (params = {}) => apiClient.get(`/admin/transactions/deposits?${new URLSearchParams(params)}`),
  getWithdrawals: (params = {}) => apiClient.get(`/admin/transactions/withdrawals?${new URLSearchParams(params)}`),
  approveWithdrawal: (transactionId) => apiClient.post(`/admin/transactions/withdrawals/${transactionId}/approve`),
  rejectWithdrawal: (transactionId, data) => apiClient.post(`/admin/transactions/withdrawals/${transactionId}/reject`, data),
  
  // Investment & Referral Management
  getInvestments: (params = {}) => apiClient.get(`/admin/investments?${new URLSearchParams(params)}`),
  cancelInvestment: (investmentId, data) => apiClient.post(`/admin/investments/${investmentId}/cancel`, data),
  getReferralPrograms: (params = {}) => apiClient.get(`/admin/referrals/programs?${new URLSearchParams(params)}`),
  updateCommissionRate: (programId, data) => apiClient.post(`/admin/referrals/programs/${programId}/commission-rate`, data),
  
  // Wallet Management
  getWallets: (params = {}) => apiClient.get(`/admin/wallets?${new URLSearchParams(params)}`),
  
  // Security & Monitoring
  getSuspiciousActivities: () => apiClient.get('/admin/suspicious-activities'),
  overridePrice: (symbol, data) => apiClient.post(`/admin/cryptocurrencies/${symbol}/override-price`, data),
  setMaintenanceMode: (data) => apiClient.post('/admin/maintenance-mode', data),
};

// Export the client instance for direct use
export { apiClient };
export default apiClient;