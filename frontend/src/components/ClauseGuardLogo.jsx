import React from 'react'

export default function ClauseGuardLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="shieldCyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>

        <linearGradient id="cyanArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="pinkArc" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shield Pattern Matrix for Quadrants */}
        <pattern id="dotMatrix" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
          <circle cx="1.75" cy="1.75" r="0.75" fill="#38bdf8" opacity="0.85" />
        </pattern>
        <pattern id="dotMatrixPink" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
          <circle cx="1.75" cy="1.75" r="0.75" fill="#e879f9" opacity="0.85" />
        </pattern>

        {/* Clip path for outer shield */}
        <clipPath id="shieldInnerClip">
          <path d="M60 22 C76 22 86 28 86 34 C86 64 68 83 60 90 C52 83 34 64 34 34 C34 28 44 22 60 22 Z" />
        </clipPath>
      </defs>

      {/* 1. Outer Orbit Rings & HUD Arcs */}
      {/* Thin Base Ring */}
      <circle cx="60" cy="60" r="50" stroke="#4338ca" strokeWidth="1.2" opacity="0.4" />

      {/* Top-Left Cyan Arc Segment */}
      <path
        d="M 24 28 A 50 50 0 0 1 54 10"
        stroke="url(#cyanArc)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#neonGlow)"
      />

      {/* Bottom-Right Magenta Arc Segment */}
      <path
        d="M 96 92 A 50 50 0 0 1 66 110"
        stroke="url(#pinkArc)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#neonGlow)"
      />

      {/* Top-Right Accent Arc */}
      <path
        d="M 90 28 A 50 50 0 0 1 108 52"
        stroke="url(#pinkArc)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Bottom-Left Accent Arc */}
      <path
        d="M 12 68 A 50 50 0 0 0 30 96"
        stroke="url(#cyanArc)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* 2. Outer Shield Outline */}
      <path
        d="M60 18 C78 18 90 25 90 32 C90 67 70 88 60 96 C50 88 30 67 30 32 C30 25 42 18 60 18 Z"
        stroke="url(#shieldCyanPurple)"
        strokeWidth="2"
        fill="#0b0e1e"
        fillOpacity="0.75"
        filter="url(#neonGlow)"
      />

      {/* 3. Inner Shield Border */}
      <path
        d="M60 22 C76 22 86 28 86 34 C86 64 68 83 60 90 C52 83 34 64 34 34 C34 28 44 22 60 22 Z"
        stroke="url(#shieldCyanPurple)"
        strokeWidth="1.2"
        fill="#070a14"
        fillOpacity="0.9"
      />

      {/* 4. Checkered Dot Matrix Quadrants */}
      <g clipPath="url(#shieldInnerClip)">
        {/* Top-Left Quadrant Grid */}
        <rect x="34" y="22" width="26" height="34" fill="url(#dotMatrix)" />
        
        {/* Bottom-Right Quadrant Grid */}
        <rect x="60" y="56" width="26" height="34" fill="url(#dotMatrixPink)" />

        {/* Center Divider Crosshair Lines */}
        <line x1="60" y1="22" x2="60" y2="90" stroke="#818cf8" strokeWidth="0.75" opacity="0.6" />
        <line x1="34" y1="56" x2="86" y2="56" stroke="#818cf8" strokeWidth="0.75" opacity="0.6" />
      </g>

      {/* 5. Glowing Corner Flare Sparkles */}
      {/* Top Flare */}
      <circle cx="60" cy="20" r="1.5" fill="#ffffff" filter="url(#neonGlow)" />
      {/* Left Flare */}
      <circle cx="32" cy="56" r="1.5" fill="#00f0ff" filter="url(#neonGlow)" />
      {/* Right Flare */}
      <circle cx="88" cy="56" r="1.5" fill="#f43f5e" filter="url(#neonGlow)" />
      {/* Bottom Flare */}
      <circle cx="60" cy="94" r="1.5" fill="#d946ef" filter="url(#neonGlow)" />
    </svg>
  )
}
