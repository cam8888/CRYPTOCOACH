import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { FoxPose, FoxRig, RIG_RATIO } from '@/components/fox-rig';
import { Brand, Font, Radius, Space } from '@/constants/brand';

const LOGO = require('@/assets/images/fox.png');
const LOGO_RATIO = 668 / 600; // height / width of the logo image

export { RIG_RATIO as FOX_RATIO };

/**
 * What the fox is doing:
 * - idle: stands still, blinks, wags its tail
 * - talk: moves its mouth and gestures (explaining something)
 * - walk: legs and arms swing
 * - wave: waves hello with its right paw
 */
export type FoxMode = 'idle' | 'talk' | 'walk' | 'wave';

type FoxProps = {
  size?: number;
  mode?: FoxMode;
  talking?: boolean; // shortcut for mode="talk"
  pose?: FoxPose;    // fixed parts of the pose (where it looks, a raised arm…)
  style?: ViewStyle;
};

/** Seconds since the component appeared, updated every frame while it moves. */
function useClock(running: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = Date.now() - t * 1000;
    let frame: number;
    const tick = () => {
      setT((Date.now() - start) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return t;
}

/** The animated CryptoCoach fox (vector drawing, with legs and arms). */
export function Fox({ size = 120, mode, talking = false, pose = {}, style }: FoxProps) {
  const current: FoxMode = mode ?? (talking ? 'talk' : 'idle');
  const t = useClock(true);
  const bob = useRef(new Animated.Value(0)).current;

  // A gentle up-and-down while it talks
  useEffect(() => {
    if (current !== 'talk') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, bob]);

  // Blink for 0.15 s every 3.2 s
  const blink = t % 3.2 > 3.05;
  const s = Math.sin;
  let live: FoxPose = { blink, tail: s(t * 2.5) * 6 };

  if (current === 'walk') {
    const step = t * Math.PI * 2 * 1.5; // 1.5 steps per second per leg
    live = { ...live, legL: s(step) * 28, legR: -s(step) * 28, armL: 8 - s(step) * 18, armR: -8 - s(step) * 18, tail: s(step) * 10 };
  } else if (current === 'wave') {
    live = { ...live, armR: -150 + s(t * 14) * 15, mouth: 'open' };
  } else if (current === 'talk') {
    live = { ...live, mouth: Math.floor(t * 6) % 2 === 0 ? 'open' : 'smile', armR: -8 - Math.max(0, s(t * 3)) * 40 };
  }

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  return (
    <Animated.View style={[{ width: size, height: size * RIG_RATIO, transform: [{ translateY }] }, style]}>
      {/* Fixed pose wins over the animation, except for blinking */}
      <FoxRig size={size} {...live} {...pose} blink={pose.blink ?? blink} />
    </Animated.View>
  );
}

/** Small round fox avatar (coach messages, tips): the logo itself. */
export function FoxAvatar({ size = 40 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size }]}>
      <Image source={LOGO} style={{ width: size * 0.9, height: size * 0.9 * LOGO_RATIO, marginTop: size * 0.18 }} resizeMode="contain" />
    </View>
  );
}

/** A tip given by the fox: avatar + speech bubble. */
export function FoxTip({ text, title, tone = 'neutral' }: { text: string; title?: string; tone?: 'neutral' | 'good' | 'bad' }) {
  const bubbleColor = tone === 'good' ? '#DDF3E7' : tone === 'bad' ? '#F9DEDC' : Brand.card;
  return (
    <View style={styles.tipRow}>
      <FoxAvatar size={48} />
      <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
        {title ? <Text style={styles.tipTitle}>{title}</Text> : null}
        <Text style={styles.tipText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: Radius.full,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Space.sm },
  bubble: {
    flex: 1,
    borderRadius: Radius.md,
    borderBottomLeftRadius: 4,
    padding: Space.md,
    gap: Space.xs,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  tipTitle: { color: Brand.navy, fontFamily: Font.extrabold, fontSize: 15 },
  tipText: { color: Brand.navy, fontSize: 15, fontFamily: Font.regular, lineHeight: 21 },
});
