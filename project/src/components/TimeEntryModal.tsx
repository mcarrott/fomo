import { useState, useEffect } from 'react';
import { X, Play, Save, Trash2, Clock, Star, TrendingUp } from 'lucide-react';
import { supabase, Client } from '../lib/supabase';

interface TaskPreset {
  id: string;
  name: string;
  client_id: string | null;
  usage_count: number;
  last_used: string | null;
  clients: Client | null;
}

interface TimeEntry {
  id: string;
  client_id: string | null;
  task_name: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  date: string;
  clients: Client | null;
}

interface TimeEntryModalProps {
  mode: 'timer' | 'manual';
  clients: Client[];
  editingEntry: TimeEntry | null;
  onClose: () => void;
  onStart: (taskName: string, clientId: string | null, saveAsPreset: boolean) => void;
  onCreateManual: (taskName: string, clientId: string | null, date: string, startTime: string, endTime: string, durationMinutes: number) => void;
  onUpdateManual: (entryId: string, taskName: string, clientId: string | null, date: string, startTime: string, endTime: string, durationMinutes: number) => void;
}

export default function TimeEntryModal({ mode, clients, editingEntry, onClose, onStart, onCreateManual, onUpdateManual }: TimeEntryModalProps) {
  const [taskName, setTaskName] = useState(editingEntry?.task_name || '');
  const [clientId, setClientId] = useState<string>(editingEntry?.client_id || '');
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [presets, setPresets] = useState<TaskPreset[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent');
  const [showPresetManager, setShowPresetManager] = useState(false);

  const [date, setDate] = useState(editingEntry?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(() => {
    if (editingEntry?.start_time) {
      const dt = new Date(editingEntry.start_time);
      return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }
    return '09:00';
  });
  const [endTime, setEndTime] = useState(() => {
    if (editingEntry?.end_time) {
      const dt = new Date(editingEntry.end_time);
      return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }
    return '17:00';
  });

  useEffect(() => {
    fetchPresets();
  }, []);

  async function fetchPresets() {
    const { data, error } = await supabase
      .from('task_presets')
      .select('*, clients(*)')
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching presets:', error);
    } else if (data) {
      setPresets(data as TaskPreset[]);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    if (mode === 'timer') {
      onStart(taskName.trim(), clientId || null, saveAsPreset);
    } else {
      if (!date || !startTime || !endTime) return;

      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      const durationMinutes = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000 / 60);

      if (durationMinutes <= 0) {
        alert('End time must be after start time');
        return;
      }

      if (editingEntry) {
        onUpdateManual(
          editingEntry.id,
          taskName.trim(),
          clientId || null,
          date,
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          durationMinutes
        );
      } else {
        onCreateManual(
          taskName.trim(),
          clientId || null,
          date,
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          durationMinutes
        );
      }
    }
  };

  const handleSelectPreset = (preset: TaskPreset) => {
    setTaskName(preset.name);
    setClientId(preset.client_id || '');
  };

  const handleDeletePreset = async (presetId: string) => {
    const { error } = await supabase
      .from('task_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting preset:', error);
    } else {
      await fetchPresets();
    }
  };

  const getSortedPresets = () => {
    const sorted = [...presets];

    if (sortBy === 'recent') {
      sorted.sort((a, b) => {
        if (!a.last_used) return 1;
        if (!b.last_used) return -1;
        return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
      });
    } else if (sortBy === 'popular') {
      sorted.sort((a, b) => b.usage_count - a.usage_count);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  };

  const selectedClient = clients.find(c => c.id === clientId);
  const sortedPresets = getSortedPresets();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {mode === 'timer' ? 'Start Timer' : editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
          </h2>
          <p className="text-sm text-slate-600">
            {mode === 'timer' ? 'Select a preset or enter a new task' : 'Enter time entry details'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mode === 'timer' && presets.length > 0 && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Task Presets
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'name')}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Recent</option>
                    <option value="popular">Popular</option>
                    <option value="name">A-Z</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {sortedPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {preset.clients && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: preset.clients.color }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{preset.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {preset.clients && (
                            <span className="truncate">{preset.clients.name}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {preset.usage_count}x
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded"
                      aria-label="Delete preset"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoFocus={presets.length === 0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client (Optional)
              </label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-slate-800"
                >
                  <option value="">No Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
                    style={{ backgroundColor: selectedClient.color }}
                  />
                )}
              </div>
            </div>

            {mode === 'manual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'timer' && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="saveAsPreset"
                  checked={saveAsPreset}
                  onChange={(e) => setSaveAsPreset(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="saveAsPreset" className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <Save className="w-4 h-4 text-blue-600" />
                  Save as preset for quick access
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {mode === 'timer' ? (
                  <>
                    <Play className="w-4 h-4" />
                    Start Timer
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
