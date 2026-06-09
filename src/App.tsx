import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Requests } from './pages/Requests';
import { NewRequest } from './pages/NewRequest';
import { RequestDetail } from './pages/RequestDetail';
import { Contact } from './pages/Contact';
import { Impressum } from './pages/Impressum';
import { Datenschutz } from './pages/Datenschutz';

// Admin imports
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminKunden } from './admin/pages/AdminKunden';
import { AdminKundeDetail } from './admin/pages/AdminKundeDetail';
import { AdminAuftraege } from './admin/pages/AdminAuftraege';
import { AdminAuftragDetail } from './admin/pages/AdminAuftragDetail';
import { AdminDateien } from './admin/pages/AdminDateien';
import { AdminNotizen } from './admin/pages/AdminNotizen';
import { AdminAufgaben } from './admin/pages/AdminAufgaben';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Public routes with header/footer */}
            <Route path="/" element={<><Header /><main className="flex-1"><Landing /></main><Footer /></>} />
            <Route path="/kontakt" element={<><Header /><main className="flex-1"><Contact /></main><Footer /></>} />
            <Route path="/impressum" element={<><Header /><main className="flex-1"><Impressum /></main><Footer /></>} />
            <Route path="/datenschutz" element={<><Header /><main className="flex-1"><Datenschutz /></main><Footer /></>} />

            {/* Auth routes without normal header/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected client routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <main className="flex-1">
                      <Dashboard />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <main className="flex-1">
                      <Upload />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <main className="flex-1">
                      <Requests />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <main className="flex-1">
                      <RequestDetail />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/request/new"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <main className="flex-1">
                      <NewRequest />
                    </main>
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="kunden" element={<AdminKunden />} />
              <Route path="kunden/:id" element={<AdminKundeDetail />} />
              <Route path="auftraege" element={<AdminAuftraege />} />
              <Route path="auftraege/:id" element={<AdminAuftragDetail />} />
              <Route path="dateien" element={<AdminDateien />} />
              <Route path="notizen" element={<AdminNotizen />} />
              <Route path="aufgaben" element={<AdminAufgaben />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
