import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { emptyStudentStats } from '@/domain/defaults';
import { classes, currentClass, sessions } from '@/state/store';
import { Modal } from '@/ui/Modal';
import styles from './StudentPickModal.module.css';

export type StudentPickMode = 'teacher' | 'volunteer';

interface Props {
  open: boolean;
  mode: StudentPickMode;
  onClose: () => void;
  onPick: (name: string) => void;
}

export function StudentPickModal({ open, mode, onClose, onPick }: Props) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const className = currentClass.value;
  const classData = className ? classes.value[className] : null;
  const session = className ? sessions.value[className] : null;
  const lastPicked = session?.lastPicked;
  const sessionStats = session?.sessionStats ?? {};
  const presentSet = useMemo(() => new Set(session?.present ?? []), [session?.present]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    // Focus search after modal mounts
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, mode]);

  const roster = useMemo(() => {
    if (!classData) return [] as string[];
    const names =
      mode === 'volunteer'
        ? Object.keys(classData.students).filter((n) => presentSet.has(n))
        : Object.keys(classData.students);
    return names.sort((a, b) => a.localeCompare(b));
  }, [classData, mode, presentSet]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? roster.filter((n) => n.toLowerCase().includes(q)) : roster),
    [roster, q],
  );

  const present = filtered.filter((n) => presentSet.has(n));
  const absent = mode === 'teacher' ? filtered.filter((n) => !presentSet.has(n)) : [];
  const showGroups = mode === 'teacher' && present.length > 0 && absent.length > 0;

  const title = mode === 'teacher' ? 'Teacher Pick' : 'Select Volunteer';
  const emptyCopy =
    mode === 'volunteer'
      ? presentSet.size === 0
        ? 'No students present.'
        : 'No students match.'
      : 'No students match.';

  return (
    <Modal open={open} title={title} onClose={onClose} wide>
      <div class={`${styles.body} ${mode === 'volunteer' ? styles.volunteer : styles.teacher}`}>
        <input
          ref={searchRef}
          type="search"
          class={styles.search}
          placeholder="Search students…"
          value={query}
          aria-label="Search students"
          onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
        />

        <div class={styles.grid}>
          {filtered.length === 0 && <p class={styles.empty}>{emptyCopy}</p>}

          {showGroups && <div class={styles.groupLabel}>Present</div>}
          {present.map((name) => (
            <StudentPickCard
              key={name}
              name={name}
              last={name === lastPicked}
              absent={false}
              stats={sessionStats[name] ?? emptyStudentStats()}
              mode={mode}
              onPick={() => {
                onPick(name);
                onClose();
              }}
            />
          ))}

          {absent.length > 0 && <div class={styles.groupLabel}>Absent</div>}
          {absent.map((name) => (
            <StudentPickCard
              key={name}
              name={name}
              last={name === lastPicked}
              absent
              stats={sessionStats[name] ?? emptyStudentStats()}
              mode={mode}
              onPick={() => {
                onPick(name);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function StudentPickCard({
  name,
  last,
  absent,
  stats,
  mode,
  onPick,
}: {
  name: string;
  last: boolean;
  absent: boolean;
  stats: ReturnType<typeof emptyStudentStats>;
  mode: StudentPickMode;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      class={`${styles.card} ${last ? styles.last : ''} ${absent ? styles.absent : ''} ${
        mode === 'volunteer' ? styles.cardVolunteer : styles.cardTeacher
      }`}
      onClick={onPick}
    >
      <span class={styles.cardName}>
        {mode === 'volunteer' && <span class={styles.volunteerIcon}>🙋</span>}
        {name}
        {last && <span class={styles.lastTag}> last</span>}
      </span>
      <span class={styles.cardMeta} title="Current session statistics">
        Session · Picks {stats.picks}
        <span class={styles.dot}>·</span>
        <span class={styles.correct}>✓{stats.correct}</span>
        <span class={styles.dot}>·</span>
        <span class={styles.incorrect}>✗{stats.incorrect}</span>
        <span class={styles.dot}>·</span>
        <span class={styles.volStat}>🙋{stats.volunteers}</span>
        <span class={styles.dot}>·</span>⏭{stats.skips}
      </span>
    </button>
  );
}
