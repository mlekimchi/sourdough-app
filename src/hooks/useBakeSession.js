import { useState, useCallback } from 'react'
import { getActiveBake, setActiveBake, saveBake, newBakeSession } from '../services/storage'

export function useBakeSession() {
  const [activeBake, setActiveBakeState] = useState(() => getActiveBake())

  const persist = useCallback(bake => {
    setActiveBake(bake)
    setActiveBakeState(bake)
  }, [])

  // Start a brand-new bake
  const startBake = useCallback(recipe => {
    const bake = newBakeSession(recipe)
    persist(bake)
    return bake
  }, [persist])

  // Start a stage timer
  const startStage = useCallback((stageId, options = {}) => {
    setActiveBakeState(prev => {
      const updated = {
        ...prev,
        stages: [
          ...prev.stages,
          {
            stageId,
            startTime: new Date().toISOString(),
            endTime: null,
            isCold: options.isCold || false,
            notes: '',
          },
        ],
      }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // End the current active stage
  const endStage = useCallback((stageId, notes = '', extras = {}) => {
    setActiveBakeState(prev => {
      const stages = prev.stages.map(s =>
        s.stageId === stageId && !s.endTime
          ? { ...s, endTime: new Date().toISOString(), notes, ...extras }
          : s
      )
      const updated = { ...prev, stages }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // Update the recipe on the active bake
  const updateRecipe = useCallback((recipe) => {
    setActiveBakeState(prev => {
      const updated = { ...prev, recipe }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // Log a stretch & fold
  const logStretchAndFold = useCallback(() => {
    setActiveBakeState(prev => {
      const setNumber = prev.stretchAndFolds.length + 1
      const updated = {
        ...prev,
        stretchAndFolds: [
          ...prev.stretchAndFolds,
          { timestamp: new Date().toISOString(), setNumber },
        ],
      }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // Log a temperature reading
  const logTemp = useCallback((ambient, dough, unit = 'F') => {
    setActiveBakeState(prev => {
      const updated = {
        ...prev,
        tempLogs: [
          ...prev.tempLogs,
          { timestamp: new Date().toISOString(), ambient, dough, unit },
        ],
      }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // Complete bake — attach survey and move to history
  const completeBake = useCallback(survey => {
    setActiveBakeState(prev => {
      const completed = {
        ...prev,
        completedAt: new Date().toISOString(),
        survey,
      }
      saveBake(completed)
      setActiveBake(null)
      return null
    })
  }, [])

  // Go back to the previous stage (undo accidental advance)
  const goBackStage = useCallback(() => {
    setActiveBakeState(prev => {
      const stages = [...prev.stages]
      // Find and remove the active (open) stage
      const activeIdx = stages.reduce((acc, s, i) => (!s.endTime ? i : acc), -1)
      if (activeIdx === -1) return prev
      stages.splice(activeIdx, 1)
      // Un-complete the last completed stage so it becomes active again
      const lastDoneIdx = stages.reduce((acc, s, i) => (s.endTime ? i : acc), -1)
      if (lastDoneIdx >= 0) {
        stages[lastDoneIdx] = { ...stages[lastDoneIdx], endTime: null, notes: '' }
      }
      const updated = { ...prev, stages }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // Edit the recorded duration of a completed stage (adjusts endTime)
  const editStageDuration = useCallback((stageId, durationMinutes) => {
    setActiveBakeState(prev => {
      const stages = prev.stages.map(s => {
        if (s.stageId === stageId && s.endTime) {
          const newEndTime = new Date(
            new Date(s.startTime).getTime() + durationMinutes * 60000
          ).toISOString()
          return { ...s, endTime: newEndTime }
        }
        return s
      })
      const updated = { ...prev, stages }
      setActiveBake(updated)
      return updated
    })
  }, [])

  // Abandon active bake without saving
  const abandonBake = useCallback(() => {
    setActiveBake(null)
    setActiveBakeState(null)
  }, [])

  return {
    activeBake,
    startBake,
    startStage,
    endStage,
    updateRecipe,
    logStretchAndFold,
    logTemp,
    completeBake,
    abandonBake,
    goBackStage,
    editStageDuration,
  }
}
