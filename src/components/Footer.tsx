import { Link } from 'react-router-dom';
import { FileCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-8 h-8 text-petrol-400" />
              <span className="text-xl font-semibold">BüroKlarNie</span>
            </div>
            <p className="text-anthracite-300 text-sm leading-relaxed">
              Professionelle Organisation und Prüfung Ihrer Belege für die steuerliche EÜR-Vorbereitung.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/impressum" className="text-anthracite-300 hover:text-white text-sm transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-anthracite-300 hover:text-white text-sm transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2 text-anthracite-300 text-sm">
              <li>E-Mail: kontakt@bueroklarnie.de</li>
              <li>Telefon: +49 30 12345678</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-blue-700">
          <div className="bg-dark-blue-800 p-4 rounded-lg mb-6">
            <p className="text-xs text-anthracite-300 leading-relaxed">
              <strong className="text-white">Wichtiger Hinweis:</strong> BüroKlarNie bietet ausschließlich organisatorische Dienstleistungen zur Vorbereitung steuerlicher Unterlagen an. Wir erteilen keine steuerliche oder rechtliche Beratung. Die endgültige steuerliche Einordnung und Prüfung Ihrer Unterlagen sollte durch einen qualifizierten Steuerberater erfolgen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-anthracite-400 text-sm">
              © {new Date().getFullYear()} BüroKlarNie. Alle Rechte vorbehalten.
            </p>
            <p className="text-anthracite-400 text-xs">
              Keine Steuerberatung – Nur organisatorische Vorbereitung
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
