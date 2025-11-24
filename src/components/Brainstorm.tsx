import { useState, useEffect } from 'react';
import { Plus, Lightbulb, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import BrainstormCardModal from './BrainstormCardModal';
import MindMapCanvas from './MindMapCanvas';

interface Client {
  id: string;
  name: string;
  color: string;
}

interface BrainstormCard {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  clients?: Client;
}

export default function Brainstorm() {
  const { user } = useAuth();
  const [cards, setCards] = useState<BrainstormCard[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<BrainstormCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<BrainstormCard | null>(null);

  useEffect(() => {
    if (user) {
      fetchCards();
      fetchClients();
    }
  }, [user]);

  async function fetchCards() {
    if (!user) return;

    const { data, error } = await supabase
      .from('brainstorm_cards')
      .select('*, clients(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching brainstorm cards:', error);
    } else if (data) {
      setCards(data as BrainstormCard[]);
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

  const handleCreateCard = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: BrainstormCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Delete this brainstorm card and all its ideas? This cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('brainstorm_cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('Error deleting card:', error);
    } else {
      await fetchCards();
    }
  };

  const handleCardSubmit = async (cardData: {
    name: string;
    clientId: string | null;
    color: string;
    description: string;
  }) => {
    if (!user) return;

    if (editingCard) {
      const { error } = await supabase
        .from('brainstorm_cards')
        .update({
          name: cardData.name,
          client_id: cardData.clientId,
          color: cardData.color,
          description: cardData.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCard.id);

      if (error) {
        console.error('Error updating card:', error);
      } else {
        await fetchCards();
        setIsModalOpen(false);
        setEditingCard(null);
      }
    } else {
      const { error } = await supabase
        .from('brainstorm_cards')
        .insert({
          user_id: user.id,
          name: cardData.name,
          client_id: cardData.clientId,
          color: cardData.color,
          description: cardData.description || null,
        });

      if (error) {
        console.error('Error creating card:', error);
      } else {
        await fetchCards();
        setIsModalOpen(false);
      }
    }
  };

  const handleCardClick = (card: BrainstormCard) => {
    setSelectedCard(card);
  };

  const handleBackToCards = () => {
    setSelectedCard(null);
    fetchCards();
  };

  if (selectedCard) {
    return (
      <MindMapCanvas
        card={selectedCard}
        onBack={handleBackToCards}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-xl">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Brainstorm</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Create and organize your ideas</p>
            </div>
          </div>
          <button
            onClick={handleCreateCard}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-xl hover:shadow-2xl"
          >
            <Plus className="w-5 h-5" />
            New Card
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                No brainstorm cards yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first brainstorm card to start organizing your ideas with mind maps
              </p>
              <button
                onClick={handleCreateCard}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Card
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="group glass-card dark:glass-card-dark rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-400"
                style={{ borderTopColor: card.color, borderTopWidth: '4px' }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 transition-colors">
                        {card.name}
                      </h3>
                      {card.clients && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: card.clients.color }}
                          />
                          {card.clients.name}
                        </div>
                      )}
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: card.color + '20' }}
                    >
                      <Lightbulb className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                  </div>

                  {card.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {card.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(card.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditCard(card, e)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        aria-label="Edit card"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCard(card.id, e)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete card"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <BrainstormCardModal
          clients={clients}
          editingCard={editingCard}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleCardSubmit}
        />
      )}
    </div>
  );
}
