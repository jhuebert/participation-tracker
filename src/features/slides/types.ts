export interface SlideDeck {
  filename: string;
  /** data URLs or object URLs for each rendered slide */
  images: string[];
}

export type SlidesStatus = 'empty' | 'loading' | 'ready' | 'error';
