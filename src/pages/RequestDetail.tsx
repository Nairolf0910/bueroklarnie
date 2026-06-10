import { useState, useEffect, useRef } from 'react';
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
  X,
  PlusCircle,
  History,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { ServiceRequest, UploadedFile } from '../types/database';

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  Eingegangen: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Clock className="w-5 h-5" />,
    label: 'Eingegangen',
  },
  'In Prüfung': {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
    label: 'In Prüfung',
  },
  Rückfrage: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'Rückfrage',
  },
  Abgeschlossen: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-5 h-5" />,
    label: 'Abgeschlossen',
  },
};

interface RequestMessage {
  id: string;
  sender_user_id?: string;
  sender_role: 'admin' | 'client';
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface RequestEvent {
  id: string;
  event_type: string;
  event_label: string;
  metadata: Record<string, unknown>;
  visible_to_user: boolean;
  created_at: string;
}

interface InlineUploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  category: 'Rechnung' | 'Quittung' | 'Bankauszug' | 'Sonstiges';
  error?: string;
}

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'events'>('messages');

  // Inline Upload State
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<InlineUploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (user && id) loadData();
  }, [user, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (requestError) throw requestError;
      if (!requestData) { navigate('/requests'); return; }
      setRequest(requestData);

      const { data: filesData } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: false });
      setFiles(filesData || []);

      const { data: messagesData } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', id)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });
      setMessages(messagesData || []);

      const { data: eventsData } = await supabase
        .from('request_events')
        .select('*')
        .eq('request_id', id)
        .eq('visible_to_user', true)
        .order('created_at', { ascending: true });
      setEvents(eventsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // ── Inline Upload Helpers ─────────────────────────────────────
  const addPendingFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: InlineUploadFile[] = Array.from(incoming).map((f) => ({
      file: f,
      status: 'pending',
      progress: 0,
      category: 'Sonstiges',
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
    setShowUploadPanel(true);
  };

  const updatePending = (index: number, updates: Partial<InlineUploadFile>) => {
    setPendingFiles((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const handleInlineUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);

    for (let i = 0; i < pendingFiles.length; i++) {
      const item = pendingFiles[i];
      if (item.status === 'success') continue;
      updatePending(i, { status: 'uploading', progress: 0 });

      try {
        const ext = item.file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: storageErr } = await supabase.storage
          .from('documents')
          .upload(fileName, item.file);
        if (storageErr) throw storageErr;

        const { data: inserted, error: dbErr } = await supabase
          .from('uploaded_files')
          .insert({
            user_id: user!.id,
            request_id: id,
            file_name: item.file.name,
            file_path: fileName,
            file_type: item.file.type,
            file_size: item.file.size,
            category: item.category,
          })
          .select()
          .single();
        if (dbErr) throw dbErr;

        updatePending(i, { status: 'success', progress: 100 });
        setFiles((prev) => [inserted, ...prev]);

        // Add event
        await supabase.from('request_events').insert({
          request_id: id,
          event_type: 'file_uploaded',
          event_label: `Datei hochgeladen: ${item.file.name}`,
          metadata: { file_name: item.file.name, category: item.category },
          visible_to_user: true,
        });
      } catch (err) {
        console.error(err);
        updatePending(i, { status: 'error', error: 'Upload fehlgeschlagen' });
      }
    }

    setUploading(false);
  };

  const clearSuccessFiles = () => {
    setPendingFiles((prev) => prev.filter((f) => f.status !== 'success'));
    if (pendingFiles.every((f) => f.status === 'success')) setShowUploadPanel(false);
  };

  // ── Messages ─────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !request) return;
    setSendingMessage(true);
    try {
      const { data, error } = await supabase
        .from('request_messages')
        .insert({
          request_id: request.id,
          sender_user_id: user!.id,
          sender_role: 'client',
          message: newMessage.trim(),
          is_internal: false,
        })
        .select()
        .single();
      if (error) throw error;
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSendingMessage(false);
  };

  // ── File actions ──────────────────────────────────────────────
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

      await supabase.from('request_events').insert({
        request_id: id,
        event_type: 'file_deleted',
        event_label: `Datei gelöscht: ${file.file_name}`,
        metadata: { file_name: file.file_name },
        visible_to_user: false,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  };

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-anthracite-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }
  if (!request) return null;

  const hasPending = pendingFiles.some((f) => f.status === 'pending' || f.status === 'error');

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Erstellt am{' '}
                {new Date(request.created_at).toLocaleDateString('de-DE', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                statusConfig[request.status]?.bgColor
              } ${statusConfig[request.status]?.color}`}
            >
              {statusConfig[request.status]?.icon}
              <span className="font-medium">{statusConfig[request.status]?.label}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
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
                <h2 className="text-lg font-semibold text-dark-blue-900 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Dateien ({files.length})
                </h2>
                {request.status !== 'Abgeschlossen' && (
                  <button
                    onClick={() => setShowUploadPanel((v) => !v)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-petrol-600 text-white text-sm rounded-lg hover:bg-petrol-700 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Datei hochladen
                  </button>
                )}
              </div>

              {/* Upload Panel */}
              {showUploadPanel && request.status !== 'Abgeschlossen' && (
                <div className="p-4 border-b border-anthracite-100 bg-petrol-50/40">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); addPendingFiles(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
                      dragOver ? 'border-petrol-500 bg-petrol-100' : 'border-anthracite-300 hover:border-petrol-400 hover:bg-white'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-anthracite-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-dark-blue-900">Klicken oder Dateien hierher ziehen</p>
                    <p className="text-xs text-anthracite-500 mt-1">PDF, JPG, PNG, Word, Excel – max. 50 MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"
                      className="hidden"
                      onChange={(e) => { addPendingFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    />
                  </div>

                  {pendingFiles.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {pendingFiles.map((item, idx) => (
                        <div key={idx} className="bg-white border border-anthracite-200 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-anthracite-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-dark-blue-900 truncate">{item.file.name}</span>
                              <span className="text-xs text-anthracite-400 flex-shrink-0">
                                {(item.file.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {item.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                              {item.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-petrol-600" />}
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                                  className="p-0.5 hover:bg-red-50 rounded text-anthracite-400 hover:text-red-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {item.status === 'pending' && (
                            <select
                              value={item.category}
                              onChange={(e) => updatePending(idx, { category: e.target.value as InlineUploadFile['category'] })}
                              className="w-full sm:w-48 px-2 py-1.5 border border-anthracite-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-petrol-500"
                            >
                              <option value="Rechnung">Rechnung</option>
                              <option value="Quittung">Quittung</option>
                              <option value="Bankauszug">Bankauszug</option>
                              <option value="Sonstiges">Sonstiges</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => { setShowUploadPanel(false); setPendingFiles([]); }}
                      className="text-sm text-anthracite-500 hover:text-anthracite-700 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <div className="flex items-center gap-2">
                      {pendingFiles.some((f) => f.status === 'success') && (
                        <button onClick={clearSuccessFiles} className="text-xs text-green-600 hover:underline">
                          Erledigte ausblenden
                        </button>
                      )}
                      <button
                        onClick={handleInlineUpload}
                        disabled={!hasPending || uploading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white text-sm rounded-lg hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Hochladen...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Hochladen</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* File List */}
              {files.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-anthracite-300 mx-auto mb-3" />
                  <p className="text-anthracite-600 mb-4">Noch keine Dateien hochgeladen.</p>
                  {request.status !== 'Abgeschlossen' && (
                    <button
                      onClick={() => setShowUploadPanel(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-petrol-600 text-petrol-600 rounded-lg text-sm font-medium hover:bg-petrol-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Erste Datei hochladen
                    </button>
                  )}
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
                            {file.category}{file.file_size ? ` • ${(file.file_size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600 transition-colors"
                          title="Herunterladen"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {request.status !== 'Abgeschlossen' && (
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600 transition-colors"
                            title="Löschen"
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

            {/* Messages & Events Tabs */}
            <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
              <div className="flex border-b border-anthracite-100">
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'messages'
                      ? 'text-petrol-700 bg-petrol-50 border-b-2 border-petrol-600'
                      : 'text-anthracite-600 hover:bg-anthracite-50'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Nachrichten ({messages.length})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'events'
                      ? 'text-petrol-700 bg-petrol-50 border-b-2 border-petrol-600'
                      : 'text-anthracite-600 hover:bg-anthracite-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Verlauf ({events.length})
                </button>
              </div>

              {activeTab === 'messages' ? (
                <>
                  <div className="divide-y divide-anthracite-100 max-h-80 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="p-8 text-center text-anthracite-500">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-anthracite-300" />
                        Noch keine Nachrichten vorhanden.
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 ${msg.sender_role === 'admin' ? 'bg-petrol-50' : 'bg-anthracite-50'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-medium ${msg.sender_role === 'admin' ? 'text-petrol-700' : 'text-dark-blue-900'}`}>
                              {msg.sender_role === 'admin' ? 'BüroKlarNie' : 'Sie'}
                            </span>
                            <span className="text-xs text-anthracite-400">
                              {new Date(msg.created_at).toLocaleDateString('de-DE', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-anthracite-700 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {request.status !== 'Abgeschlossen' && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-anthracite-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Nachricht schreiben..."
                          className="flex-1 px-4 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {sendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="p-8 text-center text-anthracite-500">
                      <History className="w-8 h-8 mx-auto mb-2 text-anthracite-300" />
                      Noch keine Ereignisse vorhanden.
                    </div>
                  ) : (
                    <div className="divide-y divide-anthracite-100">
                      {events.map((event) => (
                        <div key={event.id} className="p-4 flex items-start gap-3 hover:bg-anthracite-50">
                          <div className="w-8 h-8 bg-petrol-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {event.event_type === 'status_change' ? (
                              <Clock className="w-4 h-4 text-petrol-600" />
                            ) : event.event_type.includes('file') ? (
                              <FileText className="w-4 h-4 text-petrol-600" />
                            ) : (
                              <History className="w-4 h-4 text-petrol-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-dark-blue-900">{event.event_label}</p>
                            <p className="text-xs text-anthracite-500">{formatEventTime(event.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <h3 className="text-lg font-semibold text-dark-blue-900 mb-4">Status</h3>
              <div className="space-y-4">
                {['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'].map((status, index) => {
                  const isActive = request.status === status;
                  const statusOrder = ['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'];
                  const isPast = statusOrder.indexOf(request.status) > index;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? statusConfig[status]?.bgColor : isPast ? 'bg-green-100' : 'bg-anthracite-100'
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
                      <span className={`text-sm ${isActive ? 'font-medium text-dark-blue-900' : 'text-anthracite-500'}`}>
                        {statusConfig[status]?.label || status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-dark-blue-50 rounded-xl border border-dark-blue-100 p-6">
              <h3 className="font-semibold text-dark-blue-900 mb-3">Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-anthracite-500">Priorität</dt>
                  <dd className="font-medium text-dark-blue-900">{request.priority}</dd>
                </div>
                {request.category && (
                  <div>
                    <dt className="text-anthracite-500">Kategorie</dt>
                    <dd className="font-medium text-dark-blue-900">{request.category}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-anthracite-500">Erstellt</dt>
                  <dd className="font-medium text-dark-blue-900">
                    {new Date(request.created_at).toLocaleDateString('de-DE')}
                  </dd>
                </div>
                {request.due_date && (
                  <div>
                    <dt className="text-anthracite-500">Fälligkeitsdatum</dt>
                    <dd className="font-medium text-dark-blue-900">
                      {new Date(request.due_date).toLocaleDateString('de-DE')}
                    </dd>
                  </div>
                )}
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

            <div className="bg-anthracite-100 rounded-lg p-4">
              <p className="text-xs text-anthracite-600 leading-relaxed">
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
