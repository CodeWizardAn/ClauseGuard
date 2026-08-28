import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, ShieldCheck, Scale, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../api'

const SEVERITY_COLOR = {
  Critical: 'text-red-800 border-red-200 bg-red-50/50',
  High: 'text-orange-800 border-orange-200 bg-orange-50/50',
  Medium: 'text-amber-800 border-amber-200 bg-amber-50/50',
}

const VERDICT_CONFIG = {
  safe: {
    icon: <ShieldCheck size={18} className="text-emerald-600" />,
    color: 'text-emerald-800',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  caution: {
    icon: <AlertTriangle size={18} className="text-amber-600" />,
    color: 'text-amber-800',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  danger: {
    icon: <AlertCircle size={18} className="text-red-600" />,
    color: 'text-red-800',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
}

function BiasBar({ score }) {
  const clampedScore = Math.max(-100, Math.min(100, score ?? 0))
  const pct = ((clampedScore + 100) / 200) * 100

  const markerColor =
    clampedScore < -30 ? '#dc2626'
    : clampedScore < 10 ? '#d97706'
    : '#059669'

  const labelText =
    clampedScore > 10 ? 'Balanced terms'
    : clampedScore > -30 ? 'Moderately one-sided'
    : 'Heavily biased against user'

  return (
    <div className="mt-2.5">
      <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
        <span>One-sided</span>
        <span>Neutral</span>
        <span>Balanced</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
        <div 
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(to right, #dc2626 0%, #d97706 50%, #059669 100%)', opacity: 0.35 }} 
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md"
          style={{ left: `${pct}%`, backgroundColor: markerColor }}
        />
      </div>
      <p className="text-center text-xs mt-1.5 font-bold" style={{ color: markerColor }}>
        {labelText}
      </p>
    </div>
  )
}

export default function InsightsPanel({ contractId }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!contractId) return
    setLoading(true)
    API.get(`/insights/${contractId}`)
      .then(res => { setInsights(res.data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [contractId])

  if (loading) {
    return (
      <div className="card p-4 mb-6 flex items-center gap-2.5 text-slate-500 text-xs bg-white border-slate-200 shadow-sm font-medium">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        Generating risk insights…
      </div>
    )
  }

  if (error || !insights) return null

  const verdict = VERDICT_CONFIG[insights.verdict_level] ?? VERDICT_CONFIG.caution

  return (
    <div className="card mb-6 overflow-hidden bg-white border-slate-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
            <Scale size={16} />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm sm:text-base">Key Legal Insights</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">· Risk overview & negotiation points</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
              {/* Verdict banner */}
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${verdict.border} ${verdict.bg}`}>
                <span className="shrink-0 mt-0.5">{verdict.icon}</span>
                <div>
                  <p className={`font-bold text-xs uppercase tracking-wider ${verdict.color}`}>Overall Assessment</p>
                  <p className="text-slate-800 text-xs sm:text-sm mt-1 leading-relaxed font-medium">{insights.verdict}</p>
                </div>
              </div>

              {/* Bias bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-bold">
                  <span>Contract Terms Balance</span>
                  <span className="text-slate-900">{insights.bias_label}</span>
                </div>
                <BiasBar score={insights.bias_score} />
              </div>

              {/* Red flags */}
              {insights.red_flags?.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Priority Risk Items</p>
                  <div className="space-y-2.5">
                    {insights.red_flags.map((flag, i) => (
                      <div
                        key={flag.clause_number ?? i}
                        className={`rounded-xl border p-4 space-y-2 ${SEVERITY_COLOR[flag.severity] ?? SEVERITY_COLOR.High}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">
                            Clause {flag.clause_number} · {flag.category}
                          </span>
                          <span className="text-slate-600 font-mono text-xs font-bold">Score {flag.risk_score}/100</span>
                        </div>
                        {flag.plain_summary && (
                          <p className="text-slate-800 text-xs leading-relaxed font-medium">{flag.plain_summary}</p>
                        )}
                        {flag.tip && (
                          <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-orange-200/80 shadow-sm">
                            <Lightbulb size={14} className="text-orange-600 mt-0.5 shrink-0" />
                            <p className="text-slate-700 text-xs leading-relaxed font-medium">
                              <strong className="text-slate-900 font-bold">Negotiation Note:</strong> {flag.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
