import 'fake-indexeddb/auto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createProfile, db } from '../db/db.js';
import { readPdfPages } from './pdf.js';
import { importSource } from './sourceImport.js';

// pdf.js uses Uint8Array.toHex, which current browsers have but this Node may not.
if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function toHex() {
    return Array.from(this, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };
}

// In the browser Vite serves the worker from a URL; in Node it must be a file URL.
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: pathToFileURL(createRequire(import.meta.url).resolve('pdfjs-dist/build/pdf.worker.min.mjs')).href,
}));

/** A tiny real PDF with one line of text per page, built by hand. */
function makePdf(pageTexts) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', ''];
  const kids = [];
  const font = 3 + pageTexts.length * 2;
  pageTexts.forEach((text, i) => {
    const pageId = 3 + i * 2;
    kids.push(`${pageId} 0 R`);
    const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${pageId + 1} 0 R /Resources << /Font << /F1 ${font} 0 R >> >> >>`;
    objects[pageId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageTexts.length} >>`;
  objects[font - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

describe('readPdfPages', () => {
  it('reads one text row per page and reports progress', async () => {
    const progress = [];
    const pages = await readPdfPages(makePdf(['ASCII character set', 'Unicode']), (done, total) =>
      progress.push(`${done}/${total}`)
    );
    expect(pages).toEqual([
      { pageNo: 1, text: 'ASCII character set' },
      { pageNo: 2, text: 'Unicode' },
    ]);
    expect(progress).toEqual(['1/2', '2/2']);
  });

  it('gives a friendly error for a file that is not a PDF', async () => {
    await expect(readPdfPages(new Blob(['hello']))).rejects.toMatchObject({
      friendly: true,
      message: 'This file could not be opened as a PDF. It may be damaged.',
    });
  });

  it('saving a PDF source creates one pages row per page', async () => {
    const profileId = await createProfile({ name: 'P' });
    const file = new File([makePdf(['Page one', 'Page two', 'Page three'])], 'Book.pdf');
    const { sourceId, pageCount } = await importSource({ id: profileId }, { file, kind: 'pdf', type: 'textbook' });
    expect(pageCount).toBe(3);
    expect(await db.sources.get(sourceId)).toMatchObject({ name: 'Book.pdf', type: 'textbook', pageCount: 3 });
    const pages = await db.pages.where('sourceId').equals(sourceId).sortBy('pageNo');
    expect(pages.map((p) => p.text)).toEqual(['Page one', 'Page two', 'Page three']);
  });
});
