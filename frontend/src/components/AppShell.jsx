import { Link, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../auth'

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen app-bg flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-purple-500/15 bg-[#0b0e1e]/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <Shield size={16} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Clause<span className="text-gradient-purple font-extrabold">Guard</span>
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 text-xs">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                {user.name}
              </div>
              <button 
                onClick={onLogout} 
                className="btn-secondary !py-1.5 !px-3 text-xs"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 px-6 py-6 mt-14 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>ClauseGuard — Document Analysis & Risk Assessment</p>
          <p className="text-purple-400/60 font-medium">28 Indian Acts Reference</p>
        </div>
      </footer>
    </div>
  )
}
