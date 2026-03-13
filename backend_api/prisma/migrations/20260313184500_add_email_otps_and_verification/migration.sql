ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'PENDING';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT false;

UPDATE users
SET is_email_verified = true
WHERE is_email_verified = false;

DO $$
BEGIN
  CREATE TYPE "EmailOTPType" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS email_otps (
  id TEXT NOT NULL,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  type "EmailOTPType" NOT NULL,
  expires_at TIMESTAMP(3) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_otps_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "email_otps_email_type_idx" ON email_otps(email, type);
CREATE INDEX IF NOT EXISTS "email_otps_expires_at_idx" ON email_otps(expires_at);
