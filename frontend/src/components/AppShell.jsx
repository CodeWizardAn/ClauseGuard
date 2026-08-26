import { Link, useNavigate } from 'react-router-dom'
import { Shield, BookOpen, GitCompare, FileText, Lock, CheckCircle2, ShieldCheck } from 'lucide-react'
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
