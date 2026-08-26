import { Link, useNavigate } from 'react-router-dom'
import { Shield, BookOpen, GitCompare, FileText, Lock, Scale, ShieldAlert, ArrowUpRight } from 'lucide-react'
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      {/* Comprehensive SaaS Footer */}
      <footer className="border-t border-purple-500/15 bg-[#070914] text-slate-400 mt-20 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand & Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white flex items-center justify-center">
                  <Shield size={14} />
                </div>
                <span className="font-bold text-white tracking-tight">ClauseGuard</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plain-language legal intelligence and risk auditing for everyday Indian citizens, renters, borrowers, and professionals.
              </p>
              <div className="text-[11px] text-purple-400 font-medium pt-1">
                Zero-Knowledge Privacy · Client-Side Redacted
              </div>
            </div>

            {/* Col 2: Core Tools */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Features & Tools</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/analyze" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-400" />
                    <span>Contract Risk Scanner</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vault" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <Lock size={13} className="text-purple-400" />
                    <span>Encrypted Locker Vault</span>
                  </Link>
                </li>
                <li>
                  <Link to="/glossary" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <BookOpen size={13} className="text-purple-400" />
                    <span>Legal Glossary</span>
                  </Link>
                </li>
                <li>
                  <Link to="/comparison" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <GitCompare size={13} className="text-purple-400" />
                    <span>Draft Comparison Diff</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Indian Law Framework */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Legal Framework</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Scale size={13} className="text-purple-400 shrink-0" />
                  <span>Indian Contract Act 1872</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Scale size={13} className="text-purple-400 shrink-0" />
                  <span>Transfer of Property Act 1882</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Scale size={13} className="text-purple-400 shrink-0" />
                  <span>Consumer Protection Act 2019</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Scale size={13} className="text-purple-400 shrink-0" />
                  <span>DPDP Act 2023 & RERA 2016</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Privacy & Notice */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Compliance & Notice</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                ClauseGuard is an educational reading aid for awareness. Outputs are not formal legal advice and do not substitute for a qualified advocate.
              </p>
              <p className="text-[11px] text-slate-500">
                Data is AES-256 encrypted and stored locally. Original uploads are immediately discarded.
              </p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="border-t border-purple-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 ClauseGuard. Built for Indian Legal & Financial Literacy.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Llama 3.3 Intelligence</span>
              <span>·</span>
              <span>28 Indian Acts Database</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
