import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldAlert, ShieldCheck, Scale, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../api'

const SEVERITY_COLOR = {
  Critical: 'text-red-400 border-red-500/30 bg-red-500/5',
  High: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
  Medium: 'text-amber-300 border-amber-400/30 bg-amber-400/5',
}

const VERDICT_CONFIG = {
  safe: {
    icon: <ShieldCheck size={20} className="text-emerald-400" />,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
  },
  caution: {
    icon: <AlertTriangle size={20} className="text-amber-300" />,
    color: 'text-amber-300',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/5',
  },
  danger: {
    icon: <ShieldAlert size={20} className="text-red-400" />,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
  },
}

function BiasBar({ score }) {
  // score: -100 (against you) → 0 (neutral) → +100 (in your favour)
  const clampedScore = Math.max(-100, Math.min(100, score ?? 0))
  const pct = ((clampedScore + 100) / 200) * 100 // 0% = far left, 100% = far right

  const markerColor =
    clampedScore < -30 ? '#f87171'  // red
    : clampedScore < 10 ? '#fcd34d' // amber
    : '#34d399'                      // green

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-stone-500 mb-1.5">
        <span>Against you</span>
        <span>Neutral</span>
        <span>In your favour</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
        {/* track gradient */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 45%, #22c55e 100%)', opacity: 0.25 }} />
        {/* marker */}
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0c1118] shadow-lg"
          style={{ backgroundColor: markerColor }}
        />
      </div>
      <p className="text-center text-xs mt-1.5" style={{ color: markerColor }}>
        {score > 10 ? '😊 Mostly fair' : score > -30 ? '⚠️ Slightly unfair' : '🚨 Heavily against you'}
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
      <div className="card p-6 mb-6 flex items-center gap-3 text-stone-400 text-sm animate-pulse">
        <Scale size={18} className="text-[#c4a574]" />
        Generating AI insights…
      </div>
    )
  }

  if (error || !insights) return null

  const verdict = VERDICT_CONFIG[insights.verdict_level] ?? VERDICT_CONFIG.caution

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card mb-8 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-white/2 transition-colors text-left"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <ShieldAlert size={18} className="text-[#c4a574] shrink-0" />
          <span className="font-semibold text-[#f4f1ea] text-sm tracking-wide">AI Insights</span>
          <span className="text-xs text-stone-500">· Top risks & tips</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-stone-500 shrink-0 ml-2" /> : <ChevronDown size={16} className="text-stone-500 shrink-0 ml-2" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 sm:px-6 pb-5 sm:pb-6 border-t border-white/5 pt-4 sm:pt-5 space-y-4 sm:space-y-5">

              {/* Verdict banner */}
              <div className={`flex items-start gap-3 px-3.5 sm:px-4 py-3 rounded-xl border ${verdict.border} ${verdict.bg}`}>
                <span className="shrink-0 mt-0.5">{verdict.icon}</span>
                <div>
                  <p className={`font-semibold text-xs sm:text-sm ${verdict.color}`}>Verdict</p>
                  <p className="text-[#f4f1ea] text-xs sm:text-sm mt-0.5 leading-relaxed">{insights.verdict}</p>
                </div>
              </div>


              {/* Bias bar */}
              <div className="px-1">
                <div className="flex items-center gap-2 mb-1">
                  <Scale size={14} className="text-stone-500" />
                  <p className="text-xs text-stone-500 uppercase tracking-widest">Contract balance</p>
                  <span className="ml-auto text-xs font-medium text-stone-300">{insights.bias_label}</span>
                </div>
                <BiasBar score={insights.bias_score} />
              </div>

              {/* Red flags */}
              {insights.red_flags?.length > 0 && (
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">Top Red Flags</p>
                  <div className="space-y-3">
                    {insights.red_flags.map((flag, i) => (
                      <motion.div
                        key={flag.clause_number ?? i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-xl border px-4 py-3.5 ${SEVERITY_COLOR[flag.severity] ?? SEVERITY_COLOR.High}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                            Part {flag.clause_number} · {flag.category}
                          </p>
                          <span className="text-xs opacity-60">Risk {flag.risk_score}/100</span>
                        </div>
                        {flag.plain_summary && (
                          <p className="text-stone-300 text-sm mb-2 leading-relaxed">{flag.plain_summary}</p>
                        )}
                        <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2 mt-2">
                          <Lightbulb size={13} className="text-[#c4a574] mt-0.5 shrink-0" />
                          <p className="text-[#c4a574] text-xs font-medium leading-relaxed">{flag.tip}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
