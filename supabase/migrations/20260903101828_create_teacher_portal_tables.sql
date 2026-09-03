/*
# Teacher portal — teachers, referrals, and payments

1. Purpose
- Support a dedicated "Espace Professeur" (teacher portal) with:
  - A financial section showing teacher earnings/payments.
  - A referral tracking table showing students who registered through a given teacher.
- The app has NO user sign-in screen. The teacher portal uses a simple
  client-side password gate (same pattern as the existing admin dashboard).
  Data is intentionally shared/public (single-tenant), so anon + authenticated
  policies are correct.

2. New Tables
- `teachers`
  - `id`             uuid PRIMARY KEY
  - `name`           text NOT NULL                  — teacher display name
  - `email`          text                            — contact email
  - `phone`          text                            — contact phone
  - `specialty`      text                            — teaching specialty / course
  - `commission_rate` numeric(5,2) DEFAULT 20.00    — commission percentage per referred student
  - `created_at`     timestamptz DEFAULT now()

- `teacher_payments`
  - `id`            uuid PRIMARY KEY
  - `teacher_id`    uuid REFERENCES teachers(id) ON DELETE CASCADE
  - `amount`        numeric(10,2) NOT NULL          — payment amount in currency units
  - `status`        text NOT NULL DEFAULT 'pending'  — 'paid' | 'pending'
  - `period`        text                             — label for the period (e.g. "2026-09")
  - `created_at`    timestamptz DEFAULT now()

3. Modified Tables
- `students`
  - Added `referred_by` uuid REFERENCES teachers(id) ON DELETE SET NULL
    (nullable — students may or may not have a referring teacher)

4. Indexes
- `idx_teacher_payments_teacher_id` on teacher_payments(teacher_id)
- `idx_students_referred_by` on students(referred_by)

5. Security
- RLS enabled on `teachers` and `teacher_payments`.
- Policies: anon + authenticated may perform full CRUD (single-tenant, no app-level sign-in).

6. Seed data
- Insert 3 sample teachers.
- Insert sample teacher payments for the last 6 months.
- Update some existing students to have referred_by set to sample teachers.
*/

CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  specialty text,
  commission_rate numeric(5,2) NOT NULL DEFAULT 20.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('paid', 'pending')),
  period text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add referred_by column to students if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE students ADD COLUMN referred_by uuid REFERENCES teachers(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teacher_payments_teacher_id ON teacher_payments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_referred_by ON students(referred_by);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_payments ENABLE ROW LEVEL SECURITY;

-- teachers policies (single-tenant: anon + authenticated full CRUD)
DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE
  TO anon, authenticated USING (true);

-- teacher_payments policies (single-tenant: anon + authenticated full CRUD)
DROP POLICY IF EXISTS "anon_select_teacher_payments" ON teacher_payments;
CREATE POLICY "anon_select_teacher_payments" ON teacher_payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teacher_payments" ON teacher_payments;
CREATE POLICY "anon_insert_teacher_payments" ON teacher_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teacher_payments" ON teacher_payments;
CREATE POLICY "anon_update_teacher_payments" ON teacher_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teacher_payments" ON teacher_payments;
CREATE POLICY "anon_delete_teacher_payments" ON teacher_payments FOR DELETE
  TO anon, authenticated USING (true);

-- Seed teachers (only if none exist)
INSERT INTO teachers (name, email, phone, specialty, commission_rate)
SELECT * FROM (VALUES
  ('Karim El Fassi',     'k.elfassi@lumen.ma',  '+212 661 234 567', 'Génie informatique', 25.00),
  ('Nadia Benjelloun',   'n.benjelloun@lumen.ma', '+212 662 345 678', 'Génie civil',         20.00),
  ('Omar Tazi',          'o.tazi@lumen.ma',       '+212 663 456 789', 'Génie industriel',    22.00)
) AS v(name, email, phone, specialty, commission_rate)
WHERE NOT EXISTS (SELECT 1 FROM teachers);

-- Seed teacher payments for the last 6 months (only if none exist)
INSERT INTO teacher_payments (teacher_id, amount, status, period, created_at)
SELECT t.id, v.amount, v.status, v.period, v.created_at
FROM teachers t
CROSS JOIN LATERAL (VALUES
  (1200.00, 'paid',    to_char(now() - interval '5 months', 'YYYY-MM'), now() - interval '5 months'),
  (1350.00, 'paid',    to_char(now() - interval '4 months', 'YYYY-MM'), now() - interval '4 months'),
  (1500.00, 'paid',    to_char(now() - interval '3 months', 'YYYY-MM'), now() - interval '3 months'),
  (1100.00, 'paid',    to_char(now() - interval '2 months', 'YYYY-MM'), now() - interval '2 months'),
  (1650.00, 'pending', to_char(now() - interval '1 month',  'YYYY-MM'), now() - interval '1 month'),
  (1400.00, 'pending', to_char(now(),                        'YYYY-MM'), now())
) AS v(amount, status, period, created_at)
WHERE NOT EXISTS (SELECT 1 FROM teacher_payments);

-- Assign some existing students to teachers (round-robin)
UPDATE students s
SET referred_by = sub.teacher_id
FROM (
  SELECT s2.id, s2.row_num,
    (SELECT t.id FROM teachers t
     ORDER BY t.created_at
     OFFSET (s2.row_num % (SELECT COUNT(*) FROM teachers))
     LIMIT 1) AS teacher_id
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS row_num
    FROM students
    WHERE referred_by IS NULL
  ) s2
) sub
WHERE s.id = sub.id AND sub.teacher_id IS NOT NULL;
