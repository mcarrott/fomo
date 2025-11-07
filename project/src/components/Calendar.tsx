import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, User } from 'lucide-react';
import { getMonthDays, isSameDay, formatDate } from '../utils/dateUtils';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import FilterPanel from './FilterPanel';
import { supabase, Client, EventWithClient, PersonalClient, PersonalEventWithClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type CalendarView = 'work' | 'personal';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('work');

  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<EventWithClient[]>([]);

  const [personalClients, setPersonalClients] = useState<PersonalClient[]>([]);
  const [personalEvents, setPersonalEvents] = useState<PersonalEventWithClient[]>([]);

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithClient | PersonalEventWithClient | null>(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [defaultEventHours, setDefaultEventHours] = useState(8);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchEvents();
      fetchPersonalClients();
      fetchPersonalEvents();
      fetchUserSettings();
    }
  }, [user]);

  async function fetchUserSettings() {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('default_event_hours')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user settings:', error);
    } else if (data) {
      setDefaultEventHours(data.default_event_hours || 8);
    }
  }

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

  async function fetchPersonalClients() {
    if (!user) return;

    const { data, error } = await supabase
      .from('personal_clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching personal clients:', error);
    } else if (data) {
      setPersonalClients(data);
    }
  }

  async function fetchPersonalEvents() {
    if (!user) return;

    const { data, error } = await supabase
      .from('personal_events')
      .select('*, personal_clients(*)')
      .eq('user_id', user.id)
      .order('start_date');

    if (error) {
      console.error('Error fetching personal events:', error);
    } else if (data) {
      setPersonalEvents(data as PersonalEventWithClient[]);
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
    clientId: string | null;
    title: string;
    eventType: string;
    durationHours: number;
    details?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    if (selectedDates.length === 0) return;

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const startDate = formatDate(sortedDates[0]);
    const endDate = formatDate(sortedDates[sortedDates.length - 1]);

    if (calendarView === 'work') {
      if (editingEvent && 'client_id' in editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            client_id: eventData.clientId,
            title: eventData.title,
            start_date: startDate,
            end_date: endDate,
            event_type: eventData.eventType,
            duration_hours: eventData.durationHours,
            details: eventData.details || null,
            start_time: eventData.startTime || null,
            end_time: eventData.endTime || null,
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
            duration_hours: eventData.durationHours,
            details: eventData.details || null,
            start_time: eventData.startTime || null,
            end_time: eventData.endTime || null,
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
    } else {
      if (editingEvent && 'personal_client_id' in editingEvent) {
        const { error } = await supabase
          .from('personal_events')
          .update({
            personal_client_id: eventData.clientId,
            title: eventData.title,
            start_date: startDate,
            end_date: endDate,
            event_type: eventData.eventType,
            duration_hours: eventData.durationHours,
            details: eventData.details || null,
            start_time: eventData.startTime || null,
            end_time: eventData.endTime || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEvent.id);

        if (error) {
          console.error('Error updating personal event:', error);
        } else {
          await fetchPersonalEvents();
          setIsModalOpen(false);
          setSelectedDates([]);
          setEditingEvent(null);
        }
      } else {
        const { error } = await supabase
          .from('personal_events')
          .insert({
            personal_client_id: eventData.clientId,
            title: eventData.title,
            start_date: startDate,
            end_date: endDate,
            event_type: eventData.eventType,
            duration_hours: eventData.durationHours,
            details: eventData.details || null,
            start_time: eventData.startTime || null,
            end_time: eventData.endTime || null,
            user_id: user?.id,
          });

        if (error) {
          console.error('Error creating personal event:', error);
        } else {
          await fetchPersonalEvents();
          setIsModalOpen(false);
          setSelectedDates([]);
        }
      }
    }
  };

  const handleEventDelete = async (eventId: string) => {
    const tableName = calendarView === 'work' ? 'events' : 'personal_events';
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
    } else {
      if (calendarView === 'work') {
        await fetchEvents();
      } else {
        await fetchPersonalEvents();
      }
    }
  };

  const handleEventEdit = (event: EventWithClient | PersonalEventWithClient) => {
    setEditingEvent(event);
    const startDate = new Date(event.start_date + 'T00:00:00');
    const endDate = new Date(event.end_date + 'T00:00:00');
    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    setSelectedDates(dates);
    setIsModalOpen(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentClients = calendarView === 'work' ? clients : personalClients;
  const currentEvents = calendarView === 'work' ? events : personalEvents;

  const filteredEvents = currentEvents.filter(event => {
    const clientId = calendarView === 'work'
      ? (event as EventWithClient).client_id
      : (event as PersonalEventWithClient).personal_client_id;

    if (selectedClientFilter !== 'all' && clientId !== selectedClientFilter) {
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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Calendar</h1>

                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                      onClick={() => setCalendarView('work')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        calendarView === 'work'
                          ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      Work Cal
                    </button>
                    <button
                      onClick={() => setCalendarView('personal')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        calendarView === 'personal'
                          ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Personal Cal
                    </button>
                  </div>

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

              <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Tip: Click and drag across multiple days to quickly create repeating events
                </p>
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
          clients={currentClients as any}
          events={filteredEvents as any}
          selectedClientFilter={selectedClientFilter}
          selectedTypeFilter={selectedTypeFilter}
          onClientFilterChange={setSelectedClientFilter}
          onTypeFilterChange={setSelectedTypeFilter}
        />
      </div>

      {isModalOpen && (
        <EventModal
          clients={currentClients as any}
          selectedDates={selectedDates}
          editingEvent={editingEvent as any}
          defaultHours={defaultEventHours}
          isPersonal={calendarView === 'personal'}
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
