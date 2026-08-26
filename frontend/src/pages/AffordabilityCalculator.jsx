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

    let status = 'healthy'
    let statusLabel = 'Safe & Affordable'
    let statusColor = 'text-emerald-400'
    let statusBg = 'bg-emerald-500/10 border-emerald-500/30'

    if (dti > 50 || primaryRatio > selectedType.maxSafeRatio * 100 * 1.35) {
      status = 'danger'
      statusLabel = 'High Financial Stress / Default Risk'
      statusColor = 'text-rose-400'
      statusBg = 'bg-rose-500/10 border-rose-500/30'
    } else if (dti > 38 || primaryRatio > selectedType.maxSafeRatio * 100) {
      status = 'warning'
      statusLabel = 'Moderate Budget Strain'
      statusColor = 'text-amber-400'
      statusBg = 'bg-amber-500/10 border-amber-500/30'
    }

    return {
      dti: Math.round(dti),
      primaryRatio: Math.round(primaryRatio),
      livingExpenses: Math.round(livingExpenses),
      remainingBuffer: Math.round(remainingBuffer),
      safeMax: Math.round(safeMax),
      status,
      statusLabel,
      statusColor,
      statusBg,
    }
  }, [salary, commitment, existingDebts, selectedType, selectedCity])

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator size={13} className="text-purple-400" /> Instant Financial Stress-Tester
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Smart Affordability <span className="text-gradient-purple">Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            No document upload required. Stress-test your rent or loan commitments against your real in-hand income to calculate safe financial limits.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Commitment Type */}
            <div className="card p-5 border-purple-500/15">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 block">
                1. Select Agreement / Loan Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMITMENT_TYPES.map(t => {
                  const Icon = t.icon
                  const active = type === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                        active 
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/20' 
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-slate-200 hover:border-purple-500/30'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-purple-400' : 'text-slate-400'} />
                      <span className="text-xs font-semibold leading-tight">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Income & Expense Inputs */}
            <div className="card p-6 border-purple-500/15 space-y-5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Enter Financial Figures
              </label>

              {/* Monthly Salary */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Monthly In-Hand Salary</span>
                  <span className="font-mono text-purple-300 font-bold">₹{Number(salary).toLocaleString('en-IN')}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={salary}
                    onChange={e => setSalary(Number(e.target.value) || 0)}
                    className="input !pl-8 text-base font-semibold"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[35000, 50000, 75000, 120000, 200000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSalary(val)}
                      className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      ₹{(val/1000)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Monthly Rent / EMI */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Target Monthly {selectedType.label}</span>
                  <span className="font-mono text-purple-300 font-bold">₹{Number(commitment).toLocaleString('en-IN')}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={commitment}
                    onChange={e => setCommitment(Number(e.target.value) || 0)}
                    className="input !pl-8 text-base font-semibold"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[15000, 25000, 40000, 65000, 100000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCommitment(val)}
                      className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      ₹{(val/1000)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Existing EMIs / Debts */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Existing Debts / Other EMIs (Optional)</span>
                  <span className="font-mono text-slate-400 font-semibold">₹{Number(existingDebts).toLocaleString('en-IN')}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={existingDebts}
                    onChange={e => setExistingDebts(Number(e.target.value) || 0)}
                    className="input !pl-8 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* City Tier */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Location / City Living Cost
                </label>
                <select
                  value={cityTier}
                  onChange={e => setCityTier(e.target.value)}
                  className="input text-xs"
                >
                  {CITY_TIERS.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0b0e1e] text-white">
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
            <div className={`card p-6 border ${math.statusBg} transition-all duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                {math.status === 'healthy' ? (
                  <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                ) : math.status === 'warning' ? (
                  <AlertTriangle size={24} className="text-amber-400 shrink-0" />
                ) : (
                  <ShieldAlert size={24} className="text-rose-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Affordability Verdict</p>
                  <p className={`text-base font-extrabold ${math.statusColor}`}>
                    {math.statusLabel}
                  </p>
                </div>
              </div>

              {/* DTI Gauge Bar */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Total Debt-to-Income (DTI)</span>
                  <span className={`font-mono font-bold ${math.statusColor}`}>{math.dti}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      math.status === 'healthy' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                        : math.status === 'warning' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, math.dti))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Standard financial threshold: Keep total debt commitments under 35%–40% of salary.
                </p>
              </div>

              {/* Key Breakdown Metrics */}
              <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Monthly Commitment</span>
                  <span className="font-mono text-white font-bold">₹{commitment.toLocaleString('en-IN')} ({math.primaryRatio}%)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Recommended Safe Max</span>
                  <span className="font-mono text-emerald-400 font-semibold">₹{math.safeMax.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Estimated Living Expenses</span>
                  <span className="font-mono text-slate-300">₹{math.livingExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-white/10">
                  <span className="text-slate-300 font-semibold">Estimated Monthly Savings Buffer</span>
                  <span className={`font-mono font-bold ${math.remainingBuffer > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{math.remainingBuffer.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actionable Advice Box */}
            <div className="card p-5 border-purple-500/20">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Zap size={14} className="text-purple-400" />
                Financial Strategy Recommendation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {math.status === 'healthy' 
                  ? `At ₹${commitment.toLocaleString('en-IN')}/mo (${math.primaryRatio}% of salary), this commitment fits comfortably within your budget, leaving a healthy ₹${math.remainingBuffer.toLocaleString('en-IN')} buffer for investments and emergencies.`
                  : math.status === 'warning'
                  ? `This commitment takes up ${math.primaryRatio}% of your salary. While feasible, you will have a tighter cash-flow buffer in ${selectedCity.label.split('(')[0]}. Consider negotiating down towards ₹${math.safeMax.toLocaleString('en-IN')}/mo.`
                  : `At ${math.dti}% total DTI, this commitment poses severe financial stress and default risk. In case of unexpected medical emergencies or job disruption, debt servicing will exceed disposable cash. We strongly recommend capping rent/EMI below ₹${math.safeMax.toLocaleString('en-IN')}/mo.`
                }
              </p>

              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary w-full text-xs !py-2.5"
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
