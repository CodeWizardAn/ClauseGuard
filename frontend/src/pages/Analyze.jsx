import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Home, Briefcase, Landmark, Building, ArrowLeft, AlertCircle, FileText, Zap } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

const SAMPLES = [
  { id: 'rental', icon: Home, label: 'Rental Agreement', desc: '11-month residential lease with deposit clauses' },
  { id: 'loan', icon: Landmark, label: 'Personal / Home Loan', desc: 'Bank loan terms with EMI, interest, and penal charges' },
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
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap size={13} className="text-purple-400" /> Contract Scanner
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Audit a <span className="text-gradient-purple">Legal Document</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Upload any contract to extract obligations, verify Indian law compliance, and detect omissions.
          </p>
        </div>

        {/* Dropzone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`card p-8 sm:p-10 text-center mb-6 border-2 border-dashed transition-all ${
            dragActive ? 'border-purple-500 bg-purple-500/10 scale-[1.01]' : 'border-purple-500/20 hover:border-purple-500/40'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <UploadCloud size={26} className="stroke-[2.2]" />
          </div>
          
          <h3 className="text-base font-bold text-white mb-1">
            Drag & drop your contract here
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Supports PDF, Word (.docx), and Plain Text (.txt) up to 25 MB
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
            className="btn-primary !px-7 !py-3 text-sm" 
            onClick={() => fileRef.current?.click()}
          >
            <FileText size={16} />
            <span>{busy ? 'Processing document…' : 'Browse File from Computer'}</span>
          </button>
        </div>

        {/* Optional Question */}
        <div className="card p-5 mb-8 border-purple-500/15">
          <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider flex items-center justify-between">
            <span>Ask a specific question (Optional)</span>
            <span className="text-[11px] text-purple-400/80 font-normal normal-case">e.g. Is there any penal interest?</span>
          </label>
          <input 
            className="input" 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="Type any specific question about this agreement..." 
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Samples */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Or test with sample agreements
          </h2>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {SAMPLES.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  disabled={busy}
                  onClick={() => sample(s.id)}
                  className="card p-4 text-left group hover:border-purple-500/40 flex items-start gap-3.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 group-hover:text-purple-200 transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
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
