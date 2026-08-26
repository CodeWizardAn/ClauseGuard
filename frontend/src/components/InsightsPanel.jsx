import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, ShieldCheck, Scale, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../api'

const SEVERITY_COLOR = {
  Critical: 'text-red-400 border-red-500/20 bg-red-950/20',
  High: 'text-red-400 border-red-500/20 bg-red-950/15',
  Medium: 'text-amber-400 border-amber-500/20 bg-amber-950/15',
}

const VERDICT_CONFIG = {
  safe: {
    icon: <ShieldCheck size={16} className="text-emerald-400" />,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-950/20',
  },
  caution: {
    icon: <AlertTriangle size={16} className="text-amber-400" />,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-950/20',
  },
  danger: {
    icon: <AlertCircle size={16} className="text-red-400" />,
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-950/20',
  },
}

function BiasBar({ score }) {
  const clampedScore = Math.max(-100, Math.min(100, score ?? 0))
  const pct = ((clampedScore + 100) / 200) * 100

  const markerColor =
    clampedScore < -30 ? '#ef4444'
    : clampedScore < 10 ? '#f59e0b'
    : '#10b981'

  const labelText =
    clampedScore > 10 ? 'Balanced terms'
    : clampedScore > -30 ? 'Moderately one-sided'
    : 'Heavily biased against user'

  return (
    <div className="mt-2.5">
      <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
        <span>One-sided</span>
        <span>Neutral</span>
        <span>Balanced</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div 
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)', opacity: 0.35 }} 
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-zinc-900 shadow"
          style={{ left: `${pct}%`, backgroundColor: markerColor }}
        />
      </div>
      <p className="text-center text-xs mt-1 font-medium" style={{ color: markerColor }}>
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
      <div className="card p-4 mb-6 flex items-center gap-2.5 text-zinc-400 text-xs">
        <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
        Generating risk insights…
      </div>
    )
  }

  if (error || !insights) return null

  const verdict = VERDICT_CONFIG[insights.verdict_level] ?? VERDICT_CONFIG.caution

  return (
    <div className="card mb-6 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-900/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center">
            <Scale size={15} />
          </div>
          <div>
            <span className="font-semibold text-zinc-100 text-sm">Key Legal Insights</span>
            <span className="text-xs text-zinc-500 ml-2">· Risk overview & negotiation points</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 border-t border-zinc-800/80 pt-4 space-y-4">
              {/* Verdict banner */}
              <div className={`flex items-start gap-3 p-3.5 rounded-lg border ${verdict.border} ${verdict.bg}`}>
                <span className="shrink-0 mt-0.5">{verdict.icon}</span>
                <div>
                  <p className={`font-semibold text-xs ${verdict.color}`}>Overall Assessment</p>
                  <p className="text-zinc-200 text-xs mt-0.5 leading-relaxed">{insights.verdict}</p>
                </div>
              </div>

              {/* Bias bar */}
              <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span className="font-medium">Contract Terms Balance</span>
                  <span className="text-zinc-300 font-semibold">{insights.bias_label}</span>
                </div>
                <BiasBar score={insights.bias_score} />
              </div>

              {/* Red flags */}
              {insights.red_flags?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Priority Risk Items</p>
                  <div className="space-y-2">
                    {insights.red_flags.map((flag, i) => (
                      <div
                        key={flag.clause_number ?? i}
                        className={`rounded-lg border p-3.5 space-y-2 ${SEVERITY_COLOR[flag.severity] ?? SEVERITY_COLOR.High}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-200">
                            Clause {flag.clause_number} · {flag.category}
                          </span>
                          <span className="text-zinc-400 font-mono text-[11px]">Score {flag.risk_score}/100</span>
                        </div>
                        {flag.plain_summary && (
                          <p className="text-zinc-300 text-xs leading-relaxed">{flag.plain_summary}</p>
                        )}
                        {flag.tip && (
                          <div className="flex items-start gap-2 bg-zinc-950/80 rounded p-2.5 border border-zinc-800">
                            <Lightbulb size={13} className="text-zinc-400 mt-0.5 shrink-0" />
                            <p className="text-zinc-300 text-xs leading-relaxed">
                              <strong className="text-zinc-200">Negotiation Note:</strong> {flag.tip}
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
