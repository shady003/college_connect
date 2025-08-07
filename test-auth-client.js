// Test authentication from client side
// Run this in browser console on localhost:5173

fetch('http://localhost:3000/api/test-auth', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log('Auth test result:', data))
.catch(error => console.error('Auth test error:', error));