#!/bin/bash
cd packages/database
export DATABASE_URL="postgresql://neondb_owner:npg_uQDm0P1vXbAc@ep-hidden-boat-a1iz7fok-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
npx drizzle-kit push

