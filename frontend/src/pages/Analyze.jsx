import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Home, Briefcase, Landmark, Building, ArrowLeft, ShieldAlert, Sparkles, FileText, CheckCircle2 } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

const SAMPLES = [
  { id: 'rental', icon: Home, label: 'Rental Agreement', desc: '11-month residential lease with deposit clauses' },
  { id: 'loan', icon: Landmark, label: 'Personal / Home Loan', desc: 'Bank loan terms with EMI, interest & penal rates' },
  { id: 'tos', icon: Briefcase, label: 'Terms of Service', desc: 'Software / SaaS contract with liability & IP clauses' },
  { id: 'govt', icon: Building, label: 'Government Circular', desc: 'Official notice & statutory guidelines' },
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
      setError(err.response?.data?.detail || 'Could not read this file. Please upload PDF, Word (.docx), or a Text (.txt) file.')
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
      setError(err.response?.data?.detail || 'Could not load the sample.')
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
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Title Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={13} /> AI Contract Scanner
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Audit a Legal Document
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Upload your draft agreement or test with a sample. All names and contact info are permanently redacted.
          </p>
        </div>

        {/* Upload Dropzone Card */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`card p-8 sm:p-10 text-center mb-6 border-2 transition-all duration-200 ${
            dragActive ? 'border-[#d4af37] bg-[#d4af37]/5 scale-[1.01]' : 'border-dashed border-white/15 hover:border-white/25'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mx-auto mb-4">
            <UploadCloud size={28} className="stroke-[2.2]" />
          </div>
          
          <h3 className="text-base font-bold text-white mb-1">
            Drag & drop your document here
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
            className="btn-primary px-7 py-3" 
            onClick={() => fileRef.current?.click()}
          >
            <FileText size={16} />
            {busy ? 'Sanitizing & Analyzing Document…' : 'Browse File from Computer'}
          </button>
        </div>

        {/* Optional Question */}
        <div className="card p-5 mb-8">
          <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider flex items-center justify-between">
            <span>Ask a specific question (Optional)</span>
            <span className="text-[11px] text-slate-500 font-normal normal-case">e.g. Can the landlord evict me in 15 days?</span>
          </label>
          <input 
            className="input" 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            placeholder="Type any specific worry or question about this agreement..." 
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 mb-6">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sample Documents Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Or test with pre-loaded sample agreements
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {SAMPLES.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  disabled={busy}
                  onClick={() => sample(s.id)}
                  className="card p-4 text-left group hover:border-[#d4af37]/40 flex items-start gap-3.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-[#d4af37]/15 group-hover:text-[#d4af37] group-hover:border-[#d4af37]/30 transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">
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
