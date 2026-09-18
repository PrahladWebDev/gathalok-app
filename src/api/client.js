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
    const data = err?.response?.data;
    const message = data?.message || err.message || 'Something went wrong';
    const wrapped = new Error(message);
    wrapped.status = err?.response?.status;
    return Promise.reject(wrapped);
  }
);

export default api;
export { TOKEN_KEY, USER_KEY };
