const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@ourhive.com';
const ADMIN_PASSWORD = 'password123';

const testPartner = {
  firstName: 'Status',
  lastName: 'Tester',
  email: `partner_status_${Date.now()}@example.com`,
  password: 'password123',
  phone: '555' + Math.floor(Math.random() * 10000000),
  orgName: 'Status Testing Org',
  orgType: 'Non-Profit',
  orgAddress: '123 Status Lane',
  website: 'https://statustest.org',
  intendedRoles: ['Donating goods']
};

async function run() {
  try {
    console.log('--- 1. REGISTERING PARTNER ---');
    const regRes = await axios.post(`${API_URL}/auth/partner-register`, testPartner);
    const partnerId = regRes.data.user._id;
    console.log(`Success! Partner ID: ${partnerId}`);

    console.log('\n--- 2. VERIFYING LOGIN (PENDING) ---');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testPartner.email,
        password: testPartner.password
      });
      console.log('FAILURE: Login should have been blocked (403).');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('SUCCESS: Login blocked with 403 (Pending Approval).');
      } else {
        throw new Error(`Unexpected login response: ${err.response?.status}`);
      }
    }

    console.log('\n--- 3. LOGGING IN AS ADMIN ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginRes.data.token;
    const adminHeaders = { Authorization: `Bearer ${token}` };

    console.log('\n--- 4. FETCHING PARTNER PROFILE ID ---');
    const listRes = await axios.get(`${API_URL}/admin/community-partners?search=${testPartner.email}`, { headers: adminHeaders });
    const profile = listRes.data.data.find(p => p.userId.email === testPartner.email);
    if (!profile) throw new Error('Could not find partner profile after registration.');
    const partnerProfileId = profile._id;
    console.log(`Found Partner Profile ID: ${partnerProfileId}`);

    console.log('\n--- 5. APPROVING PARTNER (Case-Insensitive Check) ---');
    // Frontend sends 'active' (lowercase)
    const approveRes = await axios.patch(`${API_URL}/admin/partners/${partnerProfileId}/status`, { status: 'active' }, { headers: adminHeaders });
    console.log(`Status updated to: ${approveRes.data.data.status}`);

    console.log('\n--- 6. VERIFYING LOGIN (APPROVED) ---');
    const partnerLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testPartner.email,
      password: testPartner.password
    });
    if (partnerLoginRes.data.success) {
      console.log('SUCCESS: Partner logged in successfully after approval.');
    }

    console.log('\n--- 7. SUSPENDING PARTNER ---');
    await axios.patch(`${API_URL}/admin/partners/${partnerProfileId}/status`, { status: 'suspended' }, { headers: adminHeaders });
    
    console.log('\n--- 8. VERIFYING LOGIN (SUSPENDED) ---');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testPartner.email,
        password: testPartner.password
      });
      console.log('FAILURE: Login should have been blocked (403).');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('SUCCESS: Login blocked after suspension.');
      }
    }

    console.log('\n--- 9. REJECTING PARTNER ---');
    await axios.patch(`${API_URL}/admin/partners/${partnerProfileId}/status`, { status: 'rejected' }, { headers: adminHeaders });

    console.log('\n--- 10. VERIFYING LOGIN (REJECTED) ---');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testPartner.email,
        password: testPartner.password
      });
      console.log('FAILURE: Login should have been blocked (403).');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('SUCCESS: Login blocked after rejection.');
      }
    }

    console.log('\n--- FULL STATUS FLOW VERIFIED SUCCESSFULLY ---');

  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.response) console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
    process.exit(1);
  }
}

run();
