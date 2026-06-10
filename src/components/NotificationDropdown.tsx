import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types/database';

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
  success: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600 bg-green-100' },
  warning: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-orange-600 bg-orange-100' },
  error: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600 bg-red-100' },
  request_update: { icon: <FileText className="w-5 h-5" />, color: 'text-petrol-600 bg-petrol-100' },
  new_message: { icon: <MessageCircle className="w-5 h-5" />, color: 'text-dark-blue-600 bg-dark-blue-100' },
};

export function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatDate = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return notificationDate.toLocaleDateString('de-DE');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-anthracite-100 transition-colors"
        aria-label="Benachrichtigungen"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-petrol-600' : 'text-anthracite-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-anthracite-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-anthracite-100 bg-anthracite-50">
            <h3 className="font-semibold text-dark-blue-900">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-petrol-600 hover:text-petrol-700 font-medium"
              >
                Alle als gelesen markieren
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-petrol-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
                <p className="text-anthracite-500 text-sm">Keine Benachrichtigungen</p>
              </div>
            ) : (
              <div className="divide-y divide-anthracite-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-anthracite-50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-petrol-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.is_read) markAsRead(notification.id);
                      if (notification.link) {
                        window.location.href = notification.link;
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig[notification.type]?.color || typeConfig.info.color}`}>
                        {typeConfig[notification.type]?.icon || <Info className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-dark-blue-900' : 'text-anthracite-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-petrol-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-anthracite-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-anthracite-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-anthracite-100 bg-anthracite-50">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm font-medium text-petrol-600 hover:text-petrol-700"
              >
                Alle Benachrichtigungen anzeigen
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
