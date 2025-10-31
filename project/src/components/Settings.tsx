import { useState, useEffect } from 'react';
import { Save, User, MessageSquare, Newspaper, Type, Lock, AlertTriangle, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserSettings {
  id: string;
  user_name: string;
  welcome_message: string;
  news_category: string;
  font_family: string;
  theme: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1)
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
    if (!settings) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from('user_settings')
      .update({
        user_name: userName.trim() || 'there',
        welcome_message: welcomeMessage.trim() || 'Welcome back!',
        news_category: newsCategory,
        font_family: fontFamily,
        theme: theme,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (error) {
      console.error('Error updating settings:', error);
      alert('Failed to save settings. Please try again.');
    } else {
      setSaveSuccess(true);
      await fetchSettings();

      document.body.className = getFontClass(fontFamily);
      applyTheme(theme);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400">Customize your dashboard experience</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-8">
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
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="mt-6 bg-white rounded-2xl shadow-xl p-8 space-y-8">
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
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
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
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
