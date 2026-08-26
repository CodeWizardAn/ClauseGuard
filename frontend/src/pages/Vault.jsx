import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
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
    API.get('/vault').then(res => setDocs(res.data.documents || [])).catch(() => setError('Could not load documents'))
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
      setError(err.response?.data?.detail || 'Incorrect PIN')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-stone-500 mb-6 hover:text-white">← Home</button>
        <h1 className="text-3xl font-semibold text-[#f4f1ea] mb-2">Document locker</h1>
        <p className="text-stone-400 mb-8">Your saved papers live here. A PIN keeps them closed, like DigiLocker.</p>

        {!open ? (
          <form onSubmit={unlock} className="card p-8 max-w-sm">
            <label className="text-xs text-stone-400 mb-2 block">Enter your 4-digit PIN</label>
            <input className="input tracking-[0.5em] text-center text-lg mb-4" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
            <button className="btn-primary w-full" disabled={busy || pin.length !== 4}>{busy ? 'Checking…' : 'Open locker'}</button>
          </form>
        ) : (
          <div className="space-y-3">
            {docs.length === 0 && <p className="text-stone-500">No documents yet. Analyse a paper first.</p>}
            {docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => navigate(`/analysis/${doc.id}`)}
                className="card w-full p-4 flex items-center gap-4 text-left hover:border-[#c4a574]/40"
              >
                <FileText className="text-[#c4a574]" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#f4f1ea] truncate">{doc.display_name}</p>
                  <p className="text-xs text-stone-500">{doc.contract_type} · Risk {doc.overall_score}/100</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
