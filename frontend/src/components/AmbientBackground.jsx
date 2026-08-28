import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Base Clean Slate/Pearl Canvas */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)'
        }}
      />

      {/* Top-Right: Luminous Warm Tangerine & Soft Amber Sunlit Glow */}
      <div 
        className="absolute -top-[120px] -right-[60px] w-[800px] h-[650px] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #fed7aa 0%, #ffedd5 40%, #fff7ed 70%, transparent 85%)' 
        }}
      />

      {/* Middle-Left: Gentle Coral Peach Glow */}
      <div 
        className="absolute top-[20%] -left-[100px] w-[700px] h-[700px] rounded-full blur-[150px] opacity-35 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #ffedd5 0%, #fed7aa 45%, #fff7ed 75%, transparent 90%)' 
        }}
      />

      {/* Bottom-Right: Soft Sky Pearl Tint */}
      <div 
        className="absolute -bottom-[80px] right-[10%] w-[650px] h-[550px] rounded-full blur-[120px] opacity-30 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #e2e8f0 0%, #fed7aa 40%, transparent 80%)' 
        }}
      />
    </div>
  )
}
