import React, { useState } from 'react'
import { AlertTriangle, ShieldCheck, AlertCircle, Info, Filter } from 'lucide-react'

/**
 * Color coding:
 * - Red (#dc2626): Risky / Critical (Severe danger, unfair forfeitures, unvetted liability)
 * - Orange (#ea580c): Moderate Risk (Elevated conditions, notice obligations)
 * - Yellow (#d97706): Above Normal (Standard obligations, minor warnings)
 * - Green (#059669): Normal / Safe (Clean, statutory protections, mutual rights)
 */

export function getClauseTier(clause) {
  const sev = (clause?.severity || '').toLowerCase()
  const score = Number(clause?.risk_score) || 0

  if (sev === 'critical' || score >= 75) {
    return 'red'
  }
  if (sev === 'high' || score >= 55) {
    return 'orange'
  }
  if (sev === 'medium' || score >= 35) {
    return 'yellow'
  }
  return 'green'
}

export default function RiskDistributionChart({ clauses = [], onFilterSeverity, selectedSeverity }) {
  const [hoveredSegment, setHoveredSegment] = useState(null)

  const total = clauses.length || 1

  const redClauses = clauses.filter(c => getClauseTier(c) === 'red')
  const orangeClauses = clauses.filter(c => getClauseTier(c) === 'orange')
  const yellowClauses = clauses.filter(c => getClauseTier(c) === 'yellow')
  const greenClauses = clauses.filter(c => getClauseTier(c) === 'green')

  const categories = [
    {
      id: 'red',
      label: 'Risky / Severe',
      sublabel: 'One-sided terms & penalties',
      count: redClauses.length,
      pct: Math.round((redClauses.length / total) * 100) || 0,
      color: '#dc2626',
      glow: 'rgba(220, 38, 38, 0.35)',
      bgLight: 'bg-red-50',
      borderLight: 'border-red-300',
      badgeBg: 'bg-red-50 text-red-800 border border-red-200 font-bold',
      textColor: 'text-red-700',
      icon: AlertCircle,
    },
    {
      id: 'orange',
      label: 'Moderate Risk',
      sublabel: 'Elevated notice & clauses',
      count: orangeClauses.length,
      pct: Math.round((orangeClauses.length / total) * 100) || 0,
      color: '#ea580c',
      glow: 'rgba(234, 88, 12, 0.35)',
      bgLight: 'bg-orange-50',
      borderLight: 'border-orange-300',
      badgeBg: 'bg-orange-50 text-orange-800 border border-orange-200 font-bold',
      textColor: 'text-orange-700',
      icon: AlertTriangle,
    },
    {
      id: 'yellow',
      label: 'Above Normal',
      sublabel: 'Standard obligations',
      count: yellowClauses.length,
      pct: Math.round((yellowClauses.length / total) * 100) || 0,
      color: '#d97706',
      glow: 'rgba(217, 119, 6, 0.35)',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-300',
      badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
      textColor: 'text-amber-700',
      icon: Info,
    },
    {
      id: 'green',
      label: 'Normal / Safe',
      sublabel: 'Standard rights & fair terms',
      count: greenClauses.length,
      pct: Math.round((greenClauses.length / total) * 100) || 0,
      color: '#059669',
      glow: 'rgba(5, 150, 105, 0.35)',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
      textColor: 'text-emerald-700',
      icon: ShieldCheck,
    },
  ]

  let accumulatedAngle = 0
  const radius = 58
  const strokeWidth = 22
  const center = 80
  const circumference = 2 * Math.PI * radius

  const slices = categories.map((cat) => {
    const fraction = cat.count / total
    const dashLength = fraction * circumference
    const dashOffset = -accumulatedAngle * (circumference / 360)
    accumulatedAngle += fraction * 360

    return {
      ...cat,
      dashLength,
      dashOffset,
      circumference,
    }
  })

  return (
    <div className="card mb-8 p-6 bg-white border-slate-200 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Risk Breakdown Spectrum
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Visual breakdown across Red (Risky), Orange (Moderate), Yellow (Above Normal), and Green (Normal) clauses.
          </p>
        </div>

        {onFilterSeverity && selectedSeverity && (
          <button
            onClick={() => onFilterSeverity(null)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
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
                stroke="rgba(15, 23, 42, 0.08)"
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
                    strokeLinecap="butt"
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
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {clauses.length}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Total Parts
              </span>
            </div>
          </div>
        </div>


        {/* Right: Detailed Legend Grid */}
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-3.5">
          {categories.map((cat) => {
            const isHovered = hoveredSegment === cat.id
            const isSelected = selectedSeverity === cat.id

            return (
              <div
                key={cat.id}
                onClick={() => onFilterSeverity && onFilterSeverity(selectedSeverity === cat.id ? null : cat.id)}
                onMouseEnter={() => setHoveredSegment(cat.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${cat.bgLight} ${cat.borderLight} ring-2 ring-orange-500/50 scale-[1.02] shadow-md`
                    : isHovered
                    ? `${cat.bgLight} ${cat.borderLight} scale-[1.01] shadow-sm`
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-bold text-slate-900 truncate">{cat.label}</span>
                  </div>
                  
                  {/* Distinct badge */}
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${cat.badgeBg}`}>
                    {cat.count} ({cat.pct}%)
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  {cat.sublabel}
                </p>
              </div>
            )
          })}
        </div>

      </div>

      {/* Progress Bar Visualizer */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 gap-1 border border-slate-200 shadow-inner">
          {categories.map((cat) => (
            cat.count > 0 && (
              <div
                key={cat.id}
                style={{
                  width: `${(cat.count / total) * 100}%`,
                  backgroundColor: cat.color,
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
