import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  color: string;
}

interface BrainstormCard {
  id: string;
  name: string;
  client_id: string | null;
  color: string;
  description: string | null;
}

interface BrainstormCardModalProps {
  clients: Client[];
  editingCard: BrainstormCard | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    clientId: string | null;
    color: string;
    description: string;
  }) => void;
}

export default function BrainstormCardModal({
  clients,
  editingCard,
  onClose,
  onSubmit,
}: BrainstormCardModalProps) {
  const [name, setName] = useState(editingCard?.name || '');
  const [clientId, setClientId] = useState<string | null>(editingCard?.client_id || null);
  const [color, setColor] = useState(editingCard?.color || '#3B82F6');
  const [description, setDescription] = useState(editingCard?.description || '');

  const defaultColors = [
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#EF4444',
    '#6366F1',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      clientId,
      color,
      description: description.trim(),
    });
  };

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

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          {editingCard ? 'Edit Brainstorm Card' : 'Create Brainstorm Card'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Card Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Launch Ideas"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              required
              autoFocus
            />
          </div>

          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Link to Client (Optional)
              </label>
              <select
                value={clientId || ''}
                onChange={(e) => setClientId(e.target.value || null)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">No Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description of this brainstorm session..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Card Color
            </label>
            <div className="grid grid-cols-8 gap-3">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label className="text-sm text-slate-600 dark:text-slate-400">Custom:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
              />
            </div>
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
              {editingCard ? 'Save Changes' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
