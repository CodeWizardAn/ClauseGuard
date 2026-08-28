import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Trash2, Upload } from 'lucide-react'
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
      await API.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordMsg({ text: 'Password updated successfully.', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.detail || 'Failed to update password', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const handlePinChange = async (e) => {
    e.preventDefault()
    setPinMsg({ text: '', type: '' })

    if (newPin !== confirmPin) {
      setPinMsg({ text: 'New PINs do not match', type: 'error' })
      return
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg({ text: 'New PIN must be exactly 4 numeric digits', type: 'error' })
      return
    }

    setBusy(true)
    try {
      await API.put('/auth/change-pin', {
        current_pin: currentPin,
        new_pin: newPin,
      })
      setPinMsg({ text: 'Vault PIN updated successfully.', type: 'success' })
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } catch (err) {
      setPinMsg({ text: err.response?.data?.detail || 'Failed to update PIN', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U'

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Account & <span className="text-orange-600">Security Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
            Manage your personal profile, authentication credentials, and 4-digit Vault PIN.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Section 1: Profile Information & Avatar */}
          <form onSubmit={saveProfileInfo} className="card p-6 bg-white border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User size={17} className="text-orange-600" /> Personal Identity & Role
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Personalize how ClauseGuard tailors contract insights and affordability reports to your persona.
              </p>
            </div>

            {/* Profile Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                {avatar && avatar.startsWith('data:image') ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-orange-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {initial}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold border border-orange-200 text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Upload New Photo</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Supports JPG, PNG or WebP under 2 MB.</p>
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
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input text-sm font-semibold text-slate-900"
                required
              />
            </div>

            {/* Age & Role */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Age</label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="input text-sm font-semibold text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Primary Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="input text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="Everyday Citizen">Everyday Citizen</option>
                  <option value="Tenant / Renter">Tenant / Renter</option>
                  <option value="Home / Property Buyer">Home / Property Buyer</option>
                  <option value="Salaried Employee">Salaried Employee</option>
                  <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                  <option value="Business Owner / MSME">Business Owner / MSME</option>
                </select>
              </div>
            </div>

            {/* Read-Only Account Contact Info */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Registered Email</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="input text-xs !bg-slate-50 !text-slate-500 !border-slate-200 !cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Mobile Number</label>
                <input
                  type="text"
                  value={user?.phone_masked || '******'}
                  disabled
                  className="input text-xs !bg-slate-50 !text-slate-500 !border-slate-200 !cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {profileMsg.text && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                profileMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary text-xs !py-2.5 !px-5 font-bold shadow-md shadow-orange-500/20"
            >
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          {/* Section 2: Password Security */}
          <form onSubmit={handlePasswordChange} className="card p-6 bg-white border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={17} className="text-orange-600" /> Password & Authentication
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Update your login password. Current password is required for verification.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="input text-xs text-slate-900"
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input text-xs text-slate-900"
                  placeholder="Min 6 characters with 1 capital letter"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input text-xs text-slate-900"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !currentPassword || !newPassword}
              className="btn-primary text-xs !py-2.5 !px-5 font-bold shadow-md shadow-orange-500/20"
            >
              {busy ? 'Updating Password…' : 'Update Password'}
            </button>
          </form>

          {/* Section 3: 4-Digit Vault PIN */}
          <form onSubmit={handlePinChange} className="card p-6 bg-white border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock size={17} className="text-orange-600" /> Private Vault 4-Digit PIN
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Your PIN encrypts and safeguards your stored document analyses in the zero-knowledge vault.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input text-xs !tracking-[0.4em] font-mono text-slate-900"
                placeholder="••••"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">New 4-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input text-xs !tracking-[0.4em] font-mono text-slate-900"
                  placeholder="••••"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input text-xs !tracking-[0.4em] font-mono text-slate-900"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            {pinMsg.text && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                pinMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {pinMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{pinMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !currentPin || newPin.length !== 4}
              className="btn-primary text-xs !py-2.5 !px-5 font-bold shadow-md shadow-orange-500/20"
            >
              {busy ? 'Updating PIN…' : 'Update Vault PIN'}
            </button>
          </form>

        </div>
      </div>
    </AppShell>
  )
}
