import JSZip from 'jszip';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  emf: 'image/x-emf',
  wmf: 'image/x-wmf',
  bmp: 'image/bmp',
};

const DEFAULT_SLIDE_W = 9_144_000;
const DEFAULT_SLIDE_H = 5_143_500;
const RENDER_WIDTH = 960;

export async function extractSlideImages(
  arrayBuffer: ArrayBuffer,
): Promise<string[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  return renderSlidesFromZip(zip);
}

/** Exposed for tests that build zips in-memory. */
export async function renderSlidesFromZip(zip: JSZip): Promise<string[]> {
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
      const nb = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
      return na - nb;
    });

  if (slideFiles.length === 0) return [];

  const mediaMap = await buildMediaMap(zip);
  const images: string[] = [];

  for (const slidePath of slideFiles) {
    try {
      const xmlStr = await zip.files[slidePath]!.async('string');
      const relPath = slidePath
        .replace('slides/slide', 'slides/_rels/slide')
        .replace('.xml', '.xml.rels');
      const relsStr = zip.files[relPath] ? await zip.files[relPath]!.async('string') : '';
      const rIdMap = parseRels(relsStr, mediaMap);
      const imgUrl = await renderSlideToImage(xmlStr, rIdMap, zip);
      if (imgUrl) images.push(imgUrl);
    } catch (err) {
      console.warn('Slide render error:', err);
    }
  }

  return images;
}

async function buildMediaMap(zip: JSZip): Promise<Record<string, string>> {
  const mediaMap: Record<string, string> = {};
  for (const [path, file] of Object.entries(zip.files)) {
    if (!path.startsWith('ppt/media/') || file.dir) continue;
    const filename = path.split('/').pop()!;
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'png';
    const mime = MIME[ext] ?? 'image/png';
    const blob = await file.async('blob');
    mediaMap[filename] = URL.createObjectURL(new Blob([blob], { type: mime }));
  }
  return mediaMap;
}

export function parseRels(relsStr: string, mediaMap: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  if (!relsStr) return map;
  const matches = relsStr.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g);
  for (const m of matches) {
    const filename = m[2].split('/').pop()!;
    if (mediaMap[filename]) map[m[1]] = mediaMap[filename];
  }
  // also match Target before Id
  const matches2 = relsStr.matchAll(/Target="([^"]+)"[^>]*Id="(rId\d+)"/g);
  for (const m of matches2) {
    const filename = m[1].split('/').pop()!;
    if (mediaMap[filename] && !map[m[2]]) map[m[2]] = mediaMap[filename];
  }
  return map;
}

