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
    id: 'cr_prepare_dough',
    label: 'Prepare Dough',
    description: 'Combine wet ingredients and set up your mixer before mixing.',
    noTimer: true,
    tips: [
      'Melt 2 TB (28g) butter — or 8 TB for extra richness',
      'Mix melted butter + 160g kefir/milk slowly so it doesn\'t chunk',
      'In mixer with paddle: mix 1 egg, 100g starter, and 24g sugar',
      'Add the melted butter + kefir mixture',
      'Add 300–360g flour and 5g salt last',
    ],
  },
  {
    id: 'cr_mix_rest',
    label: 'Mix & Rest',
    description: 'Mix with paddle for 1 minute until a sticky dough forms. Cover and rest 30 minutes.',
    countDown: 30,
    tips: [
      'Mix on low with paddle attachment for ~1 minute',
      'Stop when a sticky, shaggy dough forms — don\'t overmix',
      'Cover tightly and rest for 30 minutes',
    ],
  },
  {
    id: 'cr_knead',
    label: 'Knead',
    description: 'Switch to dough hook, knead on medium-low for 6–8 minutes until soft, supple, and pulling away.',
    countDown: 8,
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
    id: 'cr_stretch_fold',
    label: 'Rest & Stretch',
    description: 'Rest 30 minutes, then do 1 set of stretch & folds.',
    countDown: 30,
    tips: [
      'Cover and rest for 30 minutes',
      'After timer: do 1 set of stretch & folds (4 folds, rotating the bowl)',
      'Wet your hands to prevent sticking',
      'Then move straight to bulk rise',
    ],
  },
  {
    id: 'cr_bulk_rise',
    label: 'Bulk Rise',
    description: 'Rise 8–12 hours at room temp until dough doubles in size.',
    countUp: true,
    typicalMin: 480,
    typicalMax: 720,
    tips: [
      'Cover and leave undisturbed for 8–12 hours at room temp',
      'Enriched doughs rise slower than lean sourdough — be patient',
      'Dough should roughly double in size',
      'Can bulk in the fridge overnight if your kitchen is warm',
    ],
  },
  {
    id: 'cr_cinnamon_filling',
    label: 'Cinnamon Sugar Filling',
    description: 'Mix together the cinnamon sugar filling.',
    noTimer: true,
    tips: [
      'Mix 8 TB (112g) softened room temp butter',
      'Add 100g sugar (mix of white and brown)',
      'Add 1 TB cinnamon and 1 TB flour',
      'Mix until combined and spreadable',
    ],
  },
  {
    id: 'cr_roll_cut',
    label: 'Roll & Cut',
    description: 'Roll out dough, spread cinnamon filling, add pecans, roll tight, and cut into 8 rolls.',
    noTimer: true,
    tips: [
      'Flour the surface generously — olive oil works great too',
      'Roll dough into a 16×12" rectangle',
      'Spread cinnamon sugar filling all the way to the edges',
      'Scatter pecans evenly over the filling',
      'Roll tight — keep even pressure the whole way',
      'Cut into 8 rolls: 6 in a glass baking pan, 2 in jars',
      '❄️ Option: Freeze here. Defrost overnight and bake in the morning.',
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
      'Cover loosely and rest at room temp for 1–2 hours',
      'Rolls should look puffy and slightly increased in size',
      '❄️ Option: Refrigerate overnight. Bring to room temp before baking.',
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
    description: 'Bake at 350°F for 35–45 minutes until light golden brown. Check at 35 minutes.',
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
  cr_mix_rest:      'cr_knead',
  cr_knead:         'cr_stretch_fold',
  cr_stretch_fold:  'cr_bulk_rise',
  cr_bulk_rise:     'cr_cinnamon_filling',
  // cr_cinnamon_filling is noTimer (no auto-advance)
  cr_roll_cut:      'cr_second_rise',
  cr_second_rise:   'cr_preheat',
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
      notes: '',
      ingredientGuide: 'Wet:\n• 2 TB (28g) melted butter [or 8 TB]\n• 160g milk / kefir\n• 1 egg\n• 100g sourdough starter (active or discard)\n• 24g sugar\n\nDry:\n• 300g flour [or 360g]\n• 5g salt\n\nCinnamon Sugar Filling:\n• 6 TB (84g) room temp butter\n• 100g sugar (white + brown mix)\n• 1 TB cinnamon\n• 1 TB flour\n• Pecans',
    },
  },
]

export function getRecipe(id) {
  return RECIPES.find(r => r.id === id) || RECIPES[0]
}
