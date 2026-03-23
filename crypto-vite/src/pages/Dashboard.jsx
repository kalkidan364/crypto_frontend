import { useEffect } from 'react';
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  useEffect(() => {
    // Component initialization
  }, []);

  return (
    <div style={{
      background: '#0a0b0d',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Modern Header */}
      <header style={{
        background: '#111319',
        borderBottom: '1px solid #2b3139',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo and Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#f0b90b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>₿</div>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff'
              }}>CryptoHub</span>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            flex: 1,
            maxWidth: '400px',
            margin: '0 24px'
          }}>
            <div style={{
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#848e9c'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search coins, pairs, and more..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: '#1a1f2e',
                  border: '1px solid #2b3139',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button style={{
              background: 'transparent',
              border: 'none',
              color: '#848e9c',
              fontSize: '18px',
              cursor: 'pointer'
            }}>🔔</button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: '#1a1f2e',
              borderRadius: '8px',
              border: '1px solid #2b3139'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#f0b90b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#000000'
              }}>JD</div>
              <span style={{
                fontSize: '14px',
                color: '#ffffff'
              }}>John Doe</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={{
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Left Column - Portfolio and Transactions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Portfolio Overview Card */}
          <div style={{
            background: '#1a1f2e',
            borderRadius: '16px',
            border: '1px solid #2b3139',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 4px 0'
                }}>Portfolio Overview</h3>
                <p style={{
                  fontSize: '12px',
                  color: '#848e9c',
                  margin: '0'
                }}>Your cryptocurrency portfolio</p>
              </div>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: '#848e9c',
                fontSize: '14px',
                cursor: 'pointer'
              }}>View All</button>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>$84,562.00</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    color: '#00d4aa',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>+12.5%</span>
                  <span style={{
                    color: '#848e9c',
                    fontSize: '12px'
                  }}>Last 30 days</span>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div style={{
                width: '120px',
                height: '60px',
                background: '#0b0e11',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg viewBox="0 0 120 60" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#00d4aa" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,45 Q15,35 30,30 T60,25 T90,20 T120,15 L120,60 L0,60 Z" 
                    fill="url(#portfolioGradient)"
                  />
                  <path 
                    d="M0,45 Q15,35 30,30 T60,25 T90,20 T120,15" 
                    stroke="#00d4aa" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Asset Distribution */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {[
                { name: 'Bitcoin', symbol: 'BTC', percentage: 45, value: '$38,052.90', color: '#f7931a' },
                { name: 'Ethereum', symbol: 'ETH', percentage: 30, value: '$25,368.60', color: '#627eea' },
                { name: 'Others', symbol: '...', percentage: 25, value: '$21,140.50', color: '#848e9c' }
              ].map((asset, index) => (
                <div key={index} style={{
                  background: '#0b0e11',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: asset.color
                    }}></div>
                    <span style={{
                      fontSize: '12px',
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>{asset.symbol}</span>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '2px'
                  }}>{asset.value}</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#848e9c'
                  }}>{asset.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div style={{
            background: '#1a1f2e',
            borderRadius: '16px',
            border: '1px solid #2b3139',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 4px 0'
                }}>Recent Transactions</h3>
                <p style={{
                  fontSize: '12px',
                  color: '#848e9c',
                  margin: '0'
                }}>Your latest trading activity</p>
              </div>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: '#848e9c',
                fontSize: '14px',
                cursor: 'pointer'
              }}>View All</button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { type: 'buy', asset: 'BTC', amount: '0.05 BTC', value: '$3,361.70', time: '2 hours ago', status: 'completed' },
                { type: 'sell', asset: 'ETH', amount: '1.2 ETH', value: '$4,149.44', time: '5 hours ago', status: 'completed' },
                { type: 'send', asset: 'USDT', amount: '500 USDT', value: '$500.00', time: '1 day ago', status: 'completed' },
                { type: 'receive', asset: 'BNB', amount: '2 BNB', value: '$824.60', time: '2 days ago', status: 'completed' },
                { type: 'buy', asset: 'SOL', amount: '10 SOL', value: '$1,780.00', time: '3 days ago', status: 'pending' }
              ].map((tx, index) => (
                <div key={index} style={{
                  background: '#0b0e11',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: tx.type === 'buy' ? 'rgba(0, 212, 170, 0.1)' : 
                               tx.type === 'sell' ? 'rgba(255, 107, 107, 0.1)' :
                               tx.type === 'send' ? 'rgba(240, 185, 11, 0.1)' :
                               'rgba(98, 126, 234, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    {tx.type === 'buy' ? '📈' : tx.type === 'sell' ? '📉' : tx.type === 'send' ? '📤' : '📥'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '4px'
                    }}>{tx.asset} {tx.type === 'buy' ? 'Buy' : tx.type === 'sell' ? 'Sell' : tx.type === 'send' ? 'Send' : 'Receive'}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#848e9c'
                    }}>{tx.amount} • {tx.time}</div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '4px'
                    }}>{tx.value}</div>
                    <div style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: tx.status === 'completed' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(240, 185, 11, 0.1)',
                      color: tx.status === 'completed' ? '#00d4aa' : '#f0b90b',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions and Market Trends */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Quick Actions */}
          <div style={{
            background: '#1a1f2e',
            borderRadius: '16px',
            border: '1px solid #2b3139',
            padding: '24px'
          }}>
            <div style={{
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 4px 0'
              }}>Quick Actions</h3>
              <p style={{
                fontSize: '12px',
                color: '#848e9c',
                margin: '0'
              }}>Common trading actions</p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {[
                { icon: '💰', title: 'Buy', color: '#00d4aa' },
                { icon: '💸', title: 'Sell', color: '#ff6b6b' },
                { icon: '🔄', title: 'Convert', color: '#f0b90b' },
                { icon: '📤', title: 'Send', color: '#627eea' }
              ].map((action, index) => (
                <button key={index} style={{
                  background: '#0b0e11',
                  border: '1px solid #2b3139',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <span style={{ fontSize: '24px' }}>{action.icon}</span>
                  <span style={{
                    fontSize: '12px',
                    color: '#ffffff',
                    fontWeight: '600'
                  }}>{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Market Trends */}
          <div style={{
            background: '#1a1f2e',
            borderRadius: '16px',
            border: '1px solid #2b3139',
            padding: '24px',
            flex: 1
          }}>
            <div style={{
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 4px 0'
              }}>Market Trends</h3>
              <p style={{
                fontSize: '12px',
                color: '#848e9c',
                margin: '0'
              }}>Top cryptocurrency prices</p>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { symbol: 'BTC', name: 'Bitcoin', price: '$67,234', change: '+2.34%', positive: true, chart: 'up' },
                { symbol: 'ETH', name: 'Ethereum', price: '$3,456', change: '+1.87%', positive: true, chart: 'up' },
                { symbol: 'SOL', name: 'Solana', price: '$178', change: '-0.65%', positive: false, chart: 'down' },
                { symbol: 'BNB', name: 'BNB', price: '$412', change: '+0.43%', positive: true, chart: 'up' },
                { symbol: 'ADA', name: 'Cardano', price: '$0.62', change: '+3.21%', positive: true, chart: 'up' },
                { symbol: 'XRP', name: 'Ripple', price: '$0.52', change: '-1.23%', positive: false, chart: 'down' }
              ].map((coin, index) => (
                <div key={index} style={{
                  background: '#0b0e11',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#1a1f2e',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {coin.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#ffffff',
                        fontWeight: '600'
                      }}>{coin.symbol}</div>
                      <div style={{
                        fontSize: '10px',
                        color: '#848e9c'
                      }}>{coin.name}</div>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>{coin.price}</div>
                    <div style={{
                      fontSize: '10px',
                      color: coin.positive ? '#00d4aa' : '#ff6b6b',
                      fontWeight: '600'
                    }}>{coin.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;