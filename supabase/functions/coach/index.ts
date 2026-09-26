// Supabase Edge Function "coach": the AI coach of CryptoCoach.
// The app sends the conversation + a short summary of the (virtual) portfolio.
// This function adds the coach's rules and asks Google Gemini for an answer.
// The Gemini API key stays here, on the server: it is never inside the app.
// withSupabase only lets through requests that carry the project's publishable key.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const MODEL = "gemini-flash-lite-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `Tu es le Coach de CryptoCoach, une app pour apprendre la crypto avec de l'argent fictif (10 000 $ au départ).
Tu parles français et tu tutoies. Ton ton : un pote bienveillant qui explique simplement, sans jargon.

Règles :
- Réponds court : 120 mots maximum, phrases simples, un exemple concret quand ça aide.
- Tu expliques des notions (blockchain, DCA, volatilité, prix moyen, sécurité, arnaques…).
- Tu ne donnes JAMAIS de conseil d'investissement personnalisé : pas de « achète X », pas de prédiction de prix. Si on te le demande, explique plutôt comment réfléchir et quels risques regarder.
- Si l'utilisateur parle de son portefeuille, appuie-toi sur le résumé fourni, et rappelle si utile qu'il est fictif.
- Si la question n'a rien à voir avec la crypto, la finance ou l'app, ramène gentiment la conversation.
- Pas de titres ni de mise en forme lourde. Une courte liste à puces au maximum.`;

type Message = { role: "user" | "coach"; text: string };

async function handle(req: Request): Promise<Response> {
  try {
    const { messages, portfolio } = (await req.json()) as { messages: Message[]; portfolio?: string };

    // Keep only the last 10 messages, each cut to 1 000 characters, to protect the free quota
    const recent = (messages ?? []).slice(-10).map((m) => ({
      role: m.role === "coach" ? "model" : "user",
      parts: [{ text: String(m.text).slice(0, 1000) }],
    }));

    const system = portfolio ? `${SYSTEM_PROMPT}\n\nRésumé du portefeuille fictif de l'utilisateur :\n${portfolio}` : SYSTEM_PROMPT;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": Deno.env.get("GEMINI_API_KEY") ?? "" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: recent,
        generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini error", response.status, detail);
      const busy = response.status === 429;
      return Response.json(
        { error: busy ? "Le coach a beaucoup parlé aujourd'hui, réessaie dans une minute." : "Le coach n'est pas dispo pour le moment." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const reply = (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
    return Response.json({ reply: reply || "Hmm, je n'ai pas de réponse, tu peux reformuler ?" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, (req) => handle(req)),
};
