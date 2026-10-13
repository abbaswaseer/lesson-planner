// Errors a teacher may see. Only messages written for teachers are ever shown;
// anything else (bugs, browser errors) is replaced by a plain-English fallback.

/**
 * An error whose message is written for the teacher and is safe to show.
 * @param {string} message Plain English, ideally with what to do next.
 * @returns {Error}
 */
export function friendlyError(message) {
  const error = new Error(message);
  error.friendly = true;
  return error;
}

/**
 * The message to show for any caught error.
 * @param {unknown} error
 * @param {string} fallback Shown when the error was not written for teachers.
 * @returns {string}
 */
export function userMessage(error, fallback) {
  return error?.friendly && error.message ? error.message : fallback;
}
