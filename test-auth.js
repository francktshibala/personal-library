// test-auth.js - Basic tests for authentication endpoints
require('dotenv').config();
const axios = require('axios');
const colors = require('colors');

// Base URL - change this to your API URL
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Test user data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: 'password123'
};

let authToken = '';

// Helper function to run tests
const runTest = async (name, testFunction) => {
  try {
    console.log(`Running test: ${name}`.cyan);
    await testFunction();
    console.log(`✓ Test passed: ${name}`.green);
    return true;
  } catch (error) {
    console.error(`✗ Test failed: ${name}`.red);
    console.error(`Error: ${error.message}`.red);
    if (error.response) {
      console.error(`Status: ${error.response.status}`.red);
      console.error(`Response data:`, error.response.data);
    }
    return false;
  }
};

// Test functions
const registerUser = async () => {
  const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
  console.log(`Created user: ${response.data.data.username}`);
  authToken = response.data.token;
  
  if (!authToken) {
    throw new Error('No authentication token received');
  }
};

const loginUser = async () => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: testUser.email,
    password: testUser.password
  });
  
  authToken = response.data.token;
  console.log(`Logged in as: ${response.data.data.username}`);
  
  if (!authToken) {
    throw new Error('No authentication token received');
  }
};

const getCurrentUser = async () => {
  const response = await axios.get(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
  
  console.log(`Retrieved user: ${response.data.data.username}`);
  
  if (response.data.data.email !== testUser.email) {
    throw new Error('User email does not match the test user');
  }
};

const testInvalidLogin = async () => {
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: 'wrongpassword'
    });
    
    // If the request succeeds, the test should fail
    throw new Error('Login succeeded with invalid credentials');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // This is the expected outcome
      console.log('Authentication correctly rejected invalid credentials');
      return;
    }
    // Re-throw if it's a different error
    throw error;
  }
};

const testAccessProtectedRoute = async () => {
  // Try to access a protected route without authentication
  try {
    await axios.post(`${BASE_URL}/books`, {
      title: 'Test Book',
      author: '60d5e8a8b390d525e7925b1c', // Dummy ID
      genre: 'Test',
      isbn: '123-456-789',
      publicationDate: new Date(),
      pages: 100,
      format: 'Paperback'
    });
    
    // If the request succeeds, the test should fail
    throw new Error('Accessed protected route without authentication');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // This is the expected outcome
      console.log('Protected route correctly rejected unauthenticated request');
      return;
    }
    // Re-throw if it's a different error
    throw error;
  }
};

// Run tests
const runTests = async () => {
  console.log('Starting authentication tests...'.yellow);
  
  let success = true;
  
  success &= await runTest('Register User', registerUser);
  success &= await runTest('Login User', loginUser);
  success &= await runTest('Get Current User', getCurrentUser);
  success &= await runTest('Reject Invalid Login', testInvalidLogin);
  success &= await runTest('Protect Routes', testAccessProtectedRoute);
  
  if (success) {
    console.log('\nAll tests passed! ✓'.green.bold);
  } else {
    console.log('\nSome tests failed. ✗'.red.bold);
    process.exit(1);
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:'.red, error);
  process.exit(1);
});