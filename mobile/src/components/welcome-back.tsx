import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fox } from '@/components/fox';
import { Brand, Font } from '@/constants/brand';
import { vibrate } from '@/lib/haptics';

const COIN = 120;

/**
 * "Welcome back" animation, each time the user comes back to the app:
 * a Bitcoin coin spins in the middle of the screen, then the fox
 * pops up from the bottom to say "Coucou toi !". Tap anywhere to skip.
 */
export function WelcomeBack({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const spin = useRef(new Animated.Value(0)).current;   // coin turns on itself
  const coinIn = useRef(new Animated.Value(0)).current; // coin grows in, then moves up
  const fox = useRef(new Animated.Value(0)).current;    // fox rises from the bottom
  const bubble = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  function close() {
    Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setVisible(false);
      doneRef.current();
    });
  }

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(coinIn, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(spin, { toValue: 2, duration: 1300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(coinIn, { toValue: 2, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.spring(fox, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      ]),
      Animated.spring(bubble, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.delay(1100),
    ]).start(({ finished }) => {
      if (finished) close();
    });
    const hi = setTimeout(() => vibrate.success(), 1650);
    return () => clearTimeout(hi);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const rotateY = spin.interpolate({ inputRange: [0, 2], outputRange: ['0deg', '720deg'] });
  const coinScale = coinIn.interpolate({ inputRange: [0, 1, 2], outputRange: [0.2, 1, 0.7] });
  const coinY = coinIn.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0, -150] });
  const foxY = fox.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, { opacity: fade }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close}>
        <View style={styles.center}>
          <Animated.View style={[styles.coin, { transform: [{ translateY: coinY }, { scale: coinScale }, { perspective: 800 }, { rotateY }] }]}>
            <View style={styles.coinInner}>
              <Text style={styles.coinSymbol}>₿</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.foxArea, { transform: [{ translateY: foxY }] }]}>
          <Animated.View style={[styles.bubble, { opacity: bubble, transform: [{ scale: bubble }] }]}>
            <Text style={styles.bubbleText}>Coucou toi !</Text>
            <View style={styles.tail} />
          </Animated.View>
          <Fox size={170} mode="wave" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Brand.primary, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coin: {
    width: COIN, height: COIN, borderRadius: COIN / 2, backgroundColor: '#F7931A',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
  },
  coinInner: {
    width: COIN - 16, height: COIN - 16, borderRadius: (COIN - 16) / 2,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  coinSymbol: { color: '#FFFFFF', fontSize: 58, fontFamily: Font.extrabold, marginTop: -4 },
  foxArea: { position: 'absolute', bottom: -30, alignSelf: 'center', alignItems: 'center' },
  bubble: {
    backgroundColor: Brand.card, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 22, marginBottom: 12,
  },
  bubbleText: { color: Brand.navy, fontSize: 22, fontFamily: Font.extrabold },
  tail: {
    position: 'absolute', bottom: -8, alignSelf: 'center', width: 16, height: 16,
    backgroundColor: Brand.card, transform: [{ rotate: '45deg' }],
  },
});
