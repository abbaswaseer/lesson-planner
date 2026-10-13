// What a teacher still has to set up before plans can be generated.

/**
 * The first-time checklist shown on Generate (CLAUDE.md Section 11).
 * @param {object} profile
 * @param {number} sourceCount How many sources the profile has.
 * @returns {Array<{ id: string, label: string, done: boolean, link: string }>}
 */
export function setupChecklist(profile, sourceCount) {
  const hasKey = Object.values(profile?.keys ?? {}).some((key) => String(key ?? '').trim());
  const hasTimetable = (profile?.timetable ?? []).length > 0 && (profile?.weeks ?? []).length > 0;
  return [
    { id: 'key', label: 'Add your API key', done: hasKey, link: '/setup' },
    { id: 'sources', label: 'Upload sources', done: sourceCount > 0, link: '/sources' },
    { id: 'timetable', label: 'Fill timetable', done: hasTimetable, link: '/setup' },
  ];
}
