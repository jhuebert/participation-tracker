import { classes, currentClass } from '@/state/store';
import { selectClass } from '@/state/actions';
import styles from './ClassSelect.module.css';

interface Props {
  id?: string;
  compact?: boolean;
}

export function ClassSelect({ id = 'class-select', compact = false }: Props) {
  const names = Object.keys(classes.value).sort((a, b) => a.localeCompare(b));
  const value = currentClass.value ?? '';

  return (
    <label class={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <span class={styles.label}>Class</span>
      <select
        id={id}
        class={styles.select}
        value={value}
        onChange={(e) => {
          const v = (e.currentTarget as HTMLSelectElement).value;
          // Restore persisted attendance/skips when available; fresh session if none.
          selectClass(v || null);
        }}
      >
        <option value="">Select a class…</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
