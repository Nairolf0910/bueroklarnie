import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('E-Mail oder Passwort ist falsch.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-anthracite-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2">
          <FileCheck className="w-10 h-10 text-petrol-600" />
          <span className="text-2xl font-bold text-dark-blue-900">BüroKlarNie</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-dark-blue-900">
          Bei Ihrem Konto anmelden
        </h2>
        <p className="mt-2 text-center text-sm text-anthracite-600">
          Oder{' '}
          <Link to="/register" className="font-medium text-petrol-600 hover:text-petrol-500">
            ein neues Konto erstellen
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-blue-900">
                E-Mail-Adresse
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
                Passwort
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-anthracite-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-anthracite-200 rounded-lg placeholder-anthracite-400 focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent text-dark-blue-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-petrol-600 hover:bg-petrol-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-petrol-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Wird angemeldet...' : 'Anmelden'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="bg-anthracite-50 p-4 rounded-lg">
              <p className="text-xs text-anthracite-600 text-center">
                <strong>Hinweis:</strong> Dieser Dienst bietet keine steuerliche Beratung.
                Professionelle Beleg-Organisation für Selbstständige.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
