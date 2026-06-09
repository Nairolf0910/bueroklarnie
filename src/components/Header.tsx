import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-anthracite-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <FileCheck className="w-8 h-8 text-petrol-600" />
            <span className="text-xl font-semibold text-dark-blue-900">BüroKlarNie</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-petrol-600' : 'text-anthracite-600 hover:text-dark-blue-900'}`}
            >
              Startseite
            </Link>
            <Link
              to="/kontakt"
              className={`text-sm font-medium transition-colors ${isActive('/kontakt') ? 'text-petrol-600' : 'text-anthracite-600 hover:text-dark-blue-900'}`}
            >
              Kontakt
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-petrol-600' : 'text-anthracite-600 hover:text-dark-blue-900'}`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-anthracite-600 hover:text-dark-blue-900 transition-colors"
                >
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-anthracite-600 hover:text-dark-blue-900 transition-colors"
                >
                  Anmelden
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium hover:bg-petrol-700 transition-colors"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-anthracite-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-anthracite-100">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className={`text-sm font-medium ${isActive('/') ? 'text-petrol-600' : 'text-anthracite-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Startseite
              </Link>
              <Link
                to="/kontakt"
                className={`text-sm font-medium ${isActive('/kontakt') ? 'text-petrol-600' : 'text-anthracite-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium ${isActive('/dashboard') ? 'text-petrol-600' : 'text-anthracite-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm font-medium text-anthracite-600 text-left"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-anthracite-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
