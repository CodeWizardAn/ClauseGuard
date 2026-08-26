import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import API from '../api'
import { useAuth } from '../auth'
import ClauseGuardLogo from '../components/ClauseGuardLogo'
import authBg from '../assets/auth_bg.jpg'

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

export default function Auth() {
  const { user, loading, saveSession } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', age: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user?.profile_complete) return <Navigate to="/dashboard" replace />
  if (!loading && user && !user.profile_complete) return <Navigate to="/setup" replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    if (!EMAIL_OK.test(form.email.trim())) return 'Enter a valid email, like name@gmail.com'
    if (!form.password || form.password.trim().length === 0) return 'Please enter your password'
    if (!isLogin) {
      if (form.password.length < 6) return 'Password must be at least 6 characters'
      if (!/^[A-Z]/.test(form.password)) return 'Password must start with a capital letter'
      if (form.name.trim().length < 2) return 'Please enter your name'
      const age = Number(form.age)
      if (!age || age < 13 || age > 120) return 'Enter a valid age (13 or older)'
      const phone = form.phone.replace(/\D/g, '')
      if (!/^[6-9]\d{9}$/.test(phone) && !(/^91[6-9]\d{9}$/.test(phone))) return 'Enter a valid 10-digit mobile number'
    }
    return ''
  }


  const submit = async (e) => {
    e.preventDefault()
    const valErr = validate()
    if (valErr) {
      setError(valErr)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (isLogin) {
        const { data } = await API.post('/auth/login', {
          email: form.email.trim(),
          password: form.password,
        })
        saveSession(data.access_token || data.token, data.user)
        if (data.user?.profile_complete) {
          navigate('/dashboard')
        } else {
          navigate('/setup')
        }
      } else {
        const { data } = await API.post('/auth/register', {
          name: form.name.trim(),
          age: Number(form.age),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password,
        })
        saveSession(data.access_token || data.token, data.user)
        navigate('/setup')
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050716] relative flex flex-col justify-between selection:bg-purple-500/30 selection:text-white overflow-hidden">
      {/* High-Fidelity Cyber Security Lock Artwork Background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img 
          src={authBg} 
          alt="ClauseGuard Security Architecture" 
          className="w-full h-full object-cover object-center opacity-[0.45] filter saturate-110 brightness-90 blur-[0.5px] scale-105"
        />
        {/* Soft Radial Ambient Lighting to keep center card crisp and high-contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050716] via-[#050716]/45 to-[#050716]/85" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#050716]/35 to-[#050716]/90" />
      </div>

      {/* Top Header Bar with Top-Left Brand Logo & Name */}
      <header className="relative z-20 px-8 sm:px-12 py-6 flex items-center justify-start">
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <ClauseGuardLogo 
            size={46} 
            className="group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
          />
          <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white drop-shadow-md">
            Clause<span className="text-purple-400">Guard</span>
          </span>
        </div>
      </header>


      {/* Center Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md">

          {/* Form Card with Frosted Obsidian Finish */}
          <form onSubmit={submit} className="rounded-3xl bg-[#090d24]/90 backdrop-blur-2xl p-7 sm:p-8 space-y-4 border border-white/20 shadow-2xl shadow-black/90">
            <div className="mb-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {isLogin ? 'Enter your credentials to access your analyses.' : 'Set up your secure profile to analyze contracts.'}
              </p>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Full name</label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Your legal name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Age</label>
                    <input className="input" type="number" value={form.age} onChange={set('age')} placeholder="18" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Mobile</label>
                    <input className="input" value={form.phone} onChange={set('phone')} placeholder="10-digit number" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Email Address</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@domain.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Starts with capital letter" />
              <p className="text-[11px] text-slate-500 mt-1.5">Minimum 6 characters. First letter capital (e.g. Pass12)</p>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full mt-2 py-3">
              {busy ? 'Securing session…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            {isLogin ? 'New to ClauseGuard?' : 'Already have an account?'}
            <button 
              type="button" 
              className="text-purple-400 hover:text-purple-300 font-semibold ml-2 underline focus:outline-none" 
              onClick={() => { setIsLogin(!isLogin); setError('') }}
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-slate-500 font-medium">Encrypted & Zero-Knowledge Contract Analysis · Indian Legal Framework</p>
      </footer>
    </div>
  )
}
