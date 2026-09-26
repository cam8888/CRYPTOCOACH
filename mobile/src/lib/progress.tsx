/**
 * Academy progress: finished lessons, XP and active days (for the streak).
 * Guest: saved on the phone. Signed in: saved in the lesson_progress table in Supabase.
 */
import Storage from 'expo-sqlite/kv-store';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { ALL_LESSONS } from '@/data/lessons';
import { useAppState } from '@/lib/app-state';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'progress-v1';

type LessonResult = { score: number; xp: number };
type ProgressState = { completed: Record<string, LessonResult>; activeDays: string[] };

const EMPTY: ProgressState = { completed: {}, activeDays: [] };

/** A date as "2026-09-25", in the phone's time zone. */
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

function loadLocal(): ProgressState {
  const saved = Storage.getItemSync(STORAGE_KEY);
  return saved ? JSON.parse(saved) : EMPTY;
}

async function loadRemote(): Promise<ProgressState> {
  const { data, error } = await supabase.from('lesson_progress').select('lesson_id, score, xp, completed_at');
  if (error) throw new Error(error.message);
  const completed: Record<string, LessonResult> = {};
  const days = new Set<string>();
  for (const row of data ?? []) {
    completed[row.lesson_id] = { score: row.score, xp: row.xp };
    days.add(dayKey(new Date(row.completed_at)));
  }
  return { completed, activeDays: [...days] };
}

type ProgressValue = ProgressState & {
  totalXp: number;
  isUnlocked: (lessonId: string) => boolean;
  nextLessonId: string | null;
  /** Saves a passed lesson. Returns true the first time (that's when the cash reward is given). */
  saveResult: (lessonId: string, score: number, xp: number, reward: number) => Promise<boolean>;
};

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { session } = useAppState();
  const isRemote = session !== null;
  const [state, setState] = useState<ProgressState>(loadLocal);

  const reload = useCallback(async () => {
    setState(isRemote ? await loadRemote() : loadLocal());
  }, [isRemote]);

  useEffect(() => {
    reload().catch((e) => console.warn('Progress load failed', e));
  }, [reload]);

  async function saveResult(lessonId: string, score: number, xp: number, reward: number) {
    if (isRemote) {
      // The server keeps the best score and adds the reward only the first time
      const { data, error } = await supabase.rpc('complete_lesson', {
        p_lesson_id: lessonId, p_score: score, p_xp: xp, p_reward: reward,
      });
      if (error) throw new Error(error.message);
      await reload();
      return Boolean(data);
    }
    const previous = state.completed[lessonId];
    const today = dayKey();
    const next: ProgressState = {
      completed: {
        ...state.completed,
        [lessonId]: { score: Math.max(score, previous?.score ?? 0), xp: Math.max(xp, previous?.xp ?? 0) },
      },
      activeDays: state.activeDays.includes(today) ? state.activeDays : [...state.activeDays, today],
    };
    setState(next);
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(next));
    return previous === undefined;
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
