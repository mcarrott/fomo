import { Trash2, Calendar } from 'lucide-react';
import { Client } from '../lib/supabase';

interface TimeEntry {
  id: string;
  client_id: string | null;
  task_name: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  is_running: boolean;
  date: string;
  clients: Client | null;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDelete: (entryId: string) => void;
  formatTime: (minutes: number) => string;
}

export default function TimeEntryList({ entries, onDelete, formatTime }: TimeEntryListProps) {
  const groupByClientAndDate = () => {
    const grouped: { [key: string]: { [date: string]: TimeEntry[] } } = {};

    entries.forEach(entry => {
      const clientKey = entry.clients?.name || 'No Client';
      const dateKey = entry.date;

      if (!grouped[clientKey]) {
        grouped[clientKey] = {};
      }
      if (!grouped[clientKey][dateKey]) {
        grouped[clientKey][dateKey] = [];
      }
      grouped[clientKey][dateKey].push(entry);
    });

    return grouped;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTimeRange = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    const startStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (!end) return startStr;

    const endStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${startStr} - ${endStr}`;
  };

  const grouped = groupByClientAndDate();

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No time entries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([clientName, dateGroups]) => {
        const clientEntries = Object.values(dateGroups).flat();
        const clientColor = clientEntries[0]?.clients?.color || '#94a3b8';
        const totalMinutes = clientEntries.reduce((sum, e) => sum + e.duration_minutes, 0);

        return (
          <div key={clientName} className="border border-slate-200 rounded-xl overflow-hidden">
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                backgroundColor: clientColor + '15',
                borderLeft: `4px solid ${clientColor}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: clientColor }}
                />
                <h3 className="font-bold text-slate-800">{clientName}</h3>
              </div>
              <div className="text-sm font-semibold text-slate-700">
                {formatTime(totalMinutes)}
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {Object.entries(dateGroups).map(([date, dateEntries]) => {
                const dayTotal = dateEntries.reduce((sum, e) => sum + e.duration_minutes, 0);

                return (
                  <div key={date} className="bg-white">
                    <div className="px-4 py-2 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar className="w-4 h-4" />
                        {formatDate(date)}
                      </div>
                      <div className="text-sm font-semibold text-slate-600">
                        {formatTime(dayTotal)}
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {dateEntries.map(entry => (
                        <div
                          key={entry.id}
                          className="px-4 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-800 mb-1">
                                {entry.task_name}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {formatTimeRange(entry.start_time, entry.end_time)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-semibold text-slate-800">
                                  {formatTime(entry.duration_minutes)}
                                </div>
                              </div>
                              <button
                                onClick={() => onDelete(entry.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                                aria-label="Delete entry"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
