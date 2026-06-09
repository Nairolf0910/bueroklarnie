import { Link } from 'react-router-dom';
import {
  FileCheck,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Shield,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  FileText,
  ClipboardCheck,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Was genau macht BüroKlarNie?',
    answer:
      'Wir unterstützen Selbstständige bei der ordnungsgemäßen Organisation und Prüfung ihrer Belege vor der EÜR-Erstellung oder Übergabe an den Steuerberater. Wir erteilen keine steuerliche Beratung, sondern bereiten Ihre Unterlagen strukturiert vor.',
  },
  {
    question: 'Wer kann den Service nutzen?',
    answer:
      'Unser Angebot richtet sich an Solo-Selbstständige, Freelancer und Kleingewerbetreibende in Deutschland, die ihre Belege professionell vorbereiten möchten.',
  },
  {
    question: 'Wie läuft der Prozess ab?',
    answer:
      'Nach Ihrer Registrierung laden Sie Ihre Belege über unser Portal hoch. Wir prüfen auf Vollständigkeit und Plausibilität, stellen Rückfragen bei Unklarheiten und liefern Ihnen eine strukturierte Übersicht.',
  },
  {
    question: 'Ist das eine Steuerberatung?',
    answer:
      'Nein. Wir bieten ausschließlich organisatorische Dienstleistungen an. Die steuerliche Einordnung und Prüfung erfolgt durch Ihren Steuerberater. Unsere Aufgabe ist die Vorbereitung und Strukturierung.',
  },
  {
    question: 'Wie lange dauert eine Bearbeitung?',
    answer:
      'Je nach Umfang und Komplexität benötigen wir 3-10 Werktage. Express-Bearbeitung ist gegen Aufpreis möglich.',
  },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-blue-900 via-dark-blue-800 to-petrol-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Ihre Belege perfekt vorbereitet für die Steuererklärung
            </h1>
            <p className="text-xl md:text-2xl text-petrol-200 mb-8 leading-relaxed">
              Wir organisieren und prüfen Ihre Rechnungen und Quittungen – professionell, strukturiert und stressfrei.
              Die ideale Vorbereitung für Ihre EÜR oder den Steuerberater.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-petrol-500 hover:bg-petrol-600 text-white rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Kostenlose Erstprüfung anfragen
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-anthracite-300">
              Keine steuerliche Beratung – Professionelle Beleg-Organisation
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-anthracite-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Kennen Sie diese Situationen?
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Als Selbstständiger haben Sie alle Hände voll zu tun. Die Beleg-Organisation bleibt oft bis zum Schluss liegen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-anthracite-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Fehlende oder fehlerhafte Rechnungen</h3>
              <p className="text-anthracite-600">
                Nicht alle Ausgaben sind korrekt dokumentiert. Fehlende Angaben machen die Zuordnung schwierig.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-anthracite-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Unstrukturierte Belegsammlung</h3>
              <p className="text-anthracite-600">
                Quittungen, Rechnungen und Bankauszüge liegen unsortiert vor. Der Überblick geht verloren.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-anthracite-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Stress vor Abgabefristen</h3>
              <p className="text-anthracite-600">
                Kurz vor der Frist beginnt hektisches Sortieren. Fehler schleichen sich ein, der Steuerberater wartet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-6">
                Ihre Lösung: Professionelle Beleg-Organisation
              </h2>
              <p className="text-lg text-anthracite-600 mb-8 leading-relaxed">
                BüroKlarNie übernimmt die mühsame Arbeit der Beleg-Strukturierung. Wir prüfen Ihre Unterlagen auf
                Vollständigkeit und Plausibilität, sodass Sie oder Ihr Steuerberater direkt mit der eigentlichen
                Arbeit beginnen können.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-petrol-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-dark-blue-900">Strukturierte Aufbereitung</h4>
                    <p className="text-anthracite-600">Alle Belege werden geordnet und kategorisiert.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-petrol-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-dark-blue-900">Plausibilitätsprüfung</h4>
                    <p className="text-anthracite-600">Wir identifizieren Unstimmigkeiten und fehlende Angaben.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-petrol-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-dark-blue-900">Klare Dokumentation</h4>
                    <p className="text-anthracite-600">Sie erhalten eine übersichtliche Zusammenstellung.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-petrol-50 to-dark-blue-50 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Shield className="w-10 h-10 text-petrol-600 mb-4" />
                  <h4 className="font-semibold text-dark-blue-900 mb-1">DSGVO-konform</h4>
                  <p className="text-sm text-anthracite-600">Sichere Verarbeitung Ihrer Daten in Deutschland</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <MessageCircle className="w-10 h-10 text-petrol-600 mb-4" />
                  <h4 className="font-semibold text-dark-blue-900 mb-1">Persönlich</h4>
                  <p className="text-sm text-anthracite-600">Direkte Ansprechpartner bei Rückfragen</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Clock className="w-10 h-10 text-petrol-600 mb-4" />
                  <h4 className="font-semibold text-dark-blue-900 mb-1">Zuverlässig</h4>
                  <p className="text-sm text-anthracite-600">Faire Bearbeitungszeiten und Transparenz</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <FileCheck className="w-10 h-10 text-petrol-600 mb-4" />
                  <h4 className="font-semibold text-dark-blue-900 mb-1">Gründlich</h4>
                  <p className="text-sm text-anthracite-600">Sorgfältige Prüfung jedes Belegs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-anthracite-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Unsere Dienstleistungen
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Professionelle Vorbereitung Ihrer steuerlichen Unterlagen – ohne Steuerberatung.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-anthracite-100 group">
              <FileText className="w-12 h-12 text-petrol-600 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">Beleg-Organisation</h3>
              <p className="text-anthracite-600 mb-4">
                Sortierung und Kategorisierung Ihrer Rechnungen, Quittungen und Bankauszüge nach Datum und Art.
              </p>
              <ul className="text-sm text-anthracite-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Chronologische Ordnung
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Kategorienbildung
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Auffinden von Lücken
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-anthracite-100 group">
              <ClipboardCheck className="w-12 h-12 text-petrol-600 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">Plausibilitätsprüfung</h3>
              <p className="text-anthracite-600 mb-4">
                Überprüfung Ihrer Belege auf formale Richtigkeit, Vollständigkeit und Nachvollziehbarkeit.
              </p>
              <ul className="text-sm text-anthracite-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Formale Prüfung
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Konsistenz-Check
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Rückmeldung bei Auffälligkeiten
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-anthracite-100 group">
              <TrendingUp className="w-12 h-12 text-petrol-600 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">EÜR-Vorbereitung</h3>
              <p className="text-anthracite-600 mb-4">
                Aufbereitung Ihrer Belege für die Einnahmen-Überschuss-Rechnung oder die Übergabe an Ihren Steuerberater.
              </p>
              <ul className="text-sm text-anthracite-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Strukturierte Ausgabe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Kopie-fertig aufbereitet
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-petrol-600" />
                  Zeitsparend für den Berater
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Transparente Preise
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Wählen Sie das passende Paket für Ihren Bedarf. Alle Preise sind Netto-Preise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Package */}
            <div className="bg-anthracite-50 rounded-2xl p-8 border border-anthracite-200">
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Basis</h3>
              <p className="text-anthracite-600 mb-6">Für den gelegentlichen Bedarf</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-dark-blue-900">ab 79 €</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Bis 50 Belege
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Grundlegende Sortierung
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Plausibilitätsprüfung
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Erstellung einer Übersicht
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-3 px-6 text-center border-2 border-petrol-600 text-petrol-600 rounded-lg font-semibold hover:bg-petrol-50 transition-colors"
              >
                Anfragen
              </Link>
            </div>

            {/* Standard Package */}
            <div className="bg-dark-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-petrol-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Beliebt
              </div>
              <h3 className="text-xl font-semibold mb-2">Standard</h3>
              <p className="text-anthracite-300 mb-6">Für den regelmäßigen Bedarf</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">ab 149 €</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-anthracite-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0" />
                  Bis 150 Belege
                </li>
                <li className="flex items-start gap-2 text-anthracite-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0" />
                  Detaillierte Kategorisierung
                </li>
                <li className="flex items-start gap-2 text-anthracite-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0" />
                  Ausführliche Prüfung
                </li>
                <li className="flex items-start gap-2 text-anthracite-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0" />
                  Bericht mit Optimierungshinweisen
                </li>
                <li className="flex items-start gap-2 text-anthracite-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0" />
                  Priorisierte Bearbeitung
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-3 px-6 text-center bg-petrol-500 hover:bg-petrol-600 text-white rounded-lg font-semibold transition-colors"
              >
                Anfragen
              </Link>
            </div>

            {/* Premium Package */}
            <div className="bg-anthracite-50 rounded-2xl p-8 border border-anthracite-200">
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Premium</h3>
              <p className="text-anthracite-600 mb-6">Für umfassende Anforderungen</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-dark-blue-900">ab 279 €</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Unbegrenzte Belege
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Komplette EÜR-Vorbereitung
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Persönlicher Ansprechpartner
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Express-Bearbeitung
                </li>
                <li className="flex items-start gap-2 text-anthracite-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                  Telefonische Abstimmung
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-3 px-6 text-center border-2 border-petrol-600 text-petrol-600 rounded-lg font-semibold hover:bg-petrol-50 transition-colors"
              >
                Anfragen
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-anthracite-500 mt-8">
            Alle Preise zzgl. MwSt. Individuelle Anpassungen auf Anfrage möglich.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-anthracite-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Häufige Fragen
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-dark-blue-900 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-petrol-600" />
                    {faq.question}
                  </span>
                  <span className="text-anthracite-400">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-anthracite-600 leading-relaxed pl-8">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-dark-blue-900 to-petrol-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit für mehr Ordnung in Ihren Belegen?
          </h2>
          <p className="text-xl text-petrol-200 mb-8">
            Starten Sie jetzt mit einer kostenlosen Erstprüfung Ihrer Unterlagen.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-dark-blue-900 rounded-lg text-lg font-semibold hover:bg-anthracite-100 transition-colors"
          >
            Jetzt registrieren
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-anthracite-300">
            Keine versteckten Kosten – Keine steuerliche Beratung
          </p>
        </div>
      </section>
    </div>
  );
}
