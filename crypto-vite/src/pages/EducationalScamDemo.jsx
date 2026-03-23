import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

const EducationalScamDemo = () => {
  const { user } = useAuth();
  const [activeDemo, setActiveDemo] = useState('disclaimer');
  const [demoResults, setDemoResults] = useState({});
  const [loading, setLoading] = useState(false);

  // Educational disclaimer component
  const DisclaimerSection = () => (
    <div className="educational-disclaimer">
      <div className="warning-banner">
        <h2>🚨 EDUCATIONAL SIMULATION ONLY 🚨</h2>
        <p>This is a learning tool to understand how cryptocurrency scams work</p>
      </div>
      
      <div className="disclaimer-content">
        <div className="prohibited-section">
          <h3>❌ STRICTLY PROHIBITED USES</h3>
          <ul>
            <li>Real financial transactions</li>
            <li>Deceiving actual users</li>
            <li>Commercial deployment</li>
            <li>Any form of fraud or scam</li>
          </ul>
        </div>
        
        <div className="learning-section">
          <h3>📚 LEARNING OBJECTIVES</h3>
          <ul>
            <li>Understand common scam tactics</li>
            <li>Identify red flags in crypto platforms</li>
            <li>Learn fraud prevention techniques</li>
            <li>Protect yourself and others from scams</li>
          </ul>
        </div>
        
        <div className="safety-section">
          <h3>🔒 SAFETY MEASURES</h3>
          <ul>
            <li>All transactions are simulated</li>
            <li>No real cryptocurrency involved</li>
            <li>Clear educational warnings throughout</li>
            <li>No real financial data collection</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Artificial profits demonstration
  const ArtificialProfitsDemo = () => {
    const [profitPercentage, setProfitPercentage] = useState(5);
    
    const simulateProfits = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post('/educational-scam/simulate-profits', {
          profit_percentage: profitPercentage
        });
        setDemoResults(prev => ({ ...prev, profits: response.data }));
      } catch (error) {
        console.error('Demo error:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="demo-section">
        <h3>💰 Artificial Profit Generation Demo</h3>
        <div className="educational-warning">
          <p>⚠️ This demonstrates how scammers create fake profits in user accounts</p>
        </div>
        
        <div className="demo-controls">
          <label>
            Fake Profit Percentage:
            <input 
              type="number" 
              value={profitPercentage} 
              onChange={(e) => setProfitPercentage(e.target.value)}
              min="1" 
              max="50" 
            />
          </label>
          <button onClick={simulateProfits} disabled={loading}>
            {loading ? 'Simulating...' : 'Generate Fake Profits'}
          </button>
        </div>

        {demoResults.profits && (
          <div className="demo-results">
            <h4>Simulation Results:</h4>
            <div className="results-content">
              {demoResults.profits.simulation_result.profits.map((profit, index) => (
                <div key={index} className="profit-item">
                  <p><strong>{profit.currency}:</strong></p>
                  <p>Original: {profit.original_balance}</p>
                  <p>Fake Profit: +{profit.fake_profit}</p>
                  <p>New Balance: {profit.new_balance}</p>
                  <p className="educational-note">{profit.educational_note}</p>
                </div>
              ))}
            </div>
            
            <div className="red-flags">
              <h4>🚩 Red Flags to Watch For:</h4>
              <ul>
                {demoResults.profits.red_flags_to_watch.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Withdrawal blocking demonstration
  const WithdrawalBlockingDemo = () => {
    const [currency, setCurrency] = useState('BTC');
    const [amount, setAmount] = useState(1000);
    
    const simulateWithdrawalBlock = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post('/educational-scam/simulate-withdrawal-block', {
          currency,
          amount
        });
        setDemoResults(prev => ({ ...prev, withdrawal: response.data }));
      } catch (error) {
        console.error('Demo error:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="demo-section">
        <h3>🚫 Withdrawal Blocking Demo</h3>
        <div className="educational-warning">
          <p>⚠️ This shows common tactics scammers use to prevent withdrawals</p>
        </div>
        
        <div className="demo-controls">
          <label>
            Currency:
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="USDT">Tether</option>
            </select>
          </label>
          <label>
            Amount:
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              min="100" 
            />
          </label>
          <button onClick={simulateWithdrawalBlock} disabled={loading}>
            {loading ? 'Processing...' : 'Attempt Withdrawal'}
          </button>
        </div>

        {demoResults.withdrawal && (
          <div className="demo-results withdrawal-blocked">
            <h4>❌ Withdrawal Blocked!</h4>
            <div className="blocking-tactic">
              <h5>Scam Tactic Used:</h5>
              <p><strong>Type:</strong> {demoResults.withdrawal.simulation_result.tactic_used.type}</p>
              <p><strong>Message:</strong> {demoResults.withdrawal.simulation_result.tactic_used.message}</p>
              <p><strong>Fake Requirement:</strong> {demoResults.withdrawal.simulation_result.tactic_used.fake_requirement}</p>
            </div>
            
            <div className="educational-explanation">
              <h5>📚 Educational Explanation:</h5>
              <p><strong>What Happened:</strong> {demoResults.withdrawal.educational_explanation.what_happened}</p>
              <p><strong>Why Scammers Do This:</strong> {demoResults.withdrawal.educational_explanation.why_scammers_do_this}</p>
              
              <h6>🚩 Red Flags:</h6>
              <ul>
                {demoResults.withdrawal.educational_explanation.red_flags.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fake transaction ID demonstration
  const FakeTransactionDemo = () => {
    const [currency, setCurrency] = useState('BTC');
    
    const generateFakeTransaction = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post('/educational-scam/generate-fake-transaction', {
          currency
        });
        setDemoResults(prev => ({ ...prev, transaction: response.data }));
      } catch (error) {
        console.error('Demo error:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="demo-section">
        <h3>🔗 Fake Transaction ID Demo</h3>
        <div className="educational-warning">
          <p>⚠️ This shows how scammers create fake blockchain transaction IDs</p>
        </div>
        
        <div className="demo-controls">
          <label>
            Currency:
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="USDT">Tether</option>
            </select>
          </label>
          <button onClick={generateFakeTransaction} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Fake Transaction'}
          </button>
        </div>

        {demoResults.transaction && (
          <div className="demo-results">
            <h4>Fake Transaction Generated:</h4>
            <div className="transaction-details">
              <p><strong>Currency:</strong> {demoResults.transaction.fake_transaction.currency}</p>
              <p><strong>Fake Transaction ID:</strong></p>
              <code>{demoResults.transaction.fake_transaction.transaction_id}</code>
              <p><strong>Status:</strong> {demoResults.transaction.fake_transaction.status}</p>
            </div>
            
            <div className="educational-note">
              <p>{demoResults.transaction.fake_transaction.educational_note}</p>
            </div>
            
            <div className="verification-info">
              <h5>🔍 How to Verify Real Transactions:</h5>
              <ul>
                {Object.entries(demoResults.transaction.how_to_verify_real_transactions).map(([curr, method]) => (
                  <li key={curr}><strong>{curr}:</strong> {method}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="educational-scam-demo">
      <div className="demo-header">
        <h1>🎓 Educational Cryptocurrency Scam Demonstration</h1>
        <p>Learn how fraudulent platforms operate to protect yourself and others</p>
      </div>

      <div className="demo-navigation">
        <button 
          className={activeDemo === 'disclaimer' ? 'active' : ''}
          onClick={() => setActiveDemo('disclaimer')}
        >
          📋 Disclaimer
        </button>
        <button 
          className={activeDemo === 'profits' ? 'active' : ''}
          onClick={() => setActiveDemo('profits')}
        >
          💰 Fake Profits
        </button>
        <button 
          className={activeDemo === 'withdrawal' ? 'active' : ''}
          onClick={() => setActiveDemo('withdrawal')}
        >
          🚫 Withdrawal Blocking
        </button>
        <button 
          className={activeDemo === 'transaction' ? 'active' : ''}
          onClick={() => setActiveDemo('transaction')}
        >
          🔗 Fake Transactions
        </button>
      </div>

      <div className="demo-content">
        {activeDemo === 'disclaimer' && <DisclaimerSection />}
        {activeDemo === 'profits' && <ArtificialProfitsDemo />}
        {activeDemo === 'withdrawal' && <WithdrawalBlockingDemo />}
        {activeDemo === 'transaction' && <FakeTransactionDemo />}
      </div>

      <div className="educational-footer">
        <div className="protection-tips">
          <h3>🛡️ How to Protect Yourself:</h3>
          <ul>
            <li>Only use regulated, licensed cryptocurrency exchanges</li>
            <li>Verify platform legitimacy through official regulatory websites</li>
            <li>Be suspicious of guaranteed returns or unrealistic profit promises</li>
            <li>Test withdrawals with small amounts before making large deposits</li>
            <li>Never pay upfront fees to access your own money</li>
            <li>Research platforms thoroughly and check independent reviews</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EducationalScamDemo;