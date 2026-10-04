import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// No source-code edit needed to point this app at your VPS — set the server
// URL once from Profile -> Server Settings and it's remembered on-device.
// Change this fallback to your real deployed API root before you ship, so a
// fresh install has a sane default even before anyone opens Settings.
export const DEFAULT_BASE_URL = 'https://api.gathalok.prahladsingh.in';
const STORAGE_KEY = 'gathalok_api_base_url';
const TOKEN_KEY = 'gathalok_token';
const USER_KEY = 'gathalok_user';

let cachedBaseURL = null;

export async function getBaseURL() {
  if (cachedBaseURL) return cachedBaseURL;
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  cachedBaseURL = stored || DEFAULT_BASE_URL;
  return cachedBaseURL;
}

export async function setBaseURL(url) {
  const trimmed = url.trim().replace(/\/+$/, '');
  cachedBaseURL = trimmed;
  await AsyncStorage.setItem(STORAGE_KEY, trimmed);
  return trimmed;
}

// Gathalok's backend mounts everything under /api and exposes a health check
// at /api/health (see backend/server.js) — mirrors that here.
export async function testConnection(url) {
  const base = (url || (await getBaseURL())).trim().replace(/\/+$/, '');
  const resp = await axios.get(`${base}/api/health`, { timeout: 6000 });
  return resp.data;
}

const api = axios.create({ timeout: 15000 });

// AuthContext registers what to do when the session expires (clear user + toast).
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

// 401s from these endpoints are normal failures (wrong password etc.), not an expired session.
const NON_SESSION_401 = ['/auth/login', '/auth/register', '/auth/password'];

api.interceptors.request.use(async (config) => {
  const base = await getBaseURL();
  config.baseURL = `${base}/api`;
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url || '';
    const hadToken = !!err?.config?.headers?.Authorization;
    if (
      err?.response?.status === 401 &&
      hadToken &&
      !NON_SESSION_401.some((u) => url.includes(u))
    ) {
      if (onUnauthorized) onUnauthorized();
    }
    const data = err?.response?.data;
    const message = data?.message || err.message || 'Something went wrong';
    const wrapped = new Error(message);
    wrapped.status = err?.response?.status;
    // Carried through so auth screens can react (e.g. show a "resend
    // verification email" action) without re-parsing the raw response.
    wrapped.notVerified = !!data?.notVerified;
    wrapped.requiresVerification = !!data?.requiresVerification;
    wrapped.email = data?.email;
    return Promise.reject(wrapped);
  }
);

export default api;
export { TOKEN_KEY, USER_KEY };