import { useState } from 'react';
import Button from '../../components/Button.jsx';
import { useToast } from '../../components/Toast.jsx';
import { downloadBlob } from '../../lib/download.js';
import { getOutput } from '../../outputs/index.js';

/**
 * Builds the Word lesson plan file for these plans and downloads it.
 * @param {{ plans: object[], profile: object }} props
 */
export default function WordDownloadButton({ plans, profile }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const { blob, fileName } = await getOutput('docxPlan').render(plans, profile);
      downloadBlob(fileName, blob);
      toast.success('Word file saved to your Downloads.');
    } catch {
      toast.error('Could not make the Word file. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" onClick={download} disabled={busy}>
      {busy ? 'Making Word file…' : 'Download Word file'}
    </Button>
  );
}
