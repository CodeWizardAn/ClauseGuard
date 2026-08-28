import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search, ArrowLeft, Lightbulb, ShieldAlert, ChevronDown, Check, Languages } from 'lucide-react'
import API from '../api'
import { LANGUAGES } from '../languages'
import AppShell from '../components/AppShell'

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
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen size={14} className="text-orange-600" /> Plain-Language Legal Lexicon
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Legal <span className="text-orange-600">Glossary</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Understand complex legalese translated into everyday terms and relatable Indian analogies.
            </p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-orange-50 text-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border border-slate-200 shadow-sm cursor-pointer"
            >
              <Languages size={16} className="text-orange-600" />
              {LANGUAGES.find(l => l.code === lang)?.label}
              <ChevronDown size={14} className="text-slate-500 ml-1" />
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setIsLangMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 flex items-center justify-between font-semibold"
                  >
                    {l.label}
                    {lang === l.code && <Check size={14} className="text-orange-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search legal terms (e.g. indemnity, force majeure)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-orange-500 shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-orange-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dictionary List */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Translating Glossary...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((t, idx) => (
              <div key={idx} className="card p-6 bg-white border-slate-200 hover:border-orange-300 shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">{t.term}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                    {t.category}
                  </span>
                </div>
                
                <div className="space-y-3.5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-slate-500"/> Formal Legal Definition
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
                      {t.definition}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50/70 border border-orange-200 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-orange-600" /> In Plain Everyday Words
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
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
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No terms found</h3>
            <p className="text-slate-500 text-sm font-medium">Try a different search query or select 'All'.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
