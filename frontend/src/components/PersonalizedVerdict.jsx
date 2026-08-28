import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Edit3, Scale } from 'lucide-react'
import API from '../api'

const BADGE_STYLES = {
  'Extreme Risk': {
    bg: 'bg-red-50 border-red-200 text-red-800',
    icon: AlertCircle,
  },
  'High Risk': {
    bg: 'bg-red-50 border-red-200 text-red-800',
    icon: AlertTriangle,
  },
  'Moderate Caution': {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertTriangle,
  },
  'Affordable & Safe': {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: ShieldCheck,
  },
  'Comfortable & Safe': {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
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
      <div className="card p-5 mb-6 bg-white border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 text-orange-600">
            <Scale size={20} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Calculate personalized financial affordability
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Enter your monthly salary and location to calculate debt-to-income limits against this contract.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="btn-primary !py-2 !px-4 text-xs font-bold shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
        >
          <span>Calculate</span>
          <ChevronRight size={14} />
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
    <div className="card mb-6 p-5 sm:p-6 bg-white border-slate-200 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${badgeConfig.bg}`}>
            <BadgeIcon size={14} />
            <span>💰 Financial Health: {v.verdict_badge || 'Budget Assessment'}</span>
          </span>
          <span className="text-xs text-slate-600 font-semibold">
            Affordability Score: <strong className="text-emerald-700 font-black">{v.affordability_score ?? 75}/100</strong>
          </span>
        </div>

        <button
          onClick={() => navigate(`/smart-context/${contractId}`)}
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors font-bold"
        >
          <Edit3 size={13} />
          <span>Edit income & city</span>
        </button>
      </div>

      {/* Dual Verdict Notice Banner */}
      <div className="my-3 px-4 py-3 rounded-xl bg-orange-50/80 border border-orange-200 flex items-start gap-3">
        <Scale size={16} className="text-orange-600 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          <strong className="text-orange-950 font-bold">Dual-Index Evaluation:</strong> This score assesses your <strong className="text-emerald-700 font-bold">Personal Salary vs Monthly Payment</strong>. It is separate from the <strong className="text-orange-700 font-bold">Legal Terms Risk Index</strong> below which audits one-sided legal liabilities in the text.
        </p>
      </div>

      {/* Title */}
      <div className="mt-3 mb-3">
        <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
          {v.verdict_title}
        </h3>
      </div>

      {/* Numbers Grid */}
      {(math.income || math.contract_obligation) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Stated Monthly Income</p>
            <p className="text-sm sm:text-base font-black text-slate-900 leading-tight break-words">{math.income || '—'}</p>
            {answers.current_city && (
              <p className="text-[11px] text-slate-500 font-medium mt-1">Location: {answers.current_city}</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Contract Obligation</p>
            <p className="text-sm sm:text-base font-black text-slate-900 leading-tight break-words">{math.contract_obligation || '—'}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Per document terms</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Income Ratio</p>
            <p className="text-sm sm:text-base font-black text-orange-600 leading-tight break-words">{math.ratio_pct || '—'}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Standard safe limit: 40%</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Estimated Net Buffer</p>
            <p className={`text-sm sm:text-base font-black leading-tight break-words ${math.disposable_after_costs?.includes('-') ? 'text-rose-600' : 'text-emerald-700'}`}>
              {math.disposable_after_costs || '—'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">After living essentials</p>
          </div>
        </div>
      )}

      {/* Story */}
      {v.personalized_story && (
        <div className="my-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
          {v.personalized_story.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Specific Warnings */}
      {v.specific_warnings?.length > 0 && (
        <div className="my-4 space-y-2">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Key Situational Watchouts</p>
          <div className="space-y-1.5">
            {v.specific_warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/80 border border-amber-200 p-3 rounded-xl font-medium">
                <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
