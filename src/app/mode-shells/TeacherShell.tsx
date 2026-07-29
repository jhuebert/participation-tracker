import { route } from '@/state/store';
import { PickerView } from '@/features/picker/PickerView';
import { LeaderboardView } from '@/features/leaderboard/LeaderboardView';
import { ManageView } from '@/features/manage/ManageView';
import { SettingsDrawer } from '@/features/settings/SettingsDrawer';
import { TopBar } from '@/ui/TopBar';
import styles from './Shell.module.css';

export function TeacherShell() {
  const r = route.value;

  return (
    <div class={styles.shell}>
      <TopBar />
      <main class={styles.main}>
        {r === 'picker' && <PickerView />}
        {r === 'leaderboard' && <LeaderboardView />}
        {r === 'manage' && <ManageView />}
      </main>
      <SettingsDrawer />
    </div>
  );
}
