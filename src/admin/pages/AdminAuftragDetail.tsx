import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle,
  MessageCircle,
  Upload,
  Download,
  Trash2,
  Send,
  Building2,
  Mail,
  Clock,
  AlertCircle,
  History,
  Eye,
  EyeOff,
  PlusCircle,
  X,
  Tag,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ServiceRequest, UploadedFile, Profile } from '../../types/database';

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  Eingegangen: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <Clock className="w-5 h-5" />, label: 'Eingegangen' },
  'In Prüfung': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: <Loader2 className="w-5 h-5 animate-spin" />, label: 'In Prüfung' },
  Rückfrage: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: <AlertCircle className="w-5 h-5" />, label: 'Rückfrage' },
  Abgeschlossen: { color: 'text-green-700', bgColor: 'bg-green-100', icon: <CheckCircle className="w-5 h-5" />, label: 'Abgeschlossen' },
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

export function AdminAuftragDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'events'>('messages');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  const categories = [
    { value: 'Rechnung', label: 'Rechnung' },
    { value: 'Quittung', label: 'Quittung' },
    { value: 'Bankauszug', label: 'Bankauszug' },
    { value: 'Sonstiges', label: 'Sonstiges' },
  ];

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (requestError || !requestData) {
        navigate('/admin/auftraege');
        return;
      }
      setRequest(requestData);
      setEditTitle(requestData.title);
      setEditDescription(requestData.description || '');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', requestData.user_id)
        .single();
      setProfile(profileData || null);

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
        .order('created_at', { ascending: true });
      setMessages(messagesData || []);

      const { data: eventsData } = await supabase
        .from('request_events')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: true });
      setEvents(eventsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!request) return;

    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'Abgeschlossen') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', request.id);

    if (!error) {
      setRequest({ ...request, ...updateData } as ServiceRequest);

      await supabase.from('request_events').insert({
        request_id: request.id,
        event_type: 'status_change',
        event_label: `Status geändert: ${statusConfig[newStatus]?.label || newStatus}`,
        metadata: { old_status: request.status, new_status: newStatus },
        visible_to_user: true,
      });

      loadData();
    }
  };

  const updatePriority = async (newPriority: string) => {
    if (!request) return;

    const { error } = await supabase
      .from('service_requests')
      .update({ priority: newPriority, updated_at: new Date().toISOString() })
      .eq('id', request.id);

    if (!error) {
      setRequest({ ...request, priority: newPriority as ServiceRequest['priority'] });
    }
  };

  const saveTitle = async () => {
    if (!request || !editTitle.trim()) return;

    const { error } = await supabase
      .from('service_requests')
      .update({ title: editTitle.trim(), updated_at: new Date().toISOString() })
      .eq('id', request.id);

    if (!error) {
      setRequest({ ...request, title: editTitle.trim() });
      setEditingTitle(false);
    }
  };

  const saveDescription = async () => {
    if (!request) return;

    const { error } = await supabase
      .from('service_requests')
      .update({ description: editDescription.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', request.id);

    if (!error) {
      setRequest({ ...request, description: editDescription.trim() || undefined });
      setEditingDescription(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !request) return;

    setSendingMessage(true);

    try {
      const adminId = (await supabase.auth.getUser()).data.user?.id;

      const { data, error } = await supabase
        .from('request_messages')
        .insert({
          request_id: request.id,
          sender_user_id: adminId,
          sender_role: 'admin',
          message: newMessage.trim(),
          is_internal: isInternal,
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

  const toggleEventVisibility = async (event: RequestEvent) => {
    const newVisibility = !event.visible_to_user;
    const { error } = await supabase
      .from('request_events')
      .update({ visible_to_user: newVisibility })
      .eq('id', event.id);

    if (!error) {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, visible_to_user: newVisibility } : e))
      );
    }
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
    if (!confirm('Datei wirklich löschen?')) return;

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

  const updateFileCategory = async (file: UploadedFile, newCategory: string) => {
    if (newCategory === file.category) {
      setEditingFileId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('uploaded_files')
        .update({ category: newCategory })
        .eq('id', file.id);

      if (error) throw error;

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, category: newCategory } : f))
      );

      await supabase.from('request_events').insert({
        request_id: id,
        event_type: 'file_category_changed',
        event_label: `Kategorie geändert: ${file.file_name} (${file.category} → ${newCategory})`,
        metadata: { file_name: file.file_name, old_category: file.category, new_category: newCategory },
        visible_to_user: false,
      });

      setEditingFileId(null);
    } catch (error) {
      console.error('Error updating file category:', error);
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/auftraege"
          className="inline-flex items-center gap-1 text-sm text-anthracite-600 hover:text-dark-blue-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Aufträgen
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold text-dark-blue-900 border-b-2 border-petrol-500 focus:outline-none"
                />
                <button
                  onClick={saveTitle}
                  className="px-3 py-1 bg-petrol-600 text-white rounded text-sm hover:bg-petrol-700"
                >
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setEditTitle(request.title);
                    setEditingTitle(false);
                  }}
                  className="px-3 py-1 bg-anthracite-100 text-anthracite-600 rounded text-sm hover:bg-anthracite-200"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold text-dark-blue-900 cursor-pointer hover:opacity-80"
                onClick={() => setEditingTitle(true)}
              >
                {request.title}
              </h1>
            )}

            {profile && (
              <Link
                to={`/admin/kunden/${profile.id}`}
                className="inline-flex items-center gap-2 text-anthracite-600 hover:text-petrol-600 mt-1"
              >
                <Building2 className="w-4 h-4" />
                {profile.full_name} ({profile.email})
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={request.status}
              onChange={(e) => updateStatus(e.target.value)}
              className={`px-3 py-2 rounded-lg font-medium ${statusConfig[request.status]?.bgColor} ${statusConfig[request.status]?.color}`}
            >
              <option value="Eingegangen">Eingegangen</option>
              <option value="In Prüfung">In Prüfung</option>
              <option value="Rückfrage">Rückfrage</option>
              <option value="Abgeschlossen">Abgeschlossen</option>
            </select>

            <select
              value={request.priority}
              onChange={(e) => updatePriority(e.target.value)}
              className="px-3 py-2 border border-anthracite-200 rounded-lg"
            >
              <option value="Niedrig">Niedrig</option>
              <option value="Normal">Normal</option>
              <option value="Hoch">Hoch</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-anthracite-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-dark-blue-900">Beschreibung</h2>
              {!editingDescription && (
                <button
                  onClick={() => setEditingDescription(true)}
                  className="text-sm text-petrol-600 hover:text-petrol-700"
                >
                  Bearbeiten
                </button>
              )}
            </div>

            {editingDescription ? (
              <div className="space-y-3">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDescription}
                    className="px-3 py-1 bg-petrol-600 text-white rounded text-sm hover:bg-petrol-700"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setEditDescription(request.description || '');
                      setEditingDescription(false);
                    }}
                    className="px-3 py-1 bg-anthracite-100 text-anthracite-600 rounded text-sm hover:bg-anthracite-200"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-anthracite-600 whitespace-pre-wrap">
                {request.description || 'Keine Beschreibung vorhanden'}
              </p>
            )}
          </div>

          {/* Files */}
          <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
            <div className="p-4 border-b border-anthracite-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-dark-blue-900 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Dateien ({files.length})
              </h2>
            </div>

            {files.length === 0 ? (
              <p className="p-6 text-anthracite-500 text-sm">Keine Dateien vorhanden</p>
            ) : (
              <div className="divide-y divide-anthracite-100">
                {files.map((file) => (
                  <div key={file.id} className="p-4 flex items-center justify-between hover:bg-anthracite-50">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-anthracite-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-anthracite-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-dark-blue-900 truncate">{file.file_name}</p>
                        <p className="text-sm text-anthracite-500">
                          {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''} • {new Date(file.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {editingFileId === file.id ? (
                        <select
                          defaultValue={file.category}
                          autoFocus
                          onBlur={(e) => updateFileCategory(file, e.target.value)}
                          onChange={(e) => updateFileCategory(file, e.target.value)}
                          className="px-2 py-1 text-sm border border-petrol-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 bg-white"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingFileId(file.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity bg-anthracite-100 text-anthracite-700 rounded"
                          title="Klicken zum Ändern"
                        >
                          <Tag className="w-3 h-3" />
                          {file.category}
                        </span>
                      )}
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file)}
                        className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
                <div className="divide-y divide-anthracite-100 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-anthracite-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-anthracite-300" />
                      Noch keine Nachrichten vorhanden.
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 ${msg.sender_role === 'admin' ? (msg.is_internal ? 'bg-yellow-50' : 'bg-petrol-50') : 'bg-anthracite-50'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-medium ${
                              msg.sender_role === 'admin'
                                ? msg.is_internal
                                  ? 'text-yellow-700'
                                  : 'text-petrol-700'
                                : 'text-dark-blue-900'
                            }`}
                          >
                            {msg.sender_role === 'admin' ? 'BüroKlarNie' : 'Kunde'}
                          </span>
                          {msg.is_internal && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
                              Intern
                            </span>
                          )}
                          <span className="text-xs text-anthracite-400">
                            {new Date(msg.created_at).toLocaleDateString('de-DE', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-anthracite-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-anthracite-100">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-anthracite-300"
                      />
                      <span className={isInternal ? 'text-yellow-700' : 'text-anthracite-600'}>
                        Intern (nicht für Kunde sichtbar)
                      </span>
                    </label>
                  </div>
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
                      className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                        isInternal
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-petrol-600 hover:bg-petrol-700 text-white'
                      }`}
                    >
                      {sendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="max-h-[28rem] overflow-y-auto">
                {events.length === 0 ? (
                  <div className="p-8 text-center text-anthracite-500">
                    <History className="w-8 h-8 mx-auto mb-2 text-anthracite-300" />
                    Noch keine Ereignisse vorhanden.
                  </div>
                ) : (
                  <div className="divide-y divide-anthracite-100">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 flex items-start gap-3 hover:bg-anthracite-50 group"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            event.visible_to_user ? 'bg-petrol-100' : 'bg-yellow-100'
                          }`}
                        >
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
                        <button
                          onClick={() => toggleEventVisibility(event)}
                          className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                            event.visible_to_user
                              ? 'text-petrol-600 hover:bg-petrol-50'
                              : 'text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={event.visible_to_user ? 'Für Kunde ausblenden' : 'Für Kunde sichtbar machen'}
                        >
                          {event.visible_to_user ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
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
          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-anthracite-200 p-6">
            <h3 className="text-lg font-semibold text-dark-blue-900 mb-4">Status</h3>
            <div className="space-y-3">
              {['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'].map((status) => {
                const isActive = request.status === status;
                const statusOrder = ['Eingegangen', 'In Prüfung', 'Rückfrage', 'Abgeschlossen'];
                const isPast = statusOrder.indexOf(request.status) > statusOrder.indexOf(status);

                return (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-petrol-50' : 'hover:bg-anthracite-50'
                    }`}
                  >
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
                      {statusConfig[status]?.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-anthracite-200 p-6">
            <h3 className="text-lg font-semibold text-dark-blue-900 mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-anthracite-500">Erstellt</dt>
                <dd className="font-medium text-dark-blue-900">
                  {new Date(request.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              <div>
                <dt className="text-anthracite-500">Aktualisiert</dt>
                <dd className="font-medium text-dark-blue-900">
                  {new Date(request.updated_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              {request.due_date && (
                <div>
                  <dt className="text-anthracite-500">Fällig</dt>
                  <dd className="font-medium text-orange-700">
                    {new Date(request.due_date).toLocaleDateString('de-DE')}
                  </dd>
                </div>
              )}
              {request.completed_at && (
                <div>
                  <dt className="text-anthracite-500">Abgeschlossen</dt>
                  <dd className="font-medium text-green-700">
                    {new Date(request.completed_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Customer Info */}
          {profile && (
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <h3 className="text-lg font-semibold text-dark-blue-900 mb-4">Kunde</h3>
              <Link
                to={`/admin/kunden/${profile.id}`}
                className="block hover:bg-anthracite-50 -mx-6 px-6 py-2 rounded"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-petrol-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-petrol-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-blue-900">{profile.full_name}</p>
                    {profile.company_name && (
                      <p className="text-sm text-anthracite-500">{profile.company_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-anthracite-600 mt-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
