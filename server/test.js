// Simple test script to verify API endpoints
async function testEndpoints() {
  const BASE_URL = 'https://tourism-guide-backend.onrender.com';
  
  // Test health endpoint
  console.log('Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    console.log('Health Status:', healthResponse.status);
    console.log('Health Response:', await healthResponse.json());
  } catch (error) {
    console.error('Health check failed:', error);
  }

  // Test registration endpoint
  console.log('\nTesting registration endpoint...');
  try {
    // First, send OPTIONS request
    const optionsResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://tourism-guide-2rjlqxqf4-aaaaryaannn-gmailcoms-projects.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('OPTIONS Headers:', Object.fromEntries(optionsResponse.headers));

    // Then, send actual registration request
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://tourism-guide-2rjlqxqf4-aaaaryaannn-gmailcoms-projects.vercel.app'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    console.log('Register Status:', registerResponse.status);
    console.log('Register Headers:', Object.fromEntries(registerResponse.headers));
    console.log('Register Response:', await registerResponse.json());
  } catch (error) {
    console.error('Registration test failed:', error);
  }
}

testEndpoints(); 