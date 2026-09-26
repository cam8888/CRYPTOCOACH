import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/** Fox colors, taken from the logo. */
const C = {
  orange: '#F57C1F',
  orangeDark: '#D9541A',
  cream: '#FDE8D0',
  sock: '#5A2E1E',
  glasses: '#17393A',
  pupil: '#10292A',
  white: '#FFFFFF',
  phone: '#1F4A48',
  mouth: '#6B2E1E',
};

export type FoxPose = {
  lookX?: number; // -1 (looks left) … 1 (looks right)
  lookY?: number; // -1 (looks up) … 1 (looks down)
  legL?: number;  // leg angles in degrees (walking)
  legR?: number;
  armL?: number;  // arm angles in degrees: 0 = hanging, ±180 = raised
  armR?: number;
  phone?: boolean; // holding its phone with both paws
  blink?: boolean;
  mouth?: 'smile' | 'open';
  tail?: number;  // tail wag, degrees
};

export const RIG_RATIO = 270 / 200; // height / width

/**
 * The CryptoCoach fox, drawn in vector so it can move:
 * legs to walk, arms to wave or point, eyes and face to look around.
 * Same colors and glasses as the logo.
 */
export function FoxRig({
  size = 160,
  lookX = 0, lookY = 0, legL = 0, legR = 0, armL = 8, armR = -8,
  phone = false, blink = false, mouth = 'smile', tail = 0,
}: FoxPose & { size?: number }) {
  // The face slides a little towards where the fox looks: it reads as a head turn
  const fx = lookX * 9;
  const fy = lookY * 6;
  const px = lookX * 5;
  const py = lookY * 5;

  const leg = (x: number, angle: number) => (
    <G transform={`translate(${x} 212) rotate(${angle})`}>
      <Path d="M-10 -4 L-9 34 L9 34 L10 -4 Z" fill={C.orangeDark} />
      <Path d="M-9 30 L-9 40 Q-9 48 0 48 L12 48 Q20 48 20 42 Q20 36 10 36 L9 30 Z" fill={C.sock} />
    </G>
  );

  const arm = (x: number, angle: number, side: 1 | -1) => (
    <G transform={`translate(${x} 142) rotate(${angle})`}>
      <Path d="M-9 -4 Q-13 26 -8 46 Q0 56 8 46 Q13 26 9 -4 Z" fill={C.orangeDark} />
      <Ellipse cx={0} cy={46} rx={9} ry={8} fill={C.sock} />
      <Path d={`M${-4 * side} 50 L${-4 * side} 44`} stroke={C.orangeDark} strokeWidth={1.5} strokeLinecap="round" />
    </G>
  );

  const eye = (cx: number) => (
    <G>
      <Circle cx={cx} cy={92} r={21} fill={C.orange} />
      {blink ? (
        <Path d={`M${cx - 11} ${93 + py} Q${cx} ${99 + py} ${cx + 11} ${93 + py}`} stroke={C.pupil} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ) : (
        <G>
          <Circle cx={cx + px * 0.4} cy={92 + py * 0.4} r={14} fill={C.white} />
          <Circle cx={cx + px} cy={93 + py} r={9.5} fill={C.pupil} />
          <Circle cx={cx + px + 3.5} cy={89 + py} r={3.2} fill={C.white} />
        </G>
      )}
      <Circle cx={cx} cy={92} r={21} fill="none" stroke={C.glasses} strokeWidth={5} />
    </G>
  );

  return (
    <Svg width={size} height={size * RIG_RATIO} viewBox="0 0 200 270">
      {/* Tail, behind everything */}
      <G transform={`rotate(${tail} 76 200)`}>
        <Path d="M78 206 Q22 222 12 170 Q6 128 40 112 Q34 150 58 170 Q70 180 82 182 Z" fill={C.orange} />
        <Path d="M12 170 Q6 128 40 112 Q34 132 36 146 Q24 150 12 170 Z" fill={C.cream} />
        <Path d="M78 206 Q40 214 24 196" stroke={C.orangeDark} strokeWidth={3} fill="none" strokeLinecap="round" />
      </G>

      {leg(84, legL)}
      {leg(116, legR)}

      {/* Body and belly */}
      <Path d="M66 128 Q52 178 64 216 Q100 230 136 216 Q148 178 134 128 Z" fill={C.orange} />
      <Ellipse cx={100} cy={182} rx={25} ry={32} fill={C.cream} />


      {/* Ears (they move slightly the other way when the head turns) */}
      <G transform={`translate(${-lookX * 3} 0)`}>
        <Path d="M50 66 L38 8 Q72 16 92 44 Z" fill={C.orange} />
        <Path d="M38 8 Q46 10 50 14 L52 60 Z" fill={C.orangeDark} />
        <Path d="M55 58 L46 22 Q66 30 80 46 Z" fill={C.cream} />
        <Path d="M150 66 L162 8 Q128 16 108 44 Z" fill={C.orange} />
        <Path d="M162 8 Q154 10 150 14 L148 60 Z" fill={C.orangeDark} />
        <Path d="M145 58 L154 22 Q134 30 120 46 Z" fill={C.cream} />
      </G>

      {/* Head with its cheek tufts */}
      <Path d="M38 92 Q36 40 100 36 Q164 40 162 92 L176 114 Q156 116 146 126 Q100 152 54 126 Q44 116 24 114 Z" fill={C.orange} />
      <G transform={`translate(${fx} ${fy})`}>
        <Path d="M44 112 Q70 102 100 108 Q130 102 156 112 Q146 140 100 146 Q54 140 44 112 Z" fill={C.cream} />
        <Path d="M70 60 Q78 55 88 60" stroke={C.orangeDark} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Path d="M112 60 Q122 55 130 60" stroke={C.orangeDark} strokeWidth={5} strokeLinecap="round" fill="none" />
        {eye(76)}
        {eye(124)}
        <Path d="M97 91 Q100 86 103 91" stroke={C.glasses} strokeWidth={4} fill="none" />
        <Path d="M55 90 L42 86 M145 90 L158 86" stroke={C.glasses} strokeWidth={4} strokeLinecap="round" />
        <Ellipse cx={100} cy={118} rx={7} ry={4.5} fill={C.pupil} />
        {mouth === 'open' ? (
          <Path d="M89 126 Q100 144 111 126 Z" fill={C.mouth} />
        ) : (
          <Path d="M91 127 Q99 134 107 127" stroke={C.mouth} strokeWidth={3} strokeLinecap="round" fill="none" />
        )}
      </G>

      {/* Phone and arms last: they show in front of the head */}
      {phone && <G><Rect x={84} y={142} width={32} height={48} rx={6} fill={C.phone} /><Circle cx={92} cy={150} r={3} fill="#3C6B68" /></G>}
      {arm(70, armL, -1)}
      {arm(130, armR, 1)}
    </Svg>
  );
}
