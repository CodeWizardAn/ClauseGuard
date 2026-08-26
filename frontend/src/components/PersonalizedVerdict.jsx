import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Edit3, Scale } from 'lucide-react'
import API from '../api'

const BADGE_STYLES = {
  'Extreme Risk': {
    bg: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: AlertCircle,
  },
  'High Risk': {
    bg: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: AlertTriangle,
  },
  'Moderate Caution': {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    icon: AlertTriangle,
  },
  'Affordable & Safe': {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: ShieldCheck,
  },
  'Comfortable & Safe': {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: ShieldCheck,
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
      <div className="card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300">
            <Scale size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
              Calculate personalized financial affordability
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter your monthly salary and location to calculate debt-to-income limits against this contract.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="btn-primary !py-1.5 !px-3 text-xs shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
        >
          <span>Calculate</span>
          <ChevronRight size={13} />
        </button>
      </div>
    )
  }

  const v = data.verdict
  const answers = data.answers || {}
  const badgeConfig = BADGE_STYLES[v.verdict_badge] || (
    v.affordability_score >= 65 ? BADGE_STYLES['Affordable & Safe'] : BADGE_STYLES['Moderate Caution']
  )
  const BadgeIcon = badgeConfig.icon
  const math = v.monthly_math || {}

  return (
    <div className="card mb-6 p-5 sm:p-6 border-white/10">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${badgeConfig.bg}`}>
            <BadgeIcon size={13} />
            <span>{v.verdict_badge || 'Personalized Assessment'}</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Affordability Score: <strong className="text-white font-bold">{v.affordability_score ?? 75}/100</strong>
          </span>
        </div>

        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium"
        >
          <Edit3 size={13} />
          <span>Edit details</span>
        </button>
      </div>

      {/* Title */}
      <div className="mt-4 mb-3">
        <h3 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
          {v.verdict_title}
        </h3>
      </div>

      {/* Numbers Grid (No ugly ellipsis truncation) */}
      {(math.income || math.contract_obligation) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Stated Monthly Income</p>
            <p className="text-sm sm:text-base font-bold text-white leading-tight break-words">{math.income || '—'}</p>
            {answers.current_city && (
              <p className="text-[11px] text-slate-400 mt-1">Location: {answers.current_city}</p>
            )}
          </div>

          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Contract Obligation</p>
            <p className="text-sm sm:text-base font-bold text-white leading-tight break-words">{math.contract_obligation || '—'}</p>
            <p className="text-[11px] text-slate-400 mt-1">Per document terms</p>
          </div>

          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Income Ratio</p>
            <p className="text-sm sm:text-base font-bold text-purple-300 leading-tight break-words">{math.ratio_pct || '—'}</p>
            <p className="text-[11px] text-slate-400 mt-1">Standard safe limit: 40%</p>
          </div>

          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Estimated Net Buffer</p>
            <p className={`text-sm sm:text-base font-bold leading-tight break-words ${math.disposable_after_costs?.includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
              {math.disposable_after_costs || '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">After living essentials</p>
          </div>
        </div>
      )}

      {/* Story */}
      {v.personalized_story && (
        <div className="my-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2.5 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
          {v.personalized_story.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Specific Warnings */}
      {v.specific_warnings?.length > 0 && (
        <div className="my-4 space-y-2">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Key Situational Watchouts</p>
          <div className="space-y-1.5">
            {v.specific_warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Alternatives */}
      {v.actionable_alternatives?.length > 0 && (
        <div className="my-4 space-y-2">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Recommended Strategy</p>
          <div className="space-y-1.5">
            {v.actionable_alternatives.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
