import { useState, useEffect } from 'react';
import { Settings, ExternalLink, RefreshCw, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NewsFeedSettings from './NewsFeedSettings';

interface Article {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  source: string;
  published_at: string;
  keywords: string[];
}

export default function NewsFeed() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userKeywords, setUserKeywords] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  useEffect(() => {
    if (user && enabled && userKeywords.length > 0) {
      fetchArticles();
    }
  }, [user, enabled, userKeywords]);

  async function fetchPreferences() {
    if (!user) return;

    const { data, error } = await supabase
      .from('news_feed_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching preferences:', error);
      setUserKeywords(['technology', 'animation']);
      setEnabled(true);
    } else if (data) {
      setUserKeywords(data.keywords || ['technology', 'animation']);
      setEnabled(data.enabled);
    } else {
      setUserKeywords(['technology', 'animation']);
      setEnabled(true);
      await supabase.from('news_feed_preferences').insert({
        user_id: user.id,
        keywords: ['technology', 'animation'],
        enabled: true,
      });
    }
  }

  async function fetchArticles() {
    if (!user || userKeywords.length === 0) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('cached_articles')
      .select('*')
      .overlaps('keywords', userKeywords)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching articles:', error);
    } else if (data) {
      setArticles(data);
    }

    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-news`;
      const headers = {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ keywords: userKeywords }),
      });

      if (response.ok) {
        await fetchArticles();
      } else {
        const error = await response.text();
        console.error('Error refreshing articles:', error);
        alert('Failed to refresh articles. Make sure you have configured your NewsAPI key.');
      }
    } catch (error) {
      console.error('Error calling edge function:', error);
      alert('Failed to refresh articles. Check console for details.');
    }

    setRefreshing(false);
  }

  if (!enabled) {
    return (
      <div className="glass-card dark:glass-card-dark rounded-lg shadow-lg p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              News Feed
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            News feed is disabled
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Enable in settings
          </button>
        </div>

        {showSettings && (
          <NewsFeedSettings
            onClose={() => {
              setShowSettings(false);
              fetchPreferences();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="glass-card dark:glass-card-dark rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            News Feed
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh articles"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {userKeywords.map((keyword) => (
          <span
            key={keyword}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 -mx-6 px-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              No articles found
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
              Click refresh to fetch the latest articles
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Fetching...' : 'Fetch Articles'}
            </button>
          </div>
        ) : (
          articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="flex gap-3">
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-20 h-20 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                  {article.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>
                      {new Date(article.published_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {showSettings && (
        <NewsFeedSettings
          onClose={() => {
            setShowSettings(false);
            fetchPreferences();
          }}
        />
      )}
    </div>
  );
}
