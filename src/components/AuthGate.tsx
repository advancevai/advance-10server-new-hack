import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Lock, Loader2, ShieldAlert } from 'lucide-react';
import { Particles } from './Particles';
import { TELEGRAM_CHANNEL, TELEGRAM_SUPPORT } from '../constants';
import { checkSession, getAuthErrorMessage, verifyPassword, subscribeToSession } from '../lib/auth';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Sorry! ভুল Key – Access Denied');
  const [granting, setGranting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let mounted = true;
    checkSession()
      .then((valid) => {
        if (mounted && valid) setUnlocked(true);
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Real-time listener: if key is disabled from Admin panel on ANY phone/device
  useEffect(() => {
    if (!unlocked) return;

    const unsubscribe = subscribeToSession((reason) => {
      setUnlocked(false);
      setGranting(false);
      setHasError(true);
      setErrorMessage(reason);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    });

    return () => {
      unsubscribe();
    };
  }, [unlocked]);

  const handleUnlock = async (e?: React.FormEvent, directKey?: string) => {
    if (e) e.preventDefault();
    const keyToTest = directKey ?? password;
    if (loading || granting) return;
    setLoading(true);
    setHasError(false);

    const res = await verifyPassword(keyToTest);
    if (res.ok) {
      setGranting(true);
      setCountdown(3);

      // Trigger Telegram redirect before granting access
      try {
        const link = document.createElement('a');
        link.href = TELEGRAM_CHANNEL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.warn('Telegram link trigger error:', err);
      }

      // 3 second countdown before unlocking
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setUnlocked(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setErrorMessage(getAuthErrorMessage(res.reason));
      setShake(true);
      setHasError(true);
      setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#020408]">
        <div className="ambient-glow" />
        <div className="pointer-events-none fixed inset-0 diagonal-pattern opacity-40 -z-10" />
        <Particles count={24} />
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative size-16 rounded-full p-[2px] bg-gradient-to-b from-[#00E5FF] via-[#008CFF] to-[#080D16] shadow-[0_0_24px_rgba(0,140,255,0.7)] animate-pulse">
            <div className="size-full rounded-full overflow-hidden bg-[#020408] border border-[#008CFF]/50">
              <img
                src="/assets/advance-logo.jpg"
                alt="ADVANCE AI"
                className="size-full object-cover"
              />
            </div>
          </div>
          <Loader2 className="size-6 animate-spin text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]" />
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#B8C4D6]">
            Verifying VIP Session...
          </div>
        </div>
      </div>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020408] bg-gradient-to-b from-[#020408] via-[#080D16] to-[#020408] p-4 text-[#FFFFFF]">
      <div className="ambient-glow" />
      <div className="header-ambient-glow" />
      <div className="pointer-events-none fixed inset-0 diagonal-pattern opacity-40 -z-10" />
      <Particles count={26} />

      {granting ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#008CFF]/60 bg-gradient-to-b from-[#182234] via-[#111827] to-[#080D16] p-8 text-center shadow-[0_0_35px_-4px_rgba(0,140,255,0.4),0_8px_32px_-4px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md"
        >
          <div className="neon-sweep-line" />

          <div className="relative flex flex-col items-center gap-3">
            <div className="relative grid size-20 place-items-center rounded-3xl border border-[#008CFF]/60 bg-[#008CFF]/15 text-[#00E5FF] shadow-[0_0_25px_rgba(0,140,255,0.5)] animate-bounce">
              <svg viewBox="0 0 24 24" className="size-10" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-black text-[#FFFFFF]">
              Telegram VIP Redirect
            </h2>
            <p className="text-xs font-bold text-[#00E5FF]">
              VIP Desk ওপেন হওয়ার আগে টেলিগ্রাম চ্যানেলে নিয়ে যাওয়া হচ্ছে...
            </p>
            <p className="text-[11px] text-[#B8C4D6]">
              Opening Official Telegram Channel before launching VIP Signal Desk ({countdown}s)...
            </p>
          </div>

          <a
            href={TELEGRAM_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setUnlocked(true)}
            className="relative mt-6 flex items-center justify-center gap-2 rounded-2xl border border-[#00E5FF]/60 bg-gradient-to-r from-[#008CFF] to-[#00E5FF] px-4 py-3 font-display text-sm font-black uppercase tracking-wider text-[#020408] shadow-[0_0_25px_-4px_rgba(0,140,255,0.5)] transition hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            Join Telegram & Launch Desk
          </a>

          <div className="relative mt-4 flex items-center justify-center gap-2 text-xs text-[#B8C4D6]">
            <Loader2 className="size-3.5 animate-spin text-[#00E5FF]" />
            <span>Opening VIP Desk in {countdown}s</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] via-[#111827] to-[#080D16] p-8 shadow-[0_0_35px_-4px_rgba(0,140,255,0.35),0_8px_32px_-4px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md ${
            shake ? 'shake' : ''
          }`}
        >
          <div className="neon-sweep-line" />

          {/* Left / Center: Circular VIP logo with blue neon outline, Title ADVANCE AI, Subtitle VIP Signal Engine */}
          <div className="relative flex flex-col items-center gap-3">
            <div className="relative size-24 rounded-full p-[3px] bg-gradient-to-b from-[#00E5FF] via-[#008CFF] to-[#080D16] shadow-[0_0_24px_rgba(0,140,255,0.7)]">
              <div className="size-full rounded-full overflow-hidden bg-[#020408] border border-[#008CFF]/60">
                <img
                  src="/assets/advance-logo.jpg"
                  alt="ADVANCE AI VIP Logo"
                  className="size-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-[#080D16] px-2 py-0.5 border border-[#008CFF] text-[9px] font-black tracking-widest text-[#00E5FF] shadow-[0_0_10px_rgba(0,140,255,0.6)]">
                VIP
              </span>
            </div>

            <div className="text-center">
              <h1 className="font-display text-2xl font-black tracking-wide">
                <span className="text-[#FFFFFF]">ADVANCE </span>
                <span className="text-[#008CFF] drop-shadow-[0_0_14px_rgba(0,140,255,0.8)]">AI</span>
              </h1>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#B8C4D6]">
                VIP Signal Engine
              </p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="relative mt-8 space-y-4">
            <div className="relative">
              <Fingerprint className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[#00E5FF] drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]" />
              <input
                id="pg-pass"
                autoFocus
                type="password"
                aria-label="Access Key"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setHasError(false);
                }}
                placeholder="ENTER VIP ACCESS KEY"
                className="w-full rounded-xl border border-[#182844] bg-[#111827] px-11 py-3 font-mono text-sm tracking-[0.25em] text-[#FFFFFF] placeholder-[#B8C4D6]/50 outline-none transition focus:border-[#008CFF] focus:shadow-[0_0_20px_-2px_rgba(0,140,255,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
              />
            </div>

            {hasError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/15 px-3 py-2 text-xs text-[#EF4444]"
              >
                <ShieldAlert className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl border border-[#00E5FF]/60 bg-gradient-to-r from-[#008CFF] to-[#00E5FF] px-4 py-3 font-display text-sm font-black uppercase tracking-[0.2em] text-[#020408] shadow-[0_0_22px_rgba(0,140,255,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:shadow-[0_0_30px_rgba(0,229,255,0.7)] active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-[#020408]" />
                  <span>Verifying Key...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="size-4" />
                  <span>Unlock VIP Signals</span>
                </span>
              )}
            </button>
          </form>

          {/* Telegram VIP Link Button */}
          <div className="relative mt-6 border-t border-[#182844] pt-5 text-center space-y-3">
            <p className="text-xs text-[#B8C4D6]">
              Don't have a VIP Key? Contact Admin on Telegram:
            </p>
            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] to-[#111827] px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-[#FFFFFF] shadow-[0_0_14px_rgba(0,140,255,0.3)] transition hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
            >
              <svg viewBox="0 0 24 24" className="size-4 text-[#00E5FF]" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Get VIP Key From Telegram
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
