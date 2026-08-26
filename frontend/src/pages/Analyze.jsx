import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Home, Briefcase, Landmark, Building, ArrowLeft, AlertCircle, FileText } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

const SAMPLES = [
  { id: 'rental', icon: Home, label: 'Rental Agreement', desc: '11-month residential lease with deposit clauses' },
  { id: 'loan', icon: Landmark, label: 'Personal / Home Loan', desc: 'Loan terms with EMI, interest, and penal charges' },
  { id: 'tos', icon: Briefcase, label: 'Terms of Service', desc: 'Commercial agreement with liability and IP clauses' },
  { id: 'govt', icon: Building, label: 'Government Circular', desc: 'Regulatory guidelines and statutory notices' },
]

export default function Analyze() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const go = async (contractId) => {
    if (question.trim()) {
      try {
        const me = (await API.get('/auth/me')).data
        await API.post(`/profile/${contractId}`, {
          role: me.role || 'everyday person',
          worry: me.worry || 'hidden risks',
          language: me.language || 'en',
          question: question.trim(),
        })
      } catch { /* continue */ }
    }
    navigate(`/smart-context/${contractId}`)
  }

  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await API.post('/upload', form)
      await go(res.data.contract_id)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not process this file. Please upload a PDF, Word (.docx), or Text (.txt) file.')
    } finally {
      setBusy(false)
    }
  }

  const sample = async (id) => {
    setBusy(true)
    setError('')
    try {
      const res = await API.post('/upload_sample', { sample_id: id, language: localStorage.getItem('cg-lang') || 'en' })
      await go(res.data.contract_id)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load the sample document.')
    } finally {
      setBusy(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      upload(e.dataTransfer.files[0])
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Analyze Contract
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload your document or choose a sample to inspect clauses and statutory compliance.
          </p>
        </div>

        {/* Dropzone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`card p-8 text-center mb-5 border-dashed transition-all ${
            dragActive ? 'border-zinc-500 bg-zinc-900/80' : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 flex items-center justify-center mx-auto mb-3">
            <UploadCloud size={20} />
          </div>
          
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">
            Upload document for analysis
          </h3>
          <p className="text-xs text-zinc-500 mb-5">
            PDF, DOCX, or TXT format (up to 25 MB)
          </p>

          <input 
            ref={fileRef} 
            type="file" 
            accept=".pdf,.docx,.txt" 
            className="hidden" 
            onChange={e => upload(e.target.files?.[0])} 
          />

          <button 
            disabled={busy} 
            className="btn-primary" 
            onClick={() => fileRef.current?.click()}
          >
            <FileText size={14} />
            {busy ? 'Processing document…' : 'Select File'}
          </button>
        </div>

        {/* Optional Question */}
        <div className="card p-4 mb-6">
          <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
            Specific question or focus area (Optional)
          </label>
          <input 
            className="input" 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="e.g. What is the penalty for early termination?" 
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-6">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Samples */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Or test with sample documents
          </h2>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {SAMPLES.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  disabled={busy}
                  onClick={() => sample(s.id)}
                  className="card p-3.5 text-left group hover:border-zinc-700 flex items-start gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700/80 text-zinc-300 flex items-center justify-center shrink-0 group-hover:text-zinc-100 transition-colors">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {s.label}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {s.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
