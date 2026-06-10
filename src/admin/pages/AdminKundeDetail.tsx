import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Upload,
  MessageCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, ServiceRequest, UploadedFile, Note } from '../../types/database';

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Eingegangen: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Eingegangen' },
  'In Prüfung': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'In Prüfung' },
  Rückfrage: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Rückfrage' },
  Abgeschlossen: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Abgeschlossen' },
};

export function AdminKundeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profileData) {
        navigate('/admin/kunden');
        return;
      }
      setProfile(profileData);

      const { data: requestsData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);

      const { data: filesData } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      setFiles(filesData || []);

      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      setNotes(notesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
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

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/kunden"
          className="inline-flex items-center gap-1 text-sm text-anthracite-600 hover:text-dark-blue-900 mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Zurück zu Kunden
        </Link>
        <h1 className="text-2xl font-bold text-dark-blue-900">{profile.full_name}</h1>
        {profile.company_name && (
          <p className="text-anthracite-600">{profile.company_name}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl border border-anthracite-200 p-6">
          <h2 className="text-lg font-semibold text-dark-blue-900 mb-4">Kontaktdaten</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-anthracite-400 mt-0.5" />
              <div>
                <p className="text-sm text-anthracite-500">E-Mail</p>
                <a href={`mailto:${profile.email}`} className="text-sm text-petrol-600 hover:underline">
                  {profile.email}
                </a>
              </div>
            </div>
            {profile.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-anthracite-400 mt-0.5" />
                <div>
                  <p className="text-sm text-anthracite-500">Telefon</p>
                  <a href={`tel:${profile.phone}`} className="text-sm text-petrol-600 hover:underline">
                    {profile.phone}
                  </a>
                </div>
              </div>
            )}
            {profile.company_name && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-anthracite-400 mt-0.5" />
                <div>
                  <p className="text-sm text-anthracite-500">Firma</p>
                  <p className="text-sm text-dark-blue-900">{profile.company_name}</p>
                </div>
              </div>
            )}
            {(profile.street || profile.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-anthracite-400 mt-0.5" />
                <div>
                  <p className="text-sm text-anthracite-500">Adresse</p>
                  <p className="text-sm text-dark-blue-900">
                    {profile.street}<br />
                    {profile.postal_code} {profile.city}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-anthracite-400 mt-0.5" />
              <div>
                <p className="text-sm text-anthracite-500">Registriert seit</p>
                <p className="text-sm text-dark-blue-900">
                  {new Date(profile.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-anthracite-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-blue-900">{requests.length}</p>
                <p className="text-sm text-anthracite-600">Aufträge</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-anthracite-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-petrol-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-petrol-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-blue-900">{files.length}</p>
                <p className="text-sm text-anthracite-600">Dateien</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-anthracite-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-blue-900">{notes.length}</p>
                <p className="text-sm text-anthracite-600">Notizen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests */}
      <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
        <div className="p-4 border-b border-anthracite-100">
          <h2 className="text-lg font-semibold text-dark-blue-900">Aufträge ({requests.length})</h2>
        </div>
        {requests.length === 0 ? (
          <p className="p-4 text-anthracite-500 text-sm">Keine Aufträge vorhanden</p>
        ) : (
          <div className="divide-y divide-anthracite-100">
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/admin/auftraege/${request.id}`}
                className="p-4 hover:bg-anthracite-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-dark-blue-900">{request.title}</p>
                  <p className="text-sm text-anthracite-500">
                    {new Date(request.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
                  {statusConfig[request.status]?.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Files */}
      <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
        <div className="p-4 border-b border-anthracite-100">
          <h2 className="text-lg font-semibold text-dark-blue-900">Letzte Dateien</h2>
        </div>
        {files.length === 0 ? (
          <p className="p-4 text-anthracite-500 text-sm">Keine Dateien vorhanden</p>
        ) : (
          <div className="divide-y divide-anthracite-100">
            {files.slice(0, 10).map((file) => (
              <div key={file.id} className="p-4 hover:bg-anthracite-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-dark-blue-900 truncate">{file.file_name}</p>
                  <p className="text-sm text-anthracite-500">
                    {file.category} • {new Date(file.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
