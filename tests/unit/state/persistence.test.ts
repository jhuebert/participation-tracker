import { beforeEach, describe, expect, it } from 'vitest';
import {
  STORAGE_KEYS,
  loadState,
  saveClasses,
  saveScoring,
  saveSessions,
  saveSkipLimit,
  saveWeights,
} from '@/state/persistence';
import { DEFAULT_SCORING, DEFAULT_WEIGHTS } from '@/domain/defaults';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe('persistence', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryStorage(),
      configurable: true,
    });
  });

  it('returns defaults when storage empty', () => {
    const state = loadState();
    expect(state.classes).toEqual({});
    expect(state.scoring).toEqual(DEFAULT_SCORING);
    expect(state.weights).toEqual(DEFAULT_WEIGHTS);
    expect(state.sessions).toEqual({});
    expect(state.skipLimit).toBe(3);
  });

  it('loads legacy participationData shape', () => {
    localStorage.setItem(
      STORAGE_KEYS.classes,
      JSON.stringify({
        P1: { students: { Amy: { picks: 2, correct: 1 } } },
      }),
    );
    localStorage.setItem(STORAGE_KEYS.scoring, JSON.stringify({ correctPoints: 5 }));
    localStorage.setItem(STORAGE_KEYS.weights, JSON.stringify({ enabled: false, skipAmt: 50 }));

    const state = loadState();
    expect(state.classes.P1.students.Amy).toEqual({
      picks: 2,
      correct: 1,
      incorrect: 0,
      volunteers: 0,
      skips: 0,
    });
    expect(state.scoring.correctPoints).toBe(5);
    expect(state.scoring.incorrectPoints).toBe(DEFAULT_SCORING.incorrectPoints);
    expect(state.weights.enabled).toBe(false);
    expect(state.weights.skipAmt).toBe(50);
  });

  it('round-trips saves', () => {
    saveClasses({
      C: { students: { A: { picks: 1, correct: 0, incorrect: 0, volunteers: 0, skips: 0 } } },
    });
    saveScoring({ ...DEFAULT_SCORING, volunteerPoints: 9 });
    saveWeights({ ...DEFAULT_WEIGHTS, volunteerAmt: 40 });
    saveSessions({
      C: { present: ['A'], sessionSkips: { A: 1 }, lastPicked: 'A' },
    });
    saveSkipLimit(5);

    const state = loadState();
    expect(state.classes.C.students.A.picks).toBe(1);
    expect(state.scoring.volunteerPoints).toBe(9);
    expect(state.weights.volunteerAmt).toBe(40);
    expect(state.sessions.C).toEqual({
      present: ['A'],
      sessionSkips: { A: 1 },
      lastPicked: 'A',
    });
    expect(state.skipLimit).toBe(5);
  });
});
