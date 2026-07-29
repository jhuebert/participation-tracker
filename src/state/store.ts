import { signal } from '@preact/signals';
import {
  DEFAULT_SCORING,
  DEFAULT_SKIP_LIMIT,
  DEFAULT_WEIGHTS,
} from '@/domain/defaults';
import type {
  AppMode,
  AppRoute,
  ClassesMap,
  ScoringSettings,
  SessionMap,
  StudentDisplay,
  WeightSettings,
} from '@/domain/types';

export const mode = signal<AppMode | null>(null);
export const route = signal<AppRoute>('picker');
export const classes = signal<ClassesMap>({});
export const currentClass = signal<string | null>(null);
export const currentStudent = signal<string | null>(null);
export const currentIsVolunteer = signal(false);
export const scoringSettings = signal<ScoringSettings>({ ...DEFAULT_SCORING });
export const weightSettings = signal<WeightSettings>({ ...DEFAULT_WEIGHTS });
export const skipLimit = signal(DEFAULT_SKIP_LIMIT);
export const sessions = signal<SessionMap>({});
export const studentDisplay = signal<StudentDisplay>({
  name: null,
  isVolunteer: false,
});

export function setMode(next: AppMode | null): void {
  mode.value = next;
  if (typeof document !== 'undefined') {
    if (next === 'student') {
      document.title = 'Student View - Participation Tracker';
    } else if (next === 'split') {
      document.title = 'Presentation + Tracker';
    } else if (next === 'teacher') {
      document.title = 'Teacher View - Participation Tracker';
    } else {
      document.title = 'Participation Tracker';
    }
  }
  if (typeof window !== 'undefined' && next) {
    const desired = `#/${next}`;
    if (window.location.hash !== desired) {
      window.location.hash = desired;
    }
  }
}
