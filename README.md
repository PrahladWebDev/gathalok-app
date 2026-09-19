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

The launcher icon and splash are built as proper native layers (all in `assets/`):

- `icon.png` — full-bleed artwork with no baked-in rounded corners or border, so iOS
  applies its own mask without a "double corner" look.
- `adaptive-icon.png` / `adaptive-icon-bg.png` / `adaptive-icon-mono.png` — Android
  adaptive icon layers. The foreground is the gold tree + GATHALOK wordmark on a
  transparent canvas, fitted inside the 66dp safe circle so no launcher shape clips it;
  the background is the artwork's sky blurred toward the brand navy (`#0B1E2D`); the
  monochrome layer drives Android 13+ themed icons. The tagline is dropped from the
  launcher icon only, because it is unreadable at that size.
- `splash-icon.png` — the same logo on transparent, used for the *system* splash.
  Android 12+ ignores full-screen splash images and only shows a small centred icon, so
  a poster there would render as a tiny thumbnail.
- `splash.png` — the full portrait poster. iOS shows it natively (via the
  `expo-splash-screen` plugin's `ios` block in `app.json`); on Android `App.js` renders
  a `BrandSplash` overlay that takes over from the system splash on the same navy,
  fades the poster in, holds it for at least 1.4s and fades out once fonts, theme and
  auth are ready. A 2s fallback guarantees the native splash can never get stuck.

These are native changes: they need a new build (`eas build` / `expo prebuild`), not an
OTA update. Expo Go will show the poster overlay but not the launcher icon.

## What's implemented

- Auth: Login / Register (matches your backend's direct `{user, token}` response, no OTP)
- Home: rotating featured hero, region strip, category grid, recent stories, contribute CTA
- Explore: search, category + sort filters, infinite scroll
- Story Detail: rating, like, bookmark, share (with deep link), comments (post/like/delete), related stories
- Country pages, Leaderboard (readers/contributors/stories), Map (country tile grid with story counts)
- Profile: overview + Bookmarks, Reading History, Achievements, My Contributions
- Contribute / Edit Story: 4-step wizard matching your web form fields exactly, with image upload
- Notifications (including "New follower")
- **Contributor public profiles + Follow/Unfollow**: tap a contributor on a story or the Ranks tab to open
  their profile (stories, followers, following, likes). Follow button on the story screen, profile and
  follower lists. Contributors get "View Public Profile" under Profile. Deep link: `gathalok://u/username`.
  Needs the updated backend (`/users/:username`, `/users/:id/follow`).
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
  components/             shared UI kit (Screen, Card, Button, Input, StoryCard, Stars, ActionSheet, ...)
  hooks/useFocusedFetch.js load-on-focus + pull-to-refresh + stale-response guard, used by every list screen
  navigation/AppNavigator.js
  screens/                one file per screen
```
