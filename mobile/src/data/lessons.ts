/**
 * Academy path (titles only for now). The full lesson content
 * from lessons.py will be moved here in the Academy step.
 */
export type LessonSummary = { id: string; title: string; xp: number };
export type Unit = { id: string; title: string; lessons: LessonSummary[] };

export const UNITS: Unit[] = [
  {
    id: 'basics',
    title: 'Les bases de la crypto',
    lessons: [
      { id: 'basics-1', title: "C'est quoi, une crypto ?", xp: 10 },
      { id: 'basics-2', title: 'Bitcoin, Ethereum, Solana', xp: 10 },
    ],
  },
  {
    id: 'trading',
    title: 'Trader sans paniquer',
    lessons: [
      { id: 'trading-1', title: 'FOMO et vente panique', xp: 15 },
      { id: 'trading-2', title: 'Le DCA, pas à pas', xp: 15 },
    ],
  },
  {
    id: 'safety',
    title: 'Rester en sécurité',
    lessons: [{ id: 'safety-1', title: 'Arnaques et sécurité', xp: 15 }],
  },
];
