import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../api'

const STATUS_CONFIG = {
  Missing: {
    badge: 'Missing Protection',
    cardBorder: 'border-red-200 bg-red-50/40',
    badgeStyle: 'bg-red-50 text-red-700 border-red-200 font-bold',
  },
  Weak: {
    badge: 'Inadequate / One-Sided',
    cardBorder: 'border-amber-200 bg-amber-50/40',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
  },
  Covered: {
    badge: 'Adequately Covered',
    cardBorder: 'border-emerald-200 bg-emerald-50/30',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
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
      .then(() => {
        setCopiedIndex(idx)
        setTimeout(() => setCopiedIndex(null), 2500)
      })
      .catch(() => {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopiedIndex(idx)
        setTimeout(() => setCopiedIndex(null), 2500)
      })
  }

  if (loading) {
    return (
      <div className="card p-4 mb-6 flex items-center gap-2.5 text-slate-500 text-xs bg-white border-slate-200 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
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
    <div className="card mb-6 overflow-hidden bg-white border-slate-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
            <AlertCircle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                Omission Audit (Missing Protections)
              </span>
              {missingCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  {missingCount} Missing
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Audits for absent standard protective terms</p>
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
              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{data.verdict_summary}</p>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-slate-900">{data.omission_score ?? 50}</span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    filter === 'all'
                      ? 'bg-orange-600 text-white font-bold border-orange-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 font-medium'
                  }`}
                >
                  All ({items.length})
                </button>
                {missingCount > 0 && (
                  <button
                    onClick={() => setFilter('Missing')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      filter === 'Missing'
                        ? 'bg-red-600 text-white font-bold border-red-600 shadow-sm'
                        : 'bg-white text-red-700 border-slate-200 hover:bg-red-50 font-medium'
                    }`}
                  >
                    Missing ({missingCount})
                  </button>
                )}
                {weakCount > 0 && (
                  <button
                    onClick={() => setFilter('Weak')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      filter === 'Weak'
                        ? 'bg-amber-500 text-white font-bold border-amber-500 shadow-sm'
                        : 'bg-white text-amber-700 border-slate-200 hover:bg-amber-50 font-medium'
                    }`}
                  >
                    Inadequate ({weakCount})
                  </button>
                )}
                {coveredCount > 0 && (
                  <button
                    onClick={() => setFilter('Covered')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      filter === 'Covered'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm'
                        : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50 font-medium'
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
                      className={`rounded-xl border p-4 space-y-2.5 ${conf.cardBorder}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${conf.badgeStyle}`}>
                            {conf.badge}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">{item.why_it_matters}</p>
                      </div>

                      {item.suggested_clause_to_insert && item.status !== 'Covered' && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-orange-200/80 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-orange-700 font-bold">
                              Recommended Protective Clause
                            </span>
                            <button
                              onClick={() => copyClause(item.suggested_clause_to_insert, idx)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold flex items-center gap-1 border border-orange-200 transition-colors shadow-sm"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={12} className="text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-800 font-mono leading-relaxed bg-orange-50/40 p-2.5 rounded-lg border border-orange-100 select-all">
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
