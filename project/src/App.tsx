import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Home from './components/Home';
import Calendar from './components/Calendar';
import KanbanBoard from './components/KanbanBoard';
import TimeSheet from './components/TimeSheet';
import ClientManagement from './components/ClientManagement';
import Documents from './components/Documents';
import Finances from './components/Finances';
import Settings from './components/Settings';
import Navigation from './components/Navigation';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'calendar' | 'tasks' | 'timesheet' | 'clients' | 'documents' | 'finances' | 'settings'>('home');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto lg:ml-64">
        {currentView === 'home' && <Home />}
        {currentView === 'calendar' && <Calendar />}
        {currentView === 'tasks' && <KanbanBoard />}
        {currentView === 'timesheet' && <TimeSheet />}
        {currentView === 'clients' && <ClientManagement />}
        {currentView === 'documents' && <Documents />}
        {currentView === 'finances' && <Finances />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}
