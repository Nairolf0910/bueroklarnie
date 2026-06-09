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
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Kunden', href: '/admin/kunden', icon: Users },
  { name: 'Aufträge', href: '/admin/auftraege', icon: FileText },
  { name: 'Dateien', href: '/admin/dateien', icon: Upload },
  { name: 'Notizen', href: '/admin/notizen', icon: MessageCircle },
  { name: 'Aufgaben', href: '/admin/aufgaben', icon: ClipboardList },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-anthracite-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-dark-blue-900 text-white z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-blue-700">
          <div className="flex items-center gap-2">
            <FileCheck className="w-8 h-8 text-petrol-400" />
            <span className="font-semibold">BüroKlarNie</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-dark-blue-700"
          >
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
              <item.icon className="w-5 h-5" />
              {item.name}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-anthracite-200 h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-anthracite-100"
          >
            <Menu className="w-5 h-5 text-anthracite-600" />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-dark-blue-900">Admin Dashboard</h1>
          </div>
          <div className="ml-auto">
            <span className="text-sm text-anthracite-500">Internes Backoffice</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
