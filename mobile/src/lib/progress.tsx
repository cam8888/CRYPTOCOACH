/**
 * Academy progress: finished lessons, XP and active days (for the streak).
 * Same idea as the lesson_progress table in Supabase, saved on the phone for now.
 */
import Storage from 'expo-sqlite/kv-store';
import { createContext, ReactNode, useContext, useState } from 'react';

import { ALL_LESSONS } from '@/data/lessons';

const STORAGE_KEY = 'progress-v1';

type LessonResult = { score: number; xp: number };
type ProgressState = { completed: Record<string, LessonResult>; activeDays: string[] };

/** Today's date as "2026-09-25", in the phone's time zone. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Number of consecutive active days, ending today (or yesterday if nothing yet today). */
export function computeStreak(days: Set<string>): number {
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

type ProgressValue = ProgressState & {
  totalXp: number;
  isUnlocked: (lessonId: string) => boolean;
  nextLessonId: string | null;
  saveResult: (lessonId: string, score: number, xp: number) => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => {
    const saved = Storage.getItemSync(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { completed: {}, activeDays: [] };
  });

  function saveResult(lessonId: string, score: number, xp: number) {
    const previous = state.completed[lessonId];
    const today = dayKey();
    const next: ProgressState = {
      // Keep the best result if the lesson is replayed
      completed: {
        ...state.completed,
        [lessonId]: { score: Math.max(score, previous?.score ?? 0), xp: Math.max(xp, previous?.xp ?? 0) },
      },
      activeDays: state.activeDays.includes(today) ? state.activeDays : [...state.activeDays, today],
    };
    setState(next);
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(next));
  }

  // A lesson is unlocked if it is the first one, or if the one before it is done
  function isUnlocked(lessonId: string) {
    const index = ALL_LESSONS.findIndex((l) => l.id === lessonId);
    return index === 0 || ALL_LESSONS[index - 1]?.id in state.completed;
  }

  const nextLessonId = ALL_LESSONS.find((l) => !(l.id in state.completed))?.id ?? null;
  const totalXp = Object.values(state.completed).reduce((sum, r) => sum + r.xp, 0);

  return (
    <ProgressContext.Provider value={{ ...state, totalXp, isUnlocked, nextLessonId, saveResult }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
