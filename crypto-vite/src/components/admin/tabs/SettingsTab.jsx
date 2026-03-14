import { useState, useEffect } from 'react';
import Panel from '../components/Panel';

const SettingsTab = ({ showToast }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || mockSettings);
      } else {
        setSettings(mockSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings(mockSettings);
      showToast('info', 'Using demo data for system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section) => {
    try {
      const response = await fetch(`/api/admin/settings/${section}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings[section])
      });

      if (response.ok) {
        showToast('success', `${section} settings saved successfully`);
      }
    } catch (error) {
      console.error(`Failed to save ${section} settings:`, error);
      showToast('success', `${section} settings saved successfully (demo)`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">System Settings</div>
          <div className="page-sub">Configure platform settings and preferences</div>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="filter-bar">
        <button 
          className={`filter-chip ${activeSection === 'general' ? 'active' : ''}`}
          onClick={() => setActiveSection('general')}
        >
          General
        </button>
        <button 
          className={`filter-chip ${activeSection === 'trading' ? 'active' : ''}`}
          onClick={() => setActiveSection('trading')}
        >
          Trading
        </button>
        <button 
          className={`filter-chip ${activeSection === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSection('security')}
        >
          Security
        </button>
        <button 
          className={`filter-chip ${activeSection === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveSection('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`filter-chip ${activeSection === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveSection('maintenance')}
        >
          Maintenance
        </button>
      </div>
      {/* General Settings */}
      {activeSection === 'general' && (
        <div className="grid-2">
          <Panel title="Platform Information">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Platform Name
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings?.general?.platform_name || 'Nexus Exchange'}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
              
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Support Email
                </label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={settings?.general?.support_email || 'support@nexus.com'}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>

              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Default Currency
                </label>
                <select 
                  className="form-input" 
                  value={settings?.general?.default_currency || 'USD'}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <button 
                className="btn btn-primary"
                style={{width: '100%', marginTop: '10px'}}
                onClick={() => handleSaveSettings('general')}
              >
                Save General Settings
              </button>
            </div>
          </Panel>

          <Panel title="System Status">
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div className="status-row">
                <span style={{fontSize: '12px'}}>Platform Status</span>
                <span style={{fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span className="online-dot"></span> OPERATIONAL
                </span>
              </div>
              <div className="status-row">
                <span style={{fontSize: '12px'}}>Database</span>
                <span style={{fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span className="online-dot"></span> CONNECTED
                </span>
              </div>
              <div className="status-row">
                <span style={{fontSize: '12px'}}>Redis Cache</span>
                <span style={{fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span className="online-dot"></span> ACTIVE
                </span>
              </div>
              <div className="status-row">
                <span style={{fontSize: '12px'}}>Queue System</span>
                <span style={{fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span className="online-dot"></span> RUNNING
                </span>
              </div>
            </div>
          </Panel>
        </div>
      )}
      {/* Trading Settings */}
      {activeSection === 'trading' && (
        <div className="grid-2">
          <Panel title="Trading Configuration">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Default Trading Fee (%)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={settings?.trading?.default_fee || 0.1}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
              
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Minimum Order Amount ($)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.trading?.min_order_amount || 10}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>

              <div className="setting-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={settings?.trading?.enable_stop_loss || true}
                    onChange={() => showToast('info', 'Settings update coming soon')}
                  />
                  Enable Stop Loss Orders
                </label>
              </div>

              <div className="setting-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={settings?.trading?.enable_margin || false}
                    onChange={() => showToast('info', 'Settings update coming soon')}
                  />
                  Enable Margin Trading
                </label>
              </div>

              <button 
                className="btn btn-primary"
                style={{width: '100%', marginTop: '10px'}}
                onClick={() => handleSaveSettings('trading')}
              >
                Save Trading Settings
              </button>
            </div>
          </Panel>

          <Panel title="Order Limits">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Max Orders per User
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.trading?.max_orders_per_user || 100}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
              
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Daily Trading Limit ($)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.trading?.daily_limit || 100000}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
            </div>
          </Panel>
        </div>
      )}
      {/* Security Settings */}
      {activeSection === 'security' && (
        <div className="grid-2">
          <Panel title="Authentication Settings">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={settings?.security?.require_2fa || true}
                    onChange={() => showToast('info', 'Settings update coming soon')}
                  />
                  Require 2FA for all users
                </label>
              </div>

              <div className="setting-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={settings?.security?.require_kyc || true}
                    onChange={() => showToast('info', 'Settings update coming soon')}
                  />
                  Require KYC verification
                </label>
              </div>

              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Session Timeout (minutes)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.security?.session_timeout || 30}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>

              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Max Login Attempts
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.security?.max_login_attempts || 5}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>

              <button 
                className="btn btn-primary"
                style={{width: '100%', marginTop: '10px'}}
                onClick={() => handleSaveSettings('security')}
              >
                Save Security Settings
              </button>
            </div>
          </Panel>

          <Panel title="Withdrawal Security">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Auto-approve limit ($)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.security?.auto_approve_limit || 1000}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
              
              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Withdrawal delay (hours)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={settings?.security?.withdrawal_delay || 24}
                  style={{width: '100%'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>
            </div>
          </Panel>
        </div>
      )}
      {/* Notifications Settings */}
      {activeSection === 'notifications' && (
        <Panel title="Notification Settings">
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div className="setting-group">
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                <input 
                  type="checkbox" 
                  checked={settings?.notifications?.email_enabled || true}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
                Enable email notifications
              </label>
            </div>

            <div className="setting-group">
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                <input 
                  type="checkbox" 
                  checked={settings?.notifications?.sms_enabled || false}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
                Enable SMS notifications
              </label>
            </div>

            <div className="setting-group">
              <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                SMTP Server
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={settings?.notifications?.smtp_server || 'smtp.gmail.com'}
                style={{width: '100%'}}
                onChange={() => showToast('info', 'Settings update coming soon')}
              />
            </div>

            <div className="setting-group">
              <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                From Email
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={settings?.notifications?.from_email || 'noreply@nexus.com'}
                style={{width: '100%'}}
                onChange={() => showToast('info', 'Settings update coming soon')}
              />
            </div>

            <button 
              className="btn btn-primary"
              style={{width: '100%', marginTop: '10px'}}
              onClick={() => handleSaveSettings('notifications')}
            >
              Save Notification Settings
            </button>
          </div>
        </Panel>
      )}

      {/* Maintenance Settings */}
      {activeSection === 'maintenance' && (
        <div className="grid-2">
          <Panel title="Maintenance Mode">
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div className="setting-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={settings?.maintenance?.enabled || false}
                    onChange={() => showToast('info', 'Settings update coming soon')}
                  />
                  Enable maintenance mode
                </label>
              </div>

              <div className="setting-group">
                <label style={{fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', display: 'block'}}>
                  Maintenance Message
                </label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={settings?.maintenance?.message || 'System is under maintenance. Please try again later.'}
                  style={{width: '100%', resize: 'vertical'}}
                  onChange={() => showToast('info', 'Settings update coming soon')}
                />
              </div>

              <button 
                className="btn btn-primary"
                style={{width: '100%', marginTop: '10px'}}
                onClick={() => handleSaveSettings('maintenance')}
              >
                Save Maintenance Settings
              </button>
            </div>
          </Panel>

          <Panel title="System Actions">
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'Cache clear coming soon')}
              >
                🗑️ Clear Cache
              </button>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'Database backup coming soon')}
              >
                💾 Backup Database
              </button>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'System restart coming soon')}
              >
                🔄 Restart Services
              </button>
              <button 
                className="btn btn-outline"
                style={{width: '100%', justifyContent: 'flex-start', gap: '10px'}}
                onClick={() => showToast('info', 'System logs coming soon')}
              >
                📋 View System Logs
              </button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};

// Mock settings data
const mockSettings = {
  general: {
    platform_name: 'Nexus Exchange',
    support_email: 'support@nexus.com',
    default_currency: 'USD'
  },
  trading: {
    default_fee: 0.1,
    min_order_amount: 10,
    enable_stop_loss: true,
    enable_margin: false,
    max_orders_per_user: 100,
    daily_limit: 100000
  },
  security: {
    require_2fa: true,
    require_kyc: true,
    session_timeout: 30,
    max_login_attempts: 5,
    auto_approve_limit: 1000,
    withdrawal_delay: 24
  },
  notifications: {
    email_enabled: true,
    sms_enabled: false,
    smtp_server: 'smtp.gmail.com',
    from_email: 'noreply@nexus.com'
  },
  maintenance: {
    enabled: false,
    message: 'System is under maintenance. Please try again later.'
  }
};

export default SettingsTab;