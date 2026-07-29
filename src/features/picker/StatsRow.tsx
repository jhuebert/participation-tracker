import { classes, currentClass, sessions } from '@/state/store';
import styles from './StatsRow.module.css';

interface Props {
  collapsible?: boolean;
}

export function StatsRow({ collapsible = false }: Props) {
  const className = currentClass.value;
  if (!className || !classes.value[className]) return null;

  const students = Object.values(classes.value[className].students);
  const present = sessions.value[className]?.present.length ?? 0;
  const picks = students.reduce((s, st) => s + st.picks, 0);
  const correct = students.reduce((s, st) => s + st.correct, 0);
  const volunteers = students.reduce((s, st) => s + st.volunteers, 0);
  const skips = students.reduce((s, st) => s + st.skips, 0);

  const cards = (
    <div class={styles.grid}>
      <Stat label="Present" value={present} />
      <Stat label="Picks" value={picks} />
      <Stat label="Correct" value={correct} />
      <Stat label="Volunteers" value={volunteers} />
      <Stat label="Skips" value={skips} />
    </div>
  );

  if (collapsible) {
    return (
      <details class={styles.wrap}>
        <summary class={styles.summary}>Session stats</summary>
        <div class={styles.body}>{cards}</div>
      </details>
    );
  }

  return <section class={styles.wrap}>{cards}</section>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div class={styles.card}>
      <div class={styles.value}>{value}</div>
      <div class={styles.label}>{label}</div>
    </div>
  );
}
