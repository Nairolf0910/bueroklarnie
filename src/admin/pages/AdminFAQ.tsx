import { useState, useEffect } from 'react';
import { HelpCircle, Plus, CreditCard as Edit3, Trash2, Save, X, GripVertical, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { FaqEntry } from '../../types/database';

export function AdminFAQ() {
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_entries')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (faq: FaqEntry) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setEditIsActive(faq.is_active);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
    setEditIsActive(true);
  };

  const saveEdit = async () => {
    if (!editingId || !editQuestion.trim() || !editAnswer.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('faq_entries')
        .update({
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
          is_active: editIsActive,
        })
        .eq('id', editingId);

      if (error) throw error;

      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? { ...f, question: editQuestion.trim(), answer: editAnswer.trim(), is_active: editIsActive }
            : f
        )
      );
      cancelEditing();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    } finally {
      setSaving(false);
    }
  };

  const createFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSaving(true);

    try {
      const maxSortOrder = Math.max(0, ...faqs.map((f) => f.sort_order));

      const { data, error } = await supabase
        .from('faq_entries')
        .insert({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          is_active: newIsActive,
          sort_order: maxSortOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setFaqs((prev) => [...prev, data]);
      setNewQuestion('');
      setNewAnswer('');
      setNewIsActive(true);
      setShowNewForm(false);
    } catch (error) {
      console.error('Error creating FAQ:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('FAQ wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('faq_entries').delete().eq('id', id);
      if (error) throw error;
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const moveFaq = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === faqs.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];

    // Update sort_order in database
    try {
      const updates = newFaqs.map((faq, idx) => ({
        id: faq.id,
        sort_order: idx,
      }));

      for (const update of updates) {
        await supabase
          .from('faq_entries')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setFaqs(newFaqs);
    } catch (error) {
      console.error('Error reordering FAQs:', error);
    }
  };

  const toggleActive = async (faq: FaqEntry) => {
    try {
      const { error } = await supabase
        .from('faq_entries')
        .update({ is_active: !faq.is_active })
        .eq('id', faq.id);

      if (error) throw error;
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f))
      );
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-dark-blue-900">FAQ-Verwaltung</h1>
          <p className="text-anthracite-600">{faqs.length} FAQ-Einträge</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neuer Eintrag
        </button>
      </div>

      {/* New FAQ Form */}
      {showNewForm && (
        <div className="bg-white rounded-xl border border-petrol-200 p-6 space-y-4">
          <h3 className="font-semibold text-dark-blue-900">Neuer FAQ-Eintrag</h3>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Frage</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
              placeholder="Frage eingeben..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Antwort</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
              placeholder="Antwort eingeben..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newActive"
              checked={newIsActive}
              onChange={(e) => setNewIsActive(e.target.checked)}
              className="rounded border-anthracite-300"
            />
            <label htmlFor="newActive" className="text-sm text-anthracite-700">
              Aktiv (auf Website sichtbar)
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewQuestion('');
                setNewAnswer('');
              }}
              className="px-4 py-2 bg-anthracite-100 text-anthracite-600 rounded-lg hover:bg-anthracite-200"
            >
              Abbrechen
            </button>
            <button
              onClick={createFaq}
              disabled={!newQuestion.trim() || !newAnswer.trim() || saving}
              className="px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Speichern'}
            </button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      {faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-anthracite-200 p-8 text-center">
          <HelpCircle className="w-12 h-12 text-anthracite-300 mx-auto mb-3" />
          <p className="text-anthracite-500">Keine FAQ-Einträge vorhanden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                !faq.is_active ? 'border-dashed border-anthracite-300 opacity-60' : 'border-anthracite-200'
              }`}
            >
              {editingId === faq.id ? (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-anthracite-700 mb-1">Frage</label>
                    <input
                      type="text"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-anthracite-700 mb-1">Antwort</label>
                    <textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${faq.id}`}
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="rounded border-anthracite-300"
                    />
                    <label htmlFor={`active-${faq.id}`} className="text-sm text-anthracite-700">
                      Aktiv
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 bg-anthracite-100 text-anthracite-600 rounded-lg hover:bg-anthracite-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={!editQuestion.trim() || !editAnswer.trim() || saving}
                      className="px-3 py-1.5 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveFaq(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-anthracite-100 rounded disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4 text-anthracite-400" />
                      </button>
                      <div className="p-1 cursor-grab text-anthracite-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <button
                        onClick={() => moveFaq(index, 'down')}
                        disabled={index === faqs.length - 1}
                        className="p-1 hover:bg-anthracite-100 rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4 text-anthracite-400" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className={`w-5 h-5 ${faq.is_active ? 'text-petrol-600' : 'text-anthracite-400'}`} />
                        <h3 className="font-semibold text-dark-blue-900">{faq.question}</h3>
                        {!faq.is_active && (
                          <span className="text-xs bg-anthracite-200 text-anthracite-600 px-2 py-0.5 rounded">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      <p className="text-anthracite-600 text-sm whitespace-pre-wrap">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(faq)}
                        className={`p-2 rounded-lg transition-colors ${
                          faq.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-anthracite-400 hover:bg-anthracite-50'
                        }`}
                        title={faq.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        {faq.is_active ? '●' : '○'}
                      </button>
                      <button
                        onClick={() => startEditing(faq)}
                        className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600"
                        title="Bearbeiten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFaq(faq.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
