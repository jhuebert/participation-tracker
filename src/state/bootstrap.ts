import { effect } from '@preact/signals';
import { createBroadcastClient } from '@/state/broadcast';
import {
  loadState,
  saveClasses,
  saveScoring,
  saveSessions,
  saveSkipLimit,
  saveWeights,
} from '@/state/persistence';
import { applyStudentBroadcast, attachBroadcast } from '@/state/actions';
import {
  classes,
  mode,
  scoringSettings,
  sessions,
  skipLimit,
  weightSettings,
} from '@/state/store';
import type { AppMode } from '@/domain/types';

let started = false;

export function bootstrap(): void {
  if (started) return;
  started = true;

  const loaded = loadState();
  classes.value = loaded.classes;
  scoringSettings.value = loaded.scoring;
  weightSettings.value = loaded.weights;
  sessions.value = loaded.sessions;
  skipLimit.value = loaded.skipLimit;

  // Autosave
  effect(() => {
    saveClasses(classes.value);
  });
  effect(() => {
    saveScoring(scoringSettings.value);
  });
  effect(() => {
    saveWeights(weightSettings.value);
  });
  effect(() => {
    saveSessions(sessions.value);
  });
  effect(() => {
    saveSkipLimit(skipLimit.value);
  });

  const client = createBroadcastClient((message) => {
    if (mode.value === 'student') {
      applyStudentBroadcast(message);
    }
  });
  attachBroadcast(client);

  applyHashRoute();
  window.addEventListener('hashchange', applyHashRoute);
}

function applyHashRoute(): void {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash !== 'student' && hash !== 'split' && hash !== 'teacher') return;
  const next = hash as AppMode;
  if (mode.value === next) return;

  mode.value = next;
  if (next === 'student') document.title = 'Student View - Participation Tracker';
  else if (next === 'split') document.title = 'Presentation + Tracker';
  else document.title = 'Teacher View - Participation Tracker';
}
