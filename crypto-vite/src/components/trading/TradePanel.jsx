import React, { useState, useEffect } from 'react';
import { useLivePrice } from '../../hooks/useLivePrice';
import { formatPrice } from '../../utils/formatters';

const TradePanel = () => {
  const livePrice = useLivePrice(67842.50);
  const [tradeMode, setTradeMode] = useState('buy');
  const [price, setPrice] = useState('67,842.50');
  const [amount, setAmount] = useState('0.00000');
  const [total, setTotal] = useState('0.00');
  const [fee, setFee] = useState('0.00');

  const calculateTotal = () => {
    const p = parseFloat(price.replace(/,/g, '')) || 0;
    const a = parseFloat(amount) || 0;
    const t = p * a;
    setTotal(t.toFixed(2));
    setFee((t * 0.001).toFixed(2));
  };

  useEffect(() => {
    setPrice(formatPrice(livePrice).replace('$', ''));
  }, [livePrice]);

  useEffect(() => {
    calculateTotal();
  }, [price, amount, calculateTotal]);

  const setPct = (pct) => {
    const maxAmount = 1.2341;
    const amt = (pct / 100 * maxAmount).toFixed(5);
    setAmount(amt);
  };

  return (
    <div className="trade-panel modern">
      <div className="trade-tabs modern">
        <div
          className={`trade-tab buy modern ${tradeMode === 'buy' ? 'active-buy' : ''}`}
          onClick={() => setTradeMode('buy')}
        >
          <div className="tab-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/>
            </svg>
            BUY
          </div>
        </div>
        <div
          className={`trade-tab sell modern ${tradeMode === 'sell' ? 'active-sell' : ''}`}
          onClick={() => setTradeMode('sell')}
        >
          <div className="tab-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/>
            </svg>
            SELL
          </div>
        </div>
      </div>

      <div className="trade-body modern">
        <div className="trade-input-group modern">
          <div className="trade-input-label">Price (USDT)</div>
          <div className="trade-input-wrap modern">
            <input
              type="text"
              className="trade-input modern"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span className="trade-input-unit modern">USDT</span>
          </div>
        </div>

        <div className="trade-input-group modern">
          <div className="trade-input-label">Amount (BTC)</div>
          <div className="trade-input-wrap modern">
            <input
              type="text"
              className="trade-input modern"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="trade-input-unit modern">BTC</span>
          </div>
        </div>

        <div className="trade-slider-row modern">
          <button className="pct-btn modern" onClick={() => setPct(25)}>25%</button>
          <button className="pct-btn modern" onClick={() => setPct(50)}>50%</button>
          <button className="pct-btn modern" onClick={() => setPct(75)}>75%</button>
          <button className="pct-btn modern" onClick={() => setPct(100)}>MAX</button>
        </div>

        <div className="trade-info modern">
          <div className="trade-info-row modern">
            <span className="info-label">Available</span>
            <span className="info-value">1.2341 BTC</span>
          </div>
          <div className="trade-info-row modern">
            <span className="info-label">Total</span>
            <span className="info-value highlight">{total} USDT</span>
          </div>
          <div className="trade-info-row modern">
            <span className="info-label">Fee (0.1%)</span>
            <span className="info-value">{fee} USDT</span>
          </div>
        </div>

        <button className={`trade-btn-modern ${tradeMode === 'buy' ? 'trade-btn-buy' : 'trade-btn-sell'}`}>
          <div className="btn-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/>
            </svg>
            {tradeMode === 'buy' ? 'BUY BTC' : 'SELL BTC'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default TradePanel;
