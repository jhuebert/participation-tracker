import { setEveryonePresent, setPresent } from '@/state/actions';
import { classes, currentClass, sessions } from '@/state/store';
import { Button } from '@/ui/Button';
import styles from './AttendancePanel.module.css';

interface Props {
  collapsible?: boolean;
}

export function AttendancePanel({ collapsible = false }: Props) {
  const className = currentClass.value;
  if (!className || !classes.value[className]) return null;

  const students = Object.keys(classes.value[className].students).sort((a, b) =>
    a.localeCompare(b),
  );
  const presentSet = new Set(sessions.value[className]?.present ?? []);

  const body = (
    <>
      <div class={styles.toolbar}>
        <span class={styles.count}>
          Present today · {presentSet.size}/{students.length}
        </span>
        <div class={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEveryonePresent(true)}>
            Select all
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEveryonePresent(false)}>
            Deselect all
          </Button>
        </div>
      </div>
      <div class={styles.grid}>
        {students.map((name) => {
          const checked = presentSet.has(name);
          return (
            <label key={name} class={`${styles.chip} ${checked ? styles.present : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  setPresent(name, (e.currentTarget as HTMLInputElement).checked)
                }
              />
              <span>{name}</span>
            </label>
          );
        })}
      </div>
    </>
  );

  if (collapsible) {
    return (
      <details class={styles.card} open>
        <summary class={styles.summary}>Attendance</summary>
        <div class={styles.detailsBody}>{body}</div>
      </details>
    );
  }

  return (
    <section class={styles.card} aria-label="Attendance">
      <h3 class={styles.heading}>Attendance</h3>
      {body}
    </section>
  );
}
