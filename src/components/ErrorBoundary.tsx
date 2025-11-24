import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const isConfigError = this.state.error?.message.includes('Supabase');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Configuration Error
              </h1>
            </div>

            {isConfigError ? (
              <>
                <p className="text-gray-700 mb-4">
                  The application is missing required environment variables.
                </p>
                <div className="bg-gray-50 rounded p-4 mb-4">
                  <p className="text-sm font-mono text-gray-800 mb-2">
                    Required variables:
                  </p>
                  <ul className="text-sm font-mono text-gray-600 space-y-1">
                    <li>• VITE_SUPABASE_URL</li>
                    <li>• VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Please configure these environment variables in your hosting platform
                  settings and redeploy the application.
                </p>
                <a
                  href="/DEPLOYMENT.md"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View deployment guide →
                </a>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
