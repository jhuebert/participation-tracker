import { DEFAULT_SCORING, DEFAULT_SKIP_LIMIT, DEFAULT_WEIGHTS } from '@/domain/defaults';
import { normalizeClasses, normalizeStudentStats } from '@/domain/class-roster';
import type { ClassesMap, ScoringSettings, SessionMap, WeightSettings } from '@/domain/types';

export const STORAGE_KEYS = {
  classes: 'participationData',
  scoring: 'participationScoringSettings',
  weights: 'participationWeightSettings',
  session: 'participationSession',
  skipLimit: 'participationSkipLimit',
} as const;

export interface LoadedState {
  classes: ClassesMap;
  scoring: ScoringSettings;
  weights: WeightSettings;
  sessions: SessionMap;
  skipLimit: number;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadState(): LoadedState {
  const classes = normalizeClasses(readJson<unknown>(STORAGE_KEYS.classes) ?? {});
  const scoring = {
    ...DEFAULT_SCORING,
    ...(readJson<Partial<ScoringSettings>>(STORAGE_KEYS.scoring) ?? {}),
  };
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...(readJson<Partial<WeightSettings>>(STORAGE_KEYS.weights) ?? {}),
  };
  const sessions = normalizeSessions(readJson<unknown>(STORAGE_KEYS.session));
  const skipRaw = readJson<number>(STORAGE_KEYS.skipLimit);
  const skipLimit =
    typeof skipRaw === 'number' && Number.isFinite(skipRaw)
      ? Math.max(0, Math.floor(skipRaw))
      : DEFAULT_SKIP_LIMIT;

  return { classes, scoring, weights, sessions, skipLimit };
}

export function saveClasses(classes: ClassesMap): void {
  writeJson(STORAGE_KEYS.classes, classes);
}

export function saveScoring(settings: ScoringSettings): void {
  writeJson(STORAGE_KEYS.scoring, settings);
}

export function saveWeights(settings: WeightSettings): void {
  writeJson(STORAGE_KEYS.weights, settings);
}

export function saveSessions(sessions: SessionMap): void {
  writeJson(STORAGE_KEYS.session, sessions);
}

export function saveSkipLimit(limit: number): void {
  writeJson(STORAGE_KEYS.skipLimit, limit);
}

function normalizeSessions(raw: unknown): SessionMap {
  if (!raw || typeof raw !== 'object') return {};
  const result: SessionMap = {};
  for (const [className, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as {
      present?: unknown;
      sessionStats?: unknown;
      sessionSkips?: unknown;
      lastPicked?: unknown;
    };
    const present = Array.isArray(v.present)
      ? v.present.filter((n): n is string => typeof n === 'string')
      : [];
    const sessionStats: Record<string, ReturnType<typeof normalizeStudentStats>> = {};
    if (v.sessionStats && typeof v.sessionStats === 'object') {
      for (const [k, stats] of Object.entries(v.sessionStats as Record<string, unknown>)) {
        if (stats && typeof stats === 'object') {
          sessionStats[k] = normalizeStudentStats(
            stats as Partial<ReturnType<typeof normalizeStudentStats>>,
          );
        }
      }
    }
    const sessionSkips: Record<string, number> = {};
    if (v.sessionSkips && typeof v.sessionSkips === 'object') {
      for (const [k, n] of Object.entries(v.sessionSkips as Record<string, unknown>)) {
        const num = Number(n);
        if (Number.isFinite(num) && num > 0) sessionSkips[k] = Math.floor(num);
      }
    }
    result[className] = {
      present,
      ...(Object.keys(sessionStats).length > 0 ? { sessionStats } : {}),
      sessionSkips,
      lastPicked: typeof v.lastPicked === 'string' ? v.lastPicked : undefined,
    };
  }
  return result;
}
