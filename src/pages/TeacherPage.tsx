import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { supabase, type Student, type Teacher, type TeacherPayment } from '@/lib/supabase';
import { useToast } from '@/lib/router';
import { navigate } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { Navbar, Toast } from '@/components/Navbar';
import {
  formatDate,
  verifyTeacherPassword,
  getLast6Months,
} from '@/lib/utils';
import {
  Lock,
  Loader2,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Phone,
  Briefcase,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

const AUTH_KEY = 'lumen_teacher_authed';

export function TeacherPage() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState<boolean>(
    () => sessionStorage.getItem(AUTH_KEY) === '1'
  );

  if (!authed) {
    return <TeacherLogin onAuthed={() => setAuthed(true)} />;
  }
  return (
    <TeacherDashboard
      onLogout={() => {
        sessionStorage.removeItem(AUTH_KEY);
        setAuthed(false);
      }}
    />
  );
}

function TeacherLogin({ onAuthed }: { onAuthed: () => void }) {
  const { t } = useI18n();
  const { toast, show } = useToast();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    setSubmitting(false);
    if (verifyTeacherPassword(password)) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuthed();
    } else {
      show(t('teacher_login_error'), 'error');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Toast toast={toast} />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <div className="px-8 py-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="mt-6 text-center text-2xl font-bold text-white">
                {t('teacher_login_title')}
              </h1>
              <p className="mt-2 text-center text-sm text-slate-400">
                {t('teacher_login_subtitle')}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {t('admin_login_password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('teacher_login_placeholder')}
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || password.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('admin_login_verifying')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {t('teacher_login_button')}
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-slate-400">
                {t('teacher_login_demo')} <span className="font-mono font-semibold text-teal-300">prof123</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('reg_back_home')}
          </button>
        </div>
      </main>
    </div>
  );
}

