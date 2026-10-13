// PDF → one text row per page, using pdfjs-dist in the browser.

/**
 * Join pdf.js text items into readable text: items on one line get a space only where
 * the PDF had one; `hasEOL` marks a line break.
 * @param {Array<{ str?: string, hasEOL?: boolean }>} items From page.getTextContent().
 * @returns {string}
 */
export function textFromItems(items) {
  let text = '';
  for (const item of items) {
    text += item.str ?? '';
    if (item.hasEOL) text += '\n';
  }
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** An error whose message is written for the teacher and safe to show. */
export function friendlyError(message) {
  const error = new Error(message);
  error.friendly = true;
  return error;
}

// Loaded on first use: pdf.js is large and most visits never read a PDF.
async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

/**
 * Read every page's text from a PDF file.
 * @param {File | Blob} file
 * @param {(done: number, total: number) => void} [onProgress] Called after each page.
 * @returns {Promise<Array<{ pageNo: number, text: string }>>}
 * @throws {Error} A friendlyError if the file cannot be read.
 */
export async function readPdfPages(file, onProgress) {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const pdf = await openPdf(task);
    const pages = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      pages.push({ pageNo, text: textFromItems(content.items) });
      page.cleanup();
      onProgress?.(pageNo, pdf.numPages);
    }
    if (pages.every((page) => page.text === '')) {
      throw friendlyError('This PDF has no readable text. It may be a scanned copy. Try a different PDF of the same book.');
    }
    return pages;
  } catch (error) {
    if (error.friendly) throw error;
    throw friendlyError('Some pages of this PDF could not be read. It may be damaged.');
  } finally {
    task.destroy(); // frees the worker's memory; a textbook can be hundreds of pages
  }
}

async function openPdf(task) {
  try {
    return await task.promise;
  } catch (error) {
    if (error?.name === 'PasswordException') {
      throw friendlyError('This PDF is password-protected. Save a copy without a password and try again.');
    }
    throw friendlyError('This file could not be opened as a PDF. It may be damaged.');
  }
}
