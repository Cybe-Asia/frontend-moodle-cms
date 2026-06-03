import { useState } from 'react'
import { useMoodleConfig, useUpdateMoodleConfig, useTestMoodleConfig } from '@/hooks/useMoodleConfig'
import type { MoodleTestResult } from '@/types/moodle'

// ─── Connection test result card ───────────────────────────────────────────────
function ConnectionTestResult({ result, isLoading }: { result: MoodleTestResult | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-[#2a2d42] border border-[#2e3248] rounded-lg">
        <div className="animate-pulse w-4 h-4 rounded-full bg-indigo-500" />
        <span className="text-sm text-gray-400">Testing connection…</span>
      </div>
    )
  }
  if (!result) return null

  if (result.success) {
    return (
      <div className="px-4 py-3 bg-green-900/20 border border-green-700/40 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-400 font-semibold">✓ Connected</span>
        </div>
        <p className="text-sm text-gray-300">{result.moodle_base_url}</p>
        <p className="text-sm text-gray-400">{result.categories_found} categories found</p>
      </div>
    )
  }
  return (
    <div className="px-4 py-3 bg-red-900/20 border border-red-700/40 rounded-lg">
      <p className="text-red-400 font-semibold mb-1">✗ Connection failed</p>
      <p className="text-sm text-gray-400">{result.error}</p>
      <p className="text-xs text-gray-500 mt-2">Check that the base URL and token are correct, and that the required web service functions are enabled.</p>
    </div>
  )
}

// ─── Info Panel ────────────────────────────────────────────────────────────────
function InfoPanel() {
  return (
    <div className="card space-y-4 text-sm">
      <h3 className="font-semibold text-gray-200">How to get a Moodle WS Token</h3>
      <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
        <li>Log in as Moodle Site Admin</li>
        <li>Go to <strong className="text-gray-300">Site admin → Server → Web services → External services</strong></li>
        <li>Create a custom service or use an existing one</li>
        <li>Add a token under <strong className="text-gray-300">Site admin → Server → Web services → Manage tokens</strong></li>
      </ol>

      <div>
        <p className="font-medium text-gray-300 mb-2">Required capabilities:</p>
        <ul className="space-y-1 text-gray-400 text-xs font-mono">
          {[
            'core_user_create_users',
            'core_course_get_categories',
            'core_course_get_courses_by_field',
            'enrol_manual_enrol_users',
            'enrol_manual_unenrol_users',
            'core_enrol_get_users_courses',
            'core_webservice_get_site_info',
          ].map((fn) => (
            <li key={fn} className="flex items-center gap-2">
              <span className="text-indigo-500">•</span> {fn}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-yellow-400 text-xs">
        ⚠️ The WS token grants full API access to your Moodle site. Keep it secret and never share it.
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MoodleSettingsPage() {
  const { data: config, isLoading: configLoading } = useMoodleConfig()
  const { mutateAsync: updateConfig, isPending: updating } = useUpdateMoodleConfig()
  const { mutateAsync: testConfig, isPending: testing } = useTestMoodleConfig()

  const [form, setForm] = useState({ base_url: '', ws_token: '' })
  const [showToken, setShowToken] = useState(false)
  const [testResult, setTestResult] = useState<MoodleTestResult | null>(null)
  const [saveResult, setSaveResult] = useState<MoodleTestResult | null>(null)
  const [confirmSave, setConfirmSave] = useState(false)
  const [error, setError] = useState('')

  const handleTest = async () => {
    setTestResult(null)
    try {
      const res = await testConfig()
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, error: err?.response?.data?.error || 'Test failed.' })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmSave) { setConfirmSave(true); return }
    setError('')
    setSaveResult(null)
    try {
      const res = await updateConfig(form)
      setSaveResult({ success: true, moodle_base_url: res.base_url, categories_found: res.categories_found })
      setForm({ base_url: '', ws_token: '' })
      setConfirmSave(false)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Save failed.')
      setConfirmSave(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Moodle Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure the Moodle Web Services connection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current config + Update form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section A: Current Config */}
          <div className="card">
            <h2 className="font-semibold text-gray-200 mb-4">Current Configuration</h2>
            {configLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-[#2a2d42] rounded w-3/4" />
                <div className="h-4 bg-[#2a2d42] rounded w-1/2" />
              </div>
            ) : config?.configured === false || !config?.base_url ? (
              <p className="text-gray-500 text-sm">No configuration found. Set up your Moodle connection below.</p>
            ) : (
              <div className="space-y-3">
                <ConfigRow label="Base URL">
                  <a href={config.base_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline break-all">
                    {config.base_url}
                  </a>
                </ConfigRow>
                <ConfigRow label="WS Token">
                  <span className="font-mono text-gray-300">{config.ws_token_masked}</span>
                </ConfigRow>
                <ConfigRow label="Status">
                  <span className={config.is_active ? 'badge-green' : 'badge-red'}>
                    {config.is_active ? 'Connected' : 'Inactive'}
                  </span>
                </ConfigRow>
                <ConfigRow label="Last Updated">
                  <span className="text-gray-400">{config.updated_at ? new Date(config.updated_at).toLocaleString() : '—'}</span>
                </ConfigRow>

                <div className="pt-2">
                  <button onClick={handleTest} disabled={testing} className="btn-secondary">
                    {testing ? 'Testing…' : '⚡ Test Connection'}
                  </button>
                  {(testing || testResult) && (
                    <div className="mt-3">
                      <ConnectionTestResult result={testResult} isLoading={testing} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section B: Update Config */}
          <div className="card">
            <h2 className="font-semibold text-gray-200 mb-4">Update Configuration</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label>Moodle Base URL</label>
                <input
                  required
                  type="url"
                  value={form.base_url}
                  onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  placeholder="https://moodle.example.com"
                />
              </div>
              <div>
                <label>WS Token</label>
                <div className="relative">
                  <input
                    required
                    type={showToken ? 'text' : 'password'}
                    value={form.ws_token}
                    onChange={(e) => setForm((f) => ({ ...f, ws_token: e.target.value }))}
                    placeholder="Paste new token"
                  />
                  <button type="button" onClick={() => setShowToken((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Token is AES-256-GCM encrypted before storage and never returned to the frontend.</p>
              </div>

              {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/30 rounded px-3 py-2">{error}</p>}

              {(updating || saveResult) && (
                <ConnectionTestResult result={saveResult} isLoading={updating} />
              )}

              {!confirmSave ? (
                <button type="submit" className="btn-primary">Save Configuration</button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-yellow-400 text-sm">
                    ⚠️ Update Moodle connection? The current token will be replaced.
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setConfirmSave(false)} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" disabled={updating} className="btn-primary flex-1">
                      {updating ? 'Saving…' : 'Confirm Save'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right: Info panel */}
        <div>
          <InfoPanel />
        </div>
      </div>
    </div>
  )
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  )
}
