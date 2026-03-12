import React, { useEffect, useRef, useState } from 'react';
import '../styles/components/reports.css';

const Reports = () => {
  const pnlChartRef = useRef(null);
  const monthlyChartRef = useRef(null);
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastData, setToastData] = useState({ icon: '', text: '', sub: '' });

  const showToast = (icon, text, sub) => {
    setToastData({ icon, text, sub });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const genReport = (name, file, size) => {
    showToast('⬇', `GENERATING: ${name.toUpperCase()}`, `${file} · ${size}`);
  };

  const setPeriod = (period) => {
    setSelectedPeriod(period);
    drawPnlChart();
    drawMonthlyChart();
  };

  const drawPnlChart = () => {
    const canvas = pnlChartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const W = parent.clientWidth || 600;
    const H = 193;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    
    ctx.fillStyle = '#091520';
    ctx.fillRect(0, 0, W, H);
    
    const pad = { l: 50, r: 16, t: 8, b: 28 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;
    const n = 60;
    
    // Generate data
    const daily = [];
    const cumPnl = [];
    let cum = 0;
    for (let i = 0; i < n; i++) {
      const d = (Math.random() > 0.42 ? 1 : -1) * (Math.random() * 1800 + 200) * (i > 45 ? 1.4 : 1);
      daily.push(d);
      cum += d;
      cumPnl.push(cum);
    }
    
    const volData = daily.map(() => Math.random() * 400 + 80);
    const mnC = Math.min(...cumPnl);
    const mxC = Math.max(...cumPnl);
    const tx = i => pad.l + (i / (n - 1)) * cw;
    const tyC = v => pad.t + ch - ((v - mnC) / (mxC - mnC + 1)) * ch;
    const volMax = Math.max(...volData);
    
    // Grid
    ctx.strokeStyle = 'rgba(0,245,255,.04)';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
      const y = pad.t + ch * t;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + cw, y);
      ctx.stroke();
    });
    
    // Volume bars
    const bw = cw / n * 0.6;
    volData.forEach((v, i) => {
      const bh = (v / volMax) * 28;
      ctx.fillStyle = 'rgba(96,165,250,.06)';
      ctx.fillRect(tx(i) - bw / 2, pad.t + ch - bh, bw, bh);
    });
    
    // P&L area
    const gc = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
    gc.addColorStop(0, 'rgba(0,255,136,.15)');
    gc.addColorStop(1, 'rgba(0,255,136,0)');
    ctx.beginPath();
    cumPnl.forEach((v, i) => i === 0 ? ctx.moveTo(tx(i), tyC(v)) : ctx.lineTo(tx(i), tyC(v)));
    ctx.lineTo(tx(n - 1), pad.t + ch);
    ctx.lineTo(tx(0), pad.t + ch);
    ctx.closePath();
    ctx.fillStyle = gc;
    ctx.fill();
    
    // P&L line
    ctx.beginPath();
    cumPnl.forEach((v, i) => i === 0 ? ctx.moveTo(tx(i), tyC(v)) : ctx.lineTo(tx(i), tyC(v)));
    ctx.strokeStyle = 'rgba(0,255,136,.8)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    
    // Y labels
    ctx.fillStyle = 'rgba(90,128,144,.4)';
    ctx.font = "8px 'Share Tech Mono'";
    ctx.textAlign = 'right';
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
      const v = mxC - (mxC - mnC) * t;
      const y = pad.t + ch * t;
      ctx.fillText('$' + Math.round(v / 1000) + 'K', pad.l - 4, y + 3);
    });
  };

  const drawMonthlyChart = () => {
    const canvas = monthlyChartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const W = parent.clientWidth || 400;
    const H = 142;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    
    ctx.fillStyle = '#091520';
    ctx.fillRect(0, 0, W, H);
    
    const pad = { l: 44, r: 12, t: 6, b: 22 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;
    
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const vals = [-1200, 3400, 2800, 4200, -800, 5100, 3200, -500, 6800, 4100, -1800, 3900];
    const mx = Math.max(...vals.map(Math.abs)) * 1.1;
    const bw = (cw / months.length) * 0.72;
    
    // Zero line
    ctx.strokeStyle = 'rgba(0,245,255,.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, H / 2);
    ctx.lineTo(pad.l + cw, H / 2);
    ctx.stroke();
    
    // Bars
    vals.forEach((v, i) => {
      const up = v >= 0;
      const bh = Math.abs(v) / mx * (ch / 2 - 8);
      const x = pad.l + (i + 0.5) * (cw / months.length) - bw / 2;
      const y = up ? H / 2 - bh : H / 2;
      
      const g = ctx.createLinearGradient(0, y, 0, y + bh);
      g.addColorStop(0, up ? 'rgba(0,255,136,.7)' : 'rgba(255,51,85,.65)');
      g.addColorStop(1, up ? 'rgba(0,255,136,.18)' : 'rgba(255,51,85,.12)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, bw, bh);
      
      // Top value
      ctx.fillStyle = up ? 'rgba(0,255,136,.65)' : 'rgba(255,51,85,.65)';
      ctx.font = "7px 'Share Tech Mono'";
      ctx.textAlign = 'center';
      const lbl = (v >= 0 ? '+' : '-') + '$' + (Math.abs(v) / 1000).toFixed(1) + 'K';
      ctx.fillText(lbl, x + bw / 2, up ? y - 3 : y + bh + 10);
      
      // Month label
      ctx.fillStyle = 'rgba(90,128,144,.4)';
      ctx.fillText(months[i], x + bw / 2, H - 4);
    });
    
    // Y labels
    ctx.fillStyle = 'rgba(90,128,144,.38)';
    ctx.textAlign = 'right';
    [1, 0.5, 0, -0.5, -1].forEach(t => {
      const v = mx * t;
      const y = H / 2 - t * (ch / 2 - 8);
      ctx.fillText((v >= 0 ? '+' : '') + Math.round(v / 1000) + 'K', pad.l - 4, y + 3);
    });
  };

  const buildAssetBreakdown = () => {
    const assets = [
      { sym: 'BTC', name: 'Bitcoin', ico: '₿', bg: 'radial-gradient(circle,#ff9500,#f7931a)', col: '#f7931a', pnl: 8241, pct: 45 },
      { sym: 'ETH', name: 'Ethereum', ico: 'Ξ', bg: 'radial-gradient(circle,#8ea3f5,#627eea)', col: '#627eea', pnl: 4820, pct: 26 },
      { sym: 'SOL', name: 'Solana', ico: '◎', bg: 'radial-gradient(circle,#c074fc,#9945ff)', col: '#9945ff', pnl: -1204, pct: -7 },
      { sym: 'AVAX', name: 'Avalanche', ico: 'A', bg: 'radial-gradient(circle,#ff6060,#e84142)', col: '#e84142', pnl: 2840, pct: 16 },
      { sym: 'LINK', name: 'Chainlink', ico: '⬡', bg: 'radial-gradient(circle,#3b82f6,#1d4ed8)', col: '#3b82f6', pnl: 1840, pct: 10 },
      { sym: 'BNB', name: 'BNB', ico: 'B', bg: 'radial-gradient(circle,#f5cc3a,#f3ba2f)', col: '#f3ba2f', pnl: 704, pct: 4 },
    ];
    
    const maxPnl = Math.max(...assets.map(a => Math.abs(a.pnl)));
    const container = document.getElementById('assetBreakdown');
    if (!container) return;
    
    container.innerHTML = assets.map((a, i) => `
      <div class="ab-row" style="animation:fu .4s ease ${i * 0.05}s backwards">
        <div class="ab-orb" style="background:${a.bg};color:${a.col}">${a.ico}</div>
        <div>
          <div class="ab-name">${a.name}</div>
          <div class="ab-sym">${a.sym}</div>
        </div>
        <div style="flex:1;padding:0 10px">
          <div class="ab-bar-w" style="width:100%">
            <div class="ab-bar-f" style="width:${Math.abs(a.pnl) / maxPnl * 100}%;background:${a.pnl >= 0 ? 'var(--up)' : 'var(--dn)'}"></div>
          </div>
        </div>
        <div>
          <div class="ab-pnl" style="color:${a.pnl >= 0 ? 'var(--up)' : 'var(--dn)'}">${a.pnl >= 0 ? '+' : ''}${Math.abs(a.pnl).toLocaleString()}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:8px;color:${a.pnl >= 0 ? 'var(--up)' : 'var(--dn)'};text-align:right">${a.pct >= 0 ? '+' : ''}${a.pct}%</div>
        </div>
      </div>
    `).join('');
  };

  const buildActivityFeed = () => {
    const acts = [
      { ico: '⬇', bg: 'rgba(0,255,136,.1)', msg: 'Performance Report Downloaded', time: '5 min ago', val: 'PDF 3.2 MB', vc: true },
      { ico: '🏛', bg: 'rgba(255,204,0,.1)', msg: 'Tax Report 2026 Generated', time: '2h ago', val: 'PDF + CSV', vc: true },
      { ico: '📊', bg: 'rgba(0,245,255,.1)', msg: 'Monthly Report Scheduled', time: '1d ago', val: 'Apr 1, 2026', vc: true },
      { ico: '📋', bg: 'rgba(191,95,255,.1)', msg: 'Transactions CSV Exported', time: '3d ago', val: '2,841 rows', vc: true },
      { ico: '🔍', bg: 'rgba(79,163,255,.1)', msg: 'Portfolio Audit Completed', time: '5d ago', val: 'No issues', vc: true },
      { ico: '⚠', bg: 'rgba(255,51,85,.1)', msg: 'Missing cost basis: 3 trades', time: '1w ago', val: 'Review', vc: false },
    ];
    
    const container = document.getElementById('activityFeed');
    if (!container) return;
    
    container.innerHTML = acts.map((a, i) => `
      <div class="act-item" style="animation:fu .35s ease ${i * 0.05}s backwards">
        <div class="act-ico" style="background:${a.bg}">${a.ico}</div>
        <div class="act-txt">
          <div class="act-msg">${a.msg}</div>
          <div class="act-time">${a.time}</div>
        </div>
        <div class="act-amt" style="color:${a.vc ? 'var(--up)' : 'var(--dn)'}">${a.val}</div>
      </div>
    `).join('');
  };

  const buildCalendar = () => {
    const days = 90, cols = 13;
    const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    let html = `<div class="cal-month">Last 90 days</div>`;
    
    html += `<div style="display:grid;grid-template-columns:12px ${Array(cols).fill('1fr').join(' ')};gap:2px;margin-bottom:4px">`;
    html += `<div></div>`;
    for (let w = cols - 1; w >= 0; w--) {
      const d = new Date(Date.now() - (w * 7) * 86400000);
      html += `<div class="cal-dow">${d.getDate()}</div>`;
    }
    html += '</div>';
    
    html += `<div style="display:grid;grid-template-columns:12px ${Array(cols).fill('1fr').join(' ')};gap:2px">`;
    dows.forEach((dow, di) => {
      html += `<div class="cal-dow">${dow}</div>`;
      for (let w = cols - 1; w >= 0; w--) {
        const daysAgo = w * 7 + di;
        if (daysAgo > days) {
          html += `<div></div>`;
          continue;
        }
        const pnl = (Math.random() > 0.4 ? 1 : -1) * Math.random() * 1200;
        const intensity = Math.min(Math.abs(pnl) / 1200, 0.9);
        const up = pnl >= 0;
        const bg = pnl === 0 ? 'rgba(0,245,255,.03)' : up ? `rgba(0,255,136,${0.1 + intensity * 0.45})` : `rgba(255,51,85,${0.1 + intensity * 0.4})`;
        const border = up ? `rgba(0,255,136,${0.12 + intensity * 0.15})` : `rgba(255,51,85,${0.12 + intensity * 0.15})`;
        const dateStr = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        html += `<div class="cal-cell" style="background:${bg};border:1px solid ${border};aspect-ratio:1;border-radius:2px;min-width:14px;min-height:14px" title="${dateStr}: ${up ? '+' : ''}${Math.round(Math.abs(pnl))}"></div>`;
      }
    });
    html += '</div>';
    
    // Legend
    html += `<div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:6px;font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--text3)">Less`;
    ['rgba(0,245,255,.05)', 'rgba(0,255,136,.15)', 'rgba(0,255,136,.38)', 'rgba(0,255,136,.65)'].forEach(c => {
      html += `<div style="width:10px;height:10px;background:${c};border-radius:2px"></div>`;
    });
    html += `More</div>`;
    
    const container = document.getElementById('calBody');
    if (container) container.innerHTML = html;
  };

  useEffect(() => {
    // Initialize KPI bar animations
    setTimeout(() => {
      document.querySelectorAll('.kfi').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 400);

    // Draw charts
    setTimeout(() => {
      drawPnlChart();
      drawMonthlyChart();
    }, 250);

    // Build dynamic content
    buildAssetBreakdown();
    buildActivityFeed();
    buildCalendar();

    // Handle window resize
    const handleResize = () => {
      drawPnlChart();
      drawMonthlyChart();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Toast Notification */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <div className="toast-icon">{toastData.icon}</div>
        <div>
          <div className="toast-text">{toastData.text}</div>
          <div className="toast-sub">{toastData.sub}</div>
        </div>
      </div>

      <main className="main">
        <div className="page-head fu" style={{ animationDelay: '0s' }}>
          <div>
            <div className="pht">// Performance Reports</div>
            <div className="phsub">// TRADING ANALYTICS · P&L STATEMENTS · TAX DOCUMENTS · EXPORT READY</div>
          </div>
          <div className="ph-right">
            <div className="date-range">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="dr-text">Jan 1, 2026<span className="dr-sep">→</span>Mar 10, 2026</span>
            </div>
            <button className="ph-filter-btn" onClick={() => genReport('Performance Report', 'report.pdf', '3.2 MB')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Generate Report
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-title">Total P&L</div>
              <div className="kpi-icon">📈</div>
            </div>
            <div className="kpi-value up">+$18,241</div>
            <div className="kpi-sub up">▲ +21.7% this month</div>
            <div className="kpi-bar">
              <div className="kfi" data-w="72" style={{ background: 'var(--up)' }}></div>
            </div>
          </div>
        </div>

        <div className="reports-grid">
          <div className="chart-panel">
            <div className="panel-header">
              <div className="panel-title">P&L Over Time</div>
              <div className="period-tabs">
                {['1W', '1M', '3M', 'YTD', '1Y'].map(period => (
                  <button 
                    key={period}
                    className={`period-tab ${selectedPeriod === period ? 'active' : ''}`}
                    onClick={() => setPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <canvas ref={pnlChartRef}></canvas>
            </div>
          </div>

          <div className="chart-panel">
            <div className="panel-header">
              <div className="panel-title">Monthly Breakdown</div>
            </div>
            <div className="chart-container">
              <canvas ref={monthlyChartRef}></canvas>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="asset-panel">
            <div className="panel-header">
              <div className="panel-title">Asset Breakdown</div>
            </div>
            <div id="assetBreakdown"></div>
          </div>

          <div className="activity-panel">
            <div className="panel-header">
              <div className="panel-title">Recent Activity</div>
            </div>
            <div id="activityFeed"></div>
          </div>

          <div className="calendar-panel">
            <div className="panel-header">
              <div className="panel-title">Trading Calendar</div>
            </div>
            <div id="calBody"></div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Reports;