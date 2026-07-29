import { confirmState } from '@/state/ui';
import { Button } from '@/ui/Button';
import styles from './ConfirmDialog.module.css';

export function ConfirmDialog() {
  const req = confirmState.value;
  if (!req) return null;

  return (
    <div class={styles.scrim} role="presentation">
      <div class={styles.panel} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" class={styles.title}>
          {req.title}
        </h2>
        <p class={styles.body}>{req.body}</p>
        <div class={styles.actions}>
          <Button variant="secondary" onClick={() => req.resolve(false)}>
            Cancel
          </Button>
          <Button
            variant={req.danger ? 'danger' : 'primary'}
            onClick={() => req.resolve(true)}
          >
            {req.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
