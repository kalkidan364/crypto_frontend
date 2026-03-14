import { useState, useEffect, useRef } from 'react';
import { useOrderBook } from '../hooks/useOrderBook';
import { useTradingData } from '../hooks/useTradingData';
import { useMarketData } from '../hooks/useMarketData';
import '../styles/components/trade.css';

const Trade = () => {
  const { marketData, loading: marketLoading } = useMarketData();
  const [selectedPair, setSelectedPair] = useState('BTC');
  const { orderBook, loading: orderBookLoading } = useOrderBook(selectedPair);
  const { orders, placeOrder, cancelOrder, loading: tradingLoading } = useTradingData();
  
  const mainChartRef = useRef(null);
  const depthChartRef = useRef(null);
  const [tradeMode, setTradeMode] = useState('buy');
  const [orderType, setOrderType] = useState('Limit');
  const [activeTF, setActiveTF] = useState('4H');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('0.00000');
  const [total, setTotal] = useState('0.00');
  const [pct, setPct] = useState(100);
  const [candles, setCandles] = useState([]);
  const [orderMessage, setOrderMessage] = useState('');

  // Get current pair data from market data
  const activePair = marketData.find(coin => coin.sym === selectedPair) || {
    sym: selectedPair,
    name: selectedPair,
    icon: selectedPair.charAt(0),
    bg: 'radial-gradient(circle,#6b7280,#4b5563)',
    price: 0,
    c24: 0,
    vol: '$0'
  };

  // Set initial price when pair changes
  useEffect(() => {
    if (activePair.price && !price) {
      setPrice(activePair.price.toFixed(2));
    }
  }, [activePair.price, price]);

  const fmtPrice = (p) => {
    return p < 1 ? `$${p.toFixed(4)}` : p < 100 ? `$${p.toFixed(2)}` : `$${p.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const generateCandleData = (n = 120) => {
    const newCandles = [];
    let v = activePair.price * 0.88;
    const now = Date.now();
    for (let i = 0; i < n; i++) {
      const open = v;
      const move = (Math.random() - 0.47) * v * 0.018;
      const close = v + move;
      const high = Math.max(open, close) * (1 + Math.random() * 0.008);
      const low = Math.min(open, close) * (1 - Math.random() * 0.008);
      const vol = Math.random() * 800 + 100;
      newCandles.push({ t: now - (n - i) * 4 * 3600000, o: open, h: high, l: low, c: close, v: vol });
      v = close;
    }
    newCandles[newCandles.length - 1].c = activePair.price;
    return newCandles;
  };

  useEffect(() => {
    if (activePair.price > 0) {
      const candleData = generateCandleData();
      setCandles(candleData);
    }
  }, [activePair.price]); // Only depend on price, not the entire activePair object

  useEffect(() => {
    if (mainChartRef.current && candles.length > 0) {
      drawMainChart();
    }
  }, [candles, activeTF]);

  useEffect(() => {
    if (depthChartRef.current && orderBook.asks && orderBook.bids) {
      drawDepthChart();
    }
  }, [orderBook.asks, orderBook.bids, activePair.price]);

  useEffect(() => {
    const p = parseFloat(price) || activePair.price;
    const amt = parseFloat(amount) || 0;
    const t = p * amt;
    setTotal(t.toFixed(2));
  }, [price, amount, activePair.price]);

  const drawMainChart = () => {
    const canvas = mainChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth;
    const H = canvas.parentElement.clientHeight;
    canvas.width = W;
    canvas.height = H;

    if (!candles.length) return;

    const pad = { l: 56, r: 12, t: 10, b: 44 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b - 36;
    const prices = candles.flatMap(c => [c.h, c.l]);
    const mn = Math.min(...prices) * 0.9994;
    const mx = Math.max(...prices) * 1.0006;
    const volMax = Math.max(...candles.map(c => c.v));

    const tx = i => pad.l + (i + 0.5) / candles.length * cw;
    const ty = v => pad.t + ch - ((v - mn) / (mx - mn)) * ch;
    const cw2 = Math.max(1, (cw / candles.length) * 0.65);

    ctx.fillStyle = '#101418';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(16,185,129,.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.t + ch * (i / 5);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + cw, y);
      ctx.stroke();
    }

    candles.forEach((c, i) => {
      const up = c.c >= c.o;
      const bh = (c.v / volMax) * 30;
      ctx.fillStyle = up ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)';
      ctx.fillRect(tx(i) - cw2 / 2, pad.t + ch + 4, cw2, bh);
    });

    candles.forEach((c, i) => {
      const up = c.c >= c.o;
      const col = up ? '#10b981' : '#ef4444';
      const x = tx(i);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, ty(c.h));
      ctx.lineTo(x, ty(c.l));
      ctx.stroke();
      const bodyTop = ty(Math.max(c.o, c.c));
      const bodyH = Math.max(1, Math.abs(ty(c.o) - ty(c.c)));
      ctx.fillStyle = up ? 'rgba(16,185,129,.9)' : 'rgba(239,68,68,.85)';
      ctx.fillRect(x - cw2 / 2, bodyTop, cw2, bodyH);
    });
  };

  const drawDepthChart = () => {
    const canvas = depthChartRef.current;
    if (!canvas || !orderBook.asks || !orderBook.bids) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth;
    const H = canvas.parentElement.clientHeight;
    canvas.width = W;
    canvas.height = H;

    const base = activePair.price;
    const depthBids = [];
    const depthAsks = [];
    let bcum = 0, acum = 0;
    
    // Use real order book data if available, otherwise generate mock data
    if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
      orderBook.bids.forEach(bid => {
        bcum += bid.amount;
        depthBids.push({ p: bid.price, v: bcum });
      });
      
      orderBook.asks.forEach(ask => {
        acum += ask.amount;
        depthAsks.push({ p: ask.price, v: acum });
      });
    } else {
      // Fallback to mock data
      for (let i = 0; i < 40; i++) {
        bcum += Math.random() * 2 + 0.1;
        depthBids.push({ p: base - (i + 1) * base * 0.001, v: bcum });
        acum += Math.random() * 2 + 0.1;
        depthAsks.push({ p: base + (i + 1) * base * 0.001, v: acum });
      }
    }

    const allPrices = [...depthBids.map(b => b.p), ...depthAsks.map(a => a.p)];
    const mn = Math.min(...allPrices);
    const mx = Math.max(...allPrices);
    const mxVol = Math.max(bcum, acum) * 1.05;

    const tx = p => ((p - mn) / (mx - mn)) * W;
    const ty = v => H - 4 - ((v / mxVol) * (H - 12));

    ctx.fillStyle = '#101418';
    ctx.fillRect(0, 0, W, H);

    const gb = ctx.createLinearGradient(0, 0, 0, H);
    gb.addColorStop(0, 'rgba(16,185,129,.25)');
    gb.addColorStop(1, 'rgba(16,185,129,0)');
    ctx.beginPath();
    ctx.moveTo(tx(depthBids[depthBids.length - 1].p), H);
    [...depthBids].reverse().forEach(b => ctx.lineTo(tx(b.p), ty(b.v)));
    ctx.lineTo(tx(base), H);
    ctx.closePath();
    ctx.fillStyle = gb;
    ctx.fill();

    const ga = ctx.createLinearGradient(0, 0, 0, H);
    ga.addColorStop(0, 'rgba(239,68,68,.25)');
    ga.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.beginPath();
    ctx.moveTo(tx(base), H);
    depthAsks.forEach(a => ctx.lineTo(tx(a.p), ty(a.v)));
    ctx.lineTo(tx(depthAsks[depthAsks.length - 1].p), H);
    ctx.closePath();
    ctx.fillStyle = ga;
    ctx.fill();
  };




  const handlePctClick = (percentage) => {
    setPct(percentage);
    const maxAmt = 1.2341; // This should come from wallet balance
    setAmount((maxAmt * percentage / 100).toFixed(5));
  };

  const handlePlaceOrder = async () => {
    try {
      setOrderMessage('');
      
      const orderData = {
        cryptocurrency_symbol: selectedPair,
        order_type: orderType.toLowerCase(),
        side: tradeMode,
        quantity: amount,
        price: orderType === 'Limit' ? price : undefined
      };

      const result = await placeOrder(orderData);
      
      if (result.success) {
        setOrderMessage(`Order placed successfully! Order ID: ${result.order?.id}`);
        // Reset form
        setAmount('0.00000');
        setTotal('0.00');
        setPct(100);
      } else {
        setOrderMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setOrderMessage(`Error: ${error.message}`);
    }
  };

  // Show loading state
  if (marketLoading) {
    return (
      <main className="main-content">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'var(--text-secondary)'
        }}>
          <div>Loading trading data...</div>
        </div>
      </main>
    );
  }



  return (
    <main className="main-content">
      <div className="trade-container">
        <div className="chart-area">
          <div className="ca-toolbar">
            {['1m', '5m', '15m', '1H', '4H', '1D', '1W'].map(tf => (
              <button 
                key={tf}
                className={`ca-tf ${activeTF === tf ? 'on' : ''}`}
                onClick={() => setActiveTF(tf)}
              >
                {tf}
              </button>
            ))}
            <div className="ca-sep"></div>
            <button className="ca-indicator on">MA</button>
            <button className="ca-indicator">BB</button>
            <button className="ca-indicator">RSI</button>
          </div>
          <div className="chart-wrap">
            <canvas ref={mainChartRef}></canvas>
          </div>
        </div>

        <div className="trade-panel">
          <div className="tp-section">
            <div className="tp-header">
              <div className="tp-pair-selector" style={{ marginBottom: '0.5rem' }}>
                <select 
                  value={selectedPair} 
                  onChange={(e) => setSelectedPair(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {marketData.map(coin => (
                    <option key={coin.sym} value={coin.sym}>
                      {coin.sym}/USDT
                    </option>
                  ))}
                </select>
              </div>
              <div className="tp-pair-info">
                <div className="tp-orb" style={{ background: activePair.bg }}>{activePair.icon}</div>
                <div className="tp-pname">{activePair.sym} / USDT</div>
              </div>
              <div className="bs-tabs">
                <div 
                  className={`bs-tab ${tradeMode === 'buy' ? 'on-buy' : ''}`}
                  onClick={() => setTradeMode('buy')}
                >
                  Buy
                </div>
                <div 
                  className={`bs-tab ${tradeMode === 'sell' ? 'on-sell' : ''}`}
                  onClick={() => setTradeMode('sell')}
                >
                  Sell
                </div>
              </div>
              <div className="order-types">
                {['Limit', 'Market', 'Stop-Limit', 'Stop-Mkt'].map(ot => (
                  <button 
                    key={ot}
                    className={`ot-btn ${orderType === ot ? 'on' : ''}`}
                    onClick={() => setOrderType(ot)}
                  >
                    {ot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="tp-form">
            <div className="tf-row">
              <div className="tf-label">
                <span>Price</span>
                <span>Best: {fmtPrice(activePair.price)}</span>
              </div>
              <div className="tf-field">
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                />
                <span className="tf-unit">USDT</span>
              </div>
            </div>
            
            <div className="tf-row">
              <div className="tf-label">
                <span>Amount</span>
                <span>Avail: 1.2341 {activePair.sym}</span>
              </div>
              <div className="tf-field">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="tf-unit">{activePair.sym}</span>
                <span className="tf-max" onClick={() => handlePctClick(100)}>MAX</span>
              </div>
            </div>

            <div className="tf-row">
              <div className="tf-label"><span>Total</span></div>
              <div className="tf-field">
                <input type="number" value={total} readOnly />
                <span className="tf-unit">USDT</span>
              </div>
            </div>
          </div>

          <div className="tp-actions">
            <div className="pct-row">
              {[25, 50, 75, 100].map(p => (
                <button 
                  key={p}
                  className={`pct-btn ${pct === p ? 'on' : ''}`}
                  onClick={() => handlePctClick(p)}
                >
                  {p}%
                </button>
              ))}
            </div>

            <div className="trade-summary">
              <div className="ts-row">
                <span>Price</span>
                <span>{fmtPrice(parseFloat(price) || activePair.price)}</span>
              </div>
              <div className="ts-row">
                <span>Amount</span>
                <span>{amount} {activePair.sym}</span>
              </div>
              <div className="ts-row">
                <span>Total</span>
                <span>${total}</span>
              </div>
              <div className="ts-row">
                <span>Fee (0.1%)</span>
                <span>${(parseFloat(total) * 0.001).toFixed(2)}</span>
              </div>
            </div>

            <button className={`exec-btn exec-${tradeMode}`} onClick={handlePlaceOrder} disabled={tradingLoading}>
              {tradingLoading ? 'PLACING...' : `${tradeMode === 'buy' ? 'BUY' : 'SELL'} ${activePair.sym}`}
            </button>
            
            {orderMessage && (
              <div className={`order-message ${orderMessage.includes('Error') ? 'error' : 'success'}`} style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: orderMessage.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                color: orderMessage.includes('Error') ? '#ef4444' : '#10b981',
                border: `1px solid ${orderMessage.includes('Error') ? '#ef4444' : '#10b981'}`
              }}>
                {orderMessage}
              </div>
            )}
          </div>

          {/* Order Book Section */}
          <div className="order-book-section" style={{ marginTop: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Order Book</h3>
            {orderBookLoading ? (
              <div style={{ color: 'var(--text-secondary)' }}>Loading order book...</div>
            ) : (
              <div className="order-book-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="asks-section">
                  <h4 style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Asks (Sell Orders)</h4>
                  {orderBook.asks?.slice(0, 10).map((ask, i) => (
                    <div key={i} className="order-row" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      padding: '0.125rem 0'
                    }}>
                      <span style={{ color: '#ef4444' }}>{fmtPrice(ask.price)}</span>
                      <span>{ask.amount}</span>
                      <span>{ask.total}</span>
                    </div>
                  ))}
                </div>
                
                <div className="spread-info" style={{ 
                  textAlign: 'center', 
                  margin: '0.5rem 0',
                  padding: '0.25rem',
                  backgroundColor: 'rgba(107,114,128,0.1)',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  Spread: {orderBook.spread ? `$${orderBook.spread}` : 'N/A'}
                </div>
                
                <div className="bids-section">
                  <h4 style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Bids (Buy Orders)</h4>
                  {orderBook.bids?.slice(0, 10).map((bid, i) => (
                    <div key={i} className="order-row" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      padding: '0.125rem 0'
                    }}>
                      <span style={{ color: '#10b981' }}>{fmtPrice(bid.price)}</span>
                      <span>{bid.amount}</span>
                      <span>{bid.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div className="recent-orders-section" style={{ marginTop: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Recent Orders</h3>
            {orders.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No recent orders</div>
            ) : (
              <div className="orders-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="order-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    marginBottom: '0.25rem',
                    backgroundColor: 'rgba(107,114,128,0.05)',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ color: order.side === 'buy' ? '#10b981' : '#ef4444' }}>
                        {order.side.toUpperCase()}
                      </span>
                      <span style={{ marginLeft: '0.5rem' }}>{order.cryptocurrency_symbol}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {order.quantity} @ {fmtPrice(order.price)}
                    </div>
                    <div>
                      <span className={`status-${order.status}`} style={{
                        color: order.status === 'filled' ? '#10b981' : 
                              order.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                      }}>
                        {order.status}
                      </span>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => cancelOrder(order.id)}
                          style={{
                            marginLeft: '0.5rem',
                            padding: '0.125rem 0.25rem',
                            fontSize: '0.625rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Trade;
