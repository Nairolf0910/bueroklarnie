import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { ServiceRequest } from '../types/database';

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  Eingegangen: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Clock className="w-4 h-4" />,
    label: 'Eingegangen'
  },
  'In Prüfung': {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: 'In Prüfung'
  },
  Rückfrage: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Rückfrage'
  },
  Abgeschlossen: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Abgeschlossen'
  },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  Niedrig: { color: 'bg-gray-100 text-gray-700', label: 'Niedrig' },
  Normal: { color: 'bg-blue-100 text-blue-700', label: 'Normal' },
  Hoch: { color: 'bg-red-100 text-red-700', label: 'Hoch' },
};

interface RequestWithCounts extends ServiceRequest {
  notes: { count: number }[];
  uploaded_files: { count: number }[];
}

export function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          notes(count),
          uploaded_files(count)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading requests:', error);
      setLoading(false);
    }
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-anthracite-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue-900">Meine Aufträge</h1>
            <p className="text-anthracite-600 mt-1">
              Übersicht aller Ihrer Prüfungsaufträge
            </p>
          </div>

          <Link
            to="/request/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Neuer Auftrag
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-dark-blue-900 text-white'
                : 'bg-white text-anthracite-600 hover:bg-anthracite-100 border border-anthracite-200'
            }`}
          >
            Alle ({requests.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = requests.filter((r) => r.status === status).length;
            if (count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  filter === status
                    ? 'bg-dark-blue-900 text-white'
                    : 'bg-white text-anthracite-600 hover:bg-anthracite-100 border border-anthracite-200'
                }`}
              >
                <span className={filter === status ? 'text-white' : config.color}>{config.icon}</span>
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Request List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-anthracite-200 p-12 text-center">
            <FileText className="w-12 h-12 text-anthracite-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-blue-900 mb-2">
              {filter === 'all' ? 'Keine Aufträge vorhanden' : `Keine Aufträge mit Status "${statusConfig[filter]?.label}"`}
            </h3>
            <p className="text-anthracite-600 mb-6">
              {filter === 'all'
                ? 'Erstellen Sie Ihren ersten Prüfungsauftrag.'
                : 'Ändern Sie den Filter, um andere Aufträge zu sehen.'}
            </p>
            {filter === 'all' && (
              <Link
                to="/request/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ersten Auftrag erstellen
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
            <div className="divide-y divide-anthracite-100">
              {filteredRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="p-6 hover:bg-anthracite-50 transition-colors block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-dark-blue-900">{request.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[request.priority]?.color}`}>
                          {request.priority}
                        </span>
                      </div>

                      {request.description && (
                        <p className="text-sm text-anthracite-600 line-clamp-1 mb-3">
                          {request.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-anthracite-500">
                        <span>
                          Erstellt: {new Date(request.created_at).toLocaleDateString('de-DE')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {request.uploaded_files?.[0]?.count || 0} Dateien
                        </span>
                        {(request.notes?.[0]?.count || 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {request.notes[0].count} Notizen
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
                        {statusConfig[request.status]?.icon}
                        {statusConfig[request.status]?.label}
                      </span>
                      <ArrowRight className="w-5 h-5 text-anthracite-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info Notice */}
        <div className="mt-8 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <h3 className="font-semibold text-dark-blue-900 mb-2">Status-Erklärung</h3>
          <ul className="text-sm text-anthracite-600 space-y-2">
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Eingegangen:</strong> Ihr Auftrag ist eingegangen und wird in Kürze bearbeitet.</span>
            </li>
            <li className="flex items-start gap-2">
              <Loader2 className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span><strong>In Prüfung:</strong> Wir prüfen Ihre Belege aktuell auf Vollständigkeit.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span><strong>Rückfrage:</strong> Wir haben eine Frage – bitte prüfen Sie Ihre Nachrichten.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Abgeschlossen:</strong> Die Prüfung ist abgeschlossen.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
