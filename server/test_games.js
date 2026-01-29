const axios = require('axios');

const testGames = async () => {
  const API_URL = 'http://localhost:3000/api';
  
  try {
    // 1. Login as Admin/Publisher (from previous test)
    console.log('--- Login as Admin ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'adminpassword'
    });
    const token = loginRes.data.data.token;
    console.log('Logged in successfully');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Create Game
    console.log('\n--- Create Game ---');
    const gameRes = await axios.post(`${API_URL}/games`, {
      title: 'Cyberpunk 2077',
      description: 'Open world RPG',
      price: 59.99,
      categoryNames: ['RPG', 'Sci-Fi']
    }, config);
    console.log('Game Created:', gameRes.data.data.title);
    const gameId = gameRes.data.data.id;

    // 3. Get All Games (Public)
    console.log('\n--- Get All Games ---');
    const allGames = await axios.get(`${API_URL}/games`);
    console.log('Total Games:', allGames.data.data.meta.total);

    // 4. Update Game
    console.log('\n--- Update Game ---');
    const updateRes = await axios.put(`${API_URL}/games/${gameId}`, {
      price: 29.99
    }, config);
    console.log('Game Updated Price:', updateRes.data.data.price);

    // 5. Delete Game
    console.log('\n--- Delete Game ---');
    await axios.delete(`${API_URL}/games/${gameId}`, config);
    console.log('Game Deleted');

  } catch (error) {
    if (error.response) {
        console.error('Error:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
  }
};

testGames();
