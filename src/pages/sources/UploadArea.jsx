import { useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { ACCEPTED_FILES } from '../../lib/sourceTypes.js';

/**
 * Drop zone plus a "Choose files" button. Hands every chosen file to `onFiles`;
 * checking which files are usable is the caller's job.
 * @param {{ onFiles: (files: File[]) => void, disabled?: boolean }} props
 */
export default function UploadArea({ onFiles, disabled = false }) {
  const fileInput = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) onFiles([...event.dataTransfer.files]);
  };

  const onChoose = (event) => {
    onFiles([...(event.target.files ?? [])]);
    event.target.value = ''; // allow choosing the same file again
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      }`}
    >
      <p className="text-sm text-gray-700">Drag files here, or</p>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={ACCEPTED_FILES}
        className="hidden"
        onChange={onChoose}
      />
      <Button className="mt-3" onClick={() => fileInput.current.click()} disabled={disabled}>
        Choose files
      </Button>
      <p className="mt-3 text-xs text-gray-500">
        PDF (textbook, scheme of work, calendar), JPG or PNG (e.g. a timetable photo), or your
        school's Word lesson plan template (.docx).
      </p>
    </div>
  );
}
