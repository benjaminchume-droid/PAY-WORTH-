// PayWorth Enterprise Diagnostics & Logging Engine

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface DiagnosticEvent {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, any>;
}

class DiagnosticsManager {
  private logs: DiagnosticEvent[] = [];
  private maxLogs = 200;
  private isDev = Boolean((import.meta as any).env?.DEV);

  public log(level: LogLevel, category: string, message: string, details?: Record<string, any>) {
    const event: DiagnosticEvent = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
    };

    this.logs.unshift(event);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (this.isDev) {
      const color =
        level === 'error' ? 'color: #ef4444; font-weight: bold' :
        level === 'warn' ? 'color: #f59e0b; font-weight: bold' :
        level === 'info' ? 'color: #10b981; font-weight: bold' :
        'color: #6b7280';

      console.log(`%c[${event.category}] ${event.message}`, color, details || '');
    }
  }

  public info(category: string, message: string, details?: Record<string, any>) {
    this.log('info', category, message, details);
  }

  public warn(category: string, message: string, details?: Record<string, any>) {
    this.log('warn', category, message, details);
  }

  public error(category: string, message: string, details?: Record<string, any>) {
    this.log('error', category, message, details);
  }

  public trackPerformance(label: string) {
    const start = performance.now();
    return () => {
      const duration = (performance.now() - start).toFixed(2);
      this.info('Performance', `${label} took ${duration}ms`);
    };
  }

  public getRecentLogs(): DiagnosticEvent[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const diagnostics = new DiagnosticsManager();

// Setup global error listeners
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    diagnostics.error('GlobalError', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    diagnostics.error('UnhandledRejection', event.reason?.message || 'Unhandled Promise Rejection', {
      reason: event.reason,
    });
  });
}
