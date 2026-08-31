/*
# Training Center — Students table (single-tenant, no app auth)

1. Purpose
- Public students register for courses via the /inscription page.
- Admins manage registrations (payment status toggle, search, export) via /admin.
- This app has NO user sign-in screen. The admin dashboard uses a simple
  client-side password gate only — data itself is intentionally shared/public,
  so single-tenant (anon + authenticated) policies are correct here.

2. New Tables
- `students`
  - `id`            uuid PRIMARY KEY
  - `full_name`     text NOT NULL            — student's full name
  - `phone`         text NOT NULL            — contact phone number
  - `course`        text NOT NULL            — selected course name
  - `payment_status` text NOT NULL DEFAULT 'pending' — 'paid' | 'pending'
  - `created_at`    timestamptz DEFAULT now() — registration date
- `courses`
  - `id`            uuid PRIMARY KEY
  - `name`          text UNIQUE NOT NULL      — course display name
  - `description`   text                       — short description
  - `price`         integer DEFAULT 0          — price in currency units
  - `created_at`    timestamptz DEFAULT now()

3. Indexes
- `idx_students_payment_status` on students(payment_status)
- `idx_students_course` on students(course)
- `idx_students_created_at` on students(created_at DESC)

4. Security
- RLS enabled on both tables.
- Policies: anon + authenticated may perform full CRUD because the data is
  intentionally public/shared in this single-tenant app (no app-level sign-in).
  The admin dashboard is gated client-side by a password; the DB itself remains
  accessible to the anon-key frontend so registration and admin reads work.

5. Seed data
- Insert a set of courses and mock student registrations so the dashboard
  shows meaningful data immediately on first load.
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  course text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('paid', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_payment_status ON students(payment_status);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- students policies (single-tenant: anon + authenticated full CRUD)
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- courses policies (single-tenant: anon + authenticated full CRUD)
DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE
  TO anon, authenticated USING (true);

-- Seed courses
INSERT INTO courses (name, description, price)
SELECT * FROM (VALUES
  ('Web Development Fundamentals', 'HTML, CSS, JavaScript and modern front-end practices', 450),
  ('Python for Data Science', 'Python basics, NumPy, Pandas and data visualization', 600),
  ('Digital Marketing Essentials', 'SEO, social media, paid ads and analytics', 350),
  ('Graphic Design with Adobe Suite', 'Photoshop, Illustrator and brand identity design', 500),
  ('UI/UX Design Masterclass', 'User research, wireframing, prototyping in Figma', 550),
  ('Business English', 'Professional communication, presentations and emails', 300),
  ('Project Management (PMP Prep)', 'Agile, Scrum, planning and certification prep', 700),
  ('Cybersecurity Basics', 'Network security, threats and defensive practices', 650)
) AS v(name, description, price)
WHERE NOT EXISTS (SELECT 1 FROM courses);

-- Seed mock students
INSERT INTO students (full_name, phone, course, payment_status, created_at)
SELECT * FROM (VALUES
  ('Amelia Hartwell',  '+1 415 555 0182', 'Web Development Fundamentals', 'paid',     now() - interval '14 days'),
  ('Jonas Whitfield',  '+1 212 555 0143', 'Python for Data Science',      'paid',     now() - interval '12 days'),
  ('Priya Nair',       '+44 20 7946 0958','Digital Marketing Essentials', 'pending',  now() - interval '10 days'),
  ('Mateo Alvarez',    '+34 612 345 678', 'UI/UX Design Masterclass',     'paid',     now() - interval '9 days'),
  ('Sofia Castellano', '+39 320 112 2334','Graphic Design with Adobe Suite','pending', now() - interval '8 days'),
  ('Liam OBrien',      '+353 1 555 0199', 'Project Management (PMP Prep)','paid',     now() - interval '7 days'),
  ('Yuki Tanaka',      '+81 3 5555 0123', 'Cybersecurity Basics',         'pending',  now() - interval '6 days'),
  ('Nadia Kowalski',   '+48 22 555 0177', 'Business English',             'paid',     now() - interval '5 days'),
  ('Daniel Okonkwo',   '+234 1 555 0166', 'Web Development Fundamentals', 'pending',  now() - interval '4 days'),
  ('Elena Petrova',    '+7 495 555 0144', 'Python for Data Science',      'paid',     now() - interval '3 days'),
  ('Marcus Lindqvist', '+46 8 555 0122',  'UI/UX Design Masterclass',     'pending',  now() - interval '2 days'),
  ('Aisha Rahman',     '+880 2 555 0188', 'Digital Marketing Essentials', 'paid',     now() - interval '1 day')
) AS v(full_name, phone, course, payment_status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM students);