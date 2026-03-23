import { useState, useEffect } from 'react';

const AdvancedOrderForm = ({ 
  selectedCrypto,
  currentPrice,
  onPlaceOrder,
  loading,
  walletBalance = 0
}) => {
  const [orderType, setOrderType] = useState('market');
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState('GTC'); // Good Till Cancelled
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);

  // Calculate order totals
  const orderPrice = orderType === 'market' ? parseFloat(currentPrice) : parseFloat(price) || 0;
  const orderAmount = parseFloat(amount) || 0;
  const orderTotal = orderPrice * orderAmount;
  const estimatedFee = orderTotal * 0.001; // 0.1% fee
  const finalTotal = orderTotal + estimatedFee;

  // Reset form when crypto changes
  useEffect(() => {
    setAmount('');
    setPrice('');
    setStopPrice('');
    setTakeProfitPrice('');
  }, [selectedCrypto]);

  // Set price to current price when switching to limit order
  useEffect(() => {
    if (orderType === 'limit' && !price && currentPrice) {
      setPrice(currentPrice);
    }
  }, [orderType, currentPrice, price]);

  const handlePercentageClick = (percentage) => {
    if (tradeType === 'buy') {
      // For buy orders, calculate based on available USDT balance
      const availableBalance = walletBalance; // Assuming USDT balance
      const maxAmount = (availableBalance * percentage) / orderPrice;
      setAmount(maxAmount.toFixed(6));
    } else {
      // For sell orders, calculate based on crypto balance
      const cryptoBalance = walletBalance; // Assuming crypto balance
      const sellAmount = cryptoBalance * percentage;
      setAmount(sellAmount.toFixed(6));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const orderData = {
      cryptocurrency: selectedCrypto,
      type: tradeType,
      order_type: orderType,
      quantity: parseFloat(amount),
      time_in_force: timeInForce,
      reduce_only: reduceOnly,
      post_only: postOnly,
      ...(orderType !== 'market' && { price: parseFloat(price) }),
      ...(orderType === 'stop-loss' && { stop_price: parseFloat(stopPrice) }),
      ...(orderType === 'take-profit' && { take_profit_price: parseFloat(takeProfitPrice) })
    };

    onPlaceOrder(orderData);
  };

  const isFormValid = () => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) return false;
    if (orderType === 'stop-loss' && (!stopPrice || parseFloat(stopPrice) <= 0)) return false;
    if (orderType === 'take-profit' && (!takeProfitPrice || parseFloat(takeProfitPrice) <= 0)) return false;
    return true;
  };

  return (
    <div className="advanced-order-form">
      {/* Trade Type Tabs */}
      <div className="trade-type-tabs">
        <button 
          className={`tab-btn ${tradeType === 'buy' ? 'active buy' : 'buy'}`}
          onClick={() => setTradeType('buy')}
        >
          Buy {selectedCrypto}
        </button>
        <button 
          className={`tab-btn ${tradeType === 'sell' ? 'active sell' : 'sell'}`}
          onClick={() => setTradeType('sell')}
        >
          Sell {selectedCrypto}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        {/* Order Type Selection */}
        <div className="form-group">
          <label>Order Type</label>
          <select 
            value={orderType} 
            onChange={(e) => setOrderType(e.target.value)}
            className="form-select"
          >
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
            <option value="stop-loss">Stop Loss</option>
            <option value="take-profit">Take Profit</option>
            <option value="stop-limit">Stop Limit</option>
          </select>
        </div>

        {/* Price Input (for non-market orders) */}
        {orderType !== 'market' && (
          <div className="form-group">
            <label>Price (USDT)</label>
            <div className="input-with-buttons">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="form-input"
              />
              <div className="price-buttons">
                <button 
                  type="button"
                  onClick={() => setPrice((parseFloat(currentPrice) * 0.99).toFixed(2))}
                  className="price-btn"
                >
                  -1%
                </button>
                <button 
                  type="button"
                  onClick={() => setPrice(currentPrice)}
                  className="price-btn"
                >
                  Market
                </button>
                <button 
                  type="button"
                  onClick={() => setPrice((parseFloat(currentPrice) * 1.01).toFixed(2))}
                  className="price-btn"
                >
                  +1%
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stop Price (for stop orders) */}
        {(orderType === 'stop-loss' || orderType === 'stop-limit') && (
          <div className="form-group">
            <label>Stop Price (USDT)</label>
            <input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="form-input"
            />
          </div>
        )}

        {/* Take Profit Price */}
        {orderType === 'take-profit' && (
          <div className="form-group">
            <label>Take Profit Price (USDT)</label>
            <input
              type="number"
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="form-input"
            />
          </div>
        )}

        {/* Amount Input */}
        <div className="form-group">
          <label>Amount ({selectedCrypto})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            className="form-input"
          />
          <div className="percentage-buttons">
            <button 
              type="button"
              onClick={() => handlePercentageClick(0.25)}
              className="percentage-btn"
            >
              25%
            </button>
            <button 
              type="button"
              onClick={() => handlePercentageClick(0.5)}
              className="percentage-btn"
            >
              50%
            </button>
            <button 
              type="button"
              onClick={() => handlePercentageClick(0.75)}
              className="percentage-btn"
            >
              75%
            </button>
            <button 
              type="button"
              onClick={() => handlePercentageClick(1)}
              className="percentage-btn"
            >
              100%
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="advanced-options">
          <div className="form-group">
            <label>Time in Force</label>
            <select 
              value={timeInForce} 
              onChange={(e) => setTimeInForce(e.target.value)}
              className="form-select"
            >
              <option value="GTC">Good Till Cancelled</option>
              <option value="IOC">Immediate or Cancel</option>
              <option value="FOK">Fill or Kill</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={reduceOnly}
                onChange={(e) => setReduceOnly(e.target.checked)}
              />
              <span className="checkmark"></span>
              Reduce Only
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={postOnly}
                onChange={(e) => setPostOnly(e.target.checked)}
              />
              <span className="checkmark"></span>
              Post Only
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Amount:</span>
            <span>{orderAmount.toFixed(6)} {selectedCrypto}</span>
          </div>
          <div className="summary-row">
            <span>Price:</span>
            <span>${orderPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total:</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Est. Fee:</span>
            <span>${estimatedFee.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Final Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className={`submit-btn ${tradeType}`}
          disabled={loading || !isFormValid()}
        >
          {loading ? 'Placing Order...' : `${tradeType.toUpperCase()} ${selectedCrypto}`}
        </button>
      </form>
    </div>
  );
};

export default AdvancedOrderForm;