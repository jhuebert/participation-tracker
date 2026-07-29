import { route } from '@/state/store';
import { PickerView } from '@/features/picker/PickerView';
import { LeaderboardView } from '@/features/leaderboard/LeaderboardView';
import { ManageView } from '@/features/manage/ManageView';
import { SettingsDrawer } from '@/features/settings/SettingsDrawer';
import { TopBar } from '@/ui/TopBar';
import styles from './Shell.module.css';
import { useSplitResize } from '@/features/slides/useSplitResize';
import { lazy, Suspense } from 'preact/compat';

const SlidesPanel = lazy(() =>
  import('@/features/slides/SlidesPanel').then((m) => ({ default: m.SlidesPanel })),
);

export function SplitShell() {
  const r = route.value;
  const { pct, containerRef, onHandleDown } = useSplitResize(60);

  return (
    <div class={styles.shell}>
      <TopBar compact />
      <div class={styles.splitLayout} ref={containerRef}>
        <div class={styles.slidesPane} style={{ flex: `0 0 ${pct}%` }}>
          <Suspense
            fallback={
              <div class={styles.slidesLoading}>Loading slides engine…</div>
            }
          >
            <SlidesPanel />
          </Suspense>
        </div>
        <div
          class={styles.resizeHandle}
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={20}
          aria-valuemax={80}
          aria-valuenow={Math.round(pct)}
          aria-label="Resize slides panel"
          onMouseDown={onHandleDown}
        />
        <section class={styles.trackerPane} aria-label="Tracker">
          {r === 'picker' && <PickerView compact />}
          {r === 'leaderboard' && <LeaderboardView />}
          {r === 'manage' && <ManageView />}
        </section>
      </div>
      <SettingsDrawer />
    </div>
  );
}
