import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import styles from './Modal.module.css';
import { Button } from './Button';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ComponentChildren;
  wide?: boolean;
}

export function Modal({ open, title, onClose, children, wide }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Focus first focusable
    const el = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    el?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      class={styles.scrim}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        class={`${styles.panel} ${wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header class={styles.header}>
          <h2 class={styles.title}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </header>
        <div class={styles.body}>{children}</div>
      </div>
    </div>
  );
}
