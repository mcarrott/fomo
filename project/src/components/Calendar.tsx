import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthDays, isSameDay, formatDate } from '../utils/dateUtils';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import FilterPanel from './FilterPanel';
import { supabase, Client, EventWithClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<EventWithClient[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithClient | null>(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchEvents();
    }
  }, [user]);

  async function fetchClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
    } else if (data) {
      setClients(data);
    }
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*, clients(*)')
      .order('start_date');

    if (error) {
      console.error('Error fetching events:', error);
    } else if (data) {
      setEvents(data as EventWithClient[]);
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragComplete = (dates: Date[]) => {
    if (dates.length > 0) {
      setSelectedDates(dates);
      setIsModalOpen(true);
    }
  };

  const handleEventCreate = async (eventData: {
    clientId: string;
    title: string;
    eventType: 'hold' | 'book' | 'paid';
  }) => {
    if (selectedDates.length === 0) return;

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const startDate = formatDate(sortedDates[0]);
    const endDate = formatDate(sortedDates[sortedDates.length - 1]);

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          client_id: eventData.clientId,
          title: eventData.title,
          start_date: startDate,
          end_date: endDate,
          event_type: eventData.eventType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingEvent.id);

      if (error) {
        console.error('Error updating event:', error);
      } else {
        await fetchEvents();
        setIsModalOpen(false);
        setSelectedDates([]);
        setEditingEvent(null);
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert({
          client_id: eventData.clientId,
          title: eventData.title,
          start_date: startDate,
          end_date: endDate,
          event_type: eventData.eventType,
          user_id: user?.id,
        });

      if (error) {
        console.error('Error creating event:', error);
      } else {
        await fetchEvents();
        setIsModalOpen(false);
        setSelectedDates([]);
      }
    }
  };

  const handleEventDelete = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
    } else {
      await fetchEvents();
    }
  };

  const handleEventEdit = (event: EventWithClient) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredEvents = events.filter(event => {
    if (selectedClientFilter !== 'all' && event.client_id !== selectedClientFilter) {
      return false;
    }
    if (selectedTypeFilter !== 'all' && event.event_type !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex h-screen">
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Calendar</h1>
                  <button
                    onClick={handleToday}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Today
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="text-xl font-semibold text-slate-800 min-w-[200px] text-center">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>

              <CalendarGrid
                currentDate={currentDate}
                events={filteredEvents}
                onDragComplete={handleDragComplete}
                onEventDelete={handleEventDelete}
                onEventEdit={handleEventEdit}
              />
            </div>
          </div>
        </div>

        <FilterPanel
          clients={clients}
          events={filteredEvents}
          selectedClientFilter={selectedClientFilter}
          selectedTypeFilter={selectedTypeFilter}
          onClientFilterChange={setSelectedClientFilter}
          onTypeFilterChange={setSelectedTypeFilter}
        />
      </div>

      {isModalOpen && (
        <EventModal
          clients={clients}
          selectedDates={selectedDates}
          editingEvent={editingEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDates([]);
            setEditingEvent(null);
          }}
          onSubmit={handleEventCreate}
        />
      )}
    </div>
  );
}
