import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock3,
  Loader2,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { ColorfulTarget } from '../components/ColorfulTarget';
import { Header } from '../components/Header';
import { Particles } from '../components/Particles';
import {
  BIG_IMAGE,
  COLOR_MAP,
  NUMBER_IMAGES,
  SMALL_IMAGE,
  getCategoryById,
  getGameById,
  getPredictorById,
} from '../constants';
import { fetchGameData } from '../lib/api';
import {
  computePredictorState,
  computeTrend,
  computeWinRate,
} from '../lib/engine';
import { CategoryId, DrawItem, HistoryRecord, SignalPlan } from '../types';

export function PredictorPage() {
  const { gameId, category: catParam, predictorId } = useParams<{
    gameId: string;
    category: string;
    predictorId: string;
  }>();
  const navigate = useNavigate();

  const game = getGameById(gameId);
  const category = getCategoryById(catParam);
  const predictor = getPredictorById(predictorId);

  const [items, setItems] = useState<DrawItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!game || !category || !predictor) {
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
          setError(err?.message || 'Failed to sync');
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
  }, [game, category, predictor, navigate]);

  const latestDraw = items[0];
  const nextPeriod = useMemo(() => {
    if (!latestDraw?.issueNumber) return '';
    try {
      return (BigInt(latestDraw.issueNumber) + 1n).toString();
    } catch {
      return '';
    }
  }, [latestDraw]);

  const state = useMemo(() => {
    if (!game || !category || !predictor) return null;
    return computePredictorState(
      items,
      category.id,
      predictor.index,
      nextPeriod,
      game.id,
      game.kind,
      predictor.id
    );
  }, [items, category, predictor, nextPeriod, game]);

  const winRate = useMemo(() => {
    if (!state || !predictor) return 0;
    return computeWinRate(state, predictor.index);
  }, [state, predictor]);

  const trend = useMemo(() => {
    if (!state) return [];
    return computeTrend(state, 10);
  }, [state]);

  if (!game || !category || !predictor || !state) return null;

  return (
    <div className="relative min-h-screen bg-[#020408] bg-gradient-to-b from-[#020408] via-[#080D16] to-[#020408] pb-12 text-[#FFFFFF]">
      {/* Background ambient lighting and particles */}
      <div className="ambient-glow" />
      <div className="header-ambient-glow" />
      <div className="pointer-events-none fixed inset-0 diagonal-pattern opacity-40 -z-10" />
      <Particles count={24} seed={4040} />

      {/* Main Header according to specification with Back link */}
      <Header
        backTo={`/game/${game.id}?cat=${category.id}`}
        subtitle={`${game.shortLabel} • ${category.shortLabel}`}
      />

      {/* Predictor Profile Overview Card */}
      <header className="relative mx-auto max-w-2xl px-4 pt-3.5 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] via-[#111827] to-[#080D16] p-4 shadow-[0_0_24px_-2px_rgba(0,140,255,0.35),0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
          <div className="neon-sweep-line" />

          {/* Profile row */}
          <div className="relative flex items-center gap-3.5">
            <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-[#008CFF]/50 bg-[#111827] shadow-[0_0_20px_-2px_rgba(0,140,255,0.4)]">
              <img
                src={predictor.logo}
                alt={predictor.name}
                className="size-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="truncate text-xl font-black text-[#FFFFFF]">
                {predictor.name}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#B8C4D6]">
                <span
                  className={`size-1.5 rounded-full ${
                    error ? 'bg-[#EF4444]' : 'bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-pulse'
                  }`}
                />
                <span className="text-[#00E5FF]">
                  {error
                    ? 'Reconnecting'
                    : loading
                    ? 'Syncing live feed'
                    : predictor.tagline}
                </span>
              </div>
              {state.isRestricted && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/15 px-2 py-0.5 text-[10px] font-black uppercase text-[#EF4444]">
                  <ShieldAlert className="size-3" /> Restricted
                </span>
              )}
            </div>

            <div className="shrink-0 rounded-2xl border border-[#008CFF]/50 bg-[#008CFF]/15 px-3.5 py-2 text-right shadow-[0_0_18px_rgba(0,140,255,0.3)]">
              <div className="text-[9px] font-black uppercase text-[#B8C4D6]">
                Hit Rate
              </div>
              <div className="text-2xl font-black leading-none text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
                {winRate}%
              </div>
              <div className="mt-1 text-[10px] font-bold text-[#B8C4D6]">
                {state.wins}W • {state.losses}L
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 pt-3.5 space-y-3 sm:px-6">
        {(loading || error) && (
          <div className="flex items-center gap-2 rounded-2xl border border-[#182844] bg-[#111827] px-3 py-2.5 text-[12px] font-semibold text-[#B8C4D6] backdrop-blur-md">
            <Loader2
              className={`size-4 ${loading ? 'animate-spin text-[#00E5FF]' : 'text-[#EF4444]'}`}
            />
            {loading ? 'Loading signal detail…' : 'Live feed is reconnecting.'}
          </div>
        )}

        {/* Trend summary */}
        <section className="flex items-center gap-2 rounded-2xl border border-[#182844] bg-gradient-to-b from-[#182234]/85 to-[#111827] px-3 py-3 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#008CFF]/40 bg-[#008CFF]/15">
            <Target className="size-4 text-[#00E5FF]" />
          </div>
          <h2 className="shrink-0 text-sm font-black text-[#FFFFFF]">Trend</h2>
          <div className="flex-1 flex items-center justify-end gap-px flex-nowrap min-w-0">
            {trend.map((win, idx) => (
              <span key={idx} className="flex items-center gap-px shrink-0">
                {idx > 0 && <span className="px-px text-[9px] text-[#B8C4D6]/50">&lt;</span>}
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
        </section>

        {/* Active pending signal card */}
        <CurrentPeriodCard
          category={category.id}
          period={state.pending?.period || nextPeriod}
          periodSec={game.periodSec}
          plan={state.pending?.plan}
        />

        {/* Signal History cards */}
        <div className="space-y-3 pt-2">
          <h2 className="px-1 text-[12px] font-black uppercase tracking-wider text-[#B8C4D6]">
            Signal History
          </h2>

          {state.history.length === 0 && (
            <div className="rounded-2xl border border-[#182844] bg-[#111827] p-6 text-center text-sm font-semibold text-[#B8C4D6]">
              Signal history is syncing…
            </div>
          )}

          {state.history.map((row) => (
            <HistoryCard key={row.period} row={row} category={category.id} />
          ))}
        </div>
      </main>
    </div>
  );
}

function CurrentPeriodCard({
  category,
  period,
  periodSec,
  plan,
}: {
  category: CategoryId;
  period: string;
  periodSec: number;
  plan?: SignalPlan;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#008CFF]/50 bg-gradient-to-b from-[#182234] via-[#111827] to-[#080D16] shadow-[0_0_24px_-2px_rgba(0,140,255,0.35),0_8px_24px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
      <div className="neon-sweep-line" />

      <div className="relative px-4 pt-4 pb-3">
        <h2 className="text-base font-black text-[#FFFFFF]">
          Current Period{' '}
          <span className="font-mono text-[#00E5FF] drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">
            #{period ? period.slice(-12) : '—'}
          </span>
        </h2>
      </div>

      <div className="relative flex items-stretch gap-3 border-t border-[#182844] px-4 py-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-14 text-[12px] font-black uppercase text-[#B8C4D6]">
              Plan
            </span>
            {plan ? (
              <PlanRender category={category} plan={plan} />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8C4D6]">
                <Loader2 className="size-4 animate-spin text-[#00E5FF]" /> Loading
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="w-14 text-[12px] font-black uppercase text-[#B8C4D6]">
              Draw
            </span>
            <span className="text-sm font-semibold text-[#B8C4D6]">Pending</span>
          </div>
        </div>

        <CountdownTimer periodSec={periodSec} />
      </div>
    </section>
  );
}

function CountdownTimer({ periodSec }: { periodSec: number }) {
  const [remaining, setRemaining] = useState(periodSec);

  useEffect(() => {
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      setRemaining(periodSec - (nowSec % periodSec));
    };
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [periodSec]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div className="grid min-w-[96px] place-items-center rounded-2xl border border-[#008CFF]/50 bg-[#008CFF]/15 px-4 py-2 text-[#00E5FF] shadow-[0_0_18px_rgba(0,140,255,0.35)]">
      <Clock3 className="mb-1 size-4" />
      <span className="text-2xl font-black tabular-nums">{timeFormatted}</span>
    </div>
  );
}

function HistoryCard({ row, category }: { row: HistoryRecord; category: CategoryId }) {
  const isWin = row.result === 'WIN';
  const plan: SignalPlan =
    category === 'bs'
      ? { display: row.prediction, bs: row.prediction as 'Big' | 'Small' }
      : category === 'color'
      ? { display: row.prediction, color: row.prediction as 'red' | 'green' }
      : {
          display: row.prediction,
          numbers: row.prediction
            .split(',')
            .map((n) => parseInt(n, 10))
            .filter((n) => !isNaN(n)),
        };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#182844] bg-gradient-to-b from-[#182234]/85 to-[#111827] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <div className="px-4 pt-4 pb-3">
        <div className="text-base font-black text-[#FFFFFF]">
          Period <span className="font-mono text-[#FFFFFF]/85">#{row.period.slice(-12)}</span>
        </div>
      </div>

      <div className="flex items-stretch gap-3 border-t border-[#182844] px-4 py-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-14 text-[12px] font-black uppercase text-[#B8C4D6]">
              Plan
            </span>
            <PlanRender category={category} plan={plan} />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-14 text-[12px] font-black uppercase text-[#B8C4D6]">
              Draw
            </span>
            <DrawResultRender category={category} row={row} />
          </div>
        </div>

        <div
          className={`flex min-w-[100px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 transition-all ${
            isWin
              ? 'border-[#10B981]/40 bg-[#10B981]/15 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'border-[#EF4444]/40 bg-[#EF4444]/15 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
          }`}
        >
          <ColorfulTarget size={40} isWin={isWin} />
          <span
            className={`font-display text-[11px] font-black uppercase tracking-widest ${
              isWin ? 'text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'text-[#EF4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            }`}
          >
            {isWin ? 'WIN' : 'LOSS'}
          </span>
        </div>
      </div>
    </section>
  );
}

function PlanRender({ category, plan }: { category: CategoryId; plan: SignalPlan }) {
  if (category === 'bs') {
    if (plan.bs) {
      const isBig = plan.bs === 'Big';
      return (
        <div className="inline-flex items-center gap-2">
          <img
            src={isBig ? BIG_IMAGE : SMALL_IMAGE}
            alt={plan.bs}
            className="size-8 object-contain rounded-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] shrink-0"
          />
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-black uppercase tracking-wider ${
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
      <span className="inline-flex items-center rounded-full border border-[#008CFF]/50 bg-[#111827] px-3 py-1 text-sm font-mono font-bold text-white shadow-sm">
        {plan.display || '—'}
      </span>
    );
  }
  if (category === 'color' && plan.color) {
    const colorStyles: Record<string, { bg: string; shadow: string }> = {
      red: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: '0 0 16px rgba(239,68,68,0.5)' },
      green: { bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: '0 0 16px rgba(16,185,129,0.5)' },
      violet: { bg: 'linear-gradient(135deg, #008CFF, #00E5FF)', shadow: '0 0 16px rgba(0,140,255,0.5)' },
    };
    const style = colorStyles[plan.color] || { bg: COLOR_MAP[plan.color] || '#008CFF', shadow: 'none' };
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-black capitalize text-white shadow-md"
        style={{ background: style.bg, boxShadow: style.shadow }}
      >
        <span className="size-2 rounded-full bg-white/90 animate-pulse" />
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
                className="size-8 object-contain rounded-full shadow-md hover:scale-110 transition-transform"
              />
            ) : (
              <span className="grid size-7 place-items-center rounded-full bg-[#008CFF] text-sm font-black text-[#020408]">
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

function DrawResultRender({ category, row }: { category: CategoryId; row: HistoryRecord }) {
  const actualNum = row.actualNumber;
  const numImg = actualNum !== undefined && actualNum !== null ? NUMBER_IMAGES[actualNum] : null;

  if (category === 'color') {
    const bg = row.actualColor ? COLOR_MAP[row.actualColor] : '#9ca3af';
    return (
      <div className="inline-flex items-center gap-2">
        {numImg ? (
          <img
            src={numImg}
            alt={String(actualNum)}
            className="size-8 object-contain rounded-full shadow-md"
          />
        ) : (
          <span
            className="grid size-7 place-items-center rounded-full text-white text-sm font-bold"
            style={{ background: bg }}
          >
            {row.actualNumber}
          </span>
        )}
        {row.actualColor && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold capitalize text-white"
            style={{ background: bg }}
          >
            {row.actualColor}
          </span>
        )}
      </div>
    );
  }

  if (category === 'bs') {
    const isBig = row.actualSide === 'Big';
    return (
      <div className="inline-flex items-center gap-2">
        {numImg ? (
          <img
            src={numImg}
            alt={String(actualNum)}
            className="size-8 object-contain rounded-full shadow-md"
          />
        ) : (
          <span className="grid size-7 place-items-center rounded-full border border-[#182844] bg-[#111827] text-sm font-mono font-bold text-white shadow-sm">
            {row.actualNumber ?? '—'}
          </span>
        )}
        {row.actualSide ? (
          <div className="inline-flex items-center gap-1.5">
            <img
              src={isBig ? BIG_IMAGE : SMALL_IMAGE}
              alt={row.actualSide}
              className="size-6 object-contain rounded-full drop-shadow-sm shrink-0"
            />
            <span
              className={`font-mono text-xs font-bold ${
                isBig ? 'text-[#FFFFFF]' : 'text-[#00E5FF]'
              }`}
            >
              {row.actualSide}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center rounded-full border border-[#182844] bg-[#111827] px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-sm">
            —
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {numImg ? (
        <img
          src={numImg}
          alt={String(actualNum)}
          className="size-8 object-contain rounded-full shadow-md"
        />
      ) : (
        <span className="grid size-7 place-items-center rounded-full bg-[#008CFF] text-sm font-black text-[#020408]">
          {row.actualNumber}
        </span>
      )}
    </div>
  );
}
