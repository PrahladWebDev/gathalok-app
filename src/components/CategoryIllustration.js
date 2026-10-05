import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle, Ellipse, Rect, Path, Polygon, Polyline, Line, G, Defs, ClipPath, RadialGradient, Stop,
} from 'react-native-svg';

// Illustrated, round category artwork (drawn in code — no image files needed).
// Usage: <CategoryIllustration slug="ghost-stories" color="#4A0E8F" size={72} />

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (h, target, t) => {
  const a = hex(h);
  const b = hex(target);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

const GOLD = '#F2C45A';
const CREAM = '#FFF3D6';

const Star = ({ x, y, r = 4, fill = CREAM }) => (
  <Path d={`M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`} fill={fill} />
);

const SCENES = {
  'ghost-stories': () => (
    <>
      <Circle cx="76" cy="24" r="10" fill="#F5E6A8" />
      <Circle cx="80" cy="21" r="9" fill="#5B1BA6" opacity="0.55" />
      <Star x={22} y={24} r={3} /><Star x={34} y={14} r={2.5} /><Star x={84} y={50} r={2.5} />
      <Path d="M28 84 V52 Q28 22 50 22 Q72 22 72 52 V84 L64.5 76 L57 84 L50 76 L43 84 L35.5 76 Z" fill="#FFFFFF" />
      <Ellipse cx="41" cy="48" rx="4.5" ry="6" fill="#2A0A50" />
      <Ellipse cx="59" cy="48" rx="4.5" ry="6" fill="#2A0A50" />
      <Ellipse cx="50" cy="62" rx="5" ry="6.5" fill="#2A0A50" />
    </>
  ),

  'mythological-creatures': () => (
    <>
      <Path d="M50 58 L10 28 L22 52 L8 58 L26 68 L50 66 Z" fill="#3E0A0A" />
      <Path d="M50 58 L90 28 L78 52 L92 58 L74 68 L50 66 Z" fill="#3E0A0A" />
      <Path d="M50 58 L22 36 M50 58 L16 52 M50 58 L14 62" stroke="#C0392B" strokeWidth="1.6" fill="none" />
      <Path d="M50 58 L78 36 M50 58 L84 52 M50 58 L86 62" stroke="#C0392B" strokeWidth="1.6" fill="none" />
      <Ellipse cx="50" cy="66" rx="11" ry="16" fill={GOLD} />
      <Path d="M42 62 H58 M42 69 H58 M43 76 H57" stroke="#B9822A" strokeWidth="1.8" />
      <Circle cx="50" cy="40" r="10" fill={GOLD} />
      <Polygon points="42,34 38,22 47,31" fill="#FFF3D6" />
      <Polygon points="58,34 62,22 53,31" fill="#FFF3D6" />
      <Circle cx="46" cy="39" r="2" fill="#8B1A1A" /><Circle cx="54" cy="39" r="2" fill="#8B1A1A" />
      <Path d="M44 46 Q50 51 56 46" stroke="#8B1A1A" strokeWidth="1.8" fill="none" />
      <Path d="M50 88 Q44 80 50 74 Q56 80 50 88 Z" fill="#FF8A3D" />
    </>
  ),

  'tribal-legends': () => (
    <>
      <Line x1="20" y1="20" x2="44" y2="42" stroke="#F4E4C1" strokeWidth="3.5" strokeLinecap="round" />
      <Line x1="80" y1="20" x2="56" y2="42" stroke="#F4E4C1" strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="20" cy="20" r="4.5" fill={GOLD} /><Circle cx="80" cy="20" r="4.5" fill={GOLD} />
      <Path d="M26 46 L31 78 Q50 88 69 78 L74 46 Q50 56 26 46 Z" fill="#B5651D" />
      <Ellipse cx="50" cy="46" rx="24" ry="8" fill="#F4E4C1" />
      <Ellipse cx="50" cy="46" rx="24" ry="8" fill="none" stroke="#8A4A12" strokeWidth="1.5" />
      <Polyline points="30,60 38,70 46,60 54,70 62,60 70,68" stroke={GOLD} strokeWidth="2.6" fill="none" strokeLinejoin="round" />
      <Polyline points="31,52 38,58 45,52 52,58 59,52 66,58" stroke="#F4E4C1" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    </>
  ),

  'sacred-places': () => (
    <>
      <Circle cx="50" cy="40" r="30" fill="#FFD98A" opacity="0.35" />
      <Rect x="0" y="80" width="100" height="20" fill="#8A5200" />
      <Rect x="30" y="60" width="40" height="22" fill={CREAM} />
      <Polygon points="28,60 50,36 72,60" fill="#F7D9A0" />
      <Polygon points="34,44 50,24 66,44" fill="#F2C97A" />
      <Polygon points="41,30 50,16 59,30" fill="#EBB85A" />
      <Line x1="50" y1="16" x2="50" y2="8" stroke="#6B3E00" strokeWidth="1.6" />
      <Polygon points="50,8 60,11 50,14" fill="#D63C2A" />
      <Path d="M44 82 V70 Q50 62 56 70 V82 Z" fill="#6B3E00" />
      <Rect x="33" y="66" width="6" height="10" fill="#C17900" /><Rect x="61" y="66" width="6" height="10" fill="#C17900" />
    </>
  ),

  'folk-tales': () => (
    <>
      <Star x={50} y={20} r={7} fill={GOLD} />
      <Star x={24} y={28} r={3.5} /><Star x={78} y={30} r={3} />
      <Path d="M50 76 Q32 66 14 72 V38 Q32 32 50 42 Z" fill="#FFF6DC" />
      <Path d="M50 76 Q68 66 86 72 V38 Q68 32 50 42 Z" fill="#F3E5BE" />
      <Path d="M50 42 V76" stroke="#8A6A2E" strokeWidth="1.8" />
      <Path d="M20 48 Q33 45 45 51 M20 56 Q33 53 45 59 M20 64 Q33 61 45 67" stroke="#A98B52" strokeWidth="1.8" fill="none" />
      <Path d="M55 51 Q67 45 80 48 M55 59 Q67 53 80 56 M55 67 Q67 61 80 64" stroke="#A98B52" strokeWidth="1.8" fill="none" />
    </>
  ),

  'demigods-heroes': () => (
    <>
      <Path d="M50 18 L76 28 V52 Q76 72 50 86 Q24 72 24 52 V28 Z" fill="#0F5B2F" />
      <Path d="M50 24 L70 32 V52 Q70 68 50 80 Q30 68 30 52 V32 Z" fill="#2FA365" />
      <Star x={50} y={52} r={10} fill={GOLD} />
      <G transform="rotate(45 50 50)">
        <Polygon points="50,6 54,16 54,60 46,60 46,16" fill="#E8EEF2" />
        <Line x1="50" y1="10" x2="50" y2="58" stroke="#A9B6C0" strokeWidth="1.4" />
        <Rect x="38" y="60" width="24" height="5" rx="2" fill={GOLD} />
        <Rect x="47" y="65" width="6" height="14" fill="#7A4A1D" />
        <Circle cx="50" cy="82" r="4" fill={GOLD} />
      </G>
      <G transform="rotate(-45 50 50)">
        <Polygon points="50,6 54,16 54,60 46,60 46,16" fill="#F4F7F9" />
        <Line x1="50" y1="10" x2="50" y2="58" stroke="#A9B6C0" strokeWidth="1.4" />
        <Rect x="38" y="60" width="24" height="5" rx="2" fill={GOLD} />
        <Rect x="47" y="65" width="6" height="14" fill="#7A4A1D" />
        <Circle cx="50" cy="82" r="4" fill={GOLD} />
      </G>
    </>
  ),

  'nature-spirits': () => (
    <>
      <Circle cx="50" cy="48" r="34" fill="#9BFFD0" opacity="0.14" />
      <Path d="M44 90 L46 58 H54 L56 90 Z" fill="#5A3A1E" />
      <Path d="M50 66 L38 54 M50 62 L62 50" stroke="#5A3A1E" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="34" cy="50" r="14" fill="#2E9E5B" />
      <Circle cx="66" cy="50" r="14" fill="#2E9E5B" />
      <Circle cx="50" cy="34" r="19" fill="#43C072" />
      <Circle cx="42" cy="44" r="12" fill="#58D184" />
      <Circle cx="60" cy="42" r="11" fill="#43C072" />
      <Circle cx="20" cy="30" r="2.6" fill="#FFF7A8" /><Circle cx="82" cy="40" r="2.6" fill="#FFF7A8" />
      <Circle cx="26" cy="72" r="2.2" fill="#FFF7A8" /><Circle cx="76" cy="70" r="2.6" fill="#FFF7A8" />
      <Circle cx="14" cy="52" r="1.8" fill="#FFF7A8" />
    </>
  ),

  'cursed-places': () => (
    <>
      <Circle cx="74" cy="24" r="11" fill="#E0553A" />
      <Circle cx="74" cy="24" r="16" fill="#E0553A" opacity="0.2" />
      <Path d="M0 84 Q30 76 50 82 T100 80 V100 H0 Z" fill="#1A0705" />
      <Rect x="28" y="54" width="44" height="30" fill="#1A0705" />
      <Polygon points="23,56 50,30 77,56" fill="#2A0D09" />
      <Rect x="60" y="30" width="8" height="18" fill="#2A0D09" />
      <Rect x="35" y="62" width="8" height="10" fill="#FFC857" />
      <Rect x="57" y="62" width="8" height="10" fill="#FFC857" />
      <Path d="M45 84 V72 Q50 66 55 72 V84 Z" fill="#FFC857" opacity="0.85" />
      <Path d="M12 84 L14 62 M14 70 L8 62 M14 66 L20 58" stroke="#0E0302" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <Path d="M20 30 q4 -3 8 0 q4 -3 8 0" stroke="#0E0302" strokeWidth="1.8" fill="none" />
    </>
  ),

  'urban-legends': () => (
    <>
      <Circle cx="76" cy="24" r="9" fill="#F5F1D0" />
      <Star x={24} y={22} r={2.6} /><Star x={44} y={14} r={2.2} /><Star x={62} y={26} r={2} />
      <Rect x="10" y="48" width="18" height="42" fill="#14202B" />
      <Rect x="30" y="30" width="22" height="60" fill="#0E1822" />
      <Rect x="54" y="42" width="16" height="48" fill="#17242F" />
      <Rect x="72" y="36" width="20" height="54" fill="#101B25" />
      <G fill="#FFD66B">
        <Rect x="14" y="54" width="4" height="4" /><Rect x="21" y="62" width="4" height="4" /><Rect x="14" y="70" width="4" height="4" />
        <Rect x="35" y="38" width="4" height="4" /><Rect x="43" y="46" width="4" height="4" /><Rect x="35" y="56" width="4" height="4" /><Rect x="43" y="66" width="4" height="4" />
        <Rect x="58" y="48" width="4" height="4" /><Rect x="58" y="60" width="4" height="4" />
        <Rect x="77" y="42" width="4" height="4" /><Rect x="84" y="52" width="4" height="4" /><Rect x="77" y="64" width="4" height="4" />
      </G>
      <Rect x="0" y="88" width="100" height="12" fill="#0A1117" />
      <Line x1="48" y1="92" x2="48" y2="72" stroke="#0A1117" strokeWidth="2" />
      <Circle cx="48" cy="71" r="3" fill="#FFE9A0" />
    </>
  ),

  'gods-goddesses': () => (
    <>
      <G stroke="#FFF1A8" strokeWidth="2.4" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <Line key={i} x1={50 + Math.cos(a) * 24} y1={38 + Math.sin(a) * 24} x2={50 + Math.cos(a) * 33} y2={38 + Math.sin(a) * 33} />;
        })}
      </G>
      <Circle cx="50" cy="38" r="20" fill="#FFF1A8" />
      <Circle cx="50" cy="38" r="14" fill="#FFD25A" />
      <Path d="M44 34 Q50 28 56 34 M44 42 Q50 48 56 42" stroke="#B7950B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {[-62, -31, 31, 62].map((a) => (
        <G key={a} transform={`rotate(${a} 50 88)`}>
          <Ellipse cx="50" cy="68" rx="8" ry="18" fill="#FFD3E2" />
        </G>
      ))}
      <Ellipse cx="50" cy="68" rx="8.5" ry="19" fill="#FFB3CF" />
      <Path d="M20 88 Q50 80 80 88" stroke="#7BD0C2" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),

  'witches-sorcery': () => (
    <>
      <Path d="M70 20 a12 12 0 1 0 8 20 a9.5 9.5 0 1 1 -8 -20 Z" fill="#F5E6A8" />
      <Star x={22} y={30} r={4.5} fill={GOLD} /><Star x={30} y={16} r={2.4} /><Star x={84} y={58} r={3.2} fill={GOLD} /><Star x={16} y={62} r={2.4} />
      <Path d="M50 10 Q58 20 54 28 Q64 44 66 62 L36 62 Q38 40 46 26 Q42 16 50 10 Z" fill="#1B0B26" />
      <Ellipse cx="50" cy="66" rx="30" ry="8" fill="#12071A" />
      <Rect x="36" y="53" width="30" height="7" fill={GOLD} transform="rotate(-3 50 56)" />
      <Rect x="46" y="52" width="8" height="9" fill="#6C3483" transform="rotate(-3 50 56)" />
      <Path d="M34 80 Q50 74 66 80" stroke="#C9A0E0" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  ),

  'festivals-rituals': () => (
    <>
      <Circle cx="50" cy="42" r="30" fill="#FFD54A" opacity="0.2" />
      <Circle cx="50" cy="42" r="20" fill="#FFD54A" opacity="0.22" />
      <Path d="M50 14 Q66 38 50 58 Q34 38 50 14 Z" fill="#FFD54A" />
      <Path d="M50 30 Q58 44 50 56 Q42 44 50 30 Z" fill="#FF8A3D" />
      <Path d="M22 62 Q50 66 78 62 Q74 84 50 86 Q26 84 22 62 Z" fill="#7B2D0E" />
      <Ellipse cx="50" cy="62" rx="28" ry="6" fill="#E8A33D" />
      <Path d="M30 74 Q50 80 70 74" stroke="#F2C45A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Circle cx="16" cy="30" r="2.4" fill="#FFE9A0" /><Circle cx="86" cy="26" r="2.2" fill="#FFE9A0" /><Circle cx="82" cy="52" r="1.8" fill="#FFE9A0" /><Circle cx="18" cy="50" r="1.8" fill="#FFE9A0" />
    </>
  ),
};

// `glow` adds a soft halo in the category's own colour around the circle, so
// the colour bleeds out into the page background. The halo needs room, so the
// component renders a box ~1.28x the circle size when glow is on.
export default function CategoryIllustration({ slug, color = '#4A0E8F', size = 72, glow = false }) {
  const Scene = SCENES[slug];
  const light = mix(color, '#ffffff', 0.3);
  const dark = mix(color, '#000000', 0.3);
  const glowColor = mix(color, '#ffffff', 0.25); // lifted so dark categories still glow on a dark bg

  const art = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`bg-${slug}`} cx="50%" cy="30%" r="80%">
          <Stop offset="0" stopColor={light} />
          <Stop offset="1" stopColor={dark} />
        </RadialGradient>
        <ClipPath id={`clip-${slug}`}>
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#clip-${slug})`}>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#bg-${slug})`} />
        {Scene ? <Scene /> : null}
      </G>
      <Circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
    </Svg>
  );

  if (!glow) return art;

  const box = Math.round(size * 1.28);
  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={box} height={box} style={{ position: 'absolute' }} pointerEvents="none">
        <Defs>
          {/* circle edge sits at ~78% of the radius; keep it strong there and fade to 0 at the box edge */}
          <RadialGradient id={`halo-${slug}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={glowColor} stopOpacity="0.9" />
            <Stop offset="0.74" stopColor={glowColor} stopOpacity="0.65" />
            <Stop offset="0.88" stopColor={glowColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={box / 2} cy={box / 2} r={box / 2} fill={`url(#halo-${slug})`} />
      </Svg>
      {art}
    </View>
  );
}