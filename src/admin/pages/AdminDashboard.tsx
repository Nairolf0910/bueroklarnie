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
  Calendar,
  Activity,
  FileCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalClients: number;
  totalRequests: number;
  openRequests: number;
  requestsByStatus: Record<string, number>;
  totalFiles: number;
  totalNotes: number;
  newClientsThisWeek: number;
  requestsThisWeek: number;
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

      // New clients this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: newClientsThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Requests this week
      const { count: requestsThisWeek } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      setStats({
        totalClients: totalClients || 0,
        totalRequests: totalRequests || 0,
        openRequests: openRequests || 0,
        requestsByStatus,
        totalFiles: totalFiles || 0,
        totalNotes: totalNotes || 0,
        newClientsThisWeek: newClientsThisWeek || 0,
        requestsThisWeek: requestsThisWeek || 0,
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

      setRecentRequests((requestsData || []).map((r: { profiles: unknown }) => ({
        ...r,
        profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
      })) as RecentRequest[]);

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

      setRecentUploads((uploadsData || []).map((u: { profiles: unknown }) => ({
        ...u,
        profiles: Array.isArray(u.profiles) ? u.profiles[0] : u.profiles,
      })) as RecentUpload[]);

      // Recent notes
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
        setRecentNotes((notesData || []).map((n: { service_requests: unknown }) => ({
          ...n,
          service_requests: Array.isArray(n.service_requests) ? n.service_requests[0] : n.service_requests,
        })) as RecentNote[]);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Dashboard</h1>
          <p className="text-anthracite-600">Willkommen zurück! Hier ist Ihr heutiger Überblick.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-anthracite-500">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-petrol-500 to-petrol-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+{stats?.newClientsThisWeek || 0} diese Woche</span>
            </div>
            <p className="text-3xl font-bold">{stats?.totalClients || 0}</p>
            <p className="text-petrol-200 text-sm mt-1">Kunden</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-dark-blue-500 to-dark-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+{stats?.requestsThisWeek || 0} diese Woche</span>
            </div>
            <p className="text-3xl font-bold">{stats?.totalRequests || 0}</p>
            <p className="text-dark-blue-200 text-sm mt-1">Aufträge gesamt</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Activity className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{stats?.openRequests || 0}</p>
            <p className="text-orange-200 text-sm mt-1">Offene Aufträge</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <FileCheck className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{stats?.requestsByStatus?.['Abgeschlossen'] || 0}</p>
            <p className="text-green-200 text-sm mt-1">Abgeschlossen</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-2xl border border-anthracite-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-dark-blue-900">Aufträge nach Status</h2>
          <Link
            to="/admin/auftraege"
            className="text-sm text-petrol-600 hover:text-petrol-700 font-medium flex items-center gap-1"
          >
            Alle ansehen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats?.requestsByStatus || {}).map(([status, count]) => {
            const config = statusConfig[status];
            const total = stats?.totalRequests || 1;
            const percentage = Math.round((count / total) * 100);

            return (
              <div
                key={status}
                className={`p-4 rounded-xl ${config.bgColor} border border-transparent hover:border-anthracite-200 transition-colors`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-white/50 ${config.color}`}>
                    {config.icon}
                  </div>
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <p className={`text-3xl font-bold ${config.color}`}>{count}</p>
                  <p className="text-xs text-anthracite-500">{percentage}%</p>
                </div>
                <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === 'Eingegangen' ? 'bg-blue-500' :
                      status === 'In Prüfung' ? 'bg-yellow-500' :
                      status === 'Rückfrage' ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-anthracite-200 p-6">
          <h2 className="text-lg font-semibold text-dark-blue-900 mb-4">Schnellaktionen</h2>
          <div className="space-y-3">
            <Link
              to="/admin/auftraege"
              className="flex items-center gap-3 p-3 rounded-xl bg-petrol-50 hover:bg-petrol-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-petrol-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-petrol-700" />
              </div>
              <div>
                <p className="font-medium text-dark-blue-900">Aufträge verwalten</p>
                <p className="text-xs text-anthracite-500">{stats?.openRequests || 0} offene Aufträge</p>
              </div>
              <ArrowRight className="w-5 h-5 text-anthracite-400 ml-auto" />
            </Link>

            <Link
              to="/admin/kunden"
              className="flex items-center gap-3 p-3 rounded-xl bg-dark-blue-50 hover:bg-dark-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-dark-blue-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 text-dark-blue-700" />
              </div>
              <div>
                <p className="font-medium text-dark-blue-900">Kundenübersicht</p>
                <p className="text-xs text-anthracite-500">{stats?.totalClients || 0} registrierte Kunden</p>
              </div>
              <ArrowRight className="w-5 h-5 text-anthracite-400 ml-auto" />
            </Link>

            <Link
              to="/admin/aufgaben"
              className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertCircle className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="font-medium text-dark-blue-900">Aufgaben</p>
                <p className="text-xs text-anthracite-500">{stats?.requestsByStatus?.['Rückfrage'] || 0} Rückfragen offen</p>
              </div>
              <ArrowRight className="w-5 h-5 text-anthracite-400 ml-auto" />
            </Link>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-anthracite-200 overflow-hidden">
          <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-dark-blue-900">Neueste Aufträge</h2>
            <Link to="/admin/auftraege" className="text-sm text-petrol-600 hover:text-petrol-700 flex items-center gap-1">
              Alle <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
              <p className="text-anthracite-500">Keine Aufträge vorhanden</p>
            </div>
          ) : (
            <div className="divide-y divide-anthracite-100">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/admin/auftraege/${request.id}`}
                  className="p-4 hover:bg-anthracite-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig[request.status]?.bgColor}`}>
                      {statusConfig[request.status]?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-dark-blue-900">{request.title}</p>
                      <p className="text-sm text-anthracite-500">
                        {request.profiles?.full_name || 'Unbekannt'} • {new Date(request.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
                    {statusConfig[request.status]?.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Uploads & Notes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="bg-white rounded-2xl border border-anthracite-200 overflow-hidden">
          <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-petrol-600" />
              <h2 className="text-lg font-semibold text-dark-blue-900">Neueste Dateien</h2>
            </div>
            <Link to="/admin/dateien" className="text-sm text-petrol-600 hover:text-petrol-700">
              Alle <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
          {recentUploads.length === 0 ? (
            <div className="p-8 text-center">
              <Upload className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
              <p className="text-anthracite-500">Keine Dateien vorhanden</p>
            </div>
          ) : (
            <div className="divide-y divide-anthracite-100">
              {recentUploads.map((file) => (
                <div key={file.id} className="p-4 hover:bg-anthracite-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-anthracite-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-anthracite-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-blue-900 truncate">{file.file_name}</p>
                      <p className="text-sm text-anthracite-500">
                        {file.profiles?.full_name || 'Unbekannt'} • {file.category} • {new Date(file.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-2xl border border-anthracite-200 overflow-hidden">
          <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-petrol-600" />
              <h2 className="text-lg font-semibold text-dark-blue-900">Neueste Notizen</h2>
            </div>
            <Link to="/admin/notizen" className="text-sm text-petrol-600 hover:text-petrol-700">
              Alle <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
              <p className="text-anthracite-500">Keine Notizen vorhanden</p>
            </div>
          ) : (
            <div className="divide-y divide-anthracite-100 max-h-80 overflow-y-auto">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 ${note.is_from_admin ? 'bg-petrol-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${note.is_from_admin ? 'bg-petrol-500' : 'bg-anthracite-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {note.is_from_admin && (
                          <span className="text-xs bg-petrol-100 text-petrol-700 px-2 py-0.5 rounded font-medium">
                            Admin
                          </span>
                        )}
                        <span className="text-xs text-anthracite-400">
                          {new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-anthracite-700 line-clamp-2">{note.content}</p>
                      {note.service_requests && (
                        <p className="text-xs text-anthracite-500 mt-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {note.service_requests.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-anthracite-50 rounded-xl p-4 border border-anthracite-200">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-anthracite-500" />
            <p className="text-sm text-anthracite-600">Dateien</p>
          </div>
          <p className="text-2xl font-bold text-dark-blue-900">{stats?.totalFiles || 0}</p>
        </div>
        <div className="bg-anthracite-50 rounded-xl p-4 border border-anthracite-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-anthracite-500" />
            <p className="text-sm text-anthracite-600">Notizen</p>
          </div>
          <p className="text-2xl font-bold text-dark-blue-900">{stats?.totalNotes || 0}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <p className="text-sm text-orange-600">Rückfragen</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats?.requestsByStatus?.['Rückfrage'] || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-blue-600">Wartend</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats?.requestsByStatus?.['Eingegangen'] || 0}</p>
        </div>
      </div>
    </div>
  );
}
