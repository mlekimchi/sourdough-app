import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Star, Thermometer, Clock } from 'lucide-react'
import { getAllBakes, deleteBake } from '../services/storage'
import { STAGES } from '../data/stages'

function stageDuration(stage) {
  if (!stage?.startTime || !stage?.endTime) return null
  return Math.round((new Date(stage.endTime) - new Date(stage.startTime)) / 60000)
}

function RatingDots({ value, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
        />
      ))}
    </div>
  )
}

export default function History() {
  const navigate = useNavigate()
  const [bakes, setBakes] = useState(() => getAllBakes())
  const [expanded, setExpanded] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDelete = id => {
    deleteBake(id)
    setBakes(getAllBakes())
    setConfirmDelete(null)
    setExpanded(null)
  }

  return (
    <div className="min-h-screen bg-dough-50">
      <div className="bg-dough-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1"><ChevronLeft size={24} /></button>
          <h2 className="text-xl font-bold">Bake History</h2>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {bakes.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg">No bakes yet</p>
            <p className="text-sm mt-1">Start your first bake from the home screen</p>
          </div>
        )}

        {bakes.map(bake => {
          const isOpen = expanded === bake.id
          const date = new Date(bake.createdAt)
          const survey = bake.survey

          return (
            <div key={bake.id} className="bg-white rounded-2xl border border-dough-100 overflow-hidden">
              {/* Summary row */}
              <button
                className="w-full p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : bake.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{bake.recipe?.name || 'Untitled'}</div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {bake.recipe?.totalFlourWeight}g · {bake.recipe?.hydration}% hydration
                    </div>
                  </div>
                  {survey && (
                    <div className="text-right">
                      <div className="text-amber-500 font-bold">{survey.overall}/5</div>
                      <RatingDots value={survey.overall} />
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-dough-100 pt-3 space-y-4">
                  {/* Flour blend */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Flour Blend</p>
                    <div className="flex flex-wrap gap-1">
                      {bake.recipe?.flours?.map((f, i) => (
                        <span key={i} className="bg-dough-100 text-dough-700 text-xs rounded-full px-2 py-0.5">
                          {f.name} {f.percentage}%
                        </span>
                      ))}
                      <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                        Starter {bake.recipe?.starterPercentage}%
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                        Salt {bake.recipe?.saltPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Stages */}
                  {bake.stages?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stage Times</p>
                      <div className="space-y-1">
                        {bake.stages.filter(s => s.endTime).map(s => {
                          const cfg = STAGES.find(c => c.id === s.stageId)
                          const dur = stageDuration(s)
                          return (
                            <div key={s.stageId} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {cfg?.label || s.stageId}
                                {s.isCold && <span className="text-blue-500 ml-1 text-xs">(cold)</span>}
                              </span>
                              <span className="text-gray-500 flex items-center gap-1">
                                <Clock size={12} /> {dur} min
                              </span>
                            </div>
                          )
                        })}
                        {bake.stretchAndFolds?.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Stretch & Folds</span>
                            <span className="text-gray-500">{bake.stretchAndFolds.length} sets</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Temps */}
                  {bake.tempLogs?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Temperatures</p>
                      <div className="space-y-1">
                        {bake.tempLogs.map((t, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1"><Thermometer size={12} />
                              {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>
                              {t.ambient != null && `Amb ${t.ambient}°${t.unit}`}
                              {t.ambient != null && t.dough != null && ' / '}
                              {t.dough != null && `Dough ${t.dough}°${t.unit}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Survey */}
                  {survey && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Survey</p>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {['rise', 'crumb', 'crust', 'flavor', 'overall'].map(k => (
                          <div key={k} className="flex items-center gap-2">
                            <span className="text-gray-500 capitalize w-14">{k}</span>
                            <RatingDots value={survey[k]} />
                          </div>
                        ))}
                      </div>
                      {survey.notes && <p className="text-gray-500 text-xs mt-2 italic">"{survey.notes}"</p>}
                    </div>
                  )}

                  {/* AI insights */}
                  {bake.aiInsights && (
                    <div className="bg-dough-50 rounded-xl p-3">
                      <p className="text-xs text-dough-600 font-semibold mb-1">AI Notes</p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{bake.aiInsights}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setConfirmDelete(bake.id)}
                    className="text-red-400 text-sm"
                  >
                    Delete this bake
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Delete Bake?</h3>
            <p className="text-gray-500 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 rounded-xl py-3 font-medium">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-500 text-white rounded-xl py-3 font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
