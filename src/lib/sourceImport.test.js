import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile, db } from '../db/db.js';
import { importSource } from './sourceImport.js';

const generateContent = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const image = () => new File([new Uint8Array([1, 2, 3])], 'timetable.png', { type: 'image/png' });

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  generateContent.mockReset();
});

describe('importSource for images', () => {
  it('stores Gemini’s transcription as one page', async () => {
    generateContent.mockResolvedValue({ text: '  Day | P1 | P2\nMon | O1 | O1 \n' });
    const profileId = await createProfile({ name: 'P' });
    const profile = { id: profileId, keys: { gemini: 'key' }, models: { gemini: 'gemini-x-flash' } };

    const { sourceId, pageCount } = await importSource(profile, { file: image(), kind: 'image', type: 'timetable' });

    expect(pageCount).toBe(1);
    const pages = await db.pages.where('sourceId').equals(sourceId).toArray();
    expect(pages).toMatchObject([{ profileId, pageNo: 1, text: 'Day | P1 | P2\nMon | O1 | O1' }]);
    const request = generateContent.mock.calls[0][0];
    expect(request.model).toBe('gemini-x-flash');
    expect(request.contents[0].parts[0].inlineData).toEqual({ mimeType: 'image/png', data: 'AQID' });
  });

  it('asks for a Gemini key when there is none', async () => {
    await expect(importSource({ id: 1, keys: {} }, { file: image(), kind: 'image', type: 'timetable' })).rejects.toMatchObject({
      friendly: true,
      message: 'Reading an image needs a Gemini key. Add one on the Setup page, then try again.',
    });
  });

  it('turns a rejected key into a friendly message and saves nothing', async () => {
    generateContent.mockRejectedValue(Object.assign(new Error('API key not valid'), { status: 400 }));
    const profile = { id: 1, keys: { gemini: 'bad' }, models: { gemini: 'm' } };
    await expect(importSource(profile, { file: image(), kind: 'image', type: 'timetable' })).rejects.toMatchObject({
      friendly: true,
      message: expect.stringMatching(/^Gemini did not accept this key/),
    });
    expect(await db.sources.count()).toBe(0);
  });
});
