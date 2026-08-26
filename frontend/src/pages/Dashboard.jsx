import { useNavigate } from 'react-router-dom'
import { FileText, Lock, BookOpen, GitCompare, ArrowRight, ShieldCheck } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 border-b border-zinc-800/80 pb-6">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Welcome, {user?.name || 'User'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Analyze contracts for legal risks, calculate affordability commitments, and verify statutory protections.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Card 1: Analyze */}
          <button 
            onClick={() => navigate('/analyze')} 
            className="card p-6 text-left group hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-200 flex items-center justify-center mb-4 group-hover:text-white group-hover:border-zinc-600 transition-colors">
                <FileText size={18} />
              </div>
              <h2 className="text-base font-semibold text-zinc-100 mb-1.5 flex items-center justify-between">
                <span>Analyze Contract</span>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload a rental agreement, loan agreement, employment offer, or vendor contract to extract obligations and detect risks.
              </p>
            </div>
          </button>

          {/* Card 2: Vault */}
          <button 
            onClick={() => navigate('/vault')} 
            className="card p-6 text-left group hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-200 flex items-center justify-center mb-4 group-hover:text-white group-hover:border-zinc-600 transition-colors">
                <Lock size={18} />
              </div>
              <h2 className="text-base font-semibold text-zinc-100 mb-1.5 flex items-center justify-between">
                <span>Document Vault</span>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Access your past document analyses and generated PDF reports protected by your 4-digit PIN.
              </p>
            </div>
          </button>
        </div>

        {/* Tools row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck size={15} className="text-zinc-400" />
            <span>28 Indian Acts Reference · Zero PII Retained</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-medium">
            <button 
              onClick={() => navigate('/glossary')} 
              className="hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <BookOpen size={13} /> Legal Glossary
            </button>
            <span className="text-zinc-700">·</span>
            <button 
              onClick={() => navigate('/comparison')} 
              className="hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <GitCompare size={13} /> Compare Drafts
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
