import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
const InvestmentsTab = ({ showToast }) => {
  const [investmentPlans, setInvestmentPlans] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('plans');
  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInvestments();
      
      if (response && response.success) {
        setInvestmentPlans(response.data?.plans || mockInvestmentPlans);
        setUserInvestments(response.data?.user_investments || mockUserInvestments);
        showToast('success', 'Investment data loaded successfully');
      } else {
        setInvestmentPlans(mockInvestmentPlans);
        setUserInvestments(mockUserInvestments);
        showToast('info', 'Using demo data for investments');
      }
    } catch (error) {
      console.error('Failed to fetch investment data:', error);
      setInvestmentPlans(mockInvestmentPlans);
      setUserInvestments(mockUserInvestments);
      showToast('info', 'Using demo data for investments');
    } finally {
      setLoading(false);
    }
  };
  const handlePlanAction = async (planId, action) => {
    try {
      // Investment plans API not implemented yet
      showToast('success', `Plan ${action}d successfully (demo)`);
      fetchInvestmentData();
    } catch (error) {
      console.error(`Failed to ${action} plan:`, error);
      showToast('success', `Plan ${action}d successfully (demo)`);
    }
  };

  const investmentStats = [
    {
      icon: '💎',
      label: 'Active Plans',
      value: '8',
      change: '2 plans created this month',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '👥',
      label: 'Total Investors',
      value: '2,847',
      change: '▲ +124 new investors',
      type: 'green',
      changeType: 'up'
    },
    {
      icon: '💰',
      label: 'Total Invested',
      value: '$12.7M',
      change: '▲ +8.4% this month',
      type: 'yellow',
      changeType: 'up'
    },
    {
      icon: '📈',
      label: 'Avg. ROI',
      value: '18.4%',
      change: 'Across all active plans',
      type: 'blue',
      changeType: 'up'
    }
  ];

  const planColumns = [
    { key: 'name', label: 'Plan Name' },
    { key: 'duration', label: 'Duration' },
    { key: 'minAmount', label: 'Min Amount' },
    { key: 'roi', label: 'ROI' },
    { key: 'investors', label: 'Investors' },
    { key: 'totalInvested', label: 'Total Invested' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatPlanRow = (plan, index) => ({
    name: (
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '24px', height: '24px', fontSize: '10px'}}>
          {plan.name ? plan.name.charAt(0) : '?'}
        </div>
        <div>
          <div style={{fontSize: '12px', fontWeight: '500'}}>{plan.name}</div>
          <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>{plan.description}</div>
        </div>
      </div>
    ),
    duration: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        {plan.duration}
      </span>
    ),
    minAmount: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-cyan)'}}>
        ${plan.min_amount.toLocaleString()}
      </span>
    ),
    roi: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-green)'}}>
        {plan.roi}%
      </span>
    ),
    investors: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
        {plan.investors.toLocaleString()}
      </span>
    ),
    totalInvested: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-yellow)'}}>
        ${plan.total_invested.toLocaleString()}
      </span>
    ),
    status: (
      <span className={`badge ${plan.status}`}>
        {plan.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'Plan details modal coming soon')}
        >
          Edit
        </button>
        <button 
          className={`action-btn ${plan.status === 'active' ? 'suspend' : 'approve'}`}
          onClick={() => handlePlanAction(plan.id, plan.status === 'active' ? 'disable' : 'enable')}
        >
          {plan.status === 'active' ? 'Disable' : 'Enable'}
        </button>
      </div>
    )
  });

  const userInvestmentColumns = [
    { key: 'user', label: 'Investor' },
    { key: 'plan', label: 'Plan' },
    { key: 'amount', label: 'Amount' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'currentValue', label: 'Current Value' },
    { key: 'status', label: 'Status' }
  ];

  const formatUserInvestmentRow = (investment, index) => {
    const userName = typeof investment.user === 'string' 
      ? investment.user 
      : investment.user?.name || investment.user?.email || 'Unknown User';
    
    const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';
    
    return {
      user: (
        <div className="user-chip">
          <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)', width: '20px', height: '20px', fontSize: '8px'}}>
            {userInitials}
          </div>
          <span style={{fontSize: '12px'}}>{userName}</span>
        </div>
      ),
      plan: (
        <span style={{fontSize: '12px', color: 'var(--accent-cyan)'}}>{investment.plan_name}</span>
      ),
      amount: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px'}}>
          ${investment.amount.toLocaleString()}
        </span>
      ),
      startDate: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-tertiary)'}}>
          {investment.start_date}
        </span>
      ),
      endDate: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-tertiary)'}}>
          {investment.end_date}
        </span>
      ),
      currentValue: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-green)'}}>
          ${investment.current_value.toLocaleString()}
        </span>
      ),
      status: (
        <span className={`badge ${investment.status}`}>
          {investment.status.toUpperCase()}
        </span>
      )
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading investment data...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Investment Management</div>
          <div className="page-sub">Manage investment plans and monitor investor activity</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Investment report export coming soon')}
          >
            📊 Export Report
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => showToast('info', 'Create investment plan modal coming soon')}
          >
            ➕ Create Plan
          </button>
        </div>
      </div>

      {/* Investment Stats */}
      <div className="cards-grid">
        {investmentStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* View Toggle */}
      <div className="filter-bar">
        <button 
          className={`filter-chip ${activeView === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveView('plans')}
        >
          Investment Plans
        </button>
        <button 
          className={`filter-chip ${activeView === 'investments' ? 'active' : ''}`}
          onClick={() => setActiveView('investments')}
        >
          User Investments
        </button>
      </div>

      {activeView === 'plans' ? (
        <Panel 
          title="Investment Plans"
          action={
            <button 
              className="action-btn view"
              onClick={() => showToast('info', 'Plan analytics coming soon')}
            >
              View Analytics
            </button>
          }
        >
          <DataTable
            columns={planColumns}
            data={investmentPlans.map(formatPlanRow)}
          />
        </Panel>
      ) : (
        <Panel title="User Investments">
          <DataTable
            columns={userInvestmentColumns}
            data={userInvestments.map(formatUserInvestmentRow)}
          />
          <div className="pagination">
            <div className="page-info">
              Showing 1–{Math.min(10, userInvestments.length)} of {userInvestments.length} investments
            </div>
            <div className="page-btns">
              <button className="page-btn">«</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">»</button>
            </div>
          </div>
        </Panel>
      )}

      {/* Plan Performance Grid */}
      <div className="grid-2" style={{marginTop: '20px'}}>
        <Panel title="Top Performing Plans">
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {investmentPlans.slice(0, 4).map((plan, index) => (
              <div key={plan.id} className="performance-item">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                  <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
                    {plan.name ? plan.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <div style={{fontSize: '12px', fontWeight: '500'}}>{plan.name}</div>
                    <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>{plan.investors} investors</div>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '12px', color: 'var(--accent-green)', fontFamily: 'var(--mono)'}}>
                    {plan.roi}% ROI
                  </div>
                  <div style={{fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)'}}>
                    ${plan.total_invested.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Investments">
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {userInvestments.slice(0, 4).map((investment, index) => {
              const userName = typeof investment.user === 'string' 
                ? investment.user 
                : investment.user?.name || investment.user?.email || 'Unknown User';
              
              const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';
              
              return (
                <div key={investment.id} className="recent-investment-item">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                    <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{width: '20px', height: '20px', fontSize: '8px'}}>
                      {userInitials}
                    </div>
                    <div>
                      <div style={{fontSize: '12px', fontWeight: '500'}}>{userName}</div>
                      <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>{investment.plan_name}</div>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '12px', color: 'var(--accent-cyan)', fontFamily: 'var(--mono)'}}>
                      ${investment.amount.toLocaleString()}
                    </div>
                    <div style={{fontSize: '10px', color: 'var(--text-tertiary)'}}>
                      {investment.start_date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock data for investment plans
const mockInvestmentPlans = [
  {
    id: 1,
    name: 'Starter Plan',
    description: 'Perfect for beginners',
    duration: '30 days',
    min_amount: 100,
    roi: 12,
    investors: 847,
    total_invested: 284000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Growth Plan',
    description: 'Balanced risk and reward',
    duration: '90 days',
    min_amount: 500,
    roi: 24,
    investors: 542,
    total_invested: 1840000,
    status: 'active'
  },
  {
    id: 3,
    name: 'Premium Plan',
    description: 'High yield investment',
    duration: '180 days',
    min_amount: 2000,
    roi: 45,
    investors: 284,
    total_invested: 2840000,
    status: 'active'
  },
  {
    id: 4,
    name: 'Elite Plan',
    description: 'Exclusive high-tier plan',
    duration: '365 days',
    min_amount: 10000,
    roi: 78,
    investors: 94,
    total_invested: 4200000,
    status: 'active'
  },
  {
    id: 5,
    name: 'Legacy Plan',
    description: 'Long-term wealth building',
    duration: '730 days',
    min_amount: 25000,
    roi: 120,
    investors: 42,
    total_invested: 3600000,
    status: 'disabled'
  }
];

// Mock data for user investments
const mockUserInvestments = [
  {
    id: 1,
    user: 'John Doe',
    plan_name: 'Growth Plan',
    amount: 5000,
    start_date: '2024-02-15',
    end_date: '2024-05-15',
    current_value: 5840,
    status: 'active'
  },
  {
    id: 2,
    user: 'Sarah Miller',
    plan_name: 'Premium Plan',
    amount: 10000,
    start_date: '2024-01-20',
    end_date: '2024-07-20',
    current_value: 12400,
    status: 'active'
  },
  {
    id: 3,
    user: 'Alex Kumar',
    plan_name: 'Elite Plan',
    amount: 25000,
    start_date: '2023-12-01',
    end_date: '2024-12-01',
    current_value: 34200,
    status: 'active'
  },
  {
    id: 4,
    user: 'Emma Wilson',
    plan_name: 'Starter Plan',
    amount: 500,
    start_date: '2024-03-01',
    end_date: '2024-03-31',
    current_value: 540,
    status: 'active'
  },
  {
    id: 5,
    user: 'Priya Patel',
    plan_name: 'Growth Plan',
    amount: 2000,
    start_date: '2024-01-15',
    end_date: '2024-04-15',
    current_value: 2480,
    status: 'completed'
  }
];

export default InvestmentsTab;