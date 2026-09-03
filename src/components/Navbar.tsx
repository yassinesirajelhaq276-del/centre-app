import { useEffect, useState } from 'react';
import { useRoute, navigate } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { GraduationCap, LayoutDashboard, UserPlus, Languages } from 'lucide-react';

export function Navbar() {
  const route = useRoute();
  const { t, lang, toggleLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = route.startsWith('/admin');
  const isInscription = route.startsWith('/inscription');

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/70'
          : 'bg-white/0'
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              {t('brand_name')}
              <span className="text-sky-600">{t('brand_highlight')}</span>
            </span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Switch language"
              title={lang === 'fr' ? 'العربية' : 'Français'}
            >
              <Languages className="h-4 w-4" />
              <span className="font-semibold">{lang === 'fr' ? t('lang_ar') : t('lang_fr')}</span>
            </button>
            <button
              onClick={() => navigate('/inscription')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isInscription
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav_register')}</span>
            </button>
            <button
              onClick={() => navigate('/admin')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isAdmin
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav_admin')}</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export function Toast({
  toast,
}: {
  toast: { id: number; message: string; type: 'success' | 'error' } | null;
}) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg transition-all ${
        toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
      }`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
