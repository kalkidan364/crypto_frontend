import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ToastProvider } from './contexts/ToastContext';
import VerifiedRoute from './components/common/VerifiedRoute';
import AdminRoute from './components/common/AdminRoute';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import CryptoDeposit from './pages/CryptoDeposit';
import Deposit from './pages/Deposit';
import Withdrawal from './pages/Withdrawal';
import Convert from './pages/Convert';
import Withdraw from './pages/Withdraw';
import Security from './pages/Security';
import Settings from './pages/Settings';
import EducationalScamDemo from './pages/EducationalScamDemo';
import './styles/components/educational-demo.css';
import './App.css';

function App() {
  console.log('App component rendering...');
  
  return (
    <AuthProvider>
      <ToastProvider>
        <LayoutProvider>
          <Router>
        <Routes>
          {/* Landing page at root without layout */}
          <Route path="/" element={<Landing />} />
          
          {/* Login page without layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Register page without layout */}
          <Route path="/register" element={<Register />} />
          
          {/* Password reset pages without layout */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Educational Scam Demo - Public access for learning */}
          <Route path="/educational-scam-demo" element={<EducationalScamDemo />} />
          
          {/* Admin page with admin protection */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          
          {/* Protected main app routes with layout - REQUIRES EMAIL VERIFICATION */}
          <Route path="/dashboard" element={
            <VerifiedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/markets" element={
            <VerifiedRoute>
              <Layout>
                <Markets />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/trade" element={
            <VerifiedRoute>
              <Layout>
                <Trade />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/trade/:crypto" element={
            <VerifiedRoute>
              <Layout>
                <Trade />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/history" element={
            <VerifiedRoute>
              <Layout>
                <History />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/orders" element={
            <VerifiedRoute>
              <Layout>
                <Orders />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/assets" element={
            <VerifiedRoute>
              <Layout>
                <Assets />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/analytics" element={
            <VerifiedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/reports" element={
            <VerifiedRoute>
              <Layout>
                <Reports />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/staking" element={
            <VerifiedRoute>
              <Layout>
                <Staking />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/nfts" element={
            <VerifiedRoute>
              <Layout>
                <NFTs />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/deposit" element={
            <VerifiedRoute>
              <Layout>
                <Deposit />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/deposit/:crypto" element={
            <VerifiedRoute>
              <Layout>
                <CryptoDeposit />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/withdrawal" element={
            <VerifiedRoute>
              <Layout>
                <Withdrawal />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/withdraw" element={
            <VerifiedRoute>
              <Layout>
                <Withdraw />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/withdraw/:crypto" element={
            <VerifiedRoute>
              <Layout>
                <Withdraw />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/convert" element={
            <VerifiedRoute>
              <Layout>
                <Convert />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/security" element={
            <VerifiedRoute>
              <Layout>
                <Security />
              </Layout>
            </VerifiedRoute>
          } />
          
          <Route path="/settings" element={
            <VerifiedRoute>
              <Layout>
                <Settings />
              </Layout>
            </VerifiedRoute>
          } />
        </Routes>
      </Router>
      </LayoutProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
