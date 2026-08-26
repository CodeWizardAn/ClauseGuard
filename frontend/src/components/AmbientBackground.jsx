import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Base Deep Midnight Obsidian Canvas */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #050818 0%, #080c26 35%, #0d1136 65%, #050716 100%)'
        }}
      />

      {/* Top-Right: Luminous Electric Cyan & Cerulean Glass Refraction Glow */}
      <div 
        className="absolute -top-[100px] -right-[50px] w-[800px] h-[700px] rounded-full blur-[130px] opacity-65 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #0284c7 0%, #0369a1 35%, #1e1b4b 70%, transparent 85%)' 
        }}
      />

      {/* Middle-Left: Rich Atmospheric Ultraviolet & Deep Indigo Bloom */}
      <div 
        className="absolute top-[25%] -left-[120px] w-[750px] h-[750px] rounded-full blur-[140px] opacity-55 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #4338ca 0%, #31105e 45%, #1e1b4b 75%, transparent 90%)' 
        }}
      />

      {/* Bottom-Right: Soft Cyan-Violet Caustic Accent */}
      <div 
        className="absolute -bottom-[80px] right-[10%] w-[650px] h-[550px] rounded-full blur-[100px] opacity-45 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #38bdf8 0%, #7c3aed 40%, #0f172a 80%, transparent 90%)' 
        }}
      />
    </div>
  )
}

