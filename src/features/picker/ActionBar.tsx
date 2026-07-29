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
import { StudentPickModal, type StudentPickMode } from '@/features/picker/StudentPickModal';
import styles from './ActionBar.module.css';

interface Props {
  compact?: boolean;
}

export function ActionBar({ compact = false }: Props) {
  const className = currentClass.value;
  const hasClass = !!className && !!classes.value[className];
  const present = className ? (sessions.value[className]?.present ?? []) : [];
  const hasSelection = !!currentStudent.value;

  const [pickMode, setPickMode] = useState<StudentPickMode | null>(null);

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
    if (!hasClass) return;
    if (present.length === 0) {
      toast('No students present!', 'error');
      return;
    }
    setPickMode('volunteer');
  };

  const openTeacher = () => {
    if (!hasClass) return;
    setPickMode('teacher');
  };

  const onStudentChosen = (name: string) => {
    if (pickMode === 'volunteer') selectVolunteer(name);
    else if (pickMode === 'teacher') teacherPick(name);
  };

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

      <StudentPickModal
        open={pickMode !== null}
        mode={pickMode ?? 'teacher'}
        onClose={() => setPickMode(null)}
        onPick={onStudentChosen}
      />
    </div>
  );
}
