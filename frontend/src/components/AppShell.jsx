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
    <div className="min-h-screen app-bg flex flex-col selection:bg-[#d4af37]/30 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070a10]/80 backdrop-blur-xl px-6 py-3.5 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b89125] text-[#070a10] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
              <Shield size={17} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                ClauseGuard
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                  AI Legal
                </span>
              </span>
            </div>
          </Link>

          {user && (
            <div className="flex items-center gap-3.5 text-sm">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-300">
                  {user.name?.split(' ')[0]}
                </span>
              </div>
              <button 
                onClick={onLogout} 
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/[0.06]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#070a10]/40 backdrop-blur-sm px-6 py-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left leading-relaxed">
            ClauseGuard is an AI reading aid for awareness. Not formal legal advice.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Llama 3.3 & 28 Indian Acts</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

