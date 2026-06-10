import { useEffect, useState } from 'react';
import { Mail, Clock, CheckCircle, Eye, Reply, X, Loader2, Inbox } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'neu' | 'gelesen' | 'beantwortet';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const statusConfig = {
  neu:          { label: 'Neu',          className: 'bg-blue-100 text-blue-700' },
  gelesen:      { label: 'Gelesen',      className: 'bg-yellow-100 text-yellow-700' },
  beantwortet:  { label: 'Beantwortet', className: 'bg-green-100 text-green-700' },
};

export function AdminKontakte() {
  const [messages, setMessages]     = useState<ContactMessage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<ContactMessage | null>(null);
  const [reply, setReply]           = useState('');
  const [sending, setSending]       = useState(false);
  const [filter, setFilter]         = useState<'alle' | 'neu' | 'gelesen' | 'beantwortet'>('alle');

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    setReply(msg.admin_reply ?? '');
    if (msg.status === 'neu') {
      await supabase
        .from('contact_messages')
        .update({ status: 'gelesen' })
        .eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'gelesen' } : m));
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    await supabase
      .from('contact_messages')
      .update({ admin_reply: reply, status: 'beantwortet', replied_at: new Date().toISOString() })
      .eq('id', selected.id);
    const updated = { ...selected, admin_reply: reply, status: 'beantwortet' as const, replied_at: new Date().toISOString() };
    setMessages(prev => prev.map(m => m.id === selected.id ? updated : m));
    setSelected(updated);
    setSending(false);
  };

  const filtered = filter === 'alle' ? messages : messages.filter(m => m.status === filter);
  const neuCount = messages.filter(m => m.status === 'neu').length;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-blue-900">Kontaktnachrichten</h2>
          <p className="text-anthracite-500 text-sm mt-1">
            {neuCount > 0 ? `${neuCount} neue Nachricht${neuCount > 1 ? 'en' : ''}` : 'Alle Nachrichten gelesen'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 'neu', 'gelesen', 'beantwortet'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-petrol-600 text-white' : 'bg-white border border-anthracite-200 text-anthracite-600 hover:bg-anthracite-50'
            }`}>
            {f === 'alle' ? 'Alle' : statusConfig[f].label}
            {f === 'neu' && neuCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-petrol-700 text-xs font-bold">{neuCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-anthracite-200 p-12 text-center">
          <Inbox className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
          <p className="text-anthracite-500">Keine Nachrichten in dieser Kategorie.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-anthracite-50 border-b border-anthracite-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-anthracite-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-anthracite-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-anthracite-500 uppercase tracking-wider">E-Mail</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-anthracite-500 uppercase tracking-wider">Betreff</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-anthracite-500 uppercase tracking-wider">Datum</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite-100">
                {filtered.map(msg => (
                  <tr key={msg.id} className={`hover:bg-anthracite-50 transition-colors ${
                    msg.status === 'neu' ? 'font-semibold' : ''
                  }`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[msg.status].className}`}>
                        {msg.status === 'neu' && <Clock className="w-3 h-3" />}
                        {msg.status === 'gelesen' && <Eye className="w-3 h-3" />}
                        {msg.status === 'beantwortet' && <CheckCircle className="w-3 h-3" />}
                        {statusConfig[msg.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-blue-900">{msg.name}</td>
                    <td className="px-6 py-4 text-anthracite-600">{msg.email}</td>
                    <td className="px-6 py-4 text-anthracite-700 max-w-[200px] truncate">{msg.subject}</td>
                    <td className="px-6 py-4 text-anthracite-500 text-sm whitespace-nowrap">{fmt(msg.created_at)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openMessage(msg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-petrol-50 text-petrol-700 rounded-lg text-sm font-medium hover:bg-petrol-100 transition-colors">
                        <Reply className="w-4 h-4" />
                        Öffnen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-anthracite-200">
              <div>
                <h3 className="text-lg font-bold text-dark-blue-900">{selected.subject}</h3>
                <p className="text-sm text-anthracite-500 mt-1">
                  Von <span className="font-medium text-dark-blue-900">{selected.name}</span>
                  {' '}· <a href={`mailto:${selected.email}`} className="text-petrol-600 hover:underline">{selected.email}</a>
                  {' '}· {fmt(selected.created_at)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-anthracite-100 transition-colors">
                <X className="w-5 h-5 text-anthracite-500" />
              </button>
            </div>

            {/* Original Message */}
            <div className="p-6 border-b border-anthracite-100">
              <p className="text-xs font-semibold text-anthracite-400 uppercase tracking-wider mb-3">Nachricht des Absenders</p>
              <p className="text-anthracite-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>

            {/* Previous Reply */}
            {selected.admin_reply && (
              <div className="p-6 bg-petrol-50 border-b border-petrol-100">
                <p className="text-xs font-semibold text-petrol-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Bereits gesendet am {selected.replied_at ? fmt(selected.replied_at) : ''}
                </p>
                <p className="text-anthracite-700 whitespace-pre-wrap leading-relaxed">{selected.admin_reply}</p>
              </div>
            )}

            {/* Reply Area */}
            <div className="p-6">
              <label className="block text-sm font-medium text-dark-blue-900 mb-2">
                {selected.admin_reply ? 'Antwort aktualisieren' : 'Antwort verfassen'}
              </label>
              <div className="relative mb-2">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-anthracite-400" />
                <p className="pl-8 text-sm text-anthracite-500">An: {selected.email}</p>
              </div>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={5}
                placeholder="Ihre Antwort an den Kunden..."
                className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-anthracite-400 mt-1">Hinweis: Die Antwort wird in der Datenbank gespeichert. E-Mail-Versand muss separat konfiguriert werden.</p>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setSelected(null)}
                  className="px-4 py-2 border border-anthracite-200 rounded-lg text-sm font-medium text-anthracite-600 hover:bg-anthracite-50 transition-colors">
                  Schließen
                </button>
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Wird gespeichert...</> : <><Reply className="w-4 h-4" />Antwort speichern</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
