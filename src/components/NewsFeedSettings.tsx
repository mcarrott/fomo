import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NewsFeedPreferences {
  id: string;
  user_id: string;
  keywords: string[];
  enabled: boolean;
}

interface NewsFeedSettingsProps {
  onClose: () => void;
}

export default function NewsFeedSettings({ onClose }: NewsFeedSettingsProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NewsFeedPreferences | null>(null);
  const [keywords, setKeywords] = useState<string[]>(['technology', 'animation']);
  const [newKeyword, setNewKeyword] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  async function fetchPreferences() {
    if (!user) return;

    const { data, error } = await supabase
      .from('news_feed_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching preferences:', error);
    } else if (data) {
      setPreferences(data);
      setKeywords(data.keywords || ['technology', 'animation']);
      setEnabled(data.enabled);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;

    setSaving(true);

    const cleanedKeywords = keywords.filter(k => k.trim().length > 0);

    if (preferences) {
      const { error } = await supabase
        .from('news_feed_preferences')
        .update({
          keywords: cleanedKeywords,
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', preferences.id);

      if (error) {
        console.error('Error updating preferences:', error);
        alert('Failed to save preferences');
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase
        .from('news_feed_preferences')
        .insert({
          user_id: user.id,
          keywords: cleanedKeywords,
          enabled,
        });

      if (error) {
        console.error('Error creating preferences:', error);
        alert('Failed to save preferences');
      } else {
        onClose();
      }
    }

    setSaving(false);
  }

  function handleAddKeyword() {
    const trimmed = newKeyword.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setNewKeyword('');
    }
  }

  function handleRemoveKeyword(keyword: string) {
    setKeywords(keywords.filter(k => k !== keyword));
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center text-slate-600 dark:text-slate-400">
            Loading preferences...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            News Feed Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enable news feed
              </span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
              Show personalized news articles on your dashboard
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Keywords & Topics
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Articles matching these keywords will appear in your feed
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add keyword (e.g., AI, 3D animation)"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <div
                  key={keyword}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {keywords.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                Add at least one keyword to see articles
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Articles are fetched from NewsAPI. You'll need to add your API key in Settings to enable the news feed.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
