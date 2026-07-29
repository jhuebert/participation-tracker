import { computed, signal } from '@preact/signals';
import { extractSlideImages } from '@/features/slides/pptx-parser';
import type { SlidesStatus } from '@/features/slides/types';

export const slidesStatus = signal<SlidesStatus>('empty');
export const slidesError = signal<string | null>(null);
export const slidesFilename = signal<string | null>(null);
export const slideImages = signal<string[]>([]);
export const currentSlide = signal(0);

export const slideCount = computed(() => slideImages.value.length);
export const hasSlides = computed(() => slideImages.value.length > 0);
export const canPrev = computed(() => currentSlide.value > 0);
export const canNext = computed(
  () => currentSlide.value < slideImages.value.length - 1,
);

function revokeAll(urls: string[]): void {
  for (const u of urls) {
    if (u.startsWith('blob:')) URL.revokeObjectURL(u);
  }
}

export function clearSlides(): void {
  revokeAll(slideImages.value);
  slideImages.value = [];
  currentSlide.value = 0;
  slidesFilename.value = null;
  slidesError.value = null;
  slidesStatus.value = 'empty';
}

export async function loadPptxFile(file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith('.pptx')) {
    slidesError.value = 'Please drop a .pptx file.';
    slidesStatus.value = 'error';
    return;
  }

  slidesStatus.value = 'loading';
  slidesError.value = null;
  slidesFilename.value = file.name;

  const previous = slideImages.value;
  try {
    const buffer = await file.arrayBuffer();
    const images = await extractSlideImages(buffer);
    if (images.length === 0) {
      slidesError.value =
        'Could not render slides. Make sure the file is a valid .pptx.';
      slidesStatus.value = 'error';
      slideImages.value = [];
      currentSlide.value = 0;
      revokeAll(previous);
      return;
    }
    slideImages.value = images;
    currentSlide.value = 0;
    slidesStatus.value = 'ready';
    revokeAll(previous);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    slidesError.value = `Failed to load PPTX: ${message}`;
    slidesStatus.value = 'error';
    slideImages.value = [];
    currentSlide.value = 0;
    revokeAll(previous);
  }
}

export function goToSlide(index: number): void {
  const total = slideImages.value.length;
  if (index < 0 || index >= total) return;
  currentSlide.value = index;
}

export function prevSlide(): void {
  goToSlide(currentSlide.value - 1);
}

export function nextSlide(): void {
  goToSlide(currentSlide.value + 1);
}
