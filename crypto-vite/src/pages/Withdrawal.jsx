import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import '../styles/components/withdrawal.css';

const Withdrawal = () => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [withdrawalType, setWithdrawalType] = useState('crypto');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolder: ''
  });
  const [wallets, setWallets] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationModal, setVerificationModal] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  const cryptoOptions = [
    { symbol: 'BTC', name: 'Bitcoin', minWithdrawal: 0.001, fee: 0.0005 },
    { symbol: 'ETH', name: 'Ethereum', minWithdrawal: 0.01, fee: 0.005 },
    { symbol: 'LTC', name: 'Litecoin', minWithdrawal: 0.01, fee: 0.001 },
    { symbol: 'BCH', name: 'Bitcoin Cash', minWithdrawal: 0.01, fee: 0.001 },
    { symbol: 'XRP', name: 'Ripple', minWithdrawal: 10, fee: 0.25 }
  ];

  const fiatOptions = [
    { symbol: 'USD', name: 'US Dollar', minWithdrawal: 50, fee: 5 },
    { symbol: 'EUR', name: 'Euro', minWithdrawal: 50, fee: 5 },
    { symbol: 'GBP', name: 'British Pound', minWithdrawal: 50, fee: 5 }
  ];

  const selectedCurrencyData = withdrawalType === 'crypto' 
    ? cryptoOptions.find(c => c.symbol === selectedCurrency)
    : fiatOptions.find(c => c.symbol === selectedCurrency);

  useEffect(() => {
    fetchWallets();
    fetchWithdrawals();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await api.get('/wallets');
      if (response.data.success) {
        setWallets(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/withdrawals');
      if (response.data.success) {
        setWithdrawals(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const getWalletBalance = (currency) => {
    const wallet = wallets.find(w => w.cryptocurrency === currency);
    return wallet ? parseFloat(wallet.available_balance) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const withdrawalData = {
        currency: selectedCurrency,
        amount: parseFloat(amount),
        type: withdrawalType,
        ...(withdrawalType === 'crypto' ? { to_address: toAddress } : {
          payment_method: paymentMethod,
          payment_details: paymentDetails
        })
      };

      const response = await api.post('/withdrawals', withdrawalData);
      
      if (response.data.success) {
        setSuccess('Withdrawal request created successfully! Please check your email for verification.');
        setVerificationModal(response.data.data);
        setAmount('');
        setToAddress('');
        setPaymentDetails({
          bankName: '',
          accountNumber: '',
          routingNumber: '',
          accountHolder: ''
        });
        fetchWallets();
        fetchWithdrawals();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationModal || !verificationCode) return;

    try {
      const response = await api.post(`/withdrawals/${verificationModal.id}/verify`, {
        verification_code: verificationCode
      });

      if (response.data.success) {
        setSuccess('Withdrawal verified successfully!');
        setVerificationModal(null);
        setVerificationCode('');
        fetchWithdrawals();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'verified': return 'info';
      case 'approved': return 'info';
      case 'processing': return 'info';
      case 'failed': return 'error';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <main className="main-content">
      <div className="withdrawal-header">
        <div>
          <h1 className="page-title">Withdraw Funds</h1>
          <p className="page-subtitle">Withdraw your funds securely</p>
        </div>
      </div>

      <div className="withdrawal-container">
        <div className="withdrawal-main">
          <div className="withdrawal-method-tabs">
            <button 
              className={`method-tab ${withdrawalType === 'crypto' ? 'active' : ''}`}
              onClick={() => {
                setWithdrawalType('crypto');
                setSelectedCurrency('BTC');
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
              Crypto Withdrawal
            </button>
            <button 
              className={`method-tab ${withdrawalType === 'fiat' ? 'active' : ''}`}
              onClick={() => {
                setWithdrawalType('fiat');
                setSelectedCurrency('USD');
              }}
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

          <form onSubmit={handleSubmit} className="withdrawal-form">
            <div className="withdrawal-section">
              <label className="withdrawal-label">Select Currency</label>
              <div className="currency-grid">
                {(withdrawalType === 'crypto' ? cryptoOptions : fiatOptions).map(currency => (
                  <button
                    key={currency.symbol}
                    type="button"
                    className={`currency-option ${selectedCurrency === currency.symbol ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency(currency.symbol)}
                  >
                    <div className="currency-icon">{currency.symbol}</div>
                    <div className="currency-info">
                      <div className="currency-name">{currency.name}</div>
                      <div className="currency-balance">
                        Balance: {getWalletBalance(currency.symbol).toFixed(8)} {currency.symbol}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="withdrawal-section">
              <label className="withdrawal-label">Amount</label>
              <div className="amount-input-wrapper">
                <input
                  type="number"
                  className="amount-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.00000001"
                  min={selectedCurrencyData?.minWithdrawal}
                  max={getWalletBalance(selectedCurrency)}
                  required
                />
                <span className="currency-symbol">{selectedCurrency}</span>
              </div>
              <div className="amount-info">
                <div className="amount-detail">
                  <span>Available: {getWalletBalance(selectedCurrency).toFixed(8)} {selectedCurrency}</span>
                </div>
                <div className="amount-detail">
                  <span>Fee: {selectedCurrencyData?.fee} {selectedCurrency}</span>
                </div>
                <div className="amount-detail">
                  <span>You'll receive: {amount ? (parseFloat(amount) - selectedCurrencyData?.fee).toFixed(8) : '0.00000000'} {selectedCurrency}</span>
                </div>
              </div>
            </div>

            {withdrawalType === 'crypto' ? (
              <div className="withdrawal-section">
                <label className="withdrawal-label">Destination Address</label>
                <input
                  type="text"
                  className="address-input"
                  placeholder={`Enter ${selectedCurrency} address`}
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  required
                />
                <div className="address-warning">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Double-check the address. Transactions cannot be reversed.
                </div>
              </div>
            ) : (
              <div className="withdrawal-section">
                <label className="withdrawal-label">Payment Method</label>
                <select 
                  className="payment-method-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>

                <div className="payment-details">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Holder Name</label>
                      <input
                        type="text"
                        value={paymentDetails.accountHolder}
                        onChange={(e) => setPaymentDetails({...paymentDetails, accountHolder: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={paymentDetails.bankName}
                        onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={paymentDetails.accountNumber}
                        onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Routing Number</label>
                      <input
                        type="text"
                        value={paymentDetails.routingNumber}
                        onChange={(e) => setPaymentDetails({...paymentDetails, routingNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-withdraw"
              disabled={loading || !amount || parseFloat(amount) < selectedCurrencyData?.minWithdrawal}
            >
              {loading ? 'Processing...' : `Withdraw ${selectedCurrency}`}
            </button>
          </form>
        </div>

        <div className="withdrawal-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Recent Withdrawals</h3>
            <div className="recent-withdrawals">
              {withdrawals.slice(0, 5).map(withdrawal => (
                <div key={withdrawal.id} className="recent-withdrawal-item">
                  <div className="withdrawal-crypto">
                    <div className="withdrawal-crypto-icon">{withdrawal.currency}</div>
                    <div>
                      <div className="withdrawal-crypto-name">{withdrawal.currency}</div>
                      <div className="withdrawal-time">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="withdrawal-amount-status">
                    <div className="withdrawal-amount">{withdrawal.amount} {withdrawal.currency}</div>
                    <div className={`withdrawal-status ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </div>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <div className="no-withdrawals">No withdrawals yet</div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Important Notes</h3>
            <ul className="notes-list">
              <li>Minimum withdrawal: {selectedCurrencyData?.minWithdrawal} {selectedCurrency}</li>
              <li>Network fee: {selectedCurrencyData?.fee} {selectedCurrency}</li>
              <li>Email verification required</li>
              <li>Processing time: 1-24 hours</li>
              <li>Contact support for assistance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {verificationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Verify Withdrawal</h3>
              <button 
                className="modal-close"
                onClick={() => setVerificationModal(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>We've sent a verification code to your email. Please enter it below:</p>
              <div className="verification-input-wrapper">
                <input
                  type="text"
                  className="verification-input"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                />
              </div>
              <div className="withdrawal-details">
                <div className="detail-row">
                  <span>Amount:</span>
                  <span>{verificationModal.amount} {verificationModal.currency}</span>
                </div>
                <div className="detail-row">
                  <span>Fee:</span>
                  <span>{verificationModal.fee} {verificationModal.currency}</span>
                </div>
                <div className="detail-row">
                  <span>Net Amount:</span>
                  <span>{verificationModal.net_amount} {verificationModal.currency}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setVerificationModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleVerification}
                disabled={verificationCode.length !== 6}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Withdrawal;