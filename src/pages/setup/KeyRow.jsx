import { useState } from 'react';
import Button from '../../components/Button.jsx';
import { controlClasses } from '../../components/Field.jsx';
import { friendlyError, userMessage } from '../../lib/friendlyError.js';

/**
 * One AI key: hidden input, Show/Hide, Test, Load models and the model dropdown.
 * @param {{ provider: object, keyValue: string, onKeyChange: (key: string) => void,
 *   model: string, onModelChange: (model: string) => void }} props
 */
export default function KeyRow({ provider, keyValue, onKeyChange, model, onModelChange }) {
  const [shown, setShown] = useState(false);
  const [check, setCheck] = useState({ state: 'idle', message: '' }); // idle | busy | ok | error
  const [models, setModels] = useState(null); // null until loaded

  const id = `key-${provider.id}`;
  const key = keyValue.trim();
  const missing = provider.required && key === '';
  const busy = check.state === 'busy';

  const run = async (action) => {
    setCheck({ state: 'busy', message: '' });
    try {
      await action();
      setCheck({ state: 'ok', message: '✓ Working' });
    } catch (error) {
      setCheck({ state: 'error', message: userMessage(error, 'Something went wrong. Try again.') });
    }
  };

  const test = () => run(() => provider.test(key));

  const loadModels = () =>
    run(async () => {
      const list = await provider.list(key);
      setModels(list);
      if (list.length === 0) throw friendlyError(`${provider.name} has no models available for this key.`);
      // Keep the teacher's choice if it is still offered; otherwise use the default.
      if (!list.includes(model)) onModelChange(provider.pickDefault(list));
    });

  // Before loading, still show the saved choice so the teacher can see what is in use.
  const options = models ?? (model ? [model] : []);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {provider.name} key{' '}
        <span className="font-normal text-gray-500">{provider.required ? '(required)' : '(optional backup)'}</span>
      </label>

      <div className="flex gap-2">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          className={`${controlClasses(false)} font-mono`}
          autoComplete="off"
          spellCheck={false}
          placeholder={shown ? 'Paste your key here' : '••••••••••••'}
          value={keyValue}
          onChange={(event) => {
            onKeyChange(event.target.value);
            setCheck({ state: 'idle', message: '' });
          }}
        />
        <button
          type="button"
          className="shrink-0 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50"
          aria-pressed={shown}
          aria-controls={id}
          onClick={() => setShown(!shown)}
        >
          {shown ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" disabled={!key || busy} onClick={test}>
          Test
        </Button>
        <Button variant="secondary" size="sm" disabled={!key || busy} onClick={loadModels}>
          Load models
        </Button>
        {options.length > 0 && (
          <select
            aria-label={`${provider.name} model`}
            className={`${controlClasses(false)} w-auto max-w-full py-1 text-xs`}
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        <span
          role="status"
          className={`text-sm ${check.state === 'error' ? 'text-red-600' : check.state === 'ok' ? 'text-green-700' : 'text-gray-500'}`}
        >
          {busy ? 'Checking…' : check.message}
        </span>
      </div>

      <p className="text-sm text-gray-500">
        <a href={provider.getKeyUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-700">
          {provider.getKeyText}
        </a>
        {missing && <span className="ml-2 text-amber-700">Needed to generate plans.</span>}
      </p>
    </div>
  );
}
