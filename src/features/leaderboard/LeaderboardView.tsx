import { useState } from 'preact/hooks';
import {
  buildCsv,
  buildLeaderboardRows,
  downloadTextFile,
  formatScore,
} from '@/features/leaderboard/helpers';
import { resetStatsForClass } from '@/state/actions';
import { classes, currentClass, scoringSettings } from '@/state/store';
import { confirm, toast } from '@/state/ui';
import { Button } from '@/ui/Button';
import styles from './LeaderboardView.module.css';

export function LeaderboardView() {
  const classNames = Object.keys(classes.value).sort((a, b) => a.localeCompare(b));
  const [selected, setSelected] = useState<string>(currentClass.value ?? '');
  const className = selected || currentClass.value || '';
  const cls = className ? classes.value[className] : null;
  const rows = cls ? buildLeaderboardRows(cls.students, scoringSettings.value) : [];

  const onExport = () => {
    if (!className || !cls) return;
    downloadTextFile(`${className}_statistics.csv`, buildCsv(rows), 'text/csv');
    toast('CSV exported!', 'success');
  };

  const onReset = async () => {
    if (!className) return;
    const ok = await confirm({
      title: 'Reset stats?',
      body: `Reset all stats for "${className}"? This cannot be undone.`,
      confirmLabel: 'Reset',
      danger: true,
    });
    if (!ok) return;
    resetStatsForClass(className);
    toast('Leaderboard reset!', 'success');
  };

  return (
    <div class={styles.view}>
      <div class={styles.toolbar}>
        <label class={styles.selectLabel}>
          Class
          <select
            class={styles.select}
            value={className}
            onChange={(e) => setSelected((e.currentTarget as HTMLSelectElement).value)}
          >
            <option value="">Select a class…</option>
            {classNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div class={styles.actions}>
          <Button variant="success" disabled={!className} onClick={onExport}>
            📊 Export CSV
          </Button>
          <Button variant="danger" disabled={!className} onClick={onReset}>
            Reset stats
          </Button>
        </div>
      </div>

      {!className && <p class={styles.empty}>Select a class</p>}

      {className && (
        <div class={styles.tableWrap}>
          <table class={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Picks</th>
                <th>Volunteers</th>
                <th>Skips</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Participation Pts</th>
                <th>Leaderboard Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>
                    <strong>#{r.rank}</strong>
                  </td>
                  <td>{r.name}</td>
                  <td>{r.picks}</td>
                  <td>{r.volunteers}</td>
                  <td>{r.skips}</td>
                  <td class={styles.correct}>{r.correct}</td>
                  <td class={styles.incorrect}>{r.incorrect}</td>
                  <td class={styles.pts}>{r.participationPoints}</td>
                  <td class={styles.score}>{formatScore(r.leaderboardScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
