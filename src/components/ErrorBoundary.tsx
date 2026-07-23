import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { diagnostics } from '../lib/diagnostics';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    (this as any).setState({ errorInfo });
    diagnostics.error('ErrorBoundary', error.message, {
      componentStack: errorInfo.componentStack,
      stack: error.stack,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/home';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/20 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Application Exception Detected</h2>
              <p className="text-xs text-slate-400">
                An unexpected interface error occurred. PayWorth's security engine safe-guarded your session and balance.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-left overflow-x-auto max-h-32">
                <code className="text-[10px] text-red-300 font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload Engine
              </button>
              <button
                onClick={this.handleGoHome}
                className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-3 px-4 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Return Home
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              ERROR_CODE: RX_SYSTEM_BOUNDARY_RESET
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props?.children;
  }
}
