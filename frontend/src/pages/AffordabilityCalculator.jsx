import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, IndianRupee, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, Building, Home, Landmark, Car, Briefcase, Zap, TrendingUp, DollarSign } from 'lucide-react'
import AppShell from '../components/AppShell'

const COMMITMENT_TYPES = [
  { id: 'rent', label: 'Residential Rent', icon: Home, maxSafeRatio: 0.30 },
  { id: 'homeloan', label: 'Home Loan EMI', icon: Landmark, maxSafeRatio: 0.35 },
  { id: 'personalloan', label: 'Personal Loan EMI', icon: DollarSign, maxSafeRatio: 0.20 },
  { id: 'carloan', label: 'Vehicle Loan EMI', icon: Car, maxSafeRatio: 0.15 },
  { id: 'commercial', label: 'Commercial Lease', icon: Briefcase, maxSafeRatio: 0.25 },
]

const CITY_TIERS = [
  { id: 'tier1', label: 'Tier 1 Metro (Mumbai, Bangalore, Delhi NCR, etc.)', livingCostPercent: 0.35 },
  { id: 'tier2', label: 'Tier 2 City (Pune, Hyderabad, Chennai, Ahmedabad, etc.)', livingCostPercent: 0.28 },
  { id: 'tier3', label: 'Tier 3 / Other Towns', livingCostPercent: 0.20 },
]

