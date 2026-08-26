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
      {/* Navigation Header */}
      <header className="border-b border-[#222226] bg-[#09090b]/90 backdrop-blur-md px-6 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition-colors">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 flex items-center justify-center">
              <Shield size={15} />
            </div>
            <span className="font-semibold text-sm tracking-tight">ClauseGuard</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-400 hidden sm:inline">{user.name}</span>
              <button 
                onClick={onLogout} 
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#222226] px-6 py-6 mt-12 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>ClauseGuard — Document Analysis & Risk Assessment</p>
          <p className="text-zinc-600">Indian Legal Framework Reference</p>
        </div>
      </footer>
    </div>
  )
}
