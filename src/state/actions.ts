import {
  addStudent as addStudentFn,
  createClass as createClassFn,
  deleteClass as deleteClassFn,
  removeStudent as removeStudentFn,
  renameClass as renameClassFn,
  renameStudent as renameStudentFn,
  resetClassStats,
} from '@/domain/class-roster';
import { emptyStudentStats } from '@/domain/defaults';
import {
  eligibleForRandomPick,
  pickWeighted,
} from '@/domain/weighted-pick';
import type { BroadcastMessage, ScoringSettings, WeightSettings } from '@/domain/types';
import {
  classes,
  currentClass,
  currentIsVolunteer,
  currentStudent,
  scoringSettings,
  sessions,
  skipLimit,
  studentDisplay,
  weightSettings,
} from '@/state/store';
import {
  emptySession,
  ensureSession,
  freshSessionForClass,
  resetSessionSkips,
  setAllPresent,
  studentNames,
  togglePresent,
} from '@/state/session';
import type { BroadcastClient } from '@/state/broadcast';

let broadcast: BroadcastClient | null = null;

export function attachBroadcast(client: BroadcastClient): void {
  broadcast = client;
}

function post(message: BroadcastMessage): void {
  broadcast?.post(message);
}

function requireClass(): string {
  const name = currentClass.value;
  if (!name || !classes.value[name]) throw new Error('No class selected');
  return name;
}

function updateStudentStats(
  className: string,
  studentName: string,
  updater: (stats: ReturnType<typeof emptyStudentStats>) => ReturnType<typeof emptyStudentStats>,
): void {
  const cls = classes.value[className];
  if (!cls) return;
  const prev = cls.students[studentName] ?? emptyStudentStats();
  classes.value = {
    ...classes.value,
    [className]: {
      students: {
        ...cls.students,
        [studentName]: updater({ ...prev }),
      },
    },
  };
}

function setSessionField(
  className: string,
  next: (typeof sessions.value)[string],
): void {
  sessions.value = {
    ...sessions.value,
    [className]: next,
  };
}

function clearSelectionUi(): void {
  currentStudent.value = null;
  currentIsVolunteer.value = false;
  post({ type: 'studentCleared' });
}

function selectStudent(
  name: string,
  opts: { isVolunteer: boolean; isTeacherPick?: boolean },
): void {
  const className = requireClass();
  updateStudentStats(className, name, (s) => {
    s.picks += 1;
    if (opts.isVolunteer) s.volunteers += 1;
    return s;
  });

  const session = sessions.value[className] ?? emptySession();
  setSessionField(className, { ...session, lastPicked: name });

  currentStudent.value = name;
  currentIsVolunteer.value = opts.isVolunteer;

  post({
    type: 'studentSelected',
    name,
    isVolunteer: opts.isVolunteer,
    isTeacherPick: opts.isTeacherPick,
  });
}

export function selectClass(name: string | null, opts: { resetSession?: boolean } = {}): void {
  currentClass.value = name;
  currentStudent.value = null;
  currentIsVolunteer.value = false;

  if (!name || !classes.value[name]) return;

  const names = studentNames(classes.value, name);
  if (opts.resetSession) {
    setSessionField(name, freshSessionForClass(names));
    return;
  }
  if (!sessions.value[name]) {
    setSessionField(name, freshSessionForClass(names));
  } else {
    // Prune roster drift while keeping present / skips / lastPicked
    setSessionField(name, ensureSession(sessions.value, name, names));
  }
}

export function pickRandom(): string | null {
  const className = requireClass();
  const session = sessions.value[className] ?? emptySession();
  if (session.present.length === 0) return null;

  const students = classes.value[className].students;
  const eligible = eligibleForRandomPick(
    session.present,
    session.lastPicked,
    students,
  );
  if (eligible.length === 0) return null;

  const name = pickWeighted(eligible, students, weightSettings.value);
  selectStudent(name, { isVolunteer: false });
  return name;
}

export function teacherPick(name: string): void {
  selectStudent(name, { isVolunteer: false, isTeacherPick: true });
}

export function selectVolunteer(name: string): void {
  selectStudent(name, { isVolunteer: true });
}

export function markCorrect(): void {
  const className = currentClass.value;
  const student = currentStudent.value;
  if (!className || !student) return;
  updateStudentStats(className, student, (s) => {
    s.correct += 1;
    return s;
  });
  clearSelectionUi();
}

export function markIncorrect(): void {
  const className = currentClass.value;
  const student = currentStudent.value;
  if (!className || !student) return;
  updateStudentStats(className, student, (s) => {
    s.incorrect += 1;
    return s;
  });
  clearSelectionUi();
}

