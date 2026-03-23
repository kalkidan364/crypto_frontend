import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Withdraw = () => {
  const navigate = useNavigate();
  const { crypto } = useParams();

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
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>💸</div>
        <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#ffffff' }}>
          Withdraw {crypto ? crypto.toUpperCase() : 'Assets'}
        </h1>
        <p style={{ fontSize: '18px', color: '#a0aec0', marginBottom: '32px' }}>
          Send your cryptocurrency to external wallets
        </p>
        <p style={{ fontSize: '16px', color: '#a0aec0', marginBottom: '32px' }}>
          This feature is coming soon! You'll be able to withdraw your cryptocurrencies 
          to external wallets with secure verification processes.
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
            onClick={() => navigate('/deposit')}
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
            Deposit Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;