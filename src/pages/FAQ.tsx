import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Search, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FaqEntry } from '../types/database';

export function FAQ() {
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FaqEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      const searchLower = search.toLowerCase();
      setFilteredFaqs(
        faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower)
        )
      );
    }
  }, [search, faqs]);

  const loadFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_entries')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setFaqs(data || []);
      setFilteredFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const expandAll = () => {
    setOpenItems(new Set(faqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-anthracite-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite-50">
      {/* Header */}
      <div className="bg-dark-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-petrol-200 mb-6">
            <HelpCircle className="w-4 h-4" />
            Häufige Fragen
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            FAQ
          </h1>
          <p className="text-xl text-anthracite-300 max-w-2xl mx-auto">
            Antworten auf die häufigsten Fragen rund um BüroKlarNie und unsere Services.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-anthracite-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-anthracite-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Frage suchen..."
                className="w-full pl-12 pr-4 py-3 border border-anthracite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 text-sm font-medium text-anthracite-600 hover:text-dark-blue-900 hover:bg-anthracite-50 rounded-lg transition-colors"
              >
                Alle aufklappen
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 text-sm font-medium text-anthracite-600 hover:text-dark-blue-900 hover:bg-anthracite-50 rounded-lg transition-colors"
              >
                Alle zuklappen
              </button>
            </div>
          </div>
          {search && (
            <p className="mt-4 text-sm text-anthracite-600">
              {filteredFaqs.length} Ergebnis{filteredFaqs.length !== 1 ? 'se' : ''} für "{search}"
            </p>
          )}
        </div>

        {/* FAQ List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-anthracite-100 p-12 text-center">
            <HelpCircle className="w-16 h-16 text-anthracite-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-blue-900 mb-2">
              Keine Fragen gefunden
            </h3>
            <p className="text-anthracite-600 mb-6">
              {search
                ? 'Versuchen Sie es mit anderen Suchbegriffen.'
                : 'Es wurden noch keine FAQs hinterlegt.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-petrol-600 font-medium hover:text-petrol-700"
              >
                Suche zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openItems.has(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
                    isOpen ? 'border-petrol-300 ring-2 ring-petrol-100' : 'border-anthracite-100'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-anthracite-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen ? 'bg-petrol-100' : 'bg-anthracite-100'
                      }`}>
                        <HelpCircle className={`w-5 h-5 ${isOpen ? 'text-petrol-600' : 'text-anthracite-400'}`} />
                      </div>
                      <span className={`font-semibold text-lg ${isOpen ? 'text-dark-blue-900' : 'text-dark-blue-800'}`}>
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-anthracite-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 ml-14">
                      <div className="prose prose-sm max-w-none text-anthracite-600">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-petrol-50 to-dark-blue-50 rounded-2xl p-8 text-center border border-petrol-100">
          <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">
            Haben Sie noch Fragen?
          </h3>
          <p className="text-anthracite-600 mb-6 max-w-lg mx-auto">
            Wir helfen Ihnen gerne weiter. Kontaktieren Sie uns bei weiteren Fragen zu unseren Services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 bg-petrol-600 hover:bg-petrol-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
            >
              Kontakt aufnehmen
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:kontakt@bueroklarnie.de"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-anthracite-50 text-dark-blue-900 rounded-xl font-semibold transition-colors border border-anthracite-200"
            >
              E-Mail senden
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
