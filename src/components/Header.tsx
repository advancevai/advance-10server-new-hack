import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { TELEGRAM_CHANNEL } from '../constants';

interface HeaderProps {
  backTo?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ backTo, subtitle = 'VIP Signal Engine', className = '' }: HeaderProps) {
  return (
    <header className={`relative mx-auto max-w-2xl px-4 pt-4 sm:px-6 sm:pt-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button (if provided) + Circular VIP logo with blue neon outline */}
        <div className="flex items-center gap-2.5 shrink-0">
          {backTo && (
            <Link
              to={backTo}
              aria-label="Back"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#008CFF]/40 bg-[#111827] text-[#B8C4D6] shadow-[0_0_12px_rgba(0,140,255,0.2)] transition hover:border-[#00E5FF] hover:text-[#FFFFFF] hover:shadow-[0_0_16px_rgba(0,229,255,0.4)] active:scale-95 sm:size-10"
            >
              <ArrowLeft className="size-4 sm:size-5" />
            </Link>
          )}

          <Link
            to="/"
            className="group relative flex items-center gap-2.5 transition active:scale-98"
            aria-label="ADVANCE AI Home"
          >
            {/* Circular VIP logo with blue neon outline */}
            <div className="relative shrink-0">
              <div className="relative size-10 sm:size-11 rounded-full p-[2px] bg-gradient-to-b from-[#00E5FF] via-[#008CFF] to-[#080D16] shadow-[0_0_16px_rgba(0,140,255,0.65)] group-hover:shadow-[0_0_22px_rgba(0,229,255,0.85)] transition-all duration-300">
                <div className="size-full rounded-full overflow-hidden bg-[#020408] border border-[#008CFF]/50">
                  <img
                    src="/assets/advance-logo.jpg"
                    alt="ADVANCE AI VIP Logo"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* VIP Micro badge */}
              <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-[#080D16] px-1.5 py-0.2 border border-[#008CFF] text-[8px] font-black tracking-widest text-[#00E5FF] shadow-[0_0_8px_rgba(0,140,255,0.6)]">
                VIP
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col justify-center leading-none">
              <div className="flex items-center gap-1">
                <span className="font-display text-[16px] sm:text-[18px] font-black tracking-tight text-[#FFFFFF]">
                  ADVANCE
                </span>
                <span className="font-display text-[16px] sm:text-[18px] font-black tracking-tight text-[#008CFF] drop-shadow-[0_0_10px_rgba(0,140,255,0.8)]">
                  AI
                </span>
              </div>
              <span className="mt-1 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8C4D6]">
                {subtitle}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Telegram VIP button with Telegram icon and glowing blue border */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram VIP Channel"
            className="relative group inline-flex items-center gap-1.5 sm:gap-2 overflow-hidden rounded-xl border border-[#008CFF]/60 bg-gradient-to-b from-[#182234] to-[#111827] px-3 py-2 sm:px-3.5 sm:py-2 text-[#FFFFFF] shadow-[0_0_16px_rgba(0,140,255,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:border-[#00E5FF] hover:shadow-[0_0_24px_rgba(0,229,255,0.65),inset_0_1px_0_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95"
          >
            {/* Subtle animated neon sweep effect */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {/* Telegram Icon */}
            <svg
              viewBox="0 0 24 24"
              className="size-4 sm:size-4.5 text-[#00E5FF] transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110 drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>

            <span className="font-display text-[11px] sm:text-[12px] font-black tracking-wider text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors">
              TELEGRAM <span className="text-[#008CFF] group-hover:text-[#00E5FF]">VIP</span>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
