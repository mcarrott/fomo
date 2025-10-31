import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Mail, Phone, DollarSign, User } from 'lucide-react';
import { supabase, Client } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ClientModal from './ClientModal';

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
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

  const handleCreateClient = async (clientData: {
    name: string;
    color: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    hourlyRate?: number;
  }) => {
    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          color: clientData.color,
          contact_person: clientData.contactPerson || null,
          email: clientData.email || null,
          phone: clientData.phone || null,
          hourly_rate: clientData.hourlyRate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingClient.id);

      if (error) {
        console.error('Error updating client:', error);
      } else {
        await fetchClients();
        setIsModalOpen(false);
        setEditingClient(null);
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          color: clientData.color,
          contact_person: clientData.contactPerson || null,
          email: clientData.email || null,
          phone: clientData.phone || null,
          hourly_rate: clientData.hourlyRate || null,
          user_id: user?.id,
        });

      if (error) {
        console.error('Error creating client:', error);
      } else {
        await fetchClients();
        setIsModalOpen(false);
      }
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This will not delete associated tasks or time entries.')) {
      return;
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting client:', error);
    } else {
      await fetchClients();
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.contact_person && client.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Client Management</h1>
              <p className="text-slate-600 dark:text-slate-300">Manage your clients and their billing information</p>
            </div>

            <button
              onClick={() => {
                setEditingClient(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              New Client
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">
                  {searchTerm ? 'No clients found' : 'No clients yet'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-slate-400">Create your first client to get started</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    className="group bg-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-slate-300"
                    style={{
                      borderLeftWidth: '6px',
                      borderLeftColor: client.color,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: client.color }}
                        />
                        <h3 className="font-bold text-lg text-slate-800 truncate">
                          {client.name}
                        </h3>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-2 hover:bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors"
                          aria-label="Edit client"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete client"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {client.contact_person && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{client.contact_person}</span>
                        </div>
                      )}

                      {client.email && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}

                      {client.phone && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      )}

                      {client.hourly_rate && (
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span>${parseFloat(client.hourly_rate.toString()).toFixed(2)}/hr</span>
                        </div>
                      )}

                      {!client.contact_person && !client.email && !client.phone && !client.hourly_rate && (
                        <p className="text-slate-400 italic text-xs">No additional details</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Total Clients</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Active clients in your workspace</p>
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {clients.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ClientModal
          editingClient={editingClient}
          onClose={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
          onSubmit={handleCreateClient}
        />
      )}
    </div>
  );
}
