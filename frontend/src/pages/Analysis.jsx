import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Languages, ChevronDown, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api'
import ChatDrawer from '../components/ChatDrawer'
import AppShell from '../components/AppShell'
import InsightsPanel from '../components/InsightsPanel'
import PersonalizedVerdict from '../components/PersonalizedVerdict'
import OmissionRadar from '../components/OmissionRadar'
import RiskDistributionChart from '../components/RiskDistributionChart'
import { LANGUAGES, getSavedLang, saveLang, API_BASE } from '../languages'


function scoreTone(score) {
  if (score >= 70) return 'text-red-400'
  if (score >= 45) return 'text-amber-300'
  return 'text-emerald-400'
}

function badge(sev) {
  const map = {
    Critical: 'text-red-400 bg-red-400/10',
    High: 'text-orange-400 bg-orange-400/10',
    Medium: 'text-amber-300 bg-amber-300/10',
    Low: 'text-sky-400 bg-sky-400/10',
    Clean: 'text-emerald-400 bg-emerald-400/10',
  }
  return map[sev] || 'text-stone-400 bg-white/5'
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

  // Filter clauses based on user-selected risk tier from chart
  const filteredClauses = clauses.filter(c => {
    if (!selectedSeverity) return true
    if (selectedSeverity === 'red') return c.severity === 'Critical' || (c.risk_score >= 70)
    if (selectedSeverity === 'orange') return (c.severity === 'High' && c.risk_score < 70) || (c.risk_score >= 50 && c.risk_score < 70)
    if (selectedSeverity === 'yellow') return (c.severity === 'Medium' && c.risk_score < 50) || (c.risk_score >= 30 && c.risk_score < 50)
    if (selectedSeverity === 'green') return c.severity === 'Clean' || c.severity === 'Low' || (c.risk_score < 30)
    return true
  })

  useEffect(() => {
    API.get(`/profile/${contractId}`).then(res => setProfile(res.data)).catch(() => {})
  }, [contractId])

  useEffect(() => {
    let eventSource
    async function run() {
      try {
        const res = await API.get(`/report/${contractId}`)
        setContract(res.data)
      } catch { /* first run */ }
      setIsAnalyzing(true)
      setClauses([])
      const token = localStorage.getItem('token') || ''
      eventSource = new EventSource(`${API_BASE}/analyze/${contractId}?lang=${lang}&token=${encodeURIComponent(token)}`)
      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.done) {
          setIsAnalyzing(false)
          eventSource.close()
          API.get(`/report/${contractId}`).then(r => setContract(r.data)).catch(() => {})
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
      }
      eventSource.onerror = () => {
        eventSource.close()
        setIsAnalyzing(false)
      }
    }
    run()
    return () => eventSource?.close()
  }, [contractId, lang])

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-stone-500 mb-2 hover:text-white">← Home</button>
            <h1 className="text-2xl font-semibold text-[#f4f1ea]">{contract?.filename || 'Reading your document'}</h1>
            <p className="text-sm text-stone-500 mt-1">{contract?.contract_type || ''} {contract?.total_clauses ? `· ${contract.total_clauses} parts` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="input !py-2 !px-3 flex items-center gap-2 text-sm">
                <Languages size={14} /> {LANGUAGES.find(l => l.code === lang)?.label}
                <ChevronDown size={14} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 card overflow-hidden z-20">
                  {LANGUAGES.map(l => (
                    <button key={l.code} className="w-full text-left px-3 py-2 text-sm hover:bg-white/5" onClick={() => { setLang(l.code); saveLang(l.code); setLangOpen(false) }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button disabled={isAnalyzing} onClick={() => navigate(`/report/${contractId}`)} className="btn-primary !py-2 text-sm">Full report</button>
          </div>
        </div>

        {/* Personalized Affordability & Life Context Verdict */}
        <PersonalizedVerdict contractId={contractId} />

        <div className="card p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">Overall risk</p>
            <p className={`text-4xl sm:text-5xl font-semibold mt-1.5 ${scoreTone(overall || 0)}`}>
              {overall == null && isAnalyzing ? '—' : overall ?? 0}
              <span className="text-base sm:text-lg text-stone-500 font-normal"> / 100</span>
            </p>
            <p className="text-xs text-stone-500 mt-1.5">Average of each part. Higher means more caution.</p>
          </div>
          <div className="text-xs sm:text-sm flex sm:flex-col flex-wrap gap-x-4 gap-y-1 text-stone-400 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 w-full sm:w-auto">
            <p><span className="text-red-400 font-semibold">Serious:</span> {clauses.filter(c => c.severity === 'Critical' || c.severity === 'High').length}</p>
            <p><span className="text-emerald-400 font-semibold">Okay:</span> {clauses.filter(c => c.severity === 'Low' || c.severity === 'Clean').length}</p>
            <p><span className="text-stone-300 font-semibold">Read:</span> {clauses.length} parts</p>
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
          <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 mb-4 text-xs">
            <span className="text-purple-300 font-semibold flex items-center gap-2">
              <Filter size={13} />
              Filtering by: <span className="uppercase font-bold text-white">{selectedSeverity}</span> ({filteredClauses.length} of {clauses.length} parts)
            </span>
            <button
              onClick={() => setSelectedSeverity(null)}
              className="text-purple-300 hover:text-white underline cursor-pointer font-bold"
            >
              Reset Filter
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
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-stone-500">Part {clause.clause_number} · {clause.category}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${badge(clause.severity)}`}>{clause.severity} · {clause.risk_score}</span>
                </div>
                <p className="text-stone-400 text-sm leading-relaxed mb-4">{clause.clause_text}</p>
                <h3 className="text-sm font-medium text-[#c4a574] mb-1">In simple words</h3>
                <p className="text-[#f4f1ea] mb-3">{clause.plain_summary}</p>
                {clause.simple_takeaway && (
                  <p className="text-sm text-stone-300 border-l-2 border-[#c4a574] pl-3 mb-4">For you: {clause.simple_takeaway}</p>
                )}
                {(clause.severity === 'Critical' || clause.severity === 'High') && (
                  <p className="text-sm text-red-300/90 mb-4 flex gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" />{clause.explanation}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {clause.rights?.length > 0 && (
                    <div>
                      <p className="text-emerald-400/90 text-xs mb-1">You can</p>
                      {clause.rights.map((r, i) => (
                        <p key={i} className="text-stone-300 flex gap-2 mb-1"><Check size={14} className="mt-0.5 text-emerald-400" />{r}</p>
                      ))}
                    </div>
                  )}
                  {clause.obligations?.length > 0 && (
                    <div>
                      <p className="text-amber-400/90 text-xs mb-1">You must</p>
                      {clause.obligations.map((o, i) => (
                        <p key={i} className="text-stone-300 mb-1">• {o}</p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {isAnalyzing && (
            <div className="text-center py-10 text-stone-400 text-sm">Reading the next part…</div>
          )}
        </div>
      </div>
      <ChatDrawer contractId={contractId} lang={lang} isOpen={isChatOpen} setIsOpen={setIsChatOpen} profile={profile} />
    </AppShell>
  )
}
