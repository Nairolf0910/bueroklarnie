import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Loader2,
  Clock,
  AlertCircle,
  MessageCircle,
  Upload,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ServiceRequest } from '../../types/database';

interface RequestWithDetails extends ServiceRequest {
  profiles: { full_name: string; email: string } | null;
  uploaded_files: { count: number }[];
  notes: { count: number }[];
}

const statusConfig: Record<string, { color: string; bgColor: string; priority: number }> = {
  Rückfrage: { color: 'text-orange-700', bgColor: 'bg-orange-100', priority: 1 },
  Eingegangen: { color: 'text-blue-700', bgColor: 'bg-blue-100', priority: 2 },
  'In Prüfung': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', priority: 3 },
  Abgeschlossen: { color: 'text-green-700', bgColor: 'bg-green-100', priority: 4 },
};

export function AdminAufgaben() {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'urgent' | 'missing'>('all');

  useEffect(() => {
    loadRequests();
  }, [view]);

  const loadRequests = async () => {
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          profiles ( full_name, email ),
          uploaded_files (count),
          notes (count)
        `)
        .in('status', ['Eingegangen', 'In Prüfung', 'Rückfrage']);

      if (view === 'urgent') {
        query = query.in('status', ['Rückfrage', 'Eingegangen']);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      if (view === 'missing') {
        // Requests with no files or no notes
        filteredData = filteredData.filter(
          (r) => (r.uploaded_files?.[0]?.count || 0) === 0 || (r.notes?.[0]?.count || 0) === 0
        );
      }

      // Sort by priority (Rückfrage first, then Eingegangen)
      filteredData.sort((a, b) => {
        const pa = statusConfig[a.status]?.priority || 99;
        const pb = statusConfig[b.status]?.priority || 99;
        if (pa !== pb) return pa - pb;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setRequests(filteredData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading requests:', error);
      setLoading(false);
    }
  };

  const getDaysSince = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  const rueckfrageCount = requests.filter((r) => r.status === 'Rückfrage').length;
  const eingegangenCount = requests.filter((r) => r.status === 'Eingegangen').length;
  const inPruefungCount = requests.filter((r) => r.status === 'In Prüfung').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Aufgaben</h1>
          <p className="text-anthracite-600">{requests.length} offene Aufträge</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'all' ? 'bg-dark-blue-900 text-white' : 'bg-white border border-anthracite-200 text-anthracite-600 hover:bg-anthracite-50'
            }`}
          >
            Alle offenen
          </button>
          <button
            onClick={() => setView('urgent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'urgent' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            Dringend
          </button>
          <button
            onClick={() => setView('missing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'missing' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Fehlende Daten
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{rueckfrageCount}</p>
              <p className="text-sm text-orange-600">Rückfragen</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{eingegangenCount}</p>
              <p className="text-sm text-blue-600">Eingegangen</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{inPruefungCount}</p>
              <p className="text-sm text-yellow-600">In Prüfung</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-anthracite-200 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
          <p className="text-anthracite-500">
            {view === 'all' ? 'Keine offenen Aufträge' : 'Keine Aufträge in dieser Ansicht'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const days = getDaysSince(request.created_at);
            const filesCount = request.uploaded_files?.[0]?.count || 0;
            const notesCount = request.notes?.[0]?.count || 0;
            const isUrgent = request.status === 'Rückfrage' || (request.status === 'Eingegangen' && days >= 3);
            const hasMissing = filesCount === 0 || notesCount === 0;

            return (
              <Link
                key={request.id}
                to={`/admin/auftraege/${request.id}`}
                className={`block bg-white rounded-xl border ${
                  isUrgent ? 'border-orange-300' : hasMissing ? 'border-red-200' : 'border-anthracite-200'
                } p-4 hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
                        {request.status}
                      </span>
                      {days >= 3 && (
                        <span className="text-xs text-orange-600">
                          {days} Tage alt
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-dark-blue-900 truncate">{request.title}</h3>

                    {request.profiles && (
                      <p className="text-sm text-anthracite-600">
                        {request.profiles.full_name} • {request.profiles.email}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className={`flex items-center gap-1 ${filesCount === 0 ? 'text-red-500' : 'text-anthracite-500'}`}>
                        <Upload className="w-4 h-4" />
                        {filesCount} Dateien
                        {filesCount === 0 && (
                          <span className="text-xs">(Fehlt!)</span>
                        )}
                      </span>
                      <span className={`flex items-center gap-1 ${notesCount === 0 ? 'text-red-500' : 'text-anthracite-500'}`}>
                        <MessageCircle className="w-4 h-4" />
                        {notesCount} Notizen
                        {notesCount === 0 && (
                          <span className="text-xs">(Fehlt!)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-anthracite-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-anthracite-50 rounded-xl p-4 border border-anthracite-200">
        <h3 className="text-sm font-semibold text-dark-blue-900 mb-2">Legende</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-anthracite-600">Rückfrage/Dringend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-anthracite-600">Eingegangen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-anthracite-600">In Prüfung</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-anthracite-600">Fehlende Daten</span>
          </div>
        </div>
      </div>
    </div>
  );
}
