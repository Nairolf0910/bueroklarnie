import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
  FileText,
  Clock,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types/database';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  info: { icon: <Info className="w-6 h-6" />, color: 'text-blue-600 bg-blue-100', label: 'Information' },
  success: { icon: <CheckCircle className="w-6 h-6" />, color: 'text-green-600 bg-green-100', label: 'Erfolg' },
  warning: { icon: <AlertCircle className="w-6 h-6" />, color: 'text-orange-600 bg-orange-100', label: 'Hinweis' },
  error: { icon: <AlertCircle className="w-6 h-6" />, color: 'text-red-600 bg-red-100', label: 'Fehler' },
  request_update: { icon: <FileText className="w-6 h-6" />, color: 'text-petrol-600 bg-petrol-100', label: 'Auftrags-Update' },
  new_message: { icon: <MessageCircle className="w-6 h-6" />, color: 'text-dark-blue-600 bg-dark-blue-100', label: 'Neue Nachricht' },
};

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
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

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-anthracite-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-anthracite-600 hover:text-dark-blue-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue-900">Benachrichtigungen</h1>
              <p className="text-anthracite-600 mt-1">
                {unreadCount > 0
                  ? `${unreadCount} ungelesene Benachrichtigung${unreadCount > 1 ? 'en' : ''}`
                  : 'Alle Benachrichtigungen gelesen'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium hover:bg-petrol-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Alle als gelesen markieren
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-dark-blue-900 text-white'
                : 'bg-white text-anthracite-600 hover:bg-anthracite-50 border border-anthracite-200'
            }`}
          >
            Alle ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-petrol-600 text-white'
                : 'bg-petrol-100 text-petrol-700 hover:bg-petrol-200'
            }`}
          >
            Ungelesen ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-anthracite-200 p-12 text-center">
            <Bell className="w-16 h-16 text-anthracite-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-blue-900 mb-2">
              {filter === 'unread' ? 'Keine ungelesenen Benachrichtigungen' : 'Keine Benachrichtigungen'}
            </h3>
            <p className="text-anthracite-600">
              {filter === 'unread'
                ? 'Sie haben alle Benachrichtigungen gelesen.'
                : 'Hier erscheinen Updates zu Ihren Aufträgen.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border ${
                  !notification.is_read ? 'border-petrol-300' : 'border-anthracite-200'
                } overflow-hidden hover:shadow-md transition-shadow`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        typeConfig[notification.type]?.color || typeConfig.info.color
                      }`}
                    >
                      {typeConfig[notification.type]?.icon || <Info className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block text-xs font-medium text-anthracite-500 mb-1">
                            {typeConfig[notification.type]?.label || 'Information'}
                          </span>
                          <h3
                            className={`text-lg ${
                              !notification.is_read ? 'font-semibold text-dark-blue-900' : 'text-dark-blue-900'
                            }`}
                          >
                            {notification.title}
                          </h3>
                        </div>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-petrol-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-anthracite-600 mt-2">{notification.message}</p>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-anthracite-500 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatDate(notification.created_at)}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600 transition-colors"
                              title="Als gelesen markieren"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {notification.link && (
                            <Link
                              to={notification.link}
                              onClick={() => !notification.is_read && markAsRead(notification.id)}
                              className="px-3 py-1.5 bg-petrol-100 text-petrol-600 rounded-lg text-sm font-medium hover:bg-petrol-200 transition-colors"
                            >
                              Ansehen
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <h3 className="font-semibold text-dark-blue-900 mb-2">Hinweis zu Benachrichtigungen</h3>
          <ul className="text-sm text-anthracite-600 space-y-1.5">
            <li>• Sie erhalten Benachrichtigungen über Status-Updates Ihrer Aufträge</li>
            <li>• Neue Nachrichten von BüroKlarNie werden hier angezeigt</li>
            <li>• Benachrichtigungen werden automatisch als gelesen markiert, wenn Sie einen Auftrag öffnen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
