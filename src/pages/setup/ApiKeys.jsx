import { useState } from 'react';
import Card from '../../components/Card.jsx';
import { controlClasses } from '../../components/Field.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    required: true,
    getKeyUrl: 'https://aistudio.google.com/apikey',
    getKeyText: 'Get a free key at aistudio.google.com',
  },
  {
    id: 'groq',
    name: 'Groq',
    required: false,
    getKeyUrl: 'https://console.groq.com/keys',
    getKeyText: 'Get a free key at console.groq.com',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    required: false,
    getKeyUrl: 'https://openrouter.ai/keys',
    getKeyText: 'Get a free key at openrouter.ai',
  },
];

const pickFields = (profile) => ({
  keys: Object.fromEntries(PROVIDERS.map((p) => [p.id, profile.keys?.[p.id] ?? ''])),
});

// Pasted keys often carry a stray space or line break, which makes them fail.
const toSaved = (keys) => Object.fromEntries(Object.entries(keys).map(([id, key]) => [id, key.trim()]));

/**
 * Setup → AI keys: the teacher's own free API keys. Hidden by default. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function ApiKeys({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const [visible, setVisible] = useState({});

  const setKey = (id, value) => {
    const next = { ...draft.keys, [id]: value };
    // Merge with saved keys so providers not shown here are never wiped.
    setField('keys', next, { saveValue: { ...profile.keys, ...toSaved(next) } });
  };

  return (
    <Card title="AI keys">
      <div className="space-y-5">
        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          🔒 Your key is stored only on this computer. It is sent only to the AI service it belongs to.
        </p>

        {PROVIDERS.map((provider) => {
          const id = `key-${provider.id}`;
          const shown = Boolean(visible[provider.id]);
          const missing = provider.required && draft.keys[provider.id].trim() === '';
          return (
            <div key={provider.id} className="space-y-1">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {provider.name} key{' '}
                <span className="font-normal text-gray-500">
                  {provider.required ? '(required)' : '(optional backup)'}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id={id}
                  type={shown ? 'text' : 'password'}
                  className={`${controlClasses(false)} font-mono`}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={shown ? 'Paste your key here' : '••••••••••••'}
                  value={draft.keys[provider.id]}
                  onChange={(event) => setKey(provider.id, event.target.value)}
                />
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50"
                  aria-pressed={shown}
                  aria-controls={id}
                  onClick={() => setVisible((current) => ({ ...current, [provider.id]: !shown }))}
                >
                  {shown ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                <a
                  href={provider.getKeyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  {provider.getKeyText}
                </a>
                {missing && <span className="ml-2 text-amber-700">Needed to generate plans.</span>}
              </p>
            </div>
          );
        })}

        <p className="text-sm text-gray-500">
          If Gemini is busy or its daily limit is reached, the app tries Groq, then OpenRouter, using the keys above.
        </p>

        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
