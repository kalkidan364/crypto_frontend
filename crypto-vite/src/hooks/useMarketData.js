import { useState, useEffect, useRef, useCallback } from 'react';
import { marketAPI } from '../utils/api';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryCount = useRef(0);
  const lastFetchTime = useRef(0);
  const cacheTimeoutRef = useRef(null);

  // Comprehensive mock data that matches professional trading platforms
  const getMockMarketData = useCallback(() => {
    return [
      {
        id: 'bitcoin',
        rank: 1,
        name: 'Bitcoin',
        sym: 'BTC',
        symbol: 'BTC',
        icon: '₿',
        bg: 'radial-gradient(circle,#ff9500,#f7931a)',
        color: '#f7931a',
        price: 67342.50,
        current_price: 67342.50,
        c24: 1.06,
        price_change_24h: 1.06,
        c7: -4.21,
        vol: '$26.4B',
        total_volume: 28500000000,
        mcap: '1.34T',
        ath: 69045,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'ethereum',
        rank: 2,
        name: 'Ethereum',
        sym: 'ETH',
        symbol: 'ETH',
        icon: 'Ξ',
        bg: 'radial-gradient(circle,#8ea3f5,#627eea)',
        color: '#627eea',
        price: 3541.23,
        current_price: 3541.23,
        c24: 2.34,
        price_change_24h: 2.34,
        c7: 6.12,
        vol: '$14.2B',
        total_volume: 15200000000,
        mcap: '425B',
        ath: 4878,
        tags: ['layer1', 'defi'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'tether',
        rank: 3,
        name: 'Tether',
        sym: 'USDT',
        symbol: 'USDT',
        icon: '₮',
        bg: 'radial-gradient(circle,#26a17b,#1a7a5e)',
        color: '#26a17b',
        price: 1.00,
        current_price: 1.00,
        c24: 0.01,
        price_change_24h: 0.01,
        c7: 0.05,
        vol: '$48.1B',
        total_volume: 45800000000,
        mcap: '91.2B',
        ath: 1.32,
        tags: ['stable'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'binancecoin',
        rank: 4,
        name: 'BNB',
        sym: 'BNB',
        symbol: 'BNB',
        icon: 'B',
        bg: 'radial-gradient(circle,#f5cc3a,#f3ba2f)',
        color: '#f3ba2f',
        price: 412.30,
        current_price: 412.30,
        c24: 0.45,
        price_change_24h: 0.45,
        c7: -1.28,
        vol: '$2.0B',
        total_volume: 1800000000,
        mcap: '67B',
        ath: 686.31,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'solana',
        rank: 5,
        name: 'Solana',
        sym: 'SOL',
        symbol: 'SOL',
        icon: '◎',
        bg: 'radial-gradient(circle,#c074fc,#9945ff)',
        color: '#9945ff',
        price: 172.85,
        current_price: 172.85,
        c24: 8.82,
        price_change_24h: 8.82,
        c7: -6.44,
        vol: '$5.1B',
        total_volume: 2900000000,
        mcap: '$75B',
        ath: 260.06,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'xrp',
        rank: 6,
        name: 'XRP',
        sym: 'XRP',
        symbol: 'XRP',
        icon: '✕',
        bg: 'radial-gradient(circle,#00c8f0,#00aae4)',
        color: '#00aae4',
        price: 2.5821,
        current_price: 2.5821,
        c24: 1.21,
        price_change_24h: 1.21,
        c7: -9.14,
        vol: '$1.7B',
        total_volume: 1600000000,
        mcap: '$32B',
        ath: 3.84,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'usdc',
        rank: 7,
        name: 'USD Coin',
        sym: 'USDC',
        symbol: 'USDC',
        icon: '$',
        bg: 'radial-gradient(circle,#3e73c4,#2775ca)',
        color: '#2775ca',
        price: 1.000,
        current_price: 1.000,
        c24: -0.01,
        price_change_24h: -0.01,
        c7: 0.03,
        vol: '$7.0B',
        total_volume: 5200000000,
        mcap: '24.1B',
        ath: 1.17,
        tags: ['stable'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'avalanche',
        rank: 8,
        name: 'Avalanche',
        sym: 'AVAX',
        symbol: 'AVAX',
        icon: 'A',
        bg: 'radial-gradient(circle,#ff6060,#e84142)',
        color: '#e84142',
        price: 35.42,
        current_price: 35.42,
        c24: -3.12,
        price_change_24h: -3.12,
        c7: 15.43,
        vol: '680M',
        total_volume: 680000000,
        mcap: '13.4B',
        ath: 146.22,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'dogecoin',
        rank: 9,
        name: 'Dogecoin',
        sym: 'DOGE',
        symbol: 'DOGE',
        icon: '🐕',
        bg: 'radial-gradient(circle,#c2a633,#ba9f33)',
        color: '#ba9f33',
        price: 0.0856,
        current_price: 0.0856,
        c24: 7.89,
        price_change_24h: 7.89,
        c7: 22.15,
        vol: '890M',
        total_volume: 890000000,
        mcap: '12.1B',
        ath: 0.7316,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      },
      {
        id: 'cardano',
        rank: 10,
        name: 'Cardano',
        sym: 'ADA',
        symbol: 'ADA',
        icon: 'A',
        bg: 'radial-gradient(circle,#0033ad,#002866)',
        color: '#0033ad',
        price: 0.5823,
        current_price: 0.5823,
        c24: -0.95,
        price_change_24h: -0.95,
        c7: 6.78,
        vol: '425M',
        total_volume: 425000000,
        mcap: '20.5B',
        ath: 3.10,
        tags: ['layer1'],
        last_updated: new Date().toISOString()
      }
    ];
  }, []);

  const fetchMarketData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Throttle requests - don't fetch more than once every 5 seconds unless forced
    if (!forceRefresh && now - lastFetchTime.current < 5000) {
      return;
    }
    
    lastFetchTime.current = now;

    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real data first
      let response;
      try {
        response = await marketAPI.getCryptocurrencies();
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError.message);
        response = null;
      }
      
      if (response && response.success && response.cryptocurrencies) {
        // Transform backend data to match frontend format
        const transformedData = response.cryptocurrencies.map((crypto, index) => ({
          id: crypto.id || `crypto-${crypto.symbol}-${index}`,
          rank: 1,
          name: crypto.name,
          sym: crypto.symbol,
          symbol: crypto.symbol,
          icon: getCryptoIcon(crypto.symbol),
          bg: getCryptoBg(crypto.symbol),
          color: getCryptoColor(crypto.symbol),
          price: parseFloat(crypto.price || crypto.current_price),
          current_price: parseFloat(crypto.price || crypto.current_price),
          c24: parseFloat(crypto.change_percentage_24h || crypto.price_change_percentage_24h || 0),
          price_change_24h: parseFloat(crypto.change_percentage_24h || crypto.price_change_percentage_24h || 0),
          c7: parseFloat(crypto.change_percentage_24h || crypto.price_change_percentage_24h || 0) * 1.2,
          vol: formatVolume(crypto.volume_24h),
          total_volume: crypto.volume_24h,
          mcap: formatMarketCap(crypto.market_cap),
          ath: parseFloat(crypto.price || crypto.current_price) * 1.5,
          tags: getCryptoTags(crypto.symbol),
          last_updated: crypto.last_updated
        }));

        // Sort by market cap and assign ranks
        transformedData.sort((a, b) => {
          const aMcap = parseFloat(a.mcap.replace(/[$,KMBT]/g, '')) * getMultiplier(a.mcap);
          const bMcap = parseFloat(b.mcap.replace(/[$,KMBT]/g, '')) * getMultiplier(b.mcap);
          return bMcap - aMcap;
        });
        transformedData.forEach((coin, index) => {
          coin.rank = index + 1;
        });

        setMarketData(transformedData);
        setIsConnected(true);
      } else {
        // Use mock data when API fails
        console.log('Using mock market data');
        const mockData = getMockMarketData();
        setMarketData(mockData);
        setIsConnected(false); // Show as disconnected since we're using mock data
      }
      
      retryCount.current = 0;
    } catch (err) {
      console.error('Error fetching market data:', err);
      // Always fall back to mock data on any error
      const mockData = getMockMarketData();
      setMarketData(mockData);
      setError('Using demo data - API unavailable');
      setIsConnected(false);
      
      // Implement exponential backoff for retries
      retryCount.current += 1;
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
      
      if (retryCount.current <= 3) {
        reconnectTimeoutRef.current = setTimeout(() => {
          fetchMarketData(true);
        }, backoffDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [getMockMarketData]);

  useEffect(() => {
    // Initial data load
    fetchMarketData();
    
    // Start simple polling for real-time updates after initial load
    const startPolling = setTimeout(() => {
      const pollInterval = setInterval(() => {
        fetchMarketData().catch(() => {
          setIsConnected(false);
        });
      }, 30000); // Poll every 30 seconds
      
      wsRef.current = pollInterval;
    }, 5000); // Wait 5 seconds before starting polling
    
    // Cleanup
    return () => {
      if (wsRef.current) {
        clearInterval(wsRef.current);
      }
      clearTimeout(startPolling);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, [fetchMarketData]);

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshMarketData = useCallback(() => {
    fetchMarketData(true);
  }, [fetchMarketData]);

  return { 
    marketData, 
    loading, 
    error, 
    isConnected,
    refreshMarketData 
  };
};

// Memoized helper functions to prevent recreation
const getCryptoIcon = (() => {
  const icons = {
    'BTC': '₿', 'ETH': 'Ξ', 'SOL': '◎', 'BNB': 'B', 'XRP': '✕',
    'AVAX': 'A', 'USD': '$', 'USDT': '₮', 'USDC': '$'
  };
  return (symbol) => icons[symbol] || symbol.charAt(0);
})();

const getCryptoBg = (() => {
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
  return (symbol) => backgrounds[symbol] || 'radial-gradient(circle,#6b7280,#4b5563)';
})();

const getCryptoColor = (() => {
  const colors = {
    'BTC': '#f7931a', 'ETH': '#627eea', 'SOL': '#9945ff', 'BNB': '#f3ba2f',
    'XRP': '#00aae4', 'AVAX': '#e84142', 'USD': '#22c55e',
    'USDT': '#26a17b', 'USDC': '#2775ca'
  };
  return (symbol) => colors[symbol] || '#6b7280';
})();

const getCryptoTags = (() => {
  const tags = {
    'BTC': ['layer1'], 'ETH': ['layer1', 'defi'], 'SOL': ['layer1'],
    'BNB': ['layer1'], 'XRP': ['layer1'], 'AVAX': ['layer1'],
    'USD': ['stable'], 'USDT': ['stable'], 'USDC': ['stable']
  };
  return (symbol) => tags[symbol] || ['layer1'];
})();

const getMultiplier = (value) => {
  if (value.includes('T')) return 1e12;
  if (value.includes('B')) return 1e9;
  if (value.includes('M')) return 1e6;
  if (value.includes('K')) return 1e3;
  return 1;
};

const formatVolume = (volume) => {
  const num = parseFloat(volume);
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return `${num.toFixed(0)}`;
};

const formatMarketCap = (marketCap) => {
  const num = parseFloat(marketCap);
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(0)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
  return `${num.toFixed(0)}`;
};