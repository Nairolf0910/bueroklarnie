import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Upload,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { ServiceRequest, Profile } from '../types/database';

interface Stats {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  totalFiles: number;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  Eingegangen: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" />, label: 'Eingegangen' },
  'In Prüfung': { color: 'bg-yellow-100 text-yellow-700', icon: <Loader2 className="w-4 h-4 animate-spin" />, label: 'In Prüfung' },
  Rückfrage: { color: 'bg-orange-100 text-orange-700', icon: <AlertCircle className="w-4 h-4" />, label: 'Rückfrage' },
  Abgeschlossen: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Abgeschlossen' },
};

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (!profileData) {
        // Create profile if it doesn't exist
        const fullName = user!.user_metadata?.full_name || 'Neuer Benutzer';
        await supabase.from('profiles').insert({
          id: user!.id,
          full_name: fullName,
          email: user!.email!,
        });
        // Set minimal profile
        setProfile({
          id: user!.id,
          email: user!.email!,
          full_name: fullName,
          company_name: undefined,
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        setProfile(profileData);
      }

      // Load recent requests
      const { data: requestsData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentRequests(requestsData || []);

      // Load stats
      const { count: totalRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { count: completedRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'Abgeschlossen');

      const { count: pendingRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .in('status', ['Eingegangen', 'In Prüfung', 'Rückfrage']);

      const { count: totalFiles } = await supabase
        .from('uploaded_files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      setStats({
        totalRequests: totalRequests || 0,
        completedRequests: completedRequests || 0,
        pendingRequests: pendingRequests || 0,
        totalFiles: totalFiles || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-blue-900">
            Willkommen, {profile?.full_name?.split(' ')[0] || 'zurück'}!
          </h1>
          {profile?.company_name && (
            <p className="text-anthracite-600 mt-1">{profile.company_name}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/upload"
            className="bg-petrol-600 hover:bg-petrol-700 rounded-xl p-6 text-white flex items-center gap-6 transition-colors group"
          >
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Belege hochladen</h2>
              <p className="text-petrol-200">Rechnungen, Quittungen und mehr</p>
            </div>
            <ArrowRight className="w-6 h-6 ml-auto" />
          </Link>

          <Link
            to="/request/new"
            className="bg-dark-blue-900 hover:bg-dark-blue-800 rounded-xl p-6 text-white flex items-center gap-6 transition-colors group"
          >
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Neuen Auftrag erstellen</h2>
              <p className="text-anthracite-300">Prüfung beantragen</p>
            </div>
            <ArrowRight className="w-6 h-6 ml-auto" />
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-anthracite-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-petrol-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-petrol-600" />
                </div>
                <p className="text-sm text-anthracite-600">Aufträge</p>
              </div>
              <p className="text-3xl font-bold text-dark-blue-900">{stats.totalRequests}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-anthracite-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-anthracite-600">Abgeschlossen</p>
              </div>
              <p className="text-3xl font-bold text-dark-blue-900">{stats.completedRequests}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-anthracite-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-anthracite-600">In Bearbeitung</p>
              </div>
              <p className="text-3xl font-bold text-dark-blue-900">{stats.pendingRequests}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-anthracite-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-dark-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-dark-blue-600" />
                </div>
                <p className="text-sm text-anthracite-600">Dateien</p>
              </div>
              <p className="text-3xl font-bold text-dark-blue-900">{stats.totalFiles}</p>
            </div>
          </div>
        )}

        {/* Recent Requests */}
        <div className="bg-white rounded-xl border border-anthracite-100 overflow-hidden">
          <div className="p-6 border-b border-anthracite-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-dark-blue-900">Letzte Aufträge</h2>
            <Link
              to="/requests"
              className="text-sm font-medium text-petrol-600 hover:text-petrol-700 flex items-center gap-1"
            >
              Alle anzeigen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck className="w-12 h-12 text-anthracite-300 mx-auto mb-4" />
              <p className="text-anthracite-600 mb-4">Sie haben noch keine Aufträge erstellt.</p>
              <Link
                to="/request/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium hover:bg-petrol-700 transition-colors"
              >
                Ersten Auftrag erstellen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-anthracite-100">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="p-6 hover:bg-anthracite-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig[request.status]?.color}`}>
                      {statusConfig[request.status]?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-dark-blue-900">{request.title}</p>
                      <p className="text-sm text-anthracite-500">
                        Erstellt am {new Date(request.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[request.status]?.color}`}>
                      {statusConfig[request.status]?.label}
                    </span>
                    <ArrowRight className="w-5 h-5 text-anthracite-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-dark-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-dark-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-blue-900 mb-1">Haben Sie Fragen?</h3>
              <p className="text-anthracite-600 text-sm mb-3">
                Kontaktieren Sie uns bei Fragen zu Ihren Aufträgen oder Belegen.
              </p>
              <Link
                to="/kontakt"
                className="text-sm font-medium text-petrol-600 hover:text-petrol-700"
              >
                Zum Kontaktformular →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
