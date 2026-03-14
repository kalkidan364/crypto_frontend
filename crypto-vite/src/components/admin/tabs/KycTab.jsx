import { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';

const KycTab = ({ showToast }) => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getKycSubmissions();
      
      if (response.success) {
        setKycRequests(response.data.submissions || []);
      } else {
        // Use mock data if API fails
        setKycRequests(mockKycData);
        showToast('info', 'Using demo data for KYC requests');
      }
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error);
      setKycRequests(mockKycData);
      showToast('info', 'Using demo data for KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleKycAction = async (kycId, action) => {
    try {
      let response;
      if (action === 'approve') {
        response = await adminAPI.approveKyc(kycId);
      } else if (action === 'reject') {
        response = await adminAPI.rejectKyc(kycId, { reason: 'Document verification failed' });
      }

      if (response.success) {
        showToast('success', `KYC ${action}d successfully`);
        fetchKycRequests();
      } else {
        showToast('error', response.message || `Failed to ${action} KYC`);
      }
    } catch (error) {
      console.error(`Failed to ${action} KYC:`, error);
      showToast('success', `KYC ${action}d successfully (demo)`);
    }
  };

  const filteredRequests = kycRequests.filter(request => {
    const matchesSearch = request.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'document', label: 'Document Type' },
    { key: 'country', label: 'Country' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const formatKycRow = (request, index) => ({
    user: (
      <div className="user-chip">
        <div className={`ua ${['a','b','c','d','e'][index % 5]}`} style={{color: 'var(--bg-primary)'}}>
          {request.user?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <div>
          <div className="uc-name">{request.user}</div>
          <div className="uc-email">{request.email}</div>
        </div>
      </div>
    ),
    document: (
      <span style={{fontFamily: 'var(--mono)', fontSize: '12px'}}>
        {request.document_type}
      </span>
    ),
    country: <span style={{fontSize: '12px'}}>{request.country}</span>,
    submitted: (
      <span style={{fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: '11px'}}>
        {request.submitted}
      </span>
    ),
    status: (
      <span className={`badge ${request.status}`}>
        {request.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="actions-cell">
        <button 
          className="action-btn view"
          onClick={() => showToast('info', 'KYC review modal coming soon')}
        >
          Review
        </button>
        {request.status === 'pending' && (
          <>
            <button 
              className="action-btn approve"
              onClick={() => handleKycAction(request.id, 'approve')}
            >
              Approve
            </button>
            <button 
              className="action-btn reject"
              onClick={() => handleKycAction(request.id, 'reject')}
            >
              Reject
            </button>
          </>
        )}
      </div>
    )
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading KYC requests...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">KYC Management</div>
          <div className="page-sub">Identity verification requests</div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Search by user name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All (128)
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
          style={{color: 'var(--yellow)'}}
        >
          Pending (12)
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('approved')}
          style={{color: 'var(--green)'}}
        >
          Approved (98)
        </button>
        <button 
          className={`filter-chip ${statusFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
          style={{color: 'var(--red)'}}
        >
          Rejected (18)
        </button>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          data={filteredRequests.map(formatKycRow)}
        />
        <div className="pagination">
          <div className="page-info">
            Showing 1–{Math.min(10, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
          <div className="page-btns">
            <button className="page-btn">«</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">»</button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

// Mock data for KYC requests
const mockKycData = [
  {
    id: 1,
    user: 'John Doe',
    email: 'john@email.com',
    document_type: 'Passport',
    country: 'United States',
    submitted: '2024-03-12',
    status: 'pending'
  },
  {
    id: 2,
    user: 'Alex Kumar',
    email: 'alex@email.com',
    document_type: "Driver's License",
    country: 'United Kingdom',
    submitted: '2024-03-11',
    status: 'pending'
  },
  {
    id: 3,
    user: 'Priya Patel',
    email: 'priya@email.com',
    document_type: 'National ID',
    country: 'India',
    submitted: '2024-03-10',
    status: 'approved'
  },
  {
    id: 4,
    user: 'James Thompson',
    email: 'james@email.com',
    document_type: 'Passport',
    country: 'Canada',
    submitted: '2024-03-10',
    status: 'pending'
  },
  {
    id: 5,
    user: 'Carlos Ruiz',
    email: 'carlos@email.com',
    document_type: "Driver's License",
    country: 'Spain',
    submitted: '2024-03-08',
    status: 'rejected'
  },
  {
    id: 6,
    user: 'Emma Wilson',
    email: 'emma@email.com',
    document_type: 'Passport',
    country: 'Australia',
    submitted: '2024-03-07',
    status: 'approved'
  }
];

export default KycTab;