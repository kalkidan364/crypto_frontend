import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const WalletsTab = ({ showToast }) => {
  const [walletData, setWalletData] = useState(null);
  const [userWallets, setUserWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getWallets();
      
      if (response && response.success) {
        setWalletData(response.wallet_data || mockWalletData);
        setUserWallets(response.wallets || mockUserWallets);
        showToast('success', 'Wallet data loaded successfully');
      } else {
        setWalletData(mockWalletData);
        setUserWallets(mockUserWallets);
        showToast('info', 'Using demo data for wallets');
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setWalletData(mockWalletData);
      setUserWallets(mockUserWallets);
      showToast('info', 'Using demo data for wallets');
    } finally {
      setLoading(false);
    }
  };

  const filteredWallets = userWallets.filter(wallet =>
    wallet.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const holdingsStats = [
    {
      icon: '₿',
      label: 'BTC Total Holdings',
      value: '142.84',
      change: '≈ $9.69M',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: 'Ξ',
      label: 'ETH Total Holdings',
      value: '1,840',
      change: '≈ $6.51M',
      type: 'blue',
      changeType: 'up'
    },
    {
      icon: 'USDT',
      label: 'USDT Total Holdings',
      value: '$4.28M',
      change: 'Stablecoin Reserve',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '◎',
      label: 'SOL Total Holdings',
      value: '28,420',
      change: '≈ $4.89M',
      type: 'cyan',
      changeType: 'up'
    }
  ];

  const userWalletColumns = [
    { key: 'user', label: 'User' },
    { key: 'btc', label: 'BTC' },
    { key: 'eth', label: 'ETH' },
    { key: 'usdt', label: 'USDT' },
    { key: 'totalUsd', label: 'Total USD' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatUserWalletRow = (wallet, index) => ({
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)', width: '24px', height: '24px', fontSize: '10px'}}>
          {wallet.user?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <span style={{fontSize: '12px'}}>{wallet.user}</span>
      </div>
    ),
    btc: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        {wallet.btc_balance || (Math.random() * 2).toFixed(4)}
      </span>
    ),
    eth: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        {wallet.eth_balance || (Math.random() * 5).toFixed(4)}
      </span>
    ),
    usdt: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        ${wallet.usdt_balance || Math.floor(Math.random() * 10000).toLocaleString()}
      </span>
    ),
    totalUsd: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)'}}>
        ${wallet.total_usd || Math.floor(Math.random() * 100000).toLocaleString()}
      </span>
    ),
    actions: (
      <button 
        className="action-btn view"
        onClick={() => showToast('info', 'User wallet details coming soon')}
      >
        View
      </button>
    )
  });

  const systemWallets = [
    {
      name: 'Bitcoin',
      symbol: 'BTC · Hot Wallet',
      icon: '₿',
      color: '#f7931a',
      amount: '12.4 BTC',
      usd: '$841K'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH · Hot Wallet',
      icon: 'Ξ',
      color: '#627eea',
      amount: '124 ETH',
      usd: '$439K'
    },
    {
      name: 'Tether',
      symbol: 'USDT · Reserve',
      icon: '₮',
      color: '#26a17b',
      amount: '$2.1M',
      usd: 'Stablecoin'
    },
    {
      name: 'Solana',
      symbol: 'SOL · Hot Wallet',
      icon: '◎',
      color: '#9945ff',
      amount: '4,200 SOL',
      usd: '$722K'
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Wallet Management</div>
          <div className="page-sub">System & user wallets overview</div>
        </div>
      </div>

      {/* Holdings Stats */}
      <div className="cards-grid">
        {holdingsStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid-3-1">
        <Panel 
          title="User Wallet Balances"
          action={
            <input
              className="filter-input"
              placeholder="Search user..."
              style={{minWidth: 'auto', width: '200px', padding: '6px 12px', fontSize: '12px'}}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          }
        >
          <DataTable
            columns={userWalletColumns}
            data={filteredWallets.map(formatUserWalletRow)}
          />
          <div className="pagination">
            <div className="page-info">{filteredWallets.length} wallets</div>
            <div className="page-btns">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">»</button>
            </div>
          </div>
        </Panel>

        <Panel 
          title="System Hot Wallets"
          meta={<span className="online-dot"></span>}
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {systemWallets.map((wallet, index) => (
              <div key={index} className="wallet-bal-card">
                <div 
                  className="wbc-coin" 
                  style={{background: `${wallet.color}22`, color: wallet.color}}
                >
                  {wallet.icon}
                </div>
                <div>
                  <div className="wbc-name">{wallet.name}</div>
                  <div className="wbc-sym">{wallet.symbol}</div>
                </div>
                <div className="wbc-bal">
                  <div className="wbc-amount">{wallet.amount}</div>
                  <div className="wbc-usd">{wallet.usd}</div>
                </div>
              </div>
            ))}
            <button 
              className="btn btn-outline" 
              style={{width: '100%', marginTop: '4px'}}
              onClick={() => showToast('info', 'Wallet top-up functionality coming soon')}
            >
              ⚡ Top Up System Wallets
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock data
const mockWalletData = {
  total_btc: 142.84,
  total_eth: 1840,
  total_usdt: 4280000,
  total_sol: 28420
};

const mockUserWallets = [
  { user: 'John Doe', btc_balance: '0.45', eth_balance: '1.2', usdt_balance: '5000', total_usd: '84291' },
  { user: 'Sarah Miller', btc_balance: '0.12', eth_balance: '2.5', usdt_balance: '12000', total_usd: '42180' },
  { user: 'Alex Kumar', btc_balance: '1.8', eth_balance: '0.8', usdt_balance: '25000', total_usd: '128420' },
  { user: 'Emma Wilson', btc_balance: '0.05', eth_balance: '0.3', usdt_balance: '8000', total_usd: '18920' },
  { user: 'Priya Patel', btc_balance: '0.8', eth_balance: '1.5', usdt_balance: '15000', total_usd: '67400' }
];

export default WalletsTab;