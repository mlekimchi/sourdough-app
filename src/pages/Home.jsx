import { useNavigate } from 'react-router-dom'
import { Wheat, Clock, ChartBar, Settings } from 'lucide-react'
import { getAllBakes } from '../services/storage'

export default function Home({ activeBake }) {
  const navigate = useNavigate()
  const bakes = getAllBakes()

  return (
    <div className="min-h-screen bg-dough-50 flex flex-col">
      {/* Header */}
      <div className="bg-dough-600 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sourdough</h1>
            <p className="text-dough-200 text-sm mt-1">Your baking companion</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full bg-dough-500 hover:bg-dough-400 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Stats strip */}
        <div className="mt-6 flex gap-4">
          <div className="bg-dough-500/60 rounded-xl px-4 py-3 flex-1 text-center">
            <div className="text-2xl font-bold">{bakes.length}</div>
            <div className="text-xs text-dough-200 mt-0.5">Total Bakes</div>
          </div>
          {bakes.length > 0 && (
            <div className="bg-dough-500/60 rounded-xl px-4 py-3 flex-1 text-center">
              <div className="text-2xl font-bold">
                {(bakes.filter(b => b.survey).reduce((sum, b) => sum + b.survey.overall, 0) / bakes.filter(b => b.survey).length || 0).toFixed(1)}
              </div>
              <div className="text-xs text-dough-200 mt-0.5">Avg Rating</div>
            </div>
          )}
        </div>
      </div>

      {/* Main actions */}
      <div className="flex-1 px-6 py-6 space-y-4">
        {activeBake ? (
          <button
            onClick={() => navigate('/bake')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg transition-colors"
          >
            <div className="bg-amber-400/50 rounded-xl p-3">
              <Clock size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">Resume Bake</div>
              <div className="text-amber-100 text-sm mt-0.5">
                {activeBake.recipe?.name || 'In progress'} · started {new Date(activeBake.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => navigate('/new-bake')}
            className="w-full bg-dough-600 hover:bg-dough-500 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg transition-colors"
          >
            <div className="bg-dough-500/50 rounded-xl p-3">
              <Wheat size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">Start New Bake</div>
              <div className="text-dough-200 text-sm mt-0.5">Set up recipe & begin timing</div>
            </div>
          </button>
        )}

        <button
          onClick={() => navigate('/history')}
          className="w-full bg-white hover:bg-dough-50 border border-dough-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-colors"
        >
          <div className="bg-dough-100 rounded-xl p-3 text-dough-600">
            <Clock size={28} />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-gray-800">Bake History</div>
            <div className="text-gray-500 text-sm mt-0.5">
              {bakes.length > 0 ? `${bakes.length} bake${bakes.length > 1 ? 's' : ''} logged` : 'No bakes yet'}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/insights')}
          className="w-full bg-white hover:bg-dough-50 border border-dough-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-colors"
        >
          <div className="bg-dough-100 rounded-xl p-3 text-dough-600">
            <ChartBar size={28} />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-gray-800">AI Insights</div>
            <div className="text-gray-500 text-sm mt-0.5">
              {bakes.filter(b => b.survey).length >= 3
                ? 'Ready to analyze your bakes'
                : `${bakes.filter(b => b.survey).length}/3 bakes needed to unlock`}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
