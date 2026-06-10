import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Upload,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalClients: number;
  totalRequests: number;
  openRequests: number;
  requestsByStatus: Record<string, number>;
  totalFiles: number;
  totalNotes: number;
}

interface RecentRequest {
  id: string;
  title: string;
  status: string;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
}

interface RecentUpload {
  id: string;
  file_name: string;
  category: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface RecentNote {
  id: string;
  content: string;
  is_from_admin: boolean;
  created_at: string;
  user_id: string;
  request_id: string | null;
  service_requests: { title: string } | null;
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  Eingegangen: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <Clock className="w-4 h-4" />, label: 'Eingegangen' },
  'In Prüfung': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: <Loader2 className="w-4 h-4 animate-spin" />, label: 'In Prüfung' },
  Rückfrage: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: <AlertCircle className="w-4 h-4" />, label: 'Rückfrage' },
  Abgeschlossen: { color: 'text-green-700', bgColor: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" />, label: 'Abgeschlossen' },
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { count: totalClients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true });

      const { count: openRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Eingegangen', 'In Prüfung', 'Rückfrage']);

      const statuses = ['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'];
      const requestsByStatus: Record<string, number> = {};
      for (const status of statuses) {
        const { count } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
        requestsByStatus[status] = count || 0;
      }

      const { count: totalFiles } = await supabase
        .from('uploaded_files')
        .select('*', { count: 'exact', head: true });

      const { count: totalNotes } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalClients: totalClients || 0,
        totalRequests: totalRequests || 0,
        openRequests: openRequests || 0,
        requestsByStatus,
        totalFiles: totalFiles || 0,
        totalNotes: totalNotes || 0,
      });

      // Recent requests with profiles
      const { data: requestsData } = await supabase
        .from('service_requests')
        .select(`
          id,
          title,
          status,
          created_at,
          profiles ( full_name, email )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentRequests(requestsData || []);

      // Recent uploads
      const { data: uploadsData } = await supabase
        .from('uploaded_files')
        .select(`
          id,
          file_name,
          category,
          created_at,
          profiles ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUploads(uploadsData || []);

      // Recent notes — use request_id (canonical FK column)
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          id,
          content,
          is_from_admin,
          created_at,
          user_id,
          request_id,
          service_requests ( title )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notesError) {
        const { data: notesFallback } = await supabase
          .from('notes')
          .select('id, content, is_from_admin, created_at, user_id, request_id')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentNotes((notesFallback || []).map(n => ({ ...n, service_requests: null })));
      } else {
        setRecentNotes(notesData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-blue-900">Dashboard</h1>
        <p className="text-anthracite-600">Überblick über alle Aktivitäten</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-anthracite-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-petrol-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-petrol-600" />
            </div>
            <p className="text-sm text-anthracite-600">Kunden</p>
          </div>
          <p className="text-3xl font-bold text-dark-blue-900">{stats?.totalClients || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-anthracite-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-anthracite-600">Aufträge gesamt</p>
          </div>
          <p className="text-3xl font-bold text-dark-blue-900">{stats?.totalRequests || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-anthracite-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-anthracite-600">Offene Aufträge</p>
          </div>
          <p className="text-3xl font-bold text-dark-blue-900">{stats?.openRequests || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-anthracite-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-anthracite-600">Abgeschlossen</p>
          </div>
          <p className="text-3xl font-bold text-dark-blue-900">{stats?.requestsByStatus?.['Abgeschlossen'] || 0}</p>
        </div>
      </div>

      {/* Requests by Status */}
      <div className="bg-white rounded-xl border border-anthracite-200 p-6">
        <h2 className="text-lg font-semibold text-dark-blue-900 mb-4">Aufträge nach Status</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats?.requestsByStatus || {}).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig[status]?.bgColor}`}>
                {statusConfig[status]?.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-blue-900">{count}</p>
                <p className="text-sm text-anthracite-600">{statusConfig[status]?.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
          <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-dark-blue-900">Neueste Aufträge</h2>
            <Link to="/admin/auftraege" className="text-sm text-petrol-600 hover:text-petrol-700 flex items-center gap-1">
              Alle <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-anthracite-100">
            {recentRequests.length === 0 ? (
              <p className="p-4 text-anthracite-500 text-sm">Keine Aufträge vorhanden</p>
            ) : (
              recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/admin/auftraege/${request.id}`}
                  className="p-4 hover:bg-anthracite-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-dark-blue-900">{request.title}</p>
                    <p className="text-sm text-anthracite-500">
                      {request.profiles?.full_name || 'Unbekannt'} • {new Date(request.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
                    {statusConfig[request.status]?.label}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
          <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-dark-blue-900">Neueste Dateien</h2>
            <Link to="/admin/dateien" className="text-sm text-petrol-600 hover:text-petrol-700 flex items-center gap-1">
              Alle <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-anthracite-100">
            {recentUploads.length === 0 ? (
              <p className="p-4 text-anthracite-500 text-sm">Keine Dateien vorhanden</p>
            ) : (
              recentUploads.map((file) => (
                <div key={file.id} className="p-4 hover:bg-anthracite-50">
                  <p className="font-medium text-dark-blue-900 truncate">{file.file_name}</p>
                  <p className="text-sm text-anthracite-500">
                    {file.profiles?.full_name || 'Unbekannt'} • {file.category} • {new Date(file.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
        <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-dark-blue-900">Neueste Notizen</h2>
          <Link to="/admin/notizen" className="text-sm text-petrol-600 hover:text-petrol-700 flex items-center gap-1">
            Alle <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-anthracite-100">
          {recentNotes.length === 0 ? (
            <p className="p-4 text-anthracite-500 text-sm">Keine Notizen vorhanden</p>
          ) : (
            recentNotes.map((note) => (
              <div key={note.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${note.is_from_admin ? 'bg-petrol-500' : 'bg-anthracite-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.is_from_admin && (
                        <span className="text-xs bg-petrol-100 text-petrol-700 px-1.5 py-0.5 rounded">Admin</span>
                      )}
                      <span className="text-xs text-anthracite-400">
                        {new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-anthracite-600 truncate">{note.content}</p>
                    {note.service_requests && (
                      <p className="text-xs text-anthracite-400 mt-1">Auftrag: {note.service_requests.title}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-anthracite-50 rounded-lg p-4 border border-anthracite-200">
          <p className="text-sm text-anthracite-600">Dateien</p>
          <p className="text-2xl font-bold text-dark-blue-900">{stats?.totalFiles || 0}</p>
        </div>
        <div className="bg-anthracite-50 rounded-lg p-4 border border-anthracite-200">
          <p className="text-sm text-anthracite-600">Notizen</p>
          <p className="text-2xl font-bold text-dark-blue-900">{stats?.totalNotes || 0}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">Rückfragen</p>
          <p className="text-2xl font-bold text-orange-700">{stats?.requestsByStatus?.['Rückfrage'] || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">Eingegangen</p>
          <p className="text-2xl font-bold text-blue-700">{stats?.requestsByStatus?.['Eingegangen'] || 0}</p>
        </div>
      </div>
    </div>
  );
}
