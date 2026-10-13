import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { createProfile, deleteProfile, listProfiles, updateProfile } from '../db/db.js';
import { setActiveProfileId, useActiveProfile } from '../db/activeProfile.js';
import Button from './Button.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Input from './Input.jsx';
import Select from './Select.jsx';
import { useToast } from './Toast.jsx';

/**
 * Choose the active profile, and create, rename or delete profiles.
 * New / Rename swap the dropdown for a name box in place, to keep the sidebar simple.
 */
export default function ProfileSwitcher() {
  const profiles = useLiveQuery(listProfiles, []);
  const active = useActiveProfile();
  const toast = useToast();

  const [mode, setMode] = useState(null); // null | 'new' | 'rename'
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (profiles === undefined || active === undefined) {
    return <p className="text-xs text-gray-500">Loading profiles…</p>;
  }

  const startNew = () => {
    setName('');
    setMode('new');
  };

  const startRename = () => {
    setName(active.name);
    setMode('rename');
  };

  const save = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      if (mode === 'new') {
        setActiveProfileId(await createProfile({ name: trimmed }));
        toast.success(`Profile "${trimmed}" created.`);
      } else {
        await updateProfile(active.id, { name: trimmed });
        toast.success('Profile renamed.');
      }
      setMode(null);
    } catch {
      toast.error('Could not save the profile. Please try again.');
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    try {
      await deleteProfile(active.id);
      // Forget the deleted id; the app falls back to the first remaining profile.
      setActiveProfileId(null);
      toast.success(`Profile "${active.name}" deleted.`);
    } catch {
      toast.error('Could not delete the profile. Please try again.');
    }
  };

  if (mode) {
    return (
      <form onSubmit={save} onKeyDown={(event) => event.key === 'Escape' && setMode(null)} className="space-y-2">
        <Input
          label={mode === 'new' ? 'New profile name' : 'Rename profile'}
          placeholder="e.g. Ghulam Abbas — Computer Science"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={!name.trim()}>
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setMode(null)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  if (!active) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500">No profile yet.</p>
        <Button size="sm" onClick={startNew}>
          Create profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        label="Profile"
        value={String(active.id)}
        onChange={(event) => setActiveProfileId(Number(event.target.value))}
        options={profiles.map((profile) => ({ value: String(profile.id), label: profile.name }))}
      />
      <div className="flex flex-wrap gap-1.5">
        <Button variant="secondary" size="sm" onClick={startNew}>
          New
        </Button>
        <Button variant="secondary" size="sm" onClick={startRename}>
          Rename
        </Button>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${active.name}"?`}
        message="This removes the profile and all its sources, plans and progress from this computer. This cannot be undone."
        confirmLabel="Delete profile"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      />
    </div>
  );
}
