import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, KeyRound, Camera, CheckCircle2, AlertCircle, ArrowLeft, Trash2, Upload } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'

export default function Profile() {
  const { user, saveSession } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Profile Details State
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [role, setRole] = useState('')
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

  const removeAvatar = () => {
    setAvatar('')
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        avatar,
      })
      const token = localStorage.getItem('cg-token') || sessionStorage.getItem('cg-token')
      saveSession(token, res.data.user)
      setProfileMsg({ text: 'Profile details saved successfully.', type: 'success' })
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
      setPasswordMsg({ text: res.data.message || 'Password changed successfully.', type: 'success' })
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
      setPinMsg({ text: res.data.message || 'Vault PIN updated successfully.', type: 'success' })
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
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account <span className="text-gradient-purple">Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Manage your personal profile, credentials, and encrypted vault security lock.
          </p>
        </div>

        {/* Vertical Options Stack */}
        <div className="space-y-6">

          {/* Section 1: General Profile */}
          <form onSubmit={saveProfileInfo} className="card p-6 border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User size={16} className="text-purple-400" /> General Profile
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Your identity and role preferences across the platform.</p>
            </div>

            {/* Clean Avatar Uploader */}
            <div className="flex items-center gap-5 py-2">
              {avatar && avatar.startsWith('data:image') ? (
                <img 
                  src={avatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-2xl object-cover border border-purple-500/40 shadow-lg shadow-purple-500/15 shrink-0" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-2xl font-bold flex items-center justify-center shadow-lg shrink-0">
                  {userInitial}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>Upload New Photo</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Supports JPG, PNG or WebP under 2 MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* Name */}
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
            <div className="grid sm:grid-cols-2 gap-3">
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

            {/* Read-Only Account Contact Info */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
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
              className="btn-primary text-xs !py-2.5 !px-5"
            >
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          {/* Section 2: Password Security */}
          <form onSubmit={handlePasswordChange} className="card p-6 border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound size={16} className="text-purple-400" /> Password & Authentication
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your login password. Current password is required for verification.
              </p>
            </div>

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

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Min 6 characters with 1 capital letter"
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
              className="btn-secondary text-xs !py-2 !px-4"
            >
              Update Password
            </button>
          </form>

          {/* Section 3: Vault PIN */}
          <form onSubmit={handlePinChange} className="card p-6 border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock size={16} className="text-purple-400" /> Document Vault Security Lock
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The 4-digit PIN used to decrypt and access saved contract reports.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Current 4-Digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input text-center text-sm font-mono tracking-widest max-w-xs"
                placeholder="••••"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">New 4-Digit PIN</label>
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
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Confirm New PIN</label>
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
              className="btn-secondary text-xs !py-2 !px-4"
            >
              Update Vault PIN
            </button>
          </form>

        </div>
      </div>
    </AppShell>
  )
}
