import { useState, useEffect } from 'react';
import { Save, User, MessageSquare, Newspaper, Type, Lock, AlertTriangle, Eye, EyeOff, Moon, Sun, Clock, Palette } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface UserSettings {
  id: string;
  user_name: string;
  welcome_message: string;
  news_category: string;
  font_family: string;
  theme: string;
  default_event_hours: number;
  news_api_key: string | null;
  gradient_color_1: string;
  gradient_color_2: string;
  gradient_angle: number;
}

const NEWS_CATEGORIES = [
  { value: 'general', label: 'General News' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'sports', label: 'Sports' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
];

const FONT_FAMILIES = [
  { value: 'inter', label: 'Inter (Modern)', style: 'font-sans' },
  { value: 'serif', label: 'Serif (Classic)', style: 'font-serif' },
  { value: 'mono', label: 'Monospace (Code)', style: 'font-mono' },
  { value: 'system', label: 'System Default', style: 'font-sans' },
];

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [userName, setUserName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [newsCategory, setNewsCategory] = useState('general');
  const [fontFamily, setFontFamily] = useState('inter');
  const [theme, setTheme] = useState('light');
  const [defaultEventHours, setDefaultEventHours] = useState(8);
  const [newsApiKey, setNewsApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [gradientColor1, setGradientColor1] = useState('#f5f5f4');
  const [gradientColor2, setGradientColor2] = useState('#fafaf9');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { setGradient } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  async function fetchSettings() {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings(data);
      setUserName(data.user_name);
      setWelcomeMessage(data.welcome_message);
      setNewsCategory(data.news_category);
      setFontFamily(data.font_family || 'inter');
      setTheme(data.theme || 'light');
      setDefaultEventHours(data.default_event_hours || 8);
      setNewsApiKey(data.news_api_key || '');
      setGradientColor1(data.gradient_color_1 || '#f5f5f4');
      setGradientColor2(data.gradient_color_2 || '#fafaf9');
      setGradientAngle(data.gradient_angle ?? 135);
      applyTheme(data.theme || 'light');
    } else {
      await createDefaultSettings();
    }
  }

  async function createDefaultSettings() {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        user_name: 'there',
        welcome_message: 'Welcome back!',
        news_category: 'general',
        font_family: 'inter',
        theme: 'light',
        default_event_hours: 8,
        gradient_color_1: '#f5f5f4',
        gradient_color_2: '#fafaf9',
        gradient_angle: 135,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
    } else if (data) {
      setSettings(data);
      setUserName(data.user_name);
      setWelcomeMessage(data.welcome_message);
      setNewsCategory(data.news_category);
      setFontFamily(data.font_family || 'inter');
      setTheme(data.theme || 'light');
      setDefaultEventHours(data.default_event_hours || 8);
      setNewsApiKey(data.news_api_key || '');
      setGradientColor1(data.gradient_color_1 || '#f5f5f4');
      setGradientColor2(data.gradient_color_2 || '#fafaf9');
      setGradientAngle(data.gradient_angle ?? 135);
      applyTheme(data.theme || 'light');
    }
  }

  const applyTheme = (selectedTheme: string) => {
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const updateData = {
      user_name: userName.trim() || 'there',
      default_event_hours: defaultEventHours,
      welcome_message: welcomeMessage.trim() || 'Welcome back!',
      news_category: newsCategory,
      font_family: fontFamily,
      theme: theme,
      news_api_key: newsApiKey.trim() || null,
      gradient_color_1: gradientColor1,
      gradient_color_2: gradientColor2,
      gradient_angle: gradientAngle,
      updated_at: new Date().toISOString(),
    };

    const { error } = settings
      ? await supabase
          .from('user_settings')
          .update(updateData)
          .eq('id', settings.id)
      : await supabase
          .from('user_settings')
          .insert({ ...updateData, user_id: user.id })
          .select()
          .single();

    if (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } else {
      setSaveSuccess(true);
      await fetchSettings();

      document.body.className = getFontClass(fontFamily);
      applyTheme(theme);
      setGradient(gradientColor1, gradientColor2, gradientAngle);

      setTimeout(() => setSaveSuccess(false), 3000);
    }

    setIsSaving(false);
  };

  const getFontClass = (font: string) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'system':
        return 'font-sans';
      default:
        return 'font-sans';
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setIsChangingPassword(true);

    alert('Password changed successfully! (Note: This is a demo - no actual authentication is configured)');
    setPasswordChangeSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordChangeSuccess(false), 3000);

    setIsChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.');
      return;
    }

    const confirmed = confirm(
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.'
    );

    if (!confirmed) {
      return;
    }

    alert('Account deletion initiated. (Note: This is a demo - actual deletion would require authentication)');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400">Customize your dashboard experience</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Personal Information</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">How should we address you?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., John, Sarah, Alex..."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  This name will appear in your personalized greeting
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome Message</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customize your daily greeting</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom Message
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="e.g., Welcome back! Ready to be productive?"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  This message will be displayed on your home dashboard
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Newspaper className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">News Preferences</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose what type of news to see</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    News Category
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {NEWS_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Your news feed will show articles from this category
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    NewsAPI Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={newsApiKey}
                      onChange={(e) => setNewsApiKey(e.target.value)}
                      placeholder="Enter your NewsAPI key"
                      className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Get your free API key at{' '}
                    <a
                      href="https://newsapi.org/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      newsapi.org/register
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Calendar Settings</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Configure calendar event defaults</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Default Event Duration (hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={defaultEventHours}
                  onChange={(e) => setDefaultEventHours(parseFloat(e.target.value) || 8)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  New calendar events will default to this duration (can be edited per event)
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Type className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Appearance</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customize how text appears</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Theme
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span className="font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span className="font-medium">Dark</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Choose between light and dark theme
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Changes the font used throughout the application
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Palette className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Background Gradient</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Customize your background colors</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      First Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="w-16 h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        placeholder="#f5f5f4"
                        className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Second Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="w-16 h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        placeholder="#fafaf9"
                        className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Gradient Angle: {gradientAngle}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>0° (→)</span>
                    <span>90° (↑)</span>
                    <span>180° (←)</span>
                    <span>270° (↓)</span>
                    <span>360° (→)</span>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 border-2 border-slate-300 dark:border-slate-600">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Preview</p>
                  <div
                    className="w-full h-24 rounded-lg shadow-inner"
                    style={{
                      background: `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`
                    }}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Choose subtle, light colors for best readability. The gradient will be visible across your entire dashboard background.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="text-green-600 font-medium flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Settings saved successfully!
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-2">Preview</h3>
            <p className="text-blue-800 mb-4">
              Your home page will greet you with:
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-2xl font-bold text-slate-800 mb-1">
                Good morning, {userName || 'there'}!
              </p>
              <p className="text-lg text-slate-600">
                {welcomeMessage || 'Welcome back!'}
              </p>
              <p className="text-sm text-slate-500 mt-3">
                News feed will show: <span className="font-medium">
                  {NEWS_CATEGORIES.find(c => c.value === newsCategory)?.label}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-2xl p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Security</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Manage your password and account security</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    {passwordChangeSuccess && (
                      <span className="text-green-600 font-medium flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Password changed successfully!
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-5 h-5" />
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Danger Zone</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Irreversible and destructive actions</p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <h3 className="font-bold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-red-800 mb-4">
                    Once you delete your account, there is no going back. This action will permanently delete all your data.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Delete My Account
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <h3 className="font-bold text-red-900 mb-2">Confirm Account Deletion</h3>
                  <p className="text-red-800 mb-4">
                    This action cannot be undone. Type <span className="font-mono font-bold">DELETE</span> to confirm.
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-4 py-3 mb-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Permanently Delete Account
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
