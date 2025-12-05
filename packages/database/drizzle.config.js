import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/schema',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/beauty_marketplace',
  },
});
