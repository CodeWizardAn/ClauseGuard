import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, IndianRupee, MapPin, Users, HelpCircle, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

const POPULAR_CITIES = ['Kalyan', 'Thane', 'Mumbai', 'Navi Mumbai', 'Pune', 'Bengaluru', 'Delhi NCR', 'Hyderabad']

export default function SmartContext() {
  const { contractId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true)
        const res = await API.get(`/smart-questions/${contractId}`)
        setData(res.data)
        const initial = {}
        res.data?.questions?.forEach(q => {
          initial[q.id] = q.default_value || ''
        })
        setAnswers(initial)
      } catch (err) {
        console.error('Failed to load smart questions:', err)
        navigate(`/analysis/${contractId}`, { replace: true })
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [contractId, navigate])

  const handleInputChange = (id, val) => {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await API.post(`/smart-verdict/${contractId}`, { answers })
      navigate(`/analysis/${contractId}`)
    } catch (err) {
      console.error('Failed to submit smart verdict:', err)
      navigate(`/analysis/${contractId}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    navigate(`/analysis/${contractId}`)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mx-auto mb-4 animate-bounce text-orange-600">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Reading your document's numbers…</h2>
          <p className="text-slate-500 text-sm font-medium">Identifying payment amounts, terms, and location constraints.</p>
        </div>
      </AppShell>
    )
  }

  const summary = data?.contract_summary || {}
  const badges = data?.detected_badges || []
  const questions = data?.questions || []

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Financial & Contextual Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg leading-relaxed font-medium">
            Answer a few quick questions so we can calculate exact affordability ratios against the obligations extracted from this agreement.
          </p>
        </div>

        {/* Detected Contract Snapshot */}
        {(summary.primary_obligation || badges.length > 0) && (
          <div className="card p-5 mb-6 bg-white border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-orange-600" />
              <p className="text-xs uppercase tracking-wider text-slate-600 font-bold">Extracted Obligations</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-2.5">
              {badges.map((b, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">{b.label}</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{b.value}</p>
                </div>
              ))}
            </div>

            {summary.key_risk_factor && (
              <p className="text-xs text-slate-700 flex items-start gap-2 mt-3 bg-amber-50/80 p-3 rounded-xl border border-amber-200 font-medium">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <span><strong className="text-slate-900 font-bold">Key Note:</strong> {summary.key_risk_factor}</span>
              </p>
            )}
          </div>
        )}


        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const val = answers[q.id] || ''

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="card p-5 space-y-2 bg-white border-slate-200 shadow-sm hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <label htmlFor={q.id} className="block text-sm font-bold text-slate-900">
                    {q.question}
                    {q.required && <span className="text-red-600 ml-1">*</span>}
                  </label>
                </div>

                {q.subtitle && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{q.subtitle}</p>
                )}

                {/* Input Types */}
                {q.type === 'currency' ? (
                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      id={q.id}
                      type="number"
                      min="0"
                      step="1000"
                      required={q.required}
                      value={val}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'e.g. 25000'}
                      className="input !pl-8 w-full text-base font-bold text-slate-900"
                    />
                  </div>
                ) : q.type === 'number' ? (
                  <div className="relative mt-2">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={q.id}
                      type="number"
                      min="0"
                      max="20"
                      required={q.required}
                      value={val}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'e.g. 2'}
                      className="input !pl-9 w-full text-base font-bold text-slate-900"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="relative mt-2">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id={q.id}
                        type="text"
                        required={q.required}
                        value={val}
                        onChange={e => handleInputChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'e.g. Kalyan, Mumbai'}
                        className="input !pl-9 w-full text-base font-bold text-slate-900"
                      />
                    </div>
                    {/* Quick City suggestions */}
                    {q.id.includes('city') && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {POPULAR_CITIES.map(city => (
                          <button
                            type="button"
                            key={city}
                            onClick={() => handleInputChange(q.id, city)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-semibold ${
                              val === city
                                ? 'bg-orange-600 text-white font-bold border-orange-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}

          {error && <p className="text-sm text-red-600 font-bold text-center">{error}</p>}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:flex-1 !py-3.5 flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-orange-500/20"
            >
              {submitting ? (
                'Personalizing your advice…'
              ) : (
                <>
                  <span>Analyze for My Situation</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSkip}
              className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
