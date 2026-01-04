import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@524/database';

import { env } from '../config/env.js';

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to start the API');
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// #region agent log
fetch('http://127.0.0.1:7242/ingest/894ed83a-4085-4fe3-ad0a-11d8954f2764', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'client.ts:16',
    message: 'DB client initialized',
    data: { databaseUrl: env.DATABASE_URL?.replace(/:[^:@]+@/, ':*****@') },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    hypothesisId: 'H3',
  }),
}).catch(() => {});
// #endregion

export const db = drizzle(pool, { schema });
export type Database = typeof db;

// #region agent log
// Check the actual column type in the database for debugging
pool
  .query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_visible'"
  )
  .then((result) => {
    fetch('http://127.0.0.1:7242/ingest/894ed83a-4085-4fe3-ad0a-11d8954f2764', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'client.ts:24',
        message: 'is_visible column type check',
        data: { columnInfo: result.rows[0] },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'H1,H4',
      }),
    }).catch(() => {});
  })
  .catch((error) => {
    fetch('http://127.0.0.1:7242/ingest/894ed83a-4085-4fe3-ad0a-11d8954f2764', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'client.ts:26',
        message: 'is_visible column type check failed',
        data: { error: error.message },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'H1,H4',
      }),
    }).catch(() => {});
  });
// #endregion
