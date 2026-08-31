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
};

export type Course = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  created_at: string;
};

export type PaymentStatus = 'paid' | 'pending';
