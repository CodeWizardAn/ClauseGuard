import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

export default function Report() {
  const { contractId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    API.get(`/report/${contractId}`)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load this report.'))
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
    } catch {
      alert('Finish the analysis first, then download.')
    }
  }

  if (error) {
    return <AppShell><p className="p-12 text-red-400">{error}</p></AppShell>
  }
  if (!data) {
    return <AppShell><p className="p-12 text-stone-500">Preparing report…</p></AppShell>
  }

  const risky = (data.results || []).filter(c => c.severity === 'Critical' || c.severity === 'High')
  const avg = data.overall_score

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/analysis/${contractId}`)} className="text-sm text-stone-500 mb-6 hover:text-white">← Back to clauses</button>

        <div className="card p-8 mb-6">
          <p className="text-xs tracking-[0.2em] uppercase text-[#c4a574] mb-3">Document report</p>
          <h1 className="text-3xl font-semibold text-[#f4f1ea] mb-2">{data.filename}</h1>
          <p className="text-stone-400 text-sm">{data.contract_type} · {data.total_clauses} parts</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-5xl font-semibold text-[#f4f1ea]">{avg}</span>
            <span className="text-stone-500 mb-1">/ 100 average risk</span>
          </div>
          <p className="text-xs text-stone-500 mt-3">{data.privacy_note}</p>
        </div>

        {data.profile?.question && (
          <div className="card p-5 mb-6">
            <p className="text-xs text-stone-500 mb-1">Your question</p>
            <p className="text-[#f4f1ea]">{data.profile.question}</p>
          </div>
        )}

        <div className="card p-6 mb-6">
          <h2 className="font-medium text-[#f4f1ea] mb-4">Watch these parts</h2>
          {risky.length === 0 ? (
            <p className="text-sm text-stone-400">Nothing marked as high risk. Still read before you sign.</p>
          ) : (
            <ul className="space-y-3">
              {risky.map(c => (
                <li key={c.clause_number} className="flex gap-3 text-sm text-stone-300">
                  <AlertCircle size={16} className="text-[#c4a574] mt-0.5 shrink-0" />
                  <span><strong className="text-[#f4f1ea]">Part {c.clause_number} ({c.risk_score})</strong> — {c.simple_takeaway || c.plain_summary}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 mb-8">
          {(data.results || []).map(c => (
            <div key={c.clause_number} className="card p-5">
              <div className="flex justify-between text-xs text-stone-500 mb-2">
                <span>Part {c.clause_number} · {c.category}</span>
                <span>{c.severity} · {c.risk_score}</span>
              </div>
              <p className="text-sm text-stone-200 leading-relaxed">{c.plain_summary}</p>
            </div>
          ))}
        </div>

        <button onClick={download} className="btn-primary">Download PDF</button>
      </div>
    </AppShell>
  )
}
