// All prompt text lives here. Lesson plan prompts are added in T-44.

/**
 * Ask for a plain-text copy of an uploaded image (e.g. a timetable photo), so it can be
 * stored and searched like a PDF page.
 * @param {string} sourceType e.g. "timetable"
 * @returns {string}
 */
export function imageTranscriptionPrompt(sourceType) {
  return [
    `This image is a school ${sourceType === 'other' ? 'document' : sourceType} used by a teacher.`,
    'Write out all of its text as clean plain text, in reading order.',
    'If it contains a table (such as a timetable), write one row per line with cells separated by " | ", and keep the header row.',
    'Do not add comments, explanations or anything that is not in the image. Write "[unclear]" for text you cannot read.',
  ].join('\n');
}
