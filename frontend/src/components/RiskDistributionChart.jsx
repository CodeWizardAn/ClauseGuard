import React, { useState } from 'react'
import { AlertTriangle, ShieldCheck, AlertCircle, Info, Filter } from 'lucide-react'

/**
 * Color coding requested by user:
 * - Red (#ef4444): Risky / Critical (Severe danger, unfair forfeitures, unvetted liability)
 * - Orange (#f97316): Moderate / Less Risky (Elevated conditions, notice obligations)
 * - Yellow (#eab308): Just Above Normal (Standard obligations, minor warnings)
 * - Green (#10b981): Normal / Safe (Clean, statutory protections, mutual rights)
 */

export default function RiskDistributionChart({ clauses = [], onFilterSeverity, selectedSeverity }) {
  const [hoveredSegment, setHoveredSegment] = useState(null)

  const total = clauses.length || 1

  // Classify clauses into the 4 requested severity tiers
  const redClauses = clauses.filter(c => c.severity === 'Critical' || (c.risk_score >= 70))
  const orangeClauses = clauses.filter(c => (c.severity === 'High' && c.risk_score < 70) || (c.risk_score >= 50 && c.risk_score < 70))
  const yellowClauses = clauses.filter(c => (c.severity === 'Medium' && c.risk_score < 50) || (c.risk_score >= 30 && c.risk_score < 50))
  const greenClauses = clauses.filter(c => c.severity === 'Clean' || c.severity === 'Low' || (c.risk_score < 30))

  const categories = [
    {
      id: 'red',
      label: 'Risky / Severe',
      sublabel: 'One-sided terms & penalties',
      count: redClauses.length,
      pct: Math.round((redClauses.length / total) * 100) || 0,
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
      bgLight: 'bg-red-500/10',
      borderLight: 'border-red-500/30',
      textColor: 'text-red-400',
      icon: AlertCircle,
    },
    {
      id: 'orange',
      label: 'Moderate Risk',
      sublabel: 'Elevated notice & clauses',
      count: orangeClauses.length,
      pct: Math.round((orangeClauses.length / total) * 100) || 0,
      color: '#f97316',
      glow: 'rgba(249, 115, 22, 0.4)',
      bgLight: 'bg-orange-500/10',
      borderLight: 'border-orange-500/30',
      textColor: 'text-orange-400',
      icon: AlertTriangle,
    },
    {
      id: 'yellow',
      label: 'Above Normal',
      sublabel: 'Standard obligations',
      count: yellowClauses.length,
      pct: Math.round((yellowClauses.length / total) * 100) || 0,
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.4)',
      bgLight: 'bg-yellow-500/10',
      borderLight: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      icon: Info,
    },
    {
      id: 'green',
      label: 'Normal / Safe',
      sublabel: 'Standard rights & fair terms',
      count: greenClauses.length,
      pct: Math.round((greenClauses.length / total) * 100) || 0,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      bgLight: 'bg-emerald-500/10',
      borderLight: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      icon: ShieldCheck,
    },
  ]

  // Calculate SVG Pie/Donut Chart Coordinates
  let accumulatedAngle = 0
  const radius = 64
  const strokeWidth = 24
  const center = 80
  const circumference = 2 * Math.PI * radius

  const slices = categories.map((cat) => {
    const angle = (cat.count / total) * 360
    const dashLength = (cat.count / total) * circumference
    const dashOffset = -accumulatedAngle * (circumference / 360)
    accumulatedAngle += angle

    return {
      ...cat,
      dashLength,
      dashOffset,
      circumference,
    }
  })

  return (
    <div className="card p-6 mb-8 border border-white/10 shadow-2xl bg-gradient-to-br from-[#0c0f2b] via-[#090b22] to-[#060818]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Risk Breakdown Spectrum</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              Interactive Visualizer
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual breakdown across Red (Risky), Orange (Moderate), Yellow (Above Normal), and Green (Normal) clauses.
          </p>
        </div>

        {onFilterSeverity && selectedSeverity && (
          <button
            onClick={() => onFilterSeverity(null)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Filter size={12} />
            <span>Show All ({clauses.length})</span>
          </button>
        )}
      </div>

      {/* Main Visual Section: Donut + Legend */}
      <div className="grid md:grid-cols-12 gap-8 items-center">
        
        {/* Left: Interactive Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            
            {/* SVG Donut */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />

              {/* Slices */}
              {slices.map((slice) => {
                if (slice.count === 0) return null
                const isHovered = hoveredSegment === slice.id
                const isSelected = selectedSeverity === slice.id

                return (
                  <circle
                    key={slice.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${slice.dashLength} ${slice.circumference - slice.dashLength}`}
                    strokeDashoffset={slice.dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      filter: isHovered || isSelected ? `drop-shadow(0 0 8px ${slice.glow})` : 'none',
                    }}
                    onMouseEnter={() => setHoveredSegment(slice.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => onFilterSeverity && onFilterSeverity(selectedSeverity === slice.id ? null : slice.id)}
                  />
                )
              })}
            </svg>

            {/* Inner Center Statistics Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-3xl font-black text-white tracking-tight">
                {clauses.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Total Parts
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Click any segment or card to filter clauses
          </p>
        </div>

        {/* Right: Detailed Legend Grid with Interactive Badges */}
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isHovered = hoveredSegment === cat.id
            const isSelected = selectedSeverity === cat.id

            return (
              <div
                key={cat.id}
                onClick={() => onFilterSeverity && onFilterSeverity(selectedSeverity === cat.id ? null : cat.id)}
                onMouseEnter={() => setHoveredSegment(cat.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `${cat.bgLight} ${cat.borderLight} ring-2 ring-purple-500/50 scale-[1.02]`
                    : isHovered
                    ? `${cat.bgLight} ${cat.borderLight} scale-[1.01]`
                    : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                    />
                    <span className="text-xs font-bold text-white">{cat.label}</span>
                  </div>
                  <span className={`text-xs font-extrabold ${cat.textColor}`}>
                    {cat.count} ({cat.pct}%)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  {cat.sublabel}
                </p>
              </div>
            )
          })}
        </div>

      </div>

      {/* Progress Bar Visualizer */}
      <div className="mt-6 pt-4 border-t border-white/[0.06]">
        <div className="h-3 w-full rounded-full bg-white/[0.05] overflow-hidden flex p-0.5 gap-1 border border-white/10 shadow-inner">
          {categories.map((cat) => (
            cat.count > 0 && (
              <div
                key={cat.id}
                style={{
                  width: `${(cat.count / total) * 100}%`,
                  backgroundColor: cat.color,
                  boxShadow: `0 0 10px ${cat.color}80`,
                }}
                className="h-full rounded-full transition-all duration-500 cursor-pointer hover:opacity-90"
                title={`${cat.label}: ${cat.count} clauses (${cat.pct}%)`}
                onClick={() => onFilterSeverity && onFilterSeverity(selectedSeverity === cat.id ? null : cat.id)}
              />
            )
          ))}
        </div>
      </div>
    </div>
  )
}
