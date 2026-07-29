import { emptyStudentStats } from '@/domain/defaults';
import type { ClassSessionState, ClassesMap, SessionMap } from '@/domain/types';

export function emptySession(): ClassSessionState {
  return {
    present: [],
    sessionStats: {},
    sessionSkips: {},
    lastPicked: undefined,
  };
}

export function ensureSession(
  sessions: SessionMap,
  className: string,
  classStudents: string[],
): ClassSessionState {
  const existing = sessions[className];
  if (!existing) {
    const sessionStats: ClassSessionState['sessionStats'] = {};
    for (const name of classStudents) sessionStats[name] = emptyStudentStats();
    return {
      present: [...classStudents].sort((a, b) => a.localeCompare(b)),
      sessionStats,
      sessionSkips: {},
      lastPicked: undefined,
    };
  }

  // Drop students who left the roster; keep present only if still enrolled
  const enrolled = new Set(classStudents);
  const present = existing.present.filter((n) => enrolled.has(n));
  const sessionStats: ClassSessionState['sessionStats'] = {};
  for (const name of classStudents) {
    sessionStats[name] = existing.sessionStats?.[name] ?? emptyStudentStats();
  }
  const sessionSkips: Record<string, number> = {};
  for (const [name, count] of Object.entries(existing.sessionSkips)) {
    if (enrolled.has(name)) sessionSkips[name] = count;
  }
  const lastPicked =
    existing.lastPicked && enrolled.has(existing.lastPicked) ? existing.lastPicked : undefined;

  return { present, sessionStats, sessionSkips, lastPicked };
}

/** Fresh session when teacher "loads" a class: everyone present, stats/skips cleared. */
export function freshSessionForClass(classStudents: string[]): ClassSessionState {
  const sessionStats: ClassSessionState['sessionStats'] = {};
  for (const name of classStudents) sessionStats[name] = emptyStudentStats();
  return {
    present: [...classStudents].sort((a, b) => a.localeCompare(b)),
    sessionStats,
    sessionSkips: {},
    lastPicked: undefined,
  };
}

export function togglePresent(
  session: ClassSessionState,
  studentName: string,
  present: boolean,
): ClassSessionState {
  const set = new Set(session.present);
  if (present) set.add(studentName);
  else set.delete(studentName);
  return {
    ...session,
    present: Array.from(set).sort((a, b) => a.localeCompare(b)),
  };
}

export function setAllPresent(
  session: ClassSessionState,
  studentNames: string[],
  present: boolean,
): ClassSessionState {
  return {
    ...session,
    present: present ? [...studentNames].sort((a, b) => a.localeCompare(b)) : [],
  };
}

export function resetSessionSkips(session: ClassSessionState): ClassSessionState {
  return { ...session, sessionSkips: {} };
}

export function getSession(
  sessions: SessionMap,
  className: string | null,
): ClassSessionState | null {
  if (!className) return null;
  return sessions[className] ?? null;
}

export function studentNames(classes: ClassesMap, className: string | null): string[] {
  if (!className || !classes[className]) return [];
  return Object.keys(classes[className].students).sort((a, b) => a.localeCompare(b));
}
