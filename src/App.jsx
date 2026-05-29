import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import PrintersPage from './pages/PrintersPage'
import ArtikelsPage from './pages/ArtikelsPage'
import MaterialenPage from './pages/MaterialenPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Laden…</span>
      </div>
    </div>
  )
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/printers" element={<ProtectedRoute><PrintersPage /></ProtectedRoute>} />
          <Route path="/artikelen" element={<ProtectedRoute><ArtikelsPage /></ProtectedRoute>} />
          <Route path="/materialen" element={<ProtectedRoute><MaterialenPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
