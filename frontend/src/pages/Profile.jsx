import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Shield, Lock, KeyRound, Camera, CheckCircle2, AlertCircle, ArrowLeft, Save, Sparkles, RefreshCw } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'

const PRESET_AVATARS = [
  '⚡', '🛡️', '⚖️', '💼', '🚀', '🔮', '🦊', '🦅', '🎯', '💎'
]

export default function Profile() {
  const { user, saveSession } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Profile Details State
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [role, setRole] = useState('')
  const [language, setLanguage] = useState('en')
  const [avatar, setAvatar] = useState('')

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // PIN Change State
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  // Feedback states
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' })
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' })
  const [pinMsg, setPinMsg] = useState({ text: '', type: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAge(user.age || '')
      setRole(user.role || 'Everyday Citizen')
      setLanguage(user.language || 'en')
      setAvatar(user.avatar || '')
    }
  }, [user])

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ text: 'Image size should be under 2 MB', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const saveProfileInfo = async (e) => {
    e.preventDefault()
    setBusy(true)
    setProfileMsg({ text: '', type: '' })

    try {
      const res = await API.put('/auth/profile', {
        name: name.trim(),
        age: Number(age),
        role: role.trim(),
        language,
        avatar,
      })
      const token = localStorage.getItem('cg-token') || sessionStorage.getItem('cg-token')
      saveSession(token, res.data.user)
      setProfileMsg({ text: 'Profile information updated successfully!', type: 'success' })
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.detail || 'Failed to update profile', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordMsg({ text: '', type: '' })

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', type: 'error' })
      return
    }
    if (newPassword.length < 6 || !/^[A-Z]/.test(newPassword)) {
      setPasswordMsg({ text: 'New password must start with a capital letter and be at least 6 characters', type: 'error' })
      return
    }

    setBusy(true)
    try {
      const res = await API.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordMsg({ text: res.data.message || 'Password changed successfully!', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.detail || 'Failed to change password', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const handlePinChange = async (e) => {
    e.preventDefault()
    setPinMsg({ text: '', type: '' })

    if (newPin !== confirmPin) {
      setPinMsg({ text: 'New 4-digit PINs do not match', type: 'error' })
      return
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg({ text: 'PIN must be exactly 4 numeric digits', type: 'error' })
      return
    }

    setBusy(true)
    try {
      const res = await API.post('/auth/change-pin', {
        current_pin: currentPin,
        new_pin: newPin,
      })
      setPinMsg({ text: res.data.message || 'Vault PIN changed successfully!', type: 'success' })
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } catch (err) {
      setPinMsg({ text: err.response?.data?.detail || 'Failed to change Vault PIN', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <User size={13} className="text-purple-400" /> Account & Security
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            User <span className="text-gradient-purple">Profile & Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Manage your personal profile, custom avatar, account password, and 4-digit Document Vault security lock.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Left Column: Profile & Avatar Details */}
          <div className="md:col-span-7 space-y-6">
            <form onSubmit={saveProfileInfo} className="card p-6 border-purple-500/20 space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-purple-400" /> Personal Information
              </h2>

              {/* Avatar Section */}
              <div className="flex items-center gap-4 py-2">
                <div className="relative group">
                  {avatar && avatar.startsWith('data:image') ? (
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-500/25" 
                    />
                  ) : avatar ? (
                    <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border-2 border-purple-500/40 text-2xl flex items-center justify-center shadow-lg">
                      {avatar}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-purple-500/30">
                      {userInitial}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md transition-colors"
                    title="Upload profile photo"
                  >
                    <Camera size={13} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">Profile Photo</p>
                  <p className="text-[11px] text-slate-400">Click camera to upload custom photo or pick an icon below.</p>
                </div>
              </div>

              {/* Preset Icon Selector */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Or choose a profile badge:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-all ${
                        avatar === emoji 
                          ? 'bg-purple-500/25 border-purple-400 scale-110' 
                          : 'bg-white/[0.03] border-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-rose-300 bg-white/[0.02] border border-white/10"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input text-sm"
                  required
                />
              </div>

              {/* Age & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Age</label>
                  <input
                    type="number"
                    min="13"
                    max="120"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="input text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Primary Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="Everyday Citizen" className="bg-[#0b0e1e]">Everyday Citizen</option>
                    <option value="Tenant / Renter" className="bg-[#0b0e1e]">Tenant / Renter</option>
                    <option value="Home / Property Buyer" className="bg-[#0b0e1e]">Home / Property Buyer</option>
                    <option value="Salaried Employee" className="bg-[#0b0e1e]">Salaried Employee</option>
                    <option value="Freelancer / Consultant" className="bg-[#0b0e1e]">Freelancer / Consultant</option>
                    <option value="Business Owner / MSME" className="bg-[#0b0e1e]">Business Owner / MSME</option>
                  </select>
                </div>
              </div>

              {/* Read-Only Masked Phone & Email */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Registered Email</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="input text-xs !bg-slate-900/50 !text-slate-400 !cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Mobile Number</label>
                  <input
                    type="text"
                    value={user?.phone_masked || '******'}
                    disabled
                    className="input text-xs !bg-slate-900/50 !text-slate-400 !cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {profileMsg.text && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  profileMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full text-xs !py-2.5 flex items-center justify-center gap-2"
              >
                <Save size={14} />
                <span>{busy ? 'Saving changes…' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Security (Password & Vault PIN) */}
          <div className="md:col-span-5 space-y-6">
            {/* Change Account Password */}
            <form onSubmit={handlePasswordChange} className="card p-6 border-purple-500/20 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound size={16} className="text-purple-400" /> Change Password
              </h2>
              <p className="text-[11px] text-slate-400">
                Requires entering your current password first.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Must start with Capital (e.g. Secret123)"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              {passwordMsg.text && (
                <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !currentPassword || !newPassword}
                className="btn-secondary w-full text-xs !py-2"
              >
                Update Password
              </button>
            </form>

            {/* Change Vault PIN */}
            <form onSubmit={handlePinChange} className="card p-6 border-purple-500/20 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} className="text-purple-400" /> Change Vault 4-Digit PIN
              </h2>
              <p className="text-[11px] text-slate-400">
                Protects access to your stored document analyses.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Current 4-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPin}
                  onChange={e => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input text-center text-sm font-mono tracking-widest"
                  placeholder="••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="input text-center text-sm font-mono tracking-widest"
                    placeholder="••••"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Confirm PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="input text-center text-sm font-mono tracking-widest"
                    placeholder="••••"
                    required
                  />
                </div>
              </div>

              {pinMsg.text && (
                <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  pinMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {pinMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{pinMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy || currentPin.length !== 4 || newPin.length !== 4}
                className="btn-secondary w-full text-xs !py-2"
              >
                Update Vault PIN
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
