import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Edit3, Scale } from 'lucide-react'
import API from '../api'

const BADGE_STYLES = {
  'Extreme Risk': {
    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
    icon: AlertCircle,
  },
  'High Risk': {
    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
    icon: AlertTriangle,
  },
  'Moderate Caution': {
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    icon: AlertTriangle,
  },
  'Affordable & Safe': {
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
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
  const badgeConfig = BADGE_STYLES[v.verdict_badge] || BADGE_STYLES['Moderate Caution']
  const BadgeIcon = badgeConfig.icon
  const math = v.monthly_math || {}

  return (
    <div className="card mb-6 p-5 sm:p-6 border-zinc-800">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded border text-[11px] font-medium flex items-center gap-1.5 ${badgeConfig.bg}`}>
            <BadgeIcon size={12} />
            <span>{v.verdict_badge || 'Personalized Assessment'}</span>
          </span>
          <span className="text-xs text-zinc-400">
            Affordability Score: <strong className="text-zinc-200">{v.affordability_score ?? 50}/100</strong>
          </span>
        </div>

        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <Edit3 size={12} />
          <span>Edit details</span>
        </button>
      </div>

      {/* Title */}
      <div className="mt-4 mb-3">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight leading-snug">
          {v.verdict_title}
        </h3>
      </div>

      {/* Numbers Grid */}
      {(math.income || math.contract_obligation) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-4">
          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-0.5">Stated Monthly Income</p>
            <p className="text-sm font-semibold text-zinc-200 truncate">{math.income || '—'}</p>
            {answers.current_city && (
              <p className="text-[11px] text-zinc-500 mt-1 truncate">Location: {answers.current_city}</p>
            )}
          </div>

          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-0.5">Contract Obligation</p>
            <p className="text-sm font-semibold text-zinc-200 truncate">{math.contract_obligation || '—'}</p>
            <p className="text-[11px] text-zinc-500 mt-1">Per document terms</p>
          </div>

          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-0.5">Income Ratio</p>
            <p className="text-sm font-semibold text-amber-400 truncate">{math.ratio_pct || '—'}</p>
            <p className="text-[11px] text-zinc-500 mt-1">Standard limit: 40%</p>
          </div>

          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-0.5">Estimated Net Buffer</p>
            <p className={`text-sm font-semibold truncate ${math.disposable_after_costs?.includes('-') ? 'text-red-400' : 'text-emerald-400'}`}>
              {math.disposable_after_costs || '—'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">After standard essentials</p>
          </div>
        </div>
      )}

      {/* Story */}
      {v.personalized_story && (
        <div className="my-4 p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
          {v.personalized_story}
        </div>
      )}

      {/* Specific Warnings */}
      {v.specific_warnings?.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-red-400 font-semibold">
            Direct Risks for Your Profile
          </p>
          <div className="space-y-1.5">
            {v.specific_warnings.map((w, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded bg-red-950/20 border border-red-500/20 text-xs text-zinc-300">
                <span className="text-red-400 font-bold shrink-0">•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {v.actionable_alternatives?.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
            Recommended Alternatives & Limits
          </p>
          <div className="space-y-1.5">
            {v.actionable_alternatives.map((alt, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-xs text-zinc-300">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
