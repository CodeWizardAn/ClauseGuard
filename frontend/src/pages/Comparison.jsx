import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, GitCompare, CheckCircle, AlertTriangle, XCircle, MinusCircle, PlusCircle } from 'lucide-react'
import API from '../api'

export default function Comparison() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [doc1, setDoc1] = useState('')
  const [doc2, setDoc2] = useState('')
  const [result, setResult] = useState(null)
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    API.get('/history')
      .then(res => setHistory(res.data.contracts.filter(c => c.status === 'complete')))
      .catch(console.error)
  }, [])

  const handleCompare = async () => {
    if (!doc1 || !doc2) return alert("Select two documents to compare")
    setIsComparing(true)
    try {
      const res = await API.post('/compare', { doc_id_1: doc1, doc_id_2: doc2 })
      setResult(res.data)
    } catch (err) {
      alert("Failed to compare documents.")
    } finally {
      setIsComparing(false)
    }
  }

  const getRiskShiftColor = (shift) => {
    if (shift === 'Safer') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (shift === 'Riskier') return 'text-red-400 bg-red-500/10 border-red-500/20'
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white p-2">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">Compare Documents</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Version 1 (Original)</h3>
            <select 
              value={doc1} 
              onChange={e => setDoc1(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Document...</option>
              {history.map(h => (
                <option key={h.id} value={h.id}>{h.original_filename} ({h.contract_type})</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Version 2 (Proposed)</h3>
            <select 
              value={doc2} 
              onChange={e => setDoc2(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Document...</option>
              {history.map(h => (
                <option key={h.id} value={h.id}>{h.original_filename} ({h.contract_type})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-center mb-12">
          <button 
            onClick={handleCompare}
            disabled={!doc1 || !doc2 || isComparing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <GitCompare size={18} />
            {isComparing ? 'Comparing Clauses...' : 'Run Comparison'}
          </button>
        </div>

        {result && (
          <div className="space-y-8">
            {/* Summary metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Unchanged</span>
                <span className="text-3xl font-black text-gray-300">{result.summary.matched}</span>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/30 p-6 rounded-2xl text-center">
                <span className="text-yellow-500 text-xs uppercase tracking-wider block mb-2">Modified</span>
                <span className="text-3xl font-black text-yellow-500">{result.summary.modified}</span>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-800/30 p-6 rounded-2xl text-center">
                <span className="text-emerald-500 text-xs uppercase tracking-wider block mb-2">Added</span>
                <span className="text-3xl font-black text-emerald-500">{result.summary.added}</span>
              </div>
              <div className="bg-red-900/20 border border-red-800/30 p-6 rounded-2xl text-center">
                <span className="text-red-500 text-xs uppercase tracking-wider block mb-2">Removed</span>
                <span className="text-3xl font-black text-red-500">{result.summary.removed}</span>
              </div>
            </div>

            {/* Modified Clauses */}
            {result.modified_clauses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2"><AlertTriangle size={18}/> Modified Clauses</h2>
                <div className="space-y-4">
                  {result.modified_clauses.map((mod, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="px-6 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                        <span className="text-xs font-semibold text-gray-400">Clause {mod.v1_clause.clause_number} &rarr; {mod.v2_clause.clause_number}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getRiskShiftColor(mod.risk_shift)}`}>
                          {mod.risk_shift}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-gray-800">
                        <div className="p-6 bg-red-900/5">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2 block">Original (V1)</span>
                          <p className="text-sm text-gray-400 font-serif line-through decoration-red-500/50">{mod.v1_clause.clause_text}</p>
                          <div className="mt-4 pt-4 border-t border-gray-800/50">
                            <span className="text-xs text-gray-500 font-medium">Risk Score: {mod.v1_clause.risk_score}</span>
                          </div>
                        </div>
                        <div className="p-6 bg-emerald-900/5">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 block">Proposed (V2)</span>
                          <p className="text-sm text-gray-200 font-serif">{mod.v2_clause.clause_text}</p>
                          <div className="mt-4 pt-4 border-t border-gray-800/50">
                            <span className="text-xs text-gray-400 font-medium">Risk Score: {mod.v2_clause.risk_score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Added Clauses */}
            {result.added_clauses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-emerald-500 mb-4 flex items-center gap-2"><PlusCircle size={18}/> Added Clauses (V2)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.added_clauses.map((add, i) => (
                    <div key={i} className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-5">
                      <span className="text-xs font-semibold text-emerald-500 mb-2 block">Clause {add.v2_clause.clause_number}</span>
                      <p className="text-sm text-gray-300 font-serif">{add.v2_clause.clause_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Clauses */}
            {result.removed_clauses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2"><MinusCircle size={18}/> Removed Clauses (From V1)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.removed_clauses.map((rem, i) => (
                    <div key={i} className="bg-red-900/10 border border-red-900/30 rounded-xl p-5">
                      <span className="text-xs font-semibold text-red-500 mb-2 block">Clause {rem.v1_clause.clause_number}</span>
                      <p className="text-sm text-gray-500 font-serif line-through decoration-red-500/30">{rem.v1_clause.clause_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}
