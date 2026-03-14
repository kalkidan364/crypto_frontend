import { useState, useEffect } from 'react';
import { tradingAPI } from '../utils/api';

export const useOrderBook = (cryptocurrency = 'BTC') => {
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderBook = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tradingAPI.getOrderBook(cryptocurrency);
      
      if (response.success) {
        // Transform backend data to match frontend format
        const transformedAsks = response.asks.map(ask => ({
          price: parseFloat(ask.price),
          amount: parseFloat(ask.quantity),
          total: parseFloat(ask.total)
        }));

        const transformedBids = response.bids.map(bid => ({
          price: parseFloat(bid.price),
          amount: parseFloat(bid.quantity),
          total: parseFloat(bid.total)
        }));

        setOrderBook({ 
          asks: transformedAsks, 
          bids: transformedBids,
          spread: response.spread,
          best_bid: response.best_bid,
          best_ask: response.best_ask,
          last_updated: response.last_updated
        });
      } else {
        setError('Failed to fetch order book');
      }
    } catch (err) {
      console.error('Error fetching order book:', err);
      setError(err.message || 'Failed to fetch order book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderBook();
    
    // Update order book every 5 seconds
    const interval = setInterval(fetchOrderBook, 5000);
    
    return () => clearInterval(interval);
  }, [cryptocurrency]);

  return { orderBook, loading, error, refreshOrderBook: fetchOrderBook };
};
