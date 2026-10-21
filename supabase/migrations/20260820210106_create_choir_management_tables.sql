/*
# Create Choir Management Tables (single-tenant, no auth)

1. New Tables
- `members` — Choir members with personal info, voice part, membership status.
  - id (uuid PK)
  - first_name (text, not null)
  - last_name (text, not null)
  - email (text)
  - phone (text)
  - voice_part (text: Soprano, Alto, Tenor, Bass)
  - role (text: Member, Section Leader, Director, Accompanist)
  - status (text: Active, Inactive, On Leave)
  - join_date (date)
  - notes (text)
  - created_at (timestamptz)

- `dues_periods` — Dues collection periods (e.g., "Annual 2025", "Spring 2025").
  - id (uuid PK)
  - name (text, not null)
  - amount (numeric, not null)
  - start_date (date, not null)
  - due_date (date, not null)
  - description (text)
  - is_active (boolean, default true)
  - created_at (timestamptz)

- `dues_payments` — Individual payment records linking a member to a dues period.
  - id (uuid PK)
  - member_id (uuid FK -> members)
  - period_id (uuid FK -> dues_periods)
  - amount_paid (numeric, not null)
  - payment_date (date)
  - payment_method (text: Cash, Check, Bank Transfer, Card, Other)
  - status (text: Paid, Partial, Pending, Waived)
  - reference_number (text)
  - notes (text)
  - created_at (timestamptz)
  - UNIQUE constraint on (member_id, period_id)

2. Indexes
- Index on members.status for filtering active/inactive members
- Index on members.voice_part for section filtering
- Index on dues_payments.member_id and dues_payments.period_id for join performance
- Index on dues_payments.status for payment status queries

3. Security
- Enable RLS on all three tables.
- Allow anon + authenticated CRUD on all tables (single-tenant, no sign-in screen).
- Data is intentionally shared/public within the choir organization.
*/

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  voice_part text DEFAULT 'Soprano' CHECK (voice_part IN ('Soprano', 'Alto', 'Tenor', 'Bass')),
  role text DEFAULT 'Member' CHECK (role IN ('Member', 'Section Leader', 'Director', 'Accompanist')),
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
  join_date date DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dues_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dues_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES dues_periods(id) ON DELETE CASCADE,
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  payment_date date DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Check', 'Bank Transfer', 'Card', 'Other')),
  status text DEFAULT 'Pending' CHECK (status IN ('Paid', 'Partial', 'Pending', 'Waived')),
  reference_number text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, period_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_voice_part ON members(voice_part);
CREATE INDEX IF NOT EXISTS idx_dues_payments_member_id ON dues_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_dues_payments_period_id ON dues_payments(period_id);
CREATE INDEX IF NOT EXISTS idx_dues_payments_status ON dues_payments(status);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues_payments ENABLE ROW LEVEL SECURITY;

-- members policies (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_members" ON members;
CREATE POLICY "anon_select_members" ON members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_members" ON members;
CREATE POLICY "anon_insert_members" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_members" ON members;
CREATE POLICY "anon_update_members" ON members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "anon_delete_members" ON members FOR DELETE
  TO anon, authenticated USING (true);

-- dues_periods policies
DROP POLICY IF EXISTS "anon_select_dues_periods" ON dues_periods;
CREATE POLICY "anon_select_dues_periods" ON dues_periods FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_dues_periods" ON dues_periods;
CREATE POLICY "anon_insert_dues_periods" ON dues_periods FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_dues_periods" ON dues_periods;
CREATE POLICY "anon_update_dues_periods" ON dues_periods FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_dues_periods" ON dues_periods;
CREATE POLICY "anon_delete_dues_periods" ON dues_periods FOR DELETE
  TO anon, authenticated USING (true);

-- dues_payments policies
DROP POLICY IF EXISTS "anon_select_dues_payments" ON dues_payments;
CREATE POLICY "anon_select_dues_payments" ON dues_payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_dues_payments" ON dues_payments;
CREATE POLICY "anon_insert_dues_payments" ON dues_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_dues_payments" ON dues_payments;
CREATE POLICY "anon_update_dues_payments" ON dues_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_dues_payments" ON dues_payments;
CREATE POLICY "anon_delete_dues_payments" ON dues_payments FOR DELETE
  TO anon, authenticated USING (true);
