import { mode, setMode } from '@/state/store';
import type { AppMode } from '@/domain/types';
import styles from './ModeSelect.module.css';

const OPTIONS: { value: AppMode; label: string }[] = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student (projector)' },
  { value: 'split', label: 'Split (slides + tracker)' },
];

interface Props {
  /** Stacked label + large control (welcome screen). Default is inline for the top bar. */
  large?: boolean;
}

export function ModeSelect({ large = false }: Props) {
  const current = mode.value;
  const labelText = large ? 'Choose a mode' : 'Mode';

  return (
    <label class={`${styles.wrap} ${large ? styles.large : styles.inline}`}>
      <span class={styles.label}>{labelText}</span>
      <select
        class={styles.select}
        value={current ?? ''}
        aria-label={labelText}
        onChange={(e) => {
          const value = (e.currentTarget as HTMLSelectElement).value as AppMode | '';
          if (!value) return;
          setMode(value);
        }}
      >
        {!current && <option value="">Select mode…</option>}
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
