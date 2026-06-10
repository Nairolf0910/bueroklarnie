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
  Users,
  Star,
  Zap,
  Lock,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Briefcase,
  Building2,
  Send,
  Flag,
  Cloud,
  Upload,
  Loader2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { FaqEntry, ProcessStep, TrustItem, PricingPlan } from '../types/database';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Upload,
  FileText,
  FileCheck,
  ClipboardCheck,
  CheckCircle,
  Shield,
  Flag,
  Cloud,
  UserCheck,
  Send,
  TrendingUp,
};

const stats = [
  { value: '500+', label: 'Zufriedene Kunden' },
  { value: '50.000+', label: 'Bearbeitete Belege' },
  { value: '99%', label: 'Kundenzufriedenheit' },
  { value: '3 Tage', label: 'Durchschn. Bearbeitung' },
];

const targetGroups = [
  {
    icon: Briefcase,
    title: 'Solo-Selbstständige',
    description: 'Freelancer, Berater undSolo-Unternehmer, die ihre Belege effizient organisieren möchten.',
    features: ['Zeitersparnis', 'Professionelle Aufbereitung', 'Keine Buchhaltungskenntnisse nötig'],
  },
  {
    icon: Building2,
    title: 'Kleingewerbetreibende',
    description: 'Inhaber kleiner Gewerbebetriebe mit begrenztem administrativem Personal.',
    features: ['Übersichtliche Struktur', 'Vorbereitung für den Steuerberater', 'Audit-sichere Dokumentation'],
  },
  {
    icon: Users,
    title: 'Neue Selbstständige',
    description: 'Existenzgründer, die von Anfang an eine saubere Belegführung etablieren möchten.',
    features: ['Schneller Einstieg', 'Best-Practices', 'Vermeidung typischer Fehler'],
  },
];

const deliverables = [
  {
    icon: FileText,
    title: 'Kategorisierte Belegliste',
    description: 'Alle Belege chronologisch und nach Kategorien sortiert in einer übersichtlichen Tabelle.',
  },
  {
    icon: ClipboardCheck,
    title: 'Vollständigkeitsbericht',
    description: 'Übersicht über fehlende Belege, Unstimmigkeiten oder Optimierungspotenzial.',
  },
  {
    icon: TrendingUp,
    title: 'EÜR-vorbereitete Daten',
    description: 'Exportformat, das der Steuerberater direkt übernehmen kann.',
  },
  {
    icon: FileCheck,
    title: 'Digitale Archivierung',
    description: 'Alle Dokumente sicher gespeichert und jederzeit abrufbar.',
  },
];

