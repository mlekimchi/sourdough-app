import { getSettings } from './storage'

const API_URL = 'https://api.anthropic.com/v1/messages'

function formatBakeForPrompt(bake) {
  const { recipe, stages, tempLogs, survey } = bake
  const date = new Date(bake.createdAt).toLocaleDateString()

  const stageList = stages
    .map(s => {
      const dur = s.endTime
        ? Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000)
        : null
      const inc = s.inclusion || s.mixIn  // backwards-compat with old 'mixIn' key
      const mixInStr = inc?.name ? ` | inclusion: ${inc.name}${inc.grams ? ` ${inc.grams}g` : ''}` : ''
      return `  - ${s.stageId}: ${dur != null ? dur + ' min' : 'in progress'}${s.isCold ? ' (cold retard)' : ''}${mixInStr}${s.notes ? ' | note: ' + s.notes : ''}`
    })
    .join('\n')

  const temps = tempLogs.map(t =>
    `  - ${new Date(t.timestamp).toLocaleTimeString()}: ambient ${t.ambient ?? '?'}°${t.unit}, dough ${t.dough ?? '?'}°${t.unit}`
  ).join('\n')

  const s = survey
  const surveyText = s
    ? `Rise: ${s.rise}/5, Crumb: ${s.crumb}/5, Crust: ${s.crust}/5, Flavor: ${s.flavor}/5, Dough integrity (shaping/scoring): ${s.dough_integrity ?? 'N/A'}/5, Overall: ${s.overall}/5\nNotes: ${s.notes || 'none'}\nCrumb photo: ${s.crumbPhoto ? 'yes (included below)' : 'none'}`
    : 'No survey'

  const flourLines = recipe.flours?.length
    ? recipe.flours.map(f => `    ${f.name}: ${f.grams}g`).join('\n')
    : `    Flour: ${recipe.flourGrams}g`

  return `Bake date: ${date}
Recipe: ${recipe.name || 'Untitled'}
  Starter: ${recipe.starterGrams}g (${recipe.starterPercentage}%)
  Flour (total ${recipe.flourGrams}g):
${flourLines}
  Water: ${recipe.waterGrams}g (${recipe.hydration}% hydration)
  Salt: ${recipe.saltGrams}g (${recipe.saltPercentage}%)
  Recipe notes: ${recipe.notes || 'none'}
Stages:
${stageList || '  none logged'}
Temperature logs:
${temps || '  none logged'}
Survey: ${surveyText}`
}

// Strip the data URL prefix to get raw base64 for the API
function extractBase64(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '')
}

export async function getAIInsights(bakes) {
  const { claudeApiKey } = getSettings()
  if (!claudeApiKey) throw new Error('No API key set. Add it in Settings.')

  const surveyed = bakes.filter(b => b.survey)
  if (!surveyed.length) throw new Error('No completed bakes with surveys to analyze.')

  const systemPrompt = `You are a sourdough bread expert and baker's assistant.
Analyze the baker's bake history and provide specific, actionable insights.
Be warm and encouraging. Focus on patterns across bakes.
When crumb photos are provided, analyze the crumb structure (bubble size, distribution, gumminess) to assess proofing level — look for signs of underproofing (dense, gummy, uneven small bubbles) or overproofing (collapsed structure, large irregular holes with weak walls).
The dough integrity rating (1–5) reflects how well the dough held its shape during shaping and scoring: 1 = very flabby/spread, 5 = held shape perfectly. Use this alongside crumb photos to assess bulk fermentation accuracy.
Structure your response with:
1. What's going well
2. Key observations (timing, temperature, technique, proofing)
3. Suggested recipe adjustment for next bake (be specific with numbers)
4. One technique tip to try next time
Keep the response concise and practical — this will be read on a phone.`

  // Build multipart message content interleaving text summaries and crumb photos
  const contentBlocks = []

  contentBlocks.push({
    type: 'text',
    text: 'Here is my sourdough bake history. Please analyze it and suggest improvements for my next bake.\n\n',
  })

  surveyed.forEach((bake, i) => {
    contentBlocks.push({
      type: 'text',
      text: `=== Bake ${i + 1} ===\n${formatBakeForPrompt(bake)}\n\n`,
    })
    if (bake.survey?.crumbPhoto) {
      contentBlocks.push({
        type: 'text',
        text: `Crumb photo for Bake ${i + 1}:\n`,
      })
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: extractBase64(bake.survey.crumbPhoto),
        },
      })
      contentBlocks.push({ type: 'text', text: '\n' })
    }
  })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: contentBlocks }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  return data.content[0].text
}
