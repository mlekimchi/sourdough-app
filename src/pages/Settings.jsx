import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Eye, EyeOff, Check } from 'lucide-react'
import { getSettings, saveSettings } from '../services/storage'

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => getSettings())
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }))

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-dough-50">
      <div className="bg-dough-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1"><ChevronLeft size={24} /></button>
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Claude API key */}
        <div className="bg-white rounded-2xl border border-dough-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Claude API Key</h3>
          <p className="text-gray-400 text-xs mb-3">
            Required for AI Insights. Get yours at console.anthropic.com. Stored only on this device.
          </p>
          <div className="relative">
            <input
              className="input pr-10"
              type={showKey ? 'text' : 'password'}
              value={settings.claudeApiKey || ''}
              onChange={e => set('claudeApiKey', e.target.value)}
              placeholder="sk-ant-..."
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Temperature unit */}
        <div className="bg-white rounded-2xl border border-dough-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Temperature Unit</h3>
          <div className="flex gap-3">
            {['F', 'C'].map(u => (
              <button
                key={u}
                onClick={() => set('tempUnit', u)}
                className={`flex-1 py-3 rounded-xl font-medium text-lg transition-colors ${
                  (settings.tempUnit || 'F') === u
                    ? 'bg-dough-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                °{u}
              </button>
            ))}
          </div>
        </div>

        {/* Stretch & fold reminder interval */}
        <div className="bg-white rounded-2xl border border-dough-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-1">S&F Reminder Interval</h3>
          <p className="text-gray-400 text-xs mb-3">How often to show stretch & fold prompts during bulk ferment</p>
          <div className="flex gap-2 flex-wrap">
            {[30, 45, 60].map(min => (
              <button
                key={min}
                onClick={() => set('sfInterval', min)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  (settings.sfInterval || 45) === min
                    ? 'bg-dough-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
            saved ? 'bg-green-500 text-white' : 'bg-dough-600 hover:bg-dough-500 text-white'
          }`}
        >
          {saved ? <><Check size={20} /> Saved</> : 'Save Settings'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Sourdough v0.1 · Data stored locally on this device
        </p>
      </div>
    </div>
  )
}
