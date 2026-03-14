import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import VerifiedRoute from './components/common/VerifiedRoute';
import AdminRoute from './components/common/AdminRoute';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Trade from './pages/Trade';
import History from './pages/History';
import Orders from './pages/Orders';
import Assets from './pages/Assets';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Staking from './pages/Staking';
import NFTs from './pages/NFTs';
import Deposit from './pages/Deposit';
import Withdrawal from './pages/Withdrawal';
import UserStatus from './pages/UserStatus';
import AuthTest from './pages/AuthTest';
import Security from './pages/Security';
import TestDashboard from './pages/TestDashboard';
import './App.css';

function App() {
  console.log('App component rendering...');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page at root without layout */}
          <Route path="/" element={<Landing />} />
          
          {/* Login page without layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Register page without layout */}
          <Route path="/register" element={<Register />} />
          
          {/* Debug page for testing user status */}
          <Route path="/status" element={<UserStatus />} />
          
          {/* Auth test page */}
          <Route path="/auth-test" element={<AuthTest />} />
          
          {/* Admin page with admin protection */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          
          {/* Test Dashboard - Simple version for debugging */}
          <Route path="/test-dashboard" element={
            <ProtectedRoute>
              <TestDashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected main app routes with layout - REQUIRES EMAIL VERIFICATION */}
          <Route path="/dashboard" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Dashboard />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/markets" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Markets />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/trade" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Trade />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/history" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <History />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/orders" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Orders />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/assets" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Assets />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/analytics" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Analytics />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/reports" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Reports />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/staking" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Staking />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/nfts" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <NFTs />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/deposit" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Deposit />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/withdrawal" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Withdrawal />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
          
          <Route path="/security" element={
            <VerifiedRoute>
              <div className="layout">
                <Topbar />
                <Sidebar />
                <Security />
                <RightPanel />
              </div>
            </VerifiedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
