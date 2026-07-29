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

  return (
    <div class={`${styles.view} ${compact ? styles.compact : ''}`}>
      {!hasClass && (
        <p class={styles.hint}>Choose a class in the top bar to take attendance and start picking.</p>
      )}
      {hasClass && (
        <>
          <AttendancePanel collapsible={compact} />
          {!compact && <StatsRow />}
          {compact && <StatsRow collapsible />}
          <SelectionStage compact={compact} />
        </>
      )}
      {!hasClass && <SelectionStage compact={compact} />}
    </div>
  );
}
