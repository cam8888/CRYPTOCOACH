import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Celebration } from '@/components/celebration';
import { Fox, FoxTip } from '@/components/fox';
import { Brand, Radius, Space, Font } from '@/constants/brand';
import { ALL_LESSONS, cashReward, passRatio } from '@/data/lessons';
import { formatUsd } from '@/lib/format';
import { vibrate } from '@/lib/haptics';
import { usePortfolio } from '@/lib/portfolio';
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
  const { addReward, isRemote, reload } = usePortfolio();
  const ratio = passRatio(lesson);
  const hasCards = lesson.cards.length > 0;
  const [rewarded, setRewarded] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const [step, setStep] = useState<Step>(lesson.cards.length > 0 ? 'cards' : 'quiz');
  const [cardIndex, setCardIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const totalSteps = lesson.cards.length + lesson.questions.length;
  const doneSteps = step === 'cards' ? cardIndex + 1 : step === 'quiz' ? lesson.cards.length + questionIndex + (checked ? 1 : 0) : totalSteps;
  const question = lesson.questions[questionIndex];
  const isRight = selected === question?.answer;

  const passed = correctCount >= ratio * lesson.questions.length;
  const earnedXp = Math.round((lesson.xp * correctCount) / lesson.questions.length);

  // The fox "talks": the phone vibrates each time it shows a new explanation
  useEffect(() => {
    if (step === 'cards') vibrate.lesson();
  }, [step, cardIndex]);

  function nextCard() {
    if (cardIndex + 1 < lesson.cards.length) setCardIndex(cardIndex + 1);
    else setStep('quiz');
  }

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (isRight) {
      setCorrectCount(correctCount + 1);
      vibrate.tap();
    } else {
      vibrate.error();
    }
  }

  async function nextQuestion() {
    if (questionIndex + 1 < lesson.questions.length) {
      setQuestionIndex(questionIndex + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    setStep('done');
    const finalScore = correctCount;
    if (finalScore < ratio * lesson.questions.length) return;
    try {
      const reward = cashReward(lesson);
      const firstTime = await saveResult(lesson.id, finalScore, Math.round((lesson.xp * finalScore) / lesson.questions.length), reward);
      // Cash reward only the first time, so replaying a lesson can't be used to farm money
      if (firstTime) {
        if (isRemote) await reload(); // the server already added the reward
        else addReward(reward);
        setRewarded(reward);
        setCelebrate(true);
      }
    } catch {
      Alert.alert('Oups', "Ta progression n'a pas pu être sauvegardée. Vérifie ta connexion et refais la leçon.");
    }
  }

  function restart() {
    setStep(hasCards ? 'cards' : 'quiz');
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
            <View style={styles.lessonBubble}>
              <Text style={styles.cardText}>{lesson.cards[cardIndex]}</Text>
              <View style={styles.bubbleTail} />
            </View>
            <View style={styles.teacher}>
              <Fox key={cardIndex} size={150} talking />
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <PrimaryButton label={cardIndex + 1 < lesson.cards.length ? 'Continuer' : 'Place au quiz !'} onPress={nextCard} />
          </View>
        </>
      )}

      {step === 'quiz' && question && (
        <>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.kicker}>
              {lesson.kind === 'exam' ? '🏆 Défi · ' : ''}Question {questionIndex + 1} sur {lesson.questions.length}
            </Text>
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
              <FoxTip
                tone={isRight ? 'good' : 'bad'}
                title={isRight ? 'Bien joué !' : 'Pas tout à fait…'}
                text={`${!isRight ? `La bonne réponse : ${question.choices[question.answer]}. ` : ''}${question.explanation}`}
              />
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
            <Fox size={130} talking={passed} />
            <Text style={styles.doneTitle}>{passed ? (lesson.kind === 'exam' ? 'Défi réussi ! 🏆' : 'Leçon terminée !') : 'Presque !'}</Text>
            <Text style={styles.doneText}>
              {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {lesson.questions.length}
            </Text>
            {passed ? (
              <>
                <View style={styles.xpPill}>
                  <Text style={styles.xpText}>+{earnedXp} XP</Text>
                </View>
                {rewarded > 0 && (
                  <View style={styles.cashPill}>
                    <Text style={styles.cashText}>+{formatUsd(rewarded)} ajoutés à ton portefeuille 💸</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.doneHint}>
                Il faut {Math.ceil(ratio * lesson.questions.length)} bonnes réponses pour débloquer la suite. Tu y es presque, retente ta chance !
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
      <Celebration
        visible={celebrate}
        title={lesson.kind === 'exam' ? 'Défi réussi !' : 'Leçon réussie !'}
        amount={`+${formatUsd(rewarded)}`}
        message="Bravo ! Cet argent fictif est pour toi. Va le faire fructifier dans « Trader » 🦊"
        onClose={() => setCelebrate(false)}
      />
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
  close: { fontSize: 22, color: Brand.textSecondary, fontFamily: Font.semibold },
  track: { flex: 1, height: 12, backgroundColor: Brand.surface, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Brand.primary, borderRadius: Radius.full },
  body: { padding: Space.lg, paddingTop: Space.xl, gap: Space.lg },
  kicker: { color: Brand.primary, fontSize: 14, fontFamily: Font.bold, textTransform: 'uppercase' },
  cardText: { color: Brand.navy, fontSize: 20, fontFamily: Font.semibold, lineHeight: 29 },
  lessonBubble: {
    backgroundColor: Brand.card, borderRadius: Radius.lg, padding: Space.lg,
    borderWidth: 1, borderColor: Brand.border,
  },
  bubbleTail: {
    position: 'absolute', bottom: -10, left: 60, width: 20, height: 20, backgroundColor: Brand.card,
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: Brand.border, transform: [{ rotate: '45deg' }],
  },
  teacher: { alignItems: 'flex-start', paddingLeft: Space.md },
  question: { color: Brand.navy, fontSize: 24, fontFamily: Font.bold, lineHeight: 32 },
  choices: { gap: Space.md },
  choice: {
    borderWidth: 2, borderColor: Brand.border, borderBottomWidth: 4, borderRadius: Radius.md,
    paddingVertical: Space.md, paddingHorizontal: Space.md, backgroundColor: Brand.card,
  },
  choiceSelected: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  choiceRight: { borderColor: Brand.success, backgroundColor: '#E7F8EF' },
  choiceWrong: { borderColor: Brand.danger, backgroundColor: '#FDECEA' },
  choiceText: { color: Brand.navy, fontSize: 17, fontFamily: Font.semibold },
  footer: { padding: Space.lg, gap: Space.sm },
  feedback: { padding: Space.lg, gap: Space.sm, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  feedbackRight: { backgroundColor: '#CDEBDB' },
  feedbackWrong: { backgroundColor: '#F3D2CF' },
  feedbackTitle: { fontSize: 20, fontFamily: Font.extrabold },
  feedbackText: { color: Brand.navy, fontSize: 15, fontFamily: Font.regular, lineHeight: 22, marginBottom: Space.sm },
  button: { borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontFamily: Font.extrabold },
  secondary: { alignItems: 'center', padding: Space.sm },
  secondaryText: { color: Brand.textSecondary, fontSize: 15, fontFamily: Font.semibold },
  doneBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Space.xl, gap: Space.md },
  doneEmoji: { fontSize: 64, letterSpacing: -0.5 , fontFamily: Font.regular},
  doneTitle: { fontSize: 30, letterSpacing: -0.5, fontFamily: Font.extrabold, color: Brand.navy },
  doneText: { fontSize: 17, fontFamily: Font.regular, color: Brand.textSecondary },
  doneHint: { fontSize: 15, fontFamily: Font.regular, color: Brand.textSecondary, textAlign: 'center', lineHeight: 22 },
  xpPill: { backgroundColor: '#FFF4DB', borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 20 },
  xpText: { color: '#B54708', fontSize: 20, fontFamily: Font.extrabold },
  cashPill: { backgroundColor: '#E7F8EF', borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 20 },
  cashText: { color: Brand.success, fontSize: 16, fontFamily: Font.extrabold },
});
