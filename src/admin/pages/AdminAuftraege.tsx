import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Loader2,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ServiceRequest } from '../../types/database';

interface RequestWithProfile extends ServiceRequest {
  profiles: { full_name: string; email: string } | null;
  uploaded_files: { count: number }[];
  notes: { count: number }[];
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Eingegangen: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Eingegangen' },
  'In Prüfung': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'In Prüfung' },
  Rückfrage: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Rückfrage' },
  Abgeschlossen: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Abgeschlossen' },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  Niedrig: { color: 'bg-gray-100 text-gray-700', label: 'Niedrig' },
  Normal: { color: 'bg-blue-100 text-blue-700', label: 'Normal' },
  Hoch: { color: 'bg-red-100 text-red-700', label: 'Hoch' },
};

export function AdminAuftraege() {
  const [requests, setRequests] = useState<RequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    loadRequests();
  }, [filter, sortOrder]);

  const loadRequests = async () => {
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          profiles ( full_name, email ),
          uploaded_files (count),
          notes (count)
        `);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      query = query.order('created_at', { ascending: sortOrder === 'oldest' });

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading requests:', error);
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const searchLower = search.toLowerCase();
    return (
      request.title.toLowerCase().includes(searchLower) ||
      request.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      request.profiles?.email?.toLowerCase().includes(searchLower) ||
      (request.description?.toLowerCase().includes(searchLower) ?? false)
    );
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
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Aufträge</h1>
          <p className="text-anthracite-600">{requests.length} Aufträge insgesamt</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anthracite-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Titel, Kunde..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
          >
            <option value="all">Alle Status</option>
            <option value="Eingegangen">Eingegangen</option>
            <option value="In Prüfung">In Prüfung</option>
            <option value="Rückfrage">Rückfrage</option>
            <option value="Abgeschlossen">Abgeschlossen</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-4 py-2 border border-anthracite-200 rounded-lg hover:bg-anthracite-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'newest' ? 'Neueste' : 'Älteste'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-dark-blue-900 text-white'
                  : `${config.bgColor} ${config.color} hover:opacity-80`
              }`}
            >
              {config.label}
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-anthracite-50 border-b border-anthracite-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900">Auftrag</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden lg:table-cell">Kunde</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden md:table-cell">Priorität</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-dark-blue-900 hidden lg:table-cell">Dateien</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-dark-blue-900 hidden lg:table-cell">Notizen</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden sm:table-cell">Erstellt</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-dark-blue-900">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-anthracite-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-anthracite-500">
                    {search ? 'Keine Aufträge gefunden' : 'Keine Aufträge vorhanden'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-anthracite-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-dark-blue-900">{request.title}</p>
                      {request.description && (
                        <p className="text-sm text-anthracite-500 truncate max-w-xs">{request.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-sm text-dark-blue-900">{request.profiles?.full_name || 'Unbekannt'}</p>
                      <p className="text-xs text-anthracite-500">{request.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
                        {statusConfig[request.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[request.priority]?.color}`}>
                        {priorityConfig[request.priority]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="text-sm text-anthracite-600">{request.uploaded_files?.[0]?.count || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="text-sm text-anthracite-600">{request.notes?.[0]?.count || 0}</span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-sm text-anthracite-600">
                        {new Date(request.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/auftraege/${request.id}`}
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
