import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Client, EventWithClient, PersonalClient, PersonalEventWithClient } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getEventColor } from '../utils/colorUtils';
import { parseDate, getDateRange } from '../utils/dateUtils';

interface CustomEventType {
  id: string;
  name: string;
  color: string;
  is_work: boolean;
}

type CalendarClient = Client | PersonalClient;
type CalendarEvent = EventWithClient | PersonalEventWithClient;

interface EventModalProps {
  clients: CalendarClient[];
  selectedDates: Date[];
  editingEvent: CalendarEvent | null;
  defaultHours: number;
  isPersonal: boolean;
  onClose: () => void;
  onSubmit: (data: {
    clientId: string | null;
    title: string;
    eventType: string;
    durationHours: number;
    details?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
}

export default function EventModal({
  clients,
  selectedDates,
  editingEvent,
  defaultHours,
  isPersonal,
  onClose,
  onSubmit
}: EventModalProps) {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(
    editingEvent
      ? ('client_id' in editingEvent ? editingEvent.client_id : editingEvent.personal_client_id || null)
      : (clients[0]?.id || null)
  );
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [eventType, setEventType] = useState<string>(editingEvent?.event_type || 'book');
  const [durationHours, setDurationHours] = useState(editingEvent?.duration_hours || defaultHours);
  const [details, setDetails] = useState((editingEvent as any)?.details || '');
  const [startTime, setStartTime] = useState((editingEvent as any)?.start_time || '');
  const [endTime, setEndTime] = useState((editingEvent as any)?.end_time || '');
  const [useTimeRange, setUseTimeRange] = useState(!!((editingEvent as any)?.start_time || (editingEvent as any)?.end_time));

  const [customEventTypes, setCustomEventTypes] = useState<CustomEventType[]>([]);
  const [showAddEventType, setShowAddEventType] = useState(false);
  const [newEventTypeName, setNewEventTypeName] = useState('');
  const [newEventTypeColor, setNewEventTypeColor] = useState('#3B82F6');

  useEffect(() => {
    if (user) {
      fetchCustomEventTypes();
    }
  }, [user, isPersonal]);

  async function fetchCustomEventTypes() {
    if (!user) return;

    const { data, error } = await supabase
      .from('custom_event_types')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_work', !isPersonal)
      .order('name');

    if (error) {
      console.error('Error fetching custom event types:', error);
    } else if (data) {
      setCustomEventTypes(data);
    }
  }

  const handleAddCustomEventType = async () => {
    if (!user || !newEventTypeName.trim()) return;

    const { data, error } = await supabase
      .from('custom_event_types')
      .insert({
        user_id: user.id,
        name: newEventTypeName.trim(),
        color: newEventTypeColor,
        is_work: !isPersonal,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom event type:', error);
    } else if (data) {
      setCustomEventTypes([...customEventTypes, data]);
      setEventType(data.name);
      setNewEventTypeName('');
      setNewEventTypeColor('#3B82F6');
      setShowAddEventType(false);
    }
  };

  useEffect(() => {
    if (editingEvent) {
      setClientId('client_id' in editingEvent ? editingEvent.client_id : editingEvent.personal_client_id || null);
      setTitle(editingEvent.title);
      setEventType(editingEvent.event_type);
      setDurationHours(editingEvent.duration_hours || defaultHours);
      setDetails((editingEvent as any).details || '');
      setStartTime((editingEvent as any).start_time || '');
      setEndTime((editingEvent as any).end_time || '');
      setUseTimeRange(!!((editingEvent as any).start_time || (editingEvent as any).end_time));
    }
  }, [editingEvent, defaultHours]);

  const displayDates = editingEvent
    ? getDateRange(parseDate(editingEvent.start_date), parseDate(editingEvent.end_date))
    : selectedDates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      clientId,
      title,
      eventType,
      durationHours,
      details: details.trim() || undefined,
      startTime: useTimeRange && startTime ? startTime : undefined,
      endTime: useTimeRange && endTime ? endTime : undefined,
    });
  };

  const selectedClient = clientId ? clients.find(c => c.id === clientId) : null;

  const formatDateRange = () => {
    if (displayDates.length === 0) return '';
    if (displayDates.length === 1) {
      return displayDates[0].toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    const sorted = [...displayDates].sort((a, b) => a.getTime() - b.getTime());
    const start = sorted[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = sorted[sorted.length - 1].toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${start} - ${end}`;
  };

  const defaultEventTypes = ['hold', 'book', 'paid'];
  const allEventTypes = [...defaultEventTypes, ...customEventTypes.map(t => t.name)];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {formatDateRange()} ({displayDates.length} {displayDates.length === 1 ? 'day' : 'days'})
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {isPersonal ? 'Category (Optional)' : 'Client'}
              </label>
              <div className="relative">
                <select
                  value={clientId || ''}
                  onChange={(e) => setClientId(e.target.value || null)}
                  className="w-full px-4 py-3 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium"
                  required={!isPersonal}
                >
                  {isPersonal && <option value="">No Category</option>}
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
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Event Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter event details (address, notes, etc.)..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Event Type
              </label>
              {!showAddEventType && (
                <button
                  type="button"
                  onClick={() => setShowAddEventType(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Custom Type
                </button>
              )}
            </div>

            {showAddEventType && (
              <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-2">
                <input
                  type="text"
                  value={newEventTypeName}
                  onChange={(e) => setNewEventTypeName(e.target.value)}
                  placeholder="Custom type name..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newEventTypeColor}
                    onChange={(e) => setNewEventTypeColor(e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEventType}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEventType(false);
                      setNewEventTypeName('');
                      setNewEventTypeColor('#3B82F6');
                    }}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {allEventTypes.map(type => {
                const customType = customEventTypes.find(t => t.name === type);
                const color = customType
                  ? customType.color
                  : selectedClient
                  ? getEventColor(selectedClient.color, type as any)
                  : '#94a3b8';

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`
                      px-4 py-3 rounded-lg font-medium capitalize transition-all
                      ${eventType === type
                        ? 'ring-2 ring-offset-2 shadow-md'
                        : 'hover:shadow-md opacity-70 hover:opacity-100'
                      }
                    `}
                    style={{
                      backgroundColor: color,
                      color: 'white',
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration / Time
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={useTimeRange}
                  onChange={(e) => setUseTimeRange(e.target.checked)}
                  className="rounded"
                />
                <span className="text-slate-600 dark:text-slate-400">Use specific times</span>
              </label>
            </div>

            {useTimeRange ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value) || defaultHours)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Total hours per day for this event
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
