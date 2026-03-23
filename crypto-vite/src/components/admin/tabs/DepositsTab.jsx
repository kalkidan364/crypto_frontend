import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const DepositsTab = ({ showToast }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [coinFilter, setCoinFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDeposits();
    fetchStatistics();
  }, []);

  // Refresh deposits when filters change
  useEffect(() => {
    fetchDeposits();
  }, [statusFilter, coinFilter, searchTerm]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (coinFilter !== 'all') params.currency = coinFilter;
      if (searchTerm) params.search = searchTerm;

      console.log('Fetching deposits with params:', params);
      const response = await adminAPI.getDepositsForApproval(params);
      
      console.log('Deposits API response:', response);
      
      if (response && response.success && response.deposits) {
        setDeposits(response.deposits);
        console.log(`Loaded ${response.deposits.length} deposits`);
        showToast('success', `Loaded ${response.deposits.length} deposits`);
      } else {
        console.warn('No deposits in API response, using mock data');
        setDeposits(mockDeposits);
        showToast('info', 'Using demo data for deposits');
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
      setDeposits(mockDeposits);
      showToast('error', 'Failed to load deposits, using demo data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await adminAPI.getDepositStatistics();
      if (response && response.success) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch deposit statistics:', error);
    }
  };

  const handleDepositAction = async (depositId, action, reason = null) => {
    try {
      setActionLoading(true);
      let response;
      
      if (action === 'approve') {
        response = await adminAPI.approveDeposit(depositId, { notes: reason });
      } else if (action === 'reject') {
        response = await adminAPI.rejectDeposit(depositId, { reason });
      }

      if (response && response.success) {
        showToast('success', `Deposit ${action}d successfully`);
        fetchDeposits();
        fetchStatistics();
        setShowDetailModal(false);
      } else {
        showToast('error', response.message || `Failed to ${action} deposit`);
      }
    } catch (error) {
      console.error(`Failed to ${action} deposit:`, error);
      showToast('error', `Failed to ${action} deposit`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (depositId) => {
    try {
      const response = await adminAPI.getDepositDetails(depositId);
      if (response && response.success) {
        setSelectedDeposit(response.deposit);
        setShowDetailModal(true);
      } else {
        showToast('error', 'Failed to load deposit details');
      }
    } catch (error) {
      console.error('Failed to fetch deposit details:', error);
      showToast('error', 'Failed to load deposit details');
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    const userName = typeof deposit.user === 'string' 
      ? deposit.user 
      : deposit.user?.name || deposit.user?.email || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.txid?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoin = coinFilter === 'all' || deposit.currency === coinFilter;
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    return matchesSearch && matchesCoin && matchesStatus;
  });

  const depositStats = statistics ? [
    {
      icon: '📥',
      label: 'Total Deposits Today',
      value: statistics.today_deposits?.toString() || '0',
      change: `$${statistics.today_volume?.toFixed(2) || '0.00'} volume`,
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Total Volume',
      value: `$${statistics.total_volume?.toFixed(2) || '0.00'}`,
      change: `${statistics.total_deposits || 0} deposits`,
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '⏳',
      label: 'Pending Deposits',
      value: statistics.pending_deposits?.toString() || '0',
      change: `$${statistics.pending_volume?.toFixed(2) || '0.00'} pending`,
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '✅',
      label: 'Completed',
      value: statistics.completed_deposits?.toString() || '0',
      change: `${statistics.failed_deposits || 0} failed`,
      type: 'green',
      changeType: 'up'
    }
  ] : [
    {
      icon: '📥',
      label: 'Total Deposits Today',
      value: '247',
      change: '▲ +18 from yesterday',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Volume Today',
      value: '$1.84M',
      change: '▲ +12.4% from yesterday',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '⏳',
      label: 'Pending Deposits',
      value: '12',
      change: 'Awaiting confirmation',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '✅',
      label: 'Success Rate',
      value: '98.7%',
      change: '▲ +0.3% this week',
      type: 'green',
      changeType: 'up'
    }
  ];

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'coin', label: 'Coin' },
    { key: 'amount', label: 'Amount' },
    { key: 'txid', label: 'Transaction ID' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatDepositRow = (deposit, index) => {
    // Add safety checks for all properties
    if (!deposit) return {};
    
    const userName = typeof deposit.user === 'string' 
      ? deposit.user 
      : deposit.user?.name || deposit.user?.email || 'Unknown User';
    
    const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';

    return {
      user: (
        <div className="user-chip">
          <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)'}}>
            {userInitials}
          </div>
          <span style={{fontSize: '12px'}}>{userName}</span>
        </div>
      ),
      coin: (
        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
          <span style={{fontSize: '14px'}}>{getCurrencyIcon(deposit.currency)}</span>
          <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>{deposit.currency || 'N/A'}</span>
        </div>
      ),
      amount: (
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
            {deposit.amount || '0.00'} {deposit.currency}
          </span>
          {deposit.net_amount && deposit.net_amount !== deposit.amount && (
            <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)'}}>
              Net: {deposit.net_amount} {deposit.currency}
            </span>
          )}
        </div>
      ),
      txid: (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
          <span 
            style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)', cursor: 'pointer'}}
            onClick={() => {
              if (deposit.blockchain_explorer_url) {
                window.open(deposit.blockchain_explorer_url, '_blank');
              } else {
                showToast('info', 'Transaction ID copied to clipboard');
              }
            }}
            title={deposit.txid || 'N/A'}
          >
            {deposit.txid ? `${deposit.txid.substring(0, 12)}...` : 'N/A'}
          </span>
          {deposit.network && (
            <span style={{fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase'}}>
              {deposit.network}
            </span>
          )}
        </div>
      ),
      time: (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
          <span style={{fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: '11px'}}>
            {deposit.created_at ? new Date(deposit.created_at).toLocaleDateString() : 'N/A'}
          </span>
          <span style={{fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: '10px'}}>
            {deposit.created_at ? new Date(deposit.created_at).toLocaleTimeString() : ''}
          </span>
        </div>
      ),
      status: (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
          <span className={`badge ${deposit.status || 'pending'}`}>
            {(deposit.status || 'pending').toUpperCase()}
          </span>
          {deposit.confirmations !== undefined && deposit.required_confirmations && (
            <span style={{fontSize: '9px', color: 'var(--text3)'}}>
              {deposit.confirmations}/{deposit.required_confirmations} conf
            </span>
          )}
        </div>
      ),
      actions: (
        <div className="actions-cell">
          <button 
            className="action-btn view"
            onClick={() => handleViewDetails(deposit.id || index)}
          >
            View
          </button>
          {(deposit.status === 'pending') && (
            <>
              <button 
                className="action-btn approve"
                onClick={() => handleDepositAction(deposit.id || index, 'approve')}
                disabled={actionLoading}
              >
                {actionLoading ? '...' : 'Approve'}
              </button>
              <button 
                className="action-btn reject"
                onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) {
                    handleDepositAction(deposit.id || index, 'reject', reason);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? '...' : 'Reject'}
              </button>
            </>
          )}
        </div>
      )
    };
  };

  const getCurrencyIcon = (currency) => {
    const icons = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '₮',
      'USDC': '$',
      'SOL': '◎',
      'BNB': '🔸',
      'XRP': '◆',
      'DOT': '●',
      'MATIC': '🔷',
    };
    return icons[currency] || '💰';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading deposits...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Deposit Management</div>
          <div className="page-sub">Monitor incoming deposits</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Deposit report export coming soon')}
          >
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Deposit Stats */}
      <div className="cards-grid">
        {depositStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search by user or transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-input"
          style={{minWidth: 'auto', width: '120px'}}
          value={coinFilter}
          onChange={(e) => setCoinFilter(e.target.value)}
        >
          <option value="all">All Coins</option>
          <option value="BTC">Bitcoin</option>
          <option value="ETH">Ethereum</option>
          <option value="USDT">Tether</option>
          <option value="USDC">USD Coin</option>
          <option value="SOL">Solana</option>
          <option value="BNB">Binance Coin</option>
          <option value="LTC">Litecoin</option>
          <option value="ADA">Cardano</option>
          <option value="DOT">Polkadot</option>
          <option value="MATIC">Polygon</option>
        </select>
        <button 
          className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
          style={{color: 'var(--yellow)'}}
        >
          Pending
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'confirming' ? 'active' : ''}`}
          onClick={() => setStatusFilter('confirming')}
          style={{color: 'var(--blue)'}}
        >
          Confirming
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
          style={{color: 'var(--green)'}}
        >
          Completed
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'failed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('failed')}
          style={{color: 'var(--red)'}}
        >
          Failed
        </button>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          data={filteredDeposits.map(formatDepositRow)}
        />
        <div className="pagination">
          <div className="page-info">
            Showing 1–{Math.min(15, filteredDeposits.length)} of {filteredDeposits.length} deposits
          </div>
          <div className="page-btns">
            <button className="page-btn">«</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </Panel>

      {/* Deposit Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deposit Details</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="deposit-details">
                <div className="detail-section">
                  <h4>User Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedDeposit.user?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedDeposit.user?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>KYC Status:</label>
                      <span className={`badge ${selectedDeposit.user?.kyc_status || 'pending'}`}>
                        {(selectedDeposit.user?.kyc_status || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Deposit Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Currency:</label>
                      <span>{getCurrencyIcon(selectedDeposit.currency)} {selectedDeposit.currency}</span>
                    </div>
                    <div className="detail-item">
                      <label>Amount:</label>
                      <span>{selectedDeposit.amount} {selectedDeposit.currency}</span>
                    </div>
                    <div className="detail-item">
                      <label>Net Amount:</label>
                      <span>{selectedDeposit.net_amount || selectedDeposit.amount} {selectedDeposit.currency}</span>
                    </div>
                    <div className="detail-item">
                      <label>Type:</label>
                      <span>{selectedDeposit.type}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`badge ${selectedDeposit.status}`}>
                        {selectedDeposit.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Network:</label>
                      <span>{selectedDeposit.network || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedDeposit.txid && (
                  <div className="detail-section">
                    <h4>Transaction Details</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Transaction ID:</label>
                        <span style={{fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all'}}>
                          {selectedDeposit.txid}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>From Address:</label>
                        <span style={{fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all'}}>
                          {selectedDeposit.from_address || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>To Address:</label>
                        <span style={{fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all'}}>
                          {selectedDeposit.wallet_address || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Confirmations:</label>
                        <span>
                          {selectedDeposit.confirmations || 0} / {selectedDeposit.required_confirmations || 0}
                        </span>
                      </div>
                      {selectedDeposit.blockchain_explorer_url && (
                        <div className="detail-item">
                          <label>Blockchain Explorer:</label>
                          <a 
                            href={selectedDeposit.blockchain_explorer_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="explorer-link"
                          >
                            View on Explorer →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedDeposit.transaction_image && (
                  <div className="detail-section">
                    <h4>Transaction Proof</h4>
                    <div className="transaction-image">
                      <img 
                        src={selectedDeposit.transaction_image} 
                        alt="Transaction proof" 
                        style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}
                      />
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Timestamps</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Created:</label>
                      <span>{selectedDeposit.created_at ? new Date(selectedDeposit.created_at).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Confirmed:</label>
                      <span>{selectedDeposit.confirmed_at ? new Date(selectedDeposit.confirmed_at).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Completed:</label>
                      <span>{selectedDeposit.completed_at ? new Date(selectedDeposit.completed_at).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Processed:</label>
                      <span>{selectedDeposit.processed_at ? new Date(selectedDeposit.processed_at).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedDeposit.notes && (
                  <div className="detail-section">
                    <h4>Notes</h4>
                    <div className="notes-content">
                      {selectedDeposit.notes}
                    </div>
                  </div>
                )}

                {selectedDeposit.educational_warning && (
                  <div className="detail-section educational-warning">
                    <h4>⚠️ Educational Warning</h4>
                    <p>{selectedDeposit.educational_warning}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedDeposit.status === 'pending' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      const notes = prompt('Enter approval notes (optional):');
                      handleDepositAction(selectedDeposit.id, 'approve', notes);
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve Deposit'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        handleDepositAction(selectedDeposit.id, 'reject', reason);
                      }
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Reject Deposit'}
                  </button>
                </>
              )}
              <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data for deposits
const mockDeposits = [
  {
    id: 1,
    user: 'John Doe',
    coin: 'BTC',
    coin_icon: '₿',
    amount: '0.5 BTC',
    txid: '1a2b3c4d5e6f7g8h9i0j...',
    time: '2024-03-13 14:30',
    status: 'confirmed'
  },
  {
    id: 2,
    user: 'Sarah Miller',
    coin: 'ETH',
    coin_icon: 'Ξ',
    amount: '2.5 ETH',
    txid: '9i8h7g6f5e4d3c2b1a0z...',
    time: '2024-03-13 14:15',
    status: 'pending'
  },
  {
    id: 3,
    user: 'Alex Kumar',
    coin: 'USDT',
    coin_icon: '₮',
    amount: '1,000 USDT',
    txid: 'x1y2z3a4b5c6d7e8f9g0...',
    time: '2024-03-13 13:45',
    status: 'confirmed'
  },
  {
    id: 4,
    user: 'Emma Wilson',
    coin: 'SOL',
    coin_icon: '◎',
    amount: '50 SOL',
    txid: 'p9o8i7u6y5t4r3e2w1q0...',
    time: '2024-03-13 13:20',
    status: 'pending'
  },
  {
    id: 5,
    user: 'Priya Patel',
    coin: 'BTC',
    coin_icon: '₿',
    amount: '0.25 BTC',
    txid: 'm1n2b3v4c5x6z7a8s9d0...',
    time: '2024-03-13 12:55',
    status: 'failed'
  }
];

export default DepositsTab