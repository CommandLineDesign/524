#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, ne, and } from 'drizzle-orm';
import 'dotenv/config';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';
import { users } from './schema/users.js';

const { Pool } = pg;

// Test users seeded into database for development
// These match the TEST_ACCOUNTS shown in mobile LoginScreen
const TEST_USERS = [
  // Demo accounts for development
  {
    id: '11111111-1111-1111-1111-111111111111',
    phone_number: '010-0000-0001',
    email: 'demo-customer@524.app',
    name: '데모 고객',
    role: 'customer',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    phone_number: '010-0000-0002',
    email: 'demo-artist@524.app',
    name: '데모 아티스트',
    role: 'artist',
  },
  // Test accounts matching EMAIL_AUTH_SETUP.md
  {
    id: '0eddd84a-a6ee-457b-820d-fcb92df01364',
    phone_number: '010-1234-5678',
    email: 'customer@test.com',
    name: '김고객',
    role: 'customer',
  },
  {
    id: 'dd79e0ed-8d84-49e8-89c5-14ed29c91b7d',
    phone_number: '010-2345-6789',
    email: 'customer2@test.com',
    name: '이고객',
    role: 'customer',
  },
  {
    id: '8300b21f-5604-4425-9587-52988df72584',
    phone_number: '010-3456-7890',
    email: 'artist@test.com',
    name: '박아티스트',
    role: 'artist',
  },
  {
    id: '690ff391-991c-457d-991d-0b81541900e8',
    phone_number: '010-4567-8901',
    email: 'artist2@test.com',
    name: '최아티스트',
    role: 'artist',
  },
  {
    id: '2c51dea4-49f1-4abe-8838-7f469a01fc1e',
    phone_number: '010-9999-9999',
    email: 'admin@test.com',
    name: '관리자',
    role: 'admin',
  },
];

const TEST_PASSWORD = 'password@1234';

async function seed() {
  const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/beauty_marketplace';
  
  console.log('🌱 Seeding database with mock users...');
  
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);
  
  try {
    // Hash password once for all users
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    console.log('🔐 Generated password hash');
    
    // Insert or update test users
    for (const testUser of TEST_USERS) {
      try {
        // Clean up conflicting users (same phone, different ID)
        await db.delete(users)
          .where(
            and(
              eq(users.phoneNumber, testUser.phone_number),
              ne(users.id, testUser.id)
            )
          );

        await db.insert(users).values({
          id: testUser.id,
          phoneNumber: testUser.phone_number,
          email: testUser.email,
          passwordHash,
          name: testUser.name,
          role: testUser.role,
          phoneVerified: true,
          isActive: true,
          isVerified: true,
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            passwordHash,
            email: testUser.email,
            phoneVerified: true,
            isActive: true,
            isVerified: true,
          }
        });
        
        console.log(`✅ Seeded user: ${testUser.email} (${testUser.role})`);
      } catch (error) {
        console.error(`❌ Failed to seed ${testUser.email}:`, error);
      }
    }
    
    console.log('\n✅ Seeding complete!');
    console.log('\n📝 Test credentials:');
    console.log('   Email: Any of the emails above');
    console.log(`   Password: ${TEST_PASSWORD}\n`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

