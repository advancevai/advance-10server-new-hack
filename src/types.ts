export type GameKind = 'wingo' | 'k3' | 'trx_wingo';

export interface GameConfig {
  id: string;
  label: string;
  shortLabel: string;
  kind: GameKind;
  periodSec: number;
  upstream: string;
  accent: string;
  emoji: string;
}

export type CategoryId = 'bs' | 'color' | 'num5' | 'num7';

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  shortLabel: string;
  accent: string;
}

export interface PredictorConfig {
  id: string;
  index: number;
  name: string;
  tagline: string;
  logo: string;
  brand: string;
}

export interface DrawItem {
  issueNumber: string;
  number?: string | number | null;
  sum?: number;
  color?: string;
  premium?: string;
  blockHash?: string;
}

export interface SignalPlan {
  display: string;
  bs?: 'Big' | 'Small';
  color?: 'red' | 'green' | 'violet';
  numbers?: number[];
}

export interface PendingSignal {
  period: string;
  plan: SignalPlan;
  confidence: number;
  predictedNumber?: number;
}

export interface HistoryRecord {
  period: string;
  prediction: string;
  predictedNumber?: number;
  actualNumber?: number;
  actualSide?: string;
  actualColor?: string | null;
  confidence: number;
  result: 'WIN' | 'LOSS';
}

export interface PredictorState {
  pending: PendingSignal | null;
  history: HistoryRecord[];
  wins: number;
  losses: number;
  consecutiveLosses: number;
  isRestricted: boolean;
}

export interface MarketSummary {
  id: string;
  currentIssue: string;
  nextIssue: string;
  lastNumber: number | null;
  lastSum: number;
  lastColor: string;
}
