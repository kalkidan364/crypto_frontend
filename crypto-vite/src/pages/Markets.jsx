import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import '../styles/pages/markets.css';

// Memoized Sparkline component to prevent unnecessary re-renders
const Sparkline = memo(({ data, color }) => {
  const w = 80, h = 24;
  const mn = Math.min(...data), mx = Math.max(...data);
  const tx = i => (i / (data.length - 1)) * w;
  const ty = v => h - ((v - mn) / (mx - mn + 0.0001)) * h * 0.8 - h * 0.1;
  const pts = data.map((v, i) => `${tx(i)},${ty(v)}`).join(' ');
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="80" height="24" style={{ display: 'block' }}>
      <polyline 
        points={pts} 
        fill="none"
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
});

// Memoized Market Row component with HOLDINGS column
const MarketRow = memo(({ coin, index, selectedPair, onSelect }) => {
  // Memoize sparkline data generation
  const sparklineData = useMemo(() => {
    const points = [];
    let price = coin.price * (1 - Math.abs(coin.c24) / 100 * 0.5);
    
    for (let i = 0; i < 20; i++) {
      price *= (1 + (Math.random() - 0.5) * 0.02 + (coin.c24 > 0 ? 0.002 : -0.002));
      points.push(price);
    }
    
    return points;
  }, [coin.price, coin.c24]);
  
  const sparklineColor = coin.c24 >= 0 ? '#0ecb81' : '#f6465d';
  const isSelected = selectedPair === `${coin.sym}/USDT`;

  // Generate mock holdings data
  const holdingsAmount = coin.holdings || (Math.random() * 5).toFixed(coin.price > 100 ? 1 : coin.price > 1 ? 2 : 0);
  const holdingsValue = (holdingsAmount * coin.price).toLocaleString(undefined, { maximumFractionDigits: 2 });
  
  return (
    <div
      className={`market-row ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(`${coin.sym}/USDT`)}
    >
      <div className="row-cell name-cell">
        <span className="rank">{index + 1}</span>
        <div className="coin-icon" style={{ background: coin.bg, color: coin.color }}>
          {coin.icon}
        </div>
        <div className="coin-info">
          <div className="coin-name">{coin.name}</div>
          <div className="coin-symbol">{coin.sym}</div>
        </div>
      </div>
      
      <div className="row-cell price-cell">
        <span className="price">${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.price < 1 ? 4 : 2 })}</span>
      </div>
      
      <div className="row-cell change-cell">
        <span className={`change ${coin.c24 >= 0 ? 'positive' : 'negative'}`}>
          {coin.c24 >= 0 ? '+' : ''}{coin.c24.toFixed(2)}%
        </span>
      </div>
      
      <div className="row-cell change-cell">
        <span className={`change ${coin.c7 >= 0 ? 'positive' : 'negative'}`}>
          {coin.c7 >= 0 ? '+' : ''}{coin.c7.toFixed(2)}%
        </span>
      </div>
      
      <div className="row-cell volume-cell">
        <span className="volume">{coin.vol}</span>
      </div>
      
      <div className="row-cell mcap-cell">
        <span className="mcap">{coin.mcap}</span>
      </div>

      <div className="row-cell holdings-cell">
        <div className="holdings-info">
          <span className="holdings-amount">{holdingsAmount} {coin.sym}</span>
          <span className="holdings-value">${holdingsValue}</span>
        </div>
      </div>
      
      <div className="row-cell chart-cell">
        <div className="sparkline-wrapper">
          <Sparkline data={sparklineData} color={sparklineColor} />
        </div>
      </div>
    </div>
  );
});

const Markets = () => {
  const { marketData, loading, error, refreshMarketData } = useMarketData();
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Spot');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Memoize filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = marketData.filter(coin => {
      const matchesSearch = coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           coin.sym.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === 'All') return matchesSearch;
      if (selectedCategory === 'Layer 1') return matchesSearch && coin.tags?.includes('layer1');
      if (selectedCategory === 'DeFi') return matchesSearch && coin.tags?.includes('defi');
      if (selectedCategory === 'NFT') return matchesSearch && coin.tags?.includes('nft');
      if (selectedCategory === 'Stable') return matchesSearch && coin.tags?.includes('stable');
      return matchesSearch;
    });

    // Sort data
    return filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'change24h':
          aVal = a.c24;
          bVal = b.c24;
          break;
        case 'change7d':
          aVal = a.c7;
          bVal = b.c7;
          break;
        case 'volume':
          aVal = parseFloat(a.vol.replace(/[^0-9.-]+/g, ''));
          bVal = parseFloat(b.vol.replace(/[^0-9.-]+/g, ''));
          break;
        case 'marketCap':
        default:
          aVal = parseFloat(a.mcap.replace(/[^0-9.-]+/g, '')) * getMultiplier(a.mcap);
          bVal = parseFloat(b.mcap.replace(/[^0-9.-]+/g, '')) * getMultiplier(b.mcap);
          break;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [marketData, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Memoize handle sort
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  // Memoize handle select
  const handleSelectPair = useCallback((pair) => {
    setSelectedPair(pair);
  }, []);

  // Calculate market statistics from real data
  const marketStats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalMarketCap: '2.41T',
        marketCapChange: '+2.1',
        totalVolume: '98.48B',
        volumeChange: '+17.4',
        btcDominance: '54.7',
        dominanceChange: '-0.3',
        activeCryptos: filteredData.length,
        fearGreedIndex: 72
      };
    }

    const totalMarketCap = filteredData.reduce((sum, coin) => {
      const cap = parseFloat(coin.mcap.replace(/[^0-9.-]+/g, '')) * getMultiplier(coin.mcap);
      return sum + cap;
    }, 0);

    const totalVolume = filteredData.reduce((sum, coin) => {
      const vol = parseFloat(coin.vol.replace(/[^0-9.-]+/g, '')) * getVolumeMultiplier(coin.vol);
      return sum + vol;
    }, 0);

    const btcData = filteredData.find(coin => coin.sym === 'BTC');
    const btcMcap = btcData ? parseFloat(btcData.mcap.replace(/[^0-9.-]+/g, '')) * getMultiplier(btcData.mcap) : 0;
    const btcDominance = totalMarketCap > 0 ? ((btcMcap / totalMarketCap) * 100).toFixed(1) : '54.7';

    return {
      totalMarketCap: formatMarketCap(totalMarketCap),
      marketCapChange: '+2.1',
      totalVolume: formatVolume(totalVolume),
      volumeChange: '+17.4',
      btcDominance: btcDominance,
      dominanceChange: '-0.3',
      activeCryptos: filteredData.length,
      fearGreedIndex: 72
    };
  }, [filteredData]);

  // Get selected coin data
  const selectedCoinData = useMemo(() => {
    if (!selectedPair) return null;
    const symbol = selectedPair.split('/')[0];
    return filteredData.find(coin => coin.sym === symbol) || null;
  }, [selectedPair, filteredData]);

  const displayCoins = useMemo(() => filteredData.slice(0, 20), [filteredData]);
  const heatmapCoins = useMemo(() => filteredData.slice(0, 6), [filteredData]);

  useEffect(() => {
    // Auto-refresh market data every 30 seconds
    const interval = setInterval(() => {
      refreshMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshMarketData]);

  if (loading) {
    return (
      <div className="markets-container">
        <div className="loading-spinner">Loading market data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="markets-container">
        <div className="error-message">
          Error loading market data: {error}
          <button onClick={refreshMarketData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="markets-container">
      {/* Market Navigation */}
      <div className="market-navigation">
        <div className="nav-left">
          <div className="market-overview-stats">
            <div className="overview-stat">
              <span className="overview-label">GLOBAL MARKET CAP</span>
              <span className="overview-value">${marketStats.totalMarketCap}</span>
              <span className={`overview-change ${marketStats.marketCapChange.startsWith('+') ? 'positive' : marketStats.marketCapChange.startsWith('-') ? 'negative' : 'neutral'}`}>{marketStats.marketCapChange}%</span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">24H VOL</span>
              <span className="overview-value">${marketStats.totalVolume}</span>
              <span className={`overview-change ${marketStats.volumeChange.startsWith('+') ? 'positive' : marketStats.volumeChange.startsWith('-') ? 'negative' : 'neutral'}`}>{marketStats.volumeChange}%</span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">BTC DOMINANCE</span>
              <span className="overview-value">{marketStats.btcDominance}%</span>
              <span className={`overview-change ${marketStats.dominanceChange.startsWith('+') ? 'positive' : marketStats.dominanceChange.startsWith('-') ? 'negative' : 'neutral'}`}>{marketStats.dominanceChange}%</span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">ACTIVE CRYPTOS</span>
              <span className="overview-value">{marketStats.activeCryptos}</span>
              <span className="overview-change neutral">ONLINE</span>
            </div>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="search-container">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search coins – Bitcoin"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-filters">
              {['All', 'Layer 1', 'DeFi', 'NFT', 'Stable'].map((category) => (
                <button 
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'Stable' ? 'Stables' : category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Tabs */}
      <div className="market-tabs">
        <div className="tabs-left">
          {['Spot', 'Futures', 'Options', 'ETF'].map((tab) => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">{tab === 'Spot' ? '📊' : '📈'}</span>
              {tab}
              {tab === 'Spot' && <span className="tab-count">{filteredData.length}</span>}
            </button>
          ))}
        </div>
        
        <div className="tabs-right">
          <div className="view-toggle">
            {['table', 'grid'].map((mode) => (
              <button 
                key={mode}
                className={`toggle-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  {mode === 'table' ? (
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
                  ) : (
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout - Side by Side */}
      <div className="markets-main">
        {/* Left Section - Market Table */}
        <div className="markets-left">
          {/* Market Table */}
          <div className="market-table-container">
            <div className="table-header">
              {[
                { key: 'name', label: 'ASSET' },
                { key: 'price', label: 'PRICE' },
                { key: 'change24h', label: '24H' },
                { key: 'change7d', label: '7D' },
                { key: 'volume', label: 'VOLUME' },
                { key: 'marketCap', label: 'MKT CAP' },
                { key: 'holdings', label: 'HOLDINGS', sortable: false },
                { key: 'chart', label: 'CHART', sortable: false }
              ].map((column) => (
                <div 
                  key={column.key}
                  className={`header-cell ${column.key}-header ${column.sortable === false ? 'no-sort' : ''}`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <span>{column.label}</span>
                  {sortBy === column.key && column.sortable !== false && (
                    <svg className={`sort-icon ${sortOrder}`} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <div className="table-body">
              {displayCoins.map((coin, index) => (
                <MarketRow
                  key={coin.sym}
                  coin={coin}
                  index={index}
                  selectedPair={selectedPair}
                  onSelect={handleSelectPair}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Market Details Sidebar */}
        <div className="markets-right">
          {/* Selected Coin Details */}
          <div className="coin-details-header">
            {selectedCoinData ? (
              <div className="selected-coin-info">
                <div className="selected-coin-top">
                  <div className="selected-coin-icon" style={{ background: selectedCoinData.bg }}>
                    {selectedCoinData.icon}
                  </div>
                  <div className="selected-coin-meta">
                    <h3>{selectedCoinData.name} <span className="selected-coin-sym">({selectedCoinData.sym})</span></h3>
                    <div className="selected-coin-price">
                      ${selectedCoinData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedCoinData.price < 1 ? 4 : 2 })}
                      <span className={`selected-coin-change ${selectedCoinData.c24 >= 0 ? 'positive' : 'negative'}`}>
                        {selectedCoinData.c24 >= 0 ? '▲' : '▼'} {Math.abs(selectedCoinData.c24).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="selected-coin-stats">
                  <div className="mini-stat">
                    <span className="mini-stat-label">Market Cap</span>
                    <span className="mini-stat-value">${selectedCoinData.mcap}</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-label">24h Volume</span>
                    <span className="mini-stat-value">${selectedCoinData.vol}</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-label">7d Change</span>
                    <span className={`mini-stat-value ${selectedCoinData.c7 >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCoinData.c7 >= 0 ? '+' : ''}{selectedCoinData.c7.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="no-coin-icon">🦄</div>
                <h3>SELECT A COIN TO VIEW DETAILS</h3>
                <div className="details-subtitle">Real-time market data and insights</div>
              </>
            )}
          </div>

          {/* Trending Section */}
          <div className="trending-sidebar">
            <div className="trending-sidebar-header">
              <span className="trending-icon">🔥</span>
              <span>Trending</span>
              <span className="trending-badge">LAST 24H</span>
            </div>
            
            <div className="trending-list">
              {[
                { name: 'ApeCoin', symbol: 'APE', change: '+8.90%', icon: '🐵', color: '#0ecb81' },
                { name: 'Shiba Inu', symbol: 'SHIB', change: '+7.31%', icon: '🐕', color: '#0ecb81' },
                { name: 'Dogecoin', symbol: 'DOGE', change: '+5.46%', icon: '🐕', color: '#0ecb81' },
                { name: 'Cosmos', symbol: 'ATOM', change: '+4.31%', icon: '⚛️', color: '#0ecb81' },
                { name: 'Avalanche', symbol: 'AVAX', change: '+3.13%', icon: '🏔️', color: '#0ecb81' }
              ].map((coin, index) => (
                <div key={coin.symbol} className="trending-item">
                  <div className="trending-rank">#{index + 1}</div>
                  <div className="trending-coin-icon">{coin.icon}</div>
                  <div className="trending-coin-details">
                    <div className="trending-coin-name">{coin.name}</div>
                    <div className="trending-coin-symbol">{coin.symbol}</div>
                  </div>
                  <div className="trending-change positive">{coin.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div className="market-stats-sidebar">
            <div className="stats-header">
              <span>Heatmap</span>
              <span className="heatmap-time">24h P/L</span>
            </div>
            
            <div className="heatmap-grid">
              {heatmapCoins.map((coin) => (
                <div 
                  key={coin.sym} 
                  className={`heatmap-cell ${coin.c24 >= 0 ? 'positive' : 'negative'}`}
                  style={{ 
                    background: coin.c24 >= 0 
                      ? `rgba(14, 203, 129, ${Math.min(Math.abs(coin.c24) / 10, 0.4)})` 
                      : `rgba(246, 70, 93, ${Math.min(Math.abs(coin.c24) / 10, 0.4)})`
                  }}
                >
                  <div className="heatmap-symbol">{coin.sym}</div>
                  <div className="heatmap-change">
                    {coin.c24 >= 0 ? '+' : ''}{coin.c24.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fear & Greed Index */}
          <div className="fear-greed-section">
            <div className="fear-greed-header">
              <span>Fear & Greed Index</span>
              <span className="fear-greed-updated">Updated 1h ago</span>
            </div>
            
            <div className="fear-greed-display">
              <div className="fear-greed-gauge">
                <div className="gauge-background">
                  <div className="gauge-fill" style={{ width: `${marketStats.fearGreedIndex}%` }}></div>
                </div>
                <div className="fear-greed-value">
                  <span className="fear-greed-number">{marketStats.fearGreedIndex}</span>
                  <span className="fear-greed-label">Greed</span>
                </div>
              </div>
              
              <div className="fear-greed-scale">
                {[
                  { label: 'Extreme Fear', class: 'extreme-fear' },
                  { label: 'Fear', class: 'fear' },
                  { label: 'Neutral', class: 'neutral' },
                  { label: 'Greed', class: 'greed', active: true },
                  { label: 'Extreme Greed', class: 'extreme-greed' }
                ].map((item) => (
                  <div key={item.label} className={`scale-item ${item.active ? 'active' : ''}`}>
                    <span className={`scale-color ${item.class}`}></span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const getMultiplier = (value) => {
  if (value.includes('T')) return 1e12;
  if (value.includes('B')) return 1e9;
  if (value.includes('M')) return 1e6;
  if (value.includes('K')) return 1e3;
  return 1;
};

const getVolumeMultiplier = (value) => {
  if (value.includes('T')) return 1e12;
  if (value.includes('B')) return 1e9;
  if (value.includes('M')) return 1e6;
  if (value.includes('K')) return 1e3;
  return 1;
};

const formatMarketCap = (marketCap) => {
  const num = parseFloat(marketCap);
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(0)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
  return `${num.toFixed(0)}`;
};

const formatVolume = (volume) => {
  const num = parseFloat(volume);
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return `${num.toFixed(0)}`;
};

export default Markets;