import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../api'

const STATUS_CONFIG = {
  Missing: {
    badge: 'Missing Protection',
    cardBorder: 'border-red-500/20 bg-red-950/10',
    badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  Weak: {
    badge: 'Inadequate / One-Sided',
    cardBorder: 'border-amber-500/20 bg-amber-950/10',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  Covered: {
    badge: 'Adequately Covered',
    cardBorder: 'border-zinc-800 bg-zinc-900/30',
    badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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
      <div className="card p-4 mb-6 flex items-center gap-2.5 text-zinc-400 text-xs">
        <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
        Auditing document against statutory standard protections…
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
    <div className="card mb-6 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-900/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center">
            <AlertCircle size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100 text-sm">
                Omission Audit (Missing Protections)
              </span>
              {missingCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  {missingCount} Missing
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Checked against Indian statutory requirements</p>
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
              {/* Summary */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                <p className="text-xs text-zinc-300 leading-relaxed">{data.verdict_summary}</p>
                <div className="text-right shrink-0">
                  <span className="text-lg font-semibold text-zinc-100">{data.omission_score ?? 50}</span>
                  <span className="text-xs text-zinc-500">/100</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    filter === 'all'
                      ? 'bg-zinc-100 text-zinc-900 font-semibold border-zinc-100'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  All ({items.length})
                </button>
                {missingCount > 0 && (
                  <button
                    onClick={() => setFilter('Missing')}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      filter === 'Missing'
                        ? 'bg-red-500 text-white font-semibold border-red-500'
                        : 'bg-zinc-900 text-red-400 border-zinc-800 hover:border-red-500/30'
                    }`}
                  >
                    Missing ({missingCount})
                  </button>
                )}
                {weakCount > 0 && (
                  <button
                    onClick={() => setFilter('Weak')}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      filter === 'Weak'
                        ? 'bg-amber-500 text-zinc-900 font-semibold border-amber-500'
                        : 'bg-zinc-900 text-amber-400 border-zinc-800 hover:border-amber-500/30'
                    }`}
                  >
                    Inadequate ({weakCount})
                  </button>
                )}
                {coveredCount > 0 && (
                  <button
                    onClick={() => setFilter('Covered')}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      filter === 'Covered'
                        ? 'bg-zinc-100 text-zinc-900 font-semibold border-zinc-100'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Covered ({coveredCount})
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="space-y-3 pt-1">
                {filteredItems.map((item, idx) => {
                  const statusKey = item.status?.includes('Weak') ? 'Weak' : (STATUS_CONFIG[item.status] ? item.status : 'Missing')
                  const conf = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Missing

                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-4 space-y-2.5 ${conf.cardBorder}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${conf.badgeStyle}`}>
                            {conf.badge}
                          </span>
                          {item.statute && (
                            <span className="text-xs text-zinc-400">{item.statute}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">{item.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.why_it_matters}</p>
                      </div>

                      {item.suggested_clause_to_insert && item.status !== 'Covered' && (
                        <div className="mt-2.5 p-3 rounded bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                              Recommended Protective Clause
                            </span>
                            <button
                              onClick={() => copyClause(item.suggested_clause_to_insert, idx)}
                              className="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium flex items-center gap-1 transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-900/50 p-2 rounded border border-zinc-800 select-all">
                            "{item.suggested_clause_to_insert}"
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
