import { useEffect, useState } from 'react';
import { navigate } from '@/lib/router';
import { supabase, type Course } from '@/lib/supabase';
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Users,
  Sparkles,
  Clock,
  Award,
} from 'lucide-react';

export function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });
      if (active) {
        setCourses((data as Course[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-white" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -top-16 -left-24 -z-10 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-medium text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Enrollment is open for the 2026 cohort
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Build skills that move{' '}
              <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
                your career forward
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Lumen Academy is a modern training center offering hands-on courses
              in development, design, marketing and more. Reserve your seat in
              under a minute — no account required.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/inscription')}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md sm:w-auto"
              >
                Register for a course
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Admin dashboard
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 text-center sm:gap-8">
              <Stat value="8" label="Active courses" />
              <Stat value="1,200+" label="Students trained" />
              <Stat value="94%" label="Completion rate" />
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Explore our courses
            </h2>
            <p className="mt-2 text-slate-600">
              Taught by industry practitioners with real-world projects.
            </p>
          </div>
          <button
            onClick={() => navigate('/inscription')}
            className="hidden items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700 sm:inline-flex"
          >
            Enroll now <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {c.description}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    ${c.price}
                  </span>
                  <button
                    onClick={() => navigate('/inscription')}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 transition-colors hover:text-sky-700"
                  >
                    Enroll <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why us */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <Feature
              icon={<Users className="h-5 w-5" />}
              title="Expert instructors"
              body="Learn from professionals actively working in the field, not just theorists."
            />
            <Feature
              icon={<Clock className="h-5 w-5" />}
              title="Flexible schedule"
              body="Evening and weekend batches designed for working professionals and students."
            />
            <Feature
              icon={<Award className="h-5 w-5" />}
              title="Recognized certificate"
              body="Earn a completion certificate valued by employers across the industry."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-teal-500 px-8 py-14 text-center shadow-lg sm:px-16">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative">
            <ShieldCheck className="mx-auto h-8 w-8 text-white/90" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your seat is one form away
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sky-50">
              Register now and our team will confirm your enrollment within 24
              hours. Payment can be settled later.
            </p>
            <button
              onClick={() => navigate('/inscription')}
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-100 hover:shadow-md"
            >
              Start registration
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900 sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
