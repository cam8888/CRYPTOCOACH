import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Space } from '@/constants/brand';
import { UNITS } from '@/data/lessons';

/**
 * Academy path, Duolingo style: one lesson unlocks the next.
 * For now only the first lesson is open; progress will come from Supabase.
 */
export default function LearnScreen() {
  const firstLessonId = UNITS[0].lessons[0].id;

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text style={styles.title}>Apprendre</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>⭐ XP</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>🔥 jours</Text>
        </View>
      </View>

      {UNITS.map((unit, unitIndex) => (
        <View key={unit.id} style={styles.unit}>
          <Text style={styles.unitKicker}>Unité {unitIndex + 1}</Text>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          {unit.lessons.map((lesson) => {
            const open = lesson.id === firstLessonId;
            return (
              <View key={lesson.id} style={[styles.lesson, open ? styles.lessonOpen : styles.lessonLocked]}>
                <Text style={styles.lessonIcon}>{open ? '▶️' : '🔒'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lessonTitle, !open && styles.lockedText]}>{lesson.title}</Text>
                  <Text style={styles.lessonXp}>+{lesson.xp} XP</Text>
                </View>
              </View>
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
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 2,
  },
  lessonOpen: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  lessonLocked: { borderColor: Brand.border, backgroundColor: Brand.background },
  lessonIcon: { fontSize: 22 },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: Brand.navy },
  lockedText: { color: Brand.textSecondary },
  lessonXp: { fontSize: 13, color: Brand.xp, fontWeight: '700', marginTop: 2 },
});
