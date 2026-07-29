import type { AppRoute } from '@/domain/types';
import { route } from '@/state/store';
import styles from './Tabs.module.css';

const TABS: { id: AppRoute; label: string }[] = [
  { id: 'picker', label: 'Picker' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'manage', label: 'Manage' },
];

interface Props {
  compact?: boolean;
  fullWidth?: boolean;
}

export function Tabs({ compact = false, fullWidth = false }: Props) {
  const current = route.value;

  return (
    <nav
      class={`${styles.tabs} ${compact ? styles.compact : ''} ${fullWidth ? styles.fullWidth : ''}`}
      aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          class={`${styles.tab} ${current === tab.id ? styles.active : ''}`}
          aria-current={current === tab.id ? 'page' : undefined}
          onClick={() => {
            route.value = tab.id;
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
