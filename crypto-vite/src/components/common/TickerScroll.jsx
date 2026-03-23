import React from 'react';

const TickerScroll = () => {
  const tickerData = [
    { symbol: 'BTC', price: '$67,342.5', change: '+1.10%', isUp: true },
    { symbol: 'ETH', price: '$3,541.2', change: '+2.34%', isUp: true },
    { symbol: 'BNB', price: '$172.85', change: '-0.62%', isUp: false },
    { symbol: 'AVAX', price: '$35.42', change: '+3.12%', isUp: true },
    { symbol: 'BTC', price: '$67,342.5', change: '+1.60%', isUp: true },
    { symbol: 'ETH', price: '$3,541.2', change: '+2.34%', isUp: true },
    { symbol: 'SOL', price: '$172.85', change: '-0.62%', isUp: false },
    { symbol: 'BNB', price: '$412.3', change: '+0.45%', isUp: true }
  ];

  return (
    <div className="ticker-scroll-container">
      <div className="ticker-scroll-inner">
        {tickerData.map((item, index) => (
          <div key={index} className="ticker-item-new">
            <span className="ticker-symbol-new">{item.symbol}</span>
            <span className="ticker-price-new">{item.price}</span>
            <span className={`ticker-change-new ${item.isUp ? 'positive' : 'negative'}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerScroll;