import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Check, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserSettings {
  id: string;
  user_name: string;
  welcome_message: string;
  news_category: string;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  notes: string | null;
  is_completed: boolean;
}

interface PostItNote {
  id: string;
  content: string;
  color: string;
  position: number;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function Home() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [postItNotes, setPostItNotes] = useState<PostItNote[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderNotes, setNewReminderNotes] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchReminders();
      fetchPostItNotes();
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      fetchNews(settings.news_category);
    }
  }, [settings]);

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings(data);
    }
  }

  async function fetchReminders() {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
    } else if (data) {
      setReminders(data);
    }
  }

  async function fetchPostItNotes() {
    const { data, error } = await supabase
      .from('post_it_notes')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching post-it notes:', error);
    } else if (data) {
      setPostItNotes(data);
    }
  }

  async function fetchNews(category: string) {
    const mockNews: NewsArticle[] = [
      {
        title: `Latest in ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: 'Stay updated with the latest news and developments in your selected category.',
        url: '#',
        source: 'News Source',
        publishedAt: new Date().toISOString(),
      },
      {
        title: 'Breaking News Update',
        description: 'Important updates and stories that matter to you.',
        url: '#',
        source: 'Daily News',
        publishedAt: new Date().toISOString(),
      },
      {
        title: 'Industry Insights',
        description: 'Expert analysis and commentary on current events.',
        url: '#',
        source: 'Industry Times',
        publishedAt: new Date().toISOString(),
      },
    ];
    setNewsArticles(mockNews);
  }

  const handleAddReminder = async () => {
    if (!newReminderTitle.trim() || !newReminderDate) return;

    const { error } = await supabase
      .from('reminders')
      .insert({
        title: newReminderTitle.trim(),
        date: newReminderDate,
        notes: newReminderNotes.trim() || null,
        user_id: user?.id,
      });

    if (error) {
      console.error('Error adding reminder:', error);
    } else {
      setNewReminderTitle('');
      setNewReminderDate('');
      setNewReminderNotes('');
      setIsAddingReminder(false);
      await fetchReminders();
    }
  };

  const handleToggleReminder = async (id: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: !isCompleted, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating reminder:', error);
    } else {
      await fetchReminders();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reminder:', error);
    } else {
      await fetchReminders();
    }
  };

  const handleUpdatePostIt = async (id: string, content: string) => {
    const { error } = await supabase
      .from('post_it_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating post-it note:', error);
    } else {
      await fetchPostItNotes();
      setEditingNoteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) return 'Today';
    if (dateOnly.getTime() === tomorrowOnly.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {getTimeOfDay()}, {settings?.user_name || 'there'}!
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">{settings?.welcome_message || 'Welcome back!'}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reminders</h2>
              </div>
              <button
                onClick={() => setIsAddingReminder(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Reminder
              </button>
            </div>

            {isAddingReminder && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <input
                  type="text"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="Reminder title..."
                  className="w-full px-4 py-2 mb-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100"
                  autoFocus
                />
                <input
                  type="date"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="w-full px-4 py-2 mb-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100"
                />
                <textarea
                  value={newReminderNotes}
                  onChange={(e) => setNewReminderNotes(e.target.value)}
                  placeholder="Notes (optional)..."
                  rows={2}
                  className="w-full px-4 py-2 mb-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddReminder}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingReminder(false);
                      setNewReminderTitle('');
                      setNewReminderDate('');
                      setNewReminderNotes('');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {reminders.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-2">No reminders yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Add your first reminder to stay organized</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                      reminder.is_completed
                        ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 opacity-60'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleReminder(reminder.id, reminder.is_completed)}
                      className="flex-shrink-0 mt-1"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          reminder.is_completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {reminder.is_completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-slate-800 dark:text-slate-100 mb-1 ${
                          reminder.is_completed ? 'line-through' : ''
                        }`}
                      >
                        {reminder.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{formatDate(reminder.date)}</p>
                      {reminder.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{reminder.notes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="flex-shrink-0 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {postItNotes.map((note) => (
              <div
                key={note.id}
                className="relative group"
                style={{
                  background: note.color,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="p-6 min-h-[250px] rounded-lg">
                  {editingNoteId === note.id ? (
                    <div className="h-full flex flex-col">
                      <textarea
                        defaultValue={note.content}
                        onBlur={(e) => handleUpdatePostIt(note.id, e.target.value)}
                        autoFocus
                        className="w-full h-full p-2 bg-transparent border-2 border-slate-300 rounded resize-none focus:outline-none focus:border-slate-500 font-handwriting text-slate-700"
                        placeholder="Write a note..."
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingNoteId(note.id)}
                      className="cursor-text h-full"
                    >
                      {note.content ? (
                        <p className="whitespace-pre-wrap font-handwriting text-slate-700">
                          {note.content}
                        </p>
                      ) : (
                        <p className="text-slate-400 font-handwriting">Click to add a note...</p>
                      )}
                    </div>
                  )}
                </div>
                {!editingNoteId && (
                  <button
                    onClick={() => setEditingNoteId(note.id)}
                    className="absolute top-2 right-2 p-2 bg-white/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/80"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">News Feed</h2>

            {newsArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Loading news...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {newsArticles.map((article, index) => (
                  <div
                    key={index}
                    className="p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex-1">
                        {article.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-4">{article.source}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-3">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Read more →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
