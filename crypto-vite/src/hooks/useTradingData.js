import { useState, useEffect } from 'react';
import { tradingAPI } from '../utils/api';

export const useTradingData = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tradingAPI.getOrders({});
      
      if (response.success) {
        setOrders(response.orders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData) => {
    try {
      const response = await tradingAPI.createOrder(orderData);
      
      if (response.success) {
        // Refresh orders after placing new order
        await fetchOrders();
        return { success: true, order: response.order };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error placing order:', err);
      return { success: false, message: err.message || 'Failed to place order' };
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await tradingAPI.cancelOrder(orderId);
      
      if (response.success) {
        // Refresh orders after cancellation
        await fetchOrders();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      return { success: false, message: err.message || 'Failed to cancel order' };
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Update orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return { 
    orders, 
    loading, 
    error, 
    placeOrder, 
    cancelOrder, 
    refreshOrders: fetchOrders 
  };
};