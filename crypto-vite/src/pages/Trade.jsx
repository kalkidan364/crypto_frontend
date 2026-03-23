import { useState, useEffect, useRef } from "react";
import { useOrderBook } from "../hooks/useOrderBook";
import { useTradingData } from "../hooks/useTradingData";
import { marketAPI } from "../utils/api";
import PriceTicker from "../components/trading/PriceTicker";
import "../styles/pages/trade.css";

function Trade() {
  // Trading state
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [orderType, setOrderType] = useState("market"); // market, limit, stop-loss, take-profit
  const [tradeType, setTradeType] = useState("buy"); // buy, sell
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  
  // Chart and market data
  const [selectedTime, setSelectedTime] = useState("30");
  const [currentPrice, setCurrentPrice] = useState("0.00");
  const [priceChange, setPriceChange] = useState(0);
  const [volume, setVolume] = useState("0");
  const [high, setHigh] = useState("0");
  const [low, setLow] = useState("0");
  const chartContainerRef = useRef(null);
  
  // Trading data
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orderbook"); // orderbook, trades, positions, history
  const [leftSidebarTab, setLeftSidebarTab] = useState("markets"); // markets, watchlist, portfolio
  
  // Hooks
  const { orderBook, loading: orderBookLoading } = useOrderBook(selectedCrypto);
  const { 
    openOrders, 
    tradeHistory, 
    positions, 
    wallets, 
    loading: tradingLoading,
    cancelOrder: cancelTradingOrder,
    placeOrder: placeTradingOrder
  } = useTradingData();

 const timeframes = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1d", value: "1D" },
];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const cryptoResponse = await marketAPI.getCryptocurrencies();
      
      if (cryptoResponse.success) {
        setCryptocurrencies(cryptoResponse.data);
        // Set default watchlist
        setWatchlist(cryptoResponse.data.slice(0, 10));
      } else {
        // Use mock data if API fails
        const mockCryptos = [
          { symbol: 'BTC', name: 'Bitcoin', current_price: 50000, price_change_24h: 2.5 },
          { symbol: 'ETH', name: 'Ethereum', current_price: 3000, price_change_24h: -1.2 },
          { symbol: 'ADA', name: 'Cardano', current_price: 0.5, price_change_24h: 5.8 },
          { symbol: 'DOT', name: 'Polkadot', current_price: 8, price_change_24h: -2.1 },
          { symbol: 'LINK', name: 'Chainlink', current_price: 15, price_change_24h: 3.4 },
          { symbol: 'UNI', name: 'Uniswap', current_price: 7, price_change_24h: -0.8 },
          { symbol: 'LTC', name: 'Litecoin', current_price: 100, price_change_24h: 1.9 },
          { symbol: 'BCH', name: 'Bitcoin Cash', current_price: 300, price_change_24h: -3.2 },
          { symbol: 'XRP', name: 'Ripple', current_price: 0.6, price_change_24h: 4.1 },
          { symbol: 'BNB', name: 'Binance Coin', current_price: 400, price_change_24h: 2.8 }
        ];
        setCryptocurrencies(mockCryptos);
        setWatchlist(mockCryptos.slice(0, 5));
      }
    } catch (err) {
      setError(err.message);
      // Use mock data as fallback
      const mockCryptos = [
        { symbol: 'BTC', name: 'Bitcoin', current_price: 50000, price_change_24h: 2.5 },
        { symbol: 'ETH', name: 'Ethereum', current_price: 3000, price_change_24h: -1.2 },
        { symbol: 'ADA', name: 'Cardano', current_price: 0.5, price_change_24h: 5.8 },
        { symbol: 'DOT', name: 'Polkadot', current_price: 8, price_change_24h: -2.1 },
        { symbol: 'LINK', name: 'Chainlink', current_price: 15, price_change_24h: 3.4 }
      ];
      setCryptocurrencies(mockCryptos);
      setWatchlist(mockCryptos.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  // Initialize TradingView Widget
  useEffect(() => {
    if (chartContainerRef.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${selectedCrypto}USDT`,
            interval: selectedTime,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0f0f1e",
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            container_id: "tradingview_chart",
            backgroundColor: "#0f0f1e",
            gridColor: "#1a1a2e",
            studies: ["Volume@tv-basicstudies", "RSI@tv-basicstudies", "MACD@tv-basicstudies"],
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            withdateranges: true,
            details: true,
            hotlist: true,
            calendar: false,
          });
        }
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [selectedTime, selectedCrypto]);

  // Connect to Binance WebSocket for live price updates
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCrypto.toLowerCase()}usdt@ticker`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c).toFixed(2));
      setPriceChange(parseFloat(data.P).toFixed(2));
      setVolume(parseFloat(data.v).toFixed(0));
      setHigh(parseFloat(data.h).toFixed(2));
      setLow(parseFloat(data.l).toFixed(2));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [selectedCrypto]);

  // Trading functions
  const handlePlaceOrder = async () => {
    if (!amount || (orderType !== 'market' && !price)) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        cryptocurrency: selectedCrypto,
        type: tradeType,
        order_type: orderType,
        quantity: parseFloat(amount),
        ...(orderType !== 'market' && { price: parseFloat(price) }),
        ...(orderType === 'stop-loss' && { stop_price: parseFloat(stopPrice) }),
        ...(orderType === 'take-profit' && { take_profit_price: parseFloat(takeProfitPrice) })
      };

      const response = await placeTradingOrder(orderData);
      if (response.success) {
        setAmount('');
        setPrice('');
        setStopPrice('');
        setTakeProfitPrice('');
        setError(null);
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const success = await cancelTradingOrder(orderId);
      if (!success) {
        setError('Failed to cancel order');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addToWatchlist = (crypto) => {
    if (!watchlist.find(item => item.symbol === crypto.symbol)) {
      setWatchlist([...watchlist, crypto]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
  };

  return (
    <div className="advanced-trade-page">
      {/* Left Sidebar - Markets, Watchlist, Portfolio */}
      <div className="trade-left-sidebar">
        <div className="sidebar-tabs">
          <button 
            className={leftSidebarTab === 'markets' ? 'active' : ''}
            onClick={() => setLeftSidebarTab('markets')}
          >
            Markets
          </button>
          <button 
            className={leftSidebarTab === 'watchlist' ? 'active' : ''}
            onClick={() => setLeftSidebarTab('watchlist')}
          >
            Watchlist
          </button>
          <button 
            className={leftSidebarTab === 'portfolio' ? 'active' : ''}
            onClick={() => setLeftSidebarTab('portfolio')}
          >
            Portfolio
          </button>
        </div>

        <div className="sidebar-content">
          {leftSidebarTab === 'markets' && (
            <div className="markets-list">
              <div className="search-box">
                <input type="text" placeholder="Search markets..." />
              </div>
              <div className="market-categories">
                <button className="active">All</button>
                <button>Favorites</button>
                <button>USDT</button>
                <button>BTC</button>
              </div>
              <div className="markets-table">
                <div className="table-header">
                  <span>Pair</span>
                  <span>Price</span>
                  <span>24h%</span>
                </div>
                {cryptocurrencies.slice(0, 20).map((crypto) => (
                  <div 
                    key={crypto.symbol} 
                    className={`market-row ${selectedCrypto === crypto.symbol ? 'selected' : ''}`}
                    onClick={() => setSelectedCrypto(crypto.symbol)}
                  >
                    <div className="pair-info">
                      <span className="symbol">{crypto.symbol}/USDT</span>
                      <span className="name">{crypto.name}</span>
                    </div>
                    <span className="price">${crypto.current_price?.toFixed(2) || '0.00'}</span>
                    <span className={`change ${crypto.price_change_24h >= 0 ? 'positive' : 'negative'}`}>
                      {crypto.price_change_24h >= 0 ? '+' : ''}{crypto.price_change_24h?.toFixed(2) || '0.00'}%
                    </span>
                    <button 
                      className="add-watchlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchlist(crypto);
                      }}
                    >
                      ⭐
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leftSidebarTab === 'watchlist' && (
            <div className="watchlist">
              <div className="watchlist-header">
                <h3>My Watchlist</h3>
                <span>{watchlist.length} pairs</span>
              </div>
              {watchlist.map((crypto) => (
                <div 
                  key={crypto.symbol} 
                  className={`watchlist-item ${selectedCrypto === crypto.symbol ? 'selected' : ''}`}
                  onClick={() => setSelectedCrypto(crypto.symbol)}
                >
                  <div className="crypto-info">
                    <span className="symbol">{crypto.symbol}</span>
                    <span className="price">${crypto.current_price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="crypto-stats">
                    <span className={`change ${crypto.price_change_24h >= 0 ? 'positive' : 'negative'}`}>
                      {crypto.price_change_24h >= 0 ? '+' : ''}{crypto.price_change_24h?.toFixed(2) || '0.00'}%
                    </span>
                    <button 
                      className="remove-watchlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(crypto.symbol);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {leftSidebarTab === 'portfolio' && (
            <div className="portfolio-overview">
              <div className="portfolio-summary">
                <h3>Portfolio Balance</h3>
                <div className="total-balance">
                  <span className="amount">$0.00</span>
                  <span className="change positive">+0.00%</span>
                </div>
              </div>
              <div className="portfolio-assets">
                {wallets.map((wallet) => (
                  <div key={wallet.cryptocurrency} className="asset-item">
                    <div className="asset-info">
                      <span className="symbol">{wallet.cryptocurrency}</span>
                      <span className="balance">{wallet.balance}</span>
                    </div>
                    <div className="asset-value">
                      <span className="usd-value">$0.00</span>
                      <span className="percentage">0%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="trade-main-content">
        {/* Price Ticker */}
        <PriceTicker 
          symbol={selectedCrypto}
          pair="USDT"
          exchange="Binance"
        />

        {/* Timeframe Controls */}
        <div className="advanced-timeframe">
          <div className="timeframe-buttons">
            {timeframes.map((time) => (
              <button
                key={time.value}
                className={`tf-btn ${selectedTime === time.value ? "active" : ""}`}
                onClick={() => setSelectedTime(time.value)}
              >
                {time.label}
              </button>
            ))}
          </div>
          <div className="chart-tools">
            <button className="tool-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Indicators
            </button>
            <button className="tool-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Drawing
            </button>
            <button className="tool-btn">⚙️</button>
          </div>
        </div>

        {/* Chart */}
        <div className="advanced-chart" ref={chartContainerRef}>
          <div id="tradingview_chart" className="tradingview-widget"></div>
        </div>

        {/* Trading Panel */}
        <div className="advanced-trading-panel">
          <div className="trading-tabs">
            <button 
              className={tradeType === 'buy' ? 'active buy' : 'buy'}
              onClick={() => setTradeType('buy')}
            >
              Buy {selectedCrypto}
            </button>
            <button 
              className={tradeType === 'sell' ? 'active sell' : 'sell'}
              onClick={() => setTradeType('sell')}
            >
              Sell {selectedCrypto}
            </button>
          </div>

          <div className="order-type-selector">
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
              <option value="stop-loss">Stop Loss</option>
              <option value="take-profit">Take Profit</option>
            </select>
          </div>

          <div className="trading-inputs">
            {orderType !== 'market' && (
              <div className="input-group">
                <label>Price (USDT)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            {orderType === 'stop-loss' && (
              <div className="input-group">
                <label>Stop Price (USDT)</label>
                <input
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            {orderType === 'take-profit' && (
              <div className="input-group">
                <label>Take Profit Price (USDT)</label>
                <input
                  type="number"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="input-group">
              <label>Amount ({selectedCrypto})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <div className="percentage-buttons">
                <button onClick={() => setAmount((parseFloat(amount) || 0) * 0.25)}>25%</button>
                <button onClick={() => setAmount((parseFloat(amount) || 0) * 0.5)}>50%</button>
                <button onClick={() => setAmount((parseFloat(amount) || 0) * 0.75)}>75%</button>
                <button onClick={() => setAmount((parseFloat(amount) || 0) * 1)}>100%</button>
              </div>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Total:</span>
                <span>{(parseFloat(amount) || 0) * (parseFloat(price) || parseFloat(currentPrice) || 0)} USDT</span>
              </div>
              <div className="summary-row">
                <span>Fee:</span>
                <span>0.1%</span>
              </div>
            </div>

            <button 
              className={`place-order-btn ${tradeType}`}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `${tradeType.toUpperCase()} ${selectedCrypto}`}
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Order Book, Trades, Positions */}
      <div className="trade-right-sidebar">
        <div className="sidebar-tabs">
          <button 
            className={activeTab === 'orderbook' ? 'active' : ''}
            onClick={() => setActiveTab('orderbook')}
          >
            Order Book
          </button>
          <button 
            className={activeTab === 'trades' ? 'active' : ''}
            onClick={() => setActiveTab('trades')}
          >
            Recent Trades
          </button>
          <button 
            className={activeTab === 'positions' ? 'active' : ''}
            onClick={() => setActiveTab('positions')}
          >
            Positions
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="sidebar-content">
          {activeTab === 'orderbook' && (
            <div className="order-book">
              <div className="order-book-header">
                <span>Price (USDT)</span>
                <span>Amount ({selectedCrypto})</span>
                <span>Total</span>
              </div>
              
              <div className="asks-section">
                <div className="section-header">
                  <span className="asks-label">Asks</span>
                  <span className="spread">Spread: {orderBook.spread || '0.00'}</span>
                </div>
                {orderBookLoading ? (
                  <div className="loading">Loading...</div>
                ) : (
                  orderBook.asks?.slice(0, 10).map((ask, index) => (
                    <div key={index} className="order-row ask">
                      <span className="price">{ask.price?.toFixed(2)}</span>
                      <span className="amount">{ask.amount?.toFixed(6)}</span>
                      <span className="total">{ask.total?.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="current-price">
                <span className={priceChange >= 0 ? 'positive' : 'negative'}>
                  ${currentPrice}
                </span>
              </div>

              <div className="bids-section">
                <div className="section-header">
                  <span className="bids-label">Bids</span>
                </div>
                {orderBookLoading ? (
                  <div className="loading">Loading...</div>
                ) : (
                  orderBook.bids?.slice(0, 10).map((bid, index) => (
                    <div key={index} className="order-row bid">
                      <span className="price">{bid.price?.toFixed(2)}</span>
                      <span className="amount">{bid.amount?.toFixed(6)}</span>
                      <span className="total">{bid.total?.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="recent-trades">
              <div className="trades-header">
                <span>Price (USDT)</span>
                <span>Amount ({selectedCrypto})</span>
                <span>Time</span>
              </div>
              {tradeHistory.slice(0, 20).map((trade, index) => (
                <div key={index} className={`trade-row ${trade.type}`}>
                  <span className="price">{trade.price}</span>
                  <span className="amount">{trade.quantity}</span>
                  <span className="time">{new Date(trade.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="open-orders">
              <div className="orders-header">
                <h3>Open Orders</h3>
                <span>{openOrders.length} orders</span>
              </div>
              {openOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <span className={`order-type ${order.type}`}>{order.type.toUpperCase()}</span>
                    <span className="pair">{order.cryptocurrency}/USDT</span>
                  </div>
                  <div className="order-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span>{order.quantity} {order.cryptocurrency}</span>
                    </div>
                    <div className="detail-row">
                      <span>Price:</span>
                      <span>${order.price}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className={`status ${order.status}`}>{order.status}</span>
                    </div>
                  </div>
                  <button 
                    className="cancel-order"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="trade-history">
              <div className="history-header">
                <h3>Trade History</h3>
                <span>{tradeHistory.length} trades</span>
              </div>
              {tradeHistory.map((trade) => (
                <div key={trade.id} className="history-item">
                  <div className="trade-info">
                    <span className={`trade-type ${trade.type}`}>{trade.type.toUpperCase()}</span>
                    <span className="pair">{trade.cryptocurrency}/USDT</span>
                    <span className="time">{new Date(trade.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="trade-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span>{trade.quantity} {trade.cryptocurrency}</span>
                    </div>
                    <div className="detail-row">
                      <span>Price:</span>
                      <span>${trade.price}</span>
                    </div>
                    <div className="detail-row">
                      <span>Total:</span>
                      <span>${(trade.quantity * trade.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-toast">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default Trade;
