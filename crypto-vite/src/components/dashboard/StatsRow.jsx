import React from 'react';
import { useWalletData } from '../../hooks/useWalletData';

const StatsRow = () => {
  const { portfolio, wallets, loading } = useWalletData();

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const getBiggestHolding = () => {
    if (!portfolio?.breakdown || portfolio.breakdown.length === 0) return null;
    return portfolio.breakdown.reduce((max, current) => 
      parseFloat(current.percentage) > parseFloat(max.percentage) ? current : max
    );
  };

  const getWalletCount = () => {
    return wallets?.length || 0;
  };

  const getTotalBalance = () => {
    return portfolio?.total_value || '0.00000000';
  };

  const biggestHolding = getBiggestHolding();

  const stats = [
    { 
      label: 'Total Portfolio', 
      value: loading ? 'Loading...' : formatCurrency(getTotalBalance()), 
      sub: `${getWalletCount()} wallets`, 
      subClass: 'stat-neutral', 
      valueClass: 'stat-accent', 
      tip: 'Total portfolio value' 
    },
    { 
      label: 'Biggest Holding', 
      value: loading ? 'Loading...' : (biggestHolding ? biggestHolding.cryptocurrency : 'N/A'), 
      sub: biggestHolding ? `${parseFloat(biggestHolding.percentage).toFixed(1)}% of portfolio` : 'No holdings', 
      subClass: 'stat-neutral',
      tip: 'Largest position by value' 
    },
    { 
      label: 'Available Cash', 
      value: loading ? 'Loading...' : formatCurrency(
        wallets?.find(w => w.cryptocurrency === 'USD')?.available_balance || '0'
      ), 
      sub: 'USD balance', 
      valueClass: 'stat-gold', 
      tip: 'Available USD for trading' 
    },
    { 
      label: 'Active Wallets', 
      value: loading ? 'Loading...' : getWalletCount().toString(), 
      sub: 'Cryptocurrencies', 
      subClass: 'stat-neutral', 
      tip: 'Number of active wallets' 
    },
  ];

  return (
    <div className="stats-row">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card tooltip" data-tip={stat.tip}>
          <div className="stat-label">{stat.label}</div>
          <div className={`stat-value ${stat.valueClass || ''}`}>{stat.value}</div>
          <div className={`stat-sub ${stat.subClass || ''}`}>{stat.sub}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
