import { Link, useNavigate } from 'react-router-dom'
import { Shield, BookOpen, GitCompare, FileText, Lock, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../auth'
import ClauseGuardLogo from './ClauseGuardLogo'

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  return (
    <div className="min-h-screen app-bg flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-purple-500/15 bg-[#0b0e1e]/85 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3.5 group">
            <ClauseGuardLogo size={46} className="group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]" />
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              Clause<span className="text-gradient-purple font-black">Guard</span>
            </span>
          </Link>


          {/* User Profile & Action */}
          {user && (
            <div className="flex items-center gap-2">
              <Link 
                to="/profile" 
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-xl bg-white/[0.04] hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 shadow-sm backdrop-blur-sm transition-all group"
                title="View Profile & Security Settings"
              >
                {user.avatar && user.avatar.startsWith('data:image') ? (
                  <img 
                    src={user.avatar} 
                    alt="User" 
                    className="w-6 h-6 rounded-lg object-cover border border-purple-400/40" 
                  />
                ) : user.avatar ? (
                  <span className="text-sm">{user.avatar}</span>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-inner">
                    {initial}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors hidden sm:inline max-w-[120px] truncate">
                  {user.name}
                </span>
              </Link>

              <button 
                onClick={onLogout} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
                title="Sign out of ClauseGuard"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive SaaS Footer */}
      <footer className="border-t border-purple-500/15 bg-[#070914] text-slate-400 mt-20 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand & Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ClauseGuardLogo size={26} />
                <span className="font-bold text-white tracking-tight">ClauseGuard</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plain-language document analysis and financial risk assessment for agreements, loans, and commercial contracts.
              </p>
              <div className="text-[11px] text-purple-400 font-medium pt-1">
                Zero-Knowledge Privacy · Client-Side Redacted
              </div>
            </div>


            {/* Col 2: Features & Tools */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Features</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/analyze" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-400" />
                    <span>Contract Risk Scanner</span>
                  </Link>
                </li>
                <li>
                  <Link to="/calculator" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-purple-400" />
                    <span>Affordability Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vault" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <Lock size={13} className="text-purple-400" />
                    <span>Encrypted Locker Vault</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-purple-400" />
                    <span>Profile & Security</span>
                  </Link>
                </li>
              </ul>
            </div>


            {/* Col 3: Analysis Capabilities */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Capabilities</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                  <span>Plain-Language Translations</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                  <span>Affordability & Income Math</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                  <span>Missing Protections Audit</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                  <span>Actionable Negotiation Guidance</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Privacy & Notice */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Terms</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                ClauseGuard is an educational reading aid for awareness. Outputs do not constitute formal legal counsel.
              </p>
              <p className="text-[11px] text-slate-500">
                Personal identities, numbers, and names are erased before analysis.
              </p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="border-t border-purple-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 ClauseGuard. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={14} className="text-purple-400" />
              <span>Document Intelligence & Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
