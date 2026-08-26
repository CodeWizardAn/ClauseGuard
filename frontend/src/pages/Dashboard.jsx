import { useNavigate } from 'react-router-dom'
import { FileText, Lock, ArrowRight, Scale, Calculator, User, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'
import ClauseGuardLogo from '../components/ClauseGuardLogo'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Executive Split Hero Section */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          
          {/* Left Column: Headline, Actions & Value Prop */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles size={13} className="text-yellow-300 animate-pulse" />
              <span>Next-Gen Legal Intelligence & Privacy</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Analyze Contracts with <br />
              <span className="text-gradient-purple">Full Confidence</span>
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Welcome, <strong className="text-white">{user?.name?.split(' ')[0] || 'User'}</strong>. Translate dense legalese into plain language, stress-test financial commitments against your income, and protect your private documents with zero-knowledge encryption.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/analyze')} 
                className="btn-primary !px-6 !py-3 text-sm flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
              >
                <FileText size={16} />
                <span>Audit Document</span>
                <ArrowRight size={14} />
              </button>
              <button 
                onClick={() => navigate('/calculator')} 
                className="btn-secondary !px-5 !py-3 text-sm flex items-center gap-2 hover:border-purple-500/40 transition-all"
              >
                <Calculator size={15} />
                <span>Stress-Test Math</span>
              </button>
              <button 
                onClick={() => navigate('/vault')} 
                className="btn-secondary !px-5 !py-3 text-sm flex items-center gap-2 hover:border-purple-500/40 transition-all"
              >
                <Lock size={15} />
                <span>Private Vault</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/[0.08] text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} />
                <span>Zero-Knowledge PII Redaction</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Zap size={14} />
                <span>Real-Time Risk Scoring</span>
              </div>
            </div>

          </div>

          {/* Right Column: Seamlessly Blended Holographic Illustration */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Ambient Background Radial Glow behind the artwork */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-pink-600/20 blur-3xl opacity-80 pointer-events-none" />

            {/* Main Image Container with Soft Glass Gradient Border and Vignette */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#090d24]/80 shadow-2xl p-2 group hover:border-purple-500/40 transition-all duration-500">
              
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src="/dashboard_hero.png" 
                  alt="ClauseGuard Intelligence Hub" 
                  className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Soft Vignette Overlay to blend the artwork edges smoothly */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b1e]/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080b1e]/40 via-transparent to-[#080b1e]/40 pointer-events-none" />
              </div>

              {/* Floating Glass Floating Badge on Image */}
              <div className="absolute bottom-5 left-5 right-5 p-3 rounded-xl bg-[#0b0f2a]/90 backdrop-blur-xl border border-white/15 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Live Contract Intelligence</p>
                    <p className="text-[10px] text-slate-400">Multi-Angle Risk & Math Audit</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

            </div>

          </div>

        </div>

        {/* Core Feature Cards Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Secure & Reliable Tools
          </h2>
          <p className="text-xs text-slate-400">
            Backed by Grounded Legal Standards & Deterministic Financial Math
          </p>
        </div>

        {/* 3 Core Highlight Feature Cards */}
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
