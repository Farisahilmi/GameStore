const axios = require('axios');

const testTransactions = async () => {
  const API_URL = 'http://localhost:3000/api';
  
  try {
    // 1. Login as Admin to get a game ID
    console.log('--- Setup: Login as Admin ---');
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'adminpassword'
    });
    const adminToken = adminLogin.data.data.token;
    
    // Create a dummy game
    const gameRes = await axios.post(`${API_URL}/games`, {
      title: 'The Witcher 3',
      description: 'RPG Masterpiece',
      price: 19.99
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const gameId = gameRes.data.data.id;
    console.log('Game Created:', gameRes.data.data.title, '(ID:', gameId, ')');


    // 2. Login as Normal User
    console.log('\n--- Login as User ---');
    const userLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const userToken = userLogin.data.data.token;
    console.log('User Logged in');
    
    const userConfig = {
      headers: { Authorization: `Bearer ${userToken}` }
    };

    // 3. Buy Game
    console.log('\n--- Buy Game ---');
    const transactionRes = await axios.post(`${API_URL}/transactions`, {
      gameIds: [gameId]
    }, userConfig);
    console.log('Transaction Success:', transactionRes.data.data.status);

    // 4. Get User Transactions
    console.log('\n--- Get My Transactions ---');
    const myTrans = await axios.get(`${API_URL}/transactions/my-transactions`, userConfig);
    console.log('My Transactions Count:', myTrans.data.data.length);

    // 5. Fail to buy same game again
    console.log('\n--- Try Buying Same Game Again (Should Fail) ---');
    try {
        await axios.post(`${API_URL}/transactions`, {
            gameIds: [gameId]
        }, userConfig);
    } catch (e) {
        console.log('Expected Error:', e.response.data.error);
    }

  } catch (error) {
    if (error.response) {
        console.error('Error:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
  }
};

testTransactions();
