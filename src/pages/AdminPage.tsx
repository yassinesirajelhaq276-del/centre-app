import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, type Student, type Course } from '@/lib/supabase';
import { useToast } from '@/lib/router';
import { navigate } from '@/lib/router';
import { Navbar, Toast } from '@/components/Navbar';
import { formatDate, exportStudentsToCsv, verifyAdminPassword } from '@/lib/utils';
import {
  Lock,
  Loader2,
  Search,
  Download,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Filter,
  Phone,
} from 'lucide-react';

const AUTH_KEY = 'lumen_admin_authed';

type StatusFilter = 'all' | 'paid' | 'pending';

export function AdminPage() {
  const [authed, setAuthed] = useState<boolean>(
    () => sessionStorage.getItem(AUTH_KEY) === '1'
  );

  if (!authed) {
    return <AdminLogin onAuthed={() => setAuthed(true)} />;
  }
  return <AdminDashboard onLogout={() => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }} />;
}

function AdminLogin({ onAuthed }: { onAuthed: () => void }) {
  const { toast, show } = useToast();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    setSubmitting(false);
    if (verifyAdminPassword(password)) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuthed();
    } else {
      show('Incorrect password. Please try again.', 'error');
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h1 className="mt-6 text-center text-2xl font-bold text-white">
                Admin access
              </h1>
              <p className="mt-2 text-center text-sm text-slate-400">
                Enter your password to manage student registrations.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
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
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Unlock dashboard
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-slate-400">
                Demo password: <span className="font-mono font-semibold text-sky-300">admin123</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>
      </main>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast, show } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: sData }, { data: cData }] = await Promise.all([
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('name', { ascending: true }),
    ]);
    setStudents((sData as Student[]) ?? []);
    setCourses((cData as Course[]) ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    show('Data refreshed');
  }

  async function togglePayment(student: Student) {
    const next = student.payment_status === 'paid' ? 'pending' : 'paid';
    setTogglingId(student.id);
    const { error } = await supabase
      .from('students')
      .update({ payment_status: next })
      .eq('id', student.id);
    setTogglingId(null);
    if (error) {
      show('Could not update payment status.', 'error');
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, payment_status: next } : s))
    );
    show(`Marked ${student.full_name} as ${next === 'paid' ? 'Paid' : 'Pending'}`);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !s.full_name.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && s.payment_status !== statusFilter) return false;
      if (courseFilter !== 'all' && s.course !== courseFilter) return false;
      return true;
    });
  }, [students, search, statusFilter, courseFilter]);

  const stats = useMemo(() => {
    const paid = students.filter((s) => s.payment_status === 'paid');
    const pending = students.filter((s) => s.payment_status === 'pending');
    const courseMap = new Map(courses.map((c) => [c.name, c.price]));
    const revenue = paid.reduce(
      (sum, s) => sum + (courseMap.get(s.course) ?? 0),
      0
    );
    return {
      total: students.length,
      revenue,
      paid: paid.length,
      pending: pending.length,
    };
  }, [students, courses]);

  function handleExport() {
    if (filtered.length === 0) {
      show('No students to export with current filters.', 'error');
      return;
    }
    exportStudentsToCsv(filtered);
    show(`Exported ${filtered.length} students to CSV`);
  }

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
              Admin dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage student registrations and payments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total students"
            value={stats.total.toString()}
            icon={<Users className="h-5 w-5" />}
            accent="sky"
          />
          <StatCard
            label="Total revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            accent="emerald"
          />
          <StatCard
            label="Paid"
            value={stats.paid.toString()}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="teal"
          />
          <StatCard
            label="Pending"
            value={stats.pending.toString()}
            icon={<Clock className="h-5 w-5" />}
            accent="amber"
          />
        </div>

        {/* Toolbar */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                icon={<Filter className="h-3.5 w-3.5" />}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
              <FilterSelect
                value={courseFilter}
                onChange={setCourseFilter}
                options={[
                  { value: 'all', label: 'All courses' },
                  ...courses.map((c) => ({ value: c.name, label: c.name })),
                ]}
              />
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center justify-between px-4 pt-3 text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span>{' '}
              of {students.length} students
            </span>
            {(search || statusFilter !== 'all' || courseFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setCourseFilter('all');
                }}
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto p-2 sm:p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Users className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">No students found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="hidden px-3 py-3 font-semibold sm:table-cell">Phone</th>
                    <th className="px-3 py-3 font-semibold">Course</th>
                    <th className="hidden px-3 py-3 font-semibold md:table-cell">
                      Registered
                    </th>
                    <th className="px-3 py-3 font-semibold">Payment</th>
                    <th className="px-3 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.full_name} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900">
                              {s.full_name}
                            </div>
                            <div className="truncate text-xs text-slate-500 sm:hidden">
                              {s.phone}
                            </div>
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
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-3 py-3">
                        <PaymentBadge status={s.payment_status} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => togglePayment(s)}
                          disabled={togglingId === s.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                            s.payment_status === 'paid'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {togglingId === s.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : s.payment_status === 'paid' ? (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              Mark pending
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark paid
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
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
    sky: 'from-sky-500 to-sky-600 text-sky-600 bg-sky-50',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50',
    teal: 'from-teal-500 to-teal-600 text-teal-600 bg-teal-50',
    amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50',
  };
  const [grad, text, bg] = accents[accent].split(' text');
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
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-sm`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: 'paid' | 'pending' }) {
  return status === 'paid' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-8 text-sm font-medium text-slate-700 transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 ${
          icon ? 'pl-8' : 'pl-3'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        ▾
      </span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hues = ['bg-sky-100 text-sky-700', 'bg-teal-100 text-teal-700', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
  const idx = name.charCodeAt(0) % hues.length;
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${hues[idx]}`}
    >
      {initials}
    </span>
  );
}
