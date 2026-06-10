import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({ name, email, subject, message });

    if (dbError) {
      setError('Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-anthracite-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl border border-anthracite-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-dark-blue-900 mb-2">Nachricht gesendet!</h1>
            <p className="text-anthracite-600 mb-6">
              Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-blue-900 mb-4">Kontakt</h1>
          <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
            Haben Sie Fragen zu unseren Services? Kontaktieren Sie uns – wir helfen Ihnen gerne weiter.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-petrol-600" />
              </div>
              <h3 className="font-semibold text-dark-blue-900 mb-2">E-Mail</h3>
              <a href="mailto:kontakt@bueroklarnie.de" className="text-petrol-600 hover:text-petrol-700 transition-colors">
                kontakt@bueroklarnie.de
              </a>
            </div>
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-petrol-600" />
              </div>
              <h3 className="font-semibold text-dark-blue-900 mb-2">Telefon</h3>
              <a href="tel:+493012345678" className="text-petrol-600 hover:text-petrol-700 transition-colors">
                +49 30 12345678
              </a>
              <p className="text-sm text-anthracite-500 mt-1">Mo–Fr: 9:00 – 17:00 Uhr</p>
            </div>
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <div className="w-12 h-12 bg-petrol-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-petrol-600" />
              </div>
              <h3 className="font-semibold text-dark-blue-900 mb-2">Adresse</h3>
              <p className="text-anthracite-600">BüroKlarNie<br />Musterstraße 123<br />10115 Berlin</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-anthracite-200 p-6">
              <h2 className="text-xl font-semibold text-dark-blue-900 mb-6">Nachricht senden</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark-blue-900 mb-2">Name *</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark-blue-900 mb-2">E-Mail *</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-dark-blue-900 mb-2">Betreff *</label>
                  <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-dark-blue-900 mb-2">Nachricht *</label>
                  <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
                    className="w-full px-4 py-3 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500 focus:border-transparent resize-none" required />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />Wird gesendet...</>
                    ) : (
                      <><Send className="w-5 h-5" />Nachricht senden</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <p className="text-sm text-anthracite-600 text-center">
            <strong>Hinweis:</strong> BüroKlarNie bietet keine steuerliche oder rechtliche Beratung.
            Bei Fragen zu Ihrem konkreten Steuerfall wenden Sie sich bitte an einen qualifizierten Steuerberater.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
