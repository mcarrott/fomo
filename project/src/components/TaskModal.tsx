import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client } from '../lib/supabase';
import { TaskWithClient } from '../lib/types';

interface TaskModalProps {
  clients: Client[];
  editingTask: TaskWithClient | null;
  onClose: () => void;
  onSubmit: (data: {
    clientId: string | null;
    title: string;
    description: string;
    priority: 'low' | 'med' | 'high';
    dueDate: string;
  }) => void;
}

export default function TaskModal({ clients, editingTask, onClose, onSubmit }: TaskModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [clientId, setClientId] = useState<string>(editingTask?.client_id || '');
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>(editingTask?.priority || 'med');
  const [dueDate, setDueDate] = useState(editingTask?.due_date || today);

  useEffect(() => {
    if (editingTask) {
      setClientId(editingTask.client_id || '');
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.due_date);
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      clientId: clientId || null,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
    });
  };

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task details..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'med', 'high'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`
                    px-4 py-3 rounded-lg font-medium capitalize transition-all border-2
                    ${priority === p
                      ? 'border-current shadow-md'
                      : 'border-transparent hover:border-slate-200'
                    }
                    ${p === 'high' ? 'bg-red-50 text-red-700 hover:bg-red-100' : ''}
                    ${p === 'med' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : ''}
                    ${p === 'low' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : ''}
                  `}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
