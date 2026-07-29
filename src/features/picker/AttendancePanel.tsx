import { setEveryonePresent, setPresent } from '@/state/actions';
import { classes, currentClass, sessions } from '@/state/store';
import { Button } from '@/ui/Button';
import styles from './AttendancePanel.module.css';

interface Props {
  /** Compact/collapsible for split mode right pane */
  collapsible?: boolean;
  /** Vertical list in a side rail (teacher picker) */
  sidebar?: boolean;
}

export function AttendancePanel({ collapsible = false, sidebar = false }: Props) {
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
          {sidebar
            ? `${presentSet.size}/${students.length} present`
            : `Present today · ${presentSet.size}/${students.length}`}
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
      <ul class={`${styles.list} ${sidebar ? styles.listSidebar : ''}`}>
        {students.map((name) => {
          const checked = presentSet.has(name);
          return (
            <li key={name}>
              <label class={`${styles.row} ${checked ? styles.present : styles.absent}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    setPresent(name, (e.currentTarget as HTMLInputElement).checked)
                  }
                />
                <span class={styles.name}>{name}</span>
              </label>
            </li>
          );
        })}
      </ul>
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

  const Tag = sidebar ? 'aside' : 'section';
  return (
    <Tag
      class={`${styles.card} ${sidebar ? styles.sidebar : ''}`}
      aria-label="Attendance"
    >
      <h3 class={styles.heading}>Attendance</h3>
      {body}
    </Tag>
  );
}
