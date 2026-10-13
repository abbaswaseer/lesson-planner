import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '../components/Card.jsx';
import EmptyState, { NoProfile } from '../components/EmptyState.jsx';
import Select from '../components/Select.jsx';
import { useActiveProfile } from '../db/activeProfile.js';
import { listPlans } from '../db/plans.js';
import { filterPlans, planFilterOptions } from '../lib/history.js';
import HistoryTable from './history/HistoryTable.jsx';
import SavedPlan from './history/SavedPlan.jsx';

/**
 * History page: every plan this profile has generated, newest first.
 */
export default function HistoryPage() {
  const profile = useActiveProfile();
  const plans = useLiveQuery(() => (profile ? listPlans(profile.id) : []), [profile?.id]);
  const [filters, setFilters] = useState({ classLabel: '', weekNo: '' });
  const [openId, setOpenId] = useState(null);

  if (profile === undefined || plans === undefined) return null;

  const options = planFilterOptions(plans);
  const shown = filterPlans(plans, filters);
  const open = plans.find((plan) => plan.id === openId);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">History</h1>
      {profile === null && <NoProfile />}
      {profile && plans.length === 0 && (
        <EmptyState
          title="No plans yet"
          text="Every plan you generate is saved here automatically, so you can copy it again later."
          linkTo="/generate"
          linkText="Generate your first plan"
        />
      )}
      {/* Above the table, so it is in view without scrolling past a long history. */}
      {open && <SavedPlan key={open.id} plan={open} onClose={() => setOpenId(null)} />}
      {plans.length > 0 && (
        <Card>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="w-40">
              <Select
                label="Class"
                placeholder="All classes"
                value={filters.classLabel}
                onChange={(event) => setFilters({ ...filters, classLabel: event.target.value })}
                options={options.classes.map((label) => ({ value: label, label }))}
              />
            </div>
            <div className="w-40">
              <Select
                label="Week"
                placeholder="All weeks"
                value={filters.weekNo}
                onChange={(event) => setFilters({ ...filters, weekNo: event.target.value })}
                options={options.weeks.map((week) => ({ value: String(week), label: `Week ${week}` }))}
              />
            </div>
          </div>
          <HistoryTable plans={shown} openId={openId} onOpen={(id) => setOpenId(id === openId ? null : id)} />
        </Card>
      )}
    </div>
  );
}
