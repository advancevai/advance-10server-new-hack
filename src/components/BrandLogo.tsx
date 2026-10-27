import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWord?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showWord = true, className = '' }: BrandLogoProps) {
  const config = {
    sm: { mark: 34, font: 16, sub: 9 },
    md: { mark: 42, font: 18, sub: 10 },
    lg: { mark: 52, font: 22, sub: 11 },
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="ADVANCE AI"
    >
      <div className="relative shrink-0">
        <div
          className="relative rounded-full p-[2px] bg-gradient-to-b from-[#00E5FF] via-[#008CFF] to-[#080D16] shadow-[0_0_14px_rgba(0,140,255,0.6)]"
          style={{ width: config.mark, height: config.mark }}
        >
          <div className="size-full rounded-full overflow-hidden bg-[#020408] border border-[#008CFF]/50">
            <img
              src="/assets/advance-logo.jpg"
              alt="ADVANCE AI VIP Logo"
              className="size-full object-cover"
            />
          </div>
        </div>
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-[#080D16] px-1 py-0.2 border border-[#008CFF] text-[7.5px] font-black tracking-widest text-[#00E5FF] shadow-[0_0_6px_rgba(0,140,255,0.5)]">
          VIP
        </span>
      </div>

      {showWord && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className="font-display font-black text-[#FFFFFF]"
              style={{ fontSize: config.font, letterSpacing: '0.01em', lineHeight: 1 }}
            >
              ADVANCE
            </span>
            <span
              className="font-display font-black text-[#008CFF] drop-shadow-[0_0_8px_rgba(0,140,255,0.7)]"
              style={{ fontSize: config.font, letterSpacing: '0.01em', lineHeight: 1 }}
            >
              AI
            </span>
          </div>
          <span
            className="font-mono text-[#B8C4D6] font-bold uppercase"
            style={{ fontSize: config.sub, marginTop: 4, letterSpacing: '0.22em' }}
          >
            VIP Signal Engine
          </span>
        </div>
      )}
    </div>
  );
}
