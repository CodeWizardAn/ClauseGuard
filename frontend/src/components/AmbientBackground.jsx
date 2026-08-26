import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Background Image Layer with subtle blend */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06] mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: "url('/security_bg.jpg')" }}
      />

      {/* Cyber / Legal Matrix Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(rgba(196, 165, 116, 0.45) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient Moving Glow Orbs */}
      {/* Orb 1: Warm Gold (top-left / center) */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[120px] opacity-25 animate-ambient-1 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c4a574 0%, rgba(196, 165, 116, 0.2) 60%, transparent 80%)' }}
      />

      {/* Orb 2: Cyber Blue / Deep Indigo (top-right / middle) */}
      <div 
        className="absolute top-[20%] -right-[15%] w-[700px] h-[700px] rounded-full blur-[140px] opacity-25 animate-ambient-2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, rgba(59, 130, 246, 0.18) 60%, transparent 80%)' }}
      />

      {/* Orb 3: Emerald Shield Green (bottom-left) */}
      <div 
        className="absolute -bottom-[20%] left-[15%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-20 animate-ambient-3 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10b981 0%, rgba(16, 185, 129, 0.15) 60%, transparent 80%)' }}
      />

      {/* Orb 4: Purple / Deep Violet (bottom-right / center) */}
      <div 
        className="absolute top-[60%] right-[25%] w-[550px] h-[550px] rounded-full blur-[120px] opacity-15 animate-ambient-4 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, rgba(139, 92, 246, 0.12) 60%, transparent 80%)' }}
      />

      {/* Subtle sweeping light shimmer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#c4a574]/[0.02] to-transparent animate-shimmer pointer-events-none" />
    </div>
  )
}
