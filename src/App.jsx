import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useBakeSession } from './hooks/useBakeSession'
import { getActiveBake } from './services/storage'
import Home from './pages/Home'
import NewBake from './pages/NewBake'
import RecipeBook from './pages/RecipeBook'
import ActiveBake from './pages/ActiveBake'
import Survey from './pages/Survey'
import History from './pages/History'
import AIInsights from './pages/AIInsights'
import Settings from './pages/Settings'

export default function App() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const bakeSession = useBakeSession()
  const { activeBake, startBake, completeBake } = bakeSession
  // Fall back to localStorage so the /bake route guard works even if React
  // state hasn't flushed yet after startBake (navigate fires synchronously).
  const effectiveActiveBake = activeBake ?? getActiveBake()

  const bakeActions = {
    startStage: bakeSession.startStage,
    endStage: bakeSession.endStage,
    updateRecipe: bakeSession.updateRecipe,
    logStretchAndFold: bakeSession.logStretchAndFold,
    logTemp: bakeSession.logTemp,
    completeBake: bakeSession.completeBake,
    abandonBake: bakeSession.abandonBake,
    goBackStage: bakeSession.goBackStage,
    editStageDuration: bakeSession.editStageDuration,
  }

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Routes>
        <Route path="/" element={<Home activeBake={activeBake} />} />
        <Route path="/new-bake" element={<NewBake onStartBake={startBake} />} />
        <Route path="/recipes" element={<RecipeBook onStartBake={startBake} />} />
        <Route
          path="/bake"
          element={
            effectiveActiveBake
              ? <ActiveBake activeBake={effectiveActiveBake} bakeActions={bakeActions} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/survey"
          element={<Survey onCompleteBake={completeBake} />}
        />
        <Route path="/history" element={<History />} />
        <Route path="/insights" element={<AIInsights />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
