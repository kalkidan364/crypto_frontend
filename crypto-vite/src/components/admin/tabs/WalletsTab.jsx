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
      
      console.log('Wallets API response:', response); // Debug log
      
      if (response && response.success) {
        // Set real wallet data
        const walletData = response.wallet_data || response.data?.wallet_data || {};
        const wallets = response.wallets || response.data?.wallets || [];
        
        setWalletData(walletData);
        setUserWallets(wallets);
        
        if (wallets.length > 0) {
          showToast('success', `Loaded ${wallets.length} user wallets`);
        } else {
          showToast('info', 'No user wallets found');
        }
      } else {
        showToast('error', 'Failed to load wallet data');
        setWalletData({});
        setUserWallets([]);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      showToast('error', `Error loading wallets: ${error.message}`);
      setWalletData({});
      setUserWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredWallets = userWallets.filter(wallet => {
    const userName = typeof wallet.user === 'string' 
      ? wallet.user 
      : wallet.user?.name || wallet.user?.email || '';
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const holdingsStats = [
    {
      icon: '₿',
      label: 'BTC Total Holdings',
      value: walletData?.total_btc?.toFixed(4) || '0.0000',
      change: walletData?.total_btc_usd ? `≈ $${(walletData.total_btc_usd / 1000000).toFixed(2)}M` : '≈ $0',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: 'Ξ',
      label: 'ETH Total Holdings',
      value: walletData?.total_eth?.toFixed(2) || '0.00',
      change: walletData?.total_eth_usd ? `≈ $${(walletData.total_eth_usd / 1000000).toFixed(2)}M` : '≈ $0',
      type: 'blue',
      changeType: 'up'
    },
    {
      icon: 'USDT',
      label: 'USDT Total Holdings',
      value: walletData?.total_usdt ? `$${(walletData.total_usdt / 1000000).toFixed(2)}M` : '$0',
      change: 'Stablecoin Reserve',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '◎',
      label: 'SOL Total Holdings',
      value: walletData?.total_sol?.toFixed(0) || '0',
      change: walletData?.total_sol_usd ? `≈ $${(walletData.total_sol_usd / 1000000).toFixed(2)}M` : '≈ $0',
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

  const formatUserWalletRow = (wallet, index) => {
    // Handle different data structures
    const userName = wallet.user_name || wallet.user?.name || wallet.user?.email || 'Unknown User';
    const userEmail = wallet.user_email || wallet.user?.email || '';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    
    return {
      user: (
        <div className="user-chip">
          <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)', width: '24px', height: '24px', fontSize: '10px'}}>
            {userInitials}
          </div>
          <div>
            <div style={{fontSize: '12px', fontWeight: '600'}}>{userName}</div>
            {userEmail && <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>{userEmail}</div>}
          </div>
        </div>
      ),
      btc: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
          {parseFloat(wallet.btc_balance || 0).toFixed(8)}
        </span>
      ),
      eth: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
          {parseFloat(wallet.eth_balance || 0).toFixed(6)}
        </span>
      ),
      usdt: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
          ${parseFloat(wallet.usdt_balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </span>
      ),
      totalUsd: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--cyan)'}}>
          ${parseFloat(wallet.total_usd || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </span>
      ),
      actions: (
        <button 
          className="action-btn view"
          onClick={() => showToast('info', `Viewing wallet for ${userName}`)}
        >
          View
        </button>
      )
    };
  };

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
          {filteredWallets.length === 0 && (
            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)'}}>
              <p>No user wallets found</p>
              <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
                {searchTerm ? 'Try a different search term' : 'Users will appear here once they create wallets'}
              </p>
            </div>
          )}
          <div className="pagination">
            <div className="page-info">{filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''}</div>
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

export default WalletsTab;