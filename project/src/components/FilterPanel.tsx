import { Filter } from 'lucide-react';
import { Client, EventWithClient, PersonalClient, PersonalEventWithClient } from '../lib/supabase';
import { getEventColor } from '../utils/colorUtils';
import { parseDate } from '../utils/dateUtils';

type CalendarClient = Client | PersonalClient;
type CalendarEvent = EventWithClient | PersonalEventWithClient;

interface FilterPanelProps {
  clients: CalendarClient[];
  events: CalendarEvent[];
  selectedClientFilter: string;
  selectedTypeFilter: string;
  onClientFilterChange: (clientId: string) => void;
  onTypeFilterChange: (type: string) => void;
}

export default function FilterPanel({
  clients,
  events,
  selectedClientFilter,
  selectedTypeFilter,
  onClientFilterChange,
  onTypeFilterChange,
}: FilterPanelProps) {

  const getStatsByType = () => {
    const stats: Record<string, { days: number; hours: number }> = {
      hold: { days: 0, hours: 0 },
      book: { days: 0, hours: 0 },
      paid: { days: 0, hours: 0 },
      total: { days: 0, hours: 0 },
    };

    events.forEach(event => {
      const startDate = parseDate(event.start_date);
      const endDate = parseDate(event.end_date);
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const hours = days * (event.duration_hours || 0);

      if (!stats[event.event_type]) {
        stats[event.event_type] = { days: 0, hours: 0 };
      }

      stats[event.event_type].days += days;
      stats[event.event_type].hours += hours;
      stats.total.days += days;
      stats.total.hours += hours;
    });

    return stats;
  };

  const getStatsByClient = () => {
    const statsMap = new Map<string, Record<string, { days: number; hours: number }>>();

    clients.forEach(client => {
      statsMap.set(client.id, {
        hold: { days: 0, hours: 0 },
        book: { days: 0, hours: 0 },
        paid: { days: 0, hours: 0 },
        total: { days: 0, hours: 0 }
      });
    });

    events.forEach(event => {
      const clientId = 'client_id' in event ? event.client_id : event.personal_client_id;
      if (!clientId) return;

      let stats = statsMap.get(clientId);
      if (!stats) {
        stats = {
          hold: { days: 0, hours: 0 },
          book: { days: 0, hours: 0 },
          paid: { days: 0, hours: 0 },
          total: { days: 0, hours: 0 }
        };
        statsMap.set(clientId, stats);
      }

      const startDate = parseDate(event.start_date);
      const endDate = parseDate(event.end_date);
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const hours = days * (event.duration_hours || 0);

      if (!stats[event.event_type]) {
        stats[event.event_type] = { days: 0, hours: 0 };
      }

      stats[event.event_type].days += days;
      stats[event.event_type].hours += hours;
      stats.total.days += days;
      stats.total.hours += hours;
    });

    return statsMap;
  };

  const typeStats = getStatsByType();
  const clientStats = getStatsByClient();

  return (
    <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0">
      <div className="p-6 sticky top-0 bg-white border-b border-slate-200 z-10">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Filters</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client
            </label>
            <select
              value={selectedClientFilter}
              onChange={(e) => onClientFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Type
            </label>
            <select
              value={selectedTypeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="hold">Hold</option>
              <option value="book">Booked</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-green-600">📊</span>
            Statistics
          </h3>

          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Holds:</span>
              <div className="text-right">
                <div className="font-semibold text-slate-800">{typeStats.hold.days} days</div>
                <div className="text-xs text-slate-500">{typeStats.hold.hours}h</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Bookings:</span>
              <div className="text-right">
                <div className="font-semibold text-slate-800">{typeStats.book.days} days</div>
                <div className="text-xs text-slate-500">{typeStats.book.hours}h</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Paid:</span>
              <div className="text-right">
                <div className="font-semibold text-slate-800">{typeStats.paid.days} days</div>
                <div className="text-xs text-slate-500">{typeStats.paid.hours}h</div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700">Total:</span>
                <div className="text-right">
                  <div className="text-slate-900">{typeStats.total.days} days</div>
                  <div className="text-xs font-semibold text-slate-600">{typeStats.total.hours}h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">By Client</h3>
          <div className="space-y-3">
            {clients.map(client => {
              const stats = clientStats.get(client.id);
              if (!stats) return null;

              return (
                <div
                  key={client.id}
                  className="bg-slate-50 rounded-lg p-4 space-y-2 border-l-4 transition-all hover:shadow-lg"
                  style={{ borderColor: client.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="font-semibold text-slate-800 text-sm">
                        {client.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-600">
                        {stats.total.days} days
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {stats.total.hours}h
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 rounded" style={{
                      backgroundColor: getEventColor(client.color, 'paid'),
                      color: 'white'
                    }}>
                      <div className="font-semibold">{stats.paid.days}</div>
                      <div className="opacity-90 text-[10px]">{stats.paid.hours}h</div>
                      <div className="opacity-90">Paid</div>
                    </div>
                    <div className="text-center p-2 rounded" style={{
                      backgroundColor: getEventColor(client.color, 'book'),
                      color: 'white'
                    }}>
                      <div className="font-semibold">{stats.book.days}</div>
                      <div className="opacity-90 text-[10px]">{stats.book.hours}h</div>
                      <div className="opacity-90">Book</div>
                    </div>
                    <div className="text-center p-2 rounded" style={{
                      backgroundColor: getEventColor(client.color, 'hold'),
                      color: 'white'
                    }}>
                      <div className="font-semibold">{stats.hold.days}</div>
                      <div className="opacity-90 text-[10px]">{stats.hold.hours}h</div>
                      <div className="opacity-90">Hold</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
