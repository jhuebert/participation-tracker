import { signal } from '@preact/signals';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

export const toastState = signal<ToastState | null>(null);
export const settingsOpen = signal(false);
export const confirmState = signal<ConfirmRequest | null>(null);

export interface ConfirmRequest {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let toastId = 0;

export function toast(message: string, tone: ToastTone = 'info'): void {
  if (toastTimer) clearTimeout(toastTimer);
  toastState.value = { id: ++toastId, message, tone };
  toastTimer = setTimeout(() => {
    toastState.value = null;
    toastTimer = null;
  }, 3000);
}

export function openSettings(): void {
  settingsOpen.value = true;
}

export function closeSettings(): void {
  settingsOpen.value = false;
}

export function confirm(opts: {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    confirmState.value = {
      ...opts,
      resolve: (ok) => {
        confirmState.value = null;
        resolve(ok);
      },
    };
  });
}
