import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { TaskWithClient } from '../lib/types';

interface TaskCardProps {
  task: TaskWithClient;
  onDragStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onDragStart, onEdit, onDelete }: TaskCardProps) {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return '#EF4444';
      case 'med':
        return '#F59E0B';
      case 'low':
        return '#FCD34D';
    }
  };

  const formatDueDate = () => {
    const date = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = () => {
    const date = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today && task.status !== 'done';
  };

  const isDone = task.status === 'done';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`group border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-move ${
        isDone
          ? 'bg-slate-100 border-slate-300 opacity-60'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: isDone ? '#94a3b8' : (task.clients?.color || '#94a3b8'),
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={`font-semibold flex-1 leading-snug ${
          isDone ? 'text-slate-500 line-through' : 'text-slate-800'
        }`}>
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className={`text-sm mb-3 line-clamp-2 ${
          isDone ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {task.clients && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                isDone ? 'opacity-50' : ''
              }`}
              style={{
                backgroundColor: (isDone ? '#94a3b8' : task.clients.color) + '20',
                color: isDone ? '#64748b' : task.clients.color,
              }}
            >
              {task.clients.name}
            </span>
          )}

          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: isDone ? '#94a3b8' : getPriorityColor() }}
            title={`${task.priority} priority`}
          />
        </div>

        <div className={`flex items-center gap-1 text-xs ${
          isDone ? 'text-slate-400' : (isOverdue() ? 'text-red-600 font-semibold' : 'text-slate-600')
        }`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDueDate()}</span>
        </div>
      </div>
    </div>
  );
}
