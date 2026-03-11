import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ThermometerSun, ChevronRight, CheckCircle2, Info, Flame, Undo2, Pencil } from 'lucide-react'
import { STAGES } from '../data/stages'

// ── Audio ─────────────────────────────────────────────────────────────────────

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)
  } catch (_) {}
}

// ── Auto-advance map ──────────────────────────────────────────────────────────
// After ending a stage, immediately start the listed next stage.

const AUTO_ADVANCE = {
  mix_rest:     'sf_1',
  sf_1:         'sf_2',
  sf_2:         'sf_3',
  sf_3:         'sf_4',
  sf_4:         'bulk_ferment',
  bulk_ferment: 'shaping',
  shaping:      'final_proof',
  final_proof:  'preheat',
  bake_covered: 'bake_uncovered',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function elapsedSecs(startTime) {
  if (!startTime) return 0
  return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
}

function formatTime(totalSeconds) {
  const abs = Math.abs(totalSeconds)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const sign = totalSeconds < 0 ? '+' : ''
  if (h > 0) return `${sign}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function stageDurationMin(stage) {
  if (!stage?.startTime || !stage?.endTime) return null
  return Math.round((new Date(stage.endTime) - new Date(stage.startTime)) / 60000)
}

function pct(part, whole) {
  if (!whole || !part) return '—'
  return (part / whole * 100).toFixed(1) + '%'
}

// ── S&F progress bar ──────────────────────────────────────────────────────────

const SF_IDS = ['sf_1', 'sf_2', 'sf_3', 'sf_4']

function SFProgressBar({ completedIds, activeId }) {
  return (
    <div className="flex gap-1.5 mt-2 mb-1">
      {SF_IDS.map((id, i) => {
        const done    = completedIds.includes(id)
        const current = id === activeId
        return (
          <div key={id} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-2 w-full rounded-full transition-colors ${
              done    ? 'bg-amber-500' :
              current ? 'bg-amber-400' :
                        'bg-amber-100'
            }`} />
            <span className={`text-[10px] font-semibold ${
              done || current ? 'text-amber-700' : 'text-amber-300'
            }`}>{i + 1}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Timer display ─────────────────────────────────────────────────────────────

function TimerDisplay({ startTime, config }) {
  if (config.noTimer) return null
  if (config.countDown) {
    const remaining = config.countDown * 60 - elapsedSecs(startTime)
    const isDone = remaining <= 0
    return (
      <div className="text-center my-3">
        <div className={`text-5xl font-mono font-bold ${isDone ? 'text-green-600' : remaining < 120 ? 'text-red-500' : 'text-amber-800'}`}>
          {formatTime(remaining)}
        </div>
        <p className={`text-xs mt-1 ${isDone ? 'text-green-600 font-semibold' : 'text-amber-600'}`}>
          {isDone ? (remaining < 0 ? `${Math.abs(Math.ceil(remaining / 60))} min over` : 'Ready!') : 'remaining'}
        </p>
      </div>
    )
  }
  const elapsed = elapsedSecs(startTime)
  const overTypical = elapsed > config.typicalMax * 60
  return (
    <div className="text-center my-3">
      <div className={`text-5xl font-mono font-bold ${overTypical ? 'text-orange-500' : 'text-amber-800'}`}>
        {formatTime(elapsed)}
      </div>
      <p className="text-amber-600 text-xs mt-1">elapsed</p>
    </div>
  )
}

// ── Levain Build extras ───────────────────────────────────────────────────────

function LevainInputs({ unfed, setUnfed, feedFlour, setFeedFlour, feedWater, setFeedWater }) {
  const unfedNum    = Number(unfed)   || 0
  const flourNum    = Number(feedFlour) || unfedNum
  const waterNum    = Number(feedWater) || unfedNum
  const total       = unfedNum + flourNum + waterNum

  // Auto-fill flour/water when unfed changes and they haven't been manually set
  return (
    <div className="mt-2 bg-amber-100 rounded-xl p-3 space-y-3">
      <p className="text-amber-800 text-xs font-semibold uppercase tracking-wide">Levain Weights</p>

      <div className="flex items-center gap-2">
        <label className="text-amber-700 text-sm w-28 shrink-0">Unfed starter</label>
        <div className="relative flex-1">
          <input className="input bg-white text-sm pr-6" type="number" inputMode="decimal"
            value={unfed} onChange={e => { setUnfed(e.target.value); setFeedFlour(e.target.value); setFeedWater(e.target.value) }}
            placeholder="50" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">g</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-amber-700 text-sm w-28 shrink-0">+ Feed flour</label>
        <div className="relative flex-1">
          <input className="input bg-white text-sm pr-6" type="number" inputMode="decimal"
            value={feedFlour} onChange={e => setFeedFlour(e.target.value)} placeholder="50" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">g</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-amber-700 text-sm w-28 shrink-0">+ Feed water</label>
        <div className="relative flex-1">
          <input className="input bg-white text-sm pr-6" type="number" inputMode="decimal"
            value={feedWater} onChange={e => setFeedWater(e.target.value)} placeholder="50" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">g</span>
        </div>
      </div>

      {unfedNum > 0 && (
        <div className="border-t border-amber-300 pt-2 flex justify-between items-center">
          <span className="text-amber-800 text-sm font-semibold">Total fed starter</span>
          <span className="text-amber-900 font-bold text-lg">{total}g</span>
        </div>
      )}
    </div>
  )
}

// ── Ingredients form ──────────────────────────────────────────────────────────

const DEFAULT_FLOURS = [
  { name: 'Bread flour',       grams: '400' },
  { name: 'Whole wheat flour', grams: '50'  },
]

function IngredientsForm({ onSave }) {
  const [name,    setName]    = useState('')
  const [starter, setStarter] = useState('200')
  const [flours,  setFlours]  = useState(DEFAULT_FLOURS)
  const [water,   setWater]   = useState('310')
  const [salt,    setSalt]    = useState('12')
  const [notes,   setNotes]   = useState('')

  const totalFlour = flours.reduce((sum, f) => sum + (Number(f.grams) || 0), 0)
  const canSave    = totalFlour > 0 && Number(water) > 0 && Number(starter) > 0 && Number(salt) > 0

  const hydration  = totalFlour ? ((Number(water)   / totalFlour) * 100).toFixed(1) : '—'
  const starterPct = totalFlour ? ((Number(starter) / totalFlour) * 100).toFixed(1) : '—'
  const saltPct    = totalFlour ? ((Number(salt)    / totalFlour) * 100).toFixed(1) : '—'

  const updateFlour = (i, field, val) =>
    setFlours(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f))

  const addFlour    = () => setFlours(prev => [...prev, { name: '', grams: '' }])
  const removeFlour = (i) => setFlours(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = () => {
    if (!canSave) return
    onSave({
      name:              name || 'Untitled Bake',
      starterGrams:      Number(starter),
      flours:            flours.map(f => ({ name: f.name, grams: Number(f.grams) || 0 })),
      flourGrams:        totalFlour,
      waterGrams:        Number(water),
      saltGrams:         Number(salt),
      hydration:         Number(hydration),
      starterPercentage: Number(starterPct),
      saltPercentage:    Number(saltPct),
      notes,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Recipe Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Country Sourdough" />
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Ingredients</h4>
        <div className="space-y-3">

          {/* Starter */}
          <div className="flex items-center gap-3">
            <label className="w-16 text-sm font-medium text-gray-600 shrink-0">Starter</label>
            <div className="relative flex-1">
              <input className="input pr-7" type="number" inputMode="decimal"
                value={starter} onChange={e => setStarter(e.target.value)} placeholder="200" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
            </div>
          </div>

          {/* Flour rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Flour</span>
              {totalFlour > 0 && (
                <span className="text-xs text-gray-400">Total: {totalFlour}g</span>
              )}
            </div>
            {flours.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="input flex-1 text-sm" value={f.name}
                  onChange={e => updateFlour(i, 'name', e.target.value)}
                  placeholder="Flour type" />
                <div className="relative w-24 shrink-0">
                  <input className="input pr-6 text-sm" type="number" inputMode="decimal"
                    value={f.grams} onChange={e => updateFlour(i, 'grams', e.target.value)} placeholder="0" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">g</span>
                </div>
                {flours.length > 1 && (
                  <button onClick={() => removeFlour(i)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0 w-6">×</button>
                )}
              </div>
            ))}
            <button onClick={addFlour}
              className="text-dough-600 text-sm font-medium hover:text-dough-500">
              + Add flour type
            </button>
          </div>

          {/* Water */}
          <div className="flex items-center gap-3">
            <label className="w-16 text-sm font-medium text-gray-600 shrink-0">Water</label>
            <div className="relative flex-1">
              <input className="input pr-7" type="number" inputMode="decimal"
                value={water} onChange={e => setWater(e.target.value)} placeholder="310" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
            </div>
          </div>

          {/* Salt */}
          <div className="flex items-center gap-3">
            <label className="w-16 text-sm font-medium text-gray-600 shrink-0">Salt</label>
            <div className="relative flex-1">
              <input className="input pr-7" type="number" inputMode="decimal"
                value={salt} onChange={e => setSalt(e.target.value)} placeholder="12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
            </div>
          </div>

        </div>
      </div>

      {totalFlour > 0 && (
        <div className="bg-dough-50 border border-dough-200 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-dough-600">{hydration}%</div>
            <div className="text-xs text-gray-500">Hydration</div>
          </div>
          <div>
            <div className="text-xl font-bold text-dough-600">{starterPct}%</div>
            <div className="text-xs text-gray-500">Starter</div>
          </div>
          <div>
            <div className="text-xl font-bold text-dough-600">{saltPct}%</div>
            <div className="text-xs text-gray-500">Salt</div>
          </div>
        </div>
      )}

      <div>
        <label className="label">Notes (optional)</label>
        <textarea className="input min-h-[70px]" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any intentions or changes for this bake..." />
      </div>

      <button onClick={handleSave} disabled={!canSave}
        className="w-full bg-dough-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg">
        Continue
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ActiveBake({ activeBake, bakeActions }) {
  const navigate = useNavigate()
  const { startStage, endStage, updateRecipe, logTemp, abandonBake, goBackStage, editStageDuration } = bakeActions

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Beep once when a countdown stage hits zero
  const beepedRef = useRef(new Set())
  useEffect(() => {
    if (!activeStage || !activeStageConfig?.countDown) return
    const remaining = activeStageConfig.countDown * 60 - elapsedSecs(activeStage.startTime)
    if (remaining <= 0 && !beepedRef.current.has(activeStage.stageId)) {
      beepedRef.current.add(activeStage.stageId)
      playBeep()
    }
  }, [tick]) // eslint-disable-line

  // Levain inputs
  const [levainUnfed,     setLevainUnfed]     = useState('')
  const [levainFlour,     setLevainFlour]     = useState('')
  const [levainWater,     setLevainWater]     = useState('')
  // Shared stage state
  const [stageNotes,      setStageNotes]      = useState('')
  const [coldRetard,      setColdRetard]      = useState(false)
  const [inclusionName,   setInclusionName]   = useState('')
  const [inclusionGrams,  setInclusionGrams]  = useState('')
  // Modals
  const [showTempModal,   setShowTempModal]   = useState(false)
  const [showTips,        setShowTips]        = useState(null)
  const [showAbandon,     setShowAbandon]     = useState(false)
  const [editingStage,    setEditingStage]    = useState(null) // { stageId, label, hours, minutes }
  // Temp inputs
  const [tempAmbient,     setTempAmbient]     = useState('')
  const [tempDough,       setTempDough]       = useState('')
  const [tempUnit,        setTempUnit]        = useState('F')

  if (!activeBake) {
    return (
      <div className="min-h-screen bg-dough-50 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-gray-500 mb-4">No active bake.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  const { stages, tempLogs } = activeBake

  const activeStage       = stages.find(s => s.startTime && !s.endTime)
  const activeStageConfig = activeStage ? STAGES.find(s => s.id === activeStage.stageId) : null
  const completedIds      = stages.filter(s => s.endTime).map(s => s.stageId)
  const nextStageConfig   = STAGES.find(s => !completedIds.includes(s.id) && s.id !== activeStage?.stageId)
  const allDone           = completedIds.includes('bake_uncovered')

  const isBakeStage = id => ['preheat', 'bake_covered', 'bake_uncovered'].includes(id)

  const handleStartStage = (stageId) => {
    startStage(stageId)
    setStageNotes('')
    setColdRetard(false)
    setInclusionName('')
    setInclusionGrams('')
  }

  const handleEndStage = () => {
    if (!activeStage) return
    const stageId = activeStage.stageId
    const extras = {}
    if (stageId === 'levain_build' && levainUnfed) {
      const u = Number(levainUnfed), f = Number(levainFlour) || u, w = Number(levainWater) || u
      extras.levainData = { unfed: u, flour: f, water: w, total: u + f + w }
    }
    if (stageId === 'sf_2' && inclusionName) {
      extras.inclusion = { name: inclusionName, grams: Number(inclusionGrams) || null }
    }
    if (stageId === 'final_proof') {
      extras.isCold = coldRetard
    }
    endStage(stageId, stageNotes, extras)
    setStageNotes('')
    setInclusionName('')
    setInclusionGrams('')
    setColdRetard(false)
    // Auto-advance to next stage
    const nextId = AUTO_ADVANCE[stageId]
    if (nextId) startStage(nextId)
  }

  const handleGoBack = () => {
    // Clear beep state for the stage we're going back to (so it can re-beep if needed)
    const lastDone = stages.filter(s => s.endTime).at(-1)
    if (lastDone) beepedRef.current.delete(lastDone.stageId)
    goBackStage()
    setStageNotes('')
    setInclusionName('')
    setInclusionGrams('')
    setColdRetard(false)
  }

  const openEditStage = (s, cfg) => {
    const dur = stageDurationMin(s) ?? 0
    setEditingStage({
      stageId: s.stageId,
      label: cfg?.label || s.stageId,
      hours: Math.floor(dur / 60),
      minutes: dur % 60,
    })
  }

  const handleSaveEditStage = () => {
    if (!editingStage) return
    const totalMinutes = (editingStage.hours * 60) + editingStage.minutes
    editStageDuration(editingStage.stageId, totalMinutes)
    setEditingStage(null)
  }

  const handleIngredientsSubmit = (recipe) => {
    updateRecipe(recipe)
    endStage('ingredients', '', {})
  }

  const handleLogTemp = () => {
    if (!tempAmbient && !tempDough) return
    bakeActions.logTemp(
      tempAmbient ? Number(tempAmbient) : null,
      tempDough   ? Number(tempDough)   : null,
      tempUnit
    )
    setTempAmbient('')
    setTempDough('')
    setShowTempModal(false)
  }

  const handleComplete = () => {
    if (activeStage) endStage(activeStage.stageId, stageNotes, {})
    navigate('/survey')
  }

  const cardBg   = activeStage && isBakeStage(activeStage.stageId) ? 'bg-orange-50 border-orange-400' : 'bg-amber-50 border-amber-400'
  const textMain = activeStage && isBakeStage(activeStage.stageId) ? 'text-orange-800' : 'text-amber-800'
  const btnColor = activeStage && isBakeStage(activeStage.stageId) ? 'bg-orange-600 hover:bg-orange-500' : 'bg-amber-600 hover:bg-amber-500'

  // Bake covered: change button label once the 18 min are up
  const bakeCoveredDone = activeStage?.stageId === 'bake_covered' &&
    activeStageConfig?.countDown * 60 - elapsedSecs(activeStage?.startTime) <= 0
  const endBtnLabel = bakeCoveredDone
    ? 'Lid Off → Bake Uncovered'
    : `Done — ${activeStageConfig?.label}`
  const endBtnColor = bakeCoveredDone
    ? 'bg-green-600 hover:bg-green-500'
    : btnColor

  // Bake name for header: use recipe name if set, or "Bake"
  const bakeName = activeBake.recipe?.name || 'New Bake'

  return (
    <div className="min-h-screen bg-dough-50 pb-8">
      {/* Header */}
      <div className="bg-dough-600 text-white px-4 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1"><ChevronLeft size={24} /></button>
            <div>
              <h2 className="text-xl font-bold">{bakeName}</h2>
              <p className="text-dough-200 text-xs mt-0.5">
                Started {new Date(activeBake.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={() => setShowAbandon(true)} className="text-dough-300 text-xs border border-dough-400 rounded-lg px-2 py-1">
            Abandon
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Active stage: Ingredients form (special — no timer) ── */}
        {activeStage?.stageId === 'ingredients' && (
          <div className="bg-white rounded-2xl border border-dough-200 p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Recipe & Ingredients</h3>
            <IngredientsForm onSave={handleIngredientsSubmit} />
          </div>
        )}

        {/* ── Active stage: timed stages ── */}
        {activeStage && activeStageConfig && !activeStageConfig.isForm && (
          <div className={`rounded-2xl p-4 border-2 ${cardBg}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold text-lg ${textMain}`}>{activeStageConfig.label}</span>
              <div className="flex items-center gap-2">
                {activeStageConfig.ovenTemp && (
                  <span className="flex items-center gap-1 bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-lg">
                    <Flame size={12} /> {activeStageConfig.ovenTemp}
                  </span>
                )}
                <button onClick={() => setShowTips(activeStageConfig.id)} className={`${textMain} opacity-60`}>
                  <Info size={18} />
                </button>
              </div>
            </div>

            <p className={`text-sm mb-1 ${textMain} opacity-75`}>{activeStageConfig.description}</p>

            {SF_IDS.includes(activeStage.stageId) && (
              <SFProgressBar completedIds={completedIds} activeId={activeStage.stageId} />
            )}

            <TimerDisplay startTime={activeStage.startTime} config={activeStageConfig} />

            {/* Levain weight inputs */}
            {activeStage.stageId === 'levain_build' && (
              <LevainInputs
                unfed={levainUnfed}     setUnfed={setLevainUnfed}
                feedFlour={levainFlour} setFeedFlour={setLevainFlour}
                feedWater={levainWater} setFeedWater={setLevainWater}
              />
            )}

            {/* Inclusions at S&F 2 */}
            {activeStage.stageId === 'sf_2' && (
              <div className="mt-2 bg-amber-100 rounded-xl p-3 space-y-2">
                <p className="text-amber-800 text-xs font-semibold uppercase tracking-wide">Inclusions (optional)</p>
                <div className="flex gap-2">
                  <input className="input flex-1 text-sm bg-white" value={inclusionName}
                    onChange={e => setInclusionName(e.target.value)} placeholder="e.g. Olives, seeds, cheese" />
                  <div className="relative w-24 shrink-0">
                    <input className="input pr-6 text-sm bg-white" type="number" inputMode="decimal"
                      value={inclusionGrams} onChange={e => setInclusionGrams(e.target.value)} placeholder="50" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cold retard for final proof */}
            {activeStage.stageId === 'final_proof' && (
              <div className="mt-2 flex items-center gap-2 bg-amber-100 rounded-xl px-3 py-2">
                <input type="checkbox" id="cold" checked={coldRetard} onChange={e => setColdRetard(e.target.checked)}
                  className="w-4 h-4 accent-amber-600" />
                <label htmlFor="cold" className="text-amber-800 text-sm">Cold retard in fridge</label>
              </div>
            )}

            {/* Shaping add-ons note */}
            <input
              className="mt-3 w-full bg-amber-100 border border-amber-300 rounded-xl px-3 py-2 text-sm placeholder-amber-400 focus:outline-none"
              placeholder={activeStage.stageId === 'shaping' ? 'Add-ons / notes (e.g. sesame seeds, rice flour)' : 'Stage notes (optional)'}
              value={stageNotes}
              onChange={e => setStageNotes(e.target.value)}
            />

            <button onClick={handleEndStage}
              className={`mt-3 w-full text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 ${endBtnColor}`}>
              <CheckCircle2 size={20} />
              {endBtnLabel}
            </button>

            {completedIds.length > 0 && (
              <button onClick={handleGoBack}
                className="mt-2 w-full flex items-center justify-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm py-2">
                <Undo2 size={14} /> Undo — go back to previous stage
              </button>
            )}
          </div>
        )}

        {/* ── Next stage card ── */}
        {!activeStage && nextStageConfig && !allDone && (
          <div className="bg-white border border-dough-200 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Up Next</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-lg">{nextStageConfig.label}</h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  {nextStageConfig.isForm
                    ? 'Enter recipe details'
                    : nextStageConfig.countDown
                    ? `${nextStageConfig.countDown} min countdown`
                    : nextStageConfig.typicalMax >= 60
                    ? `${Math.round(nextStageConfig.typicalMin / 60)}–${Math.round(nextStageConfig.typicalMax / 60)} hr`
                    : `${nextStageConfig.typicalMin}–${nextStageConfig.typicalMax} min`}
                  {nextStageConfig.ovenTemp && ` · ${nextStageConfig.ovenTemp}`}
                </p>
              </div>
              <button onClick={() => handleStartStage(nextStageConfig.id)}
                className="bg-dough-600 hover:bg-dough-500 text-white rounded-xl px-4 py-3 font-medium flex items-center gap-1 shrink-0">
                {nextStageConfig.isForm ? 'Enter' : 'Start'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Completed stages ── */}
        {completedIds.length > 0 && (
          <div className="bg-white border border-dough-100 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-400 text-xs uppercase tracking-wide mb-3">Completed</h3>
            <div className="space-y-2">
              {stages.filter(s => s.endTime).map(s => {
                const cfg = STAGES.find(c => c.id === s.stageId)
                const dur = stageDurationMin(s)
                const inc = s.inclusion || s.mixIn
                const editable = !cfg?.isForm && !cfg?.noTimer && dur != null
                return (
                  <div key={s.stageId} className="text-sm">
                    <button
                      className="w-full text-left"
                      onClick={() => editable && openEditStage(s, cfg)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 flex-wrap">
                          <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                          <span>{cfg?.label || s.stageId}</span>
                          {s.isCold && <span className="text-xs text-blue-500">(cold)</span>}
                          {inc?.name && (
                            <span className="text-xs text-dough-500 bg-dough-50 px-1.5 py-0.5 rounded-full">
                              + {inc.name}{inc.grams ? ` ${inc.grams}g` : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-gray-400 text-xs">
                            {cfg?.isForm ? '✓' : dur != null ? `${dur} min` : ''}
                          </span>
                          {editable && <Pencil size={11} className="text-gray-300" />}
                        </div>
                      </div>
                    </button>
                    {/* Levain data summary */}
                    {s.levainData && (
                      <div className="ml-5 mt-0.5 text-xs text-gray-400">
                        {s.levainData.unfed}g unfed + {s.levainData.flour}g flour + {s.levainData.water}g water = {s.levainData.total}g total
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Temperature log ── */}
        <div className="bg-white border border-dough-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Temperature</h3>
            <button onClick={() => setShowTempModal(true)} className="flex items-center gap-1 text-dough-600 text-sm font-medium">
              <ThermometerSun size={16} /> Log
            </button>
          </div>
          {tempLogs.length === 0 ? (
            <p className="text-gray-400 text-sm">No readings yet</p>
          ) : (
            <div className="space-y-1">
              {[...tempLogs].reverse().slice(0, 4).map((t, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600">
                  <span className="text-gray-400">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>
                    {t.ambient != null && `Amb ${t.ambient}°${t.unit}`}
                    {t.ambient != null && t.dough != null && '  ·  '}
                    {t.dough != null && `Dough ${t.dough}°${t.unit}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Finish bake ── */}
        {(allDone || completedIds.length >= 3) && (
          <button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl py-4 font-bold text-lg">
            Bake Complete → Rate It
          </button>
        )}
      </div>

      {/* Temp modal */}
      {showTempModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowTempModal(false)}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Log Temperature</h3>
            <div className="flex gap-2 mb-4">
              {['F', 'C'].map(u => (
                <button key={u} onClick={() => setTempUnit(u)}
                  className={`px-4 py-2 rounded-xl font-medium ${tempUnit === u ? 'bg-dough-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  °{u}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">Ambient °{tempUnit}</label>
                <input className="input" type="number" inputMode="decimal" value={tempAmbient} onChange={e => setTempAmbient(e.target.value)} placeholder="72" />
              </div>
              <div>
                <label className="label">Dough °{tempUnit}</label>
                <input className="input" type="number" inputMode="decimal" value={tempDough} onChange={e => setTempDough(e.target.value)} placeholder="76" />
              </div>
            </div>
            <button onClick={handleLogTemp} className="w-full bg-dough-600 text-white rounded-xl py-3 font-bold">Save</button>
          </div>
        </div>
      )}

      {/* Tips modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowTips(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-3">{STAGES.find(s => s.id === showTips)?.label} Tips</h3>
            <ul className="space-y-2">
              {STAGES.find(s => s.id === showTips)?.tips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-dough-500 mt-0.5 shrink-0">•</span> {tip}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowTips(null)} className="mt-4 w-full bg-gray-100 rounded-xl py-3 font-medium">Got it</button>
          </div>
        </div>
      )}

      {/* Edit stage duration modal */}
      {editingStage && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setEditingStage(null)}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Edit Duration</h3>
            <p className="text-gray-400 text-sm mb-4">{editingStage.label}</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="label">Hours</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={editingStage.hours}
                    onChange={e => setEditingStage(prev => ({ ...prev, hours: Math.max(0, Number(e.target.value)) }))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">hr</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="label">Minutes</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="59"
                    value={editingStage.minutes}
                    onChange={e => setEditingStage(prev => ({ ...prev, minutes: Math.min(59, Math.max(0, Number(e.target.value))) }))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingStage(null)} className="flex-1 bg-gray-100 rounded-xl py-3 font-medium">Cancel</button>
              <button onClick={handleSaveEditStage} className="flex-1 bg-dough-600 text-white rounded-xl py-3 font-bold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon confirm */}
      {showAbandon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Abandon Bake?</h3>
            <p className="text-gray-500 text-sm mb-4">This bake will be discarded and not saved.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbandon(false)} className="flex-1 bg-gray-100 rounded-xl py-3 font-medium">Cancel</button>
              <button onClick={() => { abandonBake(); navigate('/') }} className="flex-1 bg-red-500 text-white rounded-xl py-3 font-medium">Abandon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
