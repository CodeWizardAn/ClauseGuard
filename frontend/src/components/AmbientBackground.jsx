import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#0b0e1e]">
      {/* Top Header Violet/Purple Glow Bloom */}
      <div 
        className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, #4f46e5 45%, transparent 75%)' }}
      />

      {/* Cyber Blue Ambient Glow (Right) */}
      <div 
        className="absolute top-[25%] -right-[120px] w-[600px] h-[600px] rounded-full blur-[160px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, #1d4ed8 40%, transparent 75%)' }}
      />

      {/* Deep Violet Ambient Glow (Bottom Left) */}
      <div 
        className="absolute -bottom-[150px] -left-[100px] w-[700px] h-[700px] rounded-full blur-[160px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9333ea 0%, #6366f1 40%, transparent 75%)' }}
      />

      {/* Subtle Circuit / Tech Line Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}
