import { useState, useEffect } from 'react';
import { marketAPI } from '../utils/api';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await marketAPI.getCryptocurrencies();
      
      if (response.success) {
        // Transform backend data to match frontend format
        const transformedData = response.cryptocurrencies.map(crypto => ({
          rank: 1, // Will be set based on market cap
          name: crypto.name,
          sym: crypto.symbol,
          icon: getCryptoIcon(crypto.symbol),
          bg: getCryptoBg(crypto.symbol),
          color: getCryptoColor(crypto.symbol),
          price: parseFloat(crypto.current_price),
          c24: parseFloat(crypto.price_change_percentage_24h || 0),
          c7: parseFloat(crypto.price_change_percentage_24h || 0) * 1.2, // Approximate 7d from 24h
          vol: formatVolume(crypto.volume_24h),
          mcap: formatMarketCap(crypto.market_cap),
          ath: parseFloat(crypto.current_price) * 1.5, // Approximate ATH
          tags: getCryptoTags(crypto.symbol),
          last_updated: crypto.last_updated
        }));

        // Sort by market cap and assign ranks
        transformedData.sort((a, b) => parseFloat(b.mcap.replace(/[$,]/g, '')) - parseFloat(a.mcap.replace(/[$,]/g, '')));
        transformedData.forEach((coin, index) => {
          coin.rank = index + 1;
        });

        setMarketData(transformedData);
      } else {
        setError('Failed to fetch market data');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Update market data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { marketData, loading, error, refreshMarketData: fetchMarketData };
};

// Helper functions
const getCryptoIcon = (symbol) => {
  const icons = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'SOL': '◎',
    'BNB': 'B',
    'XRP': '✕',
    'AVAX': 'A',
    'USD': '$',
    'USDT': '₮',
    'USDC': '$'
  };
  return icons[symbol] || symbol.charAt(0);
};

const getCryptoBg = (symbol) => {
  const backgrounds = {
    'BTC': 'radial-gradient(circle,#ff9500,#f7931a)',
    'ETH': 'radial-gradient(circle,#8ea3f5,#627eea)',
    'SOL': 'radial-gradient(circle,#c074fc,#9945ff)',
    'BNB': 'radial-gradient(circle,#f5cc3a,#f3ba2f)',
    'XRP': 'radial-gradient(circle,#00c8f0,#00aae4)',
    'AVAX': 'radial-gradient(circle,#ff6060,#e84142)',
    'USD': 'radial-gradient(circle,#22c55e,#16a34a)',
    'USDT': 'radial-gradient(circle,#26a17b,#1a7a5e)',
    'USDC': 'radial-gradient(circle,#3e73c4,#2775ca)'
  };
  return backgrounds[symbol] || 'radial-gradient(circle,#6b7280,#4b5563)';
};

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
  return colors[symbol] || '#6b7280';
};

const getCryptoTags = (symbol) => {
  const tags = {
    'BTC': ['layer1'],
    'ETH': ['layer1', 'defi'],
    'SOL': ['layer1'],
    'BNB': ['layer1'],
    'XRP': ['layer1'],
    'AVAX': ['layer1'],
    'USD': ['stable'],
    'USDT': ['stable'],
    'USDC': ['stable']
  };
  return tags[symbol] || ['layer1'];
};

const formatVolume = (volume) => {
  const num = parseFloat(volume);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

const formatMarketCap = (marketCap) => {
  const num = parseFloat(marketCap);
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(0)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  return `$${num.toFixed(0)}`;
};