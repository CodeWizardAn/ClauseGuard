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
    <div className="min-h-screen app-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#c4a574] text-[#14110c] flex items-center justify-center mb-4">
              <Shield size={22} />
            </div>
            <h1 className="text-2xl font-semibold text-[#f4f1ea]">ClauseGuard</h1>
            <p className="text-stone-400 text-sm mt-2 text-center">
              {isLogin ? 'Log in to continue' : 'Create your account. We encrypt your email and phone.'}
            </p>
          </div>

          <form onSubmit={submit} className="card p-7 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Full name</label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Your name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-stone-400 mb-1 block">Age</label>
                    <input className="input" type="number" value={form.age} onChange={set('age')} placeholder="18" />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 mb-1 block">Mobile number</label>
                    <input className="input" value={form.phone} onChange={set('phone')} placeholder="10-digit number" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@gmail.com" />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Starts with a capital letter" />
              <p className="text-[11px] text-stone-500 mt-1">Minimum 6 characters. First letter must be capital, e.g. Hello1</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {isLogin ? 'New here?' : 'Already have an account?'}
            <button type="button" className="text-[#c4a574] ml-2" onClick={() => { setIsLogin(!isLogin); setError('') }}>
              {isLogin ? 'Register' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
      <footer className="px-6 py-5">
        <p className="text-center text-xs text-stone-600">Not legal advice. For understanding documents only.</p>
      </footer>
    </div>
  )
}
