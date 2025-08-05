const axios = require('axios');

const testAPI = async () => {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    console.log('Testing API endpoints...');
    
    // Test groups endpoint
    try {
      const groupsResponse = await axios.get(`${baseURL}/groups`);
      console.log('✅ Groups endpoint working:', groupsResponse.data);
    } catch (err) {
      console.log('❌ Groups endpoint failed:', err.message);
    }
    
    // Test events endpoint
    try {
      const eventsResponse = await axios.get(`${baseURL}/events`);
      console.log('✅ Events endpoint working:', eventsResponse.data);
    } catch (err) {
      console.log('❌ Events endpoint failed:', err.message);
    }
    
    // Test resources endpoint
    try {
      const resourcesResponse = await axios.get(`${baseURL}/resources`);
      console.log('✅ Resources endpoint working:', resourcesResponse.data);
    } catch (err) {
      console.log('❌ Resources endpoint failed:', err.message);
    }
    
  } catch (error) {
    console.error('API test failed:', error.message);
  }
};

testAPI();