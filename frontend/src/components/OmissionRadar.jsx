import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EyeOff, AlertOctagon, AlertTriangle, ShieldCheck, Copy, Check, ChevronDown, ChevronUp, Scale, Sparkles } from 'lucide-react'
import API from '../api'

const STATUS_CONFIG = {
  Missing: {
    badge: '❌ Missing Protection',
    cardBorder: 'border-red-500/30 bg-red-500/5',
    badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/30',
    icon: AlertOctagon,
  },
  Weak: {
    badge: '⚠️ Weak / One-Sided',
    cardBorder: 'border-amber-500/30 bg-amber-500/5',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    icon: AlertTriangle,
  },
  Covered: {
    badge: '✅ Covered in Draft',
    cardBorder: 'border-emerald-500/30 bg-emerald-500/5',
    badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: ShieldCheck,
  },
}

export default function OmissionRadar({ contractId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'Missing' | 'Weak' | 'Covered'
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    if (!contractId) return
    setLoading(true)
    API.get(`/omissions/${contractId}`)
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [contractId])

  const copyClause = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2500)
  }

  if (loading) {
    return (
      <div className="card p-5 mb-8 flex items-center gap-3 text-stone-400 text-sm animate-pulse">
        <EyeOff size={18} className="text-[#c4a574]" />
        Auditing document for missing safety clauses…
      </div>
    )
  }

  if (!data || !data.checklist || data.checklist.length === 0) return null

  const items = data.checklist
  const missingCount = data.missing_count ?? items.filter(i => i.status === 'Missing').length
  const weakCount = data.weak_count ?? items.filter(i => i.status === 'Weak' || i.status?.includes('Weak')).length
  const coveredCount = data.covered_count ?? items.filter(i => i.status === 'Covered').length

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    if (filter === 'Missing') return item.status === 'Missing'
    if (filter === 'Weak') return item.status === 'Weak' || item.status?.includes('Weak')
    if (filter === 'Covered') return item.status === 'Covered'
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 overflow-hidden border-[#c4a574]/25 bg-gradient-to-br from-[#121922] via-[#0e141c] to-[#090d12]"
    >
      {/* Header Button */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-white/2 transition-colors text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <EyeOff size={16} />
          </div>
          <div>
            <span className="font-semibold text-[#f4f1ea] text-sm sm:text-base tracking-wide flex items-center gap-2">
              "What's Missing?" Trap Detector
              {missingCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {missingCount} Omissions Detected
                </span>
              )}
            </span>
            <p className="text-xs text-stone-500 mt-0.5">Audited against standard Indian statutory protections</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-stone-500 shrink-0 ml-2" /> : <ChevronDown size={18} className="text-stone-500 shrink-0 ml-2" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 sm:px-6 pb-6 border-t border-white/5 pt-5 space-y-5">
              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#c4a574] font-semibold flex items-center gap-1.5">
                    <Scale size={14} /> Legal Protection Score
                  </p>
                  <p className="text-sm text-stone-300 mt-1 leading-relaxed">{data.verdict_summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-[#f4f1ea]">{data.omission_score ?? 50}</span>
                  <span className="text-xs text-stone-500">/100</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-[#c4a574] text-[#0c1118] font-semibold border-[#c4a574]'
                      : 'bg-white/5 text-stone-400 border-white/10 hover:border-stone-500 hover:text-white'
                  }`}
                >
                  All ({items.length})
                </button>
                {missingCount > 0 && (
                  <button
                    onClick={() => setFilter('Missing')}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      filter === 'Missing'
                        ? 'bg-red-500 text-white font-semibold border-red-500'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/40'
                    }`}
                  >
                    Missing 🚨 ({missingCount})
                  </button>
                )}
                {weakCount > 0 && (
                  <button
                    onClick={() => setFilter('Weak')}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      filter === 'Weak'
                        ? 'bg-amber-500 text-stone-900 font-semibold border-amber-500'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    Weak ⚠️ ({weakCount})
                  </button>
                )}
                {coveredCount > 0 && (
                  <button
                    onClick={() => setFilter('Covered')}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      filter === 'Covered'
                        ? 'bg-emerald-500 text-white font-semibold border-emerald-500'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    Covered ✅ ({coveredCount})
                  </button>
                )}
              </div>

              {/* Protection Cards Checklist */}
              <div className="space-y-4 pt-1">
                {filteredItems.map((item, idx) => {
                  const statusKey = item.status?.includes('Weak') ? 'Weak' : (STATUS_CONFIG[item.status] ? item.status : 'Missing')
                  const conf = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Missing

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-xl border p-4.5 space-y-3 ${conf.cardBorder}`}
                    >
                      {/* Top status bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${conf.badgeStyle}`}>
                            {conf.badge}
                          </span>
                          {item.statute && (
                            <span className="text-xs text-stone-400 font-medium">· 🏛️ {item.statute}</span>
                          )}
                        </div>
                        {item.severity && (
                          <span className="text-[11px] text-stone-500 uppercase tracking-wider">{item.severity}</span>
                        )}
                      </div>

                      {/* Title & Risk */}
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-[#f4f1ea]">{item.name}</h4>
                        <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">{item.why_it_matters}</p>
                      </div>

                      {/* Suggested Clause To Insert */}
                      {item.suggested_clause_to_insert && item.status !== 'Covered' && (
                        <div className="mt-3 p-3.5 rounded-lg bg-[#0c1118] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] uppercase tracking-wider text-[#c4a574] font-semibold flex items-center gap-1">
                              <Sparkles size={12} /> Proposed Protective Clause to Insert
                            </span>
                            <button
                              onClick={() => copyClause(item.suggested_clause_to_insert, idx)}
                              className="text-xs px-2.5 py-1 rounded bg-[#c4a574]/15 hover:bg-[#c4a574]/25 text-[#c4a574] font-medium flex items-center gap-1 transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy Clause</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-stone-300 font-mono leading-relaxed bg-black/20 p-2.5 rounded border border-white/5 select-all">
                            "{item.suggested_clause_to_insert}"
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
