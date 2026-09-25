import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius, Space } from '@/constants/brand';
import { ALL_LESSONS, PASS_RATIO } from '@/data/lessons';
import { useProgress } from '@/lib/progress';

type Step = 'cards' | 'quiz' | 'done';

/**
 * A lesson, Duolingo style: short cards one by one, then a quiz.
 * Pick an answer, tap "Vérifier", see if you were right and why, then "Continuer".
 */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = ALL_LESSONS.find((l) => l.id === id) ?? ALL_LESSONS[0];
  const { saveResult } = useProgress();

  const [step, setStep] = useState<Step>('cards');
  const [cardIndex, setCardIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const totalSteps = lesson.cards.length + lesson.questions.length;
  const doneSteps = step === 'cards' ? cardIndex + 1 : step === 'quiz' ? lesson.cards.length + questionIndex + (checked ? 1 : 0) : totalSteps;
  const question = lesson.questions[questionIndex];
  const isRight = selected === question?.answer;

  const passed = correctCount >= PASS_RATIO * lesson.questions.length;
  const earnedXp = Math.round((lesson.xp * correctCount) / lesson.questions.length);

  function nextCard() {
    if (cardIndex + 1 < lesson.cards.length) setCardIndex(cardIndex + 1);
    else setStep('quiz');
  }

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (isRight) setCorrectCount(correctCount + 1);
  }

  function nextQuestion() {
    if (questionIndex + 1 < lesson.questions.length) {
      setQuestionIndex(questionIndex + 1);
      setSelected(null);
      setChecked(false);
    } else {
      const finalScore = correctCount;
      if (finalScore >= PASS_RATIO * lesson.questions.length) {
        saveResult(lesson.id, finalScore, Math.round((lesson.xp * finalScore) / lesson.questions.length));
      }
      setStep('done');
    }
  }

  function restart() {
    setStep('cards');
    setCardIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top bar: close button + progress */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(doneSteps / totalSteps) * 100}%` }]} />
        </View>
      </View>

      {step === 'cards' && (
        <>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.kicker}>{lesson.title}</Text>
            <Text style={styles.cardText}>{lesson.cards[cardIndex]}</Text>
          </ScrollView>
          <View style={styles.footer}>
            <PrimaryButton label={cardIndex + 1 < lesson.cards.length ? 'Continuer' : 'Place au quiz !'} onPress={nextCard} />
          </View>
        </>
      )}

      {step === 'quiz' && question && (
        <>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.kicker}>Question {questionIndex + 1} sur {lesson.questions.length}</Text>
            <Text style={styles.question}>{question.question}</Text>
            <View style={styles.choices}>
              {question.choices.map((choice, i) => {
                const isSelected = selected === i;
                const showRight = checked && i === question.answer;
                const showWrong = checked && isSelected && !isRight;
                return (
                  <Pressable
                    key={choice}
                    disabled={checked}
                    onPress={() => setSelected(i)}
                    style={[
                      styles.choice,
                      isSelected && styles.choiceSelected,
                      showRight && styles.choiceRight,
                      showWrong && styles.choiceWrong,
                    ]}>
                    <Text style={[styles.choiceText, isSelected && { color: Brand.primary }, showRight && { color: Brand.success }, showWrong && { color: Brand.danger }]}>
                      {choice}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {checked ? (
            <View style={[styles.feedback, isRight ? styles.feedbackRight : styles.feedbackWrong]}>
              <Text style={[styles.feedbackTitle, { color: isRight ? Brand.success : Brand.danger }]}>
                {isRight ? 'Bien joué !' : 'Pas tout à fait…'}
              </Text>
              <Text style={styles.feedbackText}>
                {!isRight && `La bonne réponse : ${question.choices[question.answer]}. `}
                {question.explanation}
              </Text>
              <PrimaryButton label="Continuer" onPress={nextQuestion} color={isRight ? Brand.success : Brand.danger} />
            </View>
          ) : (
            <View style={styles.footer}>
              <PrimaryButton label="Vérifier" onPress={check} disabled={selected === null} />
            </View>
          )}
        </>
      )}

      {step === 'done' && (
        <>
          <View style={styles.doneBody}>
            <Text style={styles.doneEmoji}>{passed ? '🎉' : '💪'}</Text>
            <Text style={styles.doneTitle}>{passed ? 'Leçon terminée !' : 'Presque !'}</Text>
            <Text style={styles.doneText}>
              {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {lesson.questions.length}
            </Text>
            {passed ? (
              <View style={styles.xpPill}>
                <Text style={styles.xpText}>+{earnedXp} XP</Text>
              </View>
            ) : (
              <Text style={styles.doneHint}>
                Il faut {Math.ceil(PASS_RATIO * lesson.questions.length)} bonnes réponses pour débloquer la suite. Tu y es presque, retente ta chance !
              </Text>
            )}
          </View>
          <View style={styles.footer}>
            {passed ? (
              <PrimaryButton label="Continuer" onPress={() => router.back()} />
            ) : (
              <>
                <PrimaryButton label="Réessayer" onPress={restart} />
                <Pressable onPress={() => router.back()} style={styles.secondary}>
                  <Text style={styles.secondaryText}>Plus tard</Text>
                </Pressable>
              </>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress, disabled, color = Brand.primary }: { label: string; onPress: () => void; disabled?: boolean; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, { backgroundColor: color }, disabled && { opacity: 0.35 }, pressed && { opacity: 0.85 }]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.lg, paddingTop: Space.sm },
  close: { fontSize: 22, color: Brand.textSecondary, fontWeight: '600' },
  track: { flex: 1, height: 12, backgroundColor: Brand.surface, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Brand.primary, borderRadius: Radius.full },
  body: { padding: Space.lg, paddingTop: Space.xl, gap: Space.lg },
  kicker: { color: Brand.primary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  cardText: { color: Brand.navy, fontSize: 24, fontWeight: '600', lineHeight: 34 },
  question: { color: Brand.navy, fontSize: 24, fontWeight: '700', lineHeight: 32 },
  choices: { gap: Space.md },
  choice: {
    borderWidth: 2, borderColor: Brand.border, borderBottomWidth: 4, borderRadius: Radius.md,
    paddingVertical: Space.md, paddingHorizontal: Space.md, backgroundColor: Brand.background,
  },
  choiceSelected: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  choiceRight: { borderColor: Brand.success, backgroundColor: '#E7F8EF' },
  choiceWrong: { borderColor: Brand.danger, backgroundColor: '#FDECEA' },
  choiceText: { color: Brand.navy, fontSize: 17, fontWeight: '600' },
  footer: { padding: Space.lg, gap: Space.sm },
  feedback: { padding: Space.lg, gap: Space.sm, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  feedbackRight: { backgroundColor: '#E7F8EF' },
  feedbackWrong: { backgroundColor: '#FDECEA' },
  feedbackTitle: { fontSize: 20, fontWeight: '800' },
  feedbackText: { color: Brand.navy, fontSize: 15, lineHeight: 22, marginBottom: Space.sm },
  button: { borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  secondary: { alignItems: 'center', padding: Space.sm },
  secondaryText: { color: Brand.textSecondary, fontSize: 15, fontWeight: '600' },
  doneBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Space.xl, gap: Space.md },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 30, fontWeight: '800', color: Brand.navy },
  doneText: { fontSize: 17, color: Brand.textSecondary },
  doneHint: { fontSize: 15, color: Brand.textSecondary, textAlign: 'center', lineHeight: 22 },
  xpPill: { backgroundColor: '#FFF4DB', borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 20 },
  xpText: { color: '#B54708', fontSize: 20, fontWeight: '800' },
});
