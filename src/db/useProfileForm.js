import { useEffect, useRef, useState } from 'react';
import { createDebouncedSaver } from '../lib/debouncedSaver.js';
import { updateProfile } from './db.js';

const SAVE_DELAY_MS = 500;

/**
 * Local form state for part of a profile that saves itself 500ms after typing stops.
 * The form keeps its own copy while typing so live database updates never move the cursor.
 *
 * @param {object} profile The active profile.
 * @param {(profile: object) => object} pickFields Returns this form's starting values.
 * @returns {{ draft: object, setField: Function, status: 'idle' | 'saving' | 'saved' | 'error' }}
 */
export function useProfileForm(profile, pickFields) {
  const [draft, setDraft] = useState(() => pickFields(profile));
  const [status, setStatus] = useState('idle');
  const saverRef = useRef(null);

  useEffect(() => {
    setDraft(pickFields(profile));
    setStatus('idle');
    const saver = createDebouncedSaver(async (changes) => {
      setStatus('saving');
      try {
        await updateProfile(profile.id, changes);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, SAVE_DELAY_MS);
    saverRef.current = saver;
    // Save any last edit to this profile before switching profile or leaving the page.
    return () => {
      saver.flush();
    };
    // Only reset when a different profile is chosen, not on every save of this one.
  }, [profile.id]);

  /**
   * Update one field in the form and queue it for saving.
   * @param {string} key
   * @param {any} value What the form shows.
   * @param {{ save?: boolean, saveValue?: any }} [options]
   *   save=false: show the value but don't save it (e.g. invalid).
   *   saveValue: save something different from what is shown (e.g. "3, 4" shown, ["3", "4"] saved).
   */
  const setField = (key, value, { save = true, saveValue = value } = {}) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (save) {
      setStatus('saving');
      saverRef.current.queue({ [key]: saveValue });
    }
  };

  return { draft, setField, status };
}
