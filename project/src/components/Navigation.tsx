import { useState } from 'react';
import { Home as HomeIcon, Calendar as CalendarIcon, ListTodo, Clock, Users, FileText, Wallet, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: 'home' | 'calendar' | 'tasks' | 'timesheet' | 'clients' | 'documents' | 'finances' | 'settings';
  onViewChange: (view: 'home' | 'calendar' | 'tasks' | 'timesheet' | 'clients' | 'documents' | 'finances' | 'settings') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as const, icon: HomeIcon, label: 'Home' },
    { id: 'calendar' as const, icon: CalendarIcon, label: 'Calendar' },
    { id: 'tasks' as const, icon: ListTodo, label: 'Tasks' },
    { id: 'timesheet' as const, icon: Clock, label: 'Time' },
    { id: 'clients' as const, icon: Users, label: 'Clients' },
    { id: 'documents' as const, icon: FileText, label: 'Documents' },
    { id: 'finances' as const, icon: Wallet, label: 'Finances' },
    { id: 'settings' as const, icon: SettingsIcon, label: 'Settings' },
  ];

  const handleNavClick = (view: typeof currentView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        ) : (
          <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-xl z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <img
              src="/Screenshot 2025-10-31 172052.png"
              alt="FOMO Logo"
              className="w-full h-auto max-w-[180px]"
            />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                        ${currentView === item.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
