// Simple test to check if groups are being returned correctly
const testGroups = async () => {
  try {
    // This would be the API call from the frontend
    const response = await fetch('http://localhost:3000/api/groups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token here in real scenario
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Groups response:', data);
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
};

// Test the endpoint
testGroups();