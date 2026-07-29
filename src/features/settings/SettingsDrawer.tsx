import { scoringFormulaPreview } from '@/domain/scoring';
import type { Effect, WeightDir } from '@/domain/types';
import { setSkipLimit, updateScoring, updateWeights } from '@/state/actions';
import { scoringSettings, skipLimit, weightSettings } from '@/state/store';
import { closeSettings, settingsOpen } from '@/state/ui';
import { Drawer } from '@/ui/Drawer';
import styles from './SettingsDrawer.module.css';

export function SettingsDrawer() {
  const open = settingsOpen.value;
  const w = weightSettings.value;
  const s = scoringSettings.value;

  return (
    <Drawer open={open} title="Settings" onClose={closeSettings}>
      <section class={styles.section}>
        <h3 class={styles.h3}>Weighted selection</h3>
        <label class={styles.toggle}>
          <input
            type="checkbox"
            checked={w.enabled}
            onChange={(e) =>
              updateWeights({ enabled: (e.currentTarget as HTMLInputElement).checked })
            }
          />
          Enable weighted random picks
        </label>

        <WeightRow
          label="🙋 Volunteer"
          dir={w.volunteerDir}
          amt={w.volunteerAmt}
          onDir={(volunteerDir) => updateWeights({ volunteerDir })}
          onAmt={(volunteerAmt) => updateWeights({ volunteerAmt })}
        />
        <WeightRow
          label="✓ Correct"
          dir={w.correctDir}
          amt={w.correctAmt}
          onDir={(correctDir) => updateWeights({ correctDir })}
          onAmt={(correctAmt) => updateWeights({ correctAmt })}
        />
        <WeightRow
          label="✗ Incorrect"
          dir={w.incorrectDir}
          amt={w.incorrectAmt}
          onDir={(incorrectDir) => updateWeights({ incorrectDir })}
          onAmt={(incorrectAmt) => updateWeights({ incorrectAmt })}
        />
        <WeightRow
          label="⏭ Skip"
          dir={w.skipDir}
          amt={w.skipAmt}
          onDir={(skipDir) => updateWeights({ skipDir })}
          onAmt={(skipAmt) => updateWeights({ skipAmt })}
        />
      </section>

      <section class={styles.section}>
        <h3 class={styles.h3}>Scoring</h3>
        <ScoreRow
          label="✓ Correct"
          effect={s.correctEffect}
          points={s.correctPoints}
          onEffect={(correctEffect) => updateScoring({ correctEffect })}
          onPoints={(correctPoints) => updateScoring({ correctPoints })}
        />
        <ScoreRow
          label="🙋 Volunteer"
          effect={s.volunteerEffect}
          points={s.volunteerPoints}
          onEffect={(volunteerEffect) => updateScoring({ volunteerEffect })}
          onPoints={(volunteerPoints) => updateScoring({ volunteerPoints })}
        />
        <ScoreRow
          label="✗ Incorrect"
          effect={s.incorrectEffect}
          points={s.incorrectPoints}
          onEffect={(incorrectEffect) => updateScoring({ incorrectEffect })}
          onPoints={(incorrectPoints) => updateScoring({ incorrectPoints })}
        />
        <ScoreRow
          label="⏭ Skip"
          effect={s.skipEffect}
          points={s.skipPoints}
          onEffect={(skipEffect) => updateScoring({ skipEffect })}
          onPoints={(skipPoints) => updateScoring({ skipPoints })}
        />
        <p class={styles.preview}>{scoringFormulaPreview(s)}</p>
      </section>

      <section class={styles.section}>
        <h3 class={styles.h3}>Session</h3>
        <label class={styles.field}>
          Skip limit per session
          <input
            type="number"
            min={0}
            max={20}
            value={skipLimit.value}
            onInput={(e) =>
              setSkipLimit(parseInt((e.currentTarget as HTMLInputElement).value, 10) || 0)
            }
          />
        </label>
      </section>
    </Drawer>
  );
}

function WeightRow({
  label,
  dir,
  amt,
  onDir,
  onAmt,
}: {
  label: string;
  dir: WeightDir;
  amt: number;
  onDir: (d: WeightDir) => void;
  onAmt: (n: number) => void;
}) {
  return (
    <div class={styles.row}>
      <div class={styles.rowLabel}>{label}</div>
      <div class={styles.radios}>
        <label>
          <input
            type="radio"
            checked={dir === 'decrease'}
            onChange={() => onDir('decrease')}
          />{' '}
          Less likely
        </label>
        <label>
          <input
            type="radio"
            checked={dir === 'increase'}
            onChange={() => onDir('increase')}
          />{' '}
          More likely
        </label>
      </div>
      <label class={styles.amt}>
        Amount
        <input
          type="number"
          min={0}
          max={200}
          value={amt}
          onInput={(e) => onAmt(parseInt((e.currentTarget as HTMLInputElement).value, 10) || 0)}
        />
      </label>
    </div>
  );
}

function ScoreRow({
  label,
  effect,
  points,
  onEffect,
  onPoints,
}: {
  label: string;
  effect: Effect;
  points: number;
  onEffect: (e: Effect) => void;
  onPoints: (n: number) => void;
}) {
  return (
    <div class={styles.row}>
      <div class={styles.rowLabel}>{label}</div>
      <div class={styles.radios}>
        <label>
          <input type="radio" checked={effect === 'add'} onChange={() => onEffect('add')} /> Add
        </label>
        <label>
          <input
            type="radio"
            checked={effect === 'subtract'}
            onChange={() => onEffect('subtract')}
          />{' '}
          Subtract
        </label>
      </div>
      <label class={styles.amt}>
        Points
        <input
          type="number"
          min={0}
          max={100}
          value={points}
          onInput={(e) =>
            onPoints(parseInt((e.currentTarget as HTMLInputElement).value, 10) || 0)
          }
        />
      </label>
    </div>
  );
}
