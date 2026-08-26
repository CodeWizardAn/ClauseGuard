import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Home, Briefcase, Landmark, Building } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

const SAMPLES = [
  { id: 'rental', icon: Home, label: 'Rental agreement' },
  { id: 'tos', icon: Briefcase, label: 'Terms of service' },
  { id: 'loan', icon: Landmark, label: 'Loan terms' },
  { id: 'govt', icon: Building, label: 'Government circular' },
]

export default function Analyze() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')

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
      setError(err.response?.data?.detail || 'Could not read this file. Try PDF, Word or a text file.')
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

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-stone-500 mb-6 hover:text-white">← Home</button>
        <h1 className="text-3xl font-semibold text-[#f4f1ea] mb-2">Analyse a document</h1>
        <p className="text-stone-400 mb-8">Upload a file or try a sample. We remove names and numbers before saving.</p>

        <div className="card p-8 text-center mb-6">
          <UploadCloud className="mx-auto mb-4 text-[#c4a574]" size={32} />
          <p className="text-stone-300 mb-6">PDF, Word or text file</p>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => upload(e.target.files?.[0])} />
          <button disabled={busy} className="btn-primary" onClick={() => fileRef.current?.click()}>
            {busy ? 'Reading your file…' : 'Choose file'}
          </button>
        </div>

        <label className="text-xs text-stone-400 mb-2 block">Optional: one question about this paper</label>
        <input className="input mb-8" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Example: Can they ask me to leave without notice?" />

        <h2 className="text-sm text-stone-400 mb-3">Or try a sample</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {SAMPLES.map(s => (
            <button key={s.id} disabled={busy} onClick={() => sample(s.id)} className="card p-4 flex items-center gap-3 hover:border-[#c4a574]/40 text-left">
              <s.icon size={18} className="text-[#c4a574]" />
              <span className="text-sm text-stone-200">{s.label}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-400">{String(error)}</p>}
      </div>
    </AppShell>
  )
}
