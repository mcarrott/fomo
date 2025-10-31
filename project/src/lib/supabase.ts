import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please configure the following environment variables in your hosting platform:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  console.error('\nFor local development, add these to your .env file.');

  throw new Error(
    'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Client {
  id: string;
  name: string;
  color: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  hourly_rate?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  client_id: string;
  title: string;
  start_date: string;
  end_date: string;
  event_type: 'hold' | 'book' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface EventWithClient extends Event {
  clients: Client;
}
