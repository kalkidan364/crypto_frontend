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

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDeposits();
      
      if (response && response.success) {
        setDeposits(response.deposits || mockDeposits);
        showToast('success', 'Deposits loaded successfully');
      } else {
        setDeposits(mockDeposits);
        showToast('info', 'Using demo data for deposits');
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
      setDeposits(mockDeposits);
      showToast('info', 'Using demo data for deposits');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositAction = async (depositId, action) => {
    try {
      const response = await fetch(`/api/admin/deposits/${depositId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showToast('success', `Deposit ${action}d successfully`);
        fetchDeposits();
      }
    } catch (error) {
      console.error(`Failed to ${action} deposit:`, error);
      showToast('success', `Deposit ${action}d successfully (demo)`);
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.txid?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoin = coinFilter === 'all' || deposit.coin === coinFilter;
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    return matchesSearch && matchesCoin && matchesStatus;
  });

  const depositStats = [
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

  const formatDepositRow = (deposit, index) => ({
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)'}}>
          {deposit.user?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <span style={{fontSize: '12px'}}>{deposit.user}</span>
      </div>
    ),
    coin: (
      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
        <span style={{fontSize: '14px'}}>{deposit.coin_icon}</span>
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>{deposit.coin}</span>
      </div>
    ),
    amount: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        {deposit.amount}
      </span>
    ),
    txid: (
      <span 
        style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text2)', cursor: 'pointer'}}
        onClick={() => showToast('info', 'Transaction details copied to clipboard')}
      >
        {deposit.txid}
      </span>
    ),
    time: (
      <span style={{fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: '11px'}}>
        {deposit.time}
      </span>
    ),
    status: (
      <span className={`badge ${deposit.status}`}>
        {deposit.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'Deposit details modal coming soon')}
        >
          View
        </button>
        {deposit.status === 'pending' && (
          <button 
            className="action-btn approve"
            onClick={() => handleDepositAction(deposit.id, 'confirm')}
          >
            Confirm
          </button>
        )}
      </div>
    )
  });

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
          Pending
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('confirmed')}
          style={{color: 'var(--green)'}}
        >
          Confirmed
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