import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COUNTRIES } from '../data/countries';

// Returns { "India": "https://…jpg", … } — one landmark photo per country.
// Photos come from Wikipedia's lead images (single batched request), the URL
// map is cached in AsyncStorage for a week, and expo-image caches the files
// on disk. Anything missing simply returns no entry (tile falls back to a
// colour gradient), so a failed request never breaks the screen.
const CACHE_KEY = 'gathalok:realm-images:v1';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

async function fetchImages() {
  const titles = COUNTRIES.map((c) => c.landmark).filter(Boolean);
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1' +
    '&prop=pageimages&piprop=thumbnail&pithumbsize=640' +
    `&titles=${encodeURIComponent(titles.join('|'))}`;
  const json = await (await fetch(url)).json();
  const q = json.query || {};

  const normalized = {};
  (q.normalized || []).forEach((n) => { normalized[n.from] = n.to; });
  const redirects = {};
  (q.redirects || []).forEach((r) => { redirects[r.from] = r.to; });
  const byTitle = {};
  Object.values(q.pages || {}).forEach((p) => {
    if (p.thumbnail?.source) byTitle[p.title] = p.thumbnail.source;
  });

  const out = {};
  COUNTRIES.forEach((c) => {
    if (!c.landmark) return;
    let t = c.landmark;
    t = normalized[t] || t;
    t = redirects[t] || t;
    if (byTitle[t]) out[c.name] = byTitle[t];
  });
  return out;
}

export default function useCountryImages() {
  const [images, setImages] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      let cached = null;
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        cached = raw ? JSON.parse(raw) : null;
      } catch {}
      if (cached?.images && alive) setImages(cached.images);

      const fresh = cached && Date.now() - cached.ts < MAX_AGE && Object.keys(cached.images || {}).length > 0;
      if (fresh) return;
      try {
        const next = await fetchImages();
        if (!Object.keys(next).length) return;
        if (alive) setImages(next);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), images: next })).catch(() => {});
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  return images;
}
