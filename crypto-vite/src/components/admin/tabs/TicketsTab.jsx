import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const TicketsTab = ({ showToast }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getSupportTickets();
      if (data.success) {
        setTickets(data.tickets || mockTickets);
      } else {
        setTickets(mockTickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets(mockTickets);
      showToast('info', 'Using demo data for support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAction = async (ticketId, action) => {
    try {
      // Support tickets API not implemented yet
      showToast('success', `Ticket ${action}d successfully (demo)`);
      fetchTickets();
    } catch (error) {
      console.error(`Failed to ${action} ticket:`, error);
      showToast('success', `Ticket ${action}d successfully (demo)`);
      // Update local state for demo
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, status: action === 'close' ? 'closed' : action }
          : t
      ));
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const userName = typeof ticket.user === 'string' 
      ? ticket.user 
      : ticket.user?.name || ticket.user?.email || '';
    
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const ticketStats = [
    {
      icon: '🎫',
      label: 'Open Tickets',
      value: '47',
      change: '▲ +7 today',
      type: 'red',
      changeType: 'up'
    },
    {
      icon: '⏱️',
      label: 'Avg Response Time',
      value: '1.8h',
      change: '▼ -0.3h improvement',
      type: 'green',
      changeType: 'down'
    },
    {
      icon: '✅',
      label: 'Resolved Today',
      value: '23',
      change: '▲ +5 from yesterday',
      type: 'cyan',
      changeType: 'up'
    },
    {
      icon: '😊',
      label: 'Satisfaction Rate',
      value: '94.2%',
      change: '▲ +1.2% this week',
      type: 'blue',
      changeType: 'up'
    }
  ];

  const columns = [
    { key: 'ticketId', label: 'Ticket ID' },
    { key: 'user', label: 'User' },
    { key: 'subject', label: 'Subject' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'lastUpdate', label: 'Last Update' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatTicketRow = (ticket, index) => {
    const userName = typeof ticket.user === 'string' 
      ? ticket.user 
      : ticket.user?.name || ticket.user?.email || 'Unknown User';
    
    const userInitials = userName.split(' ').map(n => n[0]).join('') || 'U';
    
    return {
      ticketId: (
        <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-tertiary)'}}>
          #{String(ticket.id).padStart(4, '0')}
        </span>
      ),
      user: (
        <div className="user-chip">
          <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)', width: '20px', height: '20px', fontSize: '8px'}}>
            {userInitials}
          </div>
          <span style={{fontSize: '12px'}}>{userName}</span>
        </div>
      ),
    subject: (
      <div>
        <div style={{fontSize: '12px', fontWeight: '500', marginBottom: '2px'}}>{ticket.subject}</div>
        <div style={{fontSize: '10px', color: 'var(--text-tertiary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {ticket.description}
        </div>
      </div>
    ),
    category: (
      <span style={{fontSize: '11px', color: 'var(--accent-cyan)'}}>{ticket.category}</span>
    ),
    priority: (
      <span className={`badge ${ticket.priority}`}>
        {ticket.priority.toUpperCase()}
      </span>
    ),
    status: (
      <span className={`badge ${ticket.status}`}>
        {ticket.status.toUpperCase()}
      </span>
    ),
    created: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-tertiary)'}}>
        {ticket.created_at}
      </span>
    ),
    lastUpdate: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-tertiary)'}}>
        {ticket.updated_at}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'Ticket details modal coming soon')}
        >
          View
        </button>
        {ticket.status === 'open' && (
          <>
            <button 
              className="action-btn approve"
              onClick={() => handleTicketAction(ticket.id, 'assign')}
            >
              Assign
            </button>
            <button 
              className="action-btn reject"
              onClick={() => handleTicketAction(ticket.id, 'close')}
            >
              Close
            </button>
          </>
        )}
      </div>
    )
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Support Tickets</div>
          <div className="page-sub">Manage customer support requests</div>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => showToast('info', 'Ticket report export coming soon')}
          >
            📊 Export Report
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => showToast('info', 'Create ticket modal coming soon')}
          >
            ➕ Create Ticket
          </button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="cards-grid">
        {ticketStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-input"
          style={{minWidth: 'auto', width: '120px'}}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="filter-input"
          style={{minWidth: 'auto', width: '120px'}}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button 
          className={`filter-chip ${statusFilter === 'open' ? 'active' : ''}`}
          onClick={() => setStatusFilter('open')}
          style={{color: 'var(--accent-red)'}}
        >
          Open (47)
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
          style={{color: 'var(--accent-yellow)'}}
        >
          In Progress (12)
        </button>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          data={filteredTickets.map(formatTicketRow)}
        />
        <div className="pagination">
          <div className="page-info">
            Showing 1–{Math.min(15, filteredTickets.length)} of {filteredTickets.length} tickets
          </div>
          <div className="page-btns">
            <button className="page-btn">«</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </Panel>

      {/* Support Analytics */}
      <div className="grid-2" style={{marginTop: '20px'}}>
        <Panel title="Ticket Categories">
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {[
              { category: 'Account Issues', count: 18, color: 'var(--accent-red)' },
              { category: 'Trading Problems', count: 12, color: 'var(--accent-yellow)' },
              { category: 'Deposit/Withdrawal', count: 8, color: 'var(--accent-cyan)' },
              { category: 'KYC Verification', count: 6, color: 'var(--accent-green)' },
              { category: 'Technical Support', count: 3, color: 'var(--accent-blue)' }
            ].map((item, index) => (
              <div key={index} className="category-item">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                  <div 
                    style={{
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: item.color
                    }}
                  ></div>
                  <span style={{fontSize: '12px'}}>{item.category}</span>
                </div>
                <span style={{fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)'}}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Response Time Metrics">
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>First Response</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-green)'}}>{'< 2h'}</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Resolution Time</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-cyan)'}}>{'< 24h'}</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Customer Rating</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-yellow)'}}>4.7/5</span>
            </div>
            <div className="metric-row">
              <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Escalation Rate</span>
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent-red)'}}>2.1%</span>
            </div>
            <button 
              className="btn btn-outline"
              style={{width: '100%', marginTop: '8px'}}
              onClick={() => showToast('info', 'Detailed analytics coming soon')}
            >
              📊 View Detailed Analytics
            </button>
          </div>
        </Panel>
      </div>

      {/* Quick Actions */}
      <div className="grid-3-1" style={{marginTop: '20px'}}>
        <Panel title="Urgent Tickets">
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {filteredTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 4).map((ticket) => (
              <div key={ticket.id} className="urgent-ticket-item">
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                  <span className={`badge ${ticket.priority}`} style={{fontSize: '8px', padding: '2px 4px'}}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <div>
                    <div style={{fontSize: '11px', fontWeight: '500'}}>#{String(ticket.id).padStart(4, '0')}</div>
                    <div style={{fontSize: '10px', color: 'var(--text-tertiary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {ticket.subject}
                    </div>
                  </div>
                </div>
                <button 
                  className="action-btn view"
                  style={{padding: '4px 8px', fontSize: '10px'}}
                  onClick={() => showToast('info', 'Ticket details modal coming soon')}
                >
                  View
                </button>
              </div>
            ))}
            {filteredTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length === 0 && (
              <div style={{textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', padding: '20px'}}>
                No urgent tickets
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Support Team">
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Assign tickets modal coming soon')}
            >
              👥 Assign Tickets
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Team performance coming soon')}
            >
              📊 Team Performance
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Escalation rules coming soon')}
            >
              ⚡ Escalation Rules
            </button>
            <button 
              className="btn btn-outline"
              style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
              onClick={() => showToast('info', 'Auto-responses coming soon')}
            >
              🤖 Auto Responses
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// Mock data for support tickets
const mockTickets = [
  {
    id: 1,
    user: 'John Doe',
    subject: 'Cannot withdraw funds',
    description: 'I am unable to withdraw my Bitcoin. The transaction keeps failing.',
    category: 'Deposit/Withdrawal',
    priority: 'high',
    status: 'open',
    created_at: '2024-03-13 09:30',
    updated_at: '2024-03-13 09:30'
  },
  {
    id: 2,
    user: 'Sarah Miller',
    subject: 'KYC verification stuck',
    description: 'My KYC has been pending for 3 days without any update.',
    category: 'KYC Verification',
    priority: 'medium',
    status: 'in_progress',
    created_at: '2024-03-12 14:20',
    updated_at: '2024-03-13 08:15'
  },
  {
    id: 3,
    user: 'Alex Kumar',
    subject: 'Trading order not executed',
    description: 'My limit order was not executed despite price reaching the target.',
    category: 'Trading Problems',
    priority: 'high',
    status: 'open',
    created_at: '2024-03-13 11:45',
    updated_at: '2024-03-13 11:45'
  },
  {
    id: 4,
    user: 'Emma Wilson',
    subject: 'Account locked after login attempts',
    description: 'My account got locked after I forgot my password and tried multiple times.',
    category: 'Account Issues',
    priority: 'urgent',
    status: 'open',
    created_at: '2024-03-13 13:20',
    updated_at: '2024-03-13 13:20'
  },
  {
    id: 5,
    user: 'Priya Patel',
    subject: 'Mobile app crashing',
    description: 'The mobile app crashes every time I try to place a trade.',
    category: 'Technical Support',
    priority: 'medium',
    status: 'resolved',
    created_at: '2024-03-11 16:30',
    updated_at: '2024-03-12 10:45'
  },
  {
    id: 6,
    user: 'Carlos Ruiz',
    subject: 'Deposit not credited',
    description: 'I sent USDT 2 hours ago but it is not showing in my account.',
    category: 'Deposit/Withdrawal',
    priority: 'high',
    status: 'in_progress',
    created_at: '2024-03-13 12:00',
    updated_at: '2024-03-13 12:30'
  },
  {
    id: 7,
    user: 'Lisa Chen',
    subject: '2FA not working',
    description: 'Google Authenticator codes are not being accepted.',
    category: 'Account Issues',
    priority: 'medium',
    status: 'open',
    created_at: '2024-03-13 10:15',
    updated_at: '2024-03-13 10:15'
  }
];

export default TicketsTab;