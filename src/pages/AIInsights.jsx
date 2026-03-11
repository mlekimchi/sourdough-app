import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Lock, RefreshCw } from 'lucide-react'
import { getAllBakes, saveBake } from '../services/storage'
import { getAIInsights } from '../services/claude'

export default function AIInsights() {
  const navigate = useNavigate()
  const bakes = getAllBakes().filter(b => b.survey)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(() => {
    // Show latest AI insight if exists
    const latest = bakes.find(b => b.aiInsights)
    return latest?.aiInsights || null
  })

  const MIN_BAKES = 3
  const ready = bakes.length >= MIN_BAKES

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const insights = await getAIInsights(bakes)
      setResult(insights)
      // Store on most recent bake
      if (bakes[0]) {
        saveBake({ ...bakes[0], aiInsights: insights })
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dough-50">
      <div className="bg-dough-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1"><ChevronLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold">AI Insights</h2>
            <p className="text-dough-200 text-xs mt-0.5">Powered by Claude</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Bake count indicator */}
        <div className="bg-white rounded-2xl border border-dough-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">Bakes with surveys</span>
            <span className={`font-bold ${ready ? 'text-green-600' : 'text-gray-400'}`}>
              {bakes.length} / {MIN_BAKES}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: MIN_BAKES }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${i < bakes.length ? 'bg-dough-500' : 'bg-gray-200'}`}
              />
            ))}
            {bakes.length > MIN_BAKES && (
              <div className="h-2 w-6 rounded-full bg-dough-300" />
            )}
          </div>
          {!ready && (
            <p className="text-gray-400 text-xs mt-2">
              Complete {MIN_BAKES - bakes.length} more bake{MIN_BAKES - bakes.length > 1 ? 's' : ''} with a survey to unlock analysis
            </p>
          )}
        </div>

        {!ready && (
          <div className="flex flex-col items-center py-12 text-center text-gray-400">
            <Lock size={48} className="mb-3 text-gray-300" />
            <p className="font-medium">Not enough data yet</p>
            <p className="text-sm mt-1">Keep baking and rating your loaves!</p>
          </div>
        )}

        {ready && !result && !loading && (
          <div className="text-center py-8">
            <Sparkles size={48} className="mx-auto text-dough-400 mb-3" />
            <p className="text-gray-700 font-medium mb-1">Ready to analyze</p>
            <p className="text-gray-400 text-sm mb-6">
              Claude will review your {bakes.length} bakes and suggest improvements for your next loaf.
            </p>
            <button
              onClick={handleAnalyze}
              className="bg-dough-600 hover:bg-dough-500 text-white rounded-2xl px-8 py-4 font-bold text-lg"
            >
              Analyze My Bakes
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-16 text-dough-600">
            <RefreshCw size={40} className="animate-spin mb-3" />
            <p className="font-medium">Analyzing your bakes...</p>
            <p className="text-sm text-gray-400 mt-1">This takes a few seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700 font-medium mb-1">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes('API key') && (
              <button
                onClick={() => navigate('/settings')}
                className="mt-3 text-dough-600 text-sm font-medium underline"
              >
                Go to Settings to add API key
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {/* Most recent crumb shot, if any */}
            {(() => {
              const latestPhoto = bakes.find(b => b.survey?.crumbPhoto)?.survey?.crumbPhoto
              return latestPhoto ? (
                <div className="bg-white rounded-2xl border border-dough-100 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Latest crumb shot</p>
                  <img src={latestPhoto} alt="Crumb shot" className="rounded-xl w-full object-cover max-h-52" />
                </div>
              ) : null
            })()}

            <div className="bg-white rounded-2xl border border-dough-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-dough-700">
                  <Sparkles size={18} />
                  <span className="font-semibold">Claude's Analysis</span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="text-gray-400 hover:text-dough-600"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
