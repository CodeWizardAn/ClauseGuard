import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#09090b]">
      {/* Subtle hairline top lighting */}
      <div 
        className="absolute -top-[240px] left-1/2 -translate-x-1/2 w-[1000px] h-[380px] rounded-full blur-[140px] opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6366f1 0%, #3b82f6 40%, transparent 80%)' }}
      />
      {/* Subtle vignette border */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_60%,#09090b_100%)] opacity-80" />
    </div>
  )
}
