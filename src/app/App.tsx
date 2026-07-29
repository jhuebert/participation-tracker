import { mode } from '@/state/store';
import { StudentShell } from '@/app/mode-shells/StudentShell';
import { SplitShell } from '@/app/mode-shells/SplitShell';
import { TeacherShell } from '@/app/mode-shells/TeacherShell';
import { ModeSelect } from '@/ui/ModeSelect';
import { Toast } from '@/ui/Toast';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import styles from '@/app/App.module.css';

export function App() {
  const current = mode.value;

  return (
    <div class={styles.app} data-mode={current ?? 'unset'}>
      {!current && (
        <div class={styles.welcome}>
          <div class={styles.welcomeCard}>
            <p class={styles.kicker}>Cornerstone classroom tool</p>
            <h1>Participation Tracker</h1>
            <p class={styles.lead}>
              Pick students fairly, track participation, and present slides beside your tracker.
            </p>
            <ModeSelect large />
            <p class={styles.version}>v{__APP_VERSION__}</p>
          </div>
        </div>
      )}

      {current === 'teacher' && <TeacherShell />}
      {current === 'student' && <StudentShell />}
      {current === 'split' && <SplitShell />}

      <Toast />
      <ConfirmDialog />
    </div>
  );
}
