import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Lock, ArrowLeft, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

export default function Vault() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [open, setOpen] = useState(sessionStorage.getItem('vault-open') === '1')
  const [docs, setDocs] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    API.get('/vault')
      .then(res => setDocs(res.data.documents || []))
      .catch(() => setError('Could not load documents'))
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  const unlock = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await API.post('/vault/unlock', { pin })
      sessionStorage.setItem('vault-open', '1')
      setOpen(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect 4-digit PIN')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Encrypted Document <span className="text-gradient-purple">Vault</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Your sanitized document analyses are secured here. Enter your 4-digit PIN to access past reports.
          </p>
        </div>

        {!open ? (
          /* Centered PIN Entry Card */
          <div className="max-w-md mx-auto my-8">
            <form onSubmit={unlock} className="card p-8 border-purple-500/20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                <Lock size={22} className="stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Enter Security PIN</h2>
              <p className="text-xs text-slate-400 mb-6">Enter the 4-digit PIN you set up during registration</p>

              <div className="mb-5">
                <input 
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="input !text-center !text-2xl !tracking-[0.6em] font-mono py-3"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-4">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={busy || pin.length !== 4} 
                className="btn-primary w-full py-3 text-sm"
              >
                {busy ? 'Verifying PIN…' : 'Unlock Vault'}
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Documents List */
          <div className="space-y-3">
            {docs.length === 0 ? (
              <div className="card p-8 text-center border-purple-500/15">
                <FileText size={32} className="mx-auto text-slate-500 mb-3" />
                <p className="text-sm font-semibold text-white mb-1">No documents in vault yet</p>
                <p className="text-xs text-slate-400 mb-5">Analyze your first contract to store its risk report here.</p>
                <button onClick={() => navigate('/analyze')} className="btn-primary">
                  Analyze a Document
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {docs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => navigate(`/analysis/${doc.id}`)}
                    className="card p-4.5 flex items-center justify-between gap-4 text-left hover:border-purple-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {doc.display_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {doc.contract_type} · Risk Score: <span className="font-mono text-slate-300 font-semibold">{doc.overall_score}/100</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
