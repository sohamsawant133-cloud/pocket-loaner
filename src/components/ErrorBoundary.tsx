import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firestore Error: ${parsed.error}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-500 mb-8 text-sm">
              {errorMessage}
            </p>
            {isFirestoreError && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
                <p className="text-amber-800 text-xs font-medium mb-1">Diagnostic Info:</p>
                <p className="text-amber-700 text-[10px] leading-relaxed">
                  This error often occurs due to incorrect Firebase configuration or missing permissions. 
                  Please check your environment variables and Firestore security rules.
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
