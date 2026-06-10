import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Loader2,
  ChevronRight,
  Mail,
  Building2,
  FileText,
  Upload,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/database';

interface ProfileWithStats extends Profile {
  requestCount: number;
  fileCount: number;
}

export function AdminKunden() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      // 1) Alle Profile laden (nur role = 'user' oder 'client', kein Admin)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['user', 'client'])
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;
      if (!profileData || profileData.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const ids = profileData.map((p) => p.id);

      // 2) Auftrags-Counts separat
      const { data: requestData } = await supabase
        .from('service_requests')
        .select('user_id')
        .in('user_id', ids);

      // 3) Datei-Counts separat
      const { data: fileData } = await supabase
        .from('uploaded_files')
        .select('user_id')
        .in('user_id', ids);

      // Counts per user_id aufbauen
      const requestCounts: Record<string, number> = {};
      const fileCounts: Record<string, number> = {};

      (requestData || []).forEach((r) => {
        requestCounts[r.user_id] = (requestCounts[r.user_id] || 0) + 1;
      });
      (fileData || []).forEach((f) => {
        fileCounts[f.user_id] = (fileCounts[f.user_id] || 0) + 1;
      });

      const enriched: ProfileWithStats[] = profileData.map((p) => ({
        ...p,
        requestCount: requestCounts[p.id] || 0,
        fileCount: fileCounts[p.id] || 0,
      }));

      setProfiles(enriched);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = (profile.full_name ?? '').toLowerCase();
    const email = (profile.email ?? '').toLowerCase();
    const company = (profile.company_name ?? '').toLowerCase();
    return name.includes(s) || email.includes(s) || company.includes(s);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Kunden</h1>
          <p className="text-anthracite-600">{profiles.length} registrierte Kunden</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anthracite-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Name, E-Mail, Firma..."
            className="pl-10 pr-4 py-2 w-full sm:w-80 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-anthracite-50 border-b border-anthracite-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900">Kunde</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden lg:table-cell">Kontakt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden md:table-cell">Firma</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-dark-blue-900">Aufträge</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-dark-blue-900">Dateien</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-dark-blue-900">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-anthracite-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-anthracite-500">
                    {search ? 'Keine Kunden gefunden' : 'Keine Kunden vorhanden'}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-anthracite-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-petrol-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-petrol-600" />
                        </div>
                        <div>
                          <p className="font-medium text-dark-blue-900">
                            {profile.full_name || '–'}
                          </p>
                          <p className="text-sm text-anthracite-500 lg:hidden">
                            {profile.email || '–'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-anthracite-400" />
                        <span className="text-sm text-anthracite-600">{profile.email || '–'}</span>
                      </div>
                      {profile.phone && (
                        <p className="text-sm text-anthracite-500 mt-1">{profile.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {profile.company_name ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-anthracite-400" />
                          <span className="text-sm text-anthracite-600">{profile.company_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-anthracite-400">–</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                        <FileText className="w-3 h-3" />
                        {profile.requestCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-petrol-100 text-petrol-700 rounded text-sm font-medium">
                        <Upload className="w-3 h-3" />
                        {profile.fileCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/kunden/${profile.id}`}
                        className="inline-flex items-center gap-1 text-sm text-petrol-600 hover:text-petrol-700"
                      >
                        Öffnen <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
