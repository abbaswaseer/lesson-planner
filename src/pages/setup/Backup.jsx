import { useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { useToast } from '../../components/Toast.jsx';
import { setActiveProfileId } from '../../db/activeProfile.js';
import { downloadJson } from '../../lib/download.js';
import { buildExport, exportFileName, importBackup, readBackupFile } from '../../lib/exportImport.js';

/**
 * Setup → Backup: save the whole profile to a file, or bring one back.
 * Data lives only in this browser, so this is the teacher's safety net.
 * @param {{ profile: object | null }} props The active profile (null if there is none).
 */
export default function Backup({ profile }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [includeKeys, setIncludeKeys] = useState(false);
  const [busy, setBusy] = useState(false);

  const exportProfile = async () => {
    setBusy(true);
    try {
      const data = await buildExport(profile.id, { includeKeys });
      downloadJson(exportFileName(profile.name), data);
      toast.success('Backup file saved to your Downloads.');
    } catch {
      toast.error('Could not make the backup file. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setBusy(true);
    try {
      const data = await readBackupFile(file);
      setActiveProfileId(await importBackup(data));
      toast.success(`Imported "${data.profile.name}".`);
    } catch (error) {
      // readBackupFile throws plain-English messages; database errors get a generic one.
      toast.error(error.message?.startsWith('This ') ? error.message : 'Could not import this backup. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Backup">
      <p className="mb-4 text-sm text-gray-600">
        Your profile is stored only in this browser. Export a backup now and then — it holds your
        settings, sources, plans and progress — and import it to restore or move to another computer.
      </p>

      <div className="space-y-4">
        {profile && (
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={includeKeys}
                onChange={(event) => setIncludeKeys(event.target.checked)}
              />
              <span>
                Include API keys
                <span className="block text-gray-500">
                  Leave this off if you will share the file — anyone with it could use your keys.
                </span>
              </span>
            </label>
            <Button onClick={exportProfile} disabled={busy}>
              Export "{profile.name}"
            </Button>
          </div>
        )}

        <div>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={importFile}
          />
          <Button variant="secondary" onClick={() => fileInput.current.click()} disabled={busy}>
            Import a backup…
          </Button>
          <p className="mt-1 text-xs text-gray-500">Creates a new profile. Your current profiles are not changed.</p>
        </div>
      </div>
    </Card>
  );
}
