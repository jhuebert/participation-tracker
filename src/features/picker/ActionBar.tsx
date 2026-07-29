import { useState } from 'preact/hooks';
import {
  markCorrect,
  markIncorrect,
  markSkip,
  pickRandom,
  resetSkips,
  selectVolunteer,
  setSkipLimit,
  teacherPick,
} from '@/state/actions';
import { classes, currentClass, currentStudent, sessions, skipLimit } from '@/state/store';
import { toast } from '@/state/ui';
import { Button } from '@/ui/Button';
import { Modal } from '@/ui/Modal';
import styles from './ActionBar.module.css';

interface Props {
  compact?: boolean;
}

export function ActionBar({ compact = false }: Props) {
  const className = currentClass.value;
  const hasClass = !!className && !!classes.value[className];
  const present = className ? (sessions.value[className]?.present ?? []) : [];
  const hasSelection = !!currentStudent.value;
  const roster = className ? Object.keys(classes.value[className]?.students ?? {}) : [];

  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState('');

  const onPick = () => {
    if (!hasClass) return;
    if (present.length === 0) {
      toast('No students present!', 'error');
      return;
    }
    pickRandom();
  };

  const onSkip = () => {
    const err = markSkip();
    if (err) toast(err, 'error');
  };

  const openVolunteer = () => {
    if (present.length === 0) {
      toast('No students present!', 'error');
      return;
    }
    setVolunteerOpen(true);
  };

  const openTeacher = () => {
    if (!hasClass) return;
    setTeacherQuery('');
    setTeacherOpen(true);
  };

  const lastPicked = className ? sessions.value[className]?.lastPicked : undefined;
  const presentSet = new Set(present);
  const q = teacherQuery.trim().toLowerCase();
  const teacherList = roster
    .filter((n) => !q || n.toLowerCase().includes(q))
    .sort((a, b) => a.localeCompare(b));
  const teacherPresent = teacherList.filter((n) => presentSet.has(n));
  const teacherAbsent = teacherList.filter((n) => !presentSet.has(n));

  return (
    <div class={`${styles.bar} ${compact ? styles.compact : ''}`}>
      <div class={styles.row}>
        <Button variant="primary" disabled={!hasClass} onClick={onPick}>
          🎲 Pick Random
        </Button>
        <Button variant="info" disabled={!hasClass} onClick={openTeacher}>
          🍎 Teacher Pick
        </Button>
        <Button variant="volunteer" disabled={!hasClass} onClick={openVolunteer}>
          🙋 Volunteer
        </Button>
      </div>
      <div class={styles.row}>
        <Button variant="success" disabled={!hasSelection} onClick={markCorrect}>
          ✓ Correct
        </Button>
        <Button variant="danger" disabled={!hasSelection} onClick={markIncorrect}>
          ✗ Incorrect
        </Button>
        <Button variant="warning" disabled={!hasSelection} onClick={onSkip}>
          ⏭ Skip
        </Button>
      </div>
      <div class={styles.skipRow}>
        <label class={styles.skipLabel}>
          Skip limit
          <input
            type="number"
            min={0}
            max={20}
            value={skipLimit.value}
            class={styles.skipInput}
            onInput={(e) =>
              setSkipLimit(parseInt((e.currentTarget as HTMLInputElement).value, 10) || 0)
            }
          />
        </label>
        <Button variant="secondary" size="sm" disabled={!hasClass} onClick={resetSkips}>
          Reset session skips
        </Button>
      </div>

      <Modal
        open={volunteerOpen}
        title="Select Volunteer"
        onClose={() => setVolunteerOpen(false)}
      >
        <div class={styles.pickGrid}>
          {[...present].sort((a, b) => a.localeCompare(b)).map((name) => (
            <button
              key={name}
              type="button"
              class={styles.pickBtn}
              onClick={() => {
                selectVolunteer(name);
                setVolunteerOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={teacherOpen}
        title="Teacher Pick"
        onClose={() => setTeacherOpen(false)}
        wide
      >
        <input
          type="search"
          class={styles.search}
          placeholder="Search students…"
          value={teacherQuery}
          onInput={(e) => setTeacherQuery((e.currentTarget as HTMLInputElement).value)}
        />
        <div class={styles.pickGrid}>
          {teacherPresent.length === 0 && teacherAbsent.length === 0 && (
            <p class={styles.empty}>No students match.</p>
          )}
          {teacherPresent.length > 0 && teacherAbsent.length > 0 && (
            <div class={styles.groupLabel}>Present</div>
          )}
          {teacherPresent.map((name) => (
            <TeacherPickButton
              key={name}
              name={name}
              last={name === lastPicked}
              absent={false}
              onPick={() => {
                teacherPick(name);
                setTeacherOpen(false);
              }}
            />
          ))}
          {teacherAbsent.length > 0 && <div class={styles.groupLabel}>Absent</div>}
          {teacherAbsent.map((name) => (
            <TeacherPickButton
              key={name}
              name={name}
              last={name === lastPicked}
              absent
              onPick={() => {
                teacherPick(name);
                setTeacherOpen(false);
              }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}

function TeacherPickButton({
  name,
  last,
  absent,
  onPick,
}: {
  name: string;
  last: boolean;
  absent: boolean;
  onPick: () => void;
}) {
  const className = currentClass.value!;
  const stats = classes.value[className]?.students[name];
  return (
    <button
      type="button"
      class={`${styles.teacherBtn} ${last ? styles.last : ''} ${absent ? styles.absent : ''}`}
      onClick={onPick}
    >
      <span class={styles.teacherName}>
        {name}
        {last && <span class={styles.lastTag}> last</span>}
      </span>
      <span class={styles.teacherMeta}>
        Picks: {stats?.picks ?? 0} · ✓{stats?.correct ?? 0} · ✗{stats?.incorrect ?? 0}
      </span>
    </button>
  );
}
