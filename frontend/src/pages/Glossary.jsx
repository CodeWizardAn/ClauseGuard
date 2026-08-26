import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search, ArrowLeft, Lightbulb, ShieldAlert, ChevronDown, Check, Languages } from 'lucide-react'
import API from '../api'
import { LANGUAGES } from '../languages'

export default function Glossary() {
  const navigate = useNavigate()
  const [terms, setTerms] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lang, setLang] = useState('en')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchGlossary()
  }, [lang])

  async function fetchGlossary() {
    setIsLoading(true)
    try {
      const res = await API.get(`/glossary?lang=${lang}`)
      setTerms(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ['All', ...new Set(terms.map(t => t.category))]
  
  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.definition.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white p-2">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              <h1 className="text-lg font-bold text-white">Legal Glossary</h1>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
            >
              <Languages size={16} className="text-blue-400" />
              {LANGUAGES.find(l => l.code === lang)?.label}
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setIsLangMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white flex items-center justify-between"
                  >
                    {l.label}
                    {lang === l.code && <Check size={14} className="text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search legal terms..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dictionary List */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Translating Glossary...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((t, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white tracking-wide">{t.term}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    {t.category}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-black/50 p-4 rounded-xl border border-gray-800/50">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-gray-400"/> Formal Definition
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed font-serif">
                      {t.definition}
                    </p>
                  </div>
                  
                  <div className="bg-purple-900/10 border border-purple-900/30 p-4 rounded-xl">
                    <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Lightbulb size={14} /> In Plain English
                    </h4>
                    <p className="text-sm text-purple-200/80 leading-relaxed">
                      {t.analogy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && filteredTerms.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No terms found</h3>
            <p className="text-gray-500 text-sm">Try a different search or category.</p>
          </div>
        )}
      </main>
    </div>
  )
}
