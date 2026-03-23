import { useState, useEffect } from 'react';
import { tradingAPI } from '../utils/api';

export const useOrderBook = (cryptocurrency = 'BTC') => {
  const [orderBook, setOrderBook] = useState({ 
    asks: [], 
    bids: [],
    spread: 0,
    best_bid: 0,
    best_ask: 0,
    last_updated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateMockOrderBook = (basePrice = 50000) => {
    const asks = [];
    const bids = [];
    
    // Generate asks (sell orders) - prices above current price
    for (let i = 1; i <= 15; i++) {
      const price = basePrice + (i * Math.random() * 100);
      const amount = Math.random() * 5 + 0.1;
      asks.push({
        price: price,
        amount: amount,
        total: price * amount
      });
    }
    
    // Generate bids (buy orders) - prices below current price
    for (let i = 1; i <= 15; i++) {
      const price = basePrice - (i * Math.random() * 100);
      const amount = Math.random() * 5 + 0.1;
      bids.push({
        price: price,
        amount: amount,
        total: price * amount
      });
    }
    
    // Sort asks ascending (lowest price first)
    asks.sort((a, b) => a.price - b.price);
    
    // Sort bids descending (highest price first)
    bids.sort((a, b) => b.price - a.price);
    
    const best_ask = asks[0]?.price || basePrice + 50;
    const best_bid = bids[0]?.price || basePrice - 50;
    const spread = best_ask - best_bid;
    
    return {
      asks,
      bids,
      spread: spread,
      best_bid: best_bid,
      best_ask: best_ask,
      last_updated: new Date().toISOString()
    };
  };

  const fetchOrderBook = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const response = await tradingAPI.getOrderBook(cryptocurrency);
        
        if (response.success && response.asks && response.bids) {
          // Transform backend data to match frontend format
          const transformedAsks = response.asks.map(ask => ({
            price: parseFloat(ask.price),
            amount: parseFloat(ask.quantity || ask.amount),
            total: parseFloat(ask.total || (ask.price * ask.quantity))
          }));

          const transformedBids = response.bids.map(bid => ({
            price: parseFloat(bid.price),
            amount: parseFloat(bid.quantity || bid.amount),
            total: parseFloat(bid.total || (bid.price * bid.quantity))
          }));

          setOrderBook({ 
            asks: transformedAsks, 
            bids: transformedBids,
            spread: response.spread || 0,
            best_bid: response.best_bid || 0,
            best_ask: response.best_ask || 0,
            last_updated: response.last_updated || new Date().toISOString()
          });
        } else {
          throw new Error('Invalid order book data format');
        }
      } catch (apiError) {
        console.log('API order book failed, using mock data:', apiError.message);
        
        // Generate mock data based on cryptocurrency
        const basePrice = getCryptoPriceEstimate(cryptocurrency);
        const mockOrderBook = generateMockOrderBook(basePrice);
        setOrderBook(mockOrderBook);
      }
    } catch (err) {
      console.error('Error fetching order book:', err);
      setError(err.message || 'Failed to fetch order book');
      
      // Fallback to mock data even on error
      const basePrice = getCryptoPriceEstimate(cryptocurrency);
      const mockOrderBook = generateMockOrderBook(basePrice);
      setOrderBook(mockOrderBook);
    } finally {
      setLoading(false);
    }
  };

  const getCryptoPriceEstimate = (crypto) => {
    const priceEstimates = {
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
    
    return priceEstimates[crypto] || 1000;
  };

  useEffect(() => {
    fetchOrderBook();
    
    // Update order book every 3 seconds for more realistic trading experience
    const interval = setInterval(fetchOrderBook, 3000);
    
    return () => clearInterval(interval);
  }, [cryptocurrency]);

  // Simulate real-time updates by slightly modifying the order book
  useEffect(() => {
    if (!loading && orderBook.asks.length > 0) {
      const realtimeInterval = setInterval(() => {
        setOrderBook(prevOrderBook => {
          const newAsks = [...prevOrderBook.asks];
          const newBids = [...prevOrderBook.bids];
          
          // Randomly update a few orders
          const askIndex = Math.floor(Math.random() * Math.min(5, newAsks.length));
          const bidIndex = Math.floor(Math.random() * Math.min(5, newBids.length));
          
          if (newAsks[askIndex]) {
            newAsks[askIndex] = {
              ...newAsks[askIndex],
              amount: Math.max(0.01, newAsks[askIndex].amount + (Math.random() - 0.5) * 0.5),
            };
            newAsks[askIndex].total = newAsks[askIndex].price * newAsks[askIndex].amount;
          }
          
          if (newBids[bidIndex]) {
            newBids[bidIndex] = {
              ...newBids[bidIndex],
              amount: Math.max(0.01, newBids[bidIndex].amount + (Math.random() - 0.5) * 0.5),
            };
            newBids[bidIndex].total = newBids[bidIndex].price * newBids[bidIndex].amount;
          }
          
          return {
            ...prevOrderBook,
            asks: newAsks,
            bids: newBids,
            last_updated: new Date().toISOString()
          };
        });
      }, 1000);
      
      return () => clearInterval(realtimeInterval);
    }
  }, [loading, orderBook.asks.length]);

  return { 
    orderBook, 
    loading, 
    error, 
    refreshOrderBook: fetchOrderBook 
  };
};
