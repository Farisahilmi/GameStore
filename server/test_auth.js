const axios = require('axios');

const testAuth = async () => {
  const API_URL = 'http://localhost:3000/api/auth';
  const API_KEY = '30035be176e0448bb45ce782377409ce';
  axios.defaults.headers.common['x-api-key'] = API_KEY;

  try {
    console.log('--- Testing Register ---');
    const registerRes = await axios.post(`${API_URL}/register`, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'USER'
    });
    console.log('Register Success:', registerRes.data);
    
    console.log('\n--- Testing Login ---');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login Success:', loginRes.data);

    // Test Admin Register
    console.log('\n--- Testing Admin Register ---');
    const adminRegisterRes = await axios.post(`${API_URL}/register`, {
        email: 'admin@example.com',
        password: 'adminpassword',
        name: 'Admin User',
        role: 'ADMIN'
      });
      console.log('Admin Register Success:', adminRegisterRes.data);

  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testAuth();
