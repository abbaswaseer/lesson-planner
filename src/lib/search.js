// Keyword search over a profile's source pages (MiniSearch), used to find the textbook
// pages for a lesson topic (CLAUDE.md Section 7, step 4).
import MiniSearch from 'minisearch';
import { db } from '../db/db.js';

// Common words that would otherwise make every page look relevant to a topic.
const STOP_WORDS = new Set(
  'a an and are as at be by for from how in into is it of on or that the their this to was what when which with'.split(' ')
);

/**
 * Build a search index over pages.
 * @param {Array<{ id: number, sourceId: number, pageNo: number, text: string }>} pages
 * @param {Array<{ id: number, type: string }>} sources Gives each page its source type for filtering.
 * @returns {MiniSearch}
 */
export function buildIndex(pages, sources) {
  const typeOf = new Map(sources.map((source) => [source.id, source.type]));
  const index = new MiniSearch({
    fields: ['text'],
    storeFields: ['sourceId', 'pageNo', 'type', 'text'],
    processTerm: (term) => {
      const lower = term.toLowerCase();
      return STOP_WORDS.has(lower) ? null : lower;
    },
    searchOptions: {
      prefix: (term) => term.length > 3,
      fuzzy: (term) => (term.length > 5 ? 0.2 : false),
      combineWith: 'OR',
    },
  });
  index.addAll(
    pages
      .filter((page) => page.text)
      .map((page) => ({ id: page.id, sourceId: page.sourceId, pageNo: page.pageNo, type: typeOf.get(page.sourceId), text: page.text }))
  );
  return index;
}

/**
 * Search an index; best matches first.
 * @param {MiniSearch} index
 * @param {string} query e.g. "ASCII character sets"
 * @param {{ type?: string, limit?: number }} [options] `type` keeps only pages from that source type.
 * @returns {Array<{ id: number, sourceId: number, pageNo: number, type: string, text: string, score: number }>}
 */
export function searchIndex(index, query, { type, limit = 5 } = {}) {
  if (!String(query ?? '').trim()) return [];
  const filter = type ? (result) => result.type === type : undefined;
  return index
    .search(query, { filter })
    .slice(0, limit)
    .map(({ id, sourceId, pageNo, type: pageType, text, score }) => ({ id, sourceId, pageNo, type: pageType, text, score }));
}

// One cached index: rebuilt only when the profile's sources change, because reading
// every page of a textbook takes a moment.
let cache = { key: '', index: null };

async function indexFor(profileId) {
  const sources = await db.sources.where('profileId').equals(profileId).toArray();
  const key = `${profileId}:${sources.map((source) => `${source.id}/${source.pageCount}`).join(',')}`;
  if (cache.key !== key) {
    const pages = await db.pages.where('profileId').equals(profileId).toArray();
    cache = { key, index: buildIndex(pages, sources) };
  }
  return cache.index;
}

/**
 * Search the stored pages of a profile's sources.
 * @param {number} profileId
 * @param {string} query
 * @param {{ type?: string, limit?: number }} [options]
 * @returns {Promise<Array<{ id: number, sourceId: number, pageNo: number, type: string, text: string, score: number }>>}
 */
export async function searchPages(profileId, query, options) {
  return searchIndex(await indexFor(profileId), query, options);
}
