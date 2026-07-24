// PayWorth Enterprise Notification Engine Service
import { Notification } from '../types';
import { diagnostics } from '../lib/diagnostics';

export class NotificationService {
  /**
   * Create a structured system notification
   */
  public static createNotification(
    title: string,
    message: string,
    category: Notification['category'] = 'system'
  ): Notification {
    const notification: Notification = {
      id: `NOTIF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      category,
      read: false,
      date: new Date().toISOString()
    };

    diagnostics.info('NotificationService', `Notification created: ${title}`);
    return notification;
  }

  /**
   * Filter unread notifications count
   */
  public static getUnreadCount(notifications?: Notification[] | null): number {
    return (notifications || []).filter(n => n && !n.read).length;
  }

  /**
   * Mark all notifications as read
   */
  public static markAllAsRead(notifications?: Notification[] | null): Notification[] {
    return (notifications || []).map(n => ({ ...n, read: true }));
  }
}
