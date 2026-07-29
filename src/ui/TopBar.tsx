import { ModeSelect } from '@/ui/ModeSelect';
import { ClassSelect } from '@/ui/ClassSelect';
import { Tabs } from '@/ui/Tabs';
import { Button } from '@/ui/Button';
import { openSettings } from '@/state/ui';
import { mode } from '@/state/store';
import styles from './TopBar.module.css';

interface Props {
  compact?: boolean;
}

export function TopBar({ compact = false }: Props) {
  const showTabs = mode.value === 'teacher' || mode.value === 'split';

  return (
    <header class={`${styles.bar} ${compact ? styles.compact : ''}`}>
      <div class={styles.left}>
        <div class={styles.brand}>
          <span class={styles.title}>Participation Tracker</span>
          {!compact && <span class={styles.version}>v{__APP_VERSION__}</span>}
        </div>
        <ClassSelect compact={compact} />
      </div>

      {showTabs && (
        <div class={styles.center}>
          <Tabs compact={compact} />
        </div>
      )}

      <div class={styles.right}>
        <Button
          variant="ghost"
          size="sm"
          onClick={openSettings}
          aria-label="Open settings"
          title="Settings"
        >
          ⚙️ Settings
        </Button>
        <ModeSelect />
      </div>
    </header>
  );
}
