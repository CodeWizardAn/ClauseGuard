import { useNavigate } from 'react-router-dom'
import { FileText, Lock, BookOpen, GitCompare, ArrowRight, ShieldCheck, Zap, Scale } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap size={13} className="text-purple-400" /> AI-Powered Contract Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Analyze Contracts with <span className="text-gradient-purple">Full Confidence</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
            Welcome, {user?.name?.split(' ')[0] || 'User'}. Understand risks, calculate financial commitments, and audit missing protections before signing.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => navigate('/analyze')} 
              className="btn-primary !px-6 !py-3 text-sm flex items-center gap-2"
            >
              <FileText size={16} />
              <span>Audit Document</span>
            </button>
            <button 
              onClick={() => navigate('/vault')} 
              className="btn-secondary !px-5 !py-3 text-sm flex items-center gap-2"
            >
              <Lock size={15} />
              <span>Open Vault</span>
            </button>
          </div>
        </div>

        {/* 3 Core Highlight Feature Cards (matching reference layout) */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">
            Secure & Reliable Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Backed by 28 Indian Statutes & Plain Language Intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Risk Scoring (Amber Halo) */}
          <div 
            onClick={() => navigate('/analyze')}
            className="card card-halo-amber p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            {/* Floating Top Circular Badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <Scale size={22} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Risk Breakdown
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Identifies one-sided penalty terms, unfair lock-in clauses, and arbitrary termination conditions.
            </p>
            <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-1">
              Start Audit <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 2: Fast Intelligence (Purple Halo) */}
          <div 
            onClick={() => navigate('/analyze')}
            className="card card-halo-purple p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            {/* Floating Top Circular Badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/40 group-hover:scale-110 transition-transform">
              <Zap size={22} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Smart Affordability
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Calculates real monthly commitments, income ratios, and safety buffers based on your city.
            </p>
            <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-1">
              Calculate Math <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Encrypted Vault (Cyan/Red Halo) */}
          <div 
            onClick={() => navigate('/vault')}
            className="card card-halo-cyan p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            {/* Floating Top Circular Badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Lock size={20} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Private Vault
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Zero PII stored. Personal data is automatically stripped and your reports are protected by your 4-digit PIN.
            </p>
            <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-1">
              Unlock Vault <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Quick Tools Row */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4 border-purple-500/15">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck size={16} className="text-purple-400" />
            <span>28 Indian Acts Reference · Client-Side Sanitized</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button 
              onClick={() => navigate('/glossary')} 
              className="text-slate-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <BookOpen size={14} /> Legal Glossary
            </button>
            <span className="text-slate-700">·</span>
            <button 
              onClick={() => navigate('/comparison')} 
              className="text-slate-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <GitCompare size={14} /> Compare 2 Drafts
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
