import { currentClass, currentIsVolunteer, currentStudent } from '@/state/store';
import { ActionBar } from '@/features/picker/ActionBar';
import styles from './SelectionStage.module.css';

interface Props {
  compact?: boolean;
}

export function SelectionStage({ compact = false }: Props) {
  const className = currentClass.value;
  const student = currentStudent.value;
  const isVol = currentIsVolunteer.value;

  let headline: string;
  if (!className) headline = 'Select a class to start';
  else if (student) headline = student;
  else headline = 'Ready to pick!';

  return (
    <section class={`${styles.stage} ${compact ? styles.compact : ''}`} aria-live="polite">
      <div class={styles.display}>
        {isVol && student && <div class={styles.volunteer}>🙋 Volunteer</div>}
        <div
          class={`${styles.name} ${student ? styles.selected : ''}`}
          data-testid="selected-name"
        >
          {headline}
        </div>
      </div>
      <ActionBar compact={compact} />
    </section>
  );
}
