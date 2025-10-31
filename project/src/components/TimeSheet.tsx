import { useState, useEffect } from 'react';
import { Play, Pause, Plus, Clock } from 'lucide-react';
import { supabase, Client } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TimeEntryModal from './TimeEntryModal';
import TimeEntryList from './TimeEntryList';

interface TimeEntry {
  id: string;
  client_id: string | null;
  task_name: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  is_running: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

interface TimeEntryWithClient extends TimeEntry {
  clients: Client | null;
}

export default function TimeSheet() {
  const [clients, setClients] = useState<Client[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithClient[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntryWithClient | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'duration'>('date');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchTimeEntries();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeTimer) {
      const startTime = new Date(activeTimer.start_time).getTime();

      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000 / 60);
        setElapsedMinutes(diff);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

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

  async function fetchTimeEntries() {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, clients(*)')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
    } else if (data) {
      setTimeEntries(data as TimeEntryWithClient[]);

      const running = data.find(entry => entry.is_running);
      if (running) {
        setActiveTimer(running as TimeEntryWithClient);
        const startTime = new Date(running.start_time).getTime();
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000 / 60);
        setElapsedMinutes(diff);
      }
    }
  }

  const handleStartTimer = async (taskName: string, clientId: string | null, saveAsPreset: boolean) => {
    if (activeTimer) {
      await handleStopTimer();
    }

    if (saveAsPreset) {
      const { data: existingPreset } = await supabase
        .from('task_presets')
        .select('id')
        .eq('name', taskName)
        .eq('client_id', clientId)
        .maybeSingle();

      if (!existingPreset) {
        await supabase
          .from('task_presets')
          .insert({
            name: taskName,
            client_id: clientId,
            usage_count: 1,
            last_used: new Date().toISOString(),
            user_id: user?.id,
          });
      }
    }

    const { data: presetData } = await supabase
      .from('task_presets')
      .select('*')
      .eq('name', taskName)
      .eq('client_id', clientId)
      .maybeSingle();

    if (presetData) {
      await supabase
        .from('task_presets')
        .update({
          usage_count: presetData.usage_count + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', presetData.id);
    }

    const now = new Date();
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        client_id: clientId,
        task_name: taskName,
        start_time: now.toISOString(),
        is_running: true,
        date: now.toISOString().split('T')[0],
        duration_minutes: 0,
        user_id: user?.id,
      })
      .select('*, clients(*)')
      .single();

    if (error) {
      console.error('Error starting timer:', error);
    } else if (data) {
      setActiveTimer(data as TimeEntryWithClient);
      setElapsedMinutes(0);
      await fetchTimeEntries();
      setIsModalOpen(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    const now = new Date();
    const startTime = new Date(activeTimer.start_time).getTime();
    const duration = Math.floor((now.getTime() - startTime) / 1000 / 60);

    const { error } = await supabase
      .from('time_entries')
      .update({
        end_time: now.toISOString(),
        duration_minutes: duration,
        is_running: false,
        updated_at: now.toISOString(),
      })
      .eq('id', activeTimer.id);

    if (error) {
      console.error('Error stopping timer:', error);
    } else {
      setActiveTimer(null);
      setElapsedMinutes(0);
      await fetchTimeEntries();
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting time entry:', error);
    } else {
      await fetchTimeEntries();
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getFilteredAndSortedEntries = () => {
    let filtered = timeEntries.filter(entry => !entry.is_running);

    if (selectedClient !== 'all') {
      filtered = filtered.filter(entry => entry.client_id === selectedClient);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      } else if (sortBy === 'client') {
        const aName = a.clients?.name || 'zzz';
        const bName = b.clients?.name || 'zzz';
        return aName.localeCompare(bName);
      } else if (sortBy === 'duration') {
        return b.duration_minutes - a.duration_minutes;
      }
      return 0;
    });

    return filtered;
  };

  const filteredEntries = getFilteredAndSortedEntries();

  const getTotalHours = () => {
    const total = filteredEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
    return (total / 60).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Time Tracking</h1>
            <p className="text-slate-600 dark:text-slate-300">Track your work hours by client and task</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {formatTime(elapsedMinutes)}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {activeTimer ? activeTimer.task_name : 'No timer running'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {activeTimer ? (
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Pause className="w-5 h-5" />
                    Stop Timer
                  </button>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-5 h-5" />
                    Start Timer
                  </button>
                )}
              </div>
            </div>

            {activeTimer && activeTimer.clients && (
              <div
                className="px-4 py-3 rounded-lg border-l-4"
                style={{
                  backgroundColor: activeTimer.clients.color + '10',
                  borderLeftColor: activeTimer.clients.color,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeTimer.clients.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {activeTimer.clients.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Time Entries</h3>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                  {getTotalHours()} hours
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="all">All Clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'duration')}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="client">Sort by Client</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </div>

            <TimeEntryList
              entries={filteredEntries}
              onDelete={handleDeleteEntry}
              formatTime={formatTime}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TimeEntryModal
          clients={clients}
          onClose={() => setIsModalOpen(false)}
          onStart={handleStartTimer}
        />
      )}
    </div>
  );
}
