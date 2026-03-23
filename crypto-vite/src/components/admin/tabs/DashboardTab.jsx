import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};
const DashboardTab = ({ showToast, onTabChange }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      // Fetch recent transactions directly
      const recentTransactionsResponse = await adminAPI.getRecentTransactions({ limit: 10 });
      console.log('📊 Recent Transactions Response:', recentTransactionsResponse);

      // Extract transactions
      const transactions = recentTransactionsResponse?.transactions || [];
      console.log('💰 Extracted transactions:', transactions.length);

      if (transactions.length > 0) {
        console.log('Sample transaction:', transactions[0]);
        showToast('success', `✅ Loaded ${transactions.length} recent transactions`);
      } else {
        console.warn('⚠️ No transactions found');
        showToast('warning', 'No recent transactions found');
      }

      // Fetch other data in parallel
      const [dashboardResponse, usersResponse, walletsResponse] = await Promise.all([
        adminAPI.getDashboard().catch(() => null),
        adminAPI.getUsers().catch(() => null),
        adminAPI.getWallets().catch(() => null)
      ]);

      // Process real data only - no fallbacks to mock data
      const realData = {
        stats: {
          total_users: usersResponse?.data?.users?.length || usersResponse?.users?.length || 0,
          active_users: usersResponse?.data?.users?.filter(u => u.status === 'active')?.length || 0,
          total_balance: walletsResponse?.data?.wallets?.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0) || 0,
          pending_kyc: usersResponse?.data?.users?.filter(u => u.kyc_status === 'pending')?.length || 0,
          total_deposits: transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0,
          pending_withdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending')?.length || 0,
          completed_trades: dashboardResponse?.stats?.completed_trades || 0,
          daily_revenue: dashboardResponse?.stats?.daily_revenue || 0
        },
        recent_transactions: transactions.map(t => ({
          user: t.user?.name || t.user?.email || 'Unknown User',
          type: t.type === 'deposit' ? 'Deposit' : 'Withdrawal',
          amount: `${parseFloat(t.amount || 0).toFixed(2)}`,
          currency: t.currency,
          status: (t.status || 'pending').charAt(0).toUpperCase() + (t.status || 'pending').slice(1),
          time: formatTimeAgo(t.created_at),
          txid: t.txid,
          network: t.network,
          id: t.id
        }))
      };

      setDashboardData(realData);
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      showToast('error', `API Error: ${error.message}`);
      // Set empty data instead of mock data
      setDashboardData({
        stats: {
          total_users: 0,
          active_users: 0,
          total_balance: 0,
          pending_kyc: 0,
          total_deposits: 0,
          pending_withdrawals: 0,
          completed_trades: 0,
          daily_revenue: 0
        },
        recent_transactions: []
      });
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentTransactions = dashboardData?.recent_transactions;

  return (
    <div style={{
      background: '#0f1419',
      minHeight: '100vh',
      color: '#ffffff',
      padding: '0'
    }}>
      {/* Refresh Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '16px 20px 0 20px'
      }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: refreshing ? '#2b3139' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 20px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            opacity: refreshing ? 0.7 : 1
          }}
        >
          <span style={{
            display: 'inline-block',
            animation: refreshing ? 'spin 1s linear infinite' : 'none'
          }}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Grid - 8 cards in 2 rows of 4 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {/* Row 1 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}>Total Users</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px'
            }}>{stats?.total_users?.toLocaleString() || '0'}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: '600'
              }}>↑ 12.5%</span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '11px'
              }}>vs last month</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}>Daily Revenue</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px'
            }}>${((stats?.daily_revenue || 0) / 1000000).toFixed(2)}M</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: '600'
              }}>↑ 8.2%</span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '11px'
              }}>vs yesterday</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}>Total Withdrawals</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px'
            }}>${((stats?.total_withdrawals || 0) / 1000000).toFixed(2)}M</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: '600'
              }}>↑ 15.3%</span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '11px'
              }}>vs last month</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}>Active Transactions</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px'
            }}>${((stats?.active_transactions || 0) / 1000000).toFixed(1)}M</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: '600'
              }}>↑ 22.1%</span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '11px'
              }}>vs last week</span>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.7)',
              marginBottom: '8px'
            }}>New Users</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '8px'
            }}>{stats?.new_users?.toLocaleString() || '0'}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#059669',
                fontSize: '12px',
                fontWeight: '600'
              }}>↑ 18.7%</span>
              <span style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '11px'
              }}>this week</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.7)',
              marginBottom: '8px'
            }}>Support Tickets</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '8px'
            }}>{stats?.support_tickets?.toLocaleString() || '0'}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: '600'
              }}>↓ 5.2%</span>
              <span style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '11px'
              }}>vs last week</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.7)',
              marginBottom: '8px'
            }}>Daily Trades</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '8px'
            }}>{stats?.daily_trades?.toLocaleString() || '0'}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#059669',
                fontSize: '12px',
                fontWeight: '600'
              }}>↑ 31.4%</span>
              <span style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '11px'
              }}>vs yesterday</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.7)',
              marginBottom: '8px'
            }}>Pending KYC</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '8px'
            }}>{stats?.pending_kyc?.toLocaleString() || '0'}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#f59e0b',
                fontSize: '12px',
                fontWeight: '600'
              }}>⚠️ Action needed</span>
              <span style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '11px'
              }}>requires review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - User Growth and Platform Revenue */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        padding: '0 20px 20px 20px'
      }}>
        {/* User Growth Chart */}
        <div style={{
          background: '#1a1f2e',
          border: '1px solid #2b3139',
          borderRadius: '16px',
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
              }}>User Growth</h3>
              <p style={{
                fontSize: '12px',
                color: '#848e9c',
                margin: '0'
              }}>Monthly user registration trends</p>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              {['1M', '3M', '6M', '1Y'].map((period) => (
                <button key={period} style={{
                  padding: '6px 12px',
                  background: period === '3M' ? '#667eea' : 'transparent',
                  border: period === '3M' ? 'none' : '1px solid #2b3139',
                  borderRadius: '6px',
                  color: period === '3M' ? '#ffffff' : '#848e9c',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>{period}</button>
              ))}
            </div>
          </div>
          
          <div style={{
            height: '280px',
            background: '#0f1419',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="userGrowthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4facfe" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#4facfe" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line key={i} x1="40" y1={40 + i * 40} x2="380" y2={40 + i * 40} stroke="#2b3139" strokeWidth="1" opacity="0.3"/>
              ))}
              {/* Y-axis labels */}
              {['25K', '20K', '15K', '10K', '5K', '0'].map((label, i) => (
                <text key={i} x="30" y={45 + i * 40} fill="#848e9c" fontSize="10" textAnchor="end">{label}</text>
              ))}
              {/* X-axis labels */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => (
                <text key={i} x={60 + i * 55} y="270" fill="#848e9c" fontSize="10" textAnchor="middle">{label}</text>
              ))}
              {/* Chart area */}
              <path d="M60,200 Q115,180 170,160 T280,120 T335,100 L335,240 L60,240 Z" fill="url(#userGrowthGradient)"/>
              <path d="M60,200 Q115,180 170,160 T280,120 T335,100" stroke="#4facfe" strokeWidth="3" fill="none"/>
              {/* Data points */}
              {[60, 115, 170, 225, 280, 335].map((x, i) => (
                <circle key={i} cx={x} cy={[200, 180, 160, 140, 120, 100][i]} r="4" fill="#4facfe"/>
              ))}
            </svg>
          </div>
        </div>

        {/* Platform Revenue Chart */}
        <div style={{
          background: '#1a1f2e',
          border: '1px solid #2b3139',
          borderRadius: '16px',
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
              }}>Platform Revenue</h3>
              <p style={{
                fontSize: '12px',
                color: '#848e9c',
                margin: '0'
              }}>Monthly revenue performance</p>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              {['1M', '3M', '6M', '1Y'].map((period) => (
                <button key={period} style={{
                  padding: '6px 12px',
                  background: period === '6M' ? '#f093fb' : 'transparent',
                  border: period === '6M' ? 'none' : '1px solid #2b3139',
                  borderRadius: '6px',
                  color: period === '6M' ? '#ffffff' : '#848e9c',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>{period}</button>
              ))}
            </div>
          </div>
          
          <div style={{
            height: '280px',
            background: '#0f1419',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f093fb" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#f093fb" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line key={i} x1="40" y1={40 + i * 40} x2="380" y2={40 + i * 40} stroke="#2b3139" strokeWidth="1" opacity="0.3"/>
              ))}
              {/* Y-axis labels */}
              {['$10M', '$8M', '$6M', '$4M', '$2M', '$0'].map((label, i) => (
                <text key={i} x="30" y={45 + i * 40} fill="#848e9c" fontSize="10" textAnchor="end">{label}</text>
              ))}
              {/* X-axis labels */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => (
                <text key={i} x={60 + i * 55} y="270" fill="#848e9c" fontSize="10" textAnchor="middle">{label}</text>
              ))}
              {/* Revenue bars */}
              {[60, 115, 170, 225, 280, 335].map((x, i) => {
                const heights = [120, 100, 140, 80, 160, 90];
                return (
                  <rect 
                    key={i} 
                    x={x - 15} 
                    y={240 - heights[i]} 
                    width="30" 
                    height={heights[i]} 
                    fill="url(#revenueGradient)"
                    rx="4"
                  />
                );
              })}
              {/* Revenue bar outlines */}
              {[60, 115, 170, 225, 280, 335].map((x, i) => {
                const heights = [120, 100, 140, 80, 160, 90];
                return (
                  <rect 
                    key={i} 
                    x={x - 15} 
                    y={240 - heights[i]} 
                    width="30" 
                    height={heights[i]} 
                    fill="none"
                    stroke="#f093fb"
                    strokeWidth="2"
                    rx="4"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Actions and Asset Distribution Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        padding: '0 20px 20px 20px'
      }}>
        {/* Recent Transactions - Left Side */}
        <div style={{
          background: '#1a1f2e',
          border: '1px solid #2b3139',
          borderRadius: '16px',
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
                margin: '0'
              }}>Recent Transactions</h3>
            </div>
            <button 
              style={{
                background: 'transparent',
                border: '1px solid #667eea',
                borderRadius: '8px',
                color: '#667eea',
                fontSize: '12px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                if (onTabChange) {
                  onTabChange('deposits');
                } else {
                  showToast('info', 'Navigate to Deposits tab to view all transactions');
                }
              }}
            >View All</button>
          </div>

          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr',
            gap: '16px',
            padding: '12px 16px',
            borderBottom: '1px solid #2b3139',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '11px',
              color: '#848e9c',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>USER</div>
            <div style={{
              fontSize: '11px',
              color: '#848e9c',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>TYPE</div>
            <div style={{
              fontSize: '11px',
              color: '#848e9c',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>AMOUNT</div>
            <div style={{
              fontSize: '11px',
              color: '#848e9c',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>STATUS</div>
            <div style={{
              fontSize: '11px',
              color: '#848e9c',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>TIME</div>
          </div>

          {/* Table Rows */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 5).map((tx, index) => (
                <div key={tx.id || index} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr',
                  gap: '16px',
                  padding: '14px 16px',
                  background: '#0f1419',
                  borderRadius: '8px',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {/* User Column */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: tx.type === 'Deposit' ? '#4ade8030' : tx.type === 'Withdrawal' ? '#f8717130' : '#667eea30',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: tx.type === 'Deposit' ? '#4ade80' : tx.type === 'Withdrawal' ? '#f87171' : '#667eea'
                    }}>
                      {tx.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      fontWeight: '500'
                    }}>{tx.user}</span>
                  </div>

                  {/* Type Column */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      fontWeight: '400'
                    }}>{tx.type}</span>
                    {tx.txid && (
                      <span style={{
                        fontSize: '9px',
                        color: '#4ade80',
                        fontWeight: '500'
                      }}>● Confirmed</span>
                    )}
                  </div>

                  {/* Amount Column */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: tx.type === 'Deposit' ? '#4ade80' : tx.type === 'Withdrawal' ? '#f87171' : '#fbbf24'
                    }}>{tx.amount}</span>
                    {tx.currency && (
                      <span style={{
                        fontSize: '10px',
                        color: '#848e9c',
                        fontWeight: '500'
                      }}>{tx.currency}</span>
                    )}
                  </div>

                  {/* Status Column */}
                  <div>
                    <span style={{
                      fontSize: '11px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 
                        tx.status === 'Completed' ? '#4ade8020' : 
                        tx.status === 'Pending' ? '#fbbf2420' : 
                        tx.status === 'Failed' ? '#f8717120' : 
                        tx.status === 'Processing' ? '#3b82f620' :
                        tx.status === 'Active' ? '#667eea20' :
                        tx.status === 'Confirming' ? '#3b82f620' : '#848e9c20',
                      color: 
                        tx.status === 'Completed' ? '#4ade80' : 
                        tx.status === 'Pending' ? '#fbbf24' : 
                        tx.status === 'Failed' ? '#f87171' : 
                        tx.status === 'Processing' ? '#3b82f6' :
                        tx.status === 'Active' ? '#667eea' :
                        tx.status === 'Confirming' ? '#3b82f6' : '#848e9c',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{tx.status}</span>
                  </div>

                  {/* Time Column */}
                  <div style={{
                    fontSize: '12px',
                    color: '#848e9c',
                    fontWeight: '400'
                  }}>{tx.time}</div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: '#848e9c',
                fontSize: '14px'
              }}>
                <div style={{ marginBottom: '8px', fontSize: '24px' }}>📊</div>
                <div>No recent transactions found</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  Transactions will appear here once users make deposits or withdrawals
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Quick Actions and Asset Distribution */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Quick Actions */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid #2b3139',
            borderRadius: '16px',
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
              }}>Common admin tasks</p>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {[
                { icon: '➕', title: 'Create Investment Plan', color: '#667eea' },
                { icon: '🪪', title: `Review KYC (${stats?.pending_kyc || 0} Pending)`, color: '#f093fb' },
                { icon: '✅', title: `Approve Withdrawals (${stats?.support_tickets || 0})`, color: '#4ade80' },
                { icon: '🎫', title: 'Open Tickets (0)', color: '#fbbf24' }
              ].map((action, index) => (
                <button key={index} style={{
                  background: '#0f1419',
                  border: '1px solid #2b3139',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: `${action.color}20`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>{action.icon}</div>
                  <div style={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>{action.title}</div>
                  <span style={{ 
                    color: '#848e9c',
                    fontSize: '12px'
                  }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Asset Distribution */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid #2b3139',
            borderRadius: '16px',
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
              }}>Asset Distribution</h3>
              <p style={{
                fontSize: '12px',
                color: '#848e9c',
                margin: '0'
              }}>Platform asset allocation</p>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="btcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f7931a" />
                    <stop offset="100%" stopColor="#ff6b35" />
                  </linearGradient>
                  <linearGradient id="ethGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#627eea" />
                    <stop offset="100%" stopColor="#4facfe" />
                  </linearGradient>
                  <linearGradient id="usdtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#26a17b" />
                    <stop offset="100%" stopColor="#4ade80" />
                  </linearGradient>
                  <linearGradient id="othersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                {/* Donut chart segments */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#btcGradient)" strokeWidth="30" strokeDasharray="154 440" strokeDashoffset="0" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#ethGradient)" strokeWidth="30" strokeDasharray="110 440" strokeDashoffset="-154" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#usdtGradient)" strokeWidth="30" strokeDasharray="88 440" strokeDashoffset="-264" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#othersGradient)" strokeWidth="30" strokeDasharray="88 440" strokeDashoffset="-352" />
              </svg>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { name: 'Bitcoin (BTC)', percentage: '35%', color: '#f7931a' },
                { name: 'Ethereum (ETH)', percentage: '25%', color: '#627eea' },
                { name: 'Tether (USDT)', percentage: '20%', color: '#26a17b' },
                { name: 'Others', percentage: '20%', color: '#a855f7' }
              ].map((asset, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: asset.color
                    }}></div>
                    <span style={{
                      fontSize: '12px',
                      color: '#ffffff',
                      fontWeight: '500'
                    }}>{asset.name}</span>
                  </div>
                  <span style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '700'
                  }}>{asset.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;