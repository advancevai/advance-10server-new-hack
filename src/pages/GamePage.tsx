import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Layers,
  Loader2,
  Radio,
  ShieldAlert,
  Target,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Particles } from '../components/Particles';
import {
  BIG_IMAGE,
  CATEGORIES,
  COLOR_MAP,
  GAME_ICONS,
  NUMBER_IMAGES,
  PREDICTORS,
  SMALL_IMAGE,
  getCategoryById,
  getGameById,
} from '../constants';
import { fetchGameData } from '../lib/api';
import {
  computePredictorState,
  computeTrend,
  computeWinRate,
} from '../lib/engine';
import { CategoryId, DrawItem, PredictorConfig, PredictorState, SignalPlan } from '../types';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeCatId = (searchParams.get('cat') as CategoryId) || 'bs';
  const game = getGameById(gameId);
  const activeCategory = getCategoryById(activeCatId) || CATEGORIES[0];

  const [items, setItems] = useState<DrawItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!game) {
      navigate('/', { replace: true });
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        const res = await fetchGameData(game.id);
        if (mounted) {
          if (res.data?.list) {
            setItems(res.data.list);
            setError(null);
          } else if (res.error) {
            setError(res.error);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Failed to fetch game data');
          setLoading(false);
        }
      }
    };

    load();
    const interval = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [game, navigate]);

  const latestDraw = items[0];
  const nextPeriod = useMemo(() => {
    if (!latestDraw?.issueNumber) return '';
    try {
      return (BigInt(latestDraw.issueNumber) + 1n).toString();
    } catch {
      return '';
    }
  }, [latestDraw]);

  // Compute predictor states for all 10 predictors
  const predictorStates = useMemo(() => {
    if (!game) return [];
    return PREDICTORS.map((p) =>
      computePredictorState(
        items,
        activeCategory.id,
        p.index,
        nextPeriod,
        game.id,
        game.kind,
        p.id
      )
    );
  }, [items, activeCategory, nextPeriod, game]);

  // Rank predictors by win rate
  const rankedPredictors = useMemo(() => {
    return PREDICTORS.map((predictor, idx) => ({
      predictor,
      state: predictorStates[idx],
    }))
      .filter(({ state }) => state !== null && state !== undefined)
      .sort((a, b) => {
        const rateA = computeWinRate(a.state, a.predictor.index);
        const rateB = computeWinRate(b.state, b.predictor.index);
        if (rateB !== rateA) return rateB - rateA;
        return a.state.losses - b.state.losses;
      });
  }, [predictorStates]);

  const hiddenCount = PREDICTORS.length - rankedPredictors.length;

  if (!game) return null;

  return (
    <div className="relative min-h-screen bg-[#020408] bg-gradient-to-b from-[#020408] via-[#080D16] to-[#020408] pb-12 text-[#FFFFFF]">
      {/* Background ambient lighting and particles */}
      <div className="ambient-glow" />
      <div className="header-ambient-glow" />
      <div className="pointer-events-none fixed inset-0 diagonal-pattern opacity-40 -z-10" />
      <Particles count={24} seed={202} />

      {/* Main Header according to specification */}
      <Header backTo="/" subtitle={`${game.shortLabel} • VIP Signal`} />

      {/* Game summary card */}
      <div className="relative mx-auto max-w-2xl px-4 pt-3.5 sm:px-6">
        <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] via-[#111827] to-[#080D16] p-3 shadow-[0_0_20px_-2px_rgba(0,140,255,0.3),0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:gap-3.5 sm:p-3.5">
          <div className="neon-sweep-line" />

          <div className="relative grid size-12 shrink-0 place-items-center rounded-xl border border-[#008CFF]/40 bg-[#111827] shadow-[0_0_16px_rgba(0,140,255,0.3)] sm:size-14">
            <img
              src={GAME_ICONS[game.kind]}
              alt={game.label}
              className="size-9 sm:size-10 object-contain drop-shadow-[0_0_8px_rgba(0,140,255,0.5)]"
            />
          </div>

          <div className="relative flex-1 min-w-0">
            <h1 className="truncate text-[15px] font-extrabold leading-tight text-[#FFFFFF] sm:text-[16px]">
              {game.label}
            </h1>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10.5px] font-semibold leading-[1.3] text-[#B8C4D6] sm:text-[11px]">
              <span
                className={`inline-block size-1.5 shrink-0 rounded-full ${
                  error ? 'bg-[#EF4444]' : 'bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-pulse'
                }`}
              />
              <span className="shrink-0 text-[#00E5FF]">{error ? 'Reconnecting' : loading ? 'Syncing' : 'Live'}</span>
              <span className="shrink-0">• Period</span>
              <span className="truncate t-num text-[#FFFFFF]">
                #{nextPeriod ? nextPeriod.slice(-10) : '—'}
              </span>
            </div>
          </div>

          <div className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-[#008CFF]/50 bg-[#008CFF]/15 text-[#00E5FF] shadow-[0_0_16px_rgba(0,140,255,0.35)] sm:size-11">
            {loading ? (
              <Loader2 className="size-4 animate-spin sm:size-5" />
            ) : (
              <Radio className="size-4 sm:size-5" />
            )}
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-2xl px-4 pt-3.5 space-y-3.5 sm:px-6 sm:space-y-4">
        {/* Category Tabs */}
        <div className="rounded-2xl border border-[#182844] bg-gradient-to-b from-[#182234]/80 to-[#111827]/90 p-1.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSearchParams({ cat: cat.id })}
                  className={`grid min-h-11 place-items-center rounded-xl px-1 text-center transition-all ${
                    active
                      ? 'border border-[#00E5FF]/60 bg-gradient-to-r from-[#008CFF] to-[#00E5FF] text-[#020408] shadow-[0_0_20px_-2px_rgba(0,140,255,0.5)] font-black'
                      : 'text-[#B8C4D6] hover:bg-[#182234] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span className="text-[11px] font-black leading-none">{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sync alert banner if loading or error */}
        {(loading || error) && (
          <div className="flex items-center gap-2 rounded-2xl border border-[#182844] bg-[#111827] px-3 py-2.5 text-[12px] font-semibold text-[#B8C4D6] backdrop-blur-md">
            <Loader2 className={`size-4 ${loading ? 'animate-spin text-[#00E5FF]' : 'text-[#EF4444]'}`} />
            {loading ? 'Loading live signals…' : 'Live feed is reconnecting. Cached signals stay visible.'}
          </div>
        )}

        {/* Money Management • 7-Step Plan strategy box */}
        <section className="relative overflow-hidden rounded-2xl border border-[#008CFF]/40 bg-gradient-to-b from-[#182234]/90 via-[#111827]/95 to-[#080D16] p-3.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
          <div className="relative flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg border border-[#008CFF]/50 bg-[#008CFF]/20 text-[#00E5FF] shadow-[0_0_12px_rgba(0,140,255,0.3)]">
              <Target className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF]">
                Risk Management Protocol
              </div>
              <h3 className="text-[14px] font-black leading-none text-[#FFFFFF]">
                Money Management • 7-Step Plan
              </h3>
            </div>
          </div>

          <ul className="relative mt-3 grid gap-2 sm:grid-cols-2">
            <li className="flex items-start gap-2 rounded-xl border border-[#182844] bg-[#111827] px-2.5 py-2">
              <Wallet className="mt-0.5 size-4 shrink-0 text-[#008CFF]" />
              <div className="min-w-0">
                <div className="text-[12px] font-black text-[#FFFFFF]">Capital Control</div>
                <div className="text-[11px] leading-snug text-[#B8C4D6]">
                  Allocate maximum 1% to 3% base bet size per step.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-[#182844] bg-[#111827] px-2.5 py-2">
              <Layers className="mt-0.5 size-4 shrink-0 text-[#008CFF]" />
              <div className="min-w-0">
                <div className="text-[12px] font-black text-[#FFFFFF]">7-Step Strategy</div>
                <div className="text-[11px] leading-snug text-[#B8C4D6]">
                  Follow 1-3-8-24-72-216-648 progression safely.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-[#182844] bg-[#111827] px-2.5 py-2">
              <Target className="mt-0.5 size-4 shrink-0 text-[#008CFF]" />
              <div className="min-w-0">
                <div className="text-[12px] font-black text-[#FFFFFF]">Signal Discipline</div>
                <div className="text-[11px] leading-snug text-[#B8C4D6]">
                  Pick the highest Win Rate engine and follow consistently.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-2.5 py-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#EF4444]" />
              <div className="min-w-0">
                <div className="text-[12px] font-black text-[#FFFFFF]">Stop-Loss Rule</div>
                <div className="text-[11px] leading-snug text-[#B8C4D6]">
                  Pause trading if consecutive losses reach 7 steps.
                </div>
              </div>
            </li>
          </ul>
        </section>

        {/* Section title & count */}
        <div className="flex items-center justify-between gap-3 px-1 pt-1">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase text-[#008CFF]">
              {activeCategory.label}
            </div>
            <h2 className="mt-1 text-[18px] font-black leading-none text-[#FFFFFF]">
              Expert Predictors
            </h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#008CFF]/50 bg-[#008CFF]/15 px-2.5 py-1 t-eyebrow text-[#00E5FF] shadow-[0_0_12px_rgba(0,140,255,0.3)]">
            <Target className="size-3" /> {rankedPredictors.length} LIVE
          </span>
        </div>

        {/* Predictor cards list */}
        <section className="space-y-2.5">
          {rankedPredictors.map(({ predictor, state }, idx) => (
            <PredictorCard
              key={predictor.id}
              gameId={game.id}
              category={activeCategory.id}
              predictor={predictor}
              state={state}
              idx={idx}
            />
          ))}
        </section>

        {hiddenCount > 0 && (
          <div className="rounded-2xl border border-[#182844] bg-[#111827] px-3 py-2.5 text-center t-meta text-[#B8C4D6]">
            {hiddenCount} predictor{hiddenCount > 1 ? 's' : ''} auto-hidden • low accuracy or restricted
          </div>
        )}

        <footer className="pb-2 pt-3 text-center text-[11px] text-[#B8C4D6]">
          ADVANCE AI • 10 Expert Prediction Engines
        </footer>
      </main>
    </div>
  );
}

interface PredictorCardProps {
  gameId: string;
  category: CategoryId;
  predictor: PredictorConfig;
  state: PredictorState;
  idx: number;
}

function PredictorCard({ gameId, category, predictor, state, idx }: PredictorCardProps) {
  const winRate = computeWinRate(state, predictor.index);
  const trend = computeTrend(state, 10);
  const plan = state.pending?.plan;
  const isRestricted = state.isRestricted;

  // Selected card gets glowing blue borders
  const glowClass =
    idx === 0
      ? 'border-[#008CFF] shadow-[0_0_24px_-2px_rgba(0,140,255,0.4),0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)]'
      : idx === 1
      ? 'border-[#00E5FF]/60 shadow-[0_0_20px_-2px_rgba(0,229,255,0.35),0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)]'
      : 'border-[#182844] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-[#008CFF]/60 hover:shadow-[0_0_18px_rgba(0,140,255,0.25)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.25), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/game/${gameId}/${category}/${predictor.id}`}
        className={`group relative block overflow-hidden rounded-2xl border bg-gradient-to-b from-[#182234]/90 via-[#111827]/95 to-[#080D16] backdrop-blur-md transition-all active:scale-[0.985] ${glowClass} ${
          isRestricted ? 'opacity-70' : ''
        }`}
      >
        {/* Subtle radial electric blue highlight */}
        <div
          className="pointer-events-none absolute -inset-px opacity-20 transition-opacity group-hover:opacity-40"
          style={{
            background:
              idx === 0
                ? 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(0, 140, 255, 0.25), transparent 70%)'
                : 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(0, 229, 255, 0.18), transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-3 px-3 pb-2.5 pt-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-2xl border border-[#008CFF]/40 bg-[#111827] shadow-[0_0_16px_rgba(0,140,255,0.25)]">
            <img
              src={predictor.logo}
              alt={predictor.name}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[15px] font-black text-[#FFFFFF]">
                {predictor.name}
              </h3>
              {isRestricted ? (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-[#EF4444]/30 bg-[#EF4444]/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-[#EF4444]">
                  <ShieldAlert className="size-2.5" /> Restricted
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center rounded-md border border-[#008CFF]/40 bg-[#008CFF]/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-[#00E5FF] shadow-[0_0_8px_rgba(0,140,255,0.25)]">
                  Pro
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate text-[11px] text-[#B8C4D6]">
              {predictor.tagline}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[9px] font-black uppercase text-[#B8C4D6]">Hit Rate</div>
            <div className="text-xl font-black leading-none text-[#00E5FF] tabular-nums drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              {winRate}%
            </div>
          </div>
        </div>

        {/* Trend row */}
        <div className="relative mx-3 flex items-center gap-2 rounded-xl border border-[#182844] bg-[#111827] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="shrink-0 text-[10px] font-black uppercase text-[#B8C4D6]">
            Trend
          </span>
          <div className="flex-1 flex items-center justify-end gap-px flex-nowrap min-w-0">
            {trend.map((win, pIdx) => (
              <span key={pIdx} className="flex items-center gap-px shrink-0">
                {pIdx > 0 && <span className="px-px text-[9px] text-[#B8C4D6]/50">&lt;</span>}
                {win ? (
                  <Target className="size-[15px] text-[#10B981] drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" strokeWidth={2.6} />
                ) : (
                  <span className="relative inline-grid place-items-center size-[15px]">
                    <Target className="size-[15px] text-[#EF4444]/75" strokeWidth={2} />
                    <span className="absolute h-[1.6px] w-[18px] rounded bg-[#EF4444] rotate-45 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                  </span>
                )}
              </span>
            ))}
          </div>
          <span className="shrink-0 pl-1 text-[10px] font-black tabular-nums text-[#B8C4D6]">
            {state.wins}W {state.losses}L
          </span>
        </div>

        {/* Current plan and open button */}
        <div className="relative mt-2 flex items-center justify-between gap-3 border-t border-[#182844] px-3 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 text-[11px] font-black uppercase text-[#B8C4D6]">
              Plan
            </span>
            {plan ? (
              <PlanBadge category={category} plan={plan} />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8C4D6]">
                <Loader2 className="size-3.5 animate-spin text-[#00E5FF]" /> Loading
              </span>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-black text-[#00E5FF] group-hover:translate-x-0.5 transition-transform">
            Open <ChevronRight className="size-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function PlanBadge({ category, plan }: { category: CategoryId; plan: SignalPlan }) {
  if (category === 'bs') {
    if (plan.bs) {
      const isBig = plan.bs === 'Big';
      return (
        <div className="inline-flex items-center gap-2">
          <img
            src={isBig ? BIG_IMAGE : SMALL_IMAGE}
            alt={plan.bs}
            className="size-7 object-contain rounded-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] shrink-0"
          />
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
              isBig
                ? 'bg-[#182234] text-[#FFFFFF] border border-[#008CFF]/60 shadow-[0_0_12px_rgba(0,140,255,0.35)]'
                : 'bg-[#182234] text-[#00E5FF] border border-[#00E5FF]/60 shadow-[0_0_12px_rgba(0,229,255,0.35)]'
            }`}
          >
            {plan.bs}
          </span>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-[#008CFF]/50 bg-[#111827] px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-sm">
        {plan.display || '—'}
      </span>
    );
  }
  if (category === 'color' && plan.color) {
    const colorStyles: Record<string, { bg: string; shadow: string }> = {
      red: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: '0 0 14px rgba(239,68,68,0.45)' },
      green: { bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: '0 0 14px rgba(16,185,129,0.45)' },
      violet: { bg: 'linear-gradient(135deg, #008CFF, #00E5FF)', shadow: '0 0 14px rgba(0,140,255,0.45)' },
    };
    const style = colorStyles[plan.color] || { bg: COLOR_MAP[plan.color] || '#008CFF', shadow: 'none' };
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black capitalize text-white"
        style={{ background: style.bg, boxShadow: style.shadow }}
      >
        <span className="size-1.5 rounded-full bg-white/90" />
        {plan.color}
      </span>
    );
  }
  if (plan.numbers) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {plan.numbers.map((n) => (
          <span key={n} className="inline-flex items-center">
            {NUMBER_IMAGES[n] ? (
              <img
                src={NUMBER_IMAGES[n]}
                alt={String(n)}
                className="size-7 object-contain rounded-full shadow-md hover:scale-110 transition-transform"
              />
            ) : (
              <span className="grid size-6 place-items-center rounded-full bg-[#008CFF] text-[11px] font-black text-[#020408]">
                {n}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  }
  return <span>{plan.display}</span>;
}
