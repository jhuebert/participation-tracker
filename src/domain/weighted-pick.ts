import type { StudentStats, WeightSettings } from '@/domain/types';

export function applyWeightDir(
  base: number,
  dir: 'increase' | 'decrease',
  amount: number,
  count: number,
): number {
  return dir === 'decrease' ? base - amount * count : base + amount * count;
}

export function weightForStudent(stats: StudentStats, settings: WeightSettings): number {
  let weight = 100;
  weight = applyWeightDir(weight, settings.volunteerDir, settings.volunteerAmt, stats.volunteers);
  weight = applyWeightDir(weight, settings.correctDir, settings.correctAmt, stats.correct);
  weight = applyWeightDir(weight, settings.incorrectDir, settings.incorrectAmt, stats.incorrect);
  weight = applyWeightDir(weight, settings.skipDir, settings.skipAmt, stats.skips);
  return Math.max(1, weight);
}

export function computeWeights(
  names: string[],
  students: Record<string, StudentStats>,
  settings: WeightSettings,
): number[] {
  if (!settings.enabled) {
    return names.map(() => 1);
  }
  return names.map((name) => weightForStudent(students[name] ?? emptyStats(), settings));
}

function emptyStats(): StudentStats {
  return { picks: 0, correct: 0, incorrect: 0, volunteers: 0, skips: 0 };
}

/**
 * Pick from `eligible` using weights. `random` must return [0, 1).
 */
export function pickWeighted(
  eligible: string[],
  students: Record<string, StudentStats>,
  settings: WeightSettings,
  random: () => number = Math.random,
): string {
  if (eligible.length === 0) {
    throw new Error('No eligible students');
  }
  if (eligible.length === 1) return eligible[0];

  const weights = computeWeights(eligible, students, settings);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let tick = random() * total;

  for (let i = 0; i < eligible.length; i++) {
    tick -= weights[i];
    if (tick <= 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}

/**
 * Build the eligible list for random pick (parity with v1):
 * prefer present students excluding lastPicked; if none, among present with minimum picks.
 */
export function eligibleForRandomPick(
  present: string[],
  lastPicked: string | null | undefined,
  students: Record<string, StudentStats>,
): string[] {
  if (present.length === 0) return [];

  const withoutLast = present.filter((n) => n !== lastPicked);
  if (withoutLast.length > 0) return withoutLast;

  const picks = present.map((n) => students[n]?.picks ?? 0);
  const minPicks = Math.min(...picks);
  return present.filter((n) => (students[n]?.picks ?? 0) === minPicks);
}
