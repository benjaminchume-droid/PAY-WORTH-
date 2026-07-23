// Network Status Monitor with Event Dispatcher & Health Ping

export type NetworkStatus = 'online' | 'offline' | 'reconnecting';

export class NetworkMonitor {
  private static status: NetworkStatus = navigator.onLine ? 'online' : 'offline';
  private static listeners: Set<(status: NetworkStatus) => void> = new Set();
  private static pingTimer: any = null;

  public static init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => this.handleOnlineState());
    window.addEventListener('offline', () => this.handleOfflineState());

    // Periodic health check ping every 30 seconds when reported online
    if (!this.pingTimer) {
      this.pingTimer = setInterval(() => this.checkConnectivityPing(), 30000);
    }
  }

  public static isOnline(): boolean {
    return this.status === 'online';
  }

  public static getStatus(): NetworkStatus {
    return this.status;
  }

  public static subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.status);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private static handleOnlineState(): void {
    this.status = 'reconnecting';
    this.notify();

    // Verify true backend connectivity with a lightweight ping
    this.checkConnectivityPing().then((isHealthy) => {
      this.status = isHealthy ? 'online' : 'offline';
      this.notify();
    });
  }

  private static handleOfflineState(): void {
    this.status = 'offline';
    this.notify();
  }

  public static async checkConnectivityPing(): Promise<boolean> {
    if (!navigator.onLine) {
      this.status = 'offline';
      this.notify();
      return false;
    }

    try {
      // Lightweight fetch attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      const healthy = res ? res.ok : navigator.onLine;
      const prev = this.status;
      this.status = healthy ? 'online' : 'offline';

      if (prev !== this.status) {
        this.notify();
      }

      return healthy;
    } catch (e) {
      this.status = 'offline';
      this.notify();
      return false;
    }
  }

  private static notify(): void {
    const current = this.status;
    this.listeners.forEach((cb) => cb(current));
    window.dispatchEvent(new CustomEvent('pw_network_status_changed', { detail: { status: current } }));
  }
}

// Auto-initialize
NetworkMonitor.init();
