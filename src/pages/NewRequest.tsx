import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function NewRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Niedrig' | 'Normal' | 'Hoch'>('Normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Bitte geben Sie einen Titel für den Auftrag ein.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('service_requests')
        .insert({
          user_id: user!.id,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status: 'Eingegangen',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/requests/${data.id}`);
    } catch (error) {
      console.error('Error creating request:', error);
      setError('Fehler beim Erstellen des Auftrags. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 text-anthracite-600 hover:text-dark-blue-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Übersicht
          </Link>
          <h1 className="text-3xl font-bold text-dark-blue-900">Neuen Auftrag erstellen</h1>
          <p className="text-anthracite-600 mt-2">
            Beschreiben Sie Ihren Prüfungsauftrag so genau wie möglich.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-dark-blue-900 mb-2">
                Titel des Auftrags *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Belegprüfung Q1 2024"
                className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dark-blue-900 mb-2">
                Beschreibung
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreiben Sie, was geprüft werden soll und ob Besonderheiten zu beachten sind..."
                rows={5}
                className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-anthracite-500 mt-1">
                Optional: Details zum Auftrag, Zeitraum oder spezielle Anforderungen
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue-900 mb-2">
                Priorität
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'Niedrig', label: 'Niedrig', desc: 'Keine Eile' },
                  { value: 'Normal', label: 'Normal', desc: 'Standard' },
                  { value: 'Hoch', label: 'Hoch', desc: 'Eilig' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value as typeof priority)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      priority === option.value
                        ? 'border-petrol-600 bg-petrol-50'
                        : 'border-anthracite-200 hover:border-anthracite-300'
                    }`}
                  >
                    <p className="font-medium text-dark-blue-900">{option.label}</p>
                    <p className="text-sm text-anthracite-500">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Link
                to="/requests"
                className="px-6 py-3 border border-anthracite-300 text-anthracite-600 rounded-lg font-medium hover:bg-anthracite-50 transition-colors"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Auftrag erstellen
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Notice */}
        <div className="mt-6 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <h3 className="font-semibold text-dark-blue-900 mb-2">Hinweis</h3>
          <p className="text-sm text-anthracite-600 leading-relaxed">
            Nach dem Erstellen des Auftrags können Sie Ihre Belege hochladen und den Status jederzeit einsehen.
            Die Bearbeitung erfolgt in der Regel innerhalb von 3-10 Werktagen.
          </p>
        </div>

        <div className="mt-4 bg-anthracite-100 rounded-lg p-4">
          <p className="text-xs text-anthracite-600 text-center">
            <strong>Wichtig:</strong> Dieser Service bietet keine steuerliche Beratung. Professionelle Beleg-Organisation für Selbstständige.
          </p>
        </div>
      </div>
    </div>
  );
}
