import { STAGES } from './stages'

// ── Cinnamon roll stage definitions ──────────────────────────────────────────

const CINNAMON_ROLL_STAGES = [
  {
    id: 'ingredients',
    label: 'Ingredients',
    description: 'Confirm your ingredient weights before mixing.',
    isForm: true,
  },
  {
    id: 'cr_mix_rest',
    label: 'Mix & Rest',
    description: 'Mix dough with paddle attachment until sticky, then rest 30 minutes covered.',
    countDown: 30,
    tips: [
      'Use paddle attachment: mix melted butter + kefir first to avoid chunking',
      'Add egg, starter, sugar, then flour + salt last',
      'Mix ~1 minute until a sticky dough forms',
      'Cover and rest 30 minutes',
    ],
  },
  {
    id: 'cr_knead',
    label: 'Knead',
    description: 'Switch to dough hook, knead on medium-low until soft, supple, and pulling away from bowl.',
    countUp: true,
    typicalMin: 6,
    typicalMax: 8,
    tips: [
      'Switch to dough hook attachment',
      'Knead on medium-low for 6–8 minutes',
      'Dough is ready when soft, supple, and pulling cleanly away from the bowl',
      'If too sticky, add more flour — up to 360g total',
    ],
  },
  {
    id: 'cr_bulk_rise',
    label: 'Bulk Rise',
    description: 'Do 1 stretch & fold after 30 min, then rise 8–12 hours until doubled.',
    countUp: true,
    typicalMin: 480,
    typicalMax: 720,
    tips: [
      'After 30 minutes, do 1 set of stretch & folds',
      'Cover and leave undisturbed for 8–12 hours at room temp',
      'Enriched doughs rise slower than lean sourdough — be patient',
      'Dough should roughly double in size',
      'Can bulk in the fridge overnight if your kitchen is warm',
    ],
  },
  {
    id: 'cr_fill_shape',
    label: 'Fill & Shape',
    description: 'Roll out dough, spread cinnamon filling, roll tight, cut into 8 rolls.',
    countUp: true,
    typicalMin: 20,
    typicalMax: 40,
    tips: [
      'Flour the surface generously (olive oil works great too)',
      'Roll dough into a 16×12" rectangle',
      'Spread 8 TB softened butter all the way to the edges',
      'Scatter cinnamon-sugar (100g sugar + 1 TB cinnamon + 1 TB flour)',
      'Add pecans evenly over the filling',
      'Roll tight — even pressure as you go',
      'Cut into 8 rolls: 6 in a glass baking pan, 2 in jars',
      'Option: freeze here, then defrost overnight and bake in the morning',
    ],
  },
  {
    id: 'cr_second_rise',
    label: 'Second Rise',
    description: 'Rest 1–2 hours until puffy, or refrigerate overnight and bring to room temp before baking.',
    countUp: true,
    typicalMin: 60,
    typicalMax: 120,
    tips: [
      'Cover loosely and rest at room temp 1–2 hours',
      'Rolls should look puffy and slightly increased in size',
      'Option: refrigerate overnight, then bring to room temp before baking',
    ],
  },
  {
    id: 'cr_preheat',
    label: 'Preheat Oven',
    description: 'Preheat to 350°F. No Dutch oven needed — just a regular rack.',
    noTimer: true,
    ovenTemp: '350°F / 175°C',
    tips: [
      'Standard oven, no Dutch oven or lid needed',
      'Center rack position',
      'Allow 15–20 minutes to fully preheat',
    ],
  },
  {
    id: 'cr_bake',
    label: 'Bake',
    description: 'Bake 35–45 minutes until light golden brown. Check at 35 minutes.',
    countDown: 35,
    ovenTemp: '350°F / 175°C',
    tips: [
      'Check at 35 minutes — done when light golden brown on top',
      'Total bake time: 35–45 minutes depending on your oven',
      'A toothpick in the doughy center should come out clean',
      'Cool slightly before adding frosting or icing',
    ],
  },
]

// ── Auto-advance maps ─────────────────────────────────────────────────────────

const SOURDOUGH_AUTO_ADVANCE = {
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

const CR_AUTO_ADVANCE = {
  cr_mix_rest:    'cr_knead',
  cr_knead:       'cr_bulk_rise',
  cr_bulk_rise:   'cr_fill_shape',
  cr_fill_shape:  'cr_second_rise',
  cr_second_rise: 'cr_preheat',
  // cr_preheat is noTimer (no auto-advance); cr_bake is the last stage
}

// ── Recipe definitions ────────────────────────────────────────────────────────

export const RECIPES = [
  {
    id: 'sourdough_loaf',
    name: 'Sourdough Loaf',
    emoji: '🍞',
    description: 'Classic country sourdough — crispy crust, open crumb',
    stageConfigs: STAGES,
    autoAdvance: SOURDOUGH_AUTO_ADVANCE,
    defaultIngredients: null, // user fills in form from scratch
  },
  {
    id: 'cinnamon_rolls',
    name: 'Sourdough Cinnamon Rolls',
    emoji: '🍥',
    description: 'Enriched dough with overnight bulk rise and gooey cinnamon-sugar filling',
    stageConfigs: CINNAMON_ROLL_STAGES,
    autoAdvance: CR_AUTO_ADVANCE,
    defaultIngredients: {
      name: 'Sourdough Cinnamon Rolls',
      starterGrams: 100,
      flours: [{ name: 'All-Purpose Flour', grams: 300 }],
      flourGrams: 300,
      waterGrams: 160,
      saltGrams: 5,
      waterLabel: 'Kefir / Milk',
      notes: 'Wet: 1 egg, 28g melted butter (2 TB), 24g sugar.\nFilling: 8 TB softened butter, 100g sugar, 1 TB cinnamon, 1 TB flour, pecans.',
    },
  },
]

export function getRecipe(id) {
  return RECIPES.find(r => r.id === id) || RECIPES[0]
}
