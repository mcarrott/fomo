import { Home as HomeIcon, Calendar as CalendarIcon, ListTodo, Clock, Users, FileText, Wallet, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: 'home' | 'calendar' | 'tasks' | 'timesheet' | 'clients' | 'documents' | 'finances' | 'settings';
  onViewChange: (view: 'home' | 'calendar' | 'tasks' | 'timesheet' | 'clients' | 'documents' | 'finances' | 'settings') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { signOut } = useAuth();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 flex gap-1">
        <button
          onClick={() => onViewChange('home')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'home'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <HomeIcon className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => onViewChange('calendar')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'calendar'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <CalendarIcon className="w-5 h-5" />
          Calendar
        </button>
        <button
          onClick={() => onViewChange('tasks')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'tasks'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <ListTodo className="w-5 h-5" />
          Tasks
        </button>
        <button
          onClick={() => onViewChange('timesheet')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'timesheet'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <Clock className="w-5 h-5" />
          Time
        </button>
        <button
          onClick={() => onViewChange('clients')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'clients'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <Users className="w-5 h-5" />
          Clients
        </button>
        <button
          onClick={() => onViewChange('documents')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'documents'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <FileText className="w-5 h-5" />
          Docs
        </button>
        <button
          onClick={() => onViewChange('finances')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'finances'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <Wallet className="w-5 h-5" />
          Finances
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentView === 'settings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }
          `}
        >
          <SettingsIcon className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
