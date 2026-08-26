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
        // Initialize default answers if provided
        const initial = {}
        res.data?.questions?.forEach(q => {
          initial[q.id] = q.default_value || ''
        })
        setAnswers(initial)
      } catch (err) {
        console.error('Failed to load smart questions:', err)
        // If question extraction fails, allow navigating to analysis directly
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
      // Even if verdict calculation fails, proceed to analysis
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
          <div className="w-12 h-12 rounded-2xl bg-[#c4a574]/10 border border-[#c4a574]/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Sparkles className="text-[#c4a574]" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-[#f4f1ea] mb-2">Reading your document's numbers…</h2>
          <p className="text-stone-400 text-sm">Identifying payment amounts, terms, and location constraints.</p>
        </div>
      </AppShell>
    )
  }

  const summary = data?.contract_summary || {}
  const badges = data?.detected_badges || []
  const questions = data?.questions || []

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c4a574]/10 border border-[#c4a574]/30 text-[#c4a574] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} /> Smart Personalized Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f1ea] tracking-tight mb-2">
            Let’s check if this is truly affordable for you
          </h1>
          <p className="text-stone-400 text-sm max-w-lg mx-auto leading-relaxed">
            We extracted the exact commitments from your document. Answer these quick questions so our AI can give advice for your real life.
          </p>
        </div>



        {/* Detected Contract Snapshot */}
        {(summary.primary_obligation || badges.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 mb-8 border-[#c4a574]/20 bg-gradient-to-br from-[#121922] to-[#0c1118]"
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-[#c4a574]" />
              <p className="text-xs uppercase tracking-widest text-[#c4a574] font-semibold">Detected from Document</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {badges.map((b, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-stone-500 mb-0.5">{b.label}</p>
                  <p className="text-sm font-semibold text-[#f4f1ea] truncate">{b.value}</p>
                </div>
              ))}
            </div>

            {summary.key_risk_factor && (
              <p className="text-xs text-amber-300/90 flex items-start gap-1.5 mt-2 bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span><strong className="text-amber-200">Key Observation:</strong> {summary.key_risk_factor}</span>
              </p>
            )}
          </motion.div>
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
                className="card p-5 space-y-2 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <label htmlFor={q.id} className="block text-sm font-medium text-[#f4f1ea]">
                    {q.question}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                </div>

                {q.subtitle && (
                  <p className="text-xs text-stone-400 leading-relaxed">{q.subtitle}</p>
                )}

                {/* Input Types */}
                {q.type === 'currency' ? (
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-semibold text-sm">₹</span>
                    <input
                      id={q.id}
                      type="number"
                      min="0"
                      step="1000"
                      required={q.required}
                      value={val}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'e.g. 25000'}
                      className="input !pl-8 w-full text-base font-medium"
                    />
                  </div>
                ) : q.type === 'number' ? (
                  <div className="relative mt-2">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id={q.id}
                      type="number"
                      min="0"
                      max="20"
                      required={q.required}
                      value={val}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'e.g. 2'}
                      className="input !pl-9 w-full text-base font-medium"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="relative mt-2">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        id={q.id}
                        type="text"
                        required={q.required}
                        value={val}
                        onChange={e => handleInputChange(q.id, e.target.value)}
                        placeholder={q.placeholder || 'e.g. Kalyan, Mumbai'}
                        className="input !pl-9 w-full text-base font-medium"
                      />
                    </div>
                    {/* Quick City suggestions if question is about city */}
                    {q.id.includes('city') && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {POPULAR_CITIES.map(city => (
                          <button
                            type="button"
                            key={city}
                            onClick={() => handleInputChange(q.id, city)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              val === city
                                ? 'bg-[#c4a574] text-[#0c1118] font-semibold border-[#c4a574]'
                                : 'bg-white/5 text-stone-400 border-white/10 hover:border-stone-500 hover:text-white'
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

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:flex-1 !py-3 flex items-center justify-center gap-2 text-base font-semibold shadow-lg shadow-[#c4a574]/10"
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
              className="w-full sm:w-auto px-5 py-3 text-sm text-stone-400 hover:text-white transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
