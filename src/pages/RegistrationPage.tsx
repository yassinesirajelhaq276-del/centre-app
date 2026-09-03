import { useEffect, useState } from 'react';
import { supabase, type Course } from '@/lib/supabase';
import { useToast } from '@/lib/router';
import { navigate } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
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

const DEFAULT_COURSES: Course[] = [
  { id: 'default-informatique', name: 'Génie informatique', description: null, price: 0, created_at: '' },
  { id: 'default-civil', name: 'Génie civil', description: null, price: 0, created_at: '' },
  { id: 'default-industriel', name: 'Génie industriel', description: null, price: 0, created_at: '' },
];

const MA_PHONE_PREFIX = '+212';

function normalizeMaPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('212')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function formatMaPhone(digits: string): string {
  const d = digits.replace(/\D/g, '');
  const groups: string[] = [];
  for (let i = 0; i < d.length && i < 12; i += 2) {
    groups.push(d.slice(i, i + 2));
  }
  return groups.join(' ');
}

function isValidMaPhone(raw: string): boolean {
  const digits = normalizeMaPhone(raw);
  return digits.length >= 6 && digits.length <= 12;
}

function buildFullPhone(digits: string): string {
  return `${MA_PHONE_PREFIX} ${formatMaPhone(digits)}`;
}

export function RegistrationPage() {
  const { t } = useI18n();
  const { toast, show } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [course, setCourse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      let result: Course[] = [];
      try {
        const { data } = await supabase
          .from('courses')
          .select('*')
          .order('name', { ascending: true });
        result = (data as Course[]) ?? [];
      } catch {
        result = [];
      }
      if (active) {
        if (result.length === 0) {
          result = DEFAULT_COURSES;
        }
        setCourses(result);
        setCoursesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const phoneValid = isValidMaPhone(phoneDigits);
  const nameValid = fullName.trim().length >= 2;
  const courseValid = course.length > 0;
  const formValid = nameValid && phoneValid && courseValid && !coursesLoading;

  const fullPhone = phoneDigits ? buildFullPhone(phoneDigits) : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) {
      show(t('reg_error_fields'), 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        phone: fullPhone,
        course,
        payment_status: 'pending',
      });
    setSubmitting(false);
    if (error) {
      show(t('reg_error_generic'), 'error');
      return;
    }
    setSuccess(true);
  }

  function registerAnother() {
    setFullName('');
    setPhoneDigits('');
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
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('reg_back_home')}
        </button>

        {success ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 px-8 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
                {t('reg_success_title')}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-emerald-50">
                {t('reg_success_body', {
                  name: fullName.split(' ')[0],
                  course,
                  status: t('reg_payment_pending'),
                })}
              </p>
            </div>
            <div className="px-8 py-7">
              <div className="rounded-xl bg-slate-50 p-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <SummaryRow label={t('reg_summary_name')} value={fullName} />
                  <SummaryRow label={t('reg_summary_phone')} value={fullPhone} />
                  <SummaryRow label={t('reg_summary_course')} value={course} />
                  <SummaryRow
                    label={t('reg_summary_payment')}
                    value={t('reg_payment_pending')}
                    badgeClass="bg-amber-100 text-amber-700"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={registerAnother}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  {t('reg_register_another')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  {t('reg_back_home')}
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
                    {t('reg_title')}
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">{t('reg_subtitle')}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-7" noValidate>
              <div className="space-y-5">
                <Field
                  label={t('reg_field_name')}
                  icon={<User className="h-4 w-4" />}
                  error={fullName.length > 0 && !nameValid ? t('reg_field_name_error') : ''}
                >
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('reg_field_name_placeholder')}
                    className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    autoComplete="name"
                  />
                </Field>

                {/* Moroccan phone field with fixed +212 prefix */}
                <Field
                  label={t('reg_field_phone')}
                  icon={<Phone className="h-4 w-4" />}
                  error={phoneDigits.length > 0 && !phoneValid ? t('reg_field_phone_error_ma') : ''}
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-base font-semibold text-slate-500 select-none">
                      {MA_PHONE_PREFIX}
                    </span>
                    <span className="h-5 w-px bg-slate-200" />
                    <input
                      type="tel"
                      value={formatMaPhone(phoneDigits)}
                      onChange={(e) => setPhoneDigits(normalizeMaPhone(e.target.value))}
                      placeholder={t('reg_field_phone_placeholder_ma')}
                      className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </Field>

                <Field
                  label={t('reg_field_course')}
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
                      {coursesLoading ? t('reg_field_course_loading') : t('reg_field_course_placeholder')}
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-7 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {t('reg_payment_notice', { status: t('reg_payment_pending') })}
              </div>

              <button
                type="submit"
                disabled={submitting || !formValid}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('reg_submitting')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('reg_submit')}
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
