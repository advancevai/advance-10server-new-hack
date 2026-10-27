import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, Crown, Loader2, Sparkles, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { Particles } from '../components/Particles';
import { GAMES, GAME_ICONS, NUMBER_IMAGES, TELEGRAM_SUPPORT } from '../constants';
import { fetchAllMarkets } from '../lib/api';
import { MarketSummary } from '../types';

const KIND_DESCRIPTIONS: Record<string, string> = {
  wingo: 'Color prediction',
  k3: 'Dice prediction',
  trx_wingo: 'Blockchain prediction',
};

export function HomePage() {
  const [markets, setMarkets] = useState<Map<string, MarketSummary>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await fetchAllMarkets();
        if (mounted) {
          setMarkets(new Map(list.map((m) => [m.id, m])));
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const hasData = markets.size > 0;

  return (
    <div className="relative min-h-screen bg-[#020408] bg-gradient-to-b from-[#020408] via-[#080D16] to-[#020408] pb-12 text-[#FFFFFF]">
      {/* Background ambient lighting and subtle blue particles */}
      <div className="ambient-glow" />
      <div className="header-ambient-glow" />
      <div className="pointer-events-none fixed inset-0 diagonal-pattern opacity-40 -z-10" />
      <Particles count={26} seed={101} />

      {/* Main Header according to specification */}
      <Header subtitle="VIP Signal Engine" />

      {/* Live sync status banner */}
      <div className="relative mx-auto max-w-2xl px-4 pt-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#182844] bg-gradient-to-b from-[#182234]/90 to-[#111827]/95 px-3 py-2 backdrop-blur-md shadow-[0_8px_20px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-[#B8C4D6]" />
            <span
              className={`font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${
                hasData ? 'text-[#00E5FF]' : 'text-[#EF4444]'
              }`}
            >
              <span
                className={`mr-1.5 inline-block size-1.5 rounded-full align-middle ${
                  hasData ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#EF4444]'
                } animate-pulse`}
              />
              {hasData ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8C4D6]">
            {hasData ? `${GAMES.length} MARKETS ACTIVE` : 'CONNECTING • SYNC'}
          </span>
        </div>
      </div>

      <main className="relative mx-auto max-w-2xl px-4 pt-4 sm:px-6 sm:pt-5">
        <h1 className="sr-only">ADVANCE AI – VIP Signal Engine</h1>

        <div className="flex items-center gap-2.5">
          <span className="text-[#008CFF] drop-shadow-[0_0_8px_rgba(0,140,255,0.8)]">
            <Sparkles className="size-3.5" />
          </span>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFFFFF]">
            Prediction Markets
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-[#008CFF]/40 via-[#182844] to-transparent" />
        </div>

        <section className="mt-3 space-y-2.5">
          {GAMES.map((game) => {
            const data = markets.get(game.id);
            const nextPeriod = data?.nextIssue ? data.nextIssue.slice(-8) : null;
            const displayVal = data?.lastSum !== 0 ? data?.lastSum : data?.lastNumber;
            const periodLabel =
              game.periodSec >= 60 ? `${game.periodSec / 60}M` : `${game.periodSec}S`;
            const isLive = !!data;

            return (
              <Link
                key={game.id}
                to={`/game/${game.id}?cat=bs`}
                className="group relative block overflow-hidden rounded-2xl border border-[#182844] bg-gradient-to-b from-[#182234]/85 via-[#111827]/90 to-[#080D16]/95 p-3 sm:p-3.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-300 hover:border-[#008CFF]/70 hover:shadow-[0_0_24px_-2px_rgba(0,140,255,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.99]"
              >
                {/* Subtle electric blue glow behind card */}
                <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#008CFF] opacity-10 blur-2xl transition-opacity group-hover:opacity-25" />

                {/* Subtle animated neon light sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative flex items-center gap-3 sm:gap-3.5">
                  <div className="relative grid size-12 shrink-0 place-items-center rounded-xl border border-[#008CFF]/40 bg-gradient-to-b from-[#182234] to-[#111827] shadow-[0_0_16px_rgba(0,140,255,0.25)] sm:size-14 group-hover:border-[#00E5FF] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all">
                    <img
                      src={GAME_ICONS[game.kind]}
                      alt={game.label}
                      className="size-9 sm:size-10 object-contain drop-shadow-[0_0_8px_rgba(0,140,255,0.4)]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <h3 className="truncate text-[14px] font-extrabold leading-tight text-[#FFFFFF] sm:text-[16px]">
                        {game.shortLabel}
                      </h3>
                      <span className="shrink-0 rounded-md border border-[#008CFF]/40 bg-[#008CFF]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#00E5FF] shadow-[0_0_8px_rgba(0,140,255,0.2)]">
                        {isLive ? 'ACTIVE' : 'SYNC'}
                      </span>
                    </div>

                    <div className="mt-1 truncate font-mono text-[10.5px] uppercase tracking-wider text-[#B8C4D6] sm:text-[11px]">
                      {KIND_DESCRIPTIONS[game.kind]} • {periodLabel}
                    </div>

                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px]">
                      <span className="size-1.5 shrink-0 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-pulse" />
                      <span className="font-mono font-bold uppercase tracking-wider text-[#008CFF]">
                        {isLive ? 'Live Now' : 'Connecting'}
                      </span>
                      {nextPeriod && (
                        <span className="truncate font-mono text-[#B8C4D6]">
                          • #{nextPeriod}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <div className="grid size-9 place-items-center rounded-xl border border-[#182844] bg-[#111827] font-mono text-[14px] font-bold text-[#FFFFFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:size-10 sm:text-[15px] group-hover:border-[#008CFF]/40">
                      {displayVal !== undefined && displayVal !== null ? (
                        NUMBER_IMAGES[displayVal] ? (
                          <img
                            src={NUMBER_IMAGES[displayVal]}
                            alt={String(displayVal)}
                            className="size-7 object-contain rounded-full shadow-sm"
                          />
                        ) : (
                          displayVal
                        )
                      ) : (
                        <Loader2 className="size-4 animate-spin text-[#B8C4D6]" />
                      )}
                    </div>

                    <ChevronRight className="size-4 text-[#B8C4D6] transition-all group-hover:translate-x-0.5 group-hover:text-[#00E5FF] sm:size-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Pro Predictors VIP banner with glowing electric blue border and metallic surface */}
        <div className="mt-5">
          <div className="relative overflow-hidden rounded-2xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] to-[#111827] p-3.5 shadow-[0_0_24px_-2px_rgba(0,140,255,0.35),0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-4">
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[#008CFF] opacity-15 blur-2xl" />
            <div className="neon-sweep-line" />
            <div className="relative flex items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#008CFF]/60 bg-[#008CFF]/15 text-[#00E5FF] shadow-[0_0_18px_rgba(0,140,255,0.5)] sm:size-14">
                <Crown className="size-6 sm:size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-[14px] font-extrabold text-[#FFFFFF] sm:text-[16px]">
                    Pro AI Predictors
                  </h3>
                  <span className="rounded-md border border-[#008CFF] bg-[#008CFF]/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#00E5FF] shadow-[0_0_8px_rgba(0,140,255,0.4)]">
                    VIP
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-[#B8C4D6] sm:text-[11px]">
                  10 expert algorithms • real-time win rate ranking
                </p>
              </div>
              <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#182844] bg-[#080D16] text-[#008CFF] shadow-[0_0_10px_rgba(0,140,255,0.3)] sm:size-10">
                <Zap className="size-4 sm:size-5 text-[#00E5FF]" />
              </div>
            </div>
          </div>
        </div>

        <footer className="pt-7 pb-4 text-center sm:pt-8 space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <a
              href={TELEGRAM_SUPPORT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#008CFF]/40 bg-[#111827] px-3.5 py-1.5 font-mono text-[11px] font-bold text-[#00E5FF] shadow-[0_0_16px_rgba(0,140,255,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#00E5FF] hover:shadow-[0_0_22px_rgba(0,229,255,0.5)]"
            >
              VIP Support: @TredarRahman
            </a>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B8C4D6]">
            ADVANCE AI • VIP Signal Engine
          </div>
        </footer>
      </main>
    </div>
  );
}
