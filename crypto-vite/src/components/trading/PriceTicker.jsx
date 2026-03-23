import { useState, useEffect } from 'react';

const PriceTicker = ({ 
  symbol = 'BTC',
  pair = 'USDT',
  exchange = 'Binance'
}) => {
  const [priceData, setPriceData] = useState({
    price: '0.00',
    change: 0,
    changePercent: 0,
    high: '0.00',
    low: '0.00',
    volume: '0'
  });
  const [priceDirection, setPriceDirection] = useState('neutral');

  useEffect(() => {
    let ws;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}${pair.toLowerCase()}@ticker`);
        
        ws.onopen = () => {
          console.log(`WebSocket connected for ${symbol}/${pair}`);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const newPrice = parseFloat(data.c);
            const oldPrice = parseFloat(priceData.price);
            
            // Determine price direction
            if (newPrice > oldPrice) {
              setPriceDirection('up');
            } else if (newPrice < oldPrice) {
              setPriceDirection('down');
            }
            
            setPriceData({
              price: newPrice.toFixed(2),
              change: parseFloat(data.p).toFixed(2),
              changePercent: parseFloat(data.P).toFixed(2),
              high: parseFloat(data.h).toFixed(2),
              low: parseFloat(data.l).toFixed(2),
              volume: parseFloat(data.v).toFixed(0)
            });

            // Reset direction after animation
            setTimeout(() => setPriceDirection('neutral'), 500);
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        // Fallback to mock data
        generateMockData();
      }
    };

    const generateMockData = () => {
      const basePrice = getBasePriceForSymbol(symbol);
      const mockPrice = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
      const mockChange = (Math.random() - 0.5) * basePrice * 0.05;
      const mockChangePercent = (mockChange / basePrice) * 100;
      
      setPriceData({
        price: mockPrice.toFixed(2),
        change: mockChange.toFixed(2),
        changePercent: mockChangePercent.toFixed(2),
        high: (mockPrice * 1.05).toFixed(2),
        low: (mockPrice * 0.95).toFixed(2),
        volume: Math.floor(Math.random() * 100000).toString()
      });

      // Update mock data every 2 seconds
      setTimeout(generateMockData, 2000);
    };

    const getBasePriceForSymbol = (sym) => {
      const prices = {
        'BTC': 50000,
        'ETH': 3000,
        'ADA': 0.5,
        'DOT': 8,
        'LINK': 15,
        'UNI': 7,
        'LTC': 100,
        'BCH': 300,
        'XRP': 0.6,
        'BNB': 400
      };
      return prices[sym] || 1000;
    };

    // Try WebSocket first, fallback to mock data
    connectWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [symbol, pair]);

  const isPositive = parseFloat(priceData.changePercent) >= 0;

  return (
    <div className="price-ticker">
      <div className="ticker-left">
        <div className="ticker-symbol">
          <span className="symbol-main">{symbol} / {pair}</span>
          <span className="symbol-exchange">{exchange}</span>
        </div>
      </div>
      
      <div className="ticker-center">
        <div className={`ticker-price ${priceDirection} ${isPositive ? 'positive' : 'negative'}`}>
          ${priceData.price}
        </div>
        
        <div className="ticker-stats">
          <div className="stat-item">
            <span className="stat-label">24h High</span>
            <span className="stat-value">${priceData.high}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">24h Low</span>
            <span className="stat-value">${priceData.low}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">24h Change</span>
            <span className={`stat-value ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{priceData.changePercent}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="ticker-right">
        <div className="volume-info">
          <span className="volume-label">24h Volume</span>
          <span className="volume-value">{priceData.volume} {symbol}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;