import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, GitCompare, CheckCircle, AlertTriangle, XCircle, MinusCircle, PlusCircle } from 'lucide-react'
import API from '../api'
import AppShell from '../components/AppShell'

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
    if (shift === 'Safer') return 'text-emerald-800 bg-emerald-50 border-emerald-200'
    if (shift === 'Riskier') return 'text-red-800 bg-red-50 border-red-200'
    return 'text-slate-700 bg-slate-100 border-slate-200'
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
            <GitCompare size={14} className="text-orange-600" /> Contract Diff & Redline
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Compare <span className="text-orange-600">Agreement Versions</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
            Semantic clause diff between original and proposed drafts to highlight risk shifts and added liabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 bg-white border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Version 1 (Original)</h3>
            <select 
              value={doc1} 
              onChange={e => setDoc1(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="">Select Document...</option>
              {history.map(h => (
                <option key={h.id} value={h.id}>{h.original_filename} ({h.contract_type})</option>
              ))}
            </select>
          </div>
          <div className="card p-6 bg-white border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Version 2 (Proposed)</h3>
            <select 
              value={doc2} 
              onChange={e => setDoc2(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-orange-500"
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
            className="btn-primary !px-10 !py-3.5 text-base font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2"
          >
            <GitCompare size={18} />
            <span>{isComparing ? 'Comparing Clauses...' : 'Run Redline Comparison'}</span>
          </button>
        </div>

        {result && (
          <div className="space-y-8">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-5 bg-white border-slate-200 shadow-sm text-center">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Unchanged</span>
                <span className="text-3xl font-black text-slate-800">{result.summary.matched}</span>
              </div>
              <div className="card p-5 bg-amber-50/70 border-amber-200 shadow-sm text-center">
                <span className="text-amber-800 text-xs font-bold uppercase tracking-wider block mb-1">Modified</span>
                <span className="text-3xl font-black text-amber-700">{result.summary.modified}</span>
              </div>
              <div className="card p-5 bg-emerald-50/70 border-emerald-200 shadow-sm text-center">
                <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider block mb-1">Added</span>
                <span className="text-3xl font-black text-emerald-700">{result.summary.added}</span>
              </div>
              <div className="card p-5 bg-red-50/70 border-red-200 shadow-sm text-center">
                <span className="text-red-800 text-xs font-bold uppercase tracking-wider block mb-1">Removed</span>
                <span className="text-3xl font-black text-red-700">{result.summary.removed}</span>
              </div>
            </div>

            {/* Modified Clauses */}
            {result.modified_clauses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600"/> Modified Clauses
                </h2>
                <div className="space-y-4">
                  {result.modified_clauses.map((mod, i) => (
                    <div key={i} className="card bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="px-6 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <span className="text-xs font-bold text-slate-700">Clause {mod.v1_clause.clause_number} &rarr; {mod.v2_clause.clause_number}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getRiskShiftColor(mod.risk_shift)}`}>
                          {mod.risk_shift}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <div className="p-6 bg-red-50/30">
                          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2 block">Original (V1)</span>
                          <p className="text-sm text-slate-600 line-through decoration-red-400 font-mono leading-relaxed">{mod.v1_clause.clause_text}</p>
                          <div className="mt-4 pt-3 border-t border-red-100">
                            <span className="text-xs text-slate-500 font-semibold">Risk Score: {mod.v1_clause.risk_score}</span>
                          </div>
                        </div>
                        <div className="p-6 bg-emerald-50/30">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 block">Proposed (V2)</span>
                          <p className="text-sm text-slate-900 font-mono leading-relaxed">{mod.v2_clause.clause_text}</p>
                          <div className="mt-4 pt-3 border-t border-emerald-100">
                            <span className="text-xs text-slate-500 font-semibold">Risk Score: {mod.v2_clause.risk_score}</span>
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
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PlusCircle size={18} className="text-emerald-600"/> Added Clauses (V2)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.added_clauses.map((add, i) => (
                    <div key={i} className="card p-5 bg-emerald-50/40 border-emerald-200 shadow-sm rounded-xl">
                      <span className="text-xs font-bold text-emerald-800 mb-2 block uppercase tracking-wider">Clause {add.v2_clause.clause_number}</span>
                      <p className="text-sm text-slate-800 font-mono leading-relaxed">{add.v2_clause.clause_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Clauses */}
            {result.removed_clauses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MinusCircle size={18} className="text-red-600"/> Removed Clauses (From V1)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.removed_clauses.map((rem, i) => (
                    <div key={i} className="card p-5 bg-red-50/40 border-red-200 shadow-sm rounded-xl">
                      <span className="text-xs font-bold text-red-800 mb-2 block uppercase tracking-wider">Clause {rem.v1_clause.clause_number}</span>
                      <p className="text-sm text-slate-600 font-mono line-through decoration-red-400 leading-relaxed">{rem.v1_clause.clause_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </AppShell>
  )
}
