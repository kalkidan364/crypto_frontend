import React, { useEffect, useRef } from 'react';
import { useWalletData } from '../../hooks/useWalletData';

const PortfolioSection = () => {
  const canvasRef = useRef(null);
  const { portfolio, loading, error } = useWalletData();

  // Color mapping for cryptocurrencies
  const getCryptoColor = (symbol) => {
    const colors = {
      'BTC': '#f7931a',
      'ETH': '#627eea', 
      'SOL': '#9945ff',
      'BNB': '#f3ba2f',
      'XRP': '#00aae4',
      'AVAX': '#e84142',
      'USD': '#22c55e',
      'USDT': '#26a17b',
      'USDC': '#2775ca'
    };
    return colors[symbol] || '#00e5ff';
  };

  const drawDonut = () => {
    const canvas = canvasRef.current;
    if (!canvas || !portfolio?.breakdown) return;

    const ctx = canvas.getContext('2d');
    const cx = 50, cy = 50, r = 38, inner = 26;
    let start = -Math.PI / 2;

    // Clear canvas
    ctx.clearRect(0, 0, 100, 100);

    portfolio.breakdown.forEach(item => {
      const angle = (parseFloat(item.percentage) / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.arc(cx, cy, inner, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = getCryptoColor(item.cryptocurrency);
      ctx.fill();
      start += angle + 0.02;
    });
  };

  useEffect(() => {
    if (portfolio) {
      drawDonut();
    }
  }, [portfolio]);

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <div className="portfolio-section">
        <div className="section-header">
          <div className="section-title">Portfolio Allocation</div>
          <a href="#" className="section-action">MANAGE →</a>
        </div>
        <div className="portfolio-grid">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-section">
        <div className="section-header">
          <div className="section-title">Portfolio Allocation</div>
          <a href="#" className="section-action">MANAGE →</a>
        </div>
        <div className="portfolio-grid">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-section">
      <div className="section-header">
        <div className="section-title">Portfolio Allocation</div>
        <a href="#" className="section-action">MANAGE →</a>
      </div>
      <div className="portfolio-grid">
        <div className="donut-wrap">
          <canvas ref={canvasRef} width="100" height="100"></canvas>
          <div className="donut-label">
            <div className="donut-label-val">
              {portfolio ? formatCurrency(portfolio.total_value) : '$0'}
            </div>
            <div className="donut-label-sub">TOTAL</div>
          </div>
        </div>
        <div className="portfolio-list">
          {portfolio?.breakdown?.map((item, index) => (
            <div key={index} className="portfolio-item">
              <div 
                className="portfolio-dot" 
                style={{ background: getCryptoColor(item.cryptocurrency) }}
              ></div>
              <div className="portfolio-name">{item.cryptocurrency}</div>
              <div className="portfolio-pct">{parseFloat(item.percentage).toFixed(1)}%</div>
            </div>
          )) || (
            <div className="portfolio-item">
              <div className="portfolio-name">No portfolio data</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSection;
