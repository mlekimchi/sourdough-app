const KEYS = {
  BAKES: 'sd_bakes',
  ACTIVE_BAKE: 'sd_active_bake',
  SETTINGS: 'sd_settings',
}

// ── Bake history ────────────────────────────────────────────────────────────

export function getAllBakes() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.BAKES)) || []
  } catch {
    return []
  }
}

export function saveBake(bake) {
  const bakes = getAllBakes()
  const idx = bakes.findIndex(b => b.id === bake.id)
  if (idx >= 0) {
    bakes[idx] = bake
  } else {
    bakes.unshift(bake)
  }
  localStorage.setItem(KEYS.BAKES, JSON.stringify(bakes))
}

export function deleteBake(id) {
  const bakes = getAllBakes().filter(b => b.id !== id)
  localStorage.setItem(KEYS.BAKES, JSON.stringify(bakes))
}

// ── Active (in-progress) bake ────────────────────────────────────────────────

export function getActiveBake() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.ACTIVE_BAKE)) || null
  } catch {
    return null
  }
}

export function setActiveBake(bake) {
  if (bake === null) {
    localStorage.removeItem(KEYS.ACTIVE_BAKE)
  } else {
    localStorage.setItem(KEYS.ACTIVE_BAKE, JSON.stringify(bake))
  }
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || {}
  } catch {
    return {}
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function createBakeId() {
  return `bake_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function newBakeSession({ recipe, stageConfigs, autoAdvance, recipeId }) {
  return {
    id: createBakeId(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    recipe,
    recipeId:     recipeId     || 'sourdough_loaf',
    stageConfigs: stageConfigs || [],   // full stage config objects for this bake
    autoAdvance:  autoAdvance  || {},   // { stageId → nextStageId }
    stages: [],           // { stageId, startTime, endTime, isCold, notes }
    stretchAndFolds: [],  // { timestamp, setNumber }
    tempLogs: [],         // { timestamp, ambient, dough, unit }
    survey: null,         // filled at end
    aiInsights: null,     // filled after AI analysis
  }
}
