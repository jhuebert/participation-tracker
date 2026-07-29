import { toastState } from '@/state/ui';
import styles from './Toast.module.css';

export function Toast() {
  const t = toastState.value;
  if (!t) return null;

  return (
    <div class={`${styles.toast} ${styles[t.tone]}`} role="status" aria-live="polite">
      {t.message}
    </div>
  );
}
