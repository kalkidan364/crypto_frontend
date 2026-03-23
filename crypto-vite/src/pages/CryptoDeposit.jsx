import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { depositAPI, apiClient } from '../utils/api';
import { autoDevLogin } from '../utils/devLogin';
import TransactionPool from '../components/deposit/TransactionPool';
import '../styles/pages/crypto-deposit.css';
import '../styles/components/transaction-pool.css';

const CryptoDeposit = () => {
  const { crypto } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [depositAddress, setDepositAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');
  const [poolRefreshTrigger, setPoolRefreshTrigger] = useState(0);
  const [metaMaskAddress, setMetaMaskAddress] = useState('');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [metaMaskError, setMetaMaskError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [userDisconnectedMetaMask, setUserDisconnectedMetaMask] = useState(false);

  const cryptoData = {
    'BTC': { 
      name: 'Bitcoin', 
      networks: ['Bitcoin'], 
      minDeposit: 0.001,
      icon: '₿',
      color: '#f7931a',
      confirmations: 6,
      estimatedTime: '10-60 min',
      networkFee: '~$1-5'
    },
    'ETH': { 
      name: 'Ethereum', 
      networks: ['Ethereum'], 
      minDeposit: 0.01,
      icon: 'Ξ',
      color: '#627eea',
      confirmations: 12,
      estimatedTime: '5-15 min',
      networkFee: '~$5-15'
    },
    'USDT': { 
      name: 'Tether', 
      networks: ['Ethereum'], 
      minDeposit: 10,
      icon: '₮',
      color: '#26a17b',
      confirmations: 12,
      estimatedTime: '5-30 min',
      networkFee: '~$5-15'
    },
    'BNB': { 
      name: 'BNB', 
      networks: ['BSC'], 
      minDeposit: 0.01,
      icon: 'BNB',
      color: '#f3ba2f',
      confirmations: 15,
      estimatedTime: '3-10 min',
      networkFee: '~$0.20'
    }
  };

  const currentCrypto = cryptoData[crypto?.toUpperCase()];
  
  // Check if user is authenticated on app load and auto-login for development
  useEffect(() => {
    const initAuth = async () => {
      if (!user && process.env.NODE_ENV === 'development') {
        try {
          const result = await autoDevLogin();
          if (result && result.success) {
            // The auth context should update automatically
          }
        } catch (error) {
          // Silent fail for auto-login
        }
      }
    };
    
    initAuth();
  }, [user]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      showWarning('Please log in to access deposit functionality');
    }
  }, [user, showWarning]);

  // Optimize useEffect to prevent excessive API calls
  useEffect(() => {
    if (!currentCrypto) {
      navigate('/deposit');
      return;
    }
    setSelectedNetwork(currentCrypto.networks[0]);
  }, [crypto, currentCrypto, navigate]);

  // Initialize disconnect flag from localStorage
  useEffect(() => {
    const userDisconnected = localStorage.getItem('metamask_user_disconnected') === 'true';
    setUserDisconnectedMetaMask(userDisconnected);
    console.log('🔍 Initialized disconnect flag from storage:', userDisconnected);
  }, []);

  // Separate useEffect for API calls with proper dependencies
  useEffect(() => {
    if (!currentCrypto || !user) return;
    
    let isMounted = true;
    
    const initializeData = async () => {
      if (!apiClient.isAuthenticated()) {
        return;
      }
      
      // Only fetch deposits if we don't have data yet
      if (deposits.length === 0 && isMounted) {
        await fetchDeposits().catch(() => {}); // Silent catch
      }
      
      // Only generate address if we don't have one yet
      if (!depositAddress && isMounted) {
        await generateDepositAddress().catch(() => {}); // Silent catch
      }
      
      // Only check MetaMask connection once per crypto change
      if (isMounted && !isMetaMaskConnected && !userDisconnectedMetaMask) {
        checkMetaMaskConnection();
      }
    };

    initializeData().catch(() => {}); // Silent catch for the entire initialization
    
    return () => {
      isMounted = false;
    };
  }, [crypto, user]);

  const fetchDeposits = async () => {
    // Check authentication first
    if (!user || !apiClient.isAuthenticated()) {
      return; // Silently return if not authenticated
    }
    
    try {
      const response = await depositAPI.getDeposits();
      
      if (response && response.success) {
        const deposits = response.data || [];
        const cryptoDeposits = deposits.filter(
          deposit => deposit.currency.toUpperCase() === crypto?.toUpperCase()
        );
        setDeposits(cryptoDeposits);
      }
    } catch (error) {
      // Silently fail - don't show errors for deposits fetch
      // This prevents the "undefined" error from showing
    }
  };

  const generateDepositAddress = async () => {
    try {
      setLoading(true);
      
      // If using MetaMask and connected AND not disconnected by user, use the MetaMask address
      if (useMetaMask && isMetaMaskConnected && metaMaskAddress && !userDisconnectedMetaMask) {
        console.log('🦊 Using MetaMask address for deposit');
        setDepositAddress(metaMaskAddress);
        
        const qrText = `${crypto?.toLowerCase()}:${metaMaskAddress}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}&bgcolor=FFFFFF&color=000000&margin=10`;
        setQrCodeUrl(qrUrl);
        
        // Store MetaMask address in backend
        await storeMetaMaskAddressInBackend(metaMaskAddress);
        return;
      }
      
      const mockAddresses = {
        'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        'ETH': '0x742d35Cc6634C0532925a3b8D4C2C4e07C8B8C8B',
        'USDT': '0x742d35Cc6634C0532925a3b8D4C2C4e07C8B8C8B',
        'BNB': '0x742d35Cc6634C0532925a3b8D4C2C4e07C8B8C8B'
      };
      
      const address = mockAddresses[crypto?.toUpperCase()] || 'rNvp3qh3D0CRr1sdkFPwdnKdaVt6dGkG';
      setDepositAddress(address);
      
      const qrText = `${crypto?.toLowerCase()}:${address}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}&bgcolor=FFFFFF&color=000000&margin=10`;
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      setError('Failed to generate deposit address');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (depositAddress) {
      try {
        await navigator.clipboard.writeText(depositAddress);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = depositAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      }
    }
  };
  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
    setTimeout(() => {
      generateDepositAddress();
    }, 100);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !selectedImage) {
      setError('Please fill in all required fields');
      showError('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) < currentCrypto?.minDeposit) {
      const errorMsg = `Minimum deposit amount is ${currentCrypto?.minDeposit} ${crypto?.toUpperCase()}`;
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    // Check authentication before proceeding
    if (!apiClient.isAuthenticated()) {
      const errorMsg = 'You must be logged in to submit a deposit';
      setError(errorMsg);
      showError(errorMsg);
      console.error('🚨 User not authenticated. Token:', apiClient.getToken());
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('currency', crypto?.toUpperCase());
      formData.append('amount', amount);
      formData.append('wallet_address', depositAddress);
      formData.append('transaction_image', selectedImage);
      formData.append('network', selectedNetwork);

      const response = await apiClient.post('/deposits/submit-with-proof', formData);

      // Handle response properly
      const responseData = response.data || response;
      
      if (responseData.success) {
        const successMsg = responseData.message || 'Deposit submitted successfully! We will verify your transaction and credit your account.';
        setSuccess(successMsg);
        showSuccess(successMsg, 7000);
        
        setAmount('');
        setSelectedImage(null);
        
        // Clear the file input
        const fileInput = document.getElementById('transaction-image');
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Refresh deposits list
        await fetchDeposits();
        
        // Trigger transaction pool refresh
        setPoolRefreshTrigger(prev => prev + 1);
        
        // Auto-switch to transaction pool tab to show the new deposit
        setTimeout(() => {
          setActiveTab('pool');
          showInfo('Check the Transaction Pool tab to see your deposit status');
        }, 2000);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        const errorMsg = responseData.message || 'Failed to submit deposit';
        setError(errorMsg);
        showError(errorMsg);
      }
    } catch (error) {
      console.error('Deposit submission error:', error);
      let errorMessage = 'Failed to submit deposit';
      
      if (error.message.includes('Authentication required') || error.message.includes('Unauthorized')) {
        errorMessage = 'Please log in to submit a deposit';
        showError('Please log in to submit a deposit');
        // Optionally redirect to login
        // navigate('/login');
      } else {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to submit deposit';
        showError(errorMessage);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // MetaMask Integration Functions
  const checkMetaMaskConnection = async () => {
    // Don't auto-connect if user has explicitly disconnected
    if (userDisconnectedMetaMask) {
      console.log('🚫 Skipping MetaMask check - user disconnected');
      return;
    }
    
    // Don't auto-connect if already connected
    if (isMetaMaskConnected) {
      console.log('� MetaMask already connected, skipping check');
      return;
    }
    
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setMetaMaskAddress(accounts[0]);
          setIsMetaMaskConnected(true);
          setUseMetaMask(true);
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      const errorMsg = 'MetaMask is not installed. Please install MetaMask extension.';
      setMetaMaskError(errorMsg);
      showError(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setMetaMaskError('');
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        setMetaMaskAddress(address);
        setIsMetaMaskConnected(true);
        setUseMetaMask(true);
        setUserDisconnectedMetaMask(false); // Reset disconnect flag
        
        // Clear disconnect flag from storage
        localStorage.removeItem('metamask_user_disconnected');
        
        // Store the address in backend
        await storeMetaMaskAddressInBackend(address);
        
        // Regenerate deposit address with MetaMask address
        await generateDepositAddress();
        
        const successMsg = `MetaMask connected successfully! Address: ${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
        setSuccess(successMsg);
        showSuccess(successMsg);
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      const errorMsg = 'Failed to connect to MetaMask. Please try again.';
      setMetaMaskError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const storeMetaMaskAddressInBackend = async (address) => {
    try {
      const response = await apiClient.post('/deposits/store-metamask-address', {
        currency: crypto?.toUpperCase(),
        network: selectedNetwork,
        address: address
      });

      // Handle both possible response structures
      const success = response?.success || response?.data?.success;
      const data = response?.data?.data || response?.data;
      
      if (success) {
        console.log('MetaMask address stored successfully:', data);
      }
    } catch (error) {
      console.error('Failed to store MetaMask address:', error);
      // Don't show error to user as this is background operation
    }
  };

  const disconnectMetaMask = async () => {
    console.log('🔌 Disconnect MetaMask clicked');
    console.log('Current state:', { 
      isMetaMaskConnected, 
      useMetaMask, 
      metaMaskAddress,
      crypto 
    });
    
    try {
      setLoading(true);
      setMetaMaskError('');
      
      // Call backend to remove MetaMask address
      if (crypto) {
        try {
          console.log('📡 Calling backend to remove MetaMask address...');
          const response = await apiClient.delete('/deposits/remove-metamask-address', {
            currency: crypto.toUpperCase(),
            network: 'Ethereum'
          });

          console.log('📋 Backend response:', response);
          
          // Handle both possible response structures
          const success = response?.success || response?.data?.success;
          
          if (success) {
            console.log('✅ MetaMask address removed from backend');
          } else {
            console.log('⚠️ Backend response indicates failure or unexpected format');
          }
        } catch (backendError) {
          console.error('❌ Failed to remove MetaMask address from backend:', backendError);
          // Continue with frontend disconnect even if backend fails
        }
      }

      // Clear any localStorage/sessionStorage related to MetaMask
      try {
        localStorage.removeItem('metamask_address');
        localStorage.removeItem('metamask_connected');
        localStorage.setItem('metamask_user_disconnected', 'true'); // Remember user disconnected
        sessionStorage.removeItem('metamask_address');
        sessionStorage.removeItem('metamask_connected');
        console.log('🧹 Cleared MetaMask storage and set disconnect flag');
      } catch (storageError) {
        console.log('No storage to clear');
      }

      // Update frontend state - do this synchronously to ensure immediate UI update
      console.log('🔄 Updating frontend state...');
      setMetaMaskAddress('');
      setIsMetaMaskConnected(false);
      setUseMetaMask(false);
      setMetaMaskError('');
      setUserDisconnectedMetaMask(true); // Prevent auto-reconnection
      
      // Force a re-render by updating a timestamp
      setLastUpdate(Date.now());
      
      console.log('New state will be:', { 
        isMetaMaskConnected: false, 
        useMetaMask: false, 
        metaMaskAddress: '' 
      });
      
      // Generate new regular address
      console.log('🏗️ Generating new deposit address...');
      await generateDepositAddress();
      
      const successMsg = 'MetaMask disconnected successfully! Now using system-generated address.';
      setSuccess(successMsg);
      showSuccess(successMsg);
      console.log('✅ MetaMask disconnect completed');
      
    } catch (error) {
      console.error('❌ Error during MetaMask disconnect:', error);
      const errorMsg = 'Failed to disconnect MetaMask. Please try again.';
      setMetaMaskError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMetaMaskUsage = () => {
    if (!isMetaMaskConnected) {
      connectMetaMask();
    } else {
      setUseMetaMask(!useMetaMask);
      setTimeout(() => {
        generateDepositAddress();
      }, 100);
    }
  };

  if (!currentCrypto) {
    return null;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="nexus-deposit-page">
        <div className="nexus-header">
          <div className="nexus-header-content">
            <button className="nexus-back-btn" onClick={() => navigate('/deposit')}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back
            </button>
            
            <div className="nexus-crypto-info">
              <div className="nexus-crypto-icon" style={{ backgroundColor: currentCrypto.color }}>
                {currentCrypto.icon}
              </div>
              <div className="nexus-crypto-details">
                <h1>Deposit {currentCrypto.name}</h1>
                <p>Authentication required</p>
              </div>
            </div>
          </div>
        </div>

        <div className="nexus-main-content">
          <div className="nexus-content-grid">
            <div className="nexus-deposit-panel">
              <div className="nexus-auth-required">
                <div className="nexus-auth-icon">
                  <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V14H16V21H8V14H9.2V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.4 8.7 10.4 10V14H13.6V10C13.6 8.7 12.8 8.2 12 8.2Z"/>
                  </svg>
                </div>
                <h3>Authentication Required</h3>
                <p>Please log in to your account to deposit {currentCrypto.name}</p>
                <div className="nexus-auth-actions">
                  <button 
                    className="nexus-auth-btn primary"
                    onClick={() => navigate('/login')}
                  >
                    Log In
                  </button>
                  <button 
                    className="nexus-auth-btn secondary"
                    onClick={() => navigate('/register')}
                  >
                    Create Account
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      className="nexus-auth-btn secondary"
                      onClick={async () => {
                        try {
                          const result = await autoDevLogin();
                          if (result && result.success) {
                            showSuccess('Development login successful');
                            window.location.reload(); // Refresh to update auth state
                          } else {
                            showError('Development login failed');
                          }
                        } catch (error) {
                          showError('Development login error: ' + error.message);
                        }
                      }}
                    >
                      Dev Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="nexus-deposit-page">
      {/* Professional Header */}
      <div className="nexus-header">
        <div className="nexus-header-content">
          <button className="nexus-back-btn" onClick={() => navigate('/deposit')}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </button>
          
          <div className="nexus-crypto-info">
            <div className="nexus-crypto-icon" style={{ backgroundColor: currentCrypto.color }}>
              {currentCrypto.icon}
            </div>
            <div className="nexus-crypto-details">
              <h1>Deposit {currentCrypto.name}</h1>
              <p>Send {crypto?.toUpperCase()} to your NEXUS wallet</p>
            </div>
          </div>
          
          <div className="nexus-crypto-stats">
            <div className="nexus-stat">
              <span className="nexus-stat-label">Min Deposit</span>
              <span className="nexus-stat-value">{currentCrypto.minDeposit} {crypto?.toUpperCase()}</span>
            </div>
            <div className="nexus-stat">
              <span className="nexus-stat-label">Network Fee</span>
              <span className="nexus-stat-value">{currentCrypto.networkFee}</span>
            </div>
            <div className="nexus-stat">
              <span className="nexus-stat-label">Confirmations</span>
              <span className="nexus-stat-value">{currentCrypto.confirmations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="nexus-main-content">
        <div className="nexus-content-grid">
          {/* Left Panel - Deposit Form */}
          <div className="nexus-deposit-panel">
            {/* Tab Navigation */}
            <div className="nexus-tab-nav">
              <button 
                className={`nexus-tab ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Deposit Crypto
              </button>
              <button 
                className={`nexus-tab ${activeTab === 'pool' ? 'active' : ''}`}
                onClick={() => setActiveTab('pool')}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,3H21V5H3V3M4,6H20V10H4V6M4,11H20V15H4V11M4,16H20V20H4V16Z"/>
                </svg>
                Transaction Pool
              </button>
            </div>

            {activeTab === 'deposit' && (
              <div className="nexus-deposit-content">
                {/* Alerts */}
                {error && (
                  <div className="nexus-alert nexus-alert-error">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="nexus-alert nexus-alert-success">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    {success}
                  </div>
                )}

                {/* Network Selection */}
                {/* Network Selection - Only show if multiple networks available */}
                {currentCrypto.networks.length > 1 ? (
                  <div className="nexus-section">
                    <div className="nexus-section-header">
                      <h3>Select Network</h3>
                      <p>Choose the blockchain network for your deposit</p>
                    </div>
                    
                    <div className="nexus-network-grid">
                      {currentCrypto.networks.map(network => (
                        <button
                          key={network}
                          className={`nexus-network-card ${selectedNetwork === network ? 'active' : ''}`}
                          onClick={() => handleNetworkChange(network)}
                        >
                          <div className="nexus-network-header">
                            <span className="nexus-network-name">{network}</span>
                            {selectedNetwork === network && (
                              <div className="nexus-network-check">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="nexus-network-info">
                            <span className="nexus-network-desc">
                              {network === 'BSC' && 'BEP-20 • Low fees'}
                              {network === 'Ethereum' && 'ERC-20 • Most secure'}
                              {network === 'Tron' && 'TRC-20 • Ultra fast'}
                              {network === 'Bitcoin' && 'Native Bitcoin'}
                              {network === 'BEP2' && 'Binance Chain'}
                            </span>
                            <span className="nexus-network-fee">
                              {network === 'BSC' && 'Fee: ~$0.20'}
                              {network === 'Ethereum' && 'Fee: ~$5-15'}
                              {network === 'Tron' && 'Fee: ~$0.10'}
                              {network === 'Bitcoin' && 'Fee: ~$1-5'}
                              {network === 'BEP2' && 'Fee: ~$0.05'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Single Network Info Display */
                  <div className="nexus-section">
                    <div className="nexus-section-header">
                      <h3>Network Information</h3>
                      <p>This cryptocurrency uses the {selectedNetwork} network</p>
                    </div>
                    
                    <div className="nexus-single-network-info">
                      <div className="nexus-network-card active single">
                        <div className="nexus-network-header">
                          <span className="nexus-network-name">{selectedNetwork}</span>
                          <div className="nexus-network-check">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="nexus-network-info">
                          <span className="nexus-network-desc">
                            {selectedNetwork === 'BSC' && 'BEP-20 • Low fees'}
                            {selectedNetwork === 'Ethereum' && 'ERC-20 • Most secure'}
                            {selectedNetwork === 'Tron' && 'TRC-20 • Ultra fast'}
                            {selectedNetwork === 'Bitcoin' && 'Native Bitcoin'}
                            {selectedNetwork === 'BEP2' && 'Binance Chain'}
                          </span>
                          <span className="nexus-network-fee">
                            {selectedNetwork === 'BSC' && 'Fee: ~$0.20'}
                            {selectedNetwork === 'Ethereum' && 'Fee: ~$5-15'}
                            {selectedNetwork === 'Tron' && 'Fee: ~$0.10'}
                            {selectedNetwork === 'Bitcoin' && 'Fee: ~$1-5'}
                            {selectedNetwork === 'BEP2' && 'Fee: ~$0.05'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MetaMask Integration Section */}
                {['ETH', 'USDT', 'USDC', 'BNB'].includes(crypto?.toUpperCase()) && (
                  <div className="nexus-section">
                    <div className="nexus-section-header">
                      <h3>MetaMask Wallet Integration</h3>
                      <p>Connect your MetaMask wallet to use your own address</p>
                    </div>
                    
                    <div className="nexus-metamask-container" key={`metamask-${lastUpdate}`}>
                      {metaMaskError && (
                        <div className="nexus-alert nexus-alert-error">
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          {metaMaskError}
                        </div>
                      )}
                      
                      <div className="nexus-metamask-status">
                        <div className="nexus-metamask-info">
                          <div className="nexus-metamask-icon">
                            <svg width="32" height="32" viewBox="0 0 318.6 318.6">
                              <path fill="#E2761B" d="M274.1 35.5l-99.5 73.9L193 65.8z"/>
                              <path fill="#E4761B" d="M44.4 35.5l98.7 74.6-17.5-44.3z"/>
                              <path fill="#D7C1B3" d="M238.3 206.8l-26.5 40.6 56.7 15.6 16.3-55.3z"/>
                              <path fill="#233447" d="M33.9 207.7l16.2 55.3 56.7-15.6-26.5-40.6z"/>
                            </svg>
                          </div>
                          <div className="nexus-metamask-details">
                            <h4>MetaMask Status</h4>
                            <p className={`nexus-metamask-status-text ${isMetaMaskConnected && !userDisconnectedMetaMask ? 'connected' : 'disconnected'}`}>
                              {isMetaMaskConnected && !userDisconnectedMetaMask ? (
                                <>
                                  <span className="nexus-status-dot connected"></span>
                                  Connected: {metaMaskAddress.substring(0, 10)}...{metaMaskAddress.substring(metaMaskAddress.length - 8)}
                                </>
                              ) : userDisconnectedMetaMask ? (
                                <>
                                  <span className="nexus-status-dot disconnected"></span>
                                  Disconnected by User
                                </>
                              ) : (
                                <>
                                  <span className="nexus-status-dot disconnected"></span>
                                  Not Connected
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="nexus-metamask-actions">
                          {!isMetaMaskConnected || userDisconnectedMetaMask ? (
                            <button 
                              className="nexus-metamask-btn connect"
                              onClick={connectMetaMask}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <div className="nexus-spinner"></div>
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                  {userDisconnectedMetaMask ? 'Reconnect MetaMask' : 'Connect MetaMask'}
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="nexus-metamask-connected-actions">
                              <button 
                                className={`nexus-metamask-toggle ${useMetaMask ? 'active' : ''}`}
                                onClick={toggleMetaMaskUsage}
                              >
                                {useMetaMask ? (
                                  <>
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                    Using MetaMask Address
                                  </>
                                ) : (
                                  <>
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    Use MetaMask Address
                                  </>
                                )}
                              </button>
                              <button 
                                className="nexus-metamask-btn disconnect"
                                onClick={disconnectMetaMask}
                                disabled={loading}
                              >
                                {loading ? 'Disconnecting...' : 'Disconnect'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {useMetaMask && isMetaMaskConnected && (
                        <div className="nexus-metamask-active">
                          <div className="nexus-metamask-active-info">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span>Using your MetaMask wallet address for deposits</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Deposit Address Section */}
                <div className="nexus-section">
                  <div className="nexus-section-header">
                    <h3>Deposit Address</h3>
                    <p>
                      {useMetaMask && isMetaMaskConnected 
                        ? `Using your MetaMask wallet address on ${selectedNetwork} network`
                        : `Send ${crypto?.toUpperCase()} to this address on ${selectedNetwork} network`
                      }
                    </p>
                  </div>
                  
                  <div className="nexus-address-container">
                    <div className="nexus-qr-section">
                      <div className="nexus-qr-wrapper">
                        {qrCodeUrl ? (
                          <div className="nexus-qr-code" onClick={() => setShowQrModal(true)}>
                            <img src={qrCodeUrl} alt="Deposit QR Code" />
                            <div className="nexus-qr-overlay">
                              <div className="nexus-logo">N</div>
                            </div>
                          </div>
                        ) : (
                          <div className="nexus-qr-placeholder">
                            {loading ? (
                              <div className="nexus-loading">
                                <div className="nexus-spinner"></div>
                                <span>Generating...</span>
                              </div>
                            ) : (
                              <div className="nexus-qr-mock">
                                <svg width="60" height="60" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="nexus-qr-text">Scan with wallet app</p>
                    </div>
                    
                    <div className="nexus-address-section">
                      <div className="nexus-address-label">
                        <span>Deposit Address</span>
                        <div className="nexus-address-badges">
                          <div className="nexus-network-badge">{selectedNetwork}</div>
                          {useMetaMask && isMetaMaskConnected && (
                            <div className="nexus-metamask-badge">
                              <svg width="12" height="12" viewBox="0 0 318.6 318.6">
                                <path fill="#E2761B" d="M274.1 35.5l-99.5 73.9L193 65.8z"/>
                                <path fill="#E4761B" d="M44.4 35.5l98.7 74.6-17.5-44.3z"/>
                              </svg>
                              MetaMask
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="nexus-address-input">
                        <input 
                          type="text" 
                          value={depositAddress || 'Generating address...'} 
                          readOnly 
                          className="nexus-address-field"
                        />
                        <button 
                          className={`nexus-copy-btn ${addressCopied ? 'copied' : ''}`}
                          onClick={handleCopyAddress}
                          disabled={!depositAddress}
                        >
                          {addressCopied ? (
                            <>
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="nexus-address-warning">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        {useMetaMask && isMetaMaskConnected ? (
                          <span>This is your MetaMask wallet address. Only send {crypto?.toUpperCase()} to this address on {selectedNetwork} network</span>
                        ) : (
                          <span>Only send {crypto?.toUpperCase()} to this address on {selectedNetwork} network</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit Form */}
                <div className="nexus-section">
                  <div className="nexus-section-header">
                    <h3>Submit Deposit</h3>
                    <p>Upload transaction proof for faster processing</p>
                  </div>
                  
                  <form className="nexus-deposit-form" onSubmit={handleDepositSubmit}>
                    <div className="nexus-form-group">
                      <label>Amount ({crypto?.toUpperCase()})</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min: ${currentCrypto?.minDeposit} ${crypto?.toUpperCase()}`}
                        min={currentCrypto?.minDeposit}
                        step="0.00000001"
                        required
                        className="nexus-input"
                      />
                    </div>

                    <div className="nexus-form-group">
                      <label>Transaction Proof</label>
                      <div className="nexus-file-upload">
                        <input
                          type="file"
                          id="transaction-image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="transaction-image" className="nexus-file-label">
                          {selectedImage ? (
                            <div className="nexus-file-selected">
                              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                              <span>{selectedImage.name}</span>
                            </div>
                          ) : (
                            <div className="nexus-file-placeholder">
                              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                              </svg>
                              <span>Upload Screenshot</span>
                              <small>PNG, JPG up to 10MB</small>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="nexus-form-actions">
                      <button 
                        type="submit" 
                        className="nexus-submit-btn"
                        disabled={loading || !amount || !selectedImage}
                      >
                        {loading ? (
                          <>
                            <div className="nexus-spinner"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            Submit Deposit
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {activeTab === 'pool' && (
              <div className="nexus-pool-content">
                <TransactionPool 
                  crypto={crypto} 
                  refreshTrigger={poolRefreshTrigger}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Info & Instructions */}
          <div className="nexus-info-panel">
            {/* Quick Stats */}
            <div className="nexus-info-card">
              <div className="nexus-info-header">
                <h4>Deposit Information</h4>
              </div>
              <div className="nexus-info-stats">
                <div className="nexus-info-stat">
                  <div className="nexus-stat-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="nexus-stat-content">
                    <span className="nexus-stat-label">Minimum</span>
                    <span className="nexus-stat-value">{currentCrypto.minDeposit} {crypto?.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="nexus-info-stat">
                  <div className="nexus-stat-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="nexus-stat-content">
                    <span className="nexus-stat-label">Processing Time</span>
                    <span className="nexus-stat-value">{currentCrypto.estimatedTime}</span>
                  </div>
                </div>
                
                <div className="nexus-info-stat">
                  <div className="nexus-stat-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="nexus-stat-content">
                    <span className="nexus-stat-label">Confirmations</span>
                    <span className="nexus-stat-value">{currentCrypto.confirmations} blocks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="nexus-info-card">
              <div className="nexus-info-header">
                <h4>How to Deposit</h4>
              </div>
              <div className="nexus-instructions">
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">1</div>
                  <div className="nexus-step-content">
                    <h5>Connect MetaMask (Optional)</h5>
                    <p>Connect your MetaMask wallet to use your own address for deposits</p>
                  </div>
                </div>
                
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">2</div>
                  <div className="nexus-step-content">
                    <h5>Select Network</h5>
                    <p>Choose the correct blockchain network for your deposit</p>
                  </div>
                </div>
                
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">3</div>
                  <div className="nexus-step-content">
                    <h5>Copy Address</h5>
                    <p>Copy the deposit address or scan the QR code</p>
                  </div>
                </div>
                
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">4</div>
                  <div className="nexus-step-content">
                    <h5>Send Crypto</h5>
                    <p>Transfer {crypto?.toUpperCase()} from your external wallet</p>
                  </div>
                </div>
                
                <div className="nexus-instruction-step">
                  <div className="nexus-step-number">5</div>
                  <div className="nexus-step-content">
                    <h5>Upload Proof</h5>
                    <p>Submit transaction screenshot for faster processing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="nexus-info-card nexus-warning-card">
              <div className="nexus-info-header">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <h4>Important Notes</h4>
              </div>
              <div className="nexus-warning-list">
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Only send {crypto?.toUpperCase()} to this address</span>
                </div>
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Use {selectedNetwork} network only</span>
                </div>
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Minimum deposit: {currentCrypto.minDeposit} {crypto?.toUpperCase()}</span>
                </div>
                {['ETH', 'USDT', 'USDC', 'BNB'].includes(crypto?.toUpperCase()) && (
                  <div className="nexus-warning-item">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>Connect MetaMask to use your own wallet address</span>
                  </div>
                )}
                <div className="nexus-warning-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Contact support if funds don't arrive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="nexus-modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="nexus-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="nexus-modal-header">
              <h3>Scan QR Code</h3>
              <button 
                className="nexus-modal-close"
                onClick={() => setShowQrModal(false)}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="nexus-modal-body">
              <div className="nexus-modal-qr">
                <img src={qrCodeUrl} alt="Deposit QR Code" />
                <div className="nexus-modal-qr-overlay">
                  <div className="nexus-modal-logo">N</div>
                </div>
              </div>
              <div className="nexus-modal-info">
                <div className="nexus-modal-row">
                  <span>Currency:</span>
                  <span>{crypto?.toUpperCase()}</span>
                </div>
                <div className="nexus-modal-row">
                  <span>Network:</span>
                  <span>{selectedNetwork}</span>
                </div>
                <div className="nexus-modal-row">
                  <span>Address:</span>
                  <span className="nexus-modal-address">{depositAddress}</span>
                </div>
              </div>
              <button 
                className="nexus-modal-copy"
                onClick={handleCopyAddress}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                {addressCopied ? 'Copied!' : 'Copy Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoDeposit;