import { CategoryConfig, GameConfig, PredictorConfig } from './types';

export const TELEGRAM_CHANNEL = 'https://t.me/+WIKRSTgIhx5kNDRl';
export const TELEGRAM_SUPPORT = 'https://t.me/TredarRahman';

export const PASSGATE_CONFIG = {
  base: 'https://advance-admin.lovable.app',
  key: 'pgk_live_qMS4Y8HdnyYvayl0CNPgu63dabpdipWH',
  store: 'pg_token',
};

export const GAME_ICONS: Record<string, string> = {
  wingo: '/assets/wingo-BZC8OIT5.svg',
  k3: '/assets/k3-D0n9-R5R.svg',
  trx_wingo: '/assets/trxwingo-DkMvy-no.svg',
};

export const GAMES: GameConfig[] = [
  {
    id: 'wingo_30s',
    label: 'WinGo 30 Second',
    shortLabel: 'WinGo 30s',
    kind: 'wingo',
    periodSec: 30,
    upstream: 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
    accent: '#00eaf4',
    emoji: '⚡',
  },
  {
    id: 'wingo_1m',
    label: 'WinGo 1 Minute',
    shortLabel: 'WinGo 1M',
    kind: 'wingo',
    periodSec: 60,
    upstream: 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json',
    accent: '#22eb4a',
    emoji: '🟢',
  },
  {
    id: 'wingo_3m',
    label: 'WinGo 3 Minute',
    shortLabel: 'WinGo 3M',
    kind: 'wingo',
    periodSec: 180,
    upstream: 'https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json',
    accent: '#00d2d2',
    emoji: '🔵',
  },
  {
    id: 'wingo_5m',
    label: 'WinGo 5 Minute',
    shortLabel: 'WinGo 5M',
    kind: 'wingo',
    periodSec: 300,
    upstream: 'https://draw.ar-lottery01.com/WinGo/WinGo_5M/GetHistoryIssuePage.json',
    accent: '#9d66ff',
    emoji: '🟣',
  },
  {
    id: 'k3_1m',
    label: 'K3 Dice 1 Minute',
    shortLabel: 'K3 1M',
    kind: 'k3',
    periodSec: 60,
    upstream: 'https://draw.ar-lottery01.com/K3/K3_1M/GetHistoryIssuePage.json',
    accent: '#ffbe4d',
    emoji: '🎲',
  },
  {
    id: 'k3_3m',
    label: 'K3 Dice 3 Minute',
    shortLabel: 'K3 3M',
    kind: 'k3',
    periodSec: 180,
    upstream: 'https://draw.ar-lottery01.com/K3/K3_3M/GetHistoryIssuePage.json',
    accent: '#fbbf24',
    emoji: '🎲',
  },
  {
    id: 'k3_5m',
    label: 'K3 Dice 5 Minute',
    shortLabel: 'K3 5M',
    kind: 'k3',
    periodSec: 300,
    upstream: 'https://draw.ar-lottery01.com/K3/K3_5M/GetHistoryIssuePage.json',
    accent: '#38bdf8',
    emoji: '🎲',
  },
  {
    id: 'k3_10m',
    label: 'K3 Dice 10 Minute',
    shortLabel: 'K3 10M',
    kind: 'k3',
    periodSec: 600,
    upstream: 'https://draw.ar-lottery01.com/K3/K3_10M/GetHistoryIssuePage.json',
    accent: '#c084fc',
    emoji: '🎲',
  },
  {
    id: 'trx_wingo_1m',
    label: 'TrxWinGo 1 Minute',
    shortLabel: 'Trx WinGo 1M',
    kind: 'trx_wingo',
    periodSec: 60,
    upstream: 'https://draw.ar-lottery01.com/TrxWinGo/TrxWinGo_1M/GetHistoryIssuePage.json',
    accent: '#fb2af4',
    emoji: '💎',
  },
];

export const CATEGORIES: CategoryConfig[] = [
  { id: 'bs', label: 'Big / Small', shortLabel: 'B/S', accent: 'var(--neon-cyan)' },
  { id: 'color', label: 'Color', shortLabel: 'Color', accent: 'var(--neon-magenta)' },
  { id: 'num5', label: '5 Numbers', shortLabel: '5 Nums', accent: 'var(--neon-violet)' },
  { id: 'num7', label: '7 Numbers', shortLabel: '7 Nums', accent: 'var(--neon-amber)' },
];

export const BIG_IMAGE = '/assets/big.png';
export const SMALL_IMAGE = '/assets/small.png';

export const NUMBER_IMAGES: Record<number, string> = {
  0: '/assets/num-0.png',
  1: '/assets/num-1.png',
  2: '/assets/num-2.png',
  3: '/assets/num-3.png',
  4: '/assets/num-4.png',
  5: '/assets/num-5.png',
  6: '/assets/num-6.png',
  7: '/assets/num-7.png',
  8: '/assets/num-8.png',
  9: '/assets/num-9.png',
};

export const PREDICTORS: PredictorConfig[] = [
  {
    id: 'quantum-x',
    index: 0,
    name: 'Quantum X',
    tagline: 'Quantum trend hunter',
    logo: '/assets/quantum-x-DagsVuhm.png',
    brand: '#22d3ee',
  },
  {
    id: 'apex-titan',
    index: 1,
    name: 'Apex Titan',
    tagline: 'Pattern dominator',
    logo: '/assets/apex-titan-BQssZHAy.png',
    brand: '#f59e0b',
  },
  {
    id: 'cipher-nova',
    index: 2,
    name: 'Cipher Nova',
    tagline: 'Code breaker',
    logo: '/assets/cipher-nova-hemPgvHb.png',
    brand: '#60a5fa',
  },
  {
    id: 'vortex-prime',
    index: 3,
    name: 'Vortex Prime',
    tagline: 'Volatility surgeon',
    logo: '/assets/vortex-prime-CMu0qcel.png',
    brand: '#a855f7',
  },
  {
    id: 'specter',
    index: 4,
    name: 'Specter',
    tagline: 'Shadow analyst',
    logo: '/assets/specter-Bh85YnTH.png',
    brand: '#c084fc',
  },
  {
    id: 'onyx-pulse',
    index: 5,
    name: 'Onyx Pulse',
    tagline: 'Momentum reader',
    logo: '/assets/onyx-pulse-gw3WLiCb.png',
    brand: '#10b981',
  },
  {
    id: 'halo-sigma',
    index: 6,
    name: 'Halo Sigma',
    tagline: 'Probability scout',
    logo: '/assets/halo-sigma-DV6_gbLd.png',
    brand: '#fbbf24',
  },
  {
    id: 'zenith-ace',
    index: 7,
    name: 'Zenith Ace',
    tagline: 'Peak strategist',
    logo: '/assets/zenith-ace-B7i0BX1C.png',
    brand: '#ef4444',
  },
  {
    id: 'nyx-oracle',
    index: 8,
    name: 'Nyx Oracle',
    tagline: 'Cycle whisperer',
    logo: '/assets/nyx-oracle-BtrdyDeP.png',
    brand: '#818cf8',
  },
  {
    id: 'phantom-drift',
    index: 9,
    name: 'Phantom Drift',
    tagline: 'Risk-adjusted seer',
    logo: '/assets/phantom-drift-CWfTx5Gq.png',
    brand: '#fb923c',
  },
];

export const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  green: '#10b981',
  violet: '#8b5cf6',
};

export function getGameById(id?: string): GameConfig | undefined {
  return GAMES.find((g) => g.id === id);
}

export function getCategoryById(id?: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getPredictorById(id?: string): PredictorConfig | undefined {
  return PREDICTORS.find((p) => p.id === id);
}
