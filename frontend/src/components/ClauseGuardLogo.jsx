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
        {/* Warm Orange & Amber Gradients */}
        <linearGradient id="shieldOrangeGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="orangeArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        <linearGradient id="goldArc" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="neonGlowOrange" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shield Pattern Matrix for Quadrants */}
        <pattern id="dotMatrixOrange" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
          <circle cx="1.75" cy="1.75" r="0.75" fill="#ea580c" opacity="0.85" />
        </pattern>
        <pattern id="dotMatrixGold" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse">
          <circle cx="1.75" cy="1.75" r="0.75" fill="#f59e0b" opacity="0.85" />
        </pattern>

        {/* Clip path for outer shield */}
        <clipPath id="shieldInnerClip">
          <path d="M60 22 C76 22 86 28 86 34 C86 64 68 83 60 90 C52 83 34 64 34 34 C34 28 44 22 60 22 Z" />
        </clipPath>
      </defs>

      {/* 1. Outer Orbit Rings & HUD Arcs */}
      <circle cx="60" cy="60" r="50" stroke="#f97316" strokeWidth="1.2" opacity="0.3" />

      {/* Top-Left Orange Arc Segment */}
      <path
        d="M 24 28 A 50 50 0 0 1 54 10"
        stroke="url(#orangeArc)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#neonGlowOrange)"
      />

      {/* Bottom-Right Golden Arc Segment */}
      <path
        d="M 96 92 A 50 50 0 0 1 66 110"
        stroke="url(#goldArc)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#neonGlowOrange)"
      />

      {/* Top-Right Accent Arc */}
      <path
        d="M 90 28 A 50 50 0 0 1 108 52"
        stroke="url(#goldArc)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Bottom-Left Accent Arc */}
      <path
        d="M 12 68 A 50 50 0 0 0 30 96"
        stroke="url(#orangeArc)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* 2. Outer Shield Outline */}
      <path
        d="M60 18 C78 18 90 25 90 32 C90 67 70 88 60 96 C50 88 30 67 30 32 C30 25 42 18 60 18 Z"
        stroke="url(#shieldOrangeGold)"
        strokeWidth="2.2"
        fill="#ffffff"
        fillOpacity="0.95"
        filter="url(#neonGlowOrange)"
      />

      {/* 3. Inner Shield Border */}
      <path
        d="M60 22 C76 22 86 28 86 34 C86 64 68 83 60 90 C52 83 34 64 34 34 C34 28 44 22 60 22 Z"
        stroke="url(#shieldOrangeGold)"
        strokeWidth="1.2"
        fill="#fff7ed"
        fillOpacity="0.95"
      />

      {/* 4. Checkered Dot Matrix Quadrants */}
      <g clipPath="url(#shieldInnerClip)">
        {/* Top-Left Quadrant Grid */}
        <rect x="34" y="22" width="26" height="34" fill="url(#dotMatrixOrange)" />
        
        {/* Bottom-Right Quadrant Grid */}
        <rect x="60" y="56" width="26" height="34" fill="url(#dotMatrixGold)" />

        {/* Center Divider Crosshair Lines */}
        <line x1="60" y1="22" x2="60" y2="90" stroke="#ea580c" strokeWidth="0.75" opacity="0.4" />
        <line x1="34" y1="56" x2="86" y2="56" stroke="#ea580c" strokeWidth="0.75" opacity="0.4" />
      </g>

      {/* 5. Glowing Corner Flares */}
      <circle cx="60" cy="20" r="1.5" fill="#f97316" filter="url(#neonGlowOrange)" />
      <circle cx="32" cy="56" r="1.5" fill="#ea580c" filter="url(#neonGlowOrange)" />
      <circle cx="88" cy="56" r="1.5" fill="#f59e0b" filter="url(#neonGlowOrange)" />
      <circle cx="60" cy="94" r="1.5" fill="#ea580c" filter="url(#neonGlowOrange)" />
    </svg>
  )
}