function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const { t, lang } = useI18n();
  const { toast, show } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [{ data: tData }, { data: sData }, { data: pData }] = await Promise.all([
      supabase.from('teachers').select('*').order('name', { ascending: true }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('teacher_payments').select('*').order('created_at', { ascending: false }),
    ]);
    const tList = (tData as Teacher[]) ?? [];
    setTeachers(tList);
    setStudents((sData as Student[]) ?? []);
    setPayments((pData as TeacherPayment[]) ?? []);
    return tList;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const tList = await load();
      if (!active) return;
      if (tList.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(tList[0].id);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load, selectedTeacherId]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    show(t('admin_toast_refreshed'));
  }

  const selectedTeacher = useMemo(
    () => teachers.find((tc) => tc.id === selectedTeacherId) ?? null,
    [teachers, selectedTeacherId]
  );

  // Students referred by the selected teacher
  const referredStudents = useMemo(() => {
    if (!selectedTeacherId) return [];
    return students.filter((s) => s.referred_by === selectedTeacherId);
  }, [students, selectedTeacherId]);

  // Payments for the selected teacher
  const teacherPayments = useMemo(() => {
    if (!selectedTeacherId) return [];
    return payments.filter((p) => p.teacher_id === selectedTeacherId);
  }, [payments, selectedTeacherId]);

  // Financial stats
  const financialStats = useMemo(() => {
    const totalEarnings = teacherPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidEarnings = teacherPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingEarnings = teacherPayments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      totalReferrals: referredStudents.length,
      totalEarnings,
      paidEarnings,
      pendingEarnings,
    };
  }, [teacherPayments, referredStudents]);

  // Earnings chart data (last 6 months)
  const earningsData = useMemo(() => {
    const months = getLast6Months(lang);
    return months.map((label) => {
      const matching = teacherPayments.filter((p) => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        const monthLabel = d.toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', {
          month: 'short',
          year: '2-digit',
        });
        return monthLabel === label;
      });
      return {
        month: label,
        earnings: matching.reduce((sum, p) => sum + p.amount, 0),
      };
    });
  }, [teacherPayments, lang]);

  // Referrals chart data (last 6 months)
  const referralsData = useMemo(() => {
    const months = getLast6Months(lang);
    return months.map((label) => {
      const count = referredStudents.filter((s) => {
        if (!s.created_at) return false;
        const d = new Date(s.created_at);
        const monthLabel = d.toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', {
          month: 'short',
          year: '2-digit',
        });
        return monthLabel === label;
      }).length;
      return { month: label, referrals: count };
    });
  }, [referredStudents, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Toast toast={toast} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t('teacher_dashboard_title')}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{t('teacher_dashboard_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('admin_refresh')}</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin_signout')}</span>
            </button>
          </div>
        </div>

        {/* Teacher selector */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedTeacher
                    ? t('teacher_welcome', { name: selectedTeacher.name })
                    : t('teacher_select')}
                </div>
                {selectedTeacher && (
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500">
                    <span>{t('teacher_specialty')}: {selectedTeacher.specialty}</span>
                    <span>{t('teacher_commission')}: {selectedTeacher.commission_rate}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 sm:w-auto"
          >
            {teachers.map((tc) => (
              <option key={tc.id} value={tc.id}>
                {tc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Financial stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinStatCard
            label={t('teacher_stat_total_referrals')}
            value={financialStats.totalReferrals.toString()}
            icon={<Users className="h-5 w-5" />}
            accent="sky"
          />
          <FinStatCard
            label={t('teacher_stat_total_earnings')}
            value={`${financialStats.totalEarnings.toLocaleString()} DH`}
            icon={<DollarSign className="h-5 w-5" />}
            accent="emerald"
          />
          <FinStatCard
            label={t('teacher_stat_paid_earnings')}
            value={`${financialStats.paidEarnings.toLocaleString()} DH`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="teal"
          />
          <FinStatCard
            label={t('teacher_stat_pending_earnings')}
            value={`${financialStats.pendingEarnings.toLocaleString()} DH`}
            icon={<Clock className="h-5 w-5" />}
            accent="amber"
          />
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Earnings chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {t('teacher_chart_earnings_title')}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{t('teacher_chart_earnings_subtitle')}</p>
              </div>
            </div>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    labelStyle={{ color: '#475569' }}
                    formatter={(value) => [`${Number(value).toLocaleString()} DH`, t('chart_earnings')]}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="url(#earnGrad)"
                    name={t('chart_earnings')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Referrals chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {t('teacher_chart_referrals_title')}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{t('teacher_chart_referrals_subtitle')}</p>
              </div>
            </div>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={referralsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    labelStyle={{ color: '#475569' }}
                    formatter={(value) => [Number(value), t('chart_students')]}
                  />
                  <Bar
                    dataKey="referrals"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    name={t('chart_students')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Referral table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">
              {t('teacher_referrals_title')}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{t('teacher_referrals_subtitle')}</p>
          </div>

          {referredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">{t('teacher_referrals_empty')}</p>
              <p className="mt-1 text-xs text-slate-500">{t('teacher_referrals_empty_hint')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-2 sm:p-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3 font-semibold">{t('teacher_referral_name')}</th>
                    <th className="hidden px-3 py-3 font-semibold sm:table-cell">{t('teacher_referral_phone')}</th>
                    <th className="px-3 py-3 font-semibold">{t('teacher_referral_course')}</th>
                    <th className="hidden px-3 py-3 font-semibold md:table-cell">{t('teacher_referral_date')}</th>
                    <th className="px-3 py-3 font-semibold">{t('teacher_referral_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {referredStudents.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <TeacherAvatar name={s.full_name} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900">{s.full_name}</div>
                            <div className="truncate text-xs text-slate-500 sm:hidden">{s.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {s.phone}
                        </div>
                      </td>
                      <td className="max-w-[12rem] px-3 py-3">
                        <span className="block truncate text-slate-700" title={s.course}>
                          {s.course}
                        </span>
                      </td>
                      <td className="hidden px-3 py-3 text-slate-500 md:table-cell">
                        {formatDate(s.created_at, lang)}
                      </td>
                      <td className="px-3 py-3">
                        <PaymentBadge status={s.payment_status} t={t} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">
              {t('teacher_payments_title')}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{t('teacher_payments_subtitle')}</p>
          </div>

          {teacherPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{t('teacher_referrals_empty')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-2 sm:p-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3 font-semibold">{t('teacher_payment_period')}</th>
                    <th className="px-3 py-3 font-semibold">{t('teacher_payment_amount')}</th>
                    <th className="px-3 py-3 font-semibold">{t('teacher_payment_status')}</th>
                    <th className="hidden px-3 py-3 font-semibold md:table-cell">{t('teacher_payment_date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {teacherPayments.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {p.period ?? '—'}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {p.amount.toLocaleString()} DH
                      </td>
                      <td className="px-3 py-3">
                        <PaymentBadge status={p.status} t={t} />
                      </td>
                      <td className="hidden px-3 py-3 text-slate-500 md:table-cell">
                        {formatDate(p.created_at, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FinStatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: 'sky' | 'emerald' | 'teal' | 'amber';
}) {
  const accents: Record<string, string> = {
    sky: 'from-sky-500 to-sky-600',
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
    amber: 'from-amber-500 to-amber-600',
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-sm`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function PaymentBadge({
  status,
  t,
}: {
  status: 'paid' | 'pending';
  t: (key: string) => string;
}) {
  return status === 'paid' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {t('admin_payment_paid')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {t('reg_payment_pending')}
    </span>
  );
}

function TeacherAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hues = [
    'bg-sky-100 text-sky-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-emerald-100 text-emerald-700',
  ];
  const idx = name.charCodeAt(0) % hues.length;
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${hues[idx]}`}
    >
      {initials}
    </span>
  );
}
