ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

DROP TABLE IF EXISTS email_otps;

DROP TYPE IF EXISTS "EmailOTPType";

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP(3) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "magic_link_tokens_pkey" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "magic_link_tokens_token_key" ON magic_link_tokens(token);
CREATE INDEX IF NOT EXISTS "magic_link_tokens_email_idx" ON magic_link_tokens(email);
CREATE INDEX IF NOT EXISTS "magic_link_tokens_expires_at_idx" ON magic_link_tokens(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP(3) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS "password_reset_tokens_email_idx" ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx" ON password_reset_tokens(expires_at);
