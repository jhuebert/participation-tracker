import { useEffect, useRef } from 'preact/hooks';
import {
  canNext,
  canPrev,
  clearSlides,
  currentSlide,
  goToSlide,
  loadPptxFile,
  nextSlide,
  prevSlide,
  slideImages,
  slidesError,
  slidesFilename,
  slidesStatus,
} from '@/features/slides/slides-state';
import { Button } from '@/ui/Button';
import styles from './SlidesPanel.module.css';

export function ScopingNote() {
  return (
    <p class={styles.note}>
      Supported: backgrounds, images, and basic text. Animations and charts are
      not supported.
    </p>
  );
}

export function SlidesPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const status = slidesStatus.value;
  const images = slideImages.value;
  const index = currentSlide.value;
  const filename = slidesFilename.value;
  const error = slidesError.value;

  // Keyboard nav is registered while this panel is mounted (split mode only).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Don't steal keys while a dialog is open
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onFile = (file: File | undefined) => {
    if (file) void loadPptxFile(file);
  };

  const toggleFullscreen = () => {
    const el = panelRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  };

  return (
    <section ref={panelRef} class={styles.panel} aria-label="Slides">
      <div class={styles.toolbar}>
        <Button variant="secondary" size="sm" disabled={!canPrev.value} onClick={prevSlide}>
          ◀ Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={!canNext.value} onClick={nextSlide}>
          Next ▶
        </Button>
        <span class={styles.counter}>
          {images.length > 0
            ? `Slide ${index + 1} / ${images.length}`
            : 'No slides loaded'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={images.length === 0}
          onClick={toggleFullscreen}
          title="Fullscreen"
        >
          ⛶ Full
        </Button>
        <Button variant="success" size="sm" onClick={() => fileRef.current?.click()}>
          📂 Load PPTX
        </Button>
        {filename && status === 'ready' && (
          <Button variant="ghost" size="sm" onClick={clearSlides} title="Clear slides">
            Clear
          </Button>
        )}
        {filename && <span class={styles.filename}>{filename}</span>}
        <input
          ref={fileRef}
          type="file"
          accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          class={styles.hidden}
          onChange={(e) => {
            const f = (e.currentTarget as HTMLInputElement).files?.[0];
            onFile(f);
            (e.currentTarget as HTMLInputElement).value = '';
          }}
        />
      </div>

      {images.length > 0 && (
        <div class={styles.thumbs} role="list" aria-label="Slide thumbnails">
          {images.map((src, i) => (
            <button
              key={`${i}-${src.slice(0, 24)}`}
              type="button"
              role="listitem"
              class={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
              onClick={() => goToSlide(i)}
            >
              <img src={src} alt={`Slide ${i + 1}`} />
              <span class={styles.thumbNum}>{i + 1}</span>
            </button>
          ))}
        </div>
      )}

      <div
        class={styles.viewport}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add(styles.dragOver);
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove(styles.dragOver);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove(styles.dragOver);
          const f = e.dataTransfer?.files?.[0];
          onFile(f);
        }}
      >
        {status === 'loading' && (
          <div class={styles.loading} role="status">
            Processing slides…
          </div>
        )}

        {(status === 'empty' || status === 'error') && (
          <button
            type="button"
            class={styles.dropZone}
            onClick={() => fileRef.current?.click()}
          >
            <div class={styles.dropIcon}>📑</div>
            <div class={styles.dropTitle}>Drop a .pptx or browse</div>
            <div class={styles.dropSub}>Click or drag & drop a PowerPoint file</div>
            <ScopingNote />
            {error && <div class={styles.error}>⚠️ {error}</div>}
          </button>
        )}

        {status === 'ready' && images[index] && (
          <div class={styles.stage}>
            <img src={images[index]} alt={`Slide ${index + 1}`} class={styles.slideImg} />
          </div>
        )}
      </div>
    </section>
  );
}
