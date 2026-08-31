import type { Student } from '@/lib/supabase';

const ADMIN_PASSWORD = 'admin123';

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export const ADMIN_PASSWORD_HINT = 'admin123';

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function exportStudentsToCsv(students: Student[], filename = 'students.csv') {
  const headers = ['Full Name', 'Phone', 'Course', 'Payment Status', 'Registration Date'];
  const escape = (value: string) => {
    const v = value.replace(/"/g, '""');
    return /[",\n]/.test(v) ? `"${v}"` : v;
  };
  const rows = students.map((s) =>
    [s.full_name, s.phone, s.course, s.payment_status, formatDate(s.created_at)]
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
