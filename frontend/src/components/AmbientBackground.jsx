import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#060714]">
      {/* Deep Royal Blue & Indigo Bloom (Top Right & Center) */}
      <div 
        className="absolute -top-[10%] right-[5%] w-[850px] h-[750px] rounded-full blur-[180px] opacity-45 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #251e6b 0%, #1e1b4b 40%, #0e0d2d 70%, transparent 85%)' 
        }}
      />

      {/* Atmospheric Dark Violet Bloom (Middle Left) */}
      <div 
        className="absolute top-[28%] -left-[150px] w-[750px] h-[750px] rounded-full blur-[200px] opacity-40 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #3b0764 0%, #2e1065 45%, #180938 75%, transparent 90%)' 
        }}
      />

      {/* Soft Luminous Lavender / Radiant Violet Corner Glow (Bottom Right) */}
      <div 
        className="absolute -bottom-[100px] right-[2%] w-[650px] h-[550px] rounded-full blur-[160px] opacity-35 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #7c3aed 0%, #6366f1 35%, #312e81 65%, transparent 85%)' 
        }}
      />

      {/* Central Soft Vignette Overlay to ensure text readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, transparent 20%, rgba(6, 7, 20, 0.65) 100%)'
        }}
      />
    </div>
  )
}