export default function AffordabilityCalculator() {
  const navigate = useNavigate()

  const [salary, setSalary] = useState(75000)
  const [commitment, setCommitment] = useState(25000)
  const [existingDebts, setExistingDebts] = useState(5000)
  const [type, setType] = useState('rent')
  const [cityTier, setCityTier] = useState('tier1')

  const selectedType = useMemo(() => COMMITMENT_TYPES.find(t => t.id === type) || COMMITMENT_TYPES[0], [type])
  const selectedCity = useMemo(() => CITY_TIERS.find(c => c.id === cityTier) || CITY_TIERS[0], [cityTier])

  const math = useMemo(() => {
    const s = Math.max(1, Number(salary) || 0)
    const c = Math.max(0, Number(commitment) || 0)
    const d = Math.max(0, Number(existingDebts) || 0)

    const dti = ((c + d) / s) * 100
    const primaryRatio = (c / s) * 100
    const livingExpenses = s * selectedCity.livingCostPercent
    const remainingBuffer = s - c - d - livingExpenses
    const safeMax = s * selectedType.maxSafeRatio

    // Continuous exact mathematical score (0 - 100)
    const dtiRatio = (c + d) / s
    let baseScore = 100
    if (dtiRatio <= 0.15) {
      baseScore = 98 - (dtiRatio / 0.15) * 8
    } else if (dtiRatio <= 0.30) {
      baseScore = 90 - ((dtiRatio - 0.15) / 0.15) * 16
    } else if (dtiRatio <= 0.42) {
      baseScore = 74 - ((dtiRatio - 0.30) / 0.12) * 20
    } else if (dtiRatio <= 0.60) {
      baseScore = 54 - ((dtiRatio - 0.42) / 0.18) * 24
    } else if (dtiRatio <= 0.85) {
      baseScore = 30 - ((dtiRatio - 0.60) / 0.25) * 18
    } else {
      baseScore = Math.max(3, 12 - (dtiRatio - 0.85) * 15)
    }

    if (remainingBuffer < 0) {
      const deficitPct = Math.abs(remainingBuffer) / s
      baseScore -= Math.min(20, deficitPct * 25)
    } else if (remainingBuffer > s * 0.35) {
      baseScore += Math.min(5, (remainingBuffer / s) * 6)
    }
    const score = Math.round(Math.max(3, Math.min(99, baseScore)))

    let status = 'healthy'
    let statusLabel = 'Safe & Affordable'
    let statusColor = 'text-emerald-700'
    let statusBg = 'bg-emerald-50 border-emerald-200'

    if (score < 40 || dti > 50 || primaryRatio > selectedType.maxSafeRatio * 100 * 1.35) {
      status = 'danger'
      statusLabel = 'High Financial Stress / Default Risk'
      statusColor = 'text-red-700'
      statusBg = 'bg-red-50 border-red-200'
    } else if (score < 70 || dti > 38 || primaryRatio > selectedType.maxSafeRatio * 100) {
      status = 'warning'
      statusLabel = 'Moderate Budget Strain'
      statusColor = 'text-amber-700'
      statusBg = 'bg-amber-50 border-amber-200'
    }

    return {
      dti: dti.toFixed(1),
      primaryRatio: primaryRatio.toFixed(1),
      livingExpenses: Math.round(livingExpenses),
      remainingBuffer: Math.round(remainingBuffer),
      safeMax: Math.round(safeMax),
      score,
      status,
      statusLabel,
      statusColor,
      statusBg,
    }
  }, [salary, commitment, existingDebts, selectedType, selectedCity])

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator size={13} className="text-orange-600" /> Deterministic Financial Stress-Test
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Affordability & <span className="text-orange-600">Debt-to-Income Engine</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
            Calculate your exact financial capacity before signing any rental agreement, lease, or bank loan.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Commitment Type */}
            <div className="card p-5 bg-white border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block">
                1. Select Agreement / Loan Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMMITMENT_TYPES.map(t => {
                  const Icon = t.icon
                  const active = type === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        active 
                          ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-orange-600' : 'text-slate-500'} />
                      <span className="text-xs leading-tight">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Income & Expense Inputs */}
            <div className="card p-6 bg-white border-slate-200 shadow-sm space-y-5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                2. Enter Financial Figures
              </label>

              {/* Monthly Salary */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-slate-700">Monthly In-Hand Salary</span>
                  <span className="font-mono text-orange-600">₹{Number(salary).toLocaleString('en-IN')}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={salary}
                    onChange={e => setSalary(Number(e.target.value) || 0)}
                    className="input !pl-8 text-base font-bold text-slate-900"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[35000, 50000, 75000, 120000, 200000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSalary(val)}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-orange-300 text-[11px] text-slate-600 hover:text-orange-600 font-semibold transition-colors cursor-pointer"
                    >
                      ₹{(val/1000)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Monthly Rent / EMI */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-slate-700">Target Monthly {selectedType.label}</span>
                  <span className="font-mono text-orange-600">₹{Number(commitment).toLocaleString('en-IN')}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={commitment}
                    onChange={e => setCommitment(Number(e.target.value) || 0)}
                    className="input !pl-8 text-base font-bold text-slate-900"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[15000, 25000, 40000, 65000, 100000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCommitment(val)}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-orange-300 text-[11px] text-slate-600 hover:text-orange-600 font-semibold transition-colors cursor-pointer"
                    >
                      ₹{(val/1000)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Existing EMIs / Debts */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-slate-700">Existing Debts / Other EMIs (Optional)</span>
                  <span className="font-mono text-slate-600">₹{Number(existingDebts).toLocaleString('en-IN')}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={existingDebts}
                    onChange={e => setExistingDebts(Number(e.target.value) || 0)}
                    className="input !pl-8 text-sm text-slate-900 font-medium"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* City Tier */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Location / City Living Cost
                </label>
                <select
                  value={cityTier}
                  onChange={e => setCityTier(e.target.value)}
                  className="input text-xs font-semibold text-slate-900 bg-white"
                >
                  {CITY_TIERS.map(c => (
                    <option key={c.id} value={c.id} className="text-slate-900">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculated Dashboard */}
          <div className="lg:col-span-5 space-y-6">
            {/* Status Card */}
            <div className={`card p-6 border ${math.statusBg} bg-white shadow-sm transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {math.status === 'healthy' ? (
                    <CheckCircle2 size={26} className="text-emerald-600 shrink-0" />
                  ) : math.status === 'warning' ? (
                    <AlertTriangle size={26} className="text-amber-600 shrink-0" />
                  ) : (
                    <ShieldAlert size={26} className="text-red-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Affordability Verdict</p>
                    <p className={`text-base font-black ${math.statusColor}`}>
                      {math.statusLabel}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-3xl font-black ${math.statusColor}`}>
                    {math.score}
                  </span>
                  <span className="text-xs text-slate-400 font-bold"> / 100</span>
                </div>
              </div>


              {/* DTI Gauge Bar */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Total Debt-to-Income (DTI)</span>
                  <span className={`font-mono ${math.statusColor}`}>{math.dti}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      math.status === 'healthy' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                        : math.status === 'warning' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                        : 'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, math.dti))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight font-medium">
                  Standard financial threshold: Keep total debt commitments under 35%–40% of salary.
                </p>
              </div>

              {/* Key Breakdown Metrics */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-medium">Monthly Commitment</span>
                  <span className="font-mono text-slate-900 font-bold">₹{commitment.toLocaleString('en-IN')} ({math.primaryRatio}%)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-medium">Recommended Safe Max</span>
                  <span className="font-mono text-emerald-700 font-bold">₹{math.safeMax.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-medium">Estimated Living Expenses</span>
                  <span className="font-mono text-slate-800 font-semibold">₹{math.livingExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-slate-100">
                  <span className="text-slate-900 font-bold">Estimated Monthly Savings Buffer</span>
                  <span className={`font-mono font-bold ${math.remainingBuffer > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    ₹{math.remainingBuffer.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actionable Advice Box */}
            <div className="card p-5 bg-white border-orange-200/80 shadow-sm">
              <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Zap size={14} className="text-orange-600" />
                Financial Strategy Recommendation
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                {math.status === 'healthy' 
                  ? `At ₹${commitment.toLocaleString('en-IN')}/mo (${math.primaryRatio}% of salary), this commitment fits comfortably within your budget, leaving a healthy ₹${math.remainingBuffer.toLocaleString('en-IN')} buffer for investments and emergencies.`
                  : math.status === 'warning'
                  ? `This commitment takes up ${math.primaryRatio}% of your salary. While feasible, you will have a tighter cash-flow buffer in ${selectedCity.label.split('(')[0]}. Consider negotiating down towards ₹${math.safeMax.toLocaleString('en-IN')}/mo.`
                  : `At ${math.dti}% total DTI, this commitment poses severe financial stress and default risk. In case of unexpected medical emergencies or job disruption, debt servicing will exceed disposable cash. We strongly recommend capping rent/EMI below ₹${math.safeMax.toLocaleString('en-IN')}/mo.`
                }
              </p>

              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary w-full text-xs !py-3 font-bold"
              >
                Scan a Document for Hidden Penalty Clauses →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
