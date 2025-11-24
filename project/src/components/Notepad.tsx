import { useState, useEffect } from 'react';
import { Plus, FileText, Edit2, Trash2, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NotepadModal from './NotepadModal';
import NotepadEditor from './NotepadEditor';

interface Client {
  id: string;
  name: string;
  color: string;
}

interface NotepadPage {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
  clients?: Client;
}

interface GroupedPages {
  [key: string]: NotepadPage[];
}

export default function Notepad() {
  const { user } = useAuth();
  const [pages, setPages] = useState<NotepadPage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<NotepadPage | null>(null);
  const [selectedPage, setSelectedPage] = useState<NotepadPage | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchPages();
      fetchClients();
    }
  }, [user]);

  async function fetchPages() {
    if (!user) return;

    const { data, error } = await supabase
      .from('notepad_pages')
      .select('*, clients(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notepad pages:', error);
    } else if (data) {
      setPages(data as NotepadPage[]);

      const clientIds = new Set<string>();
      (data as NotepadPage[]).forEach(page => {
        if (page.client_id) {
          clientIds.add(page.client_id);
        }
      });
      setExpandedFolders(clientIds);
    }
  }

  async function fetchClients() {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('id, name, color')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
    } else if (data) {
      setClients(data);
    }
  }

  const handleCreatePage = () => {
    setEditingPage(null);
    setIsModalOpen(true);
  };

  const handleEditPage = (page: NotepadPage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Delete this page? This cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('notepad_pages')
      .delete()
      .eq('id', pageId);

    if (error) {
      console.error('Error deleting page:', error);
    } else {
      await fetchPages();
    }
  };

  const handlePageSubmit = async (pageData: {
    title: string;
    clientId: string | null;
    color: string;
  }) => {
    if (!user) return;

    if (editingPage) {
      const { error } = await supabase
        .from('notepad_pages')
        .update({
          title: pageData.title,
          client_id: pageData.clientId,
          color: pageData.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPage.id);

      if (error) {
        console.error('Error updating page:', error);
      } else {
        await fetchPages();
        setIsModalOpen(false);
        setEditingPage(null);
      }
    } else {
      const { error } = await supabase
        .from('notepad_pages')
        .insert({
          user_id: user.id,
          title: pageData.title,
          client_id: pageData.clientId,
          color: pageData.color,
          content: '',
        });

      if (error) {
        console.error('Error creating page:', error);
      } else {
        await fetchPages();
        setIsModalOpen(false);
      }
    }
  };

  const handlePageClick = (page: NotepadPage) => {
    setSelectedPage(page);
  };

  const handleBackToPages = async () => {
    setSelectedPage(null);
    await fetchPages();
  };

  const toggleFolder = (clientId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedFolders(newExpanded);
  };

  const groupPagesByClient = (): GroupedPages => {
    const grouped: GroupedPages = {
      standalone: [],
    };

    pages.forEach((page) => {
      if (page.client_id) {
        if (!grouped[page.client_id]) {
          grouped[page.client_id] = [];
        }
        grouped[page.client_id].push(page);
      } else {
        grouped.standalone.push(page);
      }
    });

    return grouped;
  };

  if (selectedPage) {
    return (
      <NotepadEditor
        page={selectedPage}
        onBack={handleBackToPages}
      />
    );
  }

  const groupedPages = groupPagesByClient();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Notepad</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Create and organize your notes</p>
            </div>
          </div>
          <button
            onClick={handleCreatePage}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-xl hover:shadow-2xl"
          >
            <Plus className="w-5 h-5" />
            New Page
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                No pages yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first notepad page to start taking notes
              </p>
              <button
                onClick={handleCreatePage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create First Page
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPages).map(([key, groupPages]) => {
              if (groupPages.length === 0) return null;

              if (key === 'standalone') {
                return (
                  <div key="standalone" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupPages.map((page) => (
                      <div
                        key={page.id}
                        onClick={() => handlePageClick(page)}
                        className="group glass-card dark:glass-card-dark rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-400"
                        style={{ borderTopColor: page.color, borderTopWidth: '4px' }}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 min-w-0 pr-2">
                              {page.title}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleEditPage(page, e)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                aria-label="Edit page"
                              >
                                <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </button>
                              <button
                                onClick={(e) => handleDeletePage(page.id, e)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                aria-label="Delete page"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>

                          {page.content && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
                              {page.content}
                            </p>
                          )}

                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            Updated {new Date(page.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              const client = groupPages[0].clients;
              if (!client) return null;

              const isExpanded = expandedFolders.has(key);

              return (
                <div key={key} className="glass-card dark:glass-card-dark rounded-2xl shadow-xl p-6">
                  <button
                    onClick={() => toggleFolder(key)}
                    className="w-full flex items-center gap-3 mb-4 hover:bg-slate-100 dark:hover:bg-slate-700 p-3 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                    <Folder className="w-5 h-5" style={{ color: client.color }} />
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {client.name}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      ({groupPages.length} {groupPages.length === 1 ? 'page' : 'pages'})
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupPages.map((page) => (
                        <div
                          key={page.id}
                          onClick={() => handlePageClick(page)}
                          className="group bg-white/50 dark:bg-slate-800/50 rounded-xl shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                          style={{ borderTopColor: page.color, borderTopWidth: '4px' }}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex-1 min-w-0 pr-2">
                                {page.title}
                              </h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleEditPage(page, e)}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  aria-label="Edit page"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button
                                  onClick={(e) => handleDeletePage(page.id, e)}
                                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  aria-label="Delete page"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </button>
                              </div>
                            </div>

                            {page.content && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                {page.content}
                              </p>
                            )}

                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {new Date(page.updated_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <NotepadModal
          page={editingPage}
          clients={clients}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPage(null);
          }}
          onSubmit={handlePageSubmit}
        />
      )}
    </div>
  );
}
