import { Trash2 } from 'lucide-react';
import { TaskWithClient } from '../lib/types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  tasks: TaskWithClient[];
  onDrop: (status: 'todo' | 'in_progress' | 'done') => void;
  onDragStart: (task: TaskWithClient) => void;
  onEdit: (task: TaskWithClient) => void;
  onDelete: (taskId: string) => void;
  onClearAll?: () => void;
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  onDrop,
  onDragStart,
  onEdit,
  onDelete,
  onClearAll,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(status);
  };

  const getColumnColor = () => {
    switch (status) {
      case 'todo':
        return 'border-slate-300';
      case 'in_progress':
        return 'border-blue-300';
      case 'done':
        return 'border-green-300';
    }
  };

  const getHeaderColor = () => {
    switch (status) {
      case 'todo':
        return 'bg-slate-50 text-slate-700';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700';
      case 'done':
        return 'bg-green-50 text-green-700';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 ${getColumnColor()} flex flex-col`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`px-4 py-3 rounded-t-xl ${getHeaderColor()}`}>
        <h2 className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{title}</span>
            <span className="text-sm font-semibold bg-white/50 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          {status === 'done' && tasks.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/70 hover:bg-white text-green-700 rounded-lg text-xs font-medium transition-colors"
              title="Clear all completed tasks"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </h2>
      </div>

      <div className="flex-1 p-4 space-y-3 min-h-[400px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-sm">No tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={() => onDragStart(task)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
