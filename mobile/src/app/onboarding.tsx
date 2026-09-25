import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius, Space } from '@/constants/brand';
import { ONBOARDING_PAGES } from '@/data/onboarding';
import { useAppState } from '@/lib/app-state';

/** First-launch intro: 3 pages you swipe through, then "Terminer" goes to sign-in. */
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
    router.replace('/sign-in');
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
        {ONBOARDING_PAGES.map((item) => (
          <View key={item.title} style={[styles.page, { width }]}>
            <View style={styles.iconCircle}>
              <SymbolView name={item.icon as never} size={64} tintColor={Brand.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  top: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Space.lg },
  skip: { color: Brand.textSecondary, fontSize: 16, fontWeight: '600' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Space.xl, gap: Space.lg },
  iconCircle: {
    width: 140, height: 140, borderRadius: Radius.full, backgroundColor: Brand.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: Space.md,
  },
  title: { fontSize: 28, fontWeight: '700', color: Brand.navy, textAlign: 'center', lineHeight: 34 },
  text: { fontSize: 16, color: Brand.textSecondary, textAlign: 'center', lineHeight: 24 },
  bottom: { padding: Space.lg, gap: Space.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Space.sm },
  dot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: Brand.border },
  dotActive: { width: 24, backgroundColor: Brand.primary },
  button: { backgroundColor: Brand.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
