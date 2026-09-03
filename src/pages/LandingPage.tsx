import { useEffect, useState } from 'react';
import { navigate } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Course } from '@/lib/supabase';
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Users,
  Sparkles,
  Clock,
  Award,
  GraduationCap,
  Cpu,
  Building2,
  Factory,
  CheckCircle2,
} from 'lucide-react';

const STATIC_COURSES: Course[] = [
  {
    id: 'static-informatique',
    name: 'Génie informatique',
    description:
      "Maîtrisez les fondamentaux de la programmation, des réseaux et du développement logiciel pour concevoir des solutions informatiques innovantes.",
    price: 0,
    created_at: '',
  },
  {
    id: 'static-civil',
    name: 'Génie civil',
    description:
      "Apprenez la conception, la construction et la gestion de projets d'infrastructure, des structures en béton aux ouvrages d'art.",
    price: 0,
    created_at: '',
  },
  {
    id: 'static-industriel',
    name: 'Génie industriel',
    description:
      "Optimisez les processus de production, la logistique et la gestion de la qualité pour améliorer la performance des systèmes industriels.",
    price: 0,
    created_at: '',
  },
];

const COURSE_ICONS: Record<string, React.ReactNode> = {
  'Génie informatique': <Cpu className="h-5 w-5" />,
  'Génie civil': <Building2 className="h-5 w-5" />,
  'Génie industriel': <Factory className="h-5 w-5" />,
};

export function LandingPage() {
  const { t, lang } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });
      if (!active) return;
      const dbCourses = (data as Course[]) ?? [];
      setCourses(dbCourses.length > 0 ? dbCourses : STATIC_COURSES);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const courseDescriptions: Record<string, Record<string, string>> = {
    'Génie informatique': {
      fr: "Maîtrisez les fondamentaux de la programmation, des réseaux et du développement logiciel pour concevoir des solutions informatiques innovantes.",
      ar: 'أتقن أساسيات البرمجة والشبكات وتطوير البرمجيات لتصميم حلول معلوماتية مبتكرة.',
    },
    'Génie civil': {
      fr: "Apprenez la conception, la construction et la gestion de projets d'infrastructure, des structures en béton aux ouvrages d'art.",
      ar: 'تعلم تصميم وبناء وإدارة مشاريع البنية التحتية، من الهياكل الخرسانية إلى المنشآت الفنية.',
    },
    'Génie industriel': {
      fr: "Optimisez les processus de production, la logistique et la gestion de la qualité pour améliorer la performance des systèmes industriels.",
      ar: 'حسّن عمليات الإنتاج واللوجستيك وإدارة الجودة لرفع أداء الأنظمة الصناعية.',
    },
  };

  function getDescription(course: Course): string {
    const localized = courseDescriptions[course.name]?.[lang];
    return localized ?? course.description ?? '';
  }

  return (
    <div className="bg-white">
      {/* Hero — Premium Redesign */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950" />
          <div className="absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute top-20 -left-32 h-[24rem] w-[24rem] rounded-full bg-teal-500/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-[20rem] w-[20rem] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-sky-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {t('hero_badge_v2')}
            </div>

            {/* Title */}
            <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('hero_title_1')}{' '}
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                {t('hero_title_2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              {t('hero_subtitle_v2')}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/inscription')}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/40 sm:w-auto"
              >
                {t('hero_cta_register')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
              >
                {t('hero_cta_admin')}
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
              <TrustItem icon={<Users className="h-5 w-5" />} label={t('hero_trust_expert')} />
              <TrustItem icon={<Award className="h-5 w-5" />} label={t('hero_trust_cert')} />
              <TrustItem icon={<ShieldCheck className="h-5 w-5" />} label={t('hero_trust_career')} />
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <StatDark value="3" label={t('stat_courses')} />
              <StatDark value="1 200+" label={t('stat_students')} />
              <StatDark value="94%" label={t('stat_completion')} />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t('courses_title')}
            </h2>
            <p className="mt-2 text-slate-600">{t('courses_subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/inscription')}
            className="hidden items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700 sm:inline-flex"
          >
            {t('courses_enroll_now')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
              >
                {/* Top accent bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-teal-50 text-sky-600 transition-colors group-hover:from-sky-100 group-hover:to-teal-100">
                  {COURSE_ICONS[c.name] ?? <BookOpen className="h-5 w-5" />}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {getDescription(c)}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate('/inscription')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition-colors hover:text-sky-700"
                  >
                    {t('courses_enroll')}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why us */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <Feature
              icon={<Users className="h-5 w-5" />}
              title={t('feature_instructors_title')}
              body={t('feature_instructors_body')}
            />
            <Feature
              icon={<Clock className="h-5 w-5" />}
              title={t('feature_schedule_title')}
              body={t('feature_schedule_body')}
            />
            <Feature
              icon={<Award className="h-5 w-5" />}
              title={t('feature_certificate_title')}
              body={t('feature_certificate_body')}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-teal-500 px-8 py-14 text-center shadow-lg sm:px-16">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative">
            <ShieldCheck className="mx-auto h-8 w-8 text-white/90" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t('cta_title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sky-50">{t('cta_body')}</p>
            <button
              onClick={() => navigate('/inscription')}
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-100 hover:shadow-md"
            >
              {t('cta_button')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sky-300 ring-1 ring-white/10">
        {icon}
      </span>
      {label}
    </div>
  );
}

function StatDark({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 py-5 text-center">
      <div className="text-2xl font-bold text-white sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-slate-400 sm:text-sm">{label}</div>
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
