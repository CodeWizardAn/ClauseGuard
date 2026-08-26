import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FileText, Lock, LogOut, Calculator, Settings, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../auth'
import ClauseGuardLogo from './ClauseGuardLogo'
import SiteAssistant from './SiteAssistant'

export default function AppShell({ children }) {

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const onLogout = () => {
    logout()
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyze', label: 'Scan Contract' },
    { path: '/calculator', label: 'Affordability' },
    { path: '/vault', label: 'Vault' },
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

          {/* Right: Unified Executive User Menu */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 py-1 px-2 rounded-xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/10"
              >
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
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Dropdown Popover */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0c0f2b] border border-white/15 shadow-2xl shadow-black/80 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-white/[0.08]">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || user.role || 'Member'}</p>
                  </div>


                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Settings size={14} className="text-purple-400" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/vault"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Lock size={14} className="text-purple-400" />
                      <span>Document Vault</span>
                    </Link>

                    <Link
                      to="/calculator"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Calculator size={14} className="text-purple-400" />
                      <span>Affordability Calculator</span>
                    </Link>
                  </div>

                  <div className="border-t border-white/[0.08] pt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onLogout()
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
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

            {/* Col 3: Capabilities */}
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


