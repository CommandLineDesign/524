-- Make phone_number optional for users
ALTER TABLE users
  ALTER COLUMN phone_number DROP NOT NULL;
