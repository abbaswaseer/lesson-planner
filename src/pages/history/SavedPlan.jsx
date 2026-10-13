import { useState } from 'react';
import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import JsonCard from '../../components/JsonCard.jsx';
import { useToast } from '../../components/Toast.jsx';
import { deletePlan } from '../../db/plans.js';
import { planHeader } from '../../lib/planFiles.js';

/**
 * One saved plan from History, with Copy, Download, Delete and Close.
 * @param {{ plan: object, onClose: () => void }} props A row from the plans table.
 */
export default function SavedPlan({ plan, onClose }) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const duration = plan.data?.duration;

  const remove = async () => {
    setConfirming(false);
    try {
      await deletePlan(plan.id);
      onClose();
      toast.success('Plan deleted.');
    } catch {
      toast.error('Could not delete this plan. Please try again.');
    }
  };

  return (
    <>
      <JsonCard
        plan={plan.data}
        header={planHeader({ classLabel: plan.classLabel, dayId: plan.dayId, date: plan.date, duration })}
        errors={plan.errors}
        provider={plan.provider}
        model={plan.model}
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => setConfirming(true)}>
              Delete
            </Button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </>
        }
      />
      <ConfirmDialog
        open={confirming}
        title="Delete this plan?"
        message="It will be removed from your history. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
