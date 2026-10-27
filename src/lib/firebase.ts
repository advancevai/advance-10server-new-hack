import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyBbZQEyGJqOr2spUPttqd1kvzzNzi3tkXw',
  authDomain: 'new-da88b.firebaseapp.com',
  databaseURL: 'https://new-da88b-default-rtdb.firebaseio.com',
  projectId: 'new-da88b',
  storageBucket: 'new-da88b.firebasestorage.app',
  messagingSenderId: '542999032892',
  appId: '1:542999032892:web:371a323f5fc97df2ea7f39',
  measurementId: 'G-7PGEL9QCKT',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);

export interface FirebaseVerifyResult {
  ok: boolean;
  reason?: 'invalid_key' | 'key_disabled' | 'key_expired' | 'network_error' | string;
  keyInfo?: any;
}

export interface StoredSession {
  key: string;
  deviceId: string;
  type: string;
  loggedInAt: number;
  expiresAt: number;
  [key: string]: any;
}

const RTDB_BASE = firebaseConfig.databaseURL;
const SESSION_STORAGE_KEY = 'advance_firebase_session';
const DEVICE_ID_KEY = 'advance_device_id';

/**
 * Generate or get unique persistent device ID for this phone
 */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      id = `DEV-${seg1}-${seg2}-${seg3}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'DEV-GENERIC-DEVICE';
  }
}

/**
 * Register device in Firebase devices node
 */
async function registerDeviceInFirebase(deviceId: string, activeKey: string) {
  try {
    await fetch(`${RTDB_BASE}/devices/${encodeURIComponent(deviceId)}.json`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        activeKey,
        lastActiveAt: Date.now(),
        status: 'approved',
        forceLogout: false,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
  } catch (err) {
    console.warn('Failed to register device:', err);
  }
}

/**
 * Verify access key directly against Firebase Realtime Database
 */
export async function verifyFirebaseKey(rawKey: string): Promise<FirebaseVerifyResult> {
  const trimmed = rawKey.trim();
  if (!trimmed) {
    return { ok: false, reason: 'invalid_key' };
  }

  const deviceId = getDeviceId();
  const now = Date.now();

  try {
    // 0. Use secure server-side proxy route if available
    try {
      const srvRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: trimmed, deviceId }),
      });
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData.ok && srvData.session) {
          saveSession(srvData.session);
          registerDeviceInFirebase(deviceId, trimmed);
          return { ok: true, keyInfo: srvData.keyInfo };
        }
        if (srvData.reason) {
          return { ok: false, reason: srvData.reason };
        }
      }
    } catch {}

    // 1. Check Master Key in /key.json
    try {
      const masterRes = await fetch(`${RTDB_BASE}/key.json`);
      if (masterRes.ok) {
        const masterKey = await masterRes.json();
        if (typeof masterKey === 'string' && masterKey.toLowerCase() === trimmed.toLowerCase()) {
          const session: StoredSession = {
            key: masterKey,
            deviceId,
            type: 'master',
            loggedInAt: now,
            expiresAt: now + 30 * 86400 * 1000,
          };
          saveSession(session);
          registerDeviceInFirebase(deviceId, masterKey);
          return { ok: true, keyInfo: { key: masterKey, type: 'master' } };
        }
      }
    } catch (e) {
      console.warn('Firebase master key check error:', e);
    }

    // 2. Check VIP Keys in /vip_keys/{KEY}.json
    try {
      const vipRes = await fetch(`${RTDB_BASE}/vip_keys/${encodeURIComponent(trimmed)}.json`);
      if (vipRes.ok) {
        const vipData = await vipRes.json();
        if (vipData && typeof vipData === 'object') {
          // Check if disabled or blocked
          if (vipData.status === 'disabled' || vipData.status === 'blocked') {
            return { ok: false, reason: 'key_disabled' };
          }
          // Check expiration
          const exp = vipData.expiresAt || vipData.expiry;
          if (exp && typeof exp === 'number' && now > exp) {
            return { ok: false, reason: 'key_expired' };
          }

          // Valid VIP Key: update lastLogin timestamp
          fetch(`${RTDB_BASE}/vip_keys/${encodeURIComponent(trimmed)}/lastLogin.json`, {
            method: 'PUT',
            body: JSON.stringify(now),
          }).catch(() => {});

          const session: StoredSession = {
            key: trimmed,
            deviceId,
            type: 'vip_key',
            loggedInAt: now,
            expiresAt: exp || now + 30 * 86400 * 1000,
            vipData,
          };
          saveSession(session);
          registerDeviceInFirebase(deviceId, trimmed);
          return { ok: true, keyInfo: vipData };
        }
      }
    } catch (e) {
      console.warn('Firebase vip_keys check error:', e);
    }

    // 3. Check /keys/{KEY}.json
    try {
      const keysRes = await fetch(`${RTDB_BASE}/keys/${encodeURIComponent(trimmed)}.json`);
      if (keysRes.ok) {
        const keyData = await keysRes.json();
        if (keyData && typeof keyData === 'object') {
          if (keyData.blocked === true || keyData.status === 'disabled') {
            return { ok: false, reason: 'key_disabled' };
          }
          const exp = keyData.expiresAt;
          if (exp && typeof exp === 'number' && now > exp) {
            return { ok: false, reason: 'key_expired' };
          }

          const session: StoredSession = {
            key: trimmed,
            deviceId,
            type: 'standard_key',
            loggedInAt: now,
            expiresAt: exp || now + 30 * 86400 * 1000,
            keyData,
          };
          saveSession(session);
          registerDeviceInFirebase(deviceId, trimmed);
          return { ok: true, keyInfo: keyData };
        }
      }
    } catch (e) {
      console.warn('Firebase keys check error:', e);
    }

    // 4. Check /users/{KEY}.json
    try {
      const userRes = await fetch(`${RTDB_BASE}/users/${encodeURIComponent(trimmed)}.json`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData && typeof userData === 'object') {
          const exp = userData.expiresAt;
          if (exp && typeof exp === 'number' && now > exp) {
            return { ok: false, reason: 'key_expired' };
          }
          const session: StoredSession = {
            key: trimmed,
            deviceId,
            type: 'user',
            loggedInAt: now,
            expiresAt: exp || now + 30 * 86400 * 1000,
            userData,
          };
          saveSession(session);
          registerDeviceInFirebase(deviceId, trimmed);
          return { ok: true, keyInfo: userData };
        }
      }
    } catch (e) {
      console.warn('Firebase users check error:', e);
    }

    // 5. Check Admin Password in /systemSettings.json
    try {
      const sysRes = await fetch(`${RTDB_BASE}/systemSettings.json`);
      if (sysRes.ok) {
        const settings = await sysRes.json();
        if (settings?.adminPassword && settings.adminPassword === trimmed) {
          const session: StoredSession = {
            key: trimmed,
            deviceId,
            type: 'admin',
            loggedInAt: now,
            expiresAt: now + 30 * 86400 * 1000,
          };
          saveSession(session);
          registerDeviceInFirebase(deviceId, 'ADMIN');
          return { ok: true, keyInfo: { type: 'admin' } };
        }
      }
    } catch (e) {
      console.warn('Firebase admin password check error:', e);
    }

    return { ok: false, reason: 'invalid_key' };
  } catch (err) {
    console.error('Firebase connection error:', err);
    return { ok: false, reason: 'network_error' };
  }
}

export function saveSession(data: StoredSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

/**
 * Check if current session is active and not disabled
 */
export async function checkFirebaseSession(): Promise<boolean> {
  const session = getStoredSession();
  if (!session?.key || !session?.expiresAt || Date.now() > session.expiresAt) {
    clearSession();
    return false;
  }

  // Fast check: verify key status in database
  const valid = await validateLiveKeyStatus(session);
  if (!valid.ok) {
    clearSession();
    return false;
  }
  return true;
}

/**
 * Validate key in real-time
 */
export async function validateLiveKeyStatus(session: StoredSession): Promise<{ ok: boolean; reason?: string }> {
  try {
    // 1. Check global forced logout epoch
    try {
      const sysRes = await fetch(`${RTDB_BASE}/systemSettings/logoutAllEpoch.json`);
      if (sysRes.ok) {
        const logoutEpoch = await sysRes.json();
        if (typeof logoutEpoch === 'number' && logoutEpoch > (session.loggedInAt || 0)) {
          return { ok: false, reason: 'অ্যাডমিন সমস্ত ডিভাইস থেকে লগ আউট করেছে।' };
        }
      }
    } catch {}

    // 2. Check device forceLogout status
    if (session.deviceId) {
      try {
        const devRes = await fetch(`${RTDB_BASE}/devices/${encodeURIComponent(session.deviceId)}.json`);
        if (devRes.ok) {
          const dev = await devRes.json();
          if (dev?.forceLogout === true || dev?.status === 'blocked' || dev?.status === 'logged_out') {
            return {
              ok: false,
              reason: dev?.disabledReason || 'অ্যাডমিন প্যানেল থেকে এই ডিভাইসটি লগআউট/ব্লক করা হয়েছে।',
            };
          }
        }
      } catch {}
    }

    // 3. Check VIP Key status
    if (session.type === 'vip_key') {
      const res = await fetch(`${RTDB_BASE}/vip_keys/${encodeURIComponent(session.key)}.json`);
      if (res.ok) {
        const data = await res.json();
        if (!data) {
          return { ok: false, reason: 'অ্যাডমিন প্যানেল থেকে এই Key মুছে ফেলা হয়েছে।' };
        }
        if (data.status === 'disabled' || data.status === 'blocked') {
          return { ok: false, reason: 'অ্যাডমিন প্যানেল থেকে এই Key নিষ্ক্রিয়/ডিজেবল করা হয়েছে।' };
        }
        const exp = data.expiresAt || data.expiry;
        if (exp && typeof exp === 'number' && Date.now() > exp) {
          return { ok: false, reason: 'এই Key-টির মেয়াদ শেষ হয়ে গেছে (Expired)।' };
        }
      }
    }

    // 4. Check Standard Key status
    if (session.type === 'standard_key') {
      const res = await fetch(`${RTDB_BASE}/keys/${encodeURIComponent(session.key)}.json`);
      if (res.ok) {
        const data = await res.json();
        if (!data || data.status === 'disabled' || data.blocked === true) {
          return { ok: false, reason: 'অ্যাডমিন প্যানেল থেকে এই Key নিষ্ক্রিয় করা হয়েছে।' };
        }
        if (data.expiresAt && Date.now() > data.expiresAt) {
          return { ok: false, reason: 'এই Key-টির মেয়াদ শেষ হয়ে গেছে।' };
        }
      }
    }

    // 5. Check Master Key
    if (session.type === 'master') {
      const res = await fetch(`${RTDB_BASE}/key.json`);
      if (res.ok) {
        const master = await res.json();
        if (typeof master === 'string' && master.toLowerCase() !== session.key.toLowerCase()) {
          return { ok: false, reason: 'অ্যাডমিন Master Key পরিবর্তন করেছে।' };
        }
      }
    }

    return { ok: true };
  } catch {
    // Network hiccup - don't kick user out immediately if network temporarily drops
    return { ok: true };
  }
}

/**
 * Real-time listener: actively watches Firebase for changes to this key/device.
 * If disabled from Admin Panel on ANY device, fires onLogout immediately!
 */
export function subscribeToSession(onForceLogout: (reason: string) => void): () => void {
  const session = getStoredSession();
  if (!session?.key) return () => {};

  let isSubscribed = true;

  const triggerLogout = (msg: string) => {
    if (!isSubscribed) return;
    clearSession();
    onForceLogout(msg);
  };

  // 1. Firebase WebSocket listener on VIP key (if VIP key)
  let vipRef: any = null;
  if (session.type === 'vip_key') {
    try {
      vipRef = ref(rtdb, `vip_keys/${session.key}`);
      onValue(vipRef, (snapshot) => {
        if (!isSubscribed) return;
        const val = snapshot.val();
        if (!val) {
          triggerLogout('অ্যাডমিন প্যানেল থেকে এই VIP Key মুছে ফেলা হয়েছে। পুনরায় লগইন করুন।');
        } else if (val.status === 'disabled' || val.status === 'blocked') {
          triggerLogout('অ্যাডমিন প্যানেল থেকে এই VIP Key নিষ্ক্রিয়/ডিজেবল করা হয়েছে। পুনরায় লগইন করুন।');
        } else if ((val.expiresAt || val.expiry) && Date.now() > (val.expiresAt || val.expiry)) {
          triggerLogout('এই VIP Key-টির মেয়াদ শেষ হয়ে গেছে। পুনরায় লগইন করুন।');
        }
      });
    } catch (e) {
      console.warn('Realtime listener error:', e);
    }
  }

  // 2. Firebase WebSocket listener on Device
  let devRef: any = null;
  if (session.deviceId) {
    try {
      devRef = ref(rtdb, `devices/${session.deviceId}`);
      onValue(devRef, (snapshot) => {
        if (!isSubscribed) return;
        const val = snapshot.val();
        if (val) {
          if (val.forceLogout === true || val.status === 'blocked' || val.status === 'logged_out') {
            triggerLogout(
              val.disabledReason ||
                'অ্যাডমিন প্যানেল থেকে আপনার ফোন/ডিভাইস লগআউট করা হয়েছে। পুনরায় লগইন করুন।'
            );
          }
        }
      });
    } catch (e) {
      console.warn('Device listener error:', e);
    }
  }

  // 3. Periodic heartbeat polling (every 3.5 seconds) to guarantee logout even if WebSockets disconnected
  const timer = setInterval(async () => {
    if (!isSubscribed) return;
    const current = getStoredSession();
    if (!current) {
      triggerLogout('সেশন বাতিল হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।');
      return;
    }
    const check = await validateLiveKeyStatus(current);
    if (!check.ok) {
      triggerLogout(check.reason || 'অ্যাডমিন প্যানেল থেকে Key নিষ্ক্রিয় করা হয়েছে। পুনরায় লগইন করুন।');
    }
  }, 3500);

  // 4. Check immediately on window focus
  const onFocus = async () => {
    if (!isSubscribed) return;
    const current = getStoredSession();
    if (!current) return;
    const check = await validateLiveKeyStatus(current);
    if (!check.ok) {
      triggerLogout(check.reason || 'অ্যাডমিন প্যানেল থেকে Key নিষ্ক্রিয় করা হয়েছে। পুনরায় লগইন করুন।');
    }
  };
  window.addEventListener('focus', onFocus);

  // Return cleanup function
  return () => {
    isSubscribed = false;
    clearInterval(timer);
    window.removeEventListener('focus', onFocus);
    if (vipRef) {
      try {
        off(vipRef);
      } catch {}
    }
    if (devRef) {
      try {
        off(devRef);
      } catch {}
    }
  };
}


