import React from 'react';

interface ColorfulTargetProps {
  size?: number;
  isWin?: boolean;
  className?: string;
}

export function ColorfulTarget({ size = 36, isWin = true, className = '' }: ColorfulTargetProps) {
  if (isWin) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 drop-shadow-[0_0_12px_rgba(34,235,74,0.45)] ${className}`}
      >
        <defs>
          <linearGradient id="win-ring-outer" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00eaf4" />
            <stop offset="100%" stopColor="#22eb4a" />
          </linearGradient>
          <linearGradient id="win-ring-mid" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22eb4a" />
            <stop offset="100%" stopColor="#00eaf4" />
          </linearGradient>
          <radialGradient id="win-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#22eb4a" />
            <stop offset="100%" stopColor="#00eaf4" />
          </radialGradient>
        </defs>

        {/* Outer Ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="url(#win-ring-outer)"
          strokeWidth="3.2"
        />

        {/* Middle Ring */}
        <circle
          cx="24"
          cy="24"
          r="13"
          stroke="url(#win-ring-mid)"
          strokeWidth="3"
        />

        {/* Inner Ring */}
        <circle
          cx="24"
          cy="24"
          r="6.5"
          stroke="#00eaf4"
          strokeWidth="2.6"
        />

        {/* Bullseye Center */}
        <circle
          cx="24"
          cy="24"
          r="2.5"
          fill="url(#win-center-glow)"
        />
      </svg>
    );
  }

  // Loss target: Red coral rings with diagonal slash
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_0_10px_rgba(255,51,60,0.4)] ${className}`}
    >
      <defs>
        <linearGradient id="loss-ring-outer" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4b57" />
          <stop offset="100%" stopColor="#fb2af4" />
        </linearGradient>
        <linearGradient id="loss-slash" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4b57" />
          <stop offset="100%" stopColor="#ff333c" />
        </linearGradient>
      </defs>

      {/* Outer Ring */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="url(#loss-ring-outer)"
        strokeWidth="3"
        opacity="0.8"
      />

      {/* Middle Ring */}
      <circle
        cx="24"
        cy="24"
        r="13"
        stroke="#ff4b57"
        strokeWidth="2.6"
        opacity="0.75"
      />

      {/* Inner Ring */}
      <circle
        cx="24"
        cy="24"
        r="6.5"
        stroke="#ff333c"
        strokeWidth="2.2"
        opacity="0.7"
      />

      {/* Center */}
      <circle
        cx="24"
        cy="24"
        r="2"
        fill="#ff4b57"
      />

      {/* Diagonal Slash */}
      <line
        x1="9"
        y1="39"
        x2="39"
        y2="9"
        stroke="url(#loss-slash)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
