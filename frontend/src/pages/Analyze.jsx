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
        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap size={14} className="text-orange-600" /> Contract Scanner
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Audit a <span className="text-orange-600">Legal Document</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
            Upload any contract to extract obligations, verify Indian law compliance, and detect omissions.
          </p>
        </div>

        {/* Dropzone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`card p-8 sm:p-10 text-center mb-6 border-2 border-dashed bg-white shadow-sm transition-all ${
            dragActive ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' : 'border-orange-300 hover:border-orange-500'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-orange-500/10">
            <UploadCloud size={28} className="stroke-[2.2]" />
          </div>
          
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Drag & drop your contract here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
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
            className="btn-primary !px-8 !py-3.5 text-base font-bold shadow-lg shadow-orange-500/20" 
            onClick={() => fileRef.current?.click()}
          >
            <FileText size={18} />
            <span>{busy ? 'Processing document…' : 'Browse File from Computer'}</span>
          </button>
        </div>

        {/* Optional Question */}
        <div className="card p-5 mb-8 bg-white border-slate-200 shadow-sm">
          <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider flex items-center justify-between">
            <span>Ask a specific question (Optional)</span>
            <span className="text-[11px] text-orange-600 font-semibold normal-case">e.g. Is there any penal interest?</span>
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
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Samples */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
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
                  className="card p-4 text-left group bg-white border-slate-200 hover:border-orange-300 flex items-start gap-3.5 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed font-medium">
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
