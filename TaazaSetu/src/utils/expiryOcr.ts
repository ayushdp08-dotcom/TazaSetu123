/**
 * Expiry-date reading from a photo of the package label.
 * 1) Tries the serverless /api/ocr route (vision model, needs an API key on Vercel).
 * 2) Falls back to in-browser Tesseract OCR (no key needed).
 * The owner always confirms the result before it is saved.
 */
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const fullYear = (y: number) => (y < 100 ? 2000 + y : y);
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate();

/** Pull every plausible date out of OCR text and return the latest one (expiry is usually after MFG). */
export function parseExpiryDate(text: string): string | null {
  const t = text.toUpperCase().replace(/[,|]/g, ' ').replace(/\s+/g, ' ');
  const found: string[] = [];
  let m: RegExpExecArray | null;

  const dmy = /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/g;
  while ((m = dmy.exec(t))) {
    const d = +m[1], mo = +m[2], y = fullYear(+m[3]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) found.push(iso(y, mo, d));
  }
  const dMonY = new RegExp(`\\b(\\d{1,2})\\s?(${MONTHS.join('|')})[A-Z]*\\s?['’]?(\\d{2,4})\\b`, 'g');
  while ((m = dMonY.exec(t))) found.push(iso(fullYear(+m[3]), MONTHS.indexOf(m[2]) + 1, +m[1]));

  const monY = new RegExp(`(?<!\\d\\s?)\\b(${MONTHS.join('|')})[A-Z]*[\\s./\\-]*['’]?(\\d{2,4})\\b`, 'g');
  while ((m = monY.exec(t))) {
    const y = fullYear(+m[2]), mo = MONTHS.indexOf(m[1]) + 1;
    found.push(iso(y, mo, lastDay(y, mo)));
  }
  const mY = /(?<![\d\/\-.])\b(\d{1,2})[\/\-](\d{4}|\d{2})\b(?![\/\-.]\d)/g;
  while ((m = mY.exec(t))) {
    const mo = +m[1], y = fullYear(+m[2]);
    if (mo >= 1 && mo <= 12) found.push(iso(y, mo, lastDay(y, mo)));
  }

  const now = Date.now();
  const ok = found.filter((s) => {
    const ms = new Date(s).getTime();
    return !isNaN(ms) && ms > now - 400 * 864e5 && ms < now + 6 * 365 * 864e5;
  });
  if (!ok.length) return null;
  return ok.sort().slice(-1)[0];
}

/** Downscale to max 1280px JPEG so uploads stay small and OCR stays fast. */
async function shrink(file: File): Promise<{ blob: Blob; base64: string }> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), 'image/jpeg', 0.85));
  const base64 = c.toDataURL('image/jpeg', 0.85).split(',')[1];
  return { blob, base64 };
}

export interface OcrResult { date: string | null; raw: string; engine: 'AI vision' | 'on-device OCR' }

export async function readExpiryFromImage(file: File): Promise<OcrResult> {
  const { blob, base64 } = await shrink(file);

  try {
    const r = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType: 'image/jpeg' }),
      signal: AbortSignal.timeout(15000)
    });
    if (r.ok) {
      const j = await r.json();
      if (j.date) return { date: j.date, raw: j.raw || j.date, engine: 'AI vision' };
    }
  } catch { /* no server route or key: use on-device OCR */ }

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(blob);
    const raw = (data.text || '').trim().replace(/\s+/g, ' ');
    return { date: parseExpiryDate(raw), raw: raw.slice(0, 60), engine: 'on-device OCR' };
  } finally {
    await worker.terminate();
  }
}
