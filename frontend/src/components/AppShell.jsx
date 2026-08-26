import { useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FileText, Lock, LogOut, Calculator, Settings, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../auth'
import ClauseGuardLogo from './ClauseGuardLogo'

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const detailsRef = useRef(null)

  // Automatically close dropdown on route navigation
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.removeAttribute('open')
    }
  }, [location.pathname])

  // Clean outside-click listener for native <details>
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (detailsRef.current && detailsRef.current.hasAttribute('open')) {
        if (!detailsRef.current.contains(e.target)) {
          detailsRef.current.removeAttribute('open')
        }
      }
    }
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [])

  const closeMenu = () => {
    if (detailsRef.current) {
      detailsRef.current.removeAttribute('open')
    }
  }

  const handleSignOut = () => {
    closeMenu()
    logout()
    navigate('/')
  }

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyze', label: 'Scan Contract' },
    { path: '/calculator', label: 'Affordability' },
    { path: '/vault', label: 'Vault' },
    { path: '/profile', label: 'Account' },
  ]


  return (
    <div className="min-h-screen app-bg flex flex-col selection:bg-purple-500/30 selection:text-white">
      {/* Top Header Navigation */}
      <header className="border-b border-white/[0.07] bg-[#060818]/95 backdrop-blur-md px-6 py-2.5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-10">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <ClauseGuardLogo size={30} className="group-hover:scale-105 transition-transform duration-200" />
              <span className="font-bold text-base tracking-tight text-white">
                Clause<span className="text-purple-400">Guard</span>
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  const active = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-xs font-medium transition-colors py-1 relative ${
                        active
                          ? 'text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute -bottom-[14px] left-0 right-0 h-[2px] bg-purple-500 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          {/* Right: User Menu & Dedicated Smart Logout Button */}
          {user && (
            <div className="flex items-center gap-3">
              <details className="relative list-none group" ref={detailsRef}>
                <summary className="flex items-center gap-2.5 py-1 px-2.5 rounded-xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/10 cursor-pointer select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                  {user.avatar && user.avatar.startsWith('data:image') ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-purple-400/40 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {initial}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 max-w-[130px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                </summary>

                {/* Native Dropdown Popover */}
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0c0f2b] border border-white/15 shadow-2xl shadow-black/90 py-2 z-[9999]">
                  <div className="px-4 py-2.5 border-b border-white/[0.08]">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || user.role || 'Member'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Settings size={14} className="text-purple-400 shrink-0" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/vault"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Lock size={14} className="text-purple-400 shrink-0" />
                      <span>Document Vault</span>
                    </Link>

                    <Link
                      to="/calculator"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Calculator size={14} className="text-purple-400 shrink-0" />
                      <span>Affordability Calculator</span>
                    </Link>
                  </div>

                  <div className="border-t border-white/[0.08] pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut size={14} className="shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </details>

              {/* Dedicated Smart Executive Logout Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer shadow-sm"
                title="Sign out of ClauseGuard"
              >
                <LogOut size={13} className="text-slate-400 group-hover:text-rose-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>


      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive Clean Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050614] text-slate-400 mt-20 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
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

            {/* Col 2: Navigation */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigation</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/analyze" className="hover:text-white transition-colors">Scan Contract</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors">Affordability Calculator</Link></li>
                <li><Link to="/vault" className="hover:text-white transition-colors">Encrypted Vault</Link></li>
              </ul>
            </div>

            {/* Col 3: Intelligence Tools */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Intelligence</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/comparison" className="hover:text-white transition-colors">Draft Comparison (Diff)</Link></li>
                <li><Link to="/glossary" className="hover:text-white transition-colors">Legal Glossary</Link></li>
                <li><Link to="/profile" className="hover:text-white transition-colors">Security & Settings</Link></li>
              </ul>
            </div>

            {/* Col 4: Platform Security */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Security Standards</p>
              <div className="space-y-2 text-xs text-slate-400">
                <p>• Client-Side PII Scrubbing</p>
                <p>• AES-256 GCM Local Encryption</p>
                <p>• 4-Digit Vault PIN Protection</p>
                <p>• Zero Personal Data Stored</p>
              </div>
            </div>
          </div>

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
