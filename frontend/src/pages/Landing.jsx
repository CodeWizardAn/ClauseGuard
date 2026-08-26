import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, FileText, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.05
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
        ctx.fillStyle = `rgba(96, 165, 250, ${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.08 * (1 - dist / 100)})`
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

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#000010' }}>

      {/* Faded security background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url(/security_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.40,
        }}
      />

      {/* Dark overlay so text stays readable */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.35), rgba(0,0,0,0.65))' }} />

      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" style={{ zIndex: 2 }} />

      {/* Single subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" style={{ zIndex: 2 }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-8 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">ClauseGuard</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-6"
        >
          <span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">Features</span>
          <span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">About</span>
          <button
            onClick={() => navigate('/auth')}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get started
          </button>
        </motion.div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24 px-4 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6 max-w-4xl"
        >
          Know your contract
          <br />
          <span className="text-blue-400">before you sign it.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-base md:text-lg max-w-xl mb-12 leading-relaxed"
        >
          Upload any rental paper, loan form, terms page, or government circular.
          We strip names and numbers, explain each rule in simple words, and let you ask questions in your language.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors mb-20"
        >
          Analyze a contract free
          <ArrowRight size={18} />
        </motion.button>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-16"
        >
          {[
            { value: '181', label: 'Legal chunks indexed' },
            { value: '4', label: 'Indian law acts' },
            { value: '< 30s', label: 'Per contract' },
            { value: '9', label: 'AI/ML techniques' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-gray-600 text-xs mt-1 tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Divider */}
      <div className="relative z-10 border-t border-white/5 mx-12" />

      {/* Features */}
      <div className="relative z-10 max-w-5xl mx-auto px-12 py-24">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-gray-600 text-xs font-medium tracking-widest uppercase mb-12"
        >
          What makes it different
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
          {[
            {
              icon: <Shield size={20} className="text-blue-400" />,
              title: 'Private by design',
              desc: 'We extract the rules, not your identity. Names, phones, emails and ID numbers are removed before anything is stored.'
            },
            {
              icon: <Zap size={20} className="text-blue-400" />,
              title: 'Simple chat, your language',
              desc: 'Ask questions after every upload. Answers stay short, personal, and available in major Indian languages.'
            },
            {
              icon: <FileText size={20} className="text-blue-400" />,
              title: 'One vault for every paper',
              desc: 'Keep redacted copies together. Compare two versions. Flag risky clauses and look up legal words in plain language.'
            }
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#000000] p-8 hover:bg-white/2 transition-colors"
            >
              <div className="mb-5 w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 border-t border-white/5 mx-12 mb-12" />
      <div className="relative z-10 text-center pb-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-lg mx-auto"
        >
          <h2 className="text-3xl font-black text-white mb-4">Start analyzing today.</h2>
          <p className="text-gray-600 text-sm mb-8">No credit card. No setup. Just upload and analyze.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-black px-8 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Get started for free
          </button>
        </motion.div>
      </div>
    </div>
  )
}