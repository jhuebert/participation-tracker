import type { Effect, ScoringSettings, StudentStats } from '@/domain/types';

export function applyEffect(effect: Effect, points: number, count: number): number {
  const total = points * count;
  return effect === 'add' ? total : -total;
}

export function calcParticipationPoints(
  stats: StudentStats,
  settings: ScoringSettings,
): number {
  return (
    applyEffect(settings.correctEffect, settings.correctPoints, stats.correct) +
    applyEffect(settings.volunteerEffect, settings.volunteerPoints, stats.volunteers) +
    applyEffect(settings.incorrectEffect, settings.incorrectPoints, stats.incorrect) +
    applyEffect(settings.skipEffect, settings.skipPoints, stats.skips)
  );
}

/** Leaderboard score; `null` when picks === 0 (UI shows "—"). */
export function calcLeaderboardScore(
  stats: StudentStats,
  settings: ScoringSettings,
): number | null {
  if (stats.picks <= 0) return null;
  return calcParticipationPoints(stats, settings) / stats.picks;
}

export function formatLeaderboardScore(score: number | null): string {
  return score === null ? '—' : score.toFixed(2);
}

export function scoringFormulaPreview(settings: ScoringSettings): string {
  const part = (label: string, effect: Effect, pts: number) =>
    `${effect === 'add' ? '+' : '−'}${pts} × ${label}`;

  return [
    part('Correct', settings.correctEffect, settings.correctPoints),
    part('Volunteers', settings.volunteerEffect, settings.volunteerPoints),
    part('Incorrect', settings.incorrectEffect, settings.incorrectPoints),
    part('Skips', settings.skipEffect, settings.skipPoints),
  ].join('  ·  ');
}
