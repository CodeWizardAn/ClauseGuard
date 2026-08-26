import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#070a10]">
      {/* Precision Micro Dot Matrix */}
      <div 
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Header Shimmer Bar */}
      <div 
        className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[800px] h-[340px] rounded-full blur-[140px] opacity-25 animate-glow-1 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #d4af37 0%, rgba(212, 175, 55, 0.25) 50%, transparent 80%)' }}
      />

      {/* Deep Cyber Blue Ambient Bloom (Right) */}
      <div 
        className="absolute top-[30%] -right-[150px] w-[650px] h-[650px] rounded-full blur-[160px] opacity-20 animate-glow-2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563eb 0%, rgba(37, 99, 235, 0.18) 50%, transparent 80%)' }}
      />

      {/* Deep Emerald / Gold Ambient Bloom (Bottom Left) */}
      <div 
        className="absolute -bottom-[200px] -left-[100px] w-[700px] h-[700px] rounded-full blur-[160px] opacity-15 animate-glow-1 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10b981 0%, rgba(212, 175, 55, 0.15) 50%, transparent 80%)' }}
      />

      {/* Subtle Noise / Grain Overlay for Textured Polish */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('/security_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}
