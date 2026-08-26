import { Link, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../auth'

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-[#e8e4dc]">
            <div className="w-8 h-8 rounded-lg bg-[#c4a574] text-[#14110c] flex items-center justify-center">
              <Shield size={16} />
            </div>
            <span className="font-semibold tracking-tight">ClauseGuard</span>
          </Link>
          {user && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-stone-400 hidden sm:inline">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={onLogout} className="text-stone-400 hover:text-white">Log out</button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 px-6 py-5 mt-8">
        <p className="max-w-5xl mx-auto text-center text-xs text-stone-500 leading-relaxed">
          ClauseGuard is a reading aid for education and awareness. It is not legal advice and does not replace a licensed lawyer.
          Do not treat these outputs as a reason to sign or reject a document.
        </p>
      </footer>
    </div>
  )
}
