import { useState, useRef, useEffect } from 'react';
import { getMonthDays, isSameDay, formatDate, parseDate, isDateInRange } from '../utils/dateUtils';
import { EventWithClient } from '../lib/supabase';
import CalendarDay from './CalendarDay';

interface CalendarGridProps {
  currentDate: Date;
  events: EventWithClient[];
  onDragComplete: (dates: Date[]) => void;
  onEventDelete: (eventId: string) => void;
  onEventEdit: (event: EventWithClient) => void;
}

export default function CalendarGrid({ currentDate, events, onDragComplete, onEventDelete, onEventEdit }: CalendarGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSelectedDates = (): Date[] => {
    if (!dragStart || !dragEnd) return [];

    const start = dragStart.getTime() < dragEnd.getTime() ? dragStart : dragEnd;
    const end = dragStart.getTime() < dragEnd.getTime() ? dragEnd : dragStart;

    const selected: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      selected.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return selected;
  };

  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging) {
      setDragEnd(date);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const selectedDates = getSelectedDates();
      onDragComplete(selectedDates);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  const selectedDates = getSelectedDates();

  return (
    <div ref={gridRef} className="select-none">
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {weekDays.map(day => (
          <div
            key={day}
            className="bg-slate-50 dark:bg-slate-800 px-3 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const isSelected = selectedDates.some(d => isSameDay(d, day));
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter(event => {
            const start = parseDate(event.start_date);
            const end = parseDate(event.end_date);
            return isDateInRange(day, start, end);
          });

          return (
            <CalendarDay
              key={index}
              date={day}
              isSelected={isSelected}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              events={dayEvents}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onEventDelete={onEventDelete}
              onEventEdit={onEventEdit}
            />
          );
        })}
      </div>
    </div>
  );
}
