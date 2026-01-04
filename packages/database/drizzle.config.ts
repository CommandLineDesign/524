import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './dist/index.js',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/beauty_marketplace',
  },
});
