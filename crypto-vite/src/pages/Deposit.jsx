import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import '../styles/components/deposit.css';

const Deposit = () => {
  const { user } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [selectedNetwork, setSelectedNetwork] = useState('Bitcoin');
  const [amount, setAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('crypto');
  const [depositAddress, setDepositAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cryptoOptions = [
    { symbol: 'BTC', name: 'Bitcoin', networks: ['Bitcoin'], minDeposit: 0.001 },
    { symbol: 'ETH', name: 'Ethereum', networks: ['Ethereum'], minDeposit: 0.01 },
    { symbol: 'LTC', name: 'Litecoin', networks: ['Litecoin'], minDeposit: 0.01 },
    { symbol: 'BCH', name: 'Bitcoin Cash', networks: ['Bitcoin Cash'], minDeposit: 0.01 },
    { symbol: 'XRP', name: 'Ripple', networks: ['Ripple'], minDeposit: 10 }
  ];

  const selectedCryptoData = cryptoOptions.find(c => c.symbol === selectedCrypto);

  useEffect(() => {
    fetchDeposits();
    if (depositMethod === 'crypto' || depositMethod === 'exchange') {
      generateDepositAddress();
    }
  }, [selectedCrypto, depositMethod]);

  useEffect(() => {
    // Add event listeners for exchange tab switching
    const handleExchangeTabClick = (e) => {
      if (e.target.classList.contains('exchange-tab-btn')) {
        // Remove active class from all tabs
        document.querySelectorAll('.exchange-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.exchange-instruction').forEach(inst => inst.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        const exchange = e.target.getAttribute('data-exchange');
        document.querySelector(`[data-exchange="${exchange}"].exchange-instruction`).classList.add('active');
      }
    };

    document.addEventListener('click', handleExchangeTabClick);
    return () => document.removeEventListener('click', handleExchangeTabClick);
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await api.get('/deposits');
      if (response.data.success) {
        setDeposits(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
  };

  const generateDepositAddress = async () => {
    try {
      setLoading(true);
      const response = await api.post('/deposits/generate-address', {
        currency: selectedCrypto
      });
      
      if (response.data.success) {
        setDepositAddress(response.data.data.address);
        setQrCodeUrl(response.data.data.qr_code);
      }
    } catch (error) {
      setError('Failed to generate deposit address');
    } finally {
      setLoading(false);
    }
  };

  const handleFiatDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10) {
      setError('Minimum deposit amount is $10');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/deposits/fiat', {
        currency: 'USD',
        amount: parseFloat(amount),
        payment_method: 'bank_transfer',
        payment_details: {
          bank: 'Nexus Financial Bank',
          account: '1234567890'
        },
        payment_reference: `DEP_${Date.now()}`
      });

      if (response.data.success) {
        setSuccess('Fiat deposit request created successfully!');
        setAmount('');
        fetchDeposits();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create deposit');
    } finally {
      setLoading(false);
    }
  };

  const simulateCryptoDeposit = async () => {
    if (!depositAddress) return;
    
    try {
      setLoading(true);
      const response = await api.post('/deposits/simulate-crypto', {
        currency: selectedCrypto,
        amount: selectedCryptoData?.minDeposit * 2,
        wallet_address: depositAddress
      });

      if (response.data.success) {
        setSuccess('Crypto deposit simulated successfully!');
        fetchDeposits();
      }
    } catch (error) {
      setError('Failed to simulate deposit');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'confirming': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <main className="main-content">
      <div className="deposit-header">
        <div>
          <h1 className="page-title">Deposit Funds</h1>
          <p className="page-subtitle">Add funds to your account</p>
        </div>
      </div>

      <div className="deposit-container">
        <div className="deposit-main">
          <div className="deposit-method-tabs">
            <button 
              className={`method-tab ${depositMethod === 'crypto' ? 'active' : ''}`}
              onClick={() => setDepositMethod('crypto')}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
              Crypto Deposit
            </button>
            <button 
              className={`method-tab ${depositMethod === 'exchange' ? 'active' : ''}`}
              onClick={() => setDepositMethod('exchange')}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              From Exchange
            </button>
            <button 
              className={`method-tab ${depositMethod === 'fiat' ? 'active' : ''}`}
              onClick={() => setDepositMethod('fiat')}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              Bank Transfer
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {success}
            </div>
          )}

          {depositMethod === 'crypto' ? (
            <>
              <div className="deposit-section">
                <label className="deposit-label">Select Cryptocurrency</label>
                <div className="crypto-grid">
                  {cryptoOptions.map(crypto => (
                    <button
                      key={crypto.symbol}
                      className={`crypto-option ${selectedCrypto === crypto.symbol ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCrypto(crypto.symbol);
                        setSelectedNetwork(crypto.networks[0]);
                      }}
                    >
                      <div className="crypto-icon">{crypto.symbol}</div>
                      <div className="crypto-info">
                        <div className="crypto-name">{crypto.name}</div>
                        <div className="crypto-symbol">{crypto.symbol}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="deposit-section">
                <label className="deposit-label">Select Network</label>
                <select 
                  className="network-select"
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                >
                  {selectedCryptoData?.networks.map(network => (
                    <option key={network} value={network}>{network}</option>
                  ))}
                </select>
                <div className="network-warning">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Ensure you select the correct network. Sending to wrong network may result in loss of funds.
                </div>
              </div>

              <div className="deposit-section">
                <label className="deposit-label">Deposit Address</label>
                <div className="address-box">
                  <div className="address-qr">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                    ) : (
                      <div className="qr-placeholder">
                        {loading ? (
                          <div className="loading-spinner">Loading...</div>
                        ) : (
                          <svg width="120" height="120" viewBox="0 0 120 120">
                            <rect width="120" height="120" fill="#1a1d2e"/>
                            <rect x="10" y="10" width="30" height="30" fill="white"/>
                            <rect x="80" y="10" width="30" height="30" fill="white"/>
                            <rect x="10" y="80" width="30" height="30" fill="white"/>
                            <rect x="50" y="50" width="20" height="20" fill="white"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="address-details">
                    <div className="address-text">{depositAddress || 'Generating address...'}</div>
                    <button 
                      className="btn-copy" 
                      onClick={() => depositAddress && navigator.clipboard.writeText(depositAddress)}
                      disabled={!depositAddress}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Copy Address
                    </button>
                    <button 
                      className="btn-simulate" 
                      onClick={simulateCryptoDeposit}
                      disabled={loading || !depositAddress}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Simulate Deposit
                    </button>
                  </div>
                </div>
              </div>

              <div className="deposit-info-cards">
                <div className="info-card">
                  <div className="info-label">Minimum Deposit</div>
                  <div className="info-value">{selectedCryptoData?.minDeposit} {selectedCrypto}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Confirmations Required</div>
                  <div className="info-value">12 blocks</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Estimated Arrival</div>
                  <div className="info-value">10-30 min</div>
                </div>
              </div>
            </>
          ) : depositMethod === 'exchange' ? (
            <>
              <div className="exchange-deposit-section">
                <div className="exchange-header">
                  <h3>Transfer from External Exchange</h3>
                  <p>Send cryptocurrency directly from your Binance, Coinbase, Kraken, or other exchange account</p>
                </div>

                <div className="deposit-section">
                  <label className="deposit-label">Select Cryptocurrency</label>
                  <div className="crypto-grid">
                    {cryptoOptions.map(crypto => (
                      <button
                        key={crypto.symbol}
                        className={`crypto-option ${selectedCrypto === crypto.symbol ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCrypto(crypto.symbol);
                          setSelectedNetwork(crypto.networks[0]);
                        }}
                      >
                        <div className="crypto-icon">{crypto.symbol}</div>
                        <div className="crypto-info">
                          <div className="crypto-name">{crypto.name}</div>
                          <div className="crypto-symbol">{crypto.symbol}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="deposit-section">
                  <label className="deposit-label">Your NEXUS Deposit Address</label>
                  <div className="address-box exchange-address">
                    <div className="address-qr">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                      ) : (
                        <div className="qr-placeholder">
                          {loading ? (
                            <div className="loading-spinner">Loading...</div>
                          ) : (
                            <svg width="120" height="120" viewBox="0 0 120 120">
                              <rect width="120" height="120" fill="#1a1d2e"/>
                              <rect x="10" y="10" width="30" height="30" fill="white"/>
                              <rect x="80" y="10" width="30" height="30" fill="white"/>
                              <rect x="10" y="80" width="30" height="30" fill="white"/>
                              <rect x="50" y="50" width="20" height="20" fill="white"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="address-details">
                      <div className="address-text">{depositAddress || 'Generating address...'}</div>
                      <button 
                        className="btn-copy" 
                        onClick={() => depositAddress && navigator.clipboard.writeText(depositAddress)}
                        disabled={!depositAddress}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                        Copy Address
                      </button>
                    </div>
                  </div>
                </div>

                <div className="exchange-instructions">
                  <h4>📋 Step-by-Step Instructions</h4>
                  
                  <div className="exchange-tabs">
                    <div className="exchange-tab-buttons">
                      <button className="exchange-tab-btn active" data-exchange="binance">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0YzQkE2RiI+PHBhdGggZD0iTTEyIDJsNC4wNCA0LjA0TDEyIDEwLjA4IDcuOTYgNi4wNEwxMiAyem0wIDEyTDcuOTYgMTcuOTZMMTIgMjJsNC4wNC00LjA0TDEyIDE0em0tNi02TDIgMTJsNC4wNCA0LjA0TDEwLjA4IDEyIDYgOHptMTIgMEwxNCA4bC00LjA0IDQuMDRMMTQgMTZsNC4wNC00LjA0eiIvPjwvc3ZnPg==" alt="Binance" />
                        Binance
                      </button>
                      <button className="exchange-tab-btn" data-exchange="coinbase">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNTNGRiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNMTIgNmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==" alt="Coinbase" />
                        Coinbase
                      </button>
                      <button className="exchange-tab-btn" data-exchange="kraken">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU3NDFEOSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==" alt="Kraken" />
                        Kraken
                      </button>
                      <button className="exchange-tab-btn" data-exchange="kucoin">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwRDZCMCI+PHBhdGggZD0iTTEyIDJsNC4wNCA0LjA0TDEyIDEwLjA4IDcuOTYgNi4wNEwxMiAyem0wIDEyTDcuOTYgMTcuOTZMMTIgMjJsNC4wNC00LjA0TDEyIDE0em0tNi02TDIgMTJsNC4wNCA0LjA0TDEwLjA4IDEyIDYgOHptMTIgMEwxNCA4bC00LjA0IDQuMDRMMTQgMTZsNC4wNC00LjA0eiIvPjwvc3ZnPg==" alt="KuCoin" />
                        KuCoin
                      </button>
                    </div>

                    <div className="exchange-instructions-content">
                      <div className="exchange-instruction active" data-exchange="binance">
                        <div className="instruction-steps">
                          <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                              <h5>Login to Binance</h5>
                              <p>Open your Binance app or website and log into your account</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                              <h5>Go to Wallet → Spot Wallet</h5>
                              <p>Navigate to your Spot Wallet where your {selectedCrypto} is stored</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                              <h5>Click "Withdraw" on {selectedCrypto}</h5>
                              <p>Find {selectedCrypto} in your wallet and click the "Withdraw" button</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                              <h5>Select "Send via Crypto Network"</h5>
                              <p>Choose the crypto network option (not internal transfer)</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                              <h5>Paste NEXUS Address</h5>
                              <p>Copy the address above and paste it in the "Recipient Address" field</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">6</div>
                            <div className="step-content">
                              <h5>Select Network: {selectedNetwork}</h5>
                              <p>⚠️ IMPORTANT: Make sure to select the correct network to avoid losing funds</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">7</div>
                            <div className="step-content">
                              <h5>Enter Amount & Confirm</h5>
                              <p>Enter the amount you want to transfer and complete the withdrawal</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="exchange-instruction" data-exchange="coinbase">
                        <div className="instruction-steps">
                          <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                              <h5>Login to Coinbase</h5>
                              <p>Open Coinbase app or website and sign in to your account</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                              <h5>Go to Portfolio</h5>
                              <p>Navigate to your Portfolio to see your {selectedCrypto} balance</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                              <h5>Click on {selectedCrypto}</h5>
                              <p>Select your {selectedCrypto} wallet from the portfolio</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                              <h5>Click "Send"</h5>
                              <p>Click the "Send" button to initiate a transfer</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                              <h5>Paste NEXUS Address</h5>
                              <p>Copy the address above and paste it in the "To" field</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">6</div>
                            <div className="step-content">
                              <h5>Enter Amount & Send</h5>
                              <p>Enter the amount and confirm the transaction with 2FA</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="exchange-instruction" data-exchange="kraken">
                        <div className="instruction-steps">
                          <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                              <h5>Login to Kraken</h5>
                              <p>Access your Kraken account via web or mobile app</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                              <h5>Go to Funding → Withdraw</h5>
                              <p>Navigate to the Funding section and select Withdraw</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                              <h5>Select {selectedCrypto}</h5>
                              <p>Choose {selectedCrypto} from the list of available currencies</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                              <h5>Add New Address</h5>
                              <p>Click "Add address" and paste the NEXUS address above</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                              <h5>Verify Address</h5>
                              <p>Kraken will send a confirmation email to verify the new address</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">6</div>
                            <div className="step-content">
                              <h5>Complete Withdrawal</h5>
                              <p>Enter amount and confirm the withdrawal with 2FA</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="exchange-instruction" data-exchange="kucoin">
                        <div className="instruction-steps">
                          <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                              <h5>Login to KuCoin</h5>
                              <p>Access your KuCoin account</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                              <h5>Go to Assets → Main Account</h5>
                              <p>Navigate to your Main Account in the Assets section</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                              <h5>Find {selectedCrypto} and Click "Withdraw"</h5>
                              <p>Locate your {selectedCrypto} balance and click withdraw</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                              <h5>Select "On-chain Withdraw"</h5>
                              <p>Choose on-chain withdrawal (not internal transfer)</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                              <h5>Add NEXUS Address</h5>
                              <p>Paste the address above and select {selectedNetwork} network</p>
                            </div>
                          </div>
                          <div className="step">
                            <div className="step-number">6</div>
                            <div className="step-content">
                              <h5>Complete Withdrawal</h5>
                              <p>Enter amount, verify with email/SMS, and confirm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="exchange-warnings">
                  <div className="warning-card critical">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                      <h5>Critical: Network Selection</h5>
                      <p>Always select <strong>{selectedNetwork}</strong> network when withdrawing {selectedCrypto}. Using wrong network will result in permanent loss of funds.</p>
                    </div>
                  </div>
                  <div className="warning-card info">
                    <div className="warning-icon">ℹ️</div>
                    <div className="warning-content">
                      <h5>Processing Time</h5>
                      <p>Exchange withdrawals typically take 10-60 minutes depending on network congestion and exchange processing time.</p>
                    </div>
                  </div>
                  <div className="warning-card tip">
                    <div className="warning-icon">💡</div>
                    <div className="warning-content">
                      <h5>Pro Tip</h5>
                      <p>Start with a small test amount first to ensure the address and network are correct before sending larger amounts.</p>
                    </div>
                  </div>
                </div>

                <div className="deposit-info-cards">
                  <div className="info-card">
                    <div className="info-label">Minimum from Exchange</div>
                    <div className="info-value">{selectedCryptoData?.minDeposit} {selectedCrypto}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Network Confirmations</div>
                    <div className="info-value">12 blocks</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Estimated Arrival</div>
                    <div className="info-value">10-60 min</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Exchange Fees</div>
                    <div className="info-value">Varies by exchange</div>
                  </div>
                </div>
              </div>
            </>
          ) : depositMethod === 'fiat' ? (
            <>
              <div className="deposit-section">
                <label className="deposit-label">Select Cryptocurrency</label>
                <div className="crypto-grid">
                  {cryptoOptions.map(crypto => (
                    <button
                      key={crypto.symbol}
                      className={`crypto-option ${selectedCrypto === crypto.symbol ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCrypto(crypto.symbol);
                        setSelectedNetwork(crypto.networks[0]);
                      }}
                    >
                      <div className="crypto-icon">{crypto.symbol}</div>
                      <div className="crypto-info">
                        <div className="crypto-name">{crypto.name}</div>
                        <div className="crypto-symbol">{crypto.symbol}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="deposit-section">
                <label className="deposit-label">Select Network</label>
                <select 
                  className="network-select"
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                >
                  {selectedCryptoData?.networks.map(network => (
                    <option key={network} value={network}>{network}</option>
                  ))}
                </select>
                <div className="network-warning">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Ensure you select the correct network. Sending to wrong network may result in loss of funds.
                </div>
              </div>

              <div className="deposit-section">
                <label className="deposit-label">Deposit Address</label>
                <div className="address-box">
                  <div className="address-qr">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                    ) : (
                      <div className="qr-placeholder">
                        {loading ? (
                          <div className="loading-spinner">Loading...</div>
                        ) : (
                          <svg width="120" height="120" viewBox="0 0 120 120">
                            <rect width="120" height="120" fill="#1a1d2e"/>
                            <rect x="10" y="10" width="30" height="30" fill="white"/>
                            <rect x="80" y="10" width="30" height="30" fill="white"/>
                            <rect x="10" y="80" width="30" height="30" fill="white"/>
                            <rect x="50" y="50" width="20" height="20" fill="white"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="address-details">
                    <div className="address-text">{depositAddress || 'Generating address...'}</div>
                    <button 
                      className="btn-copy" 
                      onClick={() => depositAddress && navigator.clipboard.writeText(depositAddress)}
                      disabled={!depositAddress}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Copy Address
                    </button>
                    <button 
                      className="btn-simulate" 
                      onClick={simulateCryptoDeposit}
                      disabled={loading || !depositAddress}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Simulate Deposit
                    </button>
                  </div>
                </div>
              </div>

              <div className="deposit-info-cards">
                <div className="info-card">
                  <div className="info-label">Minimum Deposit</div>
                  <div className="info-value">{selectedCryptoData?.minDeposit} {selectedCrypto}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Confirmations Required</div>
                  <div className="info-value">12 blocks</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Estimated Arrival</div>
                  <div className="info-value">10-30 min</div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleFiatDeposit} className="fiat-deposit">
              <div className="deposit-section">
                <label className="deposit-label">Amount (USD)</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    className="amount-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="10"
                    step="0.01"
                    required
                  />
                </div>
                <div className="amount-presets">
                  {[100, 500, 1000, 5000].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className="preset-btn"
                      onClick={() => setAmount(preset.toString())}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="deposit-section">
                <label className="deposit-label">Bank Details</label>
                <div className="bank-details">
                  <div className="bank-detail-row">
                    <span className="detail-label">Bank Name:</span>
                    <span className="detail-value">Nexus Financial Bank</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="detail-label">Account Name:</span>
                    <span className="detail-value">Nexus Exchange Ltd</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="detail-label">Account Number:</span>
                    <span className="detail-value">1234567890</span>
                    <button type="button" className="btn-copy-small" onClick={() => navigator.clipboard.writeText('1234567890')}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="bank-detail-row">
                    <span className="detail-label">Routing Number:</span>
                    <span className="detail-value">021000021</span>
                    <button type="button" className="btn-copy-small" onClick={() => navigator.clipboard.writeText('021000021')}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="bank-detail-row">
                    <span className="detail-label">SWIFT Code:</span>
                    <span className="detail-value">NEXUUS33</span>
                    <button type="button" className="btn-copy-small" onClick={() => navigator.clipboard.writeText('NEXUUS33')}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-deposit"
                disabled={loading || !amount || parseFloat(amount) < 10}
              >
                {loading ? 'Processing...' : 'Create Deposit Request'}
              </button>

              <div className="fiat-notice">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <div>
                  <div className="notice-title">Important Information</div>
                  <div className="notice-text">Bank transfers typically take 1-3 business days. Please include your User ID ({user?.id}) in the transfer reference.</div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="deposit-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Recent Deposits</h3>
            <div className="recent-deposits">
              {deposits.slice(0, 5).map(deposit => (
                <div key={deposit.id} className="recent-deposit-item">
                  <div className="deposit-crypto">
                    <div className="deposit-crypto-icon">{deposit.currency}</div>
                    <div>
                      <div className="deposit-crypto-name">{deposit.currency}</div>
                      <div className="deposit-time">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="deposit-amount-status">
                    <div className="deposit-amount">{deposit.amount} {deposit.currency}</div>
                    <div className={`deposit-status ${getStatusColor(deposit.status)}`}>
                      {deposit.status}
                    </div>
                  </div>
                </div>
              ))}
              {deposits.length === 0 && (
                <div className="no-deposits">No deposits yet</div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Important Notes</h3>
            <ul className="notes-list">
              <li>Send only {selectedCrypto} to this address</li>
              <li>Minimum deposit: {selectedCryptoData?.minDeposit} {selectedCrypto}</li>
              <li>12 network confirmations required</li>
              <li>Deposits arrive within 10-30 minutes</li>
              <li>Contact support if funds don't arrive</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Deposit;
