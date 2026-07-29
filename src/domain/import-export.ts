import { normalizeClasses } from '@/domain/class-roster';
import { calcLeaderboardScore, calcParticipationPoints } from '@/domain/scoring';
import type { ClassesMap, ExportFile, ScoringSettings } from '@/domain/types';

export function buildExportPayload(classes: ClassesMap, date = new Date()): ExportFile {
  return {
    app: 'Participation Tracker',
    date: date.toLocaleString(),
    data: classes,
  };
}

export function serializeExport(classes: ClassesMap, date?: Date): string {
  return JSON.stringify(buildExportPayload(classes, date), null, 2);
}

export function parseImportPayload(raw: string): ClassesMap {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid file');
  }

  const obj = parsed as { app?: unknown; data?: unknown };

  // Preferred shape: { app, date, data }
  if (obj.app === 'Participation Tracker' && obj.data) {
    return normalizeClasses(obj.data);
  }

  // Bare classes map fallback (students nested under each class)
  if (!('app' in obj) && !('data' in obj)) {
    const normalized = normalizeClasses(obj);
    if (Object.keys(normalized).length > 0) return normalized;
  }

  throw new Error('Invalid file');
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  picks: number;
  volunteers: number;
  skips: number;
  correct: number;
  incorrect: number;
  participationPoints: number;
  leaderboardScore: number | null;
}

export function buildLeaderboardRows(
  students: Record<string, { picks: number; correct: number; incorrect: number; volunteers: number; skips: number }>,
  settings: ScoringSettings,
): LeaderboardRow[] {
  const entries = Object.entries(students).map(([name, stats]) => ({
    name,
    stats,
    score: calcLeaderboardScore(stats, settings),
    points: calcParticipationPoints(stats, settings),
  }));

  // Match v1: sort by numeric leaderboard score descending.
  // Students with 0 picks score as 0 for ordering (UI still shows "—").
  entries.sort((a, b) => {
    const sa = a.score ?? 0;
    const sb = b.score ?? 0;
    if (sb !== sa) return sb - sa;
    return a.name.localeCompare(b.name);
  });

  return entries.map((row, i) => ({
    rank: i + 1,
    name: row.name,
    picks: row.stats.picks,
    volunteers: row.stats.volunteers,
    skips: row.stats.skips,
    correct: row.stats.correct,
    incorrect: row.stats.incorrect,
    participationPoints: row.points,
    leaderboardScore: row.score,
  }));
}

export function buildCsv(rows: LeaderboardRow[]): string {
  const header =
    'Rank,Name,Picks,Volunteers,Skips,Correct,Incorrect,Total Participation Points,Leaderboard Score';
  const lines = rows.map((r) => {
    const score = r.leaderboardScore === null ? '0' : r.leaderboardScore.toFixed(2);
    const safeName = `"${r.name.replace(/"/g, '""')}"`;
    return `${r.rank},${safeName},${r.picks},${r.volunteers},${r.skips},${r.correct},${r.incorrect},${r.participationPoints},${score}`;
  });
  return [header, ...lines].join('\n') + '\n';
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
