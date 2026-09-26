import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fox, FOX_RATIO } from '@/components/fox';
import { Brand, Radius, Space, Font } from '@/constants/brand';
import { ONBOARDING_PAGES, OnboardingPage } from '@/data/onboarding';
import { useAppState } from '@/lib/app-state';
import { vibrate } from '@/lib/haptics';

/**
 * Intro shown right after signing up: 3 pages you swipe through, then "Terminer" opens the app.
 * On each page the fox gives the explanation, from a different spot:
 * peeking from the side, rising from the bottom, then standing in full.
 */
export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAppState();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const isLast = page === ONBOARDING_PAGES.length - 1;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function finish() {
    completeOnboarding();
    router.replace('/');
  }

  function next() {
    if (isLast) {
      finish();
    } else {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>Passer</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}>
        {ONBOARDING_PAGES.map((item, i) => (
          <IntroPage key={item.title} item={item} width={width} active={i === page} />
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {ONBOARDING_PAGES.map((item, i) => (
            <View key={item.title} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <Pressable onPress={next} style={({ pressed }) => [styles.button, pressed && { backgroundColor: Brand.primaryDark }]}>
          <Text style={styles.buttonText}>{isLast ? 'Terminer' : 'Suivant'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/** One intro page: the fox's speech bubble, and the fox itself in its pose. */
function IntroPage({ item, width, active }: { item: OnboardingPage; width: number; active: boolean }) {
  const enter = useRef(new Animated.Value(0)).current;

  // The fox pops in each time its page becomes visible
  useEffect(() => {
    if (!active) return;
    enter.setValue(0);
    Animated.spring(enter, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }).start();
    vibrate.tap();
  }, [active, enter]);

  const foxSize = width * 0.62;
  const foxHeight = foxSize * FOX_RATIO;

  let foxStyle;
  if (item.pose === 'side') {
    // Peeking from the right edge: only the head and paws are visible
    foxStyle = {
      position: 'absolute' as const,
      right: -foxSize * 0.42,
      bottom: Space.lg,
      transform: [
        { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [foxSize, 0] }) },
        { rotate: '-22deg' },
      ],
    };
  } else if (item.pose === 'bottom') {
    // Rising from the bottom of the screen
    foxStyle = {
      position: 'absolute' as const,
      bottom: -foxHeight * 0.38,
      alignSelf: 'center' as const,
      transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [foxHeight, 0] }) }],
    };
  } else {
    // Standing in full, in the middle
    foxStyle = {
      alignSelf: 'center' as const,
      marginTop: Space.lg,
      transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
      opacity: enter,
    };
  }

  const bubble = (
    <View
      style={[
        styles.bubble,
        item.pose === 'side' && { marginRight: width * 0.18 },
      ]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
      <View
        style={[
          styles.tail,
          item.pose === 'side' && { right: -9, bottom: 40, borderLeftWidth: 0, borderBottomWidth: 0, borderTopWidth: 1, borderRightWidth: 1 },
          item.pose === 'bottom' && { bottom: -10, alignSelf: 'center' },
          item.pose === 'full' && { top: -10, alignSelf: 'center', borderRightWidth: 0, borderBottomWidth: 0, borderLeftWidth: 1, borderTopWidth: 1 },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.page, { width }]}>
      {/* Side and bottom poses are drawn first, so the speech bubble stays on top */}
      {item.pose !== 'full' && (
        <Animated.View style={foxStyle}>
          {item.pose === 'side' ? (
            // Peeking from the edge: looks left at its bubble and points to it
            <Fox size={foxSize} mode={active ? 'talk' : 'idle'} pose={{ lookX: -1, lookY: -0.4, armL: 105 }} />
          ) : (
            // Rising from the bottom: looks up at its bubble and waves
            <Fox size={foxSize} mode={active ? 'wave' : 'idle'} pose={{ lookY: -1, lookX: 0.2 }} />
          )}
        </Animated.View>
      )}
      {item.pose === 'full' && (
        <Animated.View style={foxStyle}>
          {/* Standing under its bubble: looks up and raises a paw towards it */}
          <Fox size={foxSize * 0.62} mode={active ? 'talk' : 'idle'} pose={{ lookY: -1, lookX: -0.3, armL: 145 }} />
        </Animated.View>
      )}
      {bubble}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  top: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Space.lg },
  skip: { color: Brand.textSecondary, fontSize: 16, fontFamily: Font.semibold },
  page: { flex: 1, paddingHorizontal: Space.lg, paddingTop: Space.md, overflow: 'hidden', gap: Space.lg },
  bubble: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.sm,
    borderWidth: 1,
    borderColor: Brand.border,
    boxShadow: '0 6px 16px rgba(11,16,51,0.12)',
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    width: 20,
    height: 20,
    backgroundColor: Brand.card,
    borderColor: Brand.border,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
  title: { fontSize: 24, fontFamily: Font.extrabold, color: Brand.navy, lineHeight: 30 },
  text: { fontSize: 16, fontFamily: Font.regular, color: Brand.textSecondary, lineHeight: 24 },
  bottom: { padding: Space.lg, gap: Space.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Space.sm },
  dot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: Brand.border },
  dotActive: { width: 24, backgroundColor: Brand.primary },
  button: { backgroundColor: Brand.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontFamily: Font.bold },
});
