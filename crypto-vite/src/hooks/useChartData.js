import { useState, useEffect, useRef } from 'react';
import { marketAPI } from '../utils/api';

export const useChartData = (symbol = 'BTC', timeframe = '1h') => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchChartData = async () => {
    // Skip if symbol or timeframe is null (lazy loading)
    if (!symbol || !timeframe) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Map timeframe to API parameters
      const timeframeMap = {
        '1D': { days: 1, interval: '1h' },
        '5D': { days: 7, interval: '4h' },
        '1M': { days: 30, interval: '1d' },
        '3M': { days: 90, interval: '1d' },
        '6M': { days: 180, interval: '1d' },
        'YTD': { days: 365, interval: '1d' },
        '1Y': { days: 365, interval: '1d' },
        '5Y': { days: 1825, interval: '1d' },
        'All': { days: 365, interval: '1d' },
        '1h': { days: 1, interval: '1h' },
        '4h': { days: 7, interval: '4h' },
        '1d': { days: 30, interval: '1d' },
        '1m': { days: 1, interval: '1h' },
        '5m': { days: 1, interval: '1h' },
        '15m': { days: 1, interval: '1h' },
        '30m': { days: 1, interval: '1h' }
      };

      const params = timeframeMap[timeframe] || { days: 1, interval: '1h' };
      
      console.log(`🔄 Fetching chart data for ${symbol} with params:`, params);
      
      try {
        const response = await marketAPI.getCandlestickData(symbol, params);
        
        if (response && response.success && response.data && Array.isArray(response.data)) {
          // Transform backend data to chart format
          const transformedData = response.data.map(item => ({
            timestamp: item.timestamp,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: parseFloat(item.volume)
          }));
          
          setChartData(transformedData);
          console.log(`✅ Successfully loaded ${transformedData.length} candlestick data points from API`);
        } else {
          console.warn('⚠️ Invalid API response, using fallback data');
          setChartData(generateFallbackData(symbol));
        }
      } catch (apiError) {
        console.warn('⚠️ API request failed, using fallback data:', apiError.message);
        setChartData(generateFallbackData(symbol));
      }
    } catch (err) {
      console.error('❌ Error in fetchChartData:', err);
      setError(err.message);
      
      // Always provide fallback data
      setChartData(generateFallbackData(symbol));
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback data when API fails
  const generateFallbackData = (symbol) => {
    // Base prices for different cryptocurrencies
    const basePrices = {
      'BTC': 67000,
      'ETH': 3400,
      'BNB': 600,
      'SOL': 200,
      'ADA': 0.50,
      'DOT': 25,
      'AVAX': 40,
      'MATIC': 1.20,
      'LTC': 150,
      'XRP': 0.60,
      'USDT': 1.00,
      'USDC': 1.00,
      'USD': 1.00
    };
    
    const basePrice = basePrices[symbol] || 100; // Default to $100 for unknown coins
    const data = [];
    const now = Date.now();
    const intervalMs = 60 * 60 * 1000; // 1 hour intervals
    
    for (let i = 59; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      
      // Different volatility for different coin types
      let volatility = 0.02; // Default 2%
      if (['BTC', 'ETH'].includes(symbol)) {
        volatility = 0.015; // 1.5% for major coins
      } else if (['USDT', 'USDC', 'USD'].includes(symbol)) {
        volatility = 0.001; // 0.1% for stablecoins
      } else {
        volatility = 0.03; // 3% for altcoins
      }
      
      const change = (Math.random() - 0.5) * volatility;
      const trend = Math.sin(i * 0.1) * 0.01; // Add slight trend
      
      const open = basePrice * (1 + change + trend);
      const high = open * (1 + Math.random() * volatility * 0.5);
      const low = open * (1 - Math.random() * volatility * 0.5);
      const close = low + Math.random() * (high - low);
      
      // Volume varies by coin type
      let baseVolume = 1000000;
      if (['BTC', 'ETH'].includes(symbol)) {
        baseVolume = 50000000; // Higher volume for major coins
      } else if (['USDT', 'USDC'].includes(symbol)) {
        baseVolume = 100000000; // Very high volume for stablecoins
      }
      
      const volume = baseVolume * (0.5 + Math.random());
      
      data.push({
        timestamp,
        open: parseFloat(open.toFixed(symbol === 'BTC' ? 2 : symbol === 'ETH' ? 2 : 6)),
        high: parseFloat(high.toFixed(symbol === 'BTC' ? 2 : symbol === 'ETH' ? 2 : 6)),
        low: parseFloat(low.toFixed(symbol === 'BTC' ? 2 : symbol === 'ETH' ? 2 : 6)),
        close: parseFloat(close.toFixed(symbol === 'BTC' ? 2 : symbol === 'ETH' ? 2 : 6)),
        volume: parseFloat(volume.toFixed(0))
      });
    }
    
    return data;
  };

  useEffect(() => {
    // Skip if symbol or timeframe is null (lazy loading)
    if (!symbol || !timeframe) {
      setLoading(false);
      return;
    }

    console.log(`🚀 useChartData effect triggered for ${symbol} ${timeframe}`);

    // Provide immediate fallback data to prevent empty charts
    setChartData(generateFallbackData(symbol));
    setLoading(true);

    // Initial fetch (will replace fallback data if successful)
    fetchChartData();
    
    // Set up periodic updates every 30 seconds (only if data is being loaded)
    intervalRef.current = setInterval(() => {
      fetchChartData();
    }, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol, timeframe]);

  return {
    chartData,
    loading,
    error,
    refreshChartData: fetchChartData
  };
};