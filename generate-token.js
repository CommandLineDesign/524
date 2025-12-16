// Simple script to generate a test token
const jwt = require('jsonwebtoken');

const userId = '11111111-1111-1111-1111-111111111111'; // TEST_USERS.customer1
const role = 'customer';
const roles = ['customer'];

const token = jwt.sign(
  {
    user_id: userId,
    role,
    roles,
    phone_number: '',
    token_version: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  },
  'dev-secret' // Default JWT secret for development
);

console.log('Customer token:', token);
