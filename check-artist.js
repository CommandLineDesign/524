import { eq } from 'drizzle-orm';
import { db } from './packages/api/src/db/client.js';
import { artistProfiles } from './packages/database/src/schema/artistProfiles.js';

(async () => {
  try {
    const result = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.id, '52128a6e-1e42-427f-8a7f-bf4b6765511b'));

    console.log('Artist profile found:', result.length > 0);
    if (result.length > 0) {
      console.log('Profile ID:', result[0].id);
      console.log('User ID:', result[0].userId);
      console.log('Stage Name:', result[0].stageName);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
})();
