import React from 'react';
import { useNavigate } from 'react-router-dom';

const Convert = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      background: '#0a0e1a', 
      minHeight: '100vh', 
      color: '#ffffff' 
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e 0%, #16213e 100%)',
        border: '1px solid #2d3748',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔄</div>
        <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#ffffff' }}>
          Convert Assets
        </h1>
        <p style={{ fontSize: '18px', color: '#a0aec0', marginBottom: '32px' }}>
          Convert between different cryptocurrencies instantly
        </p>
        <p style={{ fontSize: '16px', color: '#a0aec0', marginBottom: '32px' }}>
          This feature is coming soon! You'll be able to swap between different cryptocurrencies 
          with competitive rates and low fees.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/assets')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back to Assets
          </button>
          <button 
            onClick={() => navigate('/trade')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#4299e1',
              border: '1px solid #4299e1',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Trade Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Convert;