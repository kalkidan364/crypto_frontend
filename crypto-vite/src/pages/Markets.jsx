import { useState, useEffect, useRef } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import '../styles/components/markets.css';

const Sparkline = ({ data, color }) => {
  const w = 68, h = 26;
  const mn = Math.min(...data), mx = Math.max(...data);
  const tx = i => (i / (data.length - 1)) * w;
  const ty = v => h - ((v - mn) / (mx - mn + 0.0001)) * h * 0.78 - h * 0.08;
  const pts = data.map((v, i) => `${tx(i)},${ty(v)}`).join(' ');
  const fill = `0,${h} ${data.map((v, i) => `${tx(i)},${ty(v)}`).join(' ')} ${w},${h}`;
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}${Math.random().toString(36).substring(2, 11)}`;
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="68" height="26" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};


const Markets = () => {
  const { marketData, loading, error, refreshMarketData } = useMarketData();
  const [filtered, setFiltered] = useState([]);
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedSym, setSelectedSym] = useState(null);
  const [watchlist, setWatchlist] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [glMode, setGlMode] = useState('g');
  const canvasRef = useRef(null);

  // Calculate derived data from real market data
  const trending = marketData
    .filter(coin => coin.c24 > 0)
    .sort((a, b) => b.c24 - a.c24)
    .slice(0, 5);

  const heatmapData = marketData.slice(0, 16).map(coin => ({
    sym: coin.sym,
    c: coin.c24
  }));

  const globalStats = {
    totalMarketCap: marketData.reduce((sum, coin) => {
      const mcap = parseFloat(coin.mcap.replace(/[$,KMBT]/g, '')) * 
        (coin.mcap.includes('T') ? 1e12 : coin.mcap.includes('B') ? 1e9 : coin.mcap.includes('M') ? 1e6 : coin.mcap.includes('K') ? 1e3 : 1);
      return sum + mcap;
    }, 0),
    totalVolume: marketData.reduce((sum, coin) => {
      const vol = parseFloat(coin.vol.replace(/[$,KMBT]/g, '')) * 
        (coin.vol.includes('T') ? 1e12 : coin.vol.includes('B') ? 1e9 : coin.vol.includes('M') ? 1e6 : coin.vol.includes('K') ? 1e3 : 1);
      return sum + vol;
    }, 0),
    btcDominance: marketData.length > 0 ? 
      (parseFloat(marketData.find(c => c.sym === 'BTC')?.mcap.replace(/[$,KMBT]/g, '') || '0') / 
       marketData.reduce((sum, coin) => sum + parseFloat(coin.mcap.replace(/[$,KMBT]/g, '') || '0'), 0) * 100) : 0
  };

  const formatGlobalStat = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
  };

  const genSpark = (base, trend) => {
    const pts = [];
    let v = base * (1 - Math.abs(trend) / 100 * 0.7);
    for (let i = 0; i < 14; i++) {
      v *= (1 + (Math.random() - 0.48) * 0.02 + (trend > 0 ? 0.003 : -0.003));
      pts.push(v);
    }
    pts.push(base);
    return pts;
  };

  const toggleStar = (sym, e) => {
    e.stopPropagation();
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sym)) {
        newSet.delete(sym);
      } else {
        newSet.add(sym);
      }
      return newSet;
    });
  };

  const drawDetailChart = (coin) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const par = canvas.parentElement;
    const W = par.clientWidth, H = 90;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pts = [];
    let v = coin.price;
    for (let i = 0; i < 80; i++) {
      v *= (1 + (Math.random() - 0.492) * 0.012);
      pts.push(v);
    }
    pts.push(coin.price);

    const mn = Math.min(...pts) * 0.997, mx = Math.max(...pts) * 1.003;
    const tx = i => (i / (pts.length - 1)) * W;
    const ty = val => H - ((val - mn) / (mx - mn)) * H * 0.84 - H * 0.05;

    const up = coin.c24 >= 0;
    const rgb = up ? '0,255,136' : '255,45,85';
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(${rgb},.16)`);
    g.addColorStop(1, `rgba(${rgb},0)`);

    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p)));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p)));
    ctx.strokeStyle = up ? '#00ff88' : '#ff2d55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const lx = tx(pts.length - 1), ly = ty(pts[pts.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = up ? '#00ff88' : '#ff2d55';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},.28)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  useEffect(() => {
    let list = [...marketData];
    if (tagFilter !== 'all') list = list.filter(c => c.tags && c.tags.includes(tagFilter));
    if (searchTerm) list = list.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sym.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(list);
  }, [tagFilter, searchTerm, marketData]);

  useEffect(() => {
    if (selectedSym) {
      const coin = marketData.find(c => c.sym === selectedSym);
      if (coin) {
        setTimeout(() => drawDetailChart(coin), 50);
      }
    }
  }, [selectedSym, marketData]);

  const selectedCoin = selectedSym ? marketData.find(c => c.sym === selectedSym) : null;
  const sortedForGL = [...marketData].sort((a, b) => glMode === 'g' ? b.c24 - a.c24 : a.c24 - b.c24);

  // Show loading state
  if (loading) {
    return (
      <main className="main">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'var(--text-secondary)'
        }}>
          <div>Loading market data...</div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="main">
        <div className="error-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'var(--red)'
        }}>
          <div>Error loading market data: {error}</div>
          <button 
            onClick={refreshMarketData}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const fp = (p) => {
    if (p < 0.00001) return '$' + p.toFixed(8);
    if (p < 0.001) return '$' + p.toFixed(6);
    if (p < 1) return '$' + p.toFixed(4);
    if (p < 10) return '$' + p.toFixed(3);
    return '$' + p.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <main className="main">
      <div className="market-hero fi" style={{ animationDelay: '.04s' }}>
        <div className="hero-row">
          <div className="hero-stat">
            <div className="hs-label">Global Mkt Cap</div>
            <div className="hs-val" style={{ color: 'var(--cyan)' }}>{formatGlobalStat(globalStats.totalMarketCap)}</div>
            <div className="hs-chg" style={{ color: 'var(--green)' }}>▲ +2.8%</div>
          </div>
          <div className="hs-div"></div>
          <div className="hero-stat">
            <div className="hs-label">24h Volume</div>
            <div className="hs-val">{formatGlobalStat(globalStats.totalVolume)}</div>
            <div className="hs-chg" style={{ color: 'var(--green)' }}>▲ +12.4%</div>
          </div>
          <div className="hs-div"></div>
          <div className="hero-stat">
            <div className="hs-label">BTC Dom</div>
            <div className="hs-val" style={{ color: 'var(--gold)' }}>{globalStats.btcDominance.toFixed(1)}%</div>
            <div className="hs-chg" style={{ color: 'var(--red)' }}>▼ −0.3%</div>
          </div>
          <div className="hs-div"></div>
          <div className="hero-stat">
            <div className="hs-label">Fear & Greed</div>
            <div className="hs-val" style={{ color: 'var(--gold)' }}>72</div>
            <div className="hs-chg" style={{ color: 'var(--gold)' }}>● GREED</div>
          </div>
          <div className="hero-search">
            <svg className="search-ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search coins — Bitcoin, BTC, ETH…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hero-filters">
            <button className={`hf-btn ${tagFilter === 'all' ? 'on' : ''}`} onClick={() => setTagFilter('all')}>All</button>
            <button className={`hf-btn ${tagFilter === 'layer1' ? 'on' : ''}`} onClick={() => setTagFilter('layer1')}>Layer 1</button>
            <button className={`hf-btn ${tagFilter === 'defi' ? 'on' : ''}`} onClick={() => setTagFilter('defi')}>DeFi</button>
            <button className={`hf-btn ${tagFilter === 'nft' ? 'on' : ''}`} onClick={() => setTagFilter('nft')}>NFT</button>
            <button className={`hf-btn ${tagFilter === 'stable' ? 'on' : ''}`} onClick={() => setTagFilter('stable')}>Stable</button>
          </div>
        </div>
      </div>

      <div className="market-grid">
        <div className="table-panel fi" style={{ animationDelay: '.1s' }}>
          <div className="cat-tabs">
            <div className="cat-tab on">📊 Spot <span className="cat-cnt">{filtered.length}</span></div>
          </div>
          <div className="t-head">
            <span></span>
            <span>Asset</span>
            <span>Price ↕</span>
            <span>24h ↕</span>
            <span>7d ↕</span>
            <span>Volume ↕</span>
            <span>Mkt Cap ↕</span>
            <span>7D Chart</span>
          </div>
          <div>
            {filtered.map((c, i) => {
              const sp = genSpark(c.price, c.c7);
              const sc = c.c24 >= 0 ? '#00ff88' : '#ff2d55';
              return (
                <div
                  key={c.sym}
                  className={`t-row ${selectedSym === c.sym ? 'sel' : ''}`}
                  style={{ animationDelay: `${0.03 + i * 0.022}s` }}
                  onClick={() => setSelectedSym(c.sym)}
                >
                  <div className={`t-star ${watchlist.has(c.sym) ? 'on' : ''}`} onClick={(e) => toggleStar(c.sym, e)}>★</div>
                  <div className="t-coin">
                    <div className="t-orb" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                    <div>
                      <div className="t-name">{c.name}</div>
                      <div className="t-sym">{c.sym}</div>
                    </div>
                  </div>
                  <div className="t-price">{fp(c.price)}</div>
                  <div className="t-chg">
                    <span className={`pill ${c.c24 >= 0 ? 'up' : 'dn'}`}>
                      {c.c24 >= 0 ? '▲' : '▼'}{Math.abs(c.c24).toFixed(2)}%
                    </span>
                  </div>
                  <div className="t-w7" style={{ color: c.c7 >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {c.c7 >= 0 ? '+' : ''}{c.c7.toFixed(2)}%
                  </div>
                  <div className="t-vol">{c.vol}</div>
                  <div className="t-mcap">{c.mcap}</div>
                  <div className="t-spark">
                    <Sparkline data={sp} color={sc} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="paginator">
            <div className="pg-info">Showing 1–{filtered.length} of 500</div>
            <div className="pg-btns">
              <button className="pg-btn">‹</button>
              <button className="pg-btn on">1</button>
              <button className="pg-btn">2</button>
              <button className="pg-btn">3</button>
              <button className="pg-btn">…</button>
              <button className="pg-btn">25</button>
              <button className="pg-btn">›</button>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="detail-card fi" style={{ animationDelay: '.16s' }}>
            {!selectedCoin ? (
              <div className="dc-empty">
                <div className="dc-empty-ico">📡</div>
                <div className="dc-empty-txt">SELECT A COIN TO VIEW DETAILS</div>
              </div>
            ) : (
              <>
                <div className="dc-hd">
                  <div className="dc-orb" style={{ background: selectedCoin.bg, boxShadow: `0 0 16px ${selectedCoin.color}55` }}>
                    {selectedCoin.icon}
                  </div>
                  <div>
                    <div className="dc-name">{selectedCoin.name}</div>
                    <div className="dc-sym">{selectedCoin.sym} / USDT</div>
                  </div>
                  <div>
                    <div className="dc-price" style={{ color: selectedCoin.c24 >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {fp(selectedCoin.price)}
                    </div>
                    <div className="dc-chg" style={{ color: selectedCoin.c24 >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {selectedCoin.c24 >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.c24).toFixed(2)}% (24h)
                    </div>
                  </div>
                </div>
                <div className="dc-chart">
                  <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
                </div>
                <div className="dc-stats">
                  <div className="dc-stat">
                    <div className="dc-stat-lbl">24h High</div>
                    <div className="dc-stat-val" style={{ color: 'var(--green)' }}>{fp(selectedCoin.price * 1.024)}</div>
                  </div>
                  <div className="dc-stat">
                    <div className="dc-stat-lbl">24h Low</div>
                    <div className="dc-stat-val" style={{ color: 'var(--red)' }}>{fp(selectedCoin.price * 0.978)}</div>
                  </div>
                  <div className="dc-stat">
                    <div className="dc-stat-lbl">Mkt Cap</div>
                    <div className="dc-stat-val">{selectedCoin.mcap}</div>
                  </div>
                  <div className="dc-stat">
                    <div className="dc-stat-lbl">Volume</div>
                    <div className="dc-stat-val">{selectedCoin.vol}</div>
                  </div>
                  <div className="dc-stat">
                    <div className="dc-stat-lbl">ATH</div>
                    <div className="dc-stat-val" style={{ color: 'var(--gold)' }}>{fp(selectedCoin.ath)}</div>
                  </div>
                  <div className="dc-stat">
                    <div className="dc-stat-lbl">7d Change</div>
                    <div className="dc-stat-val" style={{ color: selectedCoin.c7 >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {selectedCoin.c7 >= 0 ? '+' : ''}{selectedCoin.c7.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="dc-acts">
                  <button className="dc-buy">BUY {selectedCoin.sym}</button>
                  <button className="dc-sell">SELL {selectedCoin.sym}</button>
                </div>
              </>
            )}
          </div>

          <div className="small-panel fi" style={{ animationDelay: '.2s' }}>
            <div className="sp-hd">
              <div className="sp-title">
                <div className="live-dot"></div>
                Trending
              </div>
              <div className="sp-right">LAST 24H</div>
            </div>
            <div>
              {trending.map((c, i) => (
                <div key={c.sym} className="tr-item" onClick={() => setSelectedSym(c.sym)}>
                  <div className="tr-rank">#{i + 1}</div>
                  <div className="tr-orb" style={{ background: c.bg }}>{c.icon}</div>
                  <div className="tr-name">
                    {c.name}
                    <br />
                    <span className="tr-sym">{c.sym}</span>
                  </div>
                  <span className="tr-chg up">▲ {c.c24.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="small-panel fi" style={{ animationDelay: '.24s' }}>
            <div className="sp-hd" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="sp-title">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Heatmap
              </div>
              <div className="sp-right">24H PERF</div>
            </div>
            <div className="hm-grid">
              {heatmapData.map(h => {
                const v = h.c;
                const int = Math.min(Math.abs(v) / 9, 1);
                const bg = v >= 0
                  ? `rgba(0,${Math.round(110 + int * 145)},${Math.round(70 * int)},${0.14 + int * 0.42})`
                  : `rgba(${Math.round(110 + int * 145)},${Math.round(18 * int)},${Math.round(28 + int * 28)},${0.14 + int * 0.42})`;
                return (
                  <div key={h.sym} className="hm-cell" style={{ background: bg }} onClick={() => setSelectedSym(h.sym)}>
                    <div className="hm-sym">{h.sym}</div>
                    <div className="hm-chg">{v >= 0 ? '+' : ''}{v.toFixed(2)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="small-panel fi" style={{ animationDelay: '.28s' }}>
            <div className="gl-tabs">
              <div className={`gl-tab ${glMode === 'g' ? 'ong' : ''}`} onClick={() => setGlMode('g')}>
                🚀 GAINERS
              </div>
              <div className={`gl-tab ${glMode === 'l' ? 'onl' : ''}`} onClick={() => setGlMode('l')}>
                📉 LOSERS
              </div>
            </div>
            <div>
              {sortedForGL.slice(0, 5).map(c => (
                <div key={c.sym} className="gl-item" onClick={() => setSelectedSym(c.sym)}>
                  <div className="gl-orb" style={{ background: c.bg }}>{c.icon}</div>
                  <div>
                    <div className="gl-name">{c.name}</div>
                    <div className="gl-price">{fp(c.price)}</div>
                  </div>
                  <span className={`gl-chg ${glMode === 'g' ? 'up' : 'dn'}`}>
                    {glMode === 'g' ? '▲' : '▼'}{Math.abs(c.c24).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Markets;
