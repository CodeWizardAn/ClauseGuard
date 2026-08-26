import { useNavigate } from 'react-router-dom'
import { FileSearch, FolderLock, BookOpen, GitCompare, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={13} /> Active Legal Intelligence Session
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome, {user?.name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Upload legal agreements for plain-language risk breakdowns, number-driven affordability calculations, and statutory Indian law protection audits.
          </p>
        </div>

        {/* Primary Action Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Analyze Document */}
          <button 
            onClick={() => navigate('/analyze')} 
            className="card p-8 text-left group hover:border-[#d4af37]/40 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4af37]/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileSearch size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-[#d4af37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Start Audit <ArrowRight size={14} />
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
              1. Audit a Document
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload a rental agreement, home loan, employment offer, or vendor terms. We extract obligations, detect missing protections, and calculate real affordability.
            </p>
          </button>

          {/* Card 2: Secure Vault */}
          <button 
            onClick={() => navigate('/vault')} 
            className="card p-8 text-left group hover:border-blue-500/40 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FolderLock size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Locker <ArrowRight size={14} />
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              2. Encrypted Vault
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Access your previous contract analyses and reports. Protected with your private 4-digit PIN with zero-knowledge PII sanitization.
            </p>
          </button>
        </div>

        {/* Quick Tools Bar */}
        <div className="mt-8 p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>28 Indian Acts · Zero PII Stored · Client-Side Redacted</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button 
              onClick={() => navigate('/glossary')} 
              className="text-slate-400 hover:text-[#d4af37] flex items-center gap-1.5 transition-colors"
            >
              <BookOpen size={14} /> Legal Glossary
            </button>
            <span className="text-slate-700">·</span>
            <button 
              onClick={() => navigate('/comparison')} 
              className="text-slate-400 hover:text-[#d4af37] flex items-center gap-1.5 transition-colors"
            >
              <GitCompare size={14} /> Compare 2 Drafts
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
