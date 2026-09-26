import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Fox, FOX_RATIO } from '@/components/fox';
import { Brand, Font } from '@/constants/brand';
import { vibrate } from '@/lib/haptics';

const FOX_SIZE = 130;

/**
 * Opening animation, every time the app starts: on an indigo background,
 * the fox walks in on its little legs, eyes on its phone… and bumps into a lamppost. Then the name appears.
 */
export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(true);
  const [hit, setHit] = useState(false); // after the bump: stops walking, eyes shut, then looks at the post
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const walk = useRef(new Animated.Value(0)).current;   // 0 → 1: from off-screen to the post
  const step = useRef(new Animated.Value(0)).current;   // walking bounce
  const bump = useRef(new Animated.Value(0)).current;   // 0 → 1: the knock-back
  const stars = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  const postX = width * 0.68;
  const stopX = postX - FOX_SIZE + 12;

  useEffect(() => {
    const stepping = Animated.loop(
      Animated.sequence([
        Animated.timing(step, { toValue: 1, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(step, { toValue: 0, duration: 170, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    stepping.start();

    Animated.sequence([
      Animated.timing(walk, { toValue: 1, duration: 1300, easing: Easing.linear, useNativeDriver: true }),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bump, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(bump, { toValue: 0.55, friction: 4, useNativeDriver: true }),
        ]),
        Animated.timing(stars, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.timing(title, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      doneRef.current();
    });

    // Stop walking and vibrate exactly when the fox hits the post
    const hit = setTimeout(() => {
      stepping.stop();
      step.setValue(0);
      vibrate.bump();
      setHit(true);
    }, 1300);
    return () => {
      clearTimeout(hit);
      stepping.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const translateX = Animated.add(
    walk.interpolate({ inputRange: [0, 1], outputRange: [-FOX_SIZE - 20, stopX] }),
    bump.interpolate({ inputRange: [0, 1], outputRange: [0, -34] }),
  );
  const translateY = step.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const rotate = bump.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-14deg'] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, { opacity: fade }]} pointerEvents="none">
      <Animated.Text style={[styles.title, { opacity: title, top: height * 0.22 }]}>CryptoCoach</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: title, top: height * 0.22 + 50 }]}>
        Regarde où tu mets les pieds… et ton argent 😉
      </Animated.Text>

      {/* The lamppost */}
      <View style={[styles.post, { left: postX, top: height * 0.4, height: height * 0.15 + FOX_SIZE * FOX_RATIO }]}>
        <View style={styles.lamp} />
      </View>

      {/* Dizzy stars after the bump */}
      <Animated.Text
        style={[
          styles.stars,
          { left: stopX + 10, top: height * 0.55 - 30, opacity: stars, transform: [{ scale: stars }] },
        ]}>
        💫
      </Animated.Text>

      {/* The fox, walking while looking at its phone */}
      <Animated.View style={{ position: 'absolute', top: height * 0.55, transform: [{ translateX }, { translateY }, { rotate }] }}>
        <Fox
          size={FOX_SIZE}
          mode={hit ? 'idle' : 'walk'}
          pose={hit ? { phone: true, armL: -22, armR: 22, blink: true, mouth: 'open', lookX: 1 } : { phone: true, armL: -22, armR: 22, lookY: 1 }}
        />
      </Animated.View>

      <View style={[styles.ground, { top: height * 0.55 + FOX_SIZE * FOX_RATIO }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Brand.primary, zIndex: 100 },
  title: { position: 'absolute', alignSelf: 'center', color: '#FFFFFF', fontSize: 40, letterSpacing: -0.5, fontFamily: Font.black },
  subtitle: { position: 'absolute', alignSelf: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 15, fontFamily: Font.semibold },
  post: { position: 'absolute', width: 14, backgroundColor: '#9AA3B5', borderRadius: 7 },
  lamp: {
    position: 'absolute', top: -18, left: -26, width: 66, height: 26,
    backgroundColor: '#FFD166', borderTopLeftRadius: 33, borderTopRightRadius: 33,
  },
  stars: { position: 'absolute', fontSize: 34 , fontFamily: Font.regular},
  ground: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
});
