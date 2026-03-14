// Simple test script to verify admin dashboard functionality
console.log('🔧 Testing Admin Dashboard...');

// Test 1: Check if backend is accessible
async function testBackend() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        console.log('✅ Backend is accessible:', response.status);
        return true;
    } catch (error) {
        console.error('❌ Backend not accessible:', error.message);
        return false;
    }
}

// Test 2: Login as admin
async function testAdminLogin() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@cryptoexchange.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Admin login successful');
            console.log('  User:', data.user.name);
            console.log('  Is Admin:', data.user.is_admin);
            localStorage.setItem('auth_token', data.token);
            return data.token;
        } else {
            console.error('❌ Admin login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return null;
    }
}

// Test 3: Test dashboard API
async function testDashboardAPI(token) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Dashboard API working');
            console.log('  Total Users:', data.data.stats.total_users);
            console.log('  Total Deposits:', data.data.stats.total_deposits);
            console.log('  Recent Transactions:', data.data.recent_transactions.length);
            return true;
        } else {
            console.error('❌ Dashboard API failed:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Dashboard API error:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting admin dashboard tests...\n');
    
    const backendOk = await testBackend();
    if (!backendOk) {
        console.log('❌ Backend test failed - stopping tests');
        return;
    }
    
    const token = await testAdminLogin();
    if (!token) {
        console.log('❌ Login test failed - stopping tests');
        return;
    }
    
    const dashboardOk = await testDashboardAPI(token);
    if (!dashboardOk) {
        console.log('❌ Dashboard API test failed');
        return;
    }
    
    console.log('\n🎉 All tests passed! Admin dashboard should work.');
    console.log('📝 Next steps:');
    console.log('  1. Open http://localhost:5174/admin');
    console.log('  2. Check browser console for any errors');
    console.log('  3. Verify dashboard loads with real data');
}

// Auto-run tests
runTests();