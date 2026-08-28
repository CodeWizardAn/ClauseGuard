import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Languages, ChevronDown, Filter, Activity, FileSearch, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api'
import ChatDrawer from '../components/ChatDrawer'
import AppShell from '../components/AppShell'
import InsightsPanel from '../components/InsightsPanel'
import PersonalizedVerdict from '../components/PersonalizedVerdict'
import OmissionRadar from '../components/OmissionRadar'
import RiskDistributionChart, { getClauseTier } from '../components/RiskDistributionChart'
import { LANGUAGES, getSavedLang, saveLang, API_BASE } from '../languages'


function scoreTone(score) {
  if (score >= 70) return 'text-red-600'
  if (score >= 45) return 'text-amber-600'
  return 'text-emerald-600'
}

function badge(sev) {
  const map = {
    Critical: 'text-red-700 bg-red-50 border border-red-200',
    High: 'text-orange-700 bg-orange-50 border border-orange-200',
    Medium: 'text-amber-700 bg-amber-50 border border-amber-200',
    Low: 'text-sky-700 bg-sky-50 border border-sky-200',
    Clean: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  }
  return map[sev] || 'text-slate-600 bg-slate-100 border border-slate-200'
}

function getScanPhase(pct) {
  if (pct < 20) return { title: "Sanitizing PII & Indexing Vector Nodes", desc: "Redacting sensitive data & generating semantic embeddings" }
  if (pct < 50) return { title: "Auditing Terms against Indian Statutes", desc: "Evaluating Indian Contract Act (Sec 23, 27, 74) & Consumer Protection Act" }
  if (pct < 80) return { title: "Running Omission Radar & Asymmetry Checks", desc: "Checking for missing tenant, borrower & statutory protections" }
  return { title: "Synthesizing Plain-Language Takeaways", desc: "Generating fairer counter-clauses & risk distribution matrix" }
}

