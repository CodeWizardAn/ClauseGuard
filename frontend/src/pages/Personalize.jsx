import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, ArrowRight, User, AlertTriangle, Languages, HelpCircle } from 'lucide-react'
import API from '../api'
import { LANGUAGES, saveLang } from '../languages'

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
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tell us about you</h1>
            <p className="text-sm text-gray-500">We use this to explain the paper in your words. We do not save your name or phone number.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8 bg-gray-900/60 border border-gray-800 rounded-3xl p-8">
          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><User size={16} /> Who are you in this document?</h2>
            <div className="grid gap-2">
              {ROLES.map(r => (
                <button type="button" key={r.id} onClick={() => setRole(r.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm border ${role === r.id ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><AlertTriangle size={16} /> What worries you most?</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {WORRIES.map(w => (
                <button type="button" key={w.id} onClick={() => setWorry(w.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm border ${worry === w.id ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                  {w.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><Languages size={16} /> Language for explanations</h2>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><HelpCircle size={16} /> One question you want answered simply</h2>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
              placeholder="Example: Can they throw me out without notice?"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600" />
          </section>

          <button disabled={saving} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Explain this document for me'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
