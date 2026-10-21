/*
# Create app_secrets table for storing sensitive service keys

1. New Tables
- `app_secrets` — Stores sensitive configuration like the Firebase service account key.
  - id (text PK, e.g. 'firebase_service_account')
  - value (jsonb, the secret payload)
  - created_at (timestamptz)
  - updated_at (timestamptz)

2. Security
- Enable RLS on app_secrets.
- NO policies for anon or authenticated roles — the frontend cannot read or write this table.
- Only the service role (used by edge functions) can access it, since the service role bypasses RLS.
- This ensures the Firebase private key is never exposed to the browser.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
