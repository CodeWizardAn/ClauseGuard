import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import API from '../api'
import { useAuth } from '../auth'

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
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters'
    if (!/^[A-Z]/.test(form.password)) return 'Password must start with a capital letter'
    if (!isLogin) {
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
    const msg = validate()
    if (msg) { setError(msg); return }
    setBusy(true)
    setError('')
    try {
      if (isLogin) {
        const res = await API.post('/auth/login', { email: form.email, password: form.password })
        saveSession(res.data.access_token, res.data.user)
        navigate(res.data.user.profile_complete ? '/dashboard' : '/setup')
      } else {
        const res = await API.post('/auth/register', {
          name: form.name.trim(),
          age: Number(form.age),
          phone: form.phone,
          email: form.email,
          password: form.password,
        })
        saveSession(res.data.access_token, res.data.user)
        navigate('/setup')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen app-bg flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-white">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b89125] text-[#070a10] flex items-center justify-center mb-4 p-3 shadow-xl shadow-[#d4af37]/20">
              <Shield size={26} className="stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
              ClauseGuard
            </h1>
            <p className="text-slate-400 text-sm mt-2 text-center max-w-sm leading-relaxed">
              {isLogin ? 'Welcome back. Log in to audit your contracts.' : 'Create your secure account. We encrypt your personal data.'}
            </p>
          </div>

          <form onSubmit={submit} className="card p-7 sm:p-8 space-y-4.5">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Full name</label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Your legal or full name" />
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
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="name@domain.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block uppercase tracking-wider">Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Starts with a capital letter" />
              <p className="text-[11px] text-slate-500 mt-1.5">Minimum 6 characters. First letter capital (e.g. Secret1)</p>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full mt-2 py-3">
              {busy ? 'Securing session…' : isLogin ? 'Sign In to ClauseGuard' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            {isLogin ? 'New to ClauseGuard?' : 'Already registered?'}
            <button 
              type="button" 
              className="text-[#d4af37] font-semibold ml-2 hover:underline focus:outline-none" 
              onClick={() => { setIsLogin(!isLogin); setError('') }}
            >
              {isLogin ? 'Create an account' : 'Sign in'}
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
