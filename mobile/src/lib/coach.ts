/**
 * Coach tips shown after each trade. Same rules as buy_feedback() and
 * sell_feedback() in the Streamlit version, rewritten in French.
 */
import { formatPercent, formatUsd } from '@/lib/format';

export type Feedback = { tone: 'good' | 'bad' | 'neutral'; message: string; tip: string };

export function buyFeedback(
  symbol: string, quantity: number, price: number, amountUsd: number,
  cashBefore: number, avgCostBefore: number | null,
): Feedback {
  const message = `Tu as acheté ${quantity.toFixed(5)} ${symbol} à ${formatUsd(price)}.`;
  let tip: string;
  if (amountUsd > 0.5 * cashBefore) {
    tip = "Tu viens de mettre plus de la moitié de ton cash d'un coup. En achetant en plusieurs fois (DCA), tu évites de tout acheter juste avant une baisse.";
  } else if (avgCostBefore !== null && price < avgCostBefore) {
    tip = `Tu as acheté sous ton prix moyen (${formatUsd(avgCostBefore)}), donc tu le fais baisser. Fais-le seulement si tu crois toujours au projet, pas juste pour « te refaire ».`;
  } else if (avgCostBefore !== null) {
    tip = "Tu en avais déjà : tu mets de plus en plus d'œufs dans le même panier. Répartir ton argent limite la casse si une crypto chute.";
  } else {
    tip = "Avant d'acheter, fixe-toi une règle : à quel prix tu prends tes gains, et à quelle perte tu sors ? Décider à l'avance t'évite de décider sous le coup de l'émotion.";
  }
  return { tone: 'neutral', message, tip };
}

export function sellFeedback(
  symbol: string, quantity: number, price: number, received: number, avgCost: number | null,
): Feedback {
  if (avgCost === null) {
    return { tone: 'neutral', message: `Tu as vendu ${quantity.toFixed(5)} ${symbol} pour ${formatUsd(received)}.`, tip: '' };
  }
  const pnl = (price - avgCost) * quantity;
  const pnlPct = (price / avgCost - 1) * 100;
  const message = `Tu as vendu ${quantity.toFixed(5)} ${symbol} pour ${formatUsd(received)}. Tu l'avais payé ${formatUsd(avgCost)} en moyenne : ${pnl >= 0 ? 'gain' : 'perte'} de ${formatUsd(Math.abs(pnl))} (${formatPercent(pnlPct)}).`;
  if (pnl >= 0) {
    return {
      tone: 'good',
      message,
      tip: "Prendre une partie de ses gains, c'est une bonne habitude. Dans la vraie vie, pense aux frais des plateformes et aux impôts sur les plus-values.",
    };
  }
  return {
    tone: 'bad',
    message,
    tip: "Vendre après une baisse, c'est rendre la perte définitive. Demande-toi : ta raison d'acheter a changé, ou tu vends juste parce que tu as peur ?",
  };
}
