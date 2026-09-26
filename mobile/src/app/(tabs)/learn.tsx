import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Brand, Radius, Space, Font } from '@/constants/brand';
import { cashReward, UNITS } from '@/data/lessons';
import { formatUsd } from '@/lib/format';
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
      <Text style={styles.subtitle}>Quelques minutes par jour, et chaque leçon réussie te rapporte du cash virtuel.</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Expérience</Text>
          <Text style={styles.statValue}>{progress.totalXp} <Text style={styles.statUnit}>XP</Text></Text>
        </View>
        <View style={styles.statSplit} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Série en cours</Text>
          <Text style={styles.statValue}>{streak} <Text style={styles.statUnit}>jour{streak > 1 ? 's' : ''}</Text></Text>
        </View>
      </View>

      {UNITS.map((unit, unitIndex) => {
        const doneCount = unit.lessons.filter((l) => progress.completed[l.id]).length;
        return (
        <View key={unit.id} style={styles.unit}>
          <View style={styles.unitHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.unitKicker}>Unité {unitIndex + 1}</Text>
              <Text style={styles.unitTitle}>{unit.title}</Text>
            </View>
            <Text style={styles.unitCount}>{doneCount}/{unit.lessons.length}</Text>
          </View>
          <View style={styles.unitTrack}>
            <View style={[styles.unitFill, { width: `${(doneCount / unit.lessons.length) * 100}%` }]} />
          </View>
          {unit.lessons.map((lesson, lessonIndex) => {
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
                <LessonBadge
                  state={result ? 'done' : !unlocked ? 'locked' : isNext ? 'next' : 'open'}
                  label={lesson.kind === 'exam' ? '★' : String(lessonIndex + 1)}
                />
                <View style={{ flex: 1 }}>
                  {lesson.kind === 'exam' && <Text style={styles.examKicker}>Défi de fin d'unité</Text>}
                  <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>{lesson.title}</Text>
                  <Text style={styles.lessonMeta}>
                    {result
                      ? `${result.score}/${lesson.questions.length} · +${result.xp} XP · touche pour rejouer`
                      : `${lesson.minutes} min · +${lesson.xp} XP · +${formatUsd(cashReward(lesson))}`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        );
      })}
    </ScrollView>
  );
}

/** Round badge on the left of each lesson: its number, a check once done, a lock if not unlocked yet. */
function LessonBadge({ state, label }: { state: 'done' | 'next' | 'open' | 'locked'; label: string }) {
  const bg = state === 'done' ? Brand.success : state === 'next' ? Brand.primary : state === 'open' ? Brand.card : Brand.surface;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, state === 'locked' && { borderWidth: 1.5, borderColor: Brand.border }]}>
      {state === 'locked' ? (
        <Svg width={16} height={18} viewBox="0 0 16 18">
          <Path d="M4 8V5.5a4 4 0 0 1 8 0V8" stroke={Brand.textSecondary} strokeWidth={2} fill="none" />
          <Rect x={2} y={8} width={12} height={9} rx={2} fill={Brand.textSecondary} />
        </Svg>
      ) : (
        <Text style={[styles.badgeText, { color: state === 'open' ? Brand.primary : '#FFFFFF' }]}>{state === 'done' ? '✓' : label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 120, gap: Space.md },
  title: { fontSize: 32, letterSpacing: -0.5, fontFamily: Font.extrabold, color: Brand.navy, marginTop: Space.md },
  subtitle: { fontSize: 15, fontFamily: Font.regular, color: Brand.textSecondary, lineHeight: 21, marginTop: -Space.sm },
  stats: { flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.primary, borderRadius: Radius.lg, padding: Space.md, paddingVertical: Space.lg },
  stat: { flex: 1, paddingHorizontal: Space.sm },
  statSplit: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.25)' },
  statValue: { fontSize: 26, fontFamily: Font.extrabold, color: '#FFFFFF', letterSpacing: -0.5, marginTop: 4, fontVariant: ['tabular-nums'] },
  statUnit: { fontSize: 14, fontFamily: Font.semibold, color: 'rgba(255,255,255,0.75)', letterSpacing: 0 },
  statLabel: { fontSize: 12, fontFamily: Font.semibold, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.8 },
  unit: { gap: Space.sm, marginTop: Space.md },
  unitHeader: { flexDirection: 'row', alignItems: 'flex-end' },
  unitKicker: { color: Brand.primary, fontSize: 12, fontFamily: Font.bold, textTransform: 'uppercase', letterSpacing: 1 },
  unitTitle: { color: Brand.navy, fontSize: 20, fontFamily: Font.bold, letterSpacing: -0.3, marginTop: 2 },
  unitCount: { fontSize: 13, fontFamily: Font.semibold, color: Brand.textSecondary, fontVariant: ['tabular-nums'] },
  unitTrack: { height: 6, borderRadius: 3, backgroundColor: Brand.border, overflow: 'hidden', marginBottom: Space.xs },
  unitFill: { height: '100%', backgroundColor: Brand.success, borderRadius: 3 },
  badge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 16, fontFamily: Font.bold },
  examKicker: { fontSize: 11, fontFamily: Font.bold, color: Brand.xp, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md, borderRadius: Radius.md, borderWidth: 1.5, borderBottomWidth: 3 },
  lessonNext: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  lessonDone: { borderColor: '#B7E9CF', backgroundColor: '#F2FBF6' },
  lessonLocked: { borderColor: Brand.border, backgroundColor: Brand.background },
  lessonTitle: { fontSize: 16, fontFamily: Font.semibold, color: Brand.navy },
  lockedText: { color: Brand.textSecondary },
  lessonMeta: { fontSize: 13, fontFamily: Font.regular, color: Brand.textSecondary, marginTop: 2 },
});
