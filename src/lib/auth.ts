import { PASSGATE_CONFIG } from '../constants';
import {
  saveSession,
  getDeviceId,
  checkFirebaseSession,
  subscribeToSession,
  clearSession,
  verifyFirebaseKey,
} from './firebase';

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  keyInfo?: any;
}

/**
 * Verify password against PassGate service:
 * URL: https://advance-admin.lovable.app
 * Key: pgk_live_qMS4Y8HdnyYvayl0CNPgu63dabpdipWH
 */
export async function verifyPassword(userInput: string): Promise<VerifyResult> {
  const trimmed = userInput.trim();
  if (!trimmed) {
    return { ok: false, reason: 'wrong_password' };
  }

  try {
    const res = await fetch(`${PASSGATE_CONFIG.base}/api/public/v1/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': PASSGATE_CONFIG.key,
      },
      body: JSON.stringify({ password: trimmed }),
    });

    const data = await res.json();

    if (data?.valid) {
      if (data.token) {
        localStorage.setItem(PASSGATE_CONFIG.store, data.token);
        localStorage.setItem('pg_token', data.token);
      }

      const expEpoch = data.expiresAt
        ? new Date(data.expiresAt).getTime()
        : Date.now() + 30 * 86400 * 1000;

      saveSession({
        key: trimmed,
        deviceId: getDeviceId(),
        type: 'passgate',
        loggedInAt: Date.now(),
        expiresAt: expEpoch,
      });

      return { ok: true, keyInfo: data };
    }

    // Specific PassGate rejection reasons
    if (
      data?.reason === 'rate_limited' ||
      data?.reason === 'ip_blocked' ||
      data?.reason === 'origin_not_allowed' ||
      data?.reason === 'invalid_api_key'
    ) {
      return { ok: false, reason: data.reason };
    }

    // Fallback: check Firebase keys (Admin/Master/VIP keys)
    const fbResult = await verifyFirebaseKey(trimmed);
    if (fbResult.ok) {
      return { ok: true, keyInfo: fbResult.keyInfo };
    }

    return { ok: false, reason: data?.reason || 'wrong_password' };
  } catch (err) {
    console.warn('PassGate server request failed, attempting Firebase fallback:', err);
    try {
      const fbResult = await verifyFirebaseKey(trimmed);
      if (fbResult.ok) {
        return { ok: true, keyInfo: fbResult.keyInfo };
      }
    } catch {}

    return { ok: false, reason: 'server_unreachable' };
  }
}

/**
 * Check if the current user session is valid using PassGate and Firebase
 */
export async function checkSession(): Promise<boolean> {
  try {
    const token =
      localStorage.getItem('pg_token') || localStorage.getItem(PASSGATE_CONFIG.store);

    if (token) {
      let actualToken = token;
      // Handle legacy JSON stored format
      if (token.startsWith('{')) {
        try {
          const parsed = JSON.parse(token);
          actualToken = parsed.token || token;
        } catch {}
      }

      try {
        const res = await fetch(`${PASSGATE_CONFIG.base}/api/public/v1/session`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': PASSGATE_CONFIG.key,
          },
          body: JSON.stringify({ token: actualToken }),
        });

        const data = await res.json();
        if (data?.valid) {
          return true;
        } else {
          localStorage.removeItem('pg_token');
          localStorage.removeItem(PASSGATE_CONFIG.store);
        }
      } catch (err) {
        console.warn('PassGate session validation error:', err);
      }
    }

    return await checkFirebaseSession();
  } catch {
    return false;
  }
}

export { subscribeToSession, clearSession };

/**
 * Maps PassGate and app error reasons to user-friendly messages
 */
export function getAuthErrorMessage(reason?: string): string {
  switch (reason) {
    case 'rate_limited':
      return 'Too many attempts. Try later.';
    case 'ip_blocked':
      return 'Access from your network is blocked.';
    case 'origin_not_allowed':
      return 'This site is not allowed for this key.';
    case 'invalid_api_key':
      return 'API key is wrong or revoked.';
    case 'server_unreachable':
      return 'Cannot reach the PassGate server. Is the app published?';
    case 'wrong_password':
      return 'Wrong password / Sorry! ভুল Key – Access Denied';
    case 'key_disabled':
      return 'Sorry! অ্যাডমিন প্যানেল থেকে এই Key-টি ব্লক বা নিষ্ক্রিয় করা হয়েছে';
    case 'key_expired':
      return 'Sorry! এই Key-টির মেয়াদ শেষ হয়ে গেছে (Expired)';
    case 'network_error':
      return 'Cannot reach the PassGate server. Is the app published?';
    default:
      if (reason && reason.length > 5 && !reason.includes('_')) {
        return reason;
      }
      return 'Wrong password / Sorry! ভুল Key – Access Denied';
  }
}
