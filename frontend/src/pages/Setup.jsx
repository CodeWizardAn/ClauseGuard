import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../auth'
import AppShell from '../components/AppShell'
import { LANGUAGES, saveLang } from '../languages'

const ROLES = [
  'I usually rent a home',
  'I take loans',
  'I am a student',
  'I am an employee',
  'I read terms of apps and websites',
  'Other',
]

const WORRIES = [
  'Money, fees and deposits',
  'Being stuck in a contract',
  'Losing my home or job',
  'My privacy',
  'Fines and penalties',
  'Missing a benefit',
]

export default function Setup() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState(ROLES[0])
  const [worry, setWorry] = useState(WORRIES[0])
  const [language, setLanguage] = useState('en')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(pin)) { setError('Create a 4-digit PIN for your document locker'); return }
    if (pin !== pin2) { setError('Both PINs must match'); return }
    setBusy(true)
    setError('')
    try {
      saveLang(language)
      const res = await API.post('/auth/setup', { role, worry, language, pin })
      setUser(res.data.user)
      localStorage.setItem('cg-user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save your profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">Set up your profile</h1>
        <p className="text-slate-600 text-sm mb-8 font-medium">Hello {user?.name?.split(' ')[0]}. A few simple answers help us explain papers in your words. Then create a PIN to lock your document locker.</p>
        <form onSubmit={submit} className="card p-7 bg-white border-slate-200 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">Who are you, most of the time?</label>
            <select className="input text-slate-900 bg-white" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">What worries you most in legal papers?</label>
            <select className="input text-slate-900 bg-white" value={worry} onChange={e => setWorry(e.target.value)}>
              {WORRIES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">Language for explanations</label>
            <select className="input text-slate-900 bg-white" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">4-digit locker PIN</label>
              <input className="input tracking-[0.4em] text-center font-mono font-bold text-slate-900" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">Type PIN again</label>
              <input className="input tracking-[0.4em] text-center font-mono font-bold text-slate-900" maxLength={4} value={pin2} onChange={e => setPin2(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Remember this PIN. You will need it to open saved documents, like a DigiLocker.</p>
          {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
          <button className="btn-primary w-full !py-3.5 text-base font-bold shadow-lg shadow-orange-500/20" disabled={busy}>{busy ? 'Saving…' : 'Finish setup'}</button>
        </form>
      </div>
    </AppShell>
  )
}
