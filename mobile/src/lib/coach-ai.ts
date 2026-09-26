/**
 * Talks to the "coach" Supabase Edge Function, which asks Google Gemini.
 * The app only knows the public Supabase URL and publishable key (safe to ship);
 * the Gemini key stays on the server.
 */
export type ChatMessage = { role: 'user' | 'coach'; text: string };

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export function isCoachConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

export async function askCoach(messages: ChatMessage[], portfolio: string): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY ?? '',
    },
    body: JSON.stringify({ messages, portfolio }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.reply) {
    throw new Error(data.error ?? "Le coach n'est pas joignable pour le moment.");
  }
  return data.reply;
}