/** @returns error message if at skip limit */
export function markSkip(): string | null {
  const className = currentClass.value;
  const student = currentStudent.value;
  if (!className || !student) return null;

  const session = sessions.value[className] ?? emptySession();
  const used = session.sessionSkips[student] ?? 0;
  const limit = skipLimit.value;
  if (limit > 0 && used >= limit) {
    return `${student} has used all skips`;
  }

  updateStudentStats(className, student, (s) => {
    s.skips += 1;
    return s;
  });
  setSessionField(className, {
    ...session,
    sessionSkips: {
      ...session.sessionSkips,
      [student]: used + 1,
    },
  });
  clearSelectionUi();
  return null;
}

export function setPresent(studentName: string, present: boolean): void {
  const className = requireClass();
  const session = sessions.value[className] ?? emptySession();
  setSessionField(className, togglePresent(session, studentName, present));
}

export function setEveryonePresent(present: boolean): void {
  const className = requireClass();
  const names = studentNames(classes.value, className);
  const session = sessions.value[className] ?? emptySession();
  setSessionField(className, setAllPresent(session, names, present));
}

export function resetSkips(): void {
  const className = currentClass.value;
  if (!className) return;
  const session = sessions.value[className] ?? emptySession();
  setSessionField(className, resetSessionSkips(session));
}

export function setSkipLimit(limit: number): void {
  skipLimit.value = Math.max(0, Math.floor(limit));
}

export function updateScoring(partial: Partial<ScoringSettings>): void {
  scoringSettings.value = { ...scoringSettings.value, ...partial };
}

export function updateWeights(partial: Partial<WeightSettings>): void {
  weightSettings.value = { ...weightSettings.value, ...partial };
}

export function createClass(name: string, studentList: string[]): void {
  classes.value = createClassFn(classes.value, name, studentList);
}

export function deleteClass(name: string): void {
  classes.value = deleteClassFn(classes.value, name);
  const nextSessions = { ...sessions.value };
  delete nextSessions[name];
  sessions.value = nextSessions;
  if (currentClass.value === name) {
    currentClass.value = null;
    currentStudent.value = null;
    currentIsVolunteer.value = false;
  }
}

export function renameClass(from: string, to: string): void {
  classes.value = renameClassFn(classes.value, from, to);
  if (sessions.value[from]) {
    const next = { ...sessions.value };
    next[to] = next[from];
    delete next[from];
    sessions.value = next;
  }
  if (currentClass.value === from) currentClass.value = to;
}

export function addStudentToClass(className: string, studentName: string): void {
  const cls = classes.value[className];
  if (!cls) throw new Error('Class not found');
  classes.value = {
    ...classes.value,
    [className]: addStudentFn(cls, studentName),
  };
  const session = sessions.value[className] ?? emptySession();
  setSessionField(className, togglePresent(session, studentName.trim(), true));
}

export function addStudentToCurrent(studentName: string): void {
  addStudentToClass(requireClass(), studentName);
}

export function removeStudentFromClass(className: string, studentName: string): void {
  const cls = classes.value[className];
  if (!cls) return;
  classes.value = {
    ...classes.value,
    [className]: removeStudentFn(cls, studentName),
  };
  const session = sessions.value[className];
  if (session) {
    setSessionField(className, togglePresent(session, studentName, false));
  }
  if (currentStudent.value === studentName) {
    clearSelectionUi();
  }
}

export function renameStudentInClass(className: string, from: string, to: string): void {
  const cls = classes.value[className];
  if (!cls) return;
  classes.value = {
    ...classes.value,
    [className]: renameStudentFn(cls, from, to),
  };
  const session = sessions.value[className];
  if (session) {
    const present = session.present.map((n) => (n === from ? to.trim() : n));
    const sessionSkips = { ...session.sessionSkips };
    if (sessionSkips[from] != null) {
      sessionSkips[to.trim()] = sessionSkips[from];
      delete sessionSkips[from];
    }
    const lastPicked = session.lastPicked === from ? to.trim() : session.lastPicked;
    setSessionField(className, { present, sessionSkips, lastPicked });
  }
  if (currentStudent.value === from) currentStudent.value = to.trim();
}

export function replaceAllClasses(next: typeof classes.value): void {
  classes.value = next;
  sessions.value = {};
  currentClass.value = null;
  currentStudent.value = null;
  currentIsVolunteer.value = false;
}

export function resetStatsForClass(className: string): void {
  const cls = classes.value[className];
  if (!cls) return;
  classes.value = {
    ...classes.value,
    [className]: resetClassStats(cls),
  };
}

/** Student-view only: apply incoming broadcast without mutating teacher stats. */
export function applyStudentBroadcast(message: BroadcastMessage): void {
  if (message.type === 'studentSelected') {
    studentDisplay.value = {
      name: message.name,
      isVolunteer: message.isVolunteer,
    };
  } else if (message.type === 'studentCleared') {
    studentDisplay.value = { name: null, isVolunteer: false };
  }
}
