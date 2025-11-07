import { EventWithClient, PersonalEventWithClient } from '../lib/supabase';
import { getEventColor, getEventBorderColor } from '../utils/colorUtils';
import { X, Pencil } from 'lucide-react';

type CalendarEvent = EventWithClient | PersonalEventWithClient;

interface CalendarDayProps {
  date: Date;
  isSelected: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onEventDelete: (eventId: string) => void;
  onEventEdit: (event: CalendarEvent) => void;
}

export default function CalendarDay({
  date,
  isSelected,
  isCurrentMonth,
  isToday,
  events,
  onMouseDown,
  onMouseEnter,
  onEventDelete,
  onEventEdit,
}: CalendarDayProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.event-card')) {
      return;
    }
    e.preventDefault();
    onMouseDown(date);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.event-card')) {
      return;
    }
    onMouseEnter(date);
  };

  return (
    <div
      className={`
        min-h-[120px] p-2 bg-white dark:bg-slate-800 transition-colors cursor-pointer relative
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400 dark:ring-blue-500 ring-inset' : ''}
        ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}
        ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
      `}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <div className={`
        text-sm font-medium mb-2
        ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}
        ${isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
      `}>
        {date.getDate()}
      </div>

      <div className="space-y-1">
        {events.map(event => {
          const client = 'clients' in event ? event.clients : event.personal_clients;
          const clientColor = client?.color || '#94a3b8';
          const displayName = event.title || client?.name || 'Untitled';

          return (
            <div
              key={event.id}
              className="event-card group relative rounded px-2 py-1 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all cursor-default"
              style={{
                backgroundColor: getEventColor(clientColor, event.event_type),
                borderLeft: `3px solid ${getEventBorderColor(clientColor, event.event_type)}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate flex-1">
                  {displayName}
                </span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventEdit(event);
                  }}
                  className="p-0.5 hover:bg-black/20 rounded"
                  aria-label="Edit event"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventDelete(event.id);
                  }}
                  className="p-0.5 hover:bg-black/20 rounded"
                  aria-label="Delete event"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
              <div className="text-[10px] opacity-90 mt-0.5 flex items-center justify-between">
                <span className="capitalize">{event.event_type}</span>
                <span className="font-semibold">{event.duration_hours}h</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
