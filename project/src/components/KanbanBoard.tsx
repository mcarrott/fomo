import { useState, useEffect } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import { supabase, Client } from '../lib/supabase';
import { Task, TaskWithClient, ViewMode, SortBy } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import TaskFilters from './TaskFilters';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithClient | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [draggedTask, setDraggedTask] = useState<TaskWithClient | null>(null);
  const [selectedWeekDay, setSelectedWeekDay] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchTasks();
    }
  }, [user]);

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

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, clients(*)')
      .order('position');

    if (error) {
      console.error('Error fetching tasks:', error);
    } else if (data) {
      setTasks(data as TaskWithClient[]);
    }
  }

  const handleCreateTask = async (taskData: {
    clientId: string | null;
    title: string;
    description: string;
    priority: 'low' | 'med' | 'high';
    dueDate: string;
  }) => {
    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update({
          client_id: taskData.clientId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTask.id);

      if (error) {
        console.error('Error updating task:', error);
      } else {
        await fetchTasks();
        setIsModalOpen(false);
        setEditingTask(null);
      }
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert({
          client_id: taskData.clientId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          status: 'todo',
          position: tasks.filter(t => t.status === 'todo').length,
          user_id: user?.id,
        });

      if (error) {
        console.error('Error creating task:', error);
      } else {
        await fetchTasks();
        setIsModalOpen(false);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      await fetchTasks();
    }
  };

  const handleEditTask = (task: TaskWithClient) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDragStart = (task: TaskWithClient) => {
    setDraggedTask(task);
  };

  const handleDrop = async (newStatus: 'todo' | 'in_progress' | 'done', newDueDate?: string) => {
    if (!draggedTask) return;

    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newDueDate) {
      updates.due_date = newDueDate;
    }

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', draggedTask.id);

    if (error) {
      console.error('Error updating task status:', error);
    } else {
      await fetchTasks();
    }

    setDraggedTask(null);
  };

  const handleClearAllDone = async () => {
    const doneTaskIds = doneTasks.map(t => t.id);
    if (doneTaskIds.length === 0) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', doneTaskIds);

    if (error) {
      console.error('Error clearing done tasks:', error);
    } else {
      await fetchTasks();
    }
  };

  const getFilteredTasks = (specificDate?: string) => {
    let filtered = [...tasks];

    if (specificDate) {
      filtered = filtered.filter(task => task.due_date === specificDate);
    } else if (viewMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(task => task.due_date === today);
    } else if (viewMode === 'week') {
      const today = new Date();
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);

      filtered = filtered.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= today && taskDate <= weekFromNow;
      });
    }

    if (selectedClient !== 'all') {
      filtered = filtered.filter(task => task.client_id === selectedClient);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, med: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'due_date') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === 'client') {
        const aName = a.clients?.name || 'zzz';
        const bName = b.clients?.name || 'zzz';
        return aName.localeCompare(bName);
      }
      return 0;
    });

    return filtered;
  };

  const displayDate = selectedWeekDay || (viewMode === 'today' ? new Date().toISOString().split('T')[0] : null);
  const filteredTasks = getFilteredTasks(displayDate || undefined);
  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const getWeekDays = () => {
    const today = new Date();
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Task Board</h1>
              <p className="text-slate-600 dark:text-slate-300">Organize and track your tasks</p>
            </div>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('today')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      viewMode === 'today'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      viewMode === 'week'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>

              <TaskFilters
                clients={clients}
                selectedClient={selectedClient}
                selectedPriority={selectedPriority}
                sortBy={sortBy}
                onClientChange={setSelectedClient}
                onPriorityChange={setSelectedPriority}
                onSortChange={setSortBy}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KanbanColumn
              title="To Do"
              status="todo"
              tasks={todoTasks}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
            <KanbanColumn
              title="In Progress"
              status="in_progress"
              tasks={inProgressTasks}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
            <KanbanColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onClearAll={handleClearAllDone}
            />
          </div>

          {viewMode === 'week' && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Week Overview</h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {weekDays.map((day, index) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = dateStr === selectedWeekDay;
                  const dayTasks = tasks.filter(t => t.due_date === dateStr);
                  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-xl shadow-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : isToday
                          ? 'border-blue-300'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedWeekDay(isSelected ? null : dateStr)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedTask) {
                          handleDrop(draggedTask.status, dateStr);
                        }
                      }}
                    >
                      <div className={`px-3 py-2 rounded-t-xl text-center ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-50 text-slate-700'
                      }`}>
                        <div className="text-xs font-semibold">{dayNames[day.getDay()]}</div>
                        <div className="text-lg font-bold">{day.getDate()}</div>
                      </div>
                      <div className="p-3 min-h-[100px] space-y-1.5">
                        {dayTasks.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No tasks</p>
                        ) : (
                          dayTasks.slice(0, 3).map(task => (
                            <div
                              key={task.id}
                              className={`text-xs p-2 rounded border-l-2 ${
                                task.status === 'done'
                                  ? 'bg-slate-50 text-slate-500 opacity-60'
                                  : 'bg-white border-slate-200'
                              }`}
                              style={{
                                borderLeftColor: task.clients?.color || '#94a3b8',
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      task.priority === 'high'
                                        ? '#EF4444'
                                        : task.priority === 'med'
                                        ? '#F59E0B'
                                        : '#FCD34D',
                                  }}
                                />
                                <span className={`truncate ${
                                  task.status === 'done' ? 'line-through' : ''
                                }`}>
                                  {task.title}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        {dayTasks.length > 3 && (
                          <p className="text-xs text-slate-500 text-center pt-1">
                            +{dayTasks.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          clients={clients}
          editingTask={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
