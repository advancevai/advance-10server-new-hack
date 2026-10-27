import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, LifeBuoy, ShieldCheck, TriangleAlert, X } from 'lucide-react';
import { TELEGRAM_CHANNEL, TELEGRAM_SUPPORT } from '../constants';

export function NoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('sw_notice_seen')) {
      const timer = setTimeout(() => setOpen(true), 450);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('sw_notice_seen', '1');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-[#020408]/88 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-label="Important notice"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] via-[#111827] to-[#080D16] shadow-[0_0_35px_-4px_rgba(0,140,255,0.35),0_8px_32px_-4px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
          >
            {/* Glowing neon line top */}
            <div className="h-1 w-full bg-gradient-to-r from-[#008CFF] via-[#00E5FF] to-[#008CFF]" />
            <div className="neon-sweep-line" />

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close notice"
              className="absolute right-3.5 top-4 grid size-8 place-items-center rounded-full border border-[#182844] bg-[#111827] text-[#B8C4D6] transition hover:border-[#008CFF] hover:text-[#FFFFFF] hover:shadow-[0_0_12px_rgba(0,140,255,0.4)]"
            >
              <X className="size-4" />
            </button>

            <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl border border-[#008CFF]/50 bg-[#008CFF]/15 text-[#00E5FF] shadow-[0_0_14px_rgba(0,140,255,0.4)]">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="leading-tight">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#008CFF]">
                    Official Security Notice
                  </div>
                  <h2 className="font-display text-lg font-black text-[#FFFFFF]">
                    ADVANCE AI Signal Engine
                  </h2>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5">
                <li className="flex gap-2.5 rounded-2xl border border-[#182844] bg-[#111827]/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#F59E0B]" />
                  <p className="text-[13px] leading-relaxed text-[#FFFFFF]/90">
                    Beware of <b>fake Telegram channels & scammers</b>. Only rely on our official verified desk signals.
                  </p>
                </li>
                <li className="flex gap-2.5 rounded-2xl border border-[#182844] bg-[#111827]/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Gift className="mt-0.5 size-4 shrink-0 text-[#00E5FF]" />
                  <p className="text-[13px] leading-relaxed text-[#FFFFFF]/90">
                    Daily <b>gift codes & VIP predictors</b> are published inside our official telegram community.
                  </p>
                </li>
                <li className="flex gap-2.5 rounded-2xl border border-[#182844] bg-[#111827]/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <LifeBuoy className="mt-0.5 size-4 shrink-0 text-[#008CFF]" />
                  <p className="text-[13px] leading-relaxed text-[#FFFFFF]/90">
                    Official VIP support:{' '}
                    <a
                      href={TELEGRAM_SUPPORT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#00E5FF] underline underline-offset-2 hover:text-white"
                    >
                      @TredarRahman
                    </a>
                  </p>
                </li>
              </ul>

              <p className="mt-3 text-center text-[12px] leading-relaxed text-[#B8C4D6]">
                Follow 7-step money management discipline for best results.
              </p>

              <a
                href={TELEGRAM_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#00E5FF]/60 bg-gradient-to-r from-[#008CFF] to-[#00E5FF] px-4 py-3 font-display text-sm font-black uppercase tracking-[0.2em] text-[#020408] shadow-[0_0_24px_rgba(0,140,255,0.5)] transition hover:scale-[1.02] active:scale-98"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                Join VIP Telegram Channel
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="mt-2.5 w-full rounded-2xl border border-[#182844] bg-[#111827] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#B8C4D6] transition hover:border-[#008CFF]/50 hover:text-[#FFFFFF]"
              >
                Understood & Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
