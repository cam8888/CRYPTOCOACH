import { useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoxAvatar } from '@/components/fox';
import { Brand, Radius, Space, Font } from '@/constants/brand';
import { usePrices } from '@/hooks/use-prices';
import { askCoach, ChatMessage, isCoachConfigured } from '@/lib/coach-ai';
import { COINS } from '@/lib/coingecko';
import { formatUsd } from '@/lib/format';
import { averageCost, usePortfolio } from '@/lib/portfolio';

const SUGGESTIONS = [
  'Explique-moi mon portefeuille',
  "C'est quoi le staking ?",
  'Pourquoi le Bitcoin bouge autant ?',
  'Comment repérer une arnaque ?',
];

const WELCOME: ChatMessage = {
  role: 'coach',
  text: "Salut ! Moi c'est le renard, ton coach. Pose-moi n'importe quelle question sur la crypto ou sur ton portefeuille, je t'explique simplement. (Je ne donne pas de conseils d'achat, mais je t'aide à comprendre.)",
};

/** AI coach chat, powered by Gemini through a Supabase Edge Function. */
export default function CoachScreen() {
  const portfolio = usePortfolio();
  const { prices } = usePrices();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  /** Short text summary of the virtual portfolio sent to the coach (no name, no email). */
  function portfolioSummary(): string {
    const lines = [`Cash : ${formatUsd(portfolio.cash)}`];
    for (const coin of COINS) {
      const quantity = portfolio.holdings[coin.id] ?? 0;
      if (quantity <= 0) continue;
      const price = prices.find((p) => p.id === coin.id)?.price;
      const avg = averageCost(portfolio.transactions, coin.id);
      lines.push(
        `${coin.name} : ${quantity.toFixed(6)} ${coin.symbol}` +
          (price ? `, valeur ${formatUsd(quantity * price)}, prix actuel ${formatUsd(price)}` : '') +
          (avg ? `, prix moyen payé ${formatUsd(avg)}` : ''),
      );
    }
    lines.push(`Nombre de trades : ${portfolio.transactions.length}`);
    return lines.join('\n');
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;
    const history: ChatMessage[] = [...messages, { role: 'user', text: question }];
    setMessages(history);
    setInput('');
    setThinking(true);
    try {
      // The welcome message is not sent: the conversation starts with the user's question
      const reply = await askCoach(history.slice(1), portfolioSummary());
      setMessages([...history, { role: 'coach', text: reply }]);
    } catch (error) {
      setMessages([...history, { role: 'coach', text: `Oups : ${(error as Error).message}` }]);
    } finally {
      setThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <FoxAvatar size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Coach</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerSub}>Le renard · répond en quelques secondes</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {!isCoachConfigured() && (
            <Text style={styles.warning}>Le coach n'est pas encore branché (il manque le fichier .env.local).</Text>
          )}
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <View key={i} style={[styles.bubble, styles.userBubble]}>
                <Text style={[styles.bubbleText, { color: '#FFFFFF' }]}>{m.text}</Text>
              </View>
            ) : (
              <View key={i} style={styles.coachRow}>
                <FoxAvatar size={36} />
                <View style={[styles.bubble, styles.coachBubble]}>
                  <Text style={styles.bubbleText}>{m.text}</Text>
                </View>
              </View>
            ),
          )}
          {thinking && (
            <View style={styles.coachRow}>
              <FoxAvatar size={36} />
              <View style={[styles.bubble, styles.coachBubble, { flexDirection: 'row', gap: Space.sm }]}>
                <ActivityIndicator color={Brand.primary} />
                <Text style={styles.bubbleText}>Le renard réfléchit…</Text>
              </View>
            </View>
          )}
          {messages.length === 1 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestTitle}>Pour commencer</Text>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={styles.suggestion}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Pose ta question…"
            placeholderTextColor={Brand.textSecondary}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || thinking}
            style={[styles.send, (!input.trim() || thinking) && { opacity: 0.4 }]}>
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.lg, paddingTop: Space.md, paddingBottom: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Brand.border,
  },
  title: { fontSize: 28, letterSpacing: -0.6, fontFamily: Font.extrabold, color: Brand.navy },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.success },
  headerSub: { fontSize: 13, fontFamily: Font.medium, color: Brand.textSecondary },
  suggestTitle: { fontSize: 12, fontFamily: Font.bold, color: Brand.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  coachRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Space.sm, maxWidth: '92%' },
  messages: { padding: Space.lg, gap: Space.sm },
  warning: { color: Brand.danger, fontSize: 14 , fontFamily: Font.regular},
  bubble: { maxWidth: '85%', borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  coachBubble: { alignSelf: 'flex-start', backgroundColor: Brand.card, borderBottomLeftRadius: 4, flexShrink: 1, maxWidth: '100%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Brand.primary, borderBottomRightRadius: 4 },
  bubbleText: { color: Brand.navy, fontSize: 15, fontFamily: Font.regular, lineHeight: 22 },
  suggestions: { gap: Space.sm, marginTop: Space.sm },
  suggestion: { alignSelf: 'flex-start', backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border, borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 14 },
  suggestionText: { color: Brand.navy, fontSize: 14, fontFamily: Font.medium },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Space.sm, padding: Space.md, paddingBottom: 100,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Brand.border,
  },
  input: {
    flex: 1, maxHeight: 120, backgroundColor: Brand.card, borderRadius: Radius.lg,
    paddingHorizontal: Space.md, paddingVertical: 10, fontSize: 16, fontFamily: Font.regular, color: Brand.navy,
  },
  send: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#FFFFFF', fontSize: 22, fontFamily: Font.extrabold },
});
