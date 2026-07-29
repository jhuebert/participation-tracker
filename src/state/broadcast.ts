import type { BroadcastMessage } from '@/domain/types';

export const BROADCAST_CHANNEL_NAME = 'participation-tracker-sync';

export type BroadcastHandler = (message: BroadcastMessage) => void;

export interface BroadcastClient {
  post: (message: BroadcastMessage) => void;
  close: () => void;
}

export function createBroadcastClient(onMessage: BroadcastHandler): BroadcastClient {
  let channel: BroadcastChannel | null = null;

  try {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const data = event.data;
      if (!data || typeof data !== 'object' || !('type' in data)) return;
      onMessage(data);
    };
  } catch {
    channel = null;
  }

  return {
    post(message) {
      channel?.postMessage(message);
    },
    close() {
      channel?.close();
      channel = null;
    },
  };
}
