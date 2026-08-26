import React from 'react'

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Base Rich Gradient Canvas matching reference image */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #060818 0%, #0d102d 30%, #140e34 60%, #080a1c 100%)'
        }}
      />

      {/* Top-Right & Upper Center: Rich Royal Indigo & Deep Blue Visible Shade */}
      <div 
        className="absolute -top-[120px] right-[-50px] w-[750px] h-[650px] rounded-full blur-[110px] opacity-70 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #252077 0%, #1e1b4b 50%, transparent 80%)' 
        }}
      />

      {/* Middle-Left & Center: Rich Atmospheric Deep Violet Bloom */}
      <div 
        className="absolute top-[30%] -left-[100px] w-[650px] h-[650px] rounded-full blur-[120px] opacity-60 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #4c1d95 0%, #31105e 50%, transparent 80%)' 
        }}
      />

      {/* Bottom-Right: Soft Visible Lavender & Violet Radiance */}
      <div 
        className="absolute -bottom-[80px] right-[5%] w-[600px] h-[500px] rounded-full blur-[90px] opacity-55 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #7c3aed 0%, #581c87 45%, #1e1b4b 75%, transparent 90%)' 
        }}
      />

      {/* Subtle Bottom-Right Ambient Flare Highlight */}
      <div 
        className="absolute bottom-0 right-0 w-[350px] h-[300px] rounded-full blur-[70px] opacity-35 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, #c084fc 0%, #9333ea 50%, transparent 80%)' 
        }}
      />
    </div>
  )
}
