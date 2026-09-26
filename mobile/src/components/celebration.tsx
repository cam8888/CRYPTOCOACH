import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Fox } from '@/components/fox';
import { Brand, Radius, Space, Font } from '@/constants/brand';
import { vibrate } from '@/lib/haptics';

const CONFETTI_COLORS = ['#F57C1F', '#FFD166', '#FFFFFF', '#7BDFF2', '#EF476F', '#06D6A0'];

type Props = { visible: boolean; title: string; amount: string; message: string; onClose: () => void };

/**
 * "You earned money!" screen: indigo background, falling confetti,
 * a spinning dollar sign, and the fox popping up to congratulate you. The phone vibrates.
 */
export function Celebration({ visible, title, amount, message, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const spin = useRef(new Animated.Value(0)).current;
  const dollarIn = useRef(new Animated.Value(0)).current;
  const foxIn = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(0)).current;

  // 40 confetti pieces with a random position, color, size and sway
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * 0.35,
        sway: (Math.random() - 0.5) * 80,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        turns: 2 + Math.random() * 4,
      })),
    [width],
  );

  useEffect(() => {
    if (!visible) return;
    vibrate.success();
    spin.setValue(0);
    dollarIn.setValue(0);
    foxIn.setValue(0);
    fall.setValue(0);
    Animated.parallel([
      Animated.timing(fall, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(dollarIn, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(450),
        Animated.spring(foxIn, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, spin, dollarIn, foxIn, fall]);

  const rotateY = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={styles.screen}>
        {pieces.map((p, i) => {
          const progress = fall.interpolate({
            inputRange: [0, p.delay, 1],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: p.x,
                top: -20,
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: 2,
                transform: [
                  { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, height + 40] }) },
                  { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.sway, -p.sway / 2] }) },
                  { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.turns * 360}deg`] }) },
                ],
              }}
            />
          );
        })}

        <View style={styles.center}>
          <Animated.View style={{ transform: [{ perspective: 600 }, { scale: dollarIn }, { rotateY }] }}>
            <View style={styles.coin}>
              <Text style={styles.dollar}>$</Text>
            </View>
          </Animated.View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>

        <Animated.View
          style={[
            styles.bottom,
            { transform: [{ translateY: foxIn.interpolate({ inputRange: [0, 1], outputRange: [320, 0] }) }] },
          ]}>
          <View style={styles.speech}>
            <Text style={styles.speechText}>{message}</Text>
          </View>
          <Fox size={150} talking />
          <Pressable onPress={onClose} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
            <Text style={styles.buttonText}>Trop bien, continuer</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.primary, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.md, paddingTop: 60 },
  coin: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFC53D',
    borderWidth: 8,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollar: { fontSize: 72, letterSpacing: -0.5, fontFamily: Font.black, color: '#8A5A00' },
  title: { color: 'rgba(255,255,255,0.85)', fontSize: 18, fontFamily: Font.bold, marginTop: Space.sm },
  amount: { color: '#FFFFFF', fontSize: 44, letterSpacing: -0.5, fontFamily: Font.black, fontVariant: ['tabular-nums'] },
  bottom: { alignItems: 'center', paddingHorizontal: Space.lg, paddingBottom: 40, gap: Space.sm },
  speech: { backgroundColor: '#FFFFFF', borderRadius: Radius.md, padding: Space.md, maxWidth: 320 },
  speechText: { color: Brand.navy, fontSize: 16, lineHeight: 22, textAlign: 'center', fontFamily: Font.semibold },
  button: {
    alignSelf: 'stretch',
    backgroundColor: Brand.fox,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Space.sm,
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontFamily: Font.extrabold },
});
