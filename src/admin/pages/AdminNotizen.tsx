import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Loader2, CreditCard as Edit3, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Note } from '../../types/database';

interface NoteWithDetails extends Note {
  profiles: { full_name: string; email: string } | null;
  service_requests: { title: string; status: string } | null;
}

export function AdminNotizen() {
  const [notes, setNotes] = useState<NoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'client'>('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, [filter]);

  const loadNotes = async () => {
    try {
      let query = supabase
        .from('notes')
        .select(`
          *,
          profiles ( full_name, email ),
          service_requests ( title, status )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'admin') {
        query = query.eq('is_from_admin', true);
      } else if (filter === 'client') {
        query = query.eq('is_from_admin', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notes:', error);
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const searchLower = search.toLowerCase();
    return (
      note.content.toLowerCase().includes(searchLower) ||
      note.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      note.service_requests?.title?.toLowerCase().includes(searchLower)
    );
  });

  const startEditing = (note: NoteWithDetails) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const saveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('notes')
      .update({ content: editContent.trim() })
      .eq('id', noteId);

    if (!error) {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, content: editContent.trim() } : n))
      );
      setEditingNote(null);
      setEditContent('');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Notiz wirklich löschen?')) return;

    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  const adminCount = notes.filter((n) => n.is_from_admin).length;
  const clientCount = notes.filter((n) => !n.is_from_admin).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Notizen</h1>
          <p className="text-anthracite-600">{notes.length} Notizen insgesamt</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anthracite-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche in Notizen..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' ? 'bg-dark-blue-900 text-white' : 'bg-white border border-anthracite-200 text-anthracite-600 hover:bg-anthracite-50'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'admin' ? 'bg-petrol-600 text-white' : 'bg-petrol-100 text-petrol-700 hover:bg-petrol-200'
              }`}
            >
              Admin ({adminCount})
            </button>
            <button
              onClick={() => setFilter('client')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'client' ? 'bg-anthracite-600 text-white' : 'bg-anthracite-100 text-anthracite-700 hover:bg-anthracite-200'
              }`}
            >
              Kunde ({clientCount})
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl border border-anthracite-200 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
            <p className="text-anthracite-500">
              {search ? 'Keine Notizen gefunden' : 'Keine Notizen vorhanden'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-xl border ${
                note.is_from_admin ? 'border-petrol-200 border-l-4 border-l-petrol-500' : 'border-anthracite-200'
              } overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-medium ${note.is_from_admin ? 'text-petrol-700' : 'text-dark-blue-900'}`}>
                        {note.is_from_admin ? 'BüroKlarNie (Admin)' : 'Kunde'}
                      </span>
                      {note.is_from_admin && (
                        <span className="text-xs bg-petrol-100 text-petrol-700 px-1.5 py-0.5 rounded">
                          Sichtbar für Kunde
                        </span>
                      )}
                      <span className="text-xs text-anthracite-400">
                        {new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {editingNote === note.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(note.id)}
                            className="px-3 py-1 bg-petrol-600 text-white rounded text-sm hover:bg-petrol-700"
                          >
                            Speichern
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-anthracite-100 text-anthracite-600 rounded text-sm hover:bg-anthracite-200"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-anthracite-700 whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>

                  {editingNote !== note.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-2 hover:bg-anthracite-50 rounded-lg text-anthracite-400 hover:text-petrol-600"
                        title="Bearbeiten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600"
                        title="Löschen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-anthracite-100 flex flex-wrap gap-4 text-sm">
                  {note.profiles && (
                    <div>
                      <span className="text-anthracite-500">Von: </span>
                      <Link
                        to={`/admin/kunden/${note.user_id}`}
                        className="text-petrol-600 hover:text-petrol-700"
                      >
                        {note.profiles.full_name}
                      </Link>
                    </div>
                  )}
                  {note.service_requests && (
                    <div>
                      <span className="text-anthracite-500">Auftrag: </span>
                      <Link
                        to={`/admin/auftraege/${note.request_id}`}
                        className="text-petrol-600 hover:text-petrol-700"
                      >
                        {note.service_requests.title}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
