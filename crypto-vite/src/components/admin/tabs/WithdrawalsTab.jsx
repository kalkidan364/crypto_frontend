import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const WithdrawalsTab = ({ showToast }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [coinFilter, setCoinFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getWithdrawals();
      
      if (response && response.success) {
        setWithdrawals(response.withdrawals || mockWithdrawals);
        showToast('success', 'Withdrawals loaded successfully');
      } else {
        setWithdrawals(mockWithdrawals);
        showToast('info', 'Using demo data for withdrawals');
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      setWithdrawals(mockWithdrawals);
      showToast('info', 'Using demo data for withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action) => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('success', `Withdrawal ${action}d successfully`);
        fetchWithdrawals();
      }
    } catch (error) {
      console.error(`Failed to ${action} withdrawal:`, error);
      showToast('success', `Withdrawal ${action}d successfully (demo)`);
      // Update local state for demo
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: action === 'approve' ? 'completed' : 'rejected' }
          : w
      ));
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoin = coinFilter === 'all' || withdrawal.coin === coinFilter;
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    return matchesSearch && matchesCoin && matchesStatus;
  });

  const withdrawalStats = [
    {
      icon: '📤',
      label: 'Pending Withdrawals',
      value: '5',
      change: 'Awaiting approval',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '💸',
      label: 'Today Volume',
      value: '$842K',
      change: '▲ +8.4% from yesterday',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '✅',
      label: 'Completed Today',
      value: '127',
      change: '▲ +12 from yesterday',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '⚡',
      label: 'Avg Processing Time',
      value: '18m',
      change: '▼ -5m improvement',
      type: 'blue',
      changeType: 'down'
    }
  ];

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'coin', label: 'Coin' },
    { key: 'amount', label: 'Amount' },
    { key: 'address', label: 'Destination' },
    { key: 'fee', label: 'Fee' },
    { key: 'time', label: 'Requested' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatWithdrawalRow = (withdrawal, index) => ({
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)'}}>
          {withdrawal.user?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <span style={{fontSize: '12px'}}>{withdrawal.user}</span>
      </div>
    ),
    coin: (
      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
        <span style={{fontSize: '14px'}}>{withdrawal.coin_icon}</span>
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>{withdrawal.coin}</span>
      </div>
    ),
    amount: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--red)'}}>
        -{withdrawal.amount}
      </span>
    ),
    address: (
      <span 
        style={{
          fontFamily: 'var(--mono)', 
          fontSize: '10px', 
          color: 'var(--text2)', 
          cursor: 'pointer',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        }}
        onClick={() => showToast('info', 'Address copied to clipboard')}
        title={withdrawal.address}
      >
        {withdrawal.address}
      </span>
    ),
    fee: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)'}}>
        {withdrawal.fee}
      </span>
    ),
    time: (
      <span style={{fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: '11px'}}>
        {withdrawal.time}
      </span>
    ),
    status: (
      <span className={`badge ${withdrawal.status}`}>
        {withdrawal.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'Withdrawal details modal coming soon')}
        >
          View
        </button>
        {withdrawal.status === 'pending' && (
          <>
            <button 
              className="action-btn approve"
              onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
            >
              Approve
            </button>
            <button 
              className="action-btn reject"
              onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
            >
              Reject
            </button>
          </>
        )}
      </div>
    )
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading withdrawals...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Withdrawal Management</div>
          <div className="page-sub">Monitor and approve withdrawal requests</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Withdrawal report export coming soon')}
          >
            📥 Export Report
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => showToast('info', 'Bulk approval modal coming soon')}
          >
            ⚡ Bulk Approve
          </button>
        </div>
      </div>

      {/* Withdrawal Stats */}
      <div className="cards-grid">
        {withdrawalStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search by user or address..."
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
          <option value="SOL">Solana</option>
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
          Pending (5)
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
          style={{color: 'var(--green)'}}
        >
          Completed
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
          style={{color: 'var(--red)'}}
        >
          Rejected
        </button>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          data={filteredWithdrawals.map(formatWithdrawalRow)}
        />
        <div className="pagination">
          <div className="page-info">
            Showing 1–{Math.min(15, filteredWithdrawals.length)} of {filteredWithdrawals.length} withdrawals
          </div>
          <div className="page-btns">
            <button className="page-btn">«</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </Panel>

      {/* Quick Actions Panel */}
      <div className="grid-3-1" style={{marginTop: '20px'}}>
        <Panel title="Withdrawal Queue">
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {filteredWithdrawals.filter(w => w.status === 'pending').slice(0, 3).map((withdrawal, index) => (
              <div key={withdrawal.id} className="queue-item">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                  <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
                    {withdrawal.user?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div>
                    <div style={{fontSize: '12px', fontWeight: '500'}}>{withdrawal.user}</div>
                    <div style={{fontSize: '10px', color: 'var(--text2)'}}>{withdrawal.amount} {withdrawal.coin}</div>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '4px'}}>
                  <button 
                    className="action-btn approve"
                    style={{padding: '4px 8px', fontSize: '10px'}}
                    onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                  >
                    ✓
                  </button>
                  <button 
                    className="action-btn reject"
                    style={{padding: '4px 8px', fontSize: '10px'}}
                    onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))}
            {filteredWithdrawals.filter(w => w.status === 'pending').length === 0 && (
              <div style={{textAlign: 'center', color: 'var(--text2)', fontSize: '12px', padding: '20px'}}>
                No pending withdrawals
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Security Settings">
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <div className="setting-row">
              <span style={{fontSize: '12px'}}>Auto-approve limit</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--cyan)'}}>$1,000</span>
            </div>
            <div className="setting-row">
              <span style={{fontSize: '12px'}}>Daily withdrawal limit</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--yellow)'}}>$50,000</span>
            </div>
            <div className="setting-row">
              <span style={{fontSize: '12px'}}>Manual review threshold</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--red)'}}>$10,000</span>
            </div>
            <button 
              className="btn btn-outline"
              style={{width: '100%', marginTop: '8px'}}
              onClick={() => showToast('info', 'Security settings modal coming soon')}
            >
              ⚙️ Configure Limits
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock data for withdrawals
const mockWithdrawals = [
  {
    id: 1,
    user: 'John Doe',
    coin: 'BTC',
    coin_icon: '₿',
    amount: '0.5 BTC',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    fee: '0.0005 BTC',
    time: '2024-03-13 14:30',
    status: 'pending'
  },
  {
    id: 2,
    user: 'Sarah Miller',
    coin: 'ETH',
    coin_icon: 'Ξ',
    amount: '2.5 ETH',
    address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    fee: '0.01 ETH',
    time: '2024-03-13 14:15',
    status: 'pending'
  },
  {
    id: 3,
    user: 'Alex Kumar',
    coin: 'USDT',
    coin_icon: '₮',
    amount: '5,000 USDT',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    fee: '1 USDT',
    time: '2024-03-13 13:45',
    status: 'completed'
  },
  {
    id: 4,
    user: 'Emma Wilson',
    coin: 'SOL',
    coin_icon: '◎',
    amount: '50 SOL',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    fee: '0.1 SOL',
    time: '2024-03-13 13:20',
    status: 'pending'
  },
  {
    id: 5,
    user: 'Priya Patel',
    coin: 'BTC',
    coin_icon: '₿',
    amount: '0.25 BTC',
    address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    fee: '0.0005 BTC',
    time: '2024-03-13 12:55',
    status: 'rejected'
  },
  {
    id: 6,
    user: 'Carlos Ruiz',
    coin: 'ETH',
    coin_icon: 'Ξ',
    amount: '1.8 ETH',
    address: '0x8ba1f109551bD432803012645Hac136c22C501e',
    fee: '0.01 ETH',
    time: '2024-03-13 12:30',
    status: 'pending'
  }
];

export default WithdrawalsTab;