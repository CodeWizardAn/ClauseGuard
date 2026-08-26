import { useNavigate } from 'react-router-dom'
import { FileSearch, FolderLock } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useAuth } from '../auth'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-stone-500 text-sm mb-2">Welcome back</p>
        <h1 className="text-3xl font-semibold text-[#f4f1ea] mb-3">{user?.name}</h1>
        <p className="text-stone-400 mb-10 max-w-xl">Choose what you want to do. We keep papers simple, and we do not store names or phone numbers from the documents you upload.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => navigate('/analyze')} className="card p-8 text-left hover:border-[#c4a574]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c4a574]/15 text-[#c4a574] flex items-center justify-center mb-5">
              <FileSearch size={22} />
            </div>
            <h2 className="text-xl font-semibold text-[#f4f1ea] mb-2">1. Analyse a document</h2>
            <p className="text-sm text-stone-400 leading-relaxed">Upload a rental paper, loan form, terms page or government circular. We explain each part in simple words and show the real risk score.</p>
          </button>

          <button onClick={() => navigate('/vault')} className="card p-8 text-left hover:border-[#c4a574]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c4a574]/15 text-[#c4a574] flex items-center justify-center mb-5">
              <FolderLock size={22} />
            </div>
            <h2 className="text-xl font-semibold text-[#f4f1ea] mb-2">2. Document locker</h2>
            <p className="text-sm text-stone-400 leading-relaxed">Open all papers saved here. You will enter your 4-digit PIN, like DigiLocker, before anything is shown.</p>
          </button>
        </div>

        <div className="flex gap-6 mt-10 text-sm text-stone-500">
          <button onClick={() => navigate('/glossary')} className="hover:text-[#c4a574]">Word meanings</button>
          <button onClick={() => navigate('/comparison')} className="hover:text-[#c4a574]">Compare two papers</button>
        </div>
      </div>
    </AppShell>
  )
}
