import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export type Student = {
  id: string;
  full_name: string;
  phone: string;
  course: string;
  payment_status: 'paid' | 'pending';
  created_at: string;
  referred_by: string | null;
};

export type Course = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  created_at: string;
};

export type PaymentStatus = 'paid' | 'pending';

export type Teacher = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  commission_rate: number;
  created_at: string;
};

export type TeacherPayment = {
  id: string;
  teacher_id: string;
  amount: number;
  status: 'paid' | 'pending';
  period: string | null;
  created_at: string;
};
