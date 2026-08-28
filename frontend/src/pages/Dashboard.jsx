import { useNavigate } from 'react-router-dom'
import { FileText, Lock, ArrowRight, Scale, Calculator, User, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'
import ClauseGuardLogo from '../components/ClauseGuardLogo'
import API from '../api'

function riskColor(score) {
  if (score >= 70) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'High Risk' }
  if (score >= 45) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate' }
  return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Low Risk' }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [recentContracts, setRecentContracts] = useState([])

  useEffect(() => {
    API.get('/history')
      .then(res => {
        const all = res.data?.contracts || []
        const sorted = [...all].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        setRecentContracts(sorted.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Centered Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {/* Logo Emblem with Warm Orange Aura */}
          <div className="relative inline-block mb-6 group cursor-pointer" onClick={() => navigate('/analyze')}>
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-orange-400/30 via-amber-400/25 to-orange-500/30 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <ClauseGuardLogo
              size={110}
              className="relative z-10 mx-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_25px_rgba(234,88,12,0.3)]"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Analyze Contracts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">Full Confidence</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 font-medium">
            Welcome, <span className="text-slate-900 font-bold">{user?.name?.split(' ')[0] || 'User'}</span>. Upload any agreement to translate complex clauses, stress-test financial commitments against your income, or manage your secure vault.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/analyze')}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-base flex items-center gap-2 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <FileText size={18} />
              <span>Audit Document</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold text-base flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Calculator size={17} className="text-orange-600" />
              <span>Stress-Test Math</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold text-base flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <User size={17} className="text-amber-600" />
              <span>Profile & Security</span>
            </button>
          </div>
        </div>

        {/* ── Recent Contracts ── */}
        {recentContracts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-orange-600" /> Recent Documents
              </h2>
              <button
                onClick={() => navigate('/vault')}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight size={15} />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {recentContracts.map((c, i) => {
                const rc = riskColor(c.overall_score || 0)
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => navigate(`/analysis/${c.id}`)}
                    className="card p-5 cursor-pointer hover:border-orange-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                        <FileText size={18} />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${rc.text} ${rc.bg} ${rc.border}`}>
                        {rc.label}
                      </span>
                    </div>
                    <p className="text-slate-900 text-base font-bold leading-snug mb-1.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {c.display_name || c.original_filename || 'Document'}
                    </p>
                    <p className="text-slate-500 text-sm">{c.contract_type}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className={`text-2xl font-black ${rc.text}`}>{c.overall_score ?? '—'}<span className="text-slate-400 text-sm font-normal">/100</span></span>
                      <span className="text-slate-500 text-sm font-medium">{timeAgo(c.created_at)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3 Core Highlight Feature Cards */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Secure & Reliable Tools
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Backed by Grounded Legal Standards & Deterministic Financial Math
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Risk Breakdown */}
          <div
            onClick={() => navigate('/analyze')}
            className="card p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 border-orange-100 hover:border-orange-300"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform p-3">
              <Scale size={24} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Risk Breakdown
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Identifies one-sided penalty terms, unfair lock-in clauses, and arbitrary termination conditions.
            </p>
            <span className="text-sm font-bold text-orange-600 group-hover:text-orange-700 flex items-center justify-center gap-1">
              Start Audit <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 2: Standalone Affordability Calculator */}
          <div
            onClick={() => navigate('/calculator')}
            className="card p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 border-amber-100 hover:border-amber-300"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform p-3">
              <Calculator size={24} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Smart Affordability
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Instant standalone stress-test of rent or loan EMIs against your salary. No document upload required.
            </p>
            <span className="text-sm font-bold text-orange-600 group-hover:text-orange-700 flex items-center justify-center gap-1">
              Calculate Math <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Encrypted Vault */}
          <div
            onClick={() => navigate('/vault')}
            className="card p-6 text-center group cursor-pointer hover:-translate-y-1 transition-all duration-300 border-orange-100 hover:border-orange-300"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-600 to-rose-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform p-3">
              <Lock size={22} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Private Vault
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Zero PII stored. Personal data is automatically stripped and your reports are protected by your 4-digit PIN.
            </p>
            <span className="text-sm font-bold text-orange-600 group-hover:text-orange-700 flex items-center justify-center gap-1">
              Open Vault <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
