import * as React from 'react';
import { AlertCircle, RefreshCcw, Home as HomeIcon } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-100 border border-gray-100 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900">Something went wrong</h1>
              <p className="text-gray-500 font-medium">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                <p className="text-xs font-mono text-gray-600 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-900 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
