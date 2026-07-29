import { setEveryonePresent, setPresent } from '@/state/actions';
import { emptyStudentStats } from '@/domain/defaults';
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

  const classData = classes.value[className];
  const session = sessions.value[className];
  const students = Object.keys(classData.students).sort((a, b) => a.localeCompare(b));
  const presentSet = new Set(session?.present ?? []);
  const lastPicked = session?.lastPicked;
  const sessionSkips = session?.sessionSkips ?? {};

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
      <p class={styles.legend} title="Picks · Correct · Incorrect · Volunteers · Skips (session skips)">
        P · ✓ · ✗ · 🙋 · ⏭
      </p>
      <ul class={styles.list}>
        {students.map((name) => {
          const checked = presentSet.has(name);
          const stats = classData.students[name] ?? emptyStudentStats();
          const sSkips = sessionSkips[name] ?? 0;
          const isLast = lastPicked === name;
          return (
            <li key={name}>
              <label
                class={`${styles.row} ${checked ? styles.present : styles.absent} ${
                  isLast ? styles.last : ''
                }`}
                data-student={name}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    setPresent(name, (e.currentTarget as HTMLInputElement).checked)
                  }
                />
                <span class={styles.identity}>
                  <span class={styles.name} data-student-name={name}>
                    {name}
                    {isLast && (
                      <span class={styles.lastTag} title="Last picked">
                        last
                      </span>
                    )}
                  </span>
                  <span
                    class={styles.stats}
                    title={`Picks ${stats.picks}, Correct ${stats.correct}, Incorrect ${stats.incorrect}, Volunteers ${stats.volunteers}, Skips ${stats.skips}${
                      sSkips ? `, Session skips ${sSkips}` : ''
                    }`}
                  >
                    <span class={styles.stat}>
                      <span class={styles.statLabel}>P</span>
                      {stats.picks}
                    </span>
                    <span class={`${styles.stat} ${styles.correct}`}>
                      <span class={styles.statLabel}>✓</span>
                      {stats.correct}
                    </span>
                    <span class={`${styles.stat} ${styles.incorrect}`}>
                      <span class={styles.statLabel}>✗</span>
                      {stats.incorrect}
                    </span>
                    <span class={`${styles.stat} ${styles.volunteer}`}>
                      <span class={styles.statLabel}>🙋</span>
                      {stats.volunteers}
                    </span>
                    <span class={styles.stat}>
                      <span class={styles.statLabel}>⏭</span>
                      {stats.skips}
                      {sSkips > 0 && (
                        <span class={styles.sessionSkip} title="Session skips">
                          ({sSkips})
                        </span>
                      )}
                    </span>
                  </span>
                </span>
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
    <Tag class={`${styles.card} ${sidebar ? styles.sidebar : ''}`} aria-label="Attendance">
      <h3 class={styles.heading}>Attendance</h3>
      {body}
    </Tag>
  );
}
