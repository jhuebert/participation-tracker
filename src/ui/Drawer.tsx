import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { Button } from '@/ui/Button';
import styles from './Drawer.module.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}

export function Drawer({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div class={styles.root}>
      <div class={styles.scrim} onClick={onClose} role="presentation" />
      <aside class={styles.panel} role="dialog" aria-modal="true" aria-label={title}>
        <header class={styles.header}>
          <h2 class={styles.title}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close settings">
            ✕
          </Button>
        </header>
        <div class={styles.body}>{children}</div>
      </aside>
    </div>
  );
}