async function renderSlideToImage(
  xmlStr: string,
  rIdMap: Record<string, string>,
  zip: JSZip,
): Promise<string | null> {
  let slideW = DEFAULT_SLIDE_W;
  let slideH = DEFAULT_SLIDE_H;
  try {
    const presXml = await zip.files['ppt/presentation.xml']?.async('string');
    if (presXml) {
      const szMatch = presXml.match(/p:sldSz[^/]*cx="(\d+)"[^/]*cy="(\d+)"/);
      if (szMatch) {
        slideW = parseInt(szMatch[1], 10);
        slideH = parseInt(szMatch[2], 10);
      }
    }
  } catch {
    /* defaults */
  }

  const W = RENDER_WIDTH;
  const H = Math.round(RENDER_WIDTH * (slideH / slideW));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const bgMatch = xmlStr.match(/p:bg>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
  if (bgMatch) {
    ctx.fillStyle = `#${bgMatch[1]}`;
    ctx.fillRect(0, 0, W, H);
  }

  const scaleX = W / slideW;
  const scaleY = H / slideH;

  // Images
  const pics = [...xmlStr.matchAll(/<p:pic>[\s\S]*?<\/p:pic>/g)];
  await Promise.all(
    pics.map(async (m) => {
      try {
        const ridMatch = m[0].match(/r:embed="(rId\d+)"/);
        if (!ridMatch || !rIdMap[ridMatch[1]]) return;
        const imgUrl = rIdMap[ridMatch[1]];

        const xfrm = m[0].match(/a:xfrm[^>]*>([\s\S]*?)<\/a:xfrm>/);
        if (!xfrm) return;
        const off = xfrm[1].match(/a:off[^/]*x="(\d+)"[^/]*y="(\d+)"/);
        const ext = xfrm[1].match(/a:ext[^/]*cx="(\d+)"[^/]*cy="(\d+)"/);
        if (!off || !ext) return;

        const x = parseInt(off[1], 10) * scaleX;
        const y = parseInt(off[2], 10) * scaleY;
        const w = parseInt(ext[1], 10) * scaleX;
        const h = parseInt(ext[2], 10) * scaleY;

        await loadAndDraw(ctx, imgUrl, x, y, w, h);
      } catch {
        /* skip pic */
      }
    }),
  );

  // Text shapes
  const shapes = [...xmlStr.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)];
  for (const shape of shapes) {
    const s = shape[0];
    try {
      const xfrm = s.match(/a:xfrm[^>]*>([\s\S]*?)<\/a:xfrm>/);
      if (!xfrm) continue;
      const off = xfrm[1].match(/a:off[^/]*x="(-?\d+)"[^/]*y="(-?\d+)"/);
      const ext = xfrm[1].match(/a:ext[^/]*cx="(\d+)"[^/]*cy="(\d+)"/);
      if (!off || !ext) continue;

      const x = parseInt(off[1], 10) * scaleX;
      const y = parseInt(off[2], 10) * scaleY;
      const w = parseInt(ext[1], 10) * scaleX;
      const h = parseInt(ext[2], 10) * scaleY;

      const solidFill = s.match(/spPr>[\s\S]*?<a:solidFill>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
      if (solidFill) {
        ctx.fillStyle = `#${solidFill[1]}`;
        ctx.fillRect(x, y, w, h);
      }

      const paras = [...s.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)];
      let lineY = y + 4;

      for (const para of paras) {
        const p = para[1];
        const szMatch = p.match(/a:sz val="(\d+)"/);
        const sz = szMatch
          ? Math.round((parseInt(szMatch[1], 10) / 100) * scaleY * (slideH / H) * 0.85)
          : 14;
        const fontSz = Math.max(8, Math.min(sz, 60));
        const bold = /a:b val="1"/.test(p) || /<a:b\/>/.test(p) ? 'bold ' : '';
        const colorMatch = p.match(/a:solidFill>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
        ctx.fillStyle = colorMatch ? `#${colorMatch[1]}` : '#000000';
        ctx.font = `${bold}${fontSz}px Segoe UI, Arial, sans-serif`;

        const runs = [...p.matchAll(/<a:t>([^<]*)<\/a:t>/g)];
        const text = runs.map((r) => r[1]).join('');
        if (!text.trim()) {
          lineY += fontSz * 1.4;
          continue;
        }

        const words = text.split(' ');
        let line = '';
        const lineH = fontSz * 1.4;
        for (const word of words) {
          const test = `${line}${word} `;
          if (ctx.measureText(test).width > w - 8 && line) {
            ctx.fillText(line.trim(), x + 4, lineY + fontSz);
            line = `${word} `;
            lineY += lineH;
          } else {
            line = test;
          }
        }
        if (line.trim()) {
          ctx.fillText(line.trim(), x + 4, lineY + fontSz);
          lineY += lineH;
        }
      }
    } catch {
      /* skip shape */
    }
  }

  return canvas.toDataURL('image/png');
}

function loadAndDraw(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        ctx.drawImage(img, x, y, w, h);
      } catch {
        /* ignore */
      }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

/** Build a minimal valid-ish pptx zip for unit tests (no canvas needed for listing). */
export function listSlidePaths(zip: JSZip): string[] {
  return Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
      const nb = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
      return na - nb;
    });
}
