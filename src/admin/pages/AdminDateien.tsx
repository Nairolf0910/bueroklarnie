import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Loader2,
  Download,
  Trash2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { UploadedFile } from '../../types/database';

interface FileWithDetails extends UploadedFile {
  profiles: { full_name: string; email: string } | null;
  service_requests: { title: string; status: string } | null;
}

const categoryConfig: Record<string, { color: string; label: string }> = {
  Rechnung: { color: 'bg-blue-100 text-blue-700', label: 'Rechnung' },
  Quittung: { color: 'bg-green-100 text-green-700', label: 'Quittung' },
  Bankauszug: { color: 'bg-purple-100 text-purple-700', label: 'Bankauszug' },
  Sonstiges: { color: 'bg-gray-100 text-gray-700', label: 'Sonstiges' },
};

export function AdminDateien() {
  const [files, setFiles] = useState<FileWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadFiles();
  }, [categoryFilter]);

  const loadFiles = async () => {
    try {
      let query = supabase
        .from('uploaded_files')
        .select(`
          *,
          profiles ( full_name, email ),
          service_requests ( title, status )
        `)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading files:', error);
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) => {
    const searchLower = search.toLowerCase();
    return (
      file.file_name.toLowerCase().includes(searchLower) ||
      file.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      file.profiles?.email?.toLowerCase().includes(searchLower) ||
      (file.description?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const handleDownload = async (file: FileWithDetails) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(file.file_path, 3600);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (file: FileWithDetails) => {
    if (!confirm('Datei wirklich löschen?')) return;

    try {
      await supabase.storage.from('documents').remove([file.file_path]);
      await supabase.from('uploaded_files').delete().eq('id', file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Dateien</h1>
          <p className="text-anthracite-600">
            {files.length} Dateien • {(totalSize / 1024 / 1024).toFixed(2)} MB gesamt
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anthracite-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Dateiname, Kunde..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
          >
            <option value="all">Alle Kategorien</option>
            <option value="Rechnung">Rechnung</option>
            <option value="Quittung">Quittung</option>
            <option value="Bankauszug">Bankauszug</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
      </div>

      {/* Category Stats */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryConfig).map(([cat, config]) => {
          const count = files.filter((f) => f.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-dark-blue-900 text-white'
                  : `${config.color} hover:opacity-80`
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900">Datei</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden lg:table-cell">Kunde</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900">Kategorie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden lg:table-cell">Auftrag</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden md:table-cell">Größe</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-dark-blue-900 hidden sm:table-cell">Datum</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-dark-blue-900">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-anthracite-100">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-anthracite-500">
                    {search ? 'Keine Dateien gefunden' : 'Keine Dateien vorhanden'}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-anthracite-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-anthracite-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-anthracite-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark-blue-900 truncate">{file.file_name}</p>
                          {file.description && (
                            <p className="text-sm text-anthracite-500 truncate">{file.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {file.profiles ? (
                        <Link
                          to={`/admin/kunden/${file.user_id}`}
                          className="text-sm text-petrol-600 hover:text-petrol-700"
                        >
                          {file.profiles.full_name}
                        </Link>
                      ) : (
                        <span className="text-sm text-anthracite-400">Unbekannt</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${categoryConfig[file.category || 'Sonstiges']?.color}`}>
                        {categoryConfig[file.category || 'Sonstiges']?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {file.service_requests ? (
                        <Link
                          to={`/admin/auftraege/${file.request_id}`}
                          className="text-sm text-petrol-600 hover:text-petrol-700"
                        >
                          {file.service_requests.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-anthracite-400">–</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-anthracite-600">
                        {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '–'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-sm text-anthracite-600">
                        {new Date(file.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600"
                          title="Herunterladen"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
