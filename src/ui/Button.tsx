import type { ComponentChildren, JSX } from 'preact';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'volunteer'
  | 'info'
  | 'ghost';

export type ButtonSize = 'sm' | 'md';

type ButtonHTML = Omit<JSX.IntrinsicElements['button'], 'size' | 'class'>;

interface Props extends ButtonHTML {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ComponentChildren;
  class?: string;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  class: className,
  type = 'button',
  ...rest
}: Props) {
  const cls = [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : styles.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} class={cls} {...rest}>
      {children}
    </button>
  );
}
