import type { Student } from '@/lib/supabase';
import type { Lang } from '@/lib/i18n';

const ADMIN_PASSWORD = 'admin123';
const TEACHER_PASSWORD = 'prof123';

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function verifyTeacherPassword(password: string): boolean {
  return password === TEACHER_PASSWORD;
}

export const ADMIN_PASSWORD_HINT = 'admin123';
export const TEACHER_PASSWORD_HINT = 'prof123';

export function formatDate(iso: string, lang: Lang = 'fr'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string, lang: Lang = 'fr'): string {
  const d = new Date(iso);
  return d.toLocaleString(lang === 'ar' ? 'ar' : 'fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMonthYear(iso: string, lang: Lang = 'fr'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', {
    month: 'short',
    year: '2-digit',
  });
}

export function exportStudentsToCsv(
  students: Student[],
  lang: Lang = 'fr',
  filename = 'students.csv'
) {
  const headers =
    lang === 'ar'
      ? ['الاسم الكامل', 'الهاتف', 'الدورة', 'حالة الدفع', 'تاريخ التسجيل']
      : [`Nom complet`, `Téléphone`, `Cours`, `Statut de paiement`, `Date d'inscription`];

  const escape = (value: string) => {
    const v = value.replace(/"/g, '""');
    return /[",\n]/.test(v) ? `"${v}"` : v;
  };

  const rows = students.map((s) =>
    [s.full_name, s.phone, s.course, s.payment_status, formatDate(s.created_at, lang)]
      .map(escape)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getLast6Months(lang: Lang = 'fr'): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      d.toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', {
        month: 'short',
        year: '2-digit',
      })
    );
  }
  return months;
}
