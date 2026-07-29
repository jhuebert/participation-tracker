import { currentClass } from '@/state/store';
import { AttendancePanel } from '@/features/picker/AttendancePanel';
import { SelectionStage } from '@/features/picker/SelectionStage';
import { StatsRow } from '@/features/picker/StatsRow';
import styles from './PickerView.module.css';

interface Props {
  compact?: boolean;
}

export function PickerView({ compact = false }: Props) {
  const hasClass = !!currentClass.value;

  if (compact) {
    return (
      <div class={`${styles.view} ${styles.compact}`}>
        {!hasClass && (
          <p class={styles.hint}>
            Choose a class in the top bar to take attendance and start picking.
          </p>
        )}
        {hasClass && (
          <>
            <AttendancePanel collapsible />
            <StatsRow collapsible />
            <SelectionStage compact />
          </>
        )}
        {!hasClass && <SelectionStage compact />}
      </div>
    );
  }

  // Teacher full picker: attendance left rail + stage right
  return (
    <div class={styles.view}>
      {!hasClass && (
        <p class={styles.hint}>
          Choose a class in the top bar to take attendance and start picking.
        </p>
      )}
      {hasClass ? (
        <div class={styles.layout}>
          <div class={styles.rail}>
            <AttendancePanel sidebar />
          </div>
          <div class={styles.mainCol}>
            <StatsRow />
            <SelectionStage />
          </div>
        </div>
      ) : (
        <SelectionStage />
      )}
    </div>
  );
}
