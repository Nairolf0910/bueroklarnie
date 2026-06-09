import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  MessageCircle,
  Send,
  Upload,
  Download,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { ServiceRequest, UploadedFile, Note } from '../types/database';

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  Eingegangen: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Clock className="w-5 h-5" />,
    label: 'Eingegangen'
  },
  'In Prüfung': {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
    label: 'In Prüfung'
  },
  Rückfrage: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'Rückfrage'
  },
  Abgeschlossen: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-5 h-5" />,
    label: 'Abgeschlossen'
  },
};

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    if (user && id) {
      loadData();
    }
  }, [user, id]);

  const loadData = async () => {
    try {
      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (requestError) throw requestError;
      if (!requestData) {
        navigate('/requests');
        return;
      }
      setRequest(requestData);

      const { data: filesData } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: false });

      setFiles(filesData || []);

      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: true });

      setNotes(notesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !request) return;

    setSendingNote(true);

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          request_id: request.id,
          user_id: user!.id,
          content: newNote.trim(),
          is_from_admin: false,
        })
        .select()
        .single();

      if (error) throw error;

      setNotes((prev) => [...prev, data]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }

    setSendingNote(false);
  };

  const handleDownloadFile = async (file: UploadedFile) => {
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

  const handleDeleteFile = async (file: UploadedFile) => {
    if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;

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
      <div className="min-h-screen bg-anthracite-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 text-anthracite-600 hover:text-dark-blue-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Übersicht
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue-900">{request.title}</h1>
              <p className="text-anthracite-600 mt-1">
                Erstellt am {new Date(request.created_at).toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}>
              {statusConfig[request.status]?.icon}
              <span className="font-medium">{statusConfig[request.status]?.label}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {request.description && (
              <div className="bg-white rounded-xl border border-anthracite-200 p-6">
                <h2 className="text-lg font-semibold text-dark-blue-900 mb-3">Beschreibung</h2>
                <p className="text-anthracite-600 whitespace-pre-wrap">{request.description}</p>
              </div>
            )}

            {/* Files */}
            <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
              <div className="p-6 border-b border-anthracite-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-dark-blue-900">
                  Hochgeladene Dateien ({files.length})
                </h2>
                <Link
                  to={`/upload?request_id=${request.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-petrol-600 text-white text-sm rounded-lg hover:bg-petrol-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Hochladen
                </Link>
              </div>

              {files.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-anthracite-300 mx-auto mb-3" />
                  <p className="text-anthracite-600 mb-4">Noch keine Dateien hochgeladen.</p>
                  <Link
                    to={`/upload?request_id=${request.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-petrol-600 text-petrol-600 rounded-lg text-sm font-medium hover:bg-petrol-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Dateien hochladen
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-anthracite-100">
                  {files.map((file) => (
                    <div key={file.id} className="p-4 flex items-center justify-between hover:bg-anthracite-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-anthracite-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-anthracite-600" />
                        </div>
                        <div>
                          <p className="font-medium text-dark-blue-900">{file.file_name}</p>
                          <p className="text-sm text-anthracite-500">
                            {file.category} • {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {request.status !== 'Abgeschlossen' && (
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
              <div className="p-6 border-b border-anthracite-100">
                <h2 className="text-lg font-semibold text-dark-blue-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Nachrichten
                </h2>
              </div>

              <div className="divide-y divide-anthracite-100 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="p-6 text-center text-anthracite-500">
                    Noch keine Nachrichten vorhanden.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 ${note.is_from_admin ? 'bg-petrol-50' : 'bg-anthracite-50'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${note.is_from_admin ? 'text-petrol-700' : 'text-dark-blue-900'}`}>
                          {note.is_from_admin ? 'BüroKlarNie' : 'Sie'}
                        </span>
                        <span className="text-xs text-anthracite-400">
                          {new Date(note.created_at).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-anthracite-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              {request.status !== 'Abgeschlossen' && (
                <form onSubmit={handleAddNote} className="p-4 border-t border-anthracite-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Nachricht schreiben..."
                      className="flex-1 px-4 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                    />
                    <button
                      type="submit"
                      disabled={!newNote.trim() || sendingNote}
                      className="px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingNote ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <h3 className="text-lg font-semibold text-dark-blue-900 mb-4">Status</h3>
              <div className="space-y-4">
                {['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'].map((status, index) => {
                  const isActive = request.status === status;
                  const isPast = ['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'].indexOf(request.status) > index;

                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? statusConfig[status]?.bgColor
                            : isPast
                            ? 'bg-green-100'
                            : 'bg-anthracite-100'
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : isActive ? (
                          statusConfig[status]?.icon
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-anthracite-300" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isActive ? 'font-medium text-dark-blue-900' : 'text-anthracite-500'
                        }`}
                      >
                        {statusConfig[status]?.label || status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="bg-dark-blue-50 rounded-xl border border-dark-blue-100 p-6">
              <h3 className="font-semibold text-dark-blue-900 mb-3">Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-anthracite-500">Priorität</dt>
                  <dd className="font-medium text-dark-blue-900">{request.priority}</dd>
                </div>
                <div>
                  <dt className="text-anthracite-500">Erstellt</dt>
                  <dd className="font-medium text-dark-blue-900">
                    {new Date(request.created_at).toLocaleDateString('de-DE')}
                  </dd>
                </div>
                {request.completed_at && (
                  <div>
                    <dt className="text-anthracite-500">Abgeschlossen</dt>
                    <dd className="font-medium text-dark-blue-900">
                      {new Date(request.completed_at).toLocaleDateString('de-DE')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Notice */}
            <div className="bg-anthracite-100 rounded-lg p-4">
              <p className="text-xs text-anthracite-600">
                <strong>Hinweis:</strong> BüroKlarNie bietet keine steuerliche Beratung.
                Professionelle Beleg-Vorbereitung für die Steuererklärung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
