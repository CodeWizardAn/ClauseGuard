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
    <div className="min-h-screen app-bg flex flex-col selection:bg-orange-500/20 selection:text-orange-950">
      {/* Top Header Navigation — Crisp White & Orange Professional Theme */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-8 sm:px-12 py-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-10">
            <Link to="/dashboard" className="flex items-center gap-3.5 group">
              <ClauseGuardLogo 
                size={42} 
                className="group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]" 
              />
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
                Clause<span className="text-orange-600">Guard</span>
              </span>
            </Link>

            {user && (
              <nav className="hidden lg:flex items-center gap-7">
                {navLinks.map((link) => {
                  const active = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-sm font-semibold transition-colors py-2 relative ${
                        active
                          ? 'text-orange-600 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute -bottom-[22px] left-0 right-0 h-[2.5px] bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          {/* Right: Direct Profile Link & Dedicated Smart Sign Out Button */}
          {user && (
            <div className="flex items-center gap-3.5">
              <Link
                to="/profile"
                className="flex items-center gap-3 py-1.5 px-3 rounded-2xl hover:bg-orange-50 transition-all border border-transparent hover:border-orange-200 group cursor-pointer"
                title="View Profile & Security Settings"
              >
                {user.avatar && user.avatar.startsWith('data:image') ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-orange-400/40 shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {initial}
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate hidden sm:inline group-hover:text-orange-600 transition-colors">
                  {user.name}
                </span>
              </Link>

              {/* Dedicated Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-sm bg-white"
                title="Sign out of ClauseGuard"
              >
                <LogOut size={14} className="text-slate-500 group-hover:text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive Clean Dark Slate Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 mt-20 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ClauseGuardLogo size={24} />
                <span className="font-bold text-white tracking-tight">Clause<span className="text-orange-400">Guard</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plain-language document analysis and financial risk assessment for agreements, loans, and commercial contracts.
              </p>
              <div className="text-[11px] text-orange-400 font-semibold pt-1">
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

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
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