export function Landing() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [trustItems, setTrustItems] = useState<TrustItem[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [faqRes, stepsRes, trustRes, pricingRes] = await Promise.all([
        supabase.from('faq_entries').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('process_steps').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('trust_items').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('pricing_plans').select('*').eq('is_active', true).order('sort_order'),
      ]);

      if (faqRes.data) setFaqs(faqRes.data);
      if (stepsRes.data) setProcessSteps(stepsRes.data);
      if (trustRes.data) setTrustItems(trustRes.data);
      if (pricingRes.data) setPricingPlans(pricingRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || FileText;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-anthracite-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <FileCheck className="w-8 h-8 text-petrol-600" />
              <span className="text-xl font-bold text-dark-blue-900">BüroKlarNie</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#leistungen" className="text-sm text-anthracite-600 hover:text-dark-blue-900 transition-colors">
                Leistungen
              </a>
              <a href="#so-funktionierts" className="text-sm text-anthracite-600 hover:text-dark-blue-900 transition-colors">
                Ablauf
              </a>
              <a href="#preis" className="text-sm text-anthracite-600 hover:text-dark-blue-900 transition-colors">
                Preise
              </a>
              <a href="#faq" className="text-sm text-anthracite-600 hover:text-dark-blue-900 transition-colors">
                FAQ
              </a>
              <a href="#kontakt" className="text-sm text-anthracite-600 hover:text-dark-blue-900 transition-colors">
                Kontakt
              </a>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 text-sm font-medium text-anthracite-600 hover:text-dark-blue-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-anthracite-50 rounded-lg">
                    <span className="text-sm text-dark-blue-900">{profile?.full_name?.split(' ')[0] || 'Kunde'}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg hover:bg-anthracite-100 text-anthracite-600 hover:text-dark-blue-900 transition-colors"
                    title="Abmelden"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block text-sm font-medium text-anthracite-600 hover:text-dark-blue-900 transition-colors"
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium hover:bg-petrol-700 transition-colors shadow-sm"
                  >
                    Registrieren
                  </Link>
                </>
              )}
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-anthracite-50 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-anthracite-100">
              <div className="flex flex-col gap-4">
                <a href="#leistungen" className="text-sm font-medium text-anthracite-600" onClick={() => setMobileMenuOpen(false)}>
                  Leistungen
                </a>
                <a href="#so-funktionierts" className="text-sm font-medium text-anthracite-600" onClick={() => setMobileMenuOpen(false)}>
                  Ablauf
                </a>
                <a href="#preis" className="text-sm font-medium text-anthracite-600" onClick={() => setMobileMenuOpen(false)}>
                  Preise
                </a>
                <a href="#faq" className="text-sm font-medium text-anthracite-600" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-sm font-medium text-anthracite-600" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm font-medium text-anthracite-600 text-left"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-anthracite-600" onClick={() => setMobileMenuOpen(false)}>
                      Anmelden
                    </Link>
                    <Link to="/register" className="px-4 py-2 bg-petrol-600 text-white rounded-lg text-sm font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                      Registrieren
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-dark-blue-900 via-dark-blue-800 to-petrol-900 text-white overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-petrol-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-dark-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' } as React.CSSProperties} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-petrol-200 mb-6">
                <Zap className="w-4 h-4" />
                Für Selbstständige in Deutschland
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Belege perfekt
                <span className="block text-petrol-400">organisiert & geprüft</span>
              </h1>
              <p className="text-xl text-anthracite-300 mb-8 leading-relaxed max-w-xl">
                Wir bereiten Ihre Rechnungen und Quittungen strukturiert vor – die ideale Grundlage
                für Ihre EÜR oder die Übergabe an den Steuerberater.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-petrol-500 hover:bg-petrol-600 text-white rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-petrol-500/25"
                >
                  Jetzt starten
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#leistungen"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg font-semibold transition-all border border-white/20"
                >
                  Mehr erfahren
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-anthracite-300">
                {trustItems.slice(0, 3).map((item, idx) => {
                  const IconComponent = getIcon(item.icon);
                  return (
                    <div key={item.id || idx} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                      <IconComponent className="w-4 h-4 text-petrol-400" />
                      <span>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side - Visual Element */}
            <div className={`hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-petrol-500 to-dark-blue-500 rounded-3xl blur-2xl opacity-30" />
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-petrol-500/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-petrol-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Belege organisiert</p>
                        <p className="text-anthracite-400 text-sm">Kategorisiert & geprüft</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-petrol-500/30 rounded-lg flex items-center justify-center">
                        <ClipboardCheck className="w-6 h-6 text-petrol-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Vollständigkeitsprüfung</p>
                        <p className="text-anthracite-400 text-sm">Alle Angaben korrekt</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-petrol-500/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-petrol-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">EÜR-vorbereitet</p>
                        <p className="text-anthracite-400 text-sm">Bereit für den Berater</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#stats" className="text-white/50 hover:text-white/80 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-white border-b border-anthracite-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-dark-blue-900 mb-2">{stat.value}</p>
                <p className="text-anthracite-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-anthracite-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
              Das Problem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Kennen Sie diese Situationen?
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Als Selbstständiger haben Sie alle Hände voll zu tun. Die Beleg-Organisation bleibt oft bis zum Schluss liegen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-anthracite-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">Fehlende oder fehlerhafte Rechnungen</h3>
              <p className="text-anthracite-600 leading-relaxed">
                Nicht alle Ausgaben sind korrekt dokumentiert. Fehlende Angaben machen die Zuordnung für den Steuerberater schwierig.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-anthracite-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">Unstrukturierte Belegsammlung</h3>
              <p className="text-anthracite-600 leading-relaxed">
                Quittungen, Rechnungen und Bankauszüge liegen unsortiert vor. Der Überblick geht verloren und wichtige Dokumente fehlen.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-anthracite-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">Stress vor Abgabefristen</h3>
              <p className="text-anthracite-600 leading-relaxed">
                Kurz vor der Frist beginnt hektisches Sortieren. Fehler schleichen sich ein, der Steuerberater wartet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section id="so-funktionierts" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-petrol-100 text-petrol-700 rounded-full text-sm font-medium mb-4">
              So funktioniert's
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Einfacher als Sie denken
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Unser Prozess ist transparent und auf Sie zugeschnitten.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-petrol-200 via-petrol-400 to-petrol-200" />

            {processSteps.map((step, index) => {
              const IconComponent = getIcon(step.icon);
              return (
                <div key={step.id || index} className="relative">
                  <div className="bg-anthracite-50 rounded-2xl p-6 text-center hover:bg-petrol-50 transition-colors border border-transparent hover:border-petrol-200 group">
                    <div className="w-10 h-10 bg-petrol-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg shadow-petrol-500/25">
                      {index + 1}
                    </div>
                    <IconComponent className="w-10 h-10 text-petrol-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-dark-blue-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-anthracite-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="leistungen" className="py-20 bg-anthracite-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-petrol-100 text-petrol-700 rounded-full text-sm font-medium mb-4">
              Unsere Leistungen
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Professionelle Beleg-Organisation
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Alles aus einer Hand – ohne Steuerberatung, mit voller Transparenz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-anthracite-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-petrol-50 rounded-bl-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-petrol-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-petrol-200 transition-colors">
                  <FileText className="w-8 h-8 text-petrol-600" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-900 mb-4">Beleg-Organisation</h3>
                <p className="text-anthracite-600 mb-6 leading-relaxed">
                  Sortierung und Kategorisierung Ihrer Rechnungen, Quittungen und Bankauszüge nach Datum und Art.
                </p>
                <ul className="text-sm text-anthracite-600 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Chronologische Ordnung
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Kategorienbildung
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Auffinden von Lücken
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-anthracite-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-petrol-50 rounded-bl-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-petrol-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-petrol-200 transition-colors">
                  <ClipboardCheck className="w-8 h-8 text-petrol-600" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-900 mb-4">Plausibilitätsprüfung</h3>
                <p className="text-anthracite-600 mb-6 leading-relaxed">
                  Überprüfung Ihrer Belege auf formale Richtigkeit, Vollständigkeit und Nachvollziehbarkeit.
                </p>
                <ul className="text-sm text-anthracite-600 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Formale Prüfung
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Konsistenz-Check
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Rückmeldung bei Auffälligkeiten
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-anthracite-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-petrol-50 rounded-bl-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-petrol-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-petrol-200 transition-colors">
                  <TrendingUp className="w-8 h-8 text-petrol-600" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-900 mb-4">EÜR-Vorbereitung</h3>
                <p className="text-anthracite-600 mb-6 leading-relaxed">
                  Aufbereitung Ihrer Belege für die Einnahmen-Überschuss-Rechnung oder die Übergabe an Ihren Steuerberater.
                </p>
                <ul className="text-sm text-anthracite-600 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Strukturierte Ausgabe
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Kopie-fertig aufbereitet
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0" />
                    Zeitsparend für den Berater
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-dark-blue-100 text-dark-blue-700 rounded-full text-sm font-medium mb-4">
              Für wen?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Unsere Zielgruppe
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Speziell entwickelt für Selbstständige, die Wert auf strukturierte Belegführung legen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {targetGroups.map((group, index) => (
              <div key={index} className="bg-anthracite-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-transparent hover:border-petrol-200 group">
                <group.icon className="w-12 h-12 text-petrol-600 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-dark-blue-900 mb-3">{group.title}</h3>
                <p className="text-anthracite-600 mb-6 leading-relaxed">{group.description}</p>
                <ul className="space-y-2">
                  {group.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-anthracite-600">
                      <CheckCircle className="w-4 h-4 text-petrol-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-20 bg-gradient-to-br from-dark-blue-50 to-petrol-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-petrol-100 text-petrol-700 rounded-full text-sm font-medium mb-4">
              Das erhalten Sie
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Ihre Lieferergebnisse
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
             Transparent und nachvollziehbar – so sehen Ihre aufbereiteten Unterlagen aus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliverables.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-anthracite-100">
                <div className="w-12 h-12 bg-petrol-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-petrol-600" />
                </div>
                <h3 className="text-lg font-semibold text-dark-blue-900 mb-2">{item.title}</h3>
                <p className="text-sm text-anthracite-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              Vertrauen
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Warum uns vertrauen?
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Sicherheit und Transparenz stehen bei uns an erster Stelle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item, index) => {
              const IconComponent = getIcon(item.icon);
              return (
                <div key={item.id || index} className="bg-anthracite-50 rounded-2xl p-6 text-center hover:bg-petrol-50 transition-colors group">
                  <div className="w-14 h-14 bg-petrol-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7 text-petrol-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-blue-900 mb-2">{item.title}</h3>
                  {item.description && <p className="text-sm text-anthracite-600">{item.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="preis" className="py-20 bg-anthracite-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-petrol-100 text-petrol-700 rounded-full text-sm font-medium mb-4">
              Transparente Preise
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Wählen Sie Ihr Paket
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto">
              Alle Preise sind Netto-Preise. Individuelle Anpassungen auf Anfrage möglich.
            </p>
          </div>

          {pricingPlans.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div
                  key={plan.id || index}
                  className={`rounded-2xl p-8 flex flex-col relative overflow-hidden ${
                    plan.is_featured
                      ? 'bg-dark-blue-900 text-white transform scale-105 shadow-xl'
                      : 'bg-white border border-anthracite-200 hover:border-petrol-300 transition-colors'
                  }`}
                >
                  {plan.is_featured && (
                    <>
                      <div className="absolute top-0 right-0 w-40 h-40 bg-petrol-500/20 rounded-bl-full" />
                      <div className="absolute -top-4 -right-4 bg-petrol-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                        Beliebt
                      </div>
                    </>
                  )}
                  <div className="relative mb-6">
                    <h3 className={`text-xl font-semibold mb-2 ${plan.is_featured ? 'text-white' : 'text-dark-blue-900'}`}>
                      {plan.name}
                    </h3>
                    {plan.subtitle && (
                      <p className={plan.is_featured ? 'text-anthracite-300' : 'text-anthracite-600'}>
                        {plan.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="relative mb-6">
                    <span className={`text-5xl font-bold ${plan.is_featured ? 'text-white' : 'text-dark-blue-900'}`}>
                      {plan.price_text}
                    </span>
                  </div>
                  {plan.description && (
                    <p className={`text-sm mb-6 ${plan.is_featured ? 'text-anthracite-300' : 'text-anthracite-600'}`}>
                      {plan.description}
                    </p>
                  )}
                  <ul className="space-y-3 mb-8 flex-1 relative">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-start gap-3 ${plan.is_featured ? 'text-anthracite-200' : 'text-anthracite-600'}`}>
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.is_featured ? 'text-petrol-400' : 'text-petrol-600'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`relative block w-full py-3 px-6 text-center rounded-xl font-semibold transition-colors ${
                      plan.is_featured
                        ? 'bg-petrol-500 hover:bg-petrol-600 text-white'
                        : 'border-2 border-petrol-600 text-petrol-600 hover:bg-petrol-50'
                    }`}
                  >
                    Anfragen
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Default pricing if no data */}
              <div className="bg-white rounded-2xl p-8 border border-anthracite-200 hover:border-petrol-300 transition-colors flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Basis</h3>
                  <p className="text-anthracite-600">Für den gelegentlichen Bedarf</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-dark-blue-900">79 €</span>
                  <span className="text-anthracite-500 ml-2">netto</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Bis 50 Belege</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Grundlegende Sortierung</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Plausibilitätsprüfung</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Übersicht als PDF</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="block w-full py-3 px-6 text-center border-2 border-petrol-600 text-petrol-600 rounded-xl font-semibold hover:bg-petrol-50 transition-colors"
                >
                  Anfragen
                </Link>
              </div>

              <div className="bg-dark-blue-900 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col transform scale-105 shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-petrol-500/20 rounded-bl-full" />
                <div className="absolute -top-4 -right-4 bg-petrol-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  Beliebt
                </div>
                <div className="relative mb-6">
                  <h3 className="text-xl font-semibold mb-2">Standard</h3>
                  <p className="text-anthracite-300">Für den regelmäßigen Bedarf</p>
                </div>
                <div className="relative mb-6">
                  <span className="text-5xl font-bold">149 €</span>
                  <span className="text-anthracite-400 ml-2">netto</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 relative">
                  <li className="flex items-start gap-3 text-anthracite-200">
                    <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0 mt-0.5" />
                    <span>Bis 150 Belege</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-200">
                    <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0 mt-0.5" />
                    <span>Detaillierte Kategorisierung</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-200">
                    <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0 mt-0.5" />
                    <span>Ausführliche Prüfung</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-200">
                    <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0 mt-0.5" />
                    <span>Bericht mit Optimierungshinweisen</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-200">
                    <CheckCircle className="w-5 h-5 text-petrol-400 flex-shrink-0 mt-0.5" />
                    <span>Priorisierte Bearbeitung</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="relative block w-full py-3 px-6 text-center bg-petrol-500 hover:bg-petrol-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Anfragen
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-anthracite-200 hover:border-petrol-300 transition-colors flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">Premium</h3>
                  <p className="text-anthracite-600">Für umfassende Anforderungen</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-dark-blue-900">279 €</span>
                  <span className="text-anthracite-500 ml-2">netto</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Unbegrenzte Belege</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Komplette EÜR-Vorbereitung</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Persönlicher Ansprechpartner</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Express-Bearbeitung</span>
                  </li>
                  <li className="flex items-start gap-3 text-anthracite-600">
                    <CheckCircle className="w-5 h-5 text-petrol-600 flex-shrink-0 mt-0.5" />
                    <span>Telefonische Abstimmung</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="block w-full py-3 px-6 text-center border-2 border-petrol-600 text-petrol-600 rounded-xl font-semibold hover:bg-petrol-50 transition-colors"
                >
                  Anfragen
                </Link>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-anthracite-500 mt-8">
            Alle Preise zzgl. MwSt. Individuelle Anpassungen auf Anfrage möglich.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-petrol-100 text-petrol-700 rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-4">
              Häufige Fragen
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className={`bg-anthracite-50 rounded-2xl overflow-hidden transition-all ${
                    openFaq === index ? 'ring-2 ring-petrol-500' : ''
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-anthracite-100 transition-colors"
                  >
                    <span className="font-semibold text-dark-blue-900 flex items-center gap-3">
                      <HelpCircle className={`w-5 h-5 flex-shrink-0 ${openFaq === index ? 'text-petrol-600' : 'text-anthracite-400'}`} />
                      {faq.question}
                    </span>
                    <span className={`text-xl font-light ${openFaq === index ? 'text-petrol-600 rotate-180' : 'text-anthracite-400'} transition-transform`}>
                      ↓
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-anthracite-600 leading-relaxed pl-8">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-anthracite-500 py-8">
                Keine FAQs verfügbar
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-20 bg-anthracite-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="inline-block px-4 py-2 bg-petrol-100 text-petrol-700 rounded-full text-sm font-medium mb-4">
                Kontakt
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-blue-900 mb-6">
                Haben Sie Fragen?
              </h2>
              <p className="text-lg text-anthracite-600 mb-8 leading-relaxed">
                Wir sind für Sie da. Kontaktieren Sie uns bei Fragen zu unseren Services –
                wir helfen Ihnen gerne weiter.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-petrol-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-petrol-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-blue-900">E-Mail</p>
                    <a href="mailto:kontakt@bueroklarnie.de" className="text-petrol-600 hover:text-petrol-700 transition-colors">
                      kontakt@bueroklarnie.de
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-petrol-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-petrol-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-blue-900">Telefon</p>
                    <a href="tel:+493012345678" className="text-petrol-600 hover:text-petrol-700 transition-colors">
                      +49 30 12345678
                    </a>
                    <p className="text-sm text-anthracite-500 mt-1">Mo–Fr: 9:00 – 17:00 Uhr</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-petrol-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-petrol-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-blue-900">Adresse</p>
                    <p className="text-anthracite-600">
                      BüroKlarNie<br />
                      Musterstraße 123<br />
                      10115 Berlin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-anthracite-100">
              <Link
                to="/kontakt"
                className="block h-full flex flex-col items-center justify-center text-center group"
              >
                <div className="w-20 h-20 bg-petrol-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-petrol-200 transition-colors">
                  <MessageCircle className="w-10 h-10 text-petrol-600" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-900 mb-2">
                  Nachricht senden
                </h3>
                <p className="text-anthracite-600 mb-6">
                  Nutzen Sie unser Kontaktformular für eine schnelle Antwort.
                </p>
                <span className="inline-flex items-center gap-2 text-petrol-600 font-medium group-hover:gap-4 transition-all">
                  Zum Kontaktformular
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-dark-blue-900 via-dark-blue-800 to-petrol-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-petrol-200 mb-6">
            <Zap className="w-4 h-4" />
            Jetzt starten
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Bereit für mehr Ordnung<br />in Ihren Belegen?
          </h2>
          <p className="text-xl text-anthracite-300 mb-8 max-w-2xl mx-auto">
            Starten Sie jetzt mit einer kostenlosen Erstberatung und erleben Sie,
            wie einfach Beleg-Organisation sein kann.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-petrol-500 hover:bg-petrol-600 text-white rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Jetzt registrieren
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg font-semibold transition-all border border-white/20"
            >
              Kontakt aufnehmen
            </Link>
          </div>
          <p className="mt-8 text-sm text-anthracite-400">
            Keine versteckten Kosten – Keine steuerliche Beratung – Transparente Preise
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-8 h-8 text-petrol-400" />
                <span className="text-xl font-bold">BüroKlarNie</span>
              </div>
              <p className="text-anthracite-400 text-sm leading-relaxed">
                Professionelle Beleg-Organisation für Selbstständige in Deutschland.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-anthracite-400">
                <li><a href="#leistungen" className="hover:text-white transition-colors">Leistungen</a></li>
                <li><a href="#so-funktionierts" className="hover:text-white transition-colors">Ablauf</a></li>
                <li><a href="#preis" className="hover:text-white transition-colors">Preise</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#kontakt" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-anthracite-400">
                <li><Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-anthracite-400">
                <li>kontakt@bueroklarnie.de</li>
                <li>+49 30 12345678</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-dark-blue-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-anthracite-400 text-sm">
              © {new Date().getFullYear()} BüroKlarNie. Alle Rechte vorbehalten.
            </p>
            <div className="bg-dark-blue-800 p-3 rounded-lg">
              <p className="text-xs text-anthracite-400">
                Hinweis: Keine steuerliche oder rechtliche Beratung.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
