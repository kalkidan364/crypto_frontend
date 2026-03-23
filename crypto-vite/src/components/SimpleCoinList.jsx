import React from 'react';

// Simple Coin List Component - Guaranteed to Work
const SimpleCoinList = ({ instruments, selectedPair, onInstrumentSelect, loading = false }) => {
  console.log('SimpleCoinList render:', { 
    instrumentsLength: instruments?.length || 0, 
    instruments: instruments?.slice(0, 5), 
    selectedPair, 
    loading 
  });

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#848e9c' }}>
        <div>Loading coins...</div>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#848e9c' }}>
        <div>No coins found</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px' }}>
      {instruments.map(instrument => (
        <div
          key={instrument.symbol}
          onClick={() => onInstrumentSelect && onInstrumentSelect(instrument.symbol)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 60px',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: selectedPair === instrument.symbol ? '#f0b90b20' : '#1a1f2e',
            border: selectedPair === instrument.symbol ? '1px solid #f0b90b' : '1px solid #2b3139',
            borderRadius: '8px',
            marginBottom: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2b3139';
            e.target.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = selectedPair === instrument.symbol ? '#f0b90b20' : '#1a1f2e';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          {/* Symbol and Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              color: '#ffffff',
              lineHeight: '1.2'
            }}>
              {instrument.symbol}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#848e9c',
              lineHeight: '1.2'
            }}>
              {instrument.name}
            </div>
          </div>

          {/* Price */}
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            color: '#ffffff',
            textAlign: 'right',
            fontFamily: 'monospace'
          }}>
            ${instrument.price.toLocaleString()}
          </div>

          {/* Change */}
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            backgroundColor: instrument.change >= 0 ? '#0ecb8120' : '#f6465d20',
            color: instrument.change >= 0 ? '#0ecb81' : '#f6465d',
            border: instrument.change >= 0 ? '1px solid #0ecb8150' : '1px solid #f6465d50'
          }}>
            {instrument.change >= 0 ? '+' : ''}{instrument.change.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimpleCoinList;