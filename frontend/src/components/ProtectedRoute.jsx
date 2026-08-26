import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function ProtectedRoute({ children, needSetup = false }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen app-bg flex items-center justify-center text-stone-400">Loading…</div>
  }
  if (!user) return <Navigate to="/" replace />
  if (needSetup && !user.profile_complete) return <Navigate to="/setup" replace />
  if (!needSetup && user.profile_complete && window.location.pathname === '/setup') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
