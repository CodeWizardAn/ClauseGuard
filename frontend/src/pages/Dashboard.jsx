import { useNavigate } from 'react-router-dom'
import { FileText, Lock, ArrowRight, Scale, Calculator, User } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'
import ClauseGuardLogo from '../components/ClauseGuardLogo'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Centered Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {/* Existential Logo Emblem with Cyan/Purple Aura */}
          <div className="relative inline-block mb-6 group cursor-pointer" onClick={() => navigate('/analyze')}>
            {/* Atmospheric Background Aura */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-500/30 via-indigo-500/25 to-purple-600/30 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <ClauseGuardLogo 
              size={110} 
              className="relative z-10 mx-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]" 
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Analyze Contracts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-400">Full Confidence</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Welcome, <span className="text-white font-semibold">{user?.name?.split(' ')[0] || 'User'}</span>. Upload any agreement to translate complex clauses, stress-test financial commitments against your income, or manage your secure vault.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button 
              onClick={() => navigate('/analyze')} 
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <FileText size={16} />
              <span>Audit Document</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => navigate('/calculator')} 
              className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-white font-semibold text-sm flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <Calculator size={15} className="text-cyan-400" />
              <span>Stress-Test Math</span>
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 hover:border-purple-400/40 text-slate-200 hover:text-white font-semibold text-sm flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <User size={15} className="text-purple-400" />
              <span>Profile & Security</span>
            </button>
          </div>
        </div>


        {/* 3 Core Highlight Feature Cards */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Secure & Reliable Tools
          </h2>
          <p className="text-xs text-slate-400">
            Backed by Grounded Legal Standards & Deterministic Financial Math
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Risk Breakdown */}
          <div 
            onClick={() => navigate('/analyze')}
            className="card card-halo-amber p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
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

          {/* Card 2: Standalone Affordability Calculator */}
          <div 
            onClick={() => navigate('/calculator')}
            className="card card-halo-purple p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/40 group-hover:scale-110 transition-transform">
              <Calculator size={22} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Smart Affordability
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Instant standalone stress-test of rent or loan EMIs against your salary. No document upload required.
            </p>
            <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-1">
              Calculate Math <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Encrypted Vault */}
          <div 
            onClick={() => navigate('/vault')}
            className="card card-halo-cyan p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
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
              Open Vault <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
