import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import API from '../api'
import { useAuth } from '../auth'
import ClauseGuardLogo from '../components/ClauseGuardLogo'

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
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-950 overflow-hidden">
      {/* Sunlit Amber Glows */}
      <div 
        className="absolute top-0 right-0 w-[700px] h-[550px] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fed7aa 0%, #ffedd5 45%, transparent 75%)' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-35 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ffedd5 0%, #fed7aa 40%, transparent 75%)' }}
      />

      {/* Top Header Bar */}
      <header className="relative z-20 px-8 sm:px-12 py-6 flex items-center justify-start">
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate('/')}>
          <ClauseGuardLogo 
            size={42} 
            className="group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]" 
          />
          <span className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
            Clause<span className="text-orange-600">Guard</span>
          </span>
        </div>
      </header>

      {/* Center Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md">

          {/* Form Card */}
          <form onSubmit={submit} className="rounded-3xl bg-white p-7 sm:p-8 space-y-4 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="mb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                {isLogin ? 'Enter your credentials to access your analyses.' : 'Set up your secure profile to analyze contracts.'}
              </p>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Full name</label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Your legal name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Age</label>
                    <input className="input" type="number" value={form.age} onChange={set('age')} placeholder="18" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Mobile</label>
                    <input className="input" value={form.phone} onChange={set('phone')} placeholder="10-digit number" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Email Address</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@domain.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Starts with capital letter" />
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Minimum 6 characters. First letter capital (e.g. Pass12)</p>
            </div>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {error}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full mt-2 !py-3.5 text-base font-bold shadow-lg shadow-orange-500/20">
              {busy ? 'Securing session…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6 font-medium">
            {isLogin ? 'New to ClauseGuard?' : 'Already have an account?'}
            <button 
              type="button" 
              className="text-orange-600 hover:text-orange-700 font-bold ml-1.5 underline focus:outline-none" 
              onClick={() => { setIsLogin(!isLogin); setError('') }}
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-slate-400 font-medium">Encrypted & Zero-Knowledge Contract Analysis · Indian Legal Framework</p>
      </footer>
    </div>
  )
}
