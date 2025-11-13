import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface NotepadModalProps {
  page: {
    id: string;
    title: string;
    client_id: string | null;
    color: string;
  } | null;
  clients: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    clientId: string | null;
    color: string;
  }) => void;
}

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

export default function NotepadModal({ page, clients, onClose, onSubmit }: NotepadModalProps) {
  const [title, setTitle] = useState(page?.title || '');
  const [clientId, setClientId] = useState<string | null>(page?.client_id || null);
  const [color, setColor] = useState(page?.color || DEFAULT_COLORS[0]);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setClientId(page.client_id);
      setColor(page.color);
    }
  }, [page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a page title');
      return;
    }

    onSubmit({
      title: title.trim(),
      clientId: clientId || null,
      color,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {page ? 'Edit Page' : 'New Page'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Page Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title..."
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Client (Optional)
            </label>
            <select
              id="client"
              value={clientId || ''}
              onChange={(e) => setClientId(e.target.value || null)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100"
            >
              <option value="">No client (Standalone page)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Pages with the same client will be grouped together in a folder
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Page Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {page ? 'Save Changes' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
