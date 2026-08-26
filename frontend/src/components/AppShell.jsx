import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FileText, Lock, LogOut, Calculator, Settings } from 'lucide-react'
import { useAuth } from '../auth'
import ClauseGuardLogo from './ClauseGuardLogo'

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyze', label: 'Audit Contract' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/vault', label: 'Vault' },
  ]

  return (
    <div className="min-h-screen app-bg flex flex-col selection:bg-purple-500/30 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-white/[0.08] bg-[#060818]/90 backdrop-blur-xl px-6 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <ClauseGuardLogo size={36} className="group-hover:scale-105 transition-transform duration-200" />
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Clause<span className="text-purple-400 font-black">Guard</span>
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-white/[0.08] text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Profile Link */}
              <Link
                to="/profile"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-purple-500/15 border-purple-500/40 text-white'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white'
                }`}
                title="Account Settings"
              >
                {user.avatar && user.avatar.startsWith('data:image') ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-lg object-cover border border-purple-400/40 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {initial}
                  </div>
                )}
                <span className="text-xs font-semibold max-w-[120px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <Settings size={13} className="text-slate-400 group-hover:text-white" />
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive Clean Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050614] text-slate-400 mt-20 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand & Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ClauseGuardLogo size={24} />
                <span className="font-bold text-white tracking-tight">ClauseGuard</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plain-language document analysis and financial risk assessment for agreements, loans, and commercial contracts.
              </p>
              <div className="text-[11px] text-purple-400 font-medium pt-1">
                Zero-Knowledge Privacy · Client-Side Redacted
              </div>
            </div>

            {/* Col 2: Features */}
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
                    <Calculator size={13} className="text-purple-400" />
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
                    <Settings size={13} className="text-purple-400" />
                    <span>Account Settings</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Analysis Capabilities */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Capabilities</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Plain-Language Translations</li>
                <li>Affordability & Income Math</li>
                <li>Missing Protections Audit</li>
                <li>Negotiation Guidance</li>
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
          <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 ClauseGuard. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Document Intelligence & Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
