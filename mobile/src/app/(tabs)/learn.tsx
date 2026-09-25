import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Space } from '@/constants/brand';
import { UNITS } from '@/data/lessons';
import { usePortfolio } from '@/lib/portfolio';
import { computeStreak, dayKey, useProgress } from '@/lib/progress';

/** Academy path, Duolingo style: finishing a lesson unlocks the next one. */
export default function LearnScreen() {
  const progress = useProgress();
  const { transactions } = usePortfolio();

  // Streak = consecutive days with a finished lesson OR a trade
  const days = new Set([...progress.activeDays, ...transactions.map((t) => dayKey(new Date(t.date)))]);
  const streak = computeStreak(days);

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text style={styles.title}>Apprendre</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{progress.totalXp}</Text>
          <Text style={styles.statLabel}>⭐ XP</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>🔥 jour{streak > 1 ? 's' : ''} d'affilée</Text>
        </View>
      </View>

      {UNITS.map((unit, unitIndex) => (
        <View key={unit.id} style={styles.unit}>
          <Text style={styles.unitKicker}>Unité {unitIndex + 1}</Text>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          {unit.lessons.map((lesson) => {
            const result = progress.completed[lesson.id];
            const unlocked = progress.isUnlocked(lesson.id);
            const isNext = lesson.id === progress.nextLessonId;
            return (
              <Pressable
                key={lesson.id}
                disabled={!unlocked}
                onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
                style={({ pressed }) => [
                  styles.lesson,
                  result ? styles.lessonDone : isNext ? styles.lessonNext : styles.lessonLocked,
                  pressed && { opacity: 0.7 },
                ]}>
                <Text style={styles.lessonIcon}>{result ? '✅' : unlocked ? '▶️' : '🔒'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>{lesson.title}</Text>
                  <Text style={styles.lessonMeta}>
                    {result
                      ? `${result.score}/${lesson.questions.length} · +${result.xp} XP · touche pour rejouer`
                      : `${lesson.minutes} min · +${lesson.xp} XP`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 120, gap: Space.md },
  title: { fontSize: 32, fontWeight: '700', color: Brand.navy, marginTop: Space.md },
  stats: { flexDirection: 'row', gap: Space.md },
  stat: { flex: 1, backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Space.md, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: Brand.navy },
  statLabel: { fontSize: 13, color: Brand.textSecondary, marginTop: 2 },
  unit: { gap: Space.sm, marginTop: Space.sm },
  unitKicker: { color: Brand.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  unitTitle: { color: Brand.navy, fontSize: 20, fontWeight: '700', marginBottom: Space.xs },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md, borderRadius: Radius.md, borderWidth: 2, borderBottomWidth: 4 },
  lessonNext: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  lessonDone: { borderColor: '#B7E9CF', backgroundColor: '#F2FBF6' },
  lessonLocked: { borderColor: Brand.border, backgroundColor: Brand.background },
  lessonIcon: { fontSize: 22 },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: Brand.navy },
  lockedText: { color: Brand.textSecondary },
  lessonMeta: { fontSize: 13, color: Brand.textSecondary, marginTop: 2 },
});
