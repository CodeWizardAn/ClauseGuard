import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertOctagon, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Edit3, TrendingDown, ArrowUpRight, Scale } from 'lucide-react'
import API from '../api'

const BADGE_STYLES = {
  'Extreme Risk': {
    bg: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: AlertOctagon,
    meterColor: '#ef4444',
  },
  'High Risk': {
    bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    icon: AlertTriangle,
    meterColor: '#f97316',
  },
  'Moderate Caution': {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    icon: AlertTriangle,
    meterColor: '#f59e0b',
  },
  'Affordable & Safe': {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: ShieldCheck,
    meterColor: '#10b981',
  },
}

export default function PersonalizedVerdict({ contractId }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contractId) return
    API.get(`/smart-verdict/${contractId}`)
      .then(res => {
        setData(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [contractId])

  if (loading) return null

  // If user has not personalized yet, show an invitation banner
  if (!data?.has_verdict || !data?.verdict) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 mb-8 border-[#c4a574]/30 bg-gradient-to-r from-[#17202c] to-[#0c1118] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#c4a574]/15 border border-[#c4a574]/30 flex items-center justify-center shrink-0">
            <Sparkles className="text-[#c4a574]" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#f4f1ea] flex items-center gap-2">
              Want advice tailored to your income and city?
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#c4a574]/20 text-[#c4a574]">Personalize</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Tell us your salary and location to calculate exact affordability and realistic local alternatives.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="btn-primary !py-2 !px-4 text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-md shadow-[#c4a574]/10 w-full sm:w-auto justify-center"
        >
          <span>Calculate Affordability</span>
          <ChevronRight size={14} />
        </button>
      </motion.div>
    )
  }

  const v = data.verdict
  const answers = data.answers || {}
  const badgeConfig = BADGE_STYLES[v.verdict_badge] || BADGE_STYLES['Moderate Caution']
  const BadgeIcon = badgeConfig.icon
  const math = v.monthly_math || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 p-6 border-[#c4a574]/30 bg-gradient-to-br from-[#131b24] via-[#0e141c] to-[#0a0e14] shadow-2xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: badgeConfig.meterColor }}
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${badgeConfig.bg}`}>
            <BadgeIcon size={14} />
            <span>{v.verdict_badge || 'Personalized Verdict'}</span>
          </div>
          <span className="text-xs text-stone-400">· Affordability Score: <strong className="text-white">{v.affordability_score ?? 50}/100</strong></span>
        </div>

        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="text-xs text-stone-400 hover:text-[#c4a574] flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
        >
          <Edit3 size={13} />
          <span>Edit my situation</span>
        </button>
      </div>

      {/* Title */}
      <div className="mt-4 mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-[#f4f1ea] tracking-tight leading-snug">
          {v.verdict_title}
        </h3>
      </div>

      {/* Key Numbers Comparison Grid */}
      {(math.income || math.contract_obligation) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 min-w-0 flex flex-col justify-between overflow-hidden">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">Your Monthly Income</p>
              <p className="text-sm sm:text-base font-bold text-emerald-400 break-words leading-snug">{math.income || '—'}</p>
            </div>
            {answers.current_city && (
              <p className="text-[11px] text-stone-400 mt-2 truncate">📍 {answers.current_city}</p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 min-w-0 flex flex-col justify-between overflow-hidden">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">Contract Obligation</p>
              <p className="text-sm sm:text-base font-bold text-red-400 break-words leading-snug">{math.contract_obligation || '—'}</p>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">Required by contract</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 min-w-0 flex flex-col justify-between overflow-hidden">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">Income Ratio</p>
              <p className="text-sm sm:text-base font-bold text-amber-300 break-words leading-snug">{math.ratio_pct || '—'}</p>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">Max safe limit: 40%</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 min-w-0 flex flex-col justify-between overflow-hidden">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">Estimated Net Buffer</p>
              <p className={`text-sm sm:text-base font-bold break-words leading-snug ${math.disposable_after_costs?.includes('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                {math.disposable_after_costs || '—'}
              </p>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">After living essentials</p>
          </div>
        </div>
      )}


      {/* Personalized Story */}
      {v.personalized_story && (
        <div className="my-5 p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#c4a574] font-semibold flex items-center gap-1.5">
            <Scale size={14} /> Real-Life Financial Assessment
          </p>
          <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
            {v.personalized_story}
          </p>
        </div>
      )}

      {/* Specific Warnings */}
      {v.specific_warnings?.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs uppercase tracking-widest text-red-400 font-semibold flex items-center gap-1.5">
            <AlertOctagon size={14} /> Direct Risks for Your Profile
          </p>
          <div className="space-y-2">
            {v.specific_warnings.map((w, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-stone-300 leading-relaxed">
                <span className="text-red-400 font-bold shrink-0">•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Alternatives / Next Steps */}
      {v.actionable_alternatives?.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Recommended Alternatives & Safe Limits
          </p>
          <div className="space-y-2">
            {v.actionable_alternatives.map((alt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-stone-300 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
