import {
  CategoryId,
  DrawItem,
  GameKind,
  HistoryRecord,
  PredictorState,
  SignalPlan,
} from '../types';

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function createPrng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getBigSmall(
  number: number,
  kind: GameKind,
  sum?: number
): 'Big' | 'Small' {
  if (kind === 'k3') {
    return (sum ?? 0) >= 11 ? 'Big' : 'Small';
  }
  return number >= 5 ? 'Big' : 'Small';
}

export function getNumberColor(number: number): 'red' | 'green' {
  return number % 2 === 0 ? 'red' : 'green';
}

export function parseActualColor(colorStr?: string | null): string | null {
  if (!colorStr) return null;
  const lower = colorStr.toLowerCase();
  if (lower.includes('red')) return 'red';
  if (lower.includes('green')) return 'green';
  return null;
}

export function getPredictorPick(
  items: DrawItem[],
  category: CategoryId,
  predictorIndex: number,
  kind: GameKind
): { plan: SignalPlan; predictedNumber: number; confidence: number } | null {
  if (category !== 'bs' && category !== 'color') return null;
  const item = items[predictorIndex];
  if (!item) return null;
  const num = parseInt(String(item.number ?? '0'), 10);
  const confidence = 80 + (Math.abs(num) % 15);
  if (category === 'bs') {
    const pick = getBigSmall(num, kind, item.sum);
    return {
      plan: { display: pick, bs: pick },
      predictedNumber: num,
      confidence,
    };
  }
  const color = getNumberColor(num);
  return {
    plan: { display: color, color },
    predictedNumber: num,
    confidence,
  };
}

export function generateNumberPlan(
  gameId: string,
  category: CategoryId,
  predictorId: string,
  period: string
): SignalPlan {
  const count = category === 'num5' ? 5 : 7;
  const prng = createPrng(hashString(`numplan|${gameId}|${category}|${predictorId}|${period}`));
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const numbers = pool.slice(0, count).sort((a, b) => a - b);
  return {
    display: numbers.join(','),
    numbers,
  };
}

const DEFAULT_STATE: PredictorState = {
  pending: null,
  history: [],
  wins: 0,
  losses: 0,
  consecutiveLosses: 0,
  isRestricted: false,
};

export function computePredictorState(
  items: DrawItem[],
  categoryId: CategoryId,
  predictorIndex: number,
  currentPeriod: string,
  gameId: string,
  gameKind: GameKind,
  predictorId: string
): PredictorState {
  if (!items || items.length === 0) return DEFAULT_STATE;
  const offset = predictorIndex + 1;
  let pending = null;

  if (categoryId === 'bs' || categoryId === 'color') {
    const pick = getPredictorPick(items, categoryId, predictorIndex, gameKind);
    if (pick && currentPeriod) {
      pending = {
        period: currentPeriod,
        plan: pick.plan,
        confidence: pick.confidence,
        predictedNumber: pick.predictedNumber,
      };
    }
  } else {
    pending = {
      period: currentPeriod || predictorId,
      plan: generateNumberPlan(gameId, categoryId, predictorId, currentPeriod || predictorId),
      confidence: 80 + ((predictorIndex * 7) % 15),
    };
  }

  const history: HistoryRecord[] = [];
  const maxIdx = items.length - offset - 1;

  for (let i = 0; i <= maxIdx && history.length < 10; i++) {
    const current = items[i];
    const currentNum = parseInt(String(current.number ?? '0'), 10);
    const actualSide = getBigSmall(currentNum, gameKind, current.sum);
    const actualColor = parseActualColor(current.color);

    if (categoryId === 'bs' || categoryId === 'color') {
      const past = items[i + offset];
      if (!past) continue;
      const pastNum = parseInt(String(past.number ?? '0'), 10);
      const conf = 80 + (Math.abs(pastNum) % 15);

      if (categoryId === 'bs') {
        const pred = getBigSmall(pastNum, gameKind, past.sum);
        history.push({
          period: current.issueNumber,
          prediction: pred,
          predictedNumber: pastNum,
          actualNumber: currentNum,
          actualSide,
          actualColor,
          confidence: conf,
          result: pred === actualSide ? 'WIN' : 'LOSS',
        });
      } else {
        const pred = getNumberColor(pastNum);
        history.push({
          period: current.issueNumber,
          prediction: pred,
          predictedNumber: pastNum,
          actualNumber: currentNum,
          actualSide,
          actualColor,
          confidence: conf,
          result: actualColor && pred === actualColor ? 'WIN' : 'LOSS',
        });
      }
    } else {
      const plan = generateNumberPlan(gameId, categoryId, predictorId, current.issueNumber);
      const hit = plan.numbers?.includes(currentNum) ?? false;
      history.push({
        period: current.issueNumber,
        prediction: plan.display,
        actualNumber: currentNum,
        actualSide,
        actualColor,
        confidence: 80 + ((predictorIndex * 7 + i) % 15),
        result: hit ? 'WIN' : 'LOSS',
      });
    }
  }

  let wins = 0;
  let losses = 0;
  let consecutiveLosses = 0;
  let countingStreak = true;

  for (const h of history) {
    if (h.result === 'WIN') {
      wins++;
      countingStreak = false;
    } else {
      losses++;
      if (countingStreak) consecutiveLosses++;
    }
  }

  const isRestricted = consecutiveLosses >= 7 || (history.length >= 5 && wins <= 2);

  return {
    pending,
    history,
    wins,
    losses,
    consecutiveLosses,
    isRestricted,
  };
}

export function computeWinRate(state: PredictorState, predictorIndex: number): number {
  const total = state.wins + state.losses;
  if (total === 0) return 75 + ((predictorIndex * 3) % 20);
  return Math.round((state.wins / total) * 100);
}

export function computeTrend(state: PredictorState, length = 10): boolean[] {
  const res = state.history.slice(0, length).map((h) => h.result === 'WIN');
  while (res.length < length) {
    res.push(false);
  }
  return res;
}

export function generateSyntheticHistory(
  gameId: string,
  periodSec: number,
  count = 60
): DrawItem[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const currentPeriodNum = Math.floor(nowSec / periodSec);
  const dateStr = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');

  const items: DrawItem[] = [];

  for (let i = 0; i < count; i++) {
    const pNum = currentPeriodNum - i;
    const seed = hashString(`${gameId}|${pNum}`);
    const prng = createPrng(seed);
    const isK3 = gameId.startsWith('k3');

    let number = '';
    let sum = 0;
    let color = '';
    let premium = '';

    if (isK3) {
      const d1 = 1 + Math.floor(prng() * 6);
      const d2 = 1 + Math.floor(prng() * 6);
      const d3 = 1 + Math.floor(prng() * 6);
      sum = d1 + d2 + d3;
      premium = `${d1}${d2}${d3}`;
    } else {
      const num = Math.floor(prng() * 10);
      number = String(num);
      premium = number;
      if (num === 0) color = 'red,violet';
      else if (num === 5) color = 'green,violet';
      else color = num % 2 === 0 ? 'red' : 'green';
      sum = num;
    }

    const padPeriod = String(pNum % 100000).padStart(5, '0');
    const issueNumber = `${dateStr}1000${padPeriod}`;

    items.push({
      issueNumber,
      number: isK3 ? '' : number,
      sum,
      color,
      premium,
      blockHash: '',
    });
  }

  return items;
}
