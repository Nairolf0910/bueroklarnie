import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  MessageCircle,
  ClipboardList,
  FileCheck,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Settings,
  Mail,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const navigation = [
  { name: 'Dashboard',  href: '/admin',            icon: LayoutDashboard, exact: true },
  { name: 'Kunden',     href: '/admin/kunden',      icon: Users },
  { name: 'Aufträge',   href: '/admin/auftraege',   icon: FileText },
  { name: 'Dateien',    href: '/admin/dateien',     icon: Upload },
  { name: 'Kontakte',   href: '/admin/kontakte',    icon: Mail },
  { name: 'Notizen',    href: '/admin/notizen',     icon: MessageCircle },
  { name: 'Aufgaben',   href: '/admin/aufgaben',    icon: ClipboardList },
  { name: 'FAQ',        href: '/admin/faq',         icon: HelpCircle },
  { name: 'Inhalte',    href: '/admin/inhalte',     icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [neuCount, setNeuCount]       = useState(0);
  const { signOut } = useAuth();

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'neu')
      .then(({ count }) => setNeuCount(count ?? 0));
  }, []);

  return (
    <div className="min-h-screen bg-anthracite-100">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-dark-blue-900 text-white z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-blue-700">
          <div className="flex items-center gap-2">
            <FileCheck className="w-8 h-8 text-petrol-400" />
            <span className="font-semibold">BüroKlarNie</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-dark-blue-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-petrol-600 text-white'
                    : 'text-anthracite-300 hover:bg-dark-blue-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.name === 'Kontakte' && neuCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-petrol-400 text-white text-xs font-bold">
                  {neuCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-blue-700">
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-anthracite-300 hover:bg-dark-blue-700 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Abmelden
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-anthracite-200 h-16 flex items-center px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-anthracite-100">
            <Menu className="w-5 h-5 text-anthracite-600" />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-dark-blue-900">Admin Dashboard</h1>
          </div>
          <div className="ml-auto">
            <span className="text-sm text-anthracite-500">Internes Backoffice</span>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
