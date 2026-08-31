import { useEffect, useState } from 'react';
import { supabase, type Course } from '@/lib/supabase';
import { useToast } from '@/lib/router';
import { navigate } from '@/lib/router';
import { Navbar, Toast } from '@/components/Navbar';
import {
  UserPlus,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Phone,
  User,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

export function RegistrationPage() {
  const { toast, show } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });
      if (active) {
        setCourses((data as Course[]) ?? []);
        setCoursesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const phoneValid = phone.trim().length >= 6;
  const nameValid = fullName.trim().length >= 2;
  const courseValid = course.length > 0;
  const formValid = nameValid && phoneValid && courseValid && !coursesLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) {
      show('Please fill in all fields correctly.', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        course,
        payment_status: 'pending',
      });
    setSubmitting(false);
    if (error) {
      show('Something went wrong. Please try again.', 'error');
      return;
    }
    setSuccess(true);
  }

  function registerAnother() {
    setFullName('');
    setPhone('');
    setCourse('');
    setSuccess(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-white to-white">
      <Navbar />
      <Toast toast={toast} />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        {success ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 px-8 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
                Registration received!
              </h1>
              <p className="mx-auto mt-3 max-w-md text-emerald-50">
                Thanks, {fullName.split(' ')[0]}. Your seat for{' '}
                <span className="font-semibold">{course}</span> is reserved. Payment
                status is <span className="font-semibold">Pending</span> — our team
                will reach out shortly.
              </p>
            </div>
            <div className="px-8 py-7">
              <div className="rounded-xl bg-slate-50 p-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <SummaryRow label="Name" value={fullName} />
                  <SummaryRow label="Phone" value={phone} />
                  <SummaryRow label="Course" value={course} />
                  <SummaryRow
                    label="Payment"
                    value="Pending"
                    badgeClass="bg-amber-100 text-amber-700"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={registerAnother}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Register another student
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  Back to home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-8 py-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                  <UserPlus className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Student registration
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Fill in your details to reserve a seat. It takes less than a minute.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-7" noValidate>
              <div className="space-y-5">
                <Field
                  label="Full name"
                  icon={<User className="h-4 w-4" />}
                  error={fullName.length > 0 && !nameValid ? 'Enter at least 2 characters' : ''}
                >
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    autoComplete="name"
                  />
                </Field>

                <Field
                  label="Phone number"
                  icon={<Phone className="h-4 w-4" />}
                  error={phone.length > 0 && !phoneValid ? 'Enter a valid phone number' : ''}
                >
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 415 555 0182"
                    className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    autoComplete="tel"
                  />
                </Field>

                <Field
                  label="Select a course"
                  icon={<BookOpen className="h-4 w-4" />}
                  trailing={<ChevronDown className="h-4 w-4 text-slate-400" />}
                  error=""
                >
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={coursesLoading}
                    className="w-full appearance-none bg-transparent text-base text-slate-900 focus:outline-none disabled:opacity-60"
                  >
                    <option value="" disabled>
                      {coursesLoading ? 'Loading courses…' : 'Choose a course'}
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} — ${c.price}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-7 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Payment is collected later. Your registration starts with a{' '}
                <span className="font-semibold">Pending</span> payment status.
              </div>

              <button
                type="submit"
                disabled={submitting || !formValid}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit registration
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  icon,
  trailing,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  error: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div
        className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      >
        <span className="text-slate-400">{icon}</span>
        <div className="flex-1">{children}</div>
        {trailing}
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs text-rose-600">{error}</span>
      ) : null}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  badgeClass,
}: {
  label: string;
  value: string;
  badgeClass?: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      {badgeClass ? (
        <span
          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
        >
          {value}
        </span>
      ) : (
        <div className="mt-1 font-medium text-slate-900">{value}</div>
      )}
    </div>
  );
}
