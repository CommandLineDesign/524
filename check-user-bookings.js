import { and, eq } from 'drizzle-orm';
import { db } from './packages/api/src/db/client.js';
import { bookings, users } from './packages/database/src/schema/index.js';

const artistUserId = 'a6fa7bee-142a-4466-95e2-4f2b2ed02c14';

(async () => {
  try {
    console.log('=== Checking User ===');
    const userResult = await db.select().from(users).where(eq(users.id, artistUserId));

    console.log('User exists:', userResult.length > 0);
    if (userResult.length > 0) {
      console.log('User:', {
        id: userResult[0].id,
        name: userResult[0].name,
        email: userResult[0].email,
        role: userResult[0].role,
      });
    }

    console.log('\n=== Checking Pending Bookings for Artist ===');
    const bookingResult = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        customerId: bookings.customerId,
        artistId: bookings.artistId,
        status: bookings.status,
        serviceType: bookings.serviceType,
        occasion: bookings.occasion,
        scheduledDate: bookings.scheduledDate,
        totalAmount: bookings.totalAmount,
      })
      .from(bookings)
      .where(and(eq(bookings.artistId, artistUserId), eq(bookings.status, 'pending')));

    console.log(`Found ${bookingResult.length} pending bookings for artist ${artistUserId}`);
    if (bookingResult.length > 0) {
      console.log(
        'Bookings:',
        bookingResult.map((b) => ({
          id: b.id,
          bookingNumber: b.bookingNumber,
          status: b.status,
          serviceType: b.serviceType,
          occasion: b.occasion,
          scheduledDate: b.scheduledDate?.toISOString(),
          totalAmount: b.totalAmount,
        }))
      );
    } else {
      console.log('No pending bookings found for this artist.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
})();
