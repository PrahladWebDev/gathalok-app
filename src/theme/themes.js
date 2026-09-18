// Central theme definitions. Each theme provides the same shape:
// { colors, radius, spacing, shadow, typography }
// so components can swap themes without changing structure.
//
// uiStyle controls the actual SHAPE language, not just color — this is what
// makes a theme look distinct rather than just recolored:
//  - 'outline' (all 10 Wardrobe-ported themes): thick flat border in the
//    text color, pill-shaped buttons/tab bar, no real shadow. Unchanged from
//    the original Wardrobe app — a deliberate "neo-brutalist outline" look.
//  - 'elevated' (gathalok, the default): thin gold-tinted border, moderate
//    (not full-pill) radius, real drop shadows / accent glow — matching the
//    web app's actual .card / .btn-gold / .btn-ghost treatment in index.css.

const radiusOutline = { sm: 12, md: 18, lg: 28, pill: 999 };
const radiusElevated = { sm: 8, md: 14, lg: 20, pill: 999 };

// Cards, buttons and badges all use a deliberate hairline-to-thick outline
// (see Card/Button/PillBadge) instead of relying on shadow for definition.
const borderOutline = { width: 2.5 };
const borderElevated = { width: 1 };

const spacing = (n) => n * 4;

function makeShadow(shadowColor) {
  return {
    card: {
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 0,
      elevation: 2,
    },
    subtle: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 0,
      elevation: 1,
    },
  };
}

// Real drop shadows + a colored accent glow (for primary buttons), matching
// the web's --shadow-md / --shadow-gold. Only used by 'elevated' themes.
function makeElevatedShadow(colors) {
  return {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    glow: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 6,
    },
  };
}

// Whole-app font override: every text style everywhere uses Comic Neue
// (the open-source, actually-licensed equivalent of Comic Sans — the real
// "Comic Sans MS" isn't bundled on iOS/Android and isn't available as a
// distributable web font, so it would silently fail to render). This
// replaces the per-theme display/body/ui distinctions below; every theme
// (including gathalok's Cinzel/Lora/Inter setup) now renders in Comic Neue.
const GLOBAL_FONT_OVERRIDE = {
  display: 'ComicNeue_700Bold',
  body: 'ComicNeue_400Regular',
  ui: 'ComicNeue_700Bold',
};

function makeTypography(colors, fonts = {}) {
  fonts = { ...fonts, ...GLOBAL_FONT_OVERRIDE, h3h4: 'ComicNeue_700Bold', h2: 'ComicNeue_700Bold', uppercaseUI: fonts.uppercaseUI };
  const display = fonts.display || 'PlayfairDisplay_700Bold';
  const h2Font = fonts.h2 || display;
  const h3h4Font = fonts.h3h4; // undefined = platform default sans, bold
  const body = fonts.body; // undefined = platform default sans
  const ui = fonts.ui; // undefined = platform default sans
  const uiCase = fonts.uppercaseUI ? 'uppercase' : 'none';
  const uiTracking = fonts.uppercaseUI ? 0.6 : 0.4;
  return {
    display: { fontFamily: display, fontSize: 32, color: colors.text, letterSpacing: -0.2 },
    h1: { fontFamily: display, fontSize: 28, color: colors.text, letterSpacing: -0.2 },
    h2: { fontFamily: h2Font, fontSize: 21, color: colors.text },
    h3: { fontFamily: h3h4Font, fontSize: 17, fontWeight: h3h4Font ? undefined : '700', color: colors.text },
    body: { fontFamily: body, fontSize: 15, fontWeight: body ? undefined : '400', color: colors.text },
    bodyMuted: { fontFamily: body, fontSize: 14, fontWeight: body ? undefined : '400', color: colors.textMuted },
    label: { fontFamily: ui, fontSize: 12, fontWeight: ui ? undefined : '600', color: colors.textMuted, letterSpacing: uiTracking, textTransform: uiCase },
    button: { fontFamily: ui, fontSize: 15, fontWeight: ui ? undefined : '700', letterSpacing: fonts.uppercaseUI ? 0.5 : 0, textTransform: uiCase },
    // Added so screens stop improvising fontSize: 11/12 overrides inline.
    h4: { fontFamily: h3h4Font, fontSize: 15, fontWeight: h3h4Font ? undefined : '700', color: colors.text },
    caption: { fontFamily: ui, fontSize: 12, fontWeight: ui ? undefined : '400', color: colors.textMuted },
    small: { fontFamily: ui, fontSize: 11, fontWeight: ui ? undefined : '600', color: colors.textMuted, letterSpacing: uiTracking },
  };
}

// Layout constants shared by every screen so the "dodge the floating tab bar"
// padding is one number instead of 130 / 110 / 60 scattered around.
const layout = {
  screenPadding: 20,
  tabBarHeight: 70,
  tabBarInset: 110,
};

// Standard extra touch area for icon-only buttons (44px targets).
const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

