import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Download, Share2, Copy, CheckCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import API from '../api'
import AppShell from '../components/AppShell'
import RiskDistributionChart from '../components/RiskDistributionChart'

// ── Risk Gauge (SVG arc) ──────────────────────────────────────────
function RiskGauge({ score }) {
  const r = 52
  const cx = 70, cy = 70
  const circumference = Math.PI * r          // half circle
  const fillLen = (Math.min(100, Math.max(0, score)) / 100) * circumference

  const color =
    score >= 70 ? '#dc2626'
    : score >= 45 ? '#d97706'
    : '#059669'

  const label =
    score >= 70 ? 'High Risk'
    : score >= 45 ? 'Moderate'
    : 'Low Risk'

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="84" viewBox="0 0 140 84">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(15,23,42,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${fillLen} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#0f172a" fontSize="26" fontWeight="800">
          {score}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
          / 100
        </text>
      </svg>
      <span className="text-xs font-bold mt-1 uppercase tracking-wider" style={{ color }}>{label} Legal Terms</span>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy counter-clause' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-950 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
    >
      {copied ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ── Share button ──────────────────────────────────────────────────
function ShareButton() {
  const [copied, setCopied] = useState(false)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg transition-all shadow-sm"
    >
      {copied ? <CheckCheck size={14} className="text-emerald-600" /> : <Share2 size={14} />}
      {copied ? 'Link copied!' : 'Share report'}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function Report() {
  const { contractId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState(null)
  const [omissions, setOmissions] = useState(null)

  useEffect(() => {
    API.get(`/report/${contractId}`)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load this report.'))
  }, [contractId])

  useEffect(() => {
    if (!contractId) return
    API.get(`/omissions/${contractId}`)
      .then(res => setOmissions(res.data))
      .catch(() => {})
  }, [contractId])

  const download = async () => {
    try {
      const response = await API.get(`/report/${contractId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'ClauseGuard_Report.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Finish the analysis first, then download.')
    }
  }

  if (error) return <AppShell><p className="p-12 text-red-600 font-bold">{error}</p></AppShell>
  if (!data) return <AppShell><p className="p-12 text-slate-500 font-medium">Preparing report…</p></AppShell>

  const risky = (data.results || []).filter(c => c.severity === 'Critical' || c.severity === 'High')
  const avg = data.overall_score
  const missingCount = omissions?.missing_clauses?.length || 0

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/analysis/${contractId}`)} className="text-sm font-semibold text-slate-500 mb-6 hover:text-orange-600 transition-colors">← Back to clauses</button>

        {/* ── Hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-6 bg-white border-slate-200 flex flex-col sm:flex-row items-center gap-8 shadow-sm"
        >
          <RiskGauge score={avg ?? 0} />

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-orange-600 mb-2">Legal Document Report</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{data.filename}</h1>
            <p className="text-slate-500 text-sm font-medium mb-4">{data.contract_type} · {data.total_clauses} clauses audited</p>
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              <button
                onClick={download}
                className="btn-primary !py-2 !px-4 text-xs font-bold"
              >
                <Download size={14} /> Download PDF
              </button>
              <ShareButton />
            </div>
          </div>
        </motion.div>

        {/* ── Omission alert banner ── */}
        {missingCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 shadow-sm"
          >
            <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-900 text-sm font-bold">
                {missingCount} protective clause{missingCount > 1 ? 's' : ''} missing
              </p>
              <p className="text-amber-800 text-xs mt-0.5 font-medium leading-relaxed">
                Your Omission Radar detected clauses that should be present under Indian standards. Review the Analysis page for ready-to-insert counter-clauses.
              </p>
            </div>
          </motion.div>
        )}

        {data.profile?.question && (
          <div className="card p-5 mb-6 bg-white border-slate-200 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your question</p>
            <p className="text-slate-900 font-semibold">{data.profile.question}</p>
          </div>
        )}

        {/* Interactive Risk Breakdown Spectrum */}
        {data.results && data.results.length > 0 && (
          <RiskDistributionChart
            clauses={data.results}
            onFilterSeverity={setSelectedSeverity}
            selectedSeverity={selectedSeverity}
          />
        )}

        {/* Watch these parts */}
        <div className="card p-6 mb-6 bg-white border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Watch these parts</h2>

          {risky.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium">Nothing marked as high risk. Still read before you sign.</p>
          ) : (
            <ul className="space-y-4">
              {risky.map(c => (
                <li key={c.clause_number} className="flex flex-col gap-2 text-sm border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-3 text-slate-800 font-medium">
                    <AlertCircle size={17} className="text-orange-600 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900 font-bold">Part {c.clause_number} (Risk: {c.risk_score})</strong> — {c.simple_takeaway || c.plain_summary}
                    </span>
                  </div>
                  {/* Copy counter-clause button */}
                  {c.rewrite && (
                    <div className="ml-7">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Suggested counter-clause:</p>
                      <p className="text-xs text-slate-700 italic bg-orange-50/50 border border-orange-200/80 rounded-lg px-3.5 py-2.5 mb-2 leading-relaxed font-mono">
                        "{c.rewrite}"
                      </p>
                      <CopyButton text={c.rewrite} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* All clauses summary */}
        <div className="space-y-3 mb-8">
          {(data.results || [])
            .filter(c => !selectedSeverity || c.severity === selectedSeverity)
            .map(c => (
              <div key={c.clause_number} className="card p-5 bg-white border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  <span>Part {c.clause_number} · {c.category}</span>
                  <span className="text-orange-600">{c.severity} · {c.risk_score}</span>
                </div>
                <p className="text-sm text-slate-800 font-semibold leading-relaxed">{c.plain_summary}</p>
                {c.rewrite && (c.severity === 'Critical' || c.severity === 'High') && (
                  <div className="mt-3">
                    <CopyButton text={c.rewrite} label="Copy fairer clause" />
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="flex gap-3">
          <button onClick={download} className="btn-primary !py-3 !px-6 text-sm font-bold shadow-md shadow-orange-500/20">
            <Download size={16} className="inline mr-2" />Download PDF
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4 font-medium">{data.privacy_note}</p>
      </div>
    </AppShell>
  )
}
