import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client, EventWithClient } from '../lib/supabase';
import { getEventColor } from '../utils/colorUtils';
import { parseDate, getDateRange } from '../utils/dateUtils';

interface EventModalProps {
  clients: Client[];
  selectedDates: Date[];
  editingEvent: EventWithClient | null;
  onClose: () => void;
  onSubmit: (data: { clientId: string; title: string; eventType: 'hold' | 'book' | 'paid' }) => void;
}

export default function EventModal({ clients, selectedDates, editingEvent, onClose, onSubmit }: EventModalProps) {
  const [clientId, setClientId] = useState(editingEvent?.client_id || clients[0]?.id || '');
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [eventType, setEventType] = useState<'hold' | 'book' | 'paid'>(editingEvent?.event_type || 'book');

  useEffect(() => {
    if (editingEvent) {
      setClientId(editingEvent.client_id);
      setTitle(editingEvent.title);
      setEventType(editingEvent.event_type);
    }
  }, [editingEvent]);

  const displayDates = editingEvent
    ? getDateRange(parseDate(editingEvent.start_date), parseDate(editingEvent.end_date))
    : selectedDates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    onSubmit({ clientId, title, eventType });
  };

  const selectedClient = clients.find(c => c.id === clientId);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
        <p className="text-sm text-slate-600 mb-6">
          {formatDateRange()} ({displayDates.length} {displayDates.length === 1 ? 'day' : 'days'})
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client
            </label>
            <div className="relative">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-slate-800 font-medium"
                required
              >
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Event Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['hold', 'book', 'paid'] as const).map(type => (
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
                    backgroundColor: selectedClient
                      ? getEventColor(selectedClient.color, type)
                      : '#94a3b8',
                    color: 'white',
                    ringColor: selectedClient?.color,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
