import { Filter, ArrowUpDown } from 'lucide-react';
import { Client } from '../lib/supabase';
import { SortBy } from '../lib/types';

interface TaskFiltersProps {
  clients: Client[];
  selectedClient: string;
  selectedPriority: string;
  sortBy: SortBy;
  onClientChange: (clientId: string) => void;
  onPriorityChange: (priority: string) => void;
  onSortChange: (sortBy: SortBy) => void;
}

export default function TaskFilters({
  clients,
  selectedClient,
  selectedPriority,
  sortBy,
  onClientChange,
  onPriorityChange,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-600" />
        <select
          value={selectedClient}
          onChange={(e) => onClientChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="all">All Clients</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
      >
        <option value="all">All Priorities</option>
        <option value="high">High Priority</option>
        <option value="med">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-slate-600" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="priority">Sort by Priority</option>
          <option value="due_date">Sort by Due Date</option>
          <option value="client">Sort by Client</option>
        </select>
      </div>
    </div>
  );
}
