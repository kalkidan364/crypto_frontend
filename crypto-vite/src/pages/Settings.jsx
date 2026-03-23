import React, { useState } from 'react';
import '../styles/auth/security.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="security-page">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences and application settings</p>
      </div>

      <div className="security-tabs">
        <button 
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
      </div>

      <div className="security-content">
        {activeTab === 'general' && (
          <div className="security-section">
            <h3>General Settings</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Choose your preferred language</p>
              </div>
              <select className="setting-control">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Currency</h4>
                <p>Default currency for display</p>
              </div>
              <select className="setting-control">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="security-section">
            <h3>Notification Settings</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive important updates via email</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Price Alerts</h4>
                <p>Get notified when prices change</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="security-section">
            <h3>Display Preferences</h3>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Dark Mode</h4>
                <p>Use dark theme for better viewing</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Compact View</h4>
                <p>Show more information in less space</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;