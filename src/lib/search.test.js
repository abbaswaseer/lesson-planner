import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { addSource, createProfile, db, deleteSource } from '../db/db.js';
import { buildIndex, searchIndex, searchPages } from './search.js';

const BOOK = [
  { pageNo: 10, text: 'Binary and hexadecimal number systems. Converting between denary and binary.' },
  { pageNo: 22, text: 'Character sets: ASCII code uses 7 bits; extended ASCII uses 8 bits. Unicode can represent many more characters than ASCII.' },
  { pageNo: 23, text: 'ASCII table for the letters A to Z. Activity 1.12: write your name in ASCII.' },
  { pageNo: 30, text: 'Calculation of file size: image size = resolution x colour depth. The sound file size of a recording.' },
  { pageNo: 40, text: 'Data transmission and the parity check. Errors in transmission of a character.' },
];

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('searchIndex', () => {
  const pages = BOOK.map((page, i) => ({ ...page, id: i + 1, sourceId: 1 }));
  const index = buildIndex([...pages, { id: 99, sourceId: 2, pageNo: 1, text: 'Week 9: ASCII and Unicode' }], [
    { id: 1, type: 'textbook' },
    { id: 2, type: 'sow' },
  ]);

  it('puts the character-set pages first for "ASCII"', () => {
    const results = searchIndex(index, 'ASCII', { type: 'textbook' });
    expect(results.slice(0, 2).map((r) => r.pageNo).sort()).toEqual([22, 23]);
    expect(results).toHaveLength(2);
  });

  it('finds a topic phrase, ignoring common words', () => {
    const [best] = searchIndex(index, 'calculation of image and sound file sizes');
    expect(best).toMatchObject({ pageNo: 30, sourceId: 1, type: 'textbook' });
    expect(best.text).toMatch(/^Calculation of file size/);
  });

  it('filters by source type and respects the limit', () => {
    expect(searchIndex(index, 'ASCII', { type: 'sow' }).map((r) => r.id)).toEqual([99]);
    expect(searchIndex(index, 'ASCII binary transmission', { limit: 2 })).toHaveLength(2);
    expect(searchIndex(index, '   ')).toEqual([]);
  });
});

describe('searchPages', () => {
  it('searches only that profile, and sees sources added or deleted later', async () => {
    const mine = await createProfile({ name: 'Mine' });
    const other = await createProfile({ name: 'Other' });
    const bookId = await addSource(mine, { type: 'textbook', name: 'Book.pdf' }, BOOK);
    await addSource(other, { type: 'textbook', name: 'Other.pdf' }, [{ pageNo: 5, text: 'ASCII elsewhere' }]);

    expect((await searchPages(mine, 'ASCII')).map((r) => r.pageNo).slice(0, 2).sort()).toEqual([22, 23]);

    await addSource(mine, { type: 'sow', name: 'SOW.pdf' }, [{ pageNo: 1, text: 'Unicode in week 9' }]);
    expect((await searchPages(mine, 'Unicode', { type: 'sow' })).map((r) => r.pageNo)).toEqual([1]);

    await deleteSource(bookId);
    expect(await searchPages(mine, 'ASCII')).toEqual([]);
  });
});