function build(id, name, mode, colors, extra = {}) {
  const uiStyle = extra.uiStyle || 'outline';
  const elevated = uiStyle === 'elevated';
  return {
    id,
    name,
    mode, // 'light' | 'dark' — drives StatusBar style
    uiStyle,
    colors,
    radius: elevated ? radiusElevated : radiusOutline,
    border: elevated ? borderElevated : borderOutline,
    spacing,
    layout,
    hitSlop,
    shadow: elevated ? makeElevatedShadow(colors) : makeShadow(mode === 'dark' ? '#000000' : colors.text),
    typography: makeTypography(colors, extra.fonts),
    gradient: extra.gradient || [colors.accent, colors.accent],
  };
}

// 1. Warm Light (original, refined) — default
const warmLight = build('warmLight', 'Warm Sand', 'light', {
  bg: '#FBF7F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F1ECE2',
  border: '#E7E0D2',
  text: '#20201D',
  textMuted: '#7A7468',
  textFaint: '#A8A192',
  accent: '#C1633B',
  accentSoft: '#F1D9CC',
  success: '#4C7A5C',
  successSoft: '#DEEBE1',
  danger: '#B84B4B',
  dangerSoft: '#F5DEDE',
  info: '#3E6E8C',
  infoSoft: '#DCE9F0',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#C1633B', '#D98A5F'] });

// 2. Midnight (premium dark, deep navy + gold accent)
const midnight = build('midnight', 'Midnight Gold', 'dark', {
  bg: '#0F1115',
  surface: '#1A1D24',
  surfaceAlt: '#22262F',
  border: '#2E323C',
  text: '#F3F1EA',
  textMuted: '#A6ABB8',
  textFaint: '#6C7280',
  accent: '#D4AF6A',
  accentSoft: '#3A331F',
  success: '#6FBF8B',
  successSoft: '#1D2E22',
  danger: '#E2726B',
  dangerSoft: '#3A2222',
  info: '#7FB3D5',
  infoSoft: '#1E2C36',
  black: '#000000',
  onAccent: '#1A1508',
}, { gradient: ['#D4AF6A', '#8A6E36'] });

// 3. Rose Quartz (premium light, blush + plum)
const roseQuartz = build('roseQuartz', 'Rose Quartz', 'light', {
  bg: '#FBF4F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F6E9EC',
  border: '#EED9DE',
  text: '#2B1F24',
  textMuted: '#8A6E76',
  textFaint: '#BBA0A7',
  accent: '#A24E68',
  accentSoft: '#F1D6DE',
  success: '#5C8A6F',
  successSoft: '#E2EFE6',
  danger: '#B94A4A',
  dangerSoft: '#F6DEDE',
  info: '#5A7599',
  infoSoft: '#E1E9F1',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#A24E68', '#C97C93'] });

// 4. Emerald Noir (premium dark, forest green + brass)
const emeraldNoir = build('emeraldNoir', 'Emerald Noir', 'dark', {
  bg: '#0D1512',
  surface: '#16211C',
  surfaceAlt: '#1D2B24',
  border: '#28382F',
  text: '#EDF3EF',
  textMuted: '#9FB3A9',
  textFaint: '#647A6E',
  accent: '#4FA37B',
  accentSoft: '#1D3428',
  success: '#4FA37B',
  successSoft: '#1D3428',
  danger: '#DD7A6E',
  dangerSoft: '#3A2420',
  info: '#7AAFC2',
  infoSoft: '#1C2E35',
  black: '#000000',
  onAccent: '#08140E',
}, { gradient: ['#4FA37B', '#2E6B54'] });

// 5. Slate (cool, minimal neutral light)
const slate = build('slate', 'Slate Minimal', 'light', {
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#ECEEF2',
  border: '#DEE1E7',
  text: '#1B1E24',
  textMuted: '#5F6673',
  textFaint: '#9AA1AD',
  accent: '#3A5AE0',
  accentSoft: '#DDE4FB',
  success: '#3E9B6B',
  successSoft: '#DFF1E7',
  danger: '#D14F4F',
  dangerSoft: '#FADEDE',
  info: '#3A5AE0',
  infoSoft: '#DDE4FB',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#3A5AE0', '#6C8AF0'] });

// 6. Cream Ink — matches the cream/near-black outlined reference design:
// warm paper background, bold near-black borders on every card, and a
// warm peach accent for highlights/badges.
const creamInk = build('creamInk', 'Cream Ink', 'light', {
  bg: '#F7F1E4',
  surface: '#FFFFFF',
  surfaceAlt: '#EFE6D3',
  border: '#14151A',
  text: '#14151A',
  textMuted: '#5B5A55',
  textFaint: '#8E8C82',
  accent: '#5B4FE0',
  accentSoft: '#F3DCC0',
  success: '#3E8A5C',
  successSoft: '#DCEFE1',
  danger: '#C33D6F',
  dangerSoft: '#F7D8E4',
  info: '#3A5AE0',
  infoSoft: '#DDE4FB',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#5B4FE0', '#8B7FF0'] });

// 7. Sunset Clay (warm light, terracotta + mustard)
const sunsetClay = build('sunsetClay', 'Sunset Clay', 'light', {
  bg: '#FDF6ED',
  surface: '#FFFFFF',
  surfaceAlt: '#F5E9D8',
  border: '#E9D6B8',
  text: '#2B2117',
  textMuted: '#8A7650',
  textFaint: '#B8A98E',
  accent: '#E08A3E',
  accentSoft: '#FBE3C4',
  success: '#5C8A50',
  successSoft: '#E4EFDC',
  danger: '#C2543D',
  dangerSoft: '#F7DCD2',
  info: '#C99A32',
  infoSoft: '#F5EBCB',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#E08A3E', '#F2B15E'] });

// 8. Obsidian Ink (near-black premium dark, cool violet accent)
const obsidianInk = build('obsidianInk', 'Obsidian Ink', 'dark', {
  bg: '#0A0A0D',
  surface: '#141419',
  surfaceAlt: '#1C1C24',
  border: '#2A2A34',
  text: '#F0EFF5',
  textMuted: '#9C9BAA',
  textFaint: '#68677A',
  accent: '#8B7CF6',
  accentSoft: '#2A2445',
  success: '#5FBF8F',
  successSoft: '#1B2E24',
  danger: '#E2666B',
  dangerSoft: '#3A2224',
  info: '#6FA8DC',
  infoSoft: '#1E2C38',
  black: '#000000',
  onAccent: '#100C24',
}, { gradient: ['#8B7CF6', '#5A4FC7'] });

// 9. Ocean Mist (cool light, teal + navy)
const oceanMist = build('oceanMist', 'Ocean Mist', 'light', {
  bg: '#F2F8F8',
  surface: '#FFFFFF',
  surfaceAlt: '#E4F0EF',
  border: '#CFE4E2',
  text: '#132B2C',
  textMuted: '#5C7B7C',
  textFaint: '#93AFAF',
  accent: '#1D8A8A',
  accentSoft: '#D3ECEA',
  success: '#3E9B6B',
  successSoft: '#DDF1E6',
  danger: '#C24F4F',
  dangerSoft: '#F6DCDC',
  info: '#2D6E9E',
  infoSoft: '#DBE9F2',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#1D8A8A', '#3FB3AE'] });

// 10. Crimson Noir (bold dark, deep red + charcoal)
const crimsonNoir = build('crimsonNoir', 'Crimson Noir', 'dark', {
  bg: '#120D0D',
  surface: '#1C1414',
  surfaceAlt: '#241A1A',
  border: '#362424',
  text: '#F5EBEA',
  textMuted: '#B3938F',
  textFaint: '#785F5C',
  accent: '#D9455A',
  accentSoft: '#3A1F24',
  success: '#5FA87A',
  successSoft: '#1E2E23',
  danger: '#E2666B',
  dangerSoft: '#3A2224',
  info: '#7FA8C9',
  infoSoft: '#1E2A34',
  black: '#000000',
  onAccent: '#FFFFFF',
}, { gradient: ['#D9455A', '#8C2C3A'] });

// The actual GathaLok web brand — exact hex values ported from
// frontend/src/index.css ("Night Ink" bg, "Ancient Ochre" gold accent,
// Crimson secondary, Ash White text), with Cinzel/Lora/Inter to match the
// web's declared --font-display / --font-body / --font-ui exactly. This is
// the default theme; the other 10 (ported from Wardrobe) remain selectable
// from Settings for anyone who prefers a different look.
const gathalok = build('gathalok', 'GathaLok Gold', 'dark', {
  bg: '#0D0A1A',
  surface: '#231B3A',
  surfaceAlt: '#2D2450',
  border: 'rgba(183, 140, 62, 0.3)',
  text: '#F0EAD6',
  textMuted: '#C8C0A8',
  textFaint: '#7A7090',
  accent: '#B78C3E',
  accentSoft: 'rgba(183, 140, 62, 0.15)',
  success: '#6FBF8B',
  successSoft: 'rgba(111, 191, 139, 0.15)',
  danger: '#A52020',
  dangerSoft: 'rgba(165, 32, 32, 0.15)',
  info: '#D4660A',
  infoSoft: 'rgba(212, 102, 10, 0.15)',
  black: '#000000',
  onAccent: '#1A1508',
}, {
  gradient: ['#E8C97A', '#B78C3E'],
  uiStyle: 'elevated',
  fonts: {
    display: 'Cinzel_700Bold',
    h2: 'Cinzel_600SemiBold',
    h3h4: 'Cinzel_600SemiBold',
    body: 'Lora_400Regular',
    ui: 'Inter_600SemiBold',
    uppercaseUI: true,
  },
});

export const themes = {
  gathalok,
  creamInk,
  warmLight,
  midnight,
  roseQuartz,
  emeraldNoir,
  slate,
  sunsetClay,
  obsidianInk,
  oceanMist,
  crimsonNoir,
};

export const themeList = Object.values(themes).map((t) => ({
  id: t.id, name: t.name, mode: t.mode, accent: t.colors.accent, onAccent: t.colors.onAccent, bg: t.colors.bg, surface: t.colors.surface,
}));

export const DEFAULT_THEME_ID = 'gathalok';
