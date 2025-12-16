import { TEST_USERS, generateTestToken } from './packages/api/src/test/fixtures.js';

const adminToken = generateTestToken(TEST_USERS.admin);
console.log('Admin token:', adminToken);

// Now let's decode it to verify
const jwt = JSON.parse(Buffer.from(adminToken.split('.')[1], 'base64').toString());
console.log('Decoded admin token:', jwt);
