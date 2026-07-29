import { studentDisplay } from '@/state/store';
import { ModeSelect } from '@/ui/ModeSelect';
import styles from './Shell.module.css';

export function StudentShell() {
  const display = studentDisplay.value;

  return (
    <div class={styles.studentShell}>
      {display.isVolunteer && display.name && (
        <div class={styles.volunteerBadge}>🙋 Volunteer</div>
      )}
      <div class={styles.studentName}>
        {display.name ?? 'Waiting for next student…'}
      </div>
      <div class={styles.studentMode}>
        <ModeSelect />
      </div>
    </div>
  );
}
