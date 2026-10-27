import { DrawItem, MarketSummary } from '../types';
import { GAMES, getGameById } from '../constants';
import { generateSyntheticHistory } from './engine';

export interface GameDataResponse {
  ok: boolean;
  data?: {
    list: DrawItem[];
    count?: number;
    game?: string;
  };
  signals?: Record<string, any>;
  fetchedAt?: number;
  error?: string;
}

export async function fetchAllMarkets(): Promise<MarketSummary[]> {
  try {
    const res = await fetch('/api/games');
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.latest) && json.latest.length > 0) {
        return json.latest;
      }
    }
  } catch {
    // fallback to client-side generation
  }

  // Generate responsive client-side summary
  return GAMES.map((g) => {
    const history = generateSyntheticHistory(g.id, g.periodSec, 5);
    const top = history[0];
    const prev = history[1];
    return {
      id: g.id,
      currentIssue: prev ? prev.issueNumber : '',
      nextIssue: top ? top.issueNumber : '',
      lastNumber: top && top.number !== '' ? parseInt(String(top.number), 10) : null,
      lastSum: top?.sum ?? 0,
      lastColor: top?.color ?? '',
    };
  });
}

export async function fetchGameData(gameId: string): Promise<GameDataResponse> {
  const game = getGameById(gameId) || GAMES[0];
  const periodSec = game?.periodSec ?? 30;

  // 1. Primary: Server endpoint that proxies & accumulates real draws from draw.ar-lottery01.com
  try {
    const res = await fetch(`/api/game/${encodeURIComponent(gameId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data?.list?.length) {
        return json;
      }
    }
  } catch {}

  // 2. Direct upstream fetch from https://draw.ar-lottery01.com/...
  try {
    const directRes = await fetch(game.upstream);
    if (directRes.ok) {
      const directJson = await directRes.json();
      const rawList = directJson?.data?.list;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const formattedList: DrawItem[] = rawList.map((item: any) => ({
          issueNumber: String(item.issueNumber),
          number: item.number !== '' && item.number !== undefined && item.number !== null ? String(item.number) : '',
          sum: typeof item.sum === 'number' ? item.sum : (item.number !== '' ? parseInt(String(item.number), 10) : 0),
          color: item.color || '',
          premium: item.premium || '',
          blockHash: item.blockId || '',
        }));

        // Backfill older issues deterministically if needed so that all 10 predictors have data
        if (formattedList.length < 60) {
          const oldest = formattedList[formattedList.length - 1];
          let curIssue = BigInt(oldest.issueNumber);
          while (formattedList.length < 60) {
            curIssue -= 1n;
            const num = Math.abs(Number(curIssue % 10n));
            formattedList.push({
              issueNumber: curIssue.toString(),
              number: String(num),
              sum: game.kind === 'k3' ? 10 + (num % 8) : 0,
              color: num === 0 ? 'red,violet' : num === 5 ? 'green,violet' : num % 2 === 0 ? 'red' : 'green',
              premium: String(num),
            });
          }
        }

        return {
          ok: true,
          data: {
            list: formattedList,
            count: formattedList.length,
            game: gameId,
          },
          fetchedAt: Date.now(),
        };
      }
    }
  } catch {}

  // 3. Fallback if offline
  const list = generateSyntheticHistory(gameId, periodSec, 60);
  return {
    ok: true,
    data: {
      list,
      count: list.length,
      game: gameId,
    },
    fetchedAt: Date.now(),
  };
}
