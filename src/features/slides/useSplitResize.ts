import { useEffect, useRef, useState } from 'preact/hooks';

const MIN = 20;
const MAX = 80;
const DEFAULT = 60;

export function useSplitResize(initial = DEFAULT) {
  const [pct, setPct] = useState(initial);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startPct = useRef(initial);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const total = containerRef.current.offsetWidth;
      if (total <= 0) return;
      const delta = e.clientX - startX.current;
      const next = Math.min(MAX, Math.max(MIN, startPct.current + (delta / total) * 100));
      setPct(next);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onHandleDown = (e: MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startPct.current = pct;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return { pct, containerRef, onHandleDown };
}
