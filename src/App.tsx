import { useRoute } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { I18nProvider } from '@/lib/i18n';
import { LandingPage } from '@/pages/LandingPage';
import { RegistrationPage } from '@/pages/RegistrationPage';
import { AdminPage } from '@/pages/AdminPage';

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-6xl font-bold tracking-tight text-slate-900">404</p>
      <p className="mt-3 text-slate-500">{t('notfound_title')}</p>
      <a
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
      >
        {t('notfound_go_home')}
      </a>
    </div>
  );
}

export default function App() {
  const route = useRoute();

  let page: React.ReactNode;
  if (route === '/' || route === '') {
    page = <LandingPage />;
  } else if (route.startsWith('/inscription')) {
    page = <RegistrationPage />;
  } else if (route.startsWith('/admin')) {
    page = <AdminPage />;
  } else {
    page = <NotFound />;
  }

  return <I18nProvider>{page}</I18nProvider>;
}
