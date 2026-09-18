# GathaLok — React Native / Expo App

Native (iOS + Android) version of the GathaLok web app, built with **Expo SDK 57**.
Same backend, same auth, same data — only the UI is native. Theme *system* is
ported directly from your Wardrobe Manager RN app (pick-a-palette, instant
switching, saved on-device). Every theme currently renders in **Comic Neue**
(the open-source equivalent of Comic Sans — the real "Comic Sans MS" isn't
bundled on iOS/Android or distributable as a web font, so it wouldn't
actually render) across the whole app, per the current styling choice; see
`src/theme/themes.js` → `GLOBAL_FONT_OVERRIDE` if you want to revert to each
theme's original typeface (gathalok's Cinzel/Lora/Inter, the others'
Playfair Display + system sans).

## 1. Install

```bash
cd gathalok-app
npm install
```

## 2. Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) — the whole app, Realms tab included, runs
in plain Expo Go now. No dev build, no native config, no API keys required for anything.

## 3. Backend URL

There's no in-app server-switcher UI anymore (removed by request) — the app
always calls whatever's set in `src/api/client.js`:

```js
export const DEFAULT_BASE_URL = 'https://api.gathalok.prahladsingh.in';
```

To point at a different backend (e.g. local dev testing), edit that line and
reload — there's no other file to touch. Worth knowing: this means testing
against a local machine (see the earlier LAN-IP discussion) now requires an
edit + reload each time you switch, since there's no Settings-screen override
to fall back on. If you want that flexibility back later, the underlying
`getBaseURL`/`setBaseURL`/`testConnection` helpers are still in `client.js`,
just no longer wired to any screen.

## 4. About the Realms tab (formerly "Map")

This is a tile grid (same visual language as Home's "Explore by Region" strip),
not a literal geographic map — each country tile shows its live story count, pulled
in one call from `GET /countries/stats` on your backend. This was a deliberate choice
over `react-native-maps`: no dev build, no Google Maps API key, no native config,
works in plain Expo Go like everything else. Tap a tile to jump to that country's
story list.

## App icon & splash screen

Extracted from your reference design sheet (`icon.png`, `adaptive-icon.png`, `splash.png`,
`favicon.png` in `assets/`) — cropped out phone-bezel/UI-chrome artifacts, padded onto your
exact navy (`#0B1E2D`) for corner-safe masking, matched in `app.json`'s `backgroundColor`.
One honest tradeoff: your reference sheet included small pre-separated Android adaptive-icon
layers (transparent foreground + background, ~157px), but at that resolution they'd look
blurry upscaled to real device sizes. I used the much larger flattened App Icon panel (459px)
for both iOS and Android instead — same art, consistently sharper, at the cost of Android's
own mask potentially clipping a sliver of the dragon/pyramid at the very edges (the centered
tree + "GATHALOK" text is padded well inside the safe zone, so that stays fully visible).
If you get the actual full-resolution original layers from wherever this sheet was generated,
swap them in for a fully polished result.

## What's implemented

- Auth: Login / Register (matches your backend's direct `{user, token}` response, no OTP)
- Home: rotating featured hero, region strip, category grid, recent stories, contribute CTA
- Explore: search, category + sort filters, infinite scroll
- Story Detail: rating, like, bookmark, share (with deep link), comments (post/like/delete), related stories
- Country pages, Leaderboard (readers/contributors/stories), Map (country tile grid with story counts)
- Profile: overview + Bookmarks, Reading History, Achievements, My Contributions
- Contribute / Edit Story: 4-step wizard matching your web form fields exactly, with image upload
- Notifications
- Settings: profile editing (avatar/name/username/bio) + theme picker (11 themes) + change password + sign out
  (server URL config removed by request — see "Backend URL" above)
- **Admin Dashboard** (Profile → Admin Dashboard, only visible when `user.role === 'admin'`):
  analytics overview, Pending Stories review queue (approve / request changes / reject, with
  admin note), Reports queue (dismiss / mark reviewed), Users (search, cycle role, block/unblock)
- **Deep linking**: `gathalok://stories/some-slug` opens that story directly, works immediately,
  no server setup needed. Also mapped: `explore`, `realms`, `leaderboard`, `profile`, `login`,
  `register`, `countries/:name`. Real `https://` links opening the app directly (not just in a
  browser) additionally need Universal Links (iOS) / App Links (Android) — that requires hosting
  a verification file on your actual domain, which I can't do from here. The `prefixes` in
  `src/navigation/AppNavigator.js` use a placeholder domain (`gathalok.prahladsingh.in`) —
  confirm that's your real web frontend URL (not the `api.` one) and update if not.

## Not implemented

Nothing deliberately deferred remains — Admin Dashboard and deep linking (the two open items
from earlier) are both done above. Still open: real device testing (everything here is verified
by static syntax/import checks against your actual backend code, not by running the app), and
Universal Links/App Links domain verification (server-side, not a code change).

Everything else from the web app — including bookmark collections, profile
editing with avatar upload, story reporting, image galleries, references,
tag/country filtering in Explore, and notification filters — is implemented.

## Structure

```
src/
  api/client.js         axios instance, configurable base URL, token handling
  context/               Auth, Theme (10 palettes), Toast
  theme/themes.js         ported from Wardrobe, unchanged
  data/                   categories.js, countries.js (ported from your web assets)
  components/             shared UI kit (Screen, Card, Button, Input, StoryCard, Stars, ...)
  navigation/AppNavigator.js
  screens/                one file per screen
```
