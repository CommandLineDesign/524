import { users } from '@524/database';
import { eq } from 'drizzle-orm';
import { db } from './packages/api/src/db/client.js';

const artistUserId = 'b3daace1-85b3-43a4-8f94-a22c1b589213';

(async () => {
  try {
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, artistUserId));

    if (userResult.length > 0) {
      console.log('Artist "g" information:');
      console.log('User ID:', userResult[0].id);
      console.log('Name:', userResult[0].name);
      console.log('Email:', userResult[0].email);
      console.log('Role:', userResult[0].role);
    } else {
      console.log('Artist "g" not found in users table');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
})();
