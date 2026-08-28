import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, ArrowRight, User, AlertTriangle, Languages, HelpCircle } from 'lucide-react'
import API from '../api'
import { LANGUAGES, saveLang } from '../languages'
import AppShell from '../components/AppShell'

const ROLES = [
  { id: 'tenant', label: 'I am renting / I am the tenant' },
  { id: 'landlord', label: 'I own the property' },
  { id: 'borrower', label: 'I am taking a loan' },
  { id: 'student', label: 'I am a student' },
  { id: 'employee', label: 'I am an employee' },
  { id: 'customer', label: 'I am a customer / user' },
  { id: 'other', label: 'Someone asked me to sign this' },
]

const WORRIES = [
  { id: 'money', label: 'Money, fees, deposits, interest' },
  { id: 'lockin', label: 'Being stuck / cannot leave' },
  { id: 'eviction', label: 'Losing my home or job' },
  { id: 'privacy', label: 'My data and privacy' },
  { id: 'penalties', label: 'Fines and penalties' },
  { id: 'benefits', label: 'Missing a benefit I should get' },
]

export default function Personalize() {
  const { contractId } = useParams()
  const navigate = useNavigate()
  const [role, setRole] = useState('tenant')
  const [worry, setWorry] = useState('money')
  const [language, setLanguage] = useState(localStorage.getItem('cg-lang') || 'en')
  const [question, setQuestion] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      saveLang(language)
      await API.post(`/profile/${contractId}`, {
        role: ROLES.find(r => r.id === role)?.label || role,
        worry: WORRIES.find(w => w.id === worry)?.label || worry,
        language,
        question: question.trim() || 'What should I watch out for before I sign?',
      })
      navigate(`/analysis/${contractId}`)
    } catch (err) {
      alert('Could not save your answers. You can still continue.')
      navigate(`/analysis/${contractId}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-11 h-11 bg-orange-100 border border-orange-200 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Tell us about you</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">We use this to explain the paper in your words. Zero PII stored.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8 bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm">
          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><User size={16} className="text-orange-600" /> Who are you in this document?</h2>
            <div className="grid gap-2">
              {ROLES.map(r => (
                <button type="button" key={r.id} onClick={() => setRole(r.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${role === r.id ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-sm' : 'border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-slate-50 font-medium'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><AlertTriangle size={16} className="text-amber-600" /> What worries you most?</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {WORRIES.map(w => (
                <button type="button" key={w.id} onClick={() => setWorry(w.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${worry === w.id ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-sm' : 'border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-slate-50 font-medium'}`}>
                  {w.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><Languages size={16} className="text-orange-600" /> Language for explanations</h2>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-orange-500">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><HelpCircle size={16} className="text-orange-600" /> One question you want answered simply</h2>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
              placeholder="Example: Can they throw me out without notice?"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500" />
          </section>

          <button disabled={saving} className="btn-primary w-full !py-3.5 text-base font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
            <span>{saving ? 'Saving…' : 'Explain this document for me'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </AppShell>
  )
}
