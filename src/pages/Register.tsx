import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileCheck, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName, companyName);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Diese E-Mail-Adresse ist bereits registriert.');
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-anthracite-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2">
            <FileCheck className="w-10 h-10 text-petrol-600" />
            <span className="text-2xl font-bold text-dark-blue-900">BüroKlarNie</span>
          </Link>
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-anthracite-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-dark-blue-900 mb-2">Registrierung erfolgreich!</h2>
            <p className="text-anthracite-600 mb-6">
              Bitte überprüfen Sie Ihre E-Mails und bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 transition-colors"
            >
              Zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2">
          <FileCheck className="w-10 h-10 text-petrol-600" />
          <span className="text-2xl font-bold text-dark-blue-900">BüroKlarNie</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-dark-blue-900">
          Konto erstellen
        </h2>
        <p className="mt-2 text-center text-sm text-anthracite-600">
          Oder{' '}
          <Link to="/login" className="font-medium text-petrol-600 hover:text-petrol-500">
            mit bestehendem Konto anmelden
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-anthracite-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-dark-blue-900">
                  Vor- und Nachname *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-anthracite-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-anthracite-200 rounded-lg placeholder-anthracite-400 focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent text-dark-blue-900"
                    placeholder="Max Mustermann"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-dark-blue-900">
                  Firmenname
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-anthracite-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-anthracite-200 rounded-lg placeholder-anthracite-400 focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent text-dark-blue-900"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-blue-900">
                E-Mail-Adresse *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-anthracite-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-anthracite-200 rounded-lg placeholder-anthracite-400 focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent text-dark-blue-900"
                  placeholder="ihre@email.de"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-blue-900">
                Passwort *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-anthracite-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-anthracite-200 rounded-lg placeholder-anthracite-400 focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent text-dark-blue-900"
                  placeholder="Mind. 6 Zeichen"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-blue-900">
                Passwort bestätigen *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-anthracite-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-anthracite-200 rounded-lg placeholder-anthracite-400 focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent text-dark-blue-900"
                  placeholder="Passwort wiederholen"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-petrol-600 hover:bg-petrol-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-petrol-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Wird erstellt...' : 'Konto erstellen'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="bg-anthracite-50 p-4 rounded-lg">
              <p className="text-xs text-anthracite-600 text-center">
                Mit der Registrierung stimmen Sie unseren{' '}
                <Link to="/datenschutz" className="text-petrol-600 hover:underline">
                  Datenschutzbestimmungen
                </Link>{' '}
                zu.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-dark-blue-50 p-4 rounded-lg border border-dark-blue-100">
              <p className="text-xs text-anthracite-700 text-center font-medium">
                Wichtiger Hinweis: BüroKlarNie bietet keine steuerliche oder rechtliche Beratung.
                Professionelle Vorbereitung Ihrer Belege für die Steuererklärung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
