import { Client } from './supabase';

export interface Task {
  id: string;
  client_id: string | null;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'med' | 'high';
  due_date: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskWithClient extends Task {
  clients: Client | null;
}

export type ViewMode = 'today' | 'week';
export type SortBy = 'priority' | 'due_date' | 'client';
