import Card from '../../components/Card.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';
import { defaultGeminiModel, listGeminiModels } from '../../ai/providers/gemini.js';
import { listGroqModels } from '../../ai/providers/groq.js';
import { checkOpenRouterKey, listOpenRouterModels } from '../../ai/providers/openrouter.js';
import KeyRow from './KeyRow.jsx';

// Listing models needs a valid key and uses no generation quota, so it doubles as the test.
const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    required: true,
    getKeyUrl: 'https://aistudio.google.com/apikey',
    getKeyText: 'Get a free key at aistudio.google.com',
    test: listGeminiModels,
    list: listGeminiModels,
    pickDefault: defaultGeminiModel,
  },
  {
    id: 'groq',
    name: 'Groq',
    required: false,
    getKeyUrl: 'https://console.groq.com/keys',
    getKeyText: 'Get a free key at console.groq.com',
    test: listGroqModels,
    list: listGroqModels,
    pickDefault: (models) => models[0] ?? '',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    required: false,
    getKeyUrl: 'https://openrouter.ai/keys',
    getKeyText: 'Get a free key at openrouter.ai',
    test: checkOpenRouterKey,
    list: listOpenRouterModels,
    pickDefault: (models) => models[0] ?? '',
  },
];

const pickFields = (profile) => ({
  keys: Object.fromEntries(PROVIDERS.map((p) => [p.id, profile.keys?.[p.id] ?? ''])),
  models: Object.fromEntries(PROVIDERS.map((p) => [p.id, profile.models?.[p.id] ?? ''])),
});

// Pasted keys often carry a stray space or line break, which makes them fail.
const trimAll = (values) => Object.fromEntries(Object.entries(values).map(([id, v]) => [id, v.trim()]));

/**
 * Setup → AI keys: the teacher's own free API keys and chosen models. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function ApiKeys({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);

  // Merge with what is saved so a provider not shown here is never wiped.
  const setKey = (id, value) => {
    const next = { ...draft.keys, [id]: value };
    setField('keys', next, { saveValue: { ...profile.keys, ...trimAll(next) } });
  };
  const setModel = (id, value) => {
    const next = { ...draft.models, [id]: value };
    setField('models', next, { saveValue: { ...profile.models, ...next } });
  };

  return (
    <Card title="AI keys">
      <div className="space-y-6">
        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          🔒 Your key is stored only on this computer. It is sent only to the AI service it belongs to.
        </p>

        {PROVIDERS.map((provider) => (
          <KeyRow
            key={provider.id}
            provider={provider}
            keyValue={draft.keys[provider.id]}
            onKeyChange={(value) => setKey(provider.id, value)}
            model={draft.models[provider.id]}
            onModelChange={(value) => setModel(provider.id, value)}
          />
        ))}

        <p className="text-sm text-gray-500">
          If Gemini is busy or its daily limit is reached, the app tries Groq, then OpenRouter, using the keys above.
        </p>

        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