export default function Analysis() {
  const { contractId } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [clauses, setClauses] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [lang, setLang] = useState(getSavedLang())
  const [langOpen, setLangOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [selectedSeverity, setSelectedSeverity] = useState(null)
  const overall = contract?.overall_score ?? (clauses.length ? Math.round(clauses.reduce((s, c) => s + (c.risk_score || 0), 0) / clauses.length) : null)
  const totalExpected = contract?.total_clauses || 0
  const progressPct = totalExpected > 0 ? Math.min(100, Math.round((clauses.length / totalExpected) * 100)) : (isAnalyzing ? 12 : 100)
  
  const currentPhase = getScanPhase(progressPct)

  // Filter clauses based on user-selected risk tier from chart with 100% exact alignment
  const filteredClauses = clauses.filter(c => {
    if (!selectedSeverity) return true
    return getClauseTier(c) === selectedSeverity
  })


  useEffect(() => {
    API.get(`/profile/${contractId}`).then(res => setProfile(res.data)).catch(() => {})
  }, [contractId])

  useEffect(() => {
    let eventSource
    let mounted = true
    async function run() {
      try {
        const res = await API.get(`/report/${contractId}`)
        if (mounted) {
          setContract(res.data)
          if (res.data?.results && res.data.results.length > 0 && res.data?.status === 'complete') {
            setClauses(res.data.results)
            setIsAnalyzing(false)
            return
          }
        }
      } catch { /* first run */ }
      if (!mounted) return
      setIsAnalyzing(true)
      setClauses([])
      const token = localStorage.getItem('token') || ''
      eventSource = new EventSource(`${API_BASE}/analyze/${contractId}?lang=${lang}&token=${encodeURIComponent(token)}`)
      eventSource.onmessage = (e) => {
        if (!mounted) return
        try {
          const data = JSON.parse(e.data)
          if (data.done) {
            setIsAnalyzing(false)
            eventSource.close()
            API.get(`/report/${contractId}`).then(r => { if (mounted) setContract(r.data) }).catch(() => {})
          } else if (!data.error) {
            setClauses(prev => {
              const i = prev.findIndex(c => c.clause_number === data.clause_number)
              if (i >= 0) {
                const next = [...prev]
                next[i] = data
                return next
              }
              return [...prev, data]
            })
          }
        } catch { /* parse fallback */ }
      }
      eventSource.onerror = () => {
        eventSource.close()
        if (mounted) setIsAnalyzing(false)
      }
    }
    run()
    return () => { mounted = false; eventSource?.close() }
  }, [contractId, lang])

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-slate-500 mb-2 hover:text-orange-600 flex items-center gap-1 transition-colors">
              ← Home
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{contract?.filename || 'Reading your document'}</h1>
            <p className="text-sm text-slate-600 font-medium mt-1">{contract?.contract_type || ''} {contract?.total_clauses ? `· ${contract.total_clauses} parts` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="input !py-2 !px-3 flex items-center gap-2 text-sm font-semibold bg-white border-slate-200 text-slate-800">
                <Languages size={15} className="text-orange-600" /> {LANGUAGES.find(l => l.code === lang)?.label}
                <ChevronDown size={14} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 card bg-white border-slate-200 overflow-hidden z-20 shadow-xl">
                  {LANGUAGES.map(l => (
                    <button key={l.code} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-medium transition-colors" onClick={() => { setLang(l.code); saveLang(l.code); setLangOpen(false) }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button disabled={isAnalyzing} onClick={() => navigate(`/report/${contractId}`)} className="btn-primary !py-2 text-sm font-bold">Full report</button>
          </div>
        </div>

        {/* Personalized Affordability & Life Context Verdict */}
        <PersonalizedVerdict contractId={contractId} />

        {/* ── AI Scanner HUD (Shown while analyzing) — White & Orange Theme ── */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-8 border border-orange-200 bg-white relative overflow-hidden shadow-lg shadow-orange-500/5"
          >
            {/* Top Scanning Laser Sweep */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer" />

            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 border border-orange-300 text-orange-600">
                  <Activity size={20} className="animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                      Live AI Document Scan
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-bold font-mono">
                      {progressPct}%
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 tracking-tight">
                    {currentPhase.title}
                  </h3>
                </div>
              </div>

              {/* Progress Count Badge */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                  <FileSearch size={15} className="text-orange-600" />
                  <span>Clause <strong className="text-slate-900 font-mono text-sm">{clauses.length}</strong> of <strong className="text-slate-900 font-mono text-sm">{totalExpected || '...'}</strong></span>
                </div>
              </div>
            </div>

            {/* Glowing High-Tech Progress Bar */}
            <div className="relative h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-5">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #ea580c 0%, #f97316 50%, #f59e0b 100%)',
                  boxShadow: '0 0 14px rgba(234, 88, 12, 0.4)'
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>

            {/* 4-Stage Visual Audit Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { title: "PII Scrub", sub: "Redacting IDs & PAN", min: 0 },
                { title: "Statute Audit", sub: "Contract Act & RERA", min: 25 },
                { title: "Omission Radar", sub: "Missing protections", min: 55 },
                { title: "Fair Takeaways", sub: "Generating rewrites", min: 80 },
              ].map((step, idx) => {
                const isPassed = progressPct >= step.min + 25
                const isCurrent = progressPct >= step.min && progressPct < step.min + 25

                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 border transition-all ${
                      isPassed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : isCurrent
                        ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">{step.title}</span>
                      {isPassed ? (
                        <Check size={13} className="text-emerald-600 stroke-[3]" />
                      ) : isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                      ) : (
                        <span className="text-[10px] font-mono opacity-50">0{idx + 1}</span>
                      )}
                    </div>
                    <p className="text-[10px] truncate opacity-80 font-medium">{step.sub}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Dimension 1: Legal Terms Risk Card ── */}
        <div className="card p-5 sm:p-6 mb-8 border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-orange-600 font-extrabold">
                ⚖️ Legal Terms Risk Index
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                Contract Clauses Audit
              </span>
            </div>
            <p className={`text-4xl sm:text-5xl font-black mt-2 tracking-tight ${scoreTone(overall || 0)}`}>
              {overall == null && isAnalyzing ? '—' : overall ?? 0}
              <span className="text-base sm:text-lg text-slate-400 font-normal"> / 100</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md font-medium">
              Measures clause fairness, penalties, and legal liabilities. Higher score = more one-sided clauses.
            </p>
          </div>
          <div className="text-xs sm:text-sm flex sm:flex-col flex-wrap gap-x-4 gap-y-1 text-slate-700 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto bg-slate-50 sm:p-3.5 sm:rounded-xl sm:border sm:border-slate-200">
            <p><span className="text-red-700 font-bold">Risky / Severe:</span> {clauses.filter(c => c.severity === 'Critical' || c.severity === 'High').length} clauses</p>
            <p><span className="text-amber-700 font-bold">Moderate:</span> {clauses.filter(c => c.severity === 'Medium').length} clauses</p>
            <p><span className="text-emerald-700 font-bold">Safe / Standard:</span> {clauses.filter(c => c.severity === 'Low' || c.severity === 'Clean').length} clauses</p>
            <p className="text-slate-500 pt-1 border-t border-slate-200 text-[11px] font-medium"><strong className="text-slate-900">{clauses.length}</strong> clauses audited in total</p>
          </div>
        </div>


        {/* Interactive Risk Distribution Pie/Donut Chart */}
        {clauses.length > 0 && (
          <RiskDistributionChart
            clauses={clauses}
            onFilterSeverity={setSelectedSeverity}
            selectedSeverity={selectedSeverity}
          />
        )}

        {/* AI Insights Panel — shown after analysis completes */}
        {!isAnalyzing && <InsightsPanel contractId={contractId} />}

        {/* What's Missing? Omission Radar — shown after analysis completes */}
        {!isAnalyzing && <OmissionRadar contractId={contractId} />}

        {/* Filter Indicator Badge if active */}
        {selectedSeverity && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-orange-50 border border-orange-200 mb-4 text-xs">
            <span className="text-orange-900 font-bold flex items-center gap-2">
              <Filter size={13} className="text-orange-600" />
              Filtering: <span className="uppercase font-extrabold text-orange-700">{selectedSeverity}</span> ({filteredClauses.length}/{clauses.length})
            </span>
            <button
              onClick={() => setSelectedSeverity(null)}
              className="text-orange-700 hover:text-orange-950 underline cursor-pointer font-bold"
            >
              Reset
            </button>
          </div>
        )}

        <div className="space-y-5">
          <AnimatePresence>
            {filteredClauses.map(clause => (

              <motion.article
                key={clause.clause_number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 bg-white border border-slate-200 hover:border-orange-300 shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Part {clause.clause_number} · {clause.category}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge(clause.severity)}`}>{clause.severity} · {clause.risk_score}</span>
                </div>
                <p className="text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm leading-relaxed mb-4 font-mono">{clause.clause_text}</p>
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">In simple words</h3>
                <p className="text-slate-900 font-semibold text-base mb-3 leading-snug">{clause.plain_summary}</p>
                {clause.simple_takeaway && (
                  <p className="text-sm font-medium text-slate-800 bg-amber-50/70 border-l-4 border-amber-500 pl-3 py-2 rounded-r-lg mb-4">For you: {clause.simple_takeaway}</p>
                )}
                {(clause.severity === 'Critical' || clause.severity === 'High') && (
                  <p className="text-sm text-red-800 bg-red-50 border border-red-200 p-3 rounded-xl mb-4 flex gap-2 font-medium"><AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" />{clause.explanation}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {clause.rights?.length > 0 && (
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl">
                      <p className="text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">You can</p>
                      {clause.rights.map((r, i) => (
                        <p key={i} className="text-slate-700 flex gap-2 mb-1 text-xs font-medium"><Check size={14} className="mt-0.5 text-emerald-600 shrink-0" />{r}</p>
                      ))}
                    </div>
                  )}
                  {clause.obligations?.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
                      <p className="text-amber-800 font-bold text-xs uppercase tracking-wider mb-2">You must</p>
                      {clause.obligations.map((o, i) => (
                        <p key={i} className="text-slate-700 mb-1 text-xs font-medium">• {o}</p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          
          {/* Active Live Scanning Radar Placeholder Card for Next Clause */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-6 border-dashed border-orange-300 bg-orange-50/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-shimmer" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-xs font-bold text-orange-900">
                    Scanning Clause #{clauses.length + 1}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium font-mono">Auditing against statutory rules...</span>
              </div>
              <div className="space-y-2.5">
                <div className="h-3.5 bg-slate-200 rounded-full w-full animate-pulse" />
                <div className="h-3.5 bg-slate-200 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="h-3.5 bg-slate-200 rounded-full w-2/3 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <ChatDrawer contractId={contractId} lang={lang} isOpen={isChatOpen} setIsOpen={setIsChatOpen} profile={profile} />
    </AppShell>
  )
}
