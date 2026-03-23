import React, { useState, useEffect } from 'react';
import apiClient from '../../../utils/api';

const EducationalScamTab = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeDemo, setActiveDemo] = useState('overview');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const simulateArtificialProfits = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/simulate-profits', {
        user_id: selectedUser,
        profit_percentage: 10
      });
      
      setResults({
        type: 'profits',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to simulate profits:', error);
      alert('Failed to simulate profits: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const blockUserWithdrawals = async (blockReason) => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/block-withdrawals', {
        user_id: selectedUser,
        block_reason: blockReason
      });
      
      setResults({
        type: 'withdrawal_block',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to block withdrawals:', error);
      alert('Failed to block withdrawals: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const manipulateBalance = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const currency = prompt('Enter currency (BTC, ETH, USDT):');
    const newBalance = prompt('Enter new balance:');
    
    if (!currency || !newBalance) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/manipulate-balance', {
        user_id: selectedUser,
        currency: currency.toUpperCase(),
        new_balance: parseFloat(newBalance)
      });
      
      setResults({
        type: 'balance_manipulation',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to manipulate balance:', error);
      alert('Failed to manipulate balance: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const generateFakeTransaction = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const currency = prompt('Enter currency (BTC, ETH, USDT):');
    const amount = prompt('Enter amount:');
    
    if (!currency || !amount) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/generate-fake-transaction', {
        user_id: selectedUser,
        currency: currency.toUpperCase(),
        amount: parseFloat(amount)
      });
      
      setResults({
        type: 'fake_transaction',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to generate fake transaction:', error);
      alert('Failed to generate fake transaction: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const simulateFakeDeposit = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const currency = prompt('Enter currency (BTC, ETH, USDT, LTC, ADA, DOT):');
    const amount = prompt('Enter amount:');
    
    if (!currency || !amount) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/simulate-fake-deposit', {
        user_id: selectedUser,
        currency: currency.toUpperCase(),
        amount: parseFloat(amount)
      });
      
      setResults({
        type: 'fake_deposit',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to simulate fake deposit:', error);
      alert('Failed to simulate fake deposit: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Generate deposit address for educational scam demonstration
  const generateDepositAddress = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const currency = prompt('Enter currency (BTC, ETH, USDT, LTC, ADA, DOT):');
    
    if (!currency) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/generate-deposit-address', {
        user_id: selectedUser,
        currency: currency.toUpperCase()
      });
      
      setResults({
        type: 'deposit_address',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to generate deposit address:', error);
      alert('Failed to generate deposit address: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const demonstrateDepositTrap = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/demonstrate-deposit-trap', {
        user_id: selectedUser
      });
      
      setResults({
        type: 'deposit_trap',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to demonstrate deposit trap:', error);
      alert('Failed to demonstrate deposit trap: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadFakeInvestmentPlans = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/educational-scam/fake-investment-plans');
      
      setResults({
        type: 'investment_plans',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to load investment plans:', error);
      alert('Failed to load investment plans: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadFakeSocialProof = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/educational-scam/fake-social-proof');
      
      setResults({
        type: 'social_proof',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to load social proof:', error);
      alert('Failed to load social proof: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadSocialEngineeringTactics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/educational-scam/social-engineering-tactics');
      
      setResults({
        type: 'social_engineering',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to load social engineering tactics:', error);
      alert('Failed to load social engineering tactics: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const generateFakePriceMovements = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const cryptocurrency = prompt('Enter cryptocurrency (BTC, ETH, USDT):');
    const direction = prompt('Enter direction (pump, dump, volatile):');
    const intensity = prompt('Enter intensity (low, medium, high):');
    const timeframe = prompt('Enter timeframe (1h, 4h, 1d):');
    
    if (!cryptocurrency || !direction || !intensity || !timeframe) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/generate-fake-price-movements', {
        cryptocurrency: cryptocurrency.toUpperCase(),
        direction: direction.toLowerCase(),
        intensity: intensity.toLowerCase(),
        timeframe: timeframe.toLowerCase()
      });
      
      setResults({
        type: 'fake_price_movements',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to generate fake price movements:', error);
      alert('Failed to generate fake price movements: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const simulateFakeTradingActivity = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const cryptocurrency = prompt('Enter cryptocurrency (BTC, ETH, USDT):');
    const tradeCount = prompt('Enter number of fake trades (10-100):');
    
    if (!cryptocurrency || !tradeCount) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/simulate-fake-trading-activity', {
        cryptocurrency: cryptocurrency.toUpperCase(),
        trade_count: parseInt(tradeCount)
      });
      
      setResults({
        type: 'fake_trading_activity',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to simulate fake trading activity:', error);
      alert('Failed to simulate fake trading activity: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const generateFakeOrderBook = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const cryptocurrency = prompt('Enter cryptocurrency (BTC, ETH, USDT):');
    
    if (!cryptocurrency) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/generate-fake-order-book', {
        cryptocurrency: cryptocurrency.toUpperCase()
      });
      
      setResults({
        type: 'fake_order_book',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to generate fake order book:', error);
      alert('Failed to generate fake order book: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const simulateFakeProfitScenarios = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/simulate-fake-profit-scenarios', {
        user_id: selectedUser
      });
      
      setResults({
        type: 'fake_profit_scenarios',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to simulate fake profit scenarios:', error);
      alert('Failed to simulate fake profit scenarios: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const demonstrateChartManipulation = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    const cryptocurrency = prompt('Enter cryptocurrency (BTC, ETH, USDT):');
    
    if (!cryptocurrency) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/educational-scam/demonstrate-chart-manipulation', {
        cryptocurrency: cryptocurrency.toUpperCase()
      });
      
      setResults({
        type: 'chart_manipulation',
        data: response.data
      });
    } catch (error) {
      console.error('Failed to demonstrate chart manipulation:', error);
      alert('Failed to demonstrate chart manipulation: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const OverviewSection = () => (
    <div className="educational-overview">
      <div className="warning-banner">
        <h3>🚨 EDUCATIONAL SIMULATION ONLY 🚨</h3>
        <p>These features demonstrate how cryptocurrency scams work for educational purposes only</p>
      </div>
      
      <div className="disclaimer-grid">
        <div className="disclaimer-card prohibited">
          <h4>❌ PROHIBITED USES</h4>
          <ul>
            <li>Real financial fraud</li>
            <li>Deceiving actual users</li>
            <li>Commercial deployment</li>
            <li>Any illegal activities</li>
          </ul>
        </div>
        
        <div className="disclaimer-card learning">
          <h4>📚 LEARNING OBJECTIVES</h4>
          <ul>
            <li>Understand scam tactics</li>
            <li>Identify red flags</li>
            <li>Learn protection methods</li>
            <li>Help others avoid scams</li>
          </ul>
        </div>
      </div>
      
      <div className="simulation-features">
        <h4>Available Educational Simulations:</h4>
        <div className="feature-grid">
          <div className="feature-card">
            <h5>💰 Artificial Profits</h5>
            <p>Demonstrate how scammers create fake profits in user accounts</p>
          </div>
          <div className="feature-card">
            <h5>🚫 Withdrawal Blocking</h5>
            <p>Show common tactics used to prevent withdrawals</p>
          </div>
          <div className="feature-card">
            <h5>⚖️ Balance Manipulation</h5>
            <p>Display direct database balance manipulation</p>
          </div>
          <div className="feature-card">
            <h5>🔗 Fake Transactions</h5>
            <p>Generate fake blockchain transaction IDs</p>
          </div>
          <div className="feature-card">
            <h5>💳 Fake Deposit System</h5>
            <p>Demonstrate how scammers handle real deposits with fake balances - the core of the scam</p>
          </div>
          <div className="feature-card">
            <h5>📈 Fake Trading Charts</h5>
            <p>Show how scammers manipulate price data and trading charts to deceive users</p>
          </div>
          <div className="feature-card">
            <h5>📊 Artificial Trading Activity</h5>
            <p>Generate fake trading volume and order books to appear legitimate</p>
          </div>
          <div className="feature-card">
            <h5>🎯 Fake Profit Scenarios</h5>
            <p>Demonstrate psychological manipulation through fake trading profits</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SimulationSection = () => (
    <div className="simulation-controls">
      <div className="user-selection">
        <label>Select User for Educational Demonstration:</label>
        <select 
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          className="user-select"
        >
          <option value="">Choose a user...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="simulation-buttons">
        <div className="button-group">
          <h4>💰 Artificial Profit Generation</h4>
          <button 
            onClick={simulateArtificialProfits}
            disabled={loading || !selectedUser}
            className="sim-button profits"
          >
            {loading ? 'Generating...' : 'Generate Fake Profits (10%)'}
          </button>
          <p className="educational-note">
            This demonstrates how scammers create fake profits in user accounts
          </p>
        </div>

        <div className="button-group">
          <h4>🚫 Withdrawal Blocking Tactics</h4>
          <div className="blocking-buttons">
            <button 
              onClick={() => blockUserWithdrawals('verification_required')}
              disabled={loading || !selectedUser}
              className="sim-button block"
            >
              Block: Verification Required
            </button>
            <button 
              onClick={() => blockUserWithdrawals('tax_payment')}
              disabled={loading || !selectedUser}
              className="sim-button block"
            >
              Block: Tax Payment
            </button>
            <button 
              onClick={() => blockUserWithdrawals('vip_upgrade')}
              disabled={loading || !selectedUser}
              className="sim-button block"
            >
              Block: VIP Upgrade
            </button>
          </div>
          <p className="educational-note">
            These demonstrate common tactics scammers use to prevent withdrawals
          </p>
        </div>

        <div className="button-group">
          <h4>⚖️ Direct Balance Manipulation</h4>
          <button 
            onClick={manipulateBalance}
            disabled={loading || !selectedUser}
            className="sim-button manipulation"
          >
            {loading ? 'Manipulating...' : 'Manipulate User Balance'}
          </button>
          <p className="educational-note">
            Shows how scammers can instantly change any user balance
          </p>
        </div>

        <div className="button-group">
          <h4>🔗 Fake Transaction Generation</h4>
          <button 
            onClick={generateFakeTransaction}
            disabled={loading || !selectedUser}
            className="sim-button transaction"
          >
            {loading ? 'Generating...' : 'Generate Fake Transaction ID'}
          </button>
          <p className="educational-note">
            Creates fake blockchain transaction IDs that don't exist on any explorer
          </p>
        </div>

        <div className="button-group">
          <h4>💳 Fake Deposit System</h4>
          <div className="blocking-buttons">
            <button 
              onClick={simulateFakeDeposit}
              disabled={loading || !selectedUser}
              className="sim-button deposit"
            >
              Simulate Fake Deposit
            </button>
            <button 
              onClick={generateDepositAddress}
              disabled={loading || !selectedUser}
              className="sim-button deposit"
            >
              Generate Deposit Address
            </button>
            <button 
              onClick={demonstrateDepositTrap}
              disabled={loading || !selectedUser}
              className="sim-button deposit"
            >
              Show Deposit Trap
            </button>
          </div>
          <p className="educational-note">
            Demonstrates how scammers handle real deposits with fake balances
          </p>
        </div>



        <div className="button-group">
          <h4>💎 Fake Investment Plans</h4>
          <button 
            onClick={loadFakeInvestmentPlans}
            disabled={loading}
            className="sim-button investment"
          >
            {loading ? 'Loading...' : 'Show Fake Investment Plans'}
          </button>
          <p className="educational-note">
            Displays unrealistic investment schemes with psychological analysis
          </p>
        </div>

        <div className="button-group">
          <h4>👥 Fake Social Proof</h4>
          <button 
            onClick={loadFakeSocialProof}
            disabled={loading}
            className="sim-button social"
          >
            {loading ? 'Loading...' : 'Show Fake Testimonials'}
          </button>
          <p className="educational-note">
            Demonstrates fake testimonials and social proof tactics
          </p>
        </div>

        <div className="button-group">
          <h4>🎭 Social Engineering Tactics</h4>
          <button 
            onClick={loadSocialEngineeringTactics}
            disabled={loading}
            className="sim-button engineering"
          >
            {loading ? 'Loading...' : 'Show Social Engineering Methods'}
          </button>
          <p className="educational-note">
            Reveals psychological manipulation techniques used by scammers
          </p>
        </div>

        <div className="button-group">
          <h4>📈 Fake Trading Charts & Price Manipulation</h4>
          <div className="blocking-buttons">
            <button 
              onClick={generateFakePriceMovements}
              disabled={loading || !selectedUser}
              className="sim-button trading"
            >
              Generate Fake Price Movements
            </button>
            <button 
              onClick={simulateFakeTradingActivity}
              disabled={loading || !selectedUser}
              className="sim-button trading"
            >
              Simulate Fake Trading Activity
            </button>
            <button 
              onClick={generateFakeOrderBook}
              disabled={loading || !selectedUser}
              className="sim-button trading"
            >
              Generate Fake Order Book
            </button>
            <button 
              onClick={demonstrateChartManipulation}
              disabled={loading || !selectedUser}
              className="sim-button trading"
            >
              Show Chart Manipulation
            </button>
          </div>
          <p className="educational-note">
            Demonstrates how scammers manipulate trading data and charts to deceive users
          </p>
        </div>

        <div className="button-group">
          <h4>🎯 Fake Profit Scenarios</h4>
          <button 
            onClick={simulateFakeProfitScenarios}
            disabled={loading || !selectedUser}
            className="sim-button profit-scenarios"
          >
            {loading ? 'Generating...' : 'Show Fake Profit Scenarios'}
          </button>
          <p className="educational-note">
            Shows how scammers create fake trading profits to manipulate emotions
          </p>
        </div>
      </div>
    </div>
  );

  const ResultsSection = () => {
    if (!results) return null;

    return (
      <div className="simulation-results">
        <h4>Simulation Results:</h4>
        <div className="results-content">
          {results.type === 'profits' && (
            <div className="result-card profits-result">
              <h5>💰 Artificial Profits Generated</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <div className="profits-list">
                {results.data.profits.map((profit, index) => (
                  <div key={index} className="profit-item">
                    <span className="currency">{profit.currency}:</span>
                    <span className="original">Original: {profit.original_balance}</span>
                    <span className="profit">Fake Profit: +{profit.fake_profit}</span>
                    <span className="new">New Balance: {profit.new_balance}</span>
                  </div>
                ))}
              </div>
              <div className="educational-warning">
                ⚠️ {results.data.educational_warning}
              </div>
            </div>
          )}

          {results.type === 'withdrawal_block' && (
            <div className="result-card block-result">
              <h5>🚫 Withdrawal Blocked</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <p><strong>Block Reason:</strong> {results.data.block_reason}</p>
              <p><strong>Message Shown to User:</strong> {results.data.block_message}</p>
              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'balance_manipulation' && (
            <div className="result-card manipulation-result">
              <h5>⚖️ Balance Manipulated</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <p><strong>Currency:</strong> {results.data.currency}</p>
              <p><strong>Old Balance:</strong> {results.data.old_balance}</p>
              <p><strong>New Balance:</strong> {results.data.new_balance}</p>
              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'fake_transaction' && (
            <div className="result-card transaction-result">
              <h5>🔗 Fake Transaction Generated</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <div className="transaction-details">
                <p><strong>Currency:</strong> {results.data.fake_transaction.currency}</p>
                <p><strong>Amount:</strong> {results.data.fake_transaction.amount}</p>
                <p><strong>Fake Transaction ID:</strong></p>
                <code className="fake-tx-id">{results.data.fake_transaction.id}</code>
                <p><strong>Status:</strong> {results.data.fake_transaction.status}</p>
              </div>
              <div className="educational-warning">
                ⚠️ {results.data.educational_warning}
              </div>
              <div className="verification-note">
                💡 {results.data.verification_note}
              </div>
            </div>
          )}

          {results.type === 'fake_deposit' && (
            <div className="result-card deposit-result">
              <h5>💳 Fake Deposit Processed</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <div className="deposit-details">
                <p><strong>Currency:</strong> {results.data.deposit.currency}</p>
                <p><strong>Amount:</strong> {results.data.deposit.amount}</p>
                <p><strong>Status:</strong> {results.data.deposit.status}</p>
                <p><strong>Transaction Hash:</strong></p>
                <code className="fake-tx-id">{results.data.deposit.tx_hash}</code>
              </div>
              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'deposit_address' && (
            <div className="result-card address-result">
              <h5>📍 Deposit Address Generated</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <p><strong>Currency:</strong> {results.data.currency}</p>
              <div className="address-details">
                <p><strong>Deposit Address:</strong></p>
                <code className="deposit-address">{results.data.address}</code>
              </div>
              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'deposit_trap' && (
            <div className="result-card trap-result">
              <h5>🪤 Deposit Trap Demonstrated</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <div className="trap-analysis">
                <h6>Trap Analysis:</h6>
                <p><strong>Total Real Deposits:</strong> ${results.data.trap_analysis.total_real_deposits}</p>
                <p><strong>Number of Deposits:</strong> {results.data.trap_analysis.deposit_count}</p>
                <p><strong>Fake Balances Shown:</strong></p>
                <ul>
                  {results.data.trap_analysis.fake_balances_shown.map((balance, index) => (
                    <li key={index}>{balance.currency}: {balance.balance}</li>
                  ))}
                </ul>
                <p><strong>Explanation:</strong> {results.data.trap_analysis.trap_explanation}</p>
              </div>
              <div className="scam-tactics">
                <h6>Scam Tactics Used:</h6>
                <ul>
                  {results.data.scam_tactics.map((tactic, index) => (
                    <li key={index}>{tactic}</li>
                  ))}
                </ul>
              </div>
              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'deposit_address' && (
            <div className="result-card deposit-result">
              <h5>📥 Deposit Address Generated</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              <p><strong>Currency:</strong> {results.data.currency}</p>
              <p><strong>Deposit Address:</strong></p>
              <code className="fake-tx-id">{results.data.deposit_address}</code>
              
              <div className="educational-explanation">
                <h6>Educational Analysis:</h6>
                <p><strong>What this shows:</strong> {results.data.educational_explanation.what_this_shows}</p>
                <p><strong>Scammer perspective:</strong> {results.data.educational_explanation.scammer_perspective}</p>
                <p><strong>Victim perspective:</strong> {results.data.educational_explanation.victim_perspective}</p>
                <p><strong>Outcome:</strong> {results.data.educational_explanation.outcome}</p>
              </div>

              <div className="red-flags-section">
                <h6>🚩 Red Flags to Teach:</h6>
                <ul>
                  {results.data.red_flags_to_teach.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.type === 'investment_plans' && (
            <div className="result-card investment-result">
              <h5>💎 Fake Investment Plans</h5>
              <div className="investment-plans-grid">
                {results.data.fake_investment_plans.map((plan, index) => (
                  <div key={index} className="investment-plan-card">
                    <h6>{plan.name}</h6>
                    <div className="plan-details">
                      <p><strong>Daily Return:</strong> {plan.daily_return}</p>
                      <p><strong>Minimum:</strong> ${plan.minimum_investment}</p>
                      <p><strong>Duration:</strong> {plan.duration_days} days</p>
                    </div>
                    
                    <div className="fake-features">
                      <h7>Fake Features:</h7>
                      <ul>
                        {plan.fake_features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="psychological-hooks">
                      <h7>🧠 Psychological Hooks:</h7>
                      <ul>
                        {plan.psychological_hooks.map((hook, idx) => (
                          <li key={idx}>{hook}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="red-flags">
                      <h7>🚩 Red Flags:</h7>
                      <ul>
                        {plan.red_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="educational-analysis">
                <h6>Educational Analysis:</h6>
                <div className="analysis-section">
                  <h7>Psychological Manipulation:</h7>
                  <ul>
                    {results.data.educational_analysis.psychological_manipulation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="analysis-section">
                  <h7>Common Tactics:</h7>
                  <ul>
                    {results.data.educational_analysis.common_tactics.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="analysis-section">
                  <h7>Reality Check:</h7>
                  <ul>
                    {results.data.educational_analysis.reality_check.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {results.type === 'social_proof' && (
            <div className="result-card social-result">
              <h5>👥 Fake Social Proof</h5>
              
              <div className="fake-statistics">
                <h6>Fake Platform Statistics:</h6>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Users:</span>
                    <span className="stat-value">{results.data.fake_statistics.total_users}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Profits Paid:</span>
                    <span className="stat-value">{results.data.fake_statistics.total_profits_paid}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Success Rate:</span>
                    <span className="stat-value">{results.data.fake_statistics.success_rate}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Daily Return:</span>
                    <span className="stat-value">{results.data.fake_statistics.average_daily_return}</span>
                  </div>
                </div>
              </div>

              <div className="fake-testimonials">
                <h6>Fake User Testimonials:</h6>
                {results.data.fake_testimonials.map((testimonial, index) => (
                  <div key={index} className="testimonial-card">
                    <div className="testimonial-header">
                      <img src={testimonial.photo_url} alt={testimonial.name} className="testimonial-photo" />
                      <div className="testimonial-info">
                        <h7>{testimonial.name}</h7>
                        <p>{testimonial.location}</p>
                      </div>
                      <div className="testimonial-profit">
                        <span className="profit-amount">{testimonial.profit_claimed}</span>
                        <span className="profit-time">in {testimonial.timeframe}</span>
                      </div>
                    </div>
                    <p className="testimonial-story">"{testimonial.story}"</p>
                    
                    <div className="manipulation-analysis">
                      <h8>🧠 Manipulation Tactics:</h8>
                      <ul>
                        {testimonial.manipulation_tactics.map((tactic, idx) => (
                          <li key={idx}>{tactic}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="red-flags-analysis">
                      <h8>🚩 Red Flags:</h8>
                      <ul>
                        {testimonial.red_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="educational-analysis">
                <h6>How Scammers Create Social Proof:</h6>
                <ul>
                  {results.data.educational_analysis.how_scammers_create_social_proof.map((method, idx) => (
                    <li key={idx}>{method}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.type === 'social_engineering' && (
            <div className="result-card engineering-result">
              <h5>🎭 Social Engineering Tactics</h5>
              
              {Object.entries(results.data.social_engineering_tactics).map(([key, tactic]) => (
                <div key={key} className="engineering-tactic">
                  <h6>{tactic.description}</h6>
                  
                  <div className="tactic-process">
                    <h7>Process:</h7>
                    <ol>
                      {tactic.process.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="psychological-hooks">
                    <h7>🧠 Psychological Hooks:</h7>
                    <ul>
                      {tactic.psychological_hooks.map((hook, idx) => (
                        <li key={idx}>{hook}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="red-flags">
                    <h7>🚩 Red Flags:</h7>
                    <ul>
                      {tactic.red_flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              <div className="protection-strategies">
                <h6>🛡️ Protection Strategies:</h6>
                <ul>
                  {results.data.protection_strategies.map((strategy, idx) => (
                    <li key={idx}>{strategy}</li>
                  ))}
                </ul>
              </div>

              <div className="reporting-resources">
                <h6>📞 Reporting Resources:</h6>
                <ul>
                  {results.data.reporting_resources.map((resource, idx) => (
                    <li key={idx}>{resource}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.type === 'fake_price_movements' && (
            <div className="result-card trading-result">
              <h5>📈 Fake Price Movements Generated</h5>
              <p><strong>Cryptocurrency:</strong> {results.data.cryptocurrency}</p>
              
              <div className="price-data-analysis">
                <h6>Generated Price Data:</h6>
                <p><strong>Direction:</strong> {results.data.fake_price_data.metadata.direction}</p>
                <p><strong>Intensity:</strong> {results.data.fake_price_data.metadata.intensity}</p>
                <p><strong>Timeframe:</strong> {results.data.fake_price_data.metadata.timeframe}</p>
                <p><strong>Base Price:</strong> ${results.data.fake_price_data.metadata.base_price}</p>
                <p><strong>Final Price:</strong> ${results.data.fake_price_data.metadata.final_price}</p>
                <p><strong>Data Points:</strong> {results.data.fake_price_data.prices.length}</p>
              </div>

              <div className="manipulation-techniques">
                <h6>🎭 Manipulation Techniques:</h6>
                <ul>
                  {results.data.manipulation_techniques.map((technique, idx) => (
                    <li key={idx}>{technique}</li>
                  ))}
                </ul>
              </div>

              <div className="red-flags">
                <h6>🚩 Red Flags:</h6>
                <ul>
                  {results.data.red_flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>

              <div className="educational-warning">
                ⚠️ {results.data.educational_warning}
              </div>
            </div>
          )}

          {results.type === 'fake_trading_activity' && (
            <div className="result-card trading-result">
              <h5>📊 Fake Trading Activity Simulated</h5>
              <p><strong>Cryptocurrency:</strong> {results.data.cryptocurrency}</p>
              
              <div className="trading-statistics">
                <h6>Fake Trading Statistics:</h6>
                <p><strong>Total Volume:</strong> ${results.data.fake_statistics.total_volume.toLocaleString()}</p>
                <p><strong>Trade Count:</strong> {results.data.fake_statistics.trade_count}</p>
                <p><strong>Average Trade Size:</strong> ${results.data.fake_statistics.average_trade_size.toFixed(2)}</p>
                <p><strong>Price Range:</strong> ${results.data.fake_statistics.price_range.low} - ${results.data.fake_statistics.price_range.high}</p>
              </div>

              <div className="fake-trades-sample">
                <h6>Sample Fake Trades:</h6>
                <div className="trades-list">
                  {results.data.fake_trades.slice(0, 5).map((trade, idx) => (
                    <div key={idx} className="trade-item">
                      <span className="trade-side">{trade.side.toUpperCase()}</span>
                      <span className="trade-quantity">{trade.quantity}</span>
                      <span className="trade-price">${trade.price}</span>
                      <span className="trade-user">{trade.user}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="scam-techniques">
                <h6>🎭 Scam Techniques:</h6>
                <ul>
                  {results.data.scam_techniques.map((technique, idx) => (
                    <li key={idx}>{technique}</li>
                  ))}
                </ul>
              </div>

              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'fake_order_book' && (
            <div className="result-card trading-result">
              <h5>📋 Fake Order Book Generated</h5>
              <p><strong>Cryptocurrency:</strong> {results.data.cryptocurrency}</p>
              
              <div className="order-book-display">
                <div className="order-book-section">
                  <h6>🟢 Fake Bids (Buy Orders):</h6>
                  <div className="orders-list">
                    {results.data.fake_order_book.bids.slice(0, 5).map((order, idx) => (
                      <div key={idx} className="order-item">
                        <span className="order-price">${order.price}</span>
                        <span className="order-quantity">{order.quantity}</span>
                        <span className="order-total">${order.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-book-section">
                  <h6>🔴 Fake Asks (Sell Orders):</h6>
                  <div className="orders-list">
                    {results.data.fake_order_book.asks.slice(0, 5).map((order, idx) => (
                      <div key={idx} className="order-item">
                        <span className="order-price">${order.price}</span>
                        <span className="order-quantity">{order.quantity}</span>
                        <span className="order-total">${order.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="manipulation-methods">
                <h6>🎭 Manipulation Methods:</h6>
                <ul>
                  {results.data.manipulation_methods.map((method, idx) => (
                    <li key={idx}>{method}</li>
                  ))}
                </ul>
              </div>

              <div className="detection-tips">
                <h6>🔍 Detection Tips:</h6>
                <ul>
                  {results.data.detection_tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="educational-warning">
                ⚠️ {results.data.educational_warning}
              </div>
            </div>
          )}

          {results.type === 'fake_profit_scenarios' && (
            <div className="result-card profit-result">
              <h5>🎯 Fake Profit Scenarios</h5>
              <p><strong>User:</strong> {results.data.user}</p>
              
              <div className="profit-scenarios-grid">
                {Object.entries(results.data.fake_profit_scenarios).map(([key, scenario]) => (
                  <div key={key} className="profit-scenario-card">
                    <h6>{scenario.scenario.name}</h6>
                    <p><strong>Description:</strong> {scenario.scenario.description}</p>
                    <p><strong>Profit:</strong> {scenario.scenario.profit_percentage}%</p>
                    <p><strong>Timeframe:</strong> {scenario.scenario.timeframe}</p>
                    
                    <div className="fake-trades-section">
                      <h7>Fake Trades:</h7>
                      <div className="trades-summary">
                        {scenario.fake_trades.slice(0, 3).map((trade, idx) => (
                          <div key={idx} className="trade-summary">
                            <span>{trade.cryptocurrency}</span>
                            <span className="profit-amount">+${trade.profit_loss}</span>
                            <span className="profit-percent">({trade.profit_percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="psychological-impact">
                      <h7>🧠 Psychological Impact:</h7>
                      <ul>
                        {scenario.psychological_impact.emotional_triggers.map((trigger, idx) => (
                          <li key={idx}>{trigger}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="red-flags">
                      <h7>🚩 Red Flags:</h7>
                      <ul>
                        {scenario.red_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="scam-psychology">
                <h6>🎭 Scam Psychology:</h6>
                <ul>
                  {results.data.scam_psychology.map((psychology, idx) => (
                    <li key={idx}>{psychology}</li>
                  ))}
                </ul>
              </div>

              <div className="educational-warning">
                ⚠️ {results.data.educational_note}
              </div>
            </div>
          )}

          {results.type === 'chart_manipulation' && (
            <div className="result-card chart-result">
              <h5>📊 Chart Manipulation Demonstrated</h5>
              <p><strong>Cryptocurrency:</strong> {results.data.cryptocurrency}</p>
              
              <div className="manipulation-techniques-grid">
                {Object.entries(results.data.manipulation_techniques).map(([key, technique]) => (
                  <div key={key} className="manipulation-technique-card">
                    <h6>{technique.name}</h6>
                    <p><strong>Description:</strong> {technique.description}</p>
                    <p><strong>Technique:</strong> {technique.technique}</p>
                    <p><strong>Purpose:</strong> {technique.purpose}</p>
                  </div>
                ))}
              </div>

              <div className="chart-data-comparison">
                <h6>Chart Data Manipulation:</h6>
                <div className="comparison-section">
                  <p><strong>Original Data:</strong> {results.data.fake_chart_data.original_data}</p>
                  <p><strong>Manipulated Data:</strong> {results.data.fake_chart_data.manipulated_data}</p>
                </div>
                
                <div className="manipulation-applied">
                  <h7>Manipulations Applied:</h7>
                  <ul>
                    {results.data.fake_chart_data.manipulation_applied.map((manipulation, idx) => (
                      <li key={idx}>{manipulation}</li>
                    ))}
                  </ul>
                </div>

                <div className="visual-differences">
                  <h7>Visual Differences:</h7>
                  <ul>
                    {results.data.fake_chart_data.visual_differences.map((difference, idx) => (
                      <li key={idx}>{difference}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="detection-methods">
                <h6>🔍 Detection Methods:</h6>
                <ul>
                  {results.data.detection_methods.map((method, idx) => (
                    <li key={idx}>{method}</li>
                  ))}
                </ul>
              </div>

              <div className="educational-warning">
                ⚠️ {results.data.educational_warning}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="educational-scam-tab">
      <div className="tab-header">
        <h2>🎓 Educational Scam Simulation</h2>
        <p>Learn how cryptocurrency scams work to protect yourself and others</p>
      </div>

      <div className="demo-navigation">
        <button 
          className={activeDemo === 'overview' ? 'active' : ''}
          onClick={() => setActiveDemo('overview')}
        >
          📋 Overview
        </button>
        <button 
          className={activeDemo === 'simulation' ? 'active' : ''}
          onClick={() => setActiveDemo('simulation')}
        >
          🧪 Simulations
        </button>
        {results && (
          <button 
            className={activeDemo === 'results' ? 'active' : ''}
            onClick={() => setActiveDemo('results')}
          >
            📊 Results
          </button>
        )}
      </div>

      <div className="demo-content">
        {activeDemo === 'overview' && <OverviewSection />}
        {activeDemo === 'simulation' && <SimulationSection />}
        {activeDemo === 'results' && <ResultsSection />}
      </div>

      <div className="protection-footer">
        <h4>🛡️ Protection Tips:</h4>
        <ul>
          <li>Only use regulated, licensed cryptocurrency exchanges</li>
          <li>Be suspicious of guaranteed returns or unrealistic profit promises</li>
          <li>Test withdrawals with small amounts before large deposits</li>
          <li>Never pay upfront fees to access your own money</li>
          <li>Always verify transaction IDs on blockchain explorers</li>
        </ul>
      </div>
    </div>
  );
};

export default EducationalScamTab;