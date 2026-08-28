import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Zap, FileText, ArrowRight, Lock, Globe,
  Calculator, Search, BookOpen, ChevronDown, CheckCircle2
} from 'lucide-react'
import { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: <Shield size={24} className="text-orange-600" />,
    color: 'from-orange-50 to-amber-50/60',
    border: 'border-orange-200/80',
    title: '4-Tier Risk Spectrum',
    desc: 'Every clause gets a calibrated 0–100 score. Red, Orange, Yellow, Green — click any tier to filter instantly.'
  },
  {
    icon: <Search size={24} className="text-amber-600" />,
    color: 'from-amber-50 to-orange-50/60',
    border: 'border-amber-200/80',
    title: 'Omission Radar',
    desc: "Standard AI only reads what's there. We audit what's deliberately missing — and generate ready-to-insert protective clauses."
  },
  {
    icon: <Calculator size={24} className="text-orange-600" />,
    color: 'from-orange-50 to-rose-50/60',
    border: 'border-orange-200/80',
    title: 'Affordability Engine',
    desc: 'Exact math: Debt-to-income ratio, city living cost buffer, dependents. Hardcoded deterministic formulas, not guesses.'
  },
  {
    icon: <Globe size={24} className="text-emerald-600" />,
    color: 'from-emerald-50 to-teal-50/60',
    border: 'border-emerald-200/80',
    title: '8 Indian Languages',
    desc: 'Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Gujarati. Clauses, risk cards and summaries — all translated.'
  },
  {
    icon: <Lock size={24} className="text-orange-600" />,
    color: 'from-orange-50 to-amber-50/60',
    border: 'border-orange-200/80',
    title: 'Zero-Knowledge Privacy',
    desc: 'Aadhaar, PAN, phone numbers stripped client-side. Reports stored in your AES-256-GCM encrypted PIN vault.'
  },
  {
    icon: <BookOpen size={24} className="text-sky-600" />,
    color: 'from-sky-50 to-blue-50/60',
    border: 'border-sky-200/80',
    title: '49+ Indian Statutes',
    desc: 'Grounded in Indian Contract Act, RERA, RBI 2024, DPDP Act 2023, IBC, POSH, Maternity Benefit & more.'
  },
]

const TRUST_ITEMS = [
  'FastAPI', 'Groq LLaMA 3.3', 'ChromaDB', 'Sentence-Transformers',
  'AES-256-GCM', 'DPDP Act 2023', 'RERA 2016', 'IBC 2016', 'ReportLab PDF',
]

export default function Landing() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.25 + 0.05
    }))

    let animId
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 88, 12, ${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(234, 88, 12, ${0.08 * (1 - dist / 110)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">

      {/* Sunlit Warm Amber Diffusions */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[550px] rounded-full blur-[140px] opacity-35 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fed7aa 0%, #ffedd5 45%, transparent 75%)' }}
      />
      <div 
        className="absolute top-[20%] left-0 w-[650px] h-[650px] rounded-full blur-[140px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ffedd5 0%, #fed7aa 40%, transparent 75%)' }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" style={{ zIndex: 1 }} />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-12 py-6 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-slate-900 font-black text-xl tracking-tight">Clause<span className="text-orange-600">Guard</span></span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-6"
        >
          <button
            onClick={scrollToFeatures}
            className="text-slate-600 text-base font-semibold hover:text-orange-600 cursor-pointer transition-colors hidden sm:block"
          >
            Features
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="text-slate-700 text-base font-semibold hover:text-slate-900 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="btn-primary !py-2.5 !px-6 text-base font-bold shadow-md shadow-orange-500/25"
          >
            Get started
          </button>
        </motion.div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-20 px-4 text-center">

        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-300/80 rounded-full px-4 py-1.5 mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
          <span className="text-orange-900 text-sm font-bold tracking-wide">SIH 2024 — Legal AI for Every Indian</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-6 max-w-4xl"
        >
          Know your contract
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">before you sign it.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-slate-600 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Upload any rental paper, loan form, employment agreement, or ToS page.
          We strip private data, explain each clause in plain words, and let you ask questions in your language.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 mb-8"
        >
          <motion.button
            onClick={() => navigate('/auth')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40"
          >
            Analyze a contract free
            <ArrowRight size={20} />
          </motion.button>
          <button
            onClick={scrollToFeatures}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-base font-semibold transition-colors px-5 py-4 rounded-xl hover:bg-white border border-transparent hover:border-slate-200"
          >
            See what it does <ChevronDown size={16} />
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-10 md:gap-16 mt-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-3xl mx-auto"
        >
          {[
            { value: '49+', label: 'Indian statutes' },
            { value: '8', label: 'Indian languages' },
            { value: '< 30s', label: 'Per contract' },
            { value: '9', label: 'AI/ML techniques' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-orange-600">{s.value}</div>
              <div className="text-slate-600 text-xs sm:text-sm mt-1 font-semibold">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Divider ── */}
      <div className="relative z-10 border-t border-slate-200 mx-8 md:mx-12" />

      {/* ── 6-Feature Grid ── */}
      <div ref={featuresRef} className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-orange-600 text-sm font-bold tracking-widest uppercase mb-3">
            What makes it different
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Built for people, not for lawyers
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-white border ${f.border} rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all cursor-default relative overflow-hidden group`}
            >
              <div className="mb-5 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200 group-hover:scale-105 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-slate-900 font-bold mb-2.5 text-lg">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Trust / Tech Strip ── */}
      <div className="relative z-10 border-t border-b border-slate-200 bg-white py-6 overflow-hidden">
        <div className="flex items-center gap-14 animate-marquee whitespace-nowrap px-8">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span key={i} className="text-slate-600 text-sm font-bold tracking-widest uppercase shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Privacy Callout ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-10 shadow-lg shadow-slate-200/50"
        >
          <div className="w-14 h-14 bg-orange-100 border border-orange-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={26} className="text-orange-600" />
          </div>
          <h3 className="text-slate-900 font-black text-2xl md:text-3xl mb-4">Your data never leaves your control</h3>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            Aadhaar numbers, PAN cards, phone numbers and email addresses are stripped <em>before</em> anything reaches our servers.
            Your reports are stored under a 4-digit PIN vault encrypted with AES-256-GCM — only you can open it.
          </p>
        </motion.div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="relative z-10 border-t border-slate-200 mx-8 md:mx-12 mb-12" />
      <div className="relative z-10 text-center pb-24 px-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="max-w-xl mx-auto p-10 rounded-3xl bg-slate-900 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Start analyzing today.</h2>
          <p className="text-slate-300 text-base mb-8">No credit card. No setup. Just upload and understand.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-orange-400 hover:to-amber-500 transition-all shadow-xl shadow-orange-500/30"
          >
            Get started for free
          </button>
        </motion.div>
      </div>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  )
}