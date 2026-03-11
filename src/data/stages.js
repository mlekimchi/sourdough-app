// Sourdough bake stages in order
// countDown: number (minutes) → countdown timer
// countUp: true → elapsed timer (open-ended)
// isForm: true → renders a form instead of a timer

export const STAGES = [
  {
    id: 'levain_build',
    label: 'Levain Build',
    description: 'Feed your starter and let it reach peak activity — dome-shaped, bubbly, and doubled.',
    countUp: true,
    optional: false,
    typicalMin: 240,
    typicalMax: 720,
    tips: [
      'Standard feeding: equal parts unfed starter, flour, and water (1:1:1)',
      'Mark the starting level with a rubber band',
      'Peak = domed top, just starting to fall',
      'Float test: a small piece dropped in water should float',
      'Ideal temp: 75–80°F (24–27°C)',
    ],
  },
  {
    id: 'ingredients',
    label: 'Ingredients',
    description: 'Enter your recipe name and ingredient weights.',
    isForm: true,
  },
  {
    id: 'mix_rest',
    label: 'Mix & Rest',
    description: 'Combine all ingredients until no dry flour remains. Cover and rest 30 minutes.',
    countDown: 30,
    typicalMin: 30,
    typicalMax: 30,
    tips: [
      'Mix until all flour is hydrated — no dry bits',
      'Dough will look shaggy and rough at this stage, that\'s normal',
      'Cover tightly so the surface doesn\'t dry out',
      'This rest (autolyse) helps gluten form before you start working the dough',
    ],
  },
  {
    id: 'sf_1',
    label: 'Stretch & Fold 1',
    description: 'Perform your first set of stretch & folds (4 folds, rotating the bowl). Then rest 30 minutes.',
    countDown: 30,
    typicalMin: 30,
    typicalMax: 30,
    tips: [
      'Wet your hands to prevent sticking',
      'Grab one side, stretch up high, fold to the opposite side',
      'Rotate bowl 90° and repeat — 4 folds = 1 set',
      'Dough will still feel loose — that\'s fine',
    ],
  },
  {
    id: 'sf_2',
    label: 'Stretch & Fold 2',
    description: 'Second set of stretch & folds. Good time to add inclusions. Then rest 30 minutes.',
    countDown: 30,
    typicalMin: 30,
    typicalMax: 30,
    hasInclusion: true,
    tips: [
      'Dough should feel noticeably smoother and more elastic now',
      'To add inclusions: flatten slightly, scatter evenly, fold over, then do your S&F',
      'Great inclusions: olives, seeds, dried fruit, cheese, roasted garlic, herbs',
    ],
  },
  {
    id: 'sf_3',
    label: 'Stretch & Fold 3',
    description: 'Third set of stretch & folds. Dough should be gaining real strength. Rest 30 minutes.',
    countDown: 30,
    typicalMin: 30,
    typicalMax: 30,
    tips: [
      'Dough should feel strong and hold its shape after folding',
      'It should resist stretching more than earlier rounds',
      'Coil folds work well at this stage too',
    ],
  },
  {
    id: 'sf_4',
    label: 'Stretch & Fold 4',
    description: 'Final set of stretch & folds. After this, cover and move directly into bulk fermentation.',
    countUp: true,
    typicalMin: 2,
    typicalMax: 5,
    tips: [
      'Dough should be smooth, strong, and hold a dome shape',
      'No rest after this set — go straight to bulk fermentation',
      'The dough is now ready to ferment undisturbed',
    ],
  },
  {
    id: 'bulk_ferment',
    label: 'Bulk Fermentation',
    description: 'Cover and leave undisturbed until dough has grown 50–75%, is bubbly, and jiggles when shaken.',
    countUp: true,
    typicalMin: 240,   // 4 hours
    typicalMax: 960,   // ~overnight (16 hrs)
    tips: [
      'Mark the starting level with a rubber band or tape',
      'Look for 50–75% volume increase (not double)',
      'Bubbles on the sides and a domed top are good signs',
      'Jiggle the container — dough should wobble like jello',
      'Warmer = faster. Every degree matters.',
    ],
  },
  {
    id: 'shaping',
    label: 'Shaping',
    description: 'Turn dough onto an unfloured surface, pre-shape, bench rest 20 min, then final shape.',
    countUp: true,
    typicalMin: 20,
    typicalMax: 40,
    hasAddOns: true,
    tips: [
      'Use a dry surface for pre-shaping — friction builds tension',
      'Bench rest 20 min uncovered so a skin forms',
      'Final shape: drag toward you to build surface tension',
      'Place seam-side up in a well-floured banneton or lined bowl',
    ],
  },
  {
    id: 'final_proof',
    label: 'Final Proof',
    description: 'Cover and proof at room temperature 2 hours, or cold retard in fridge 2–10 hours.',
    countUp: true,
    typicalMin: 120,
    typicalMax: 600,
    coldOption: true,
    tips: [
      'Room temp (~70°F): 1.5–2 hours',
      'Cold retard (fridge): 8–16 hours for more flavor and easier scoring',
      'Poke test: slowly springs back = ready. Springs back fast = underproofed.',
      'You can score and bake straight from the fridge',
    ],
  },
  {
    id: 'preheat',
    label: 'Preheat Oven',
    description: 'Place dutch oven inside and preheat to 500°F. Allow at least 30–45 minutes.',
    noTimer: true,
    ovenTemp: '500°F / 260°C',
    tips: [
      'Dutch oven must be scorching hot — critical for oven spring',
      'Put the lid on while preheating',
      'Use an oven thermometer to verify temp',
      'Score your dough now while waiting',
    ],
  },
  {
    id: 'bake_covered',
    label: 'Bake Covered',
    description: 'Score dough, lower into the hot dutch oven, place lid on, bake at 485°F.',
    countDown: 18,
    typicalMin: 18,
    typicalMax: 18,
    ovenTemp: '485°F / 252°C',
    tips: [
      'Score quickly and confidently — one bold slash or a pattern',
      'Use parchment paper to safely lower dough into the pot',
      'Don\'t peek — keep the lid on the full 18 minutes',
      'Steam trapped inside creates the oven spring',
    ],
  },
  {
    id: 'bake_uncovered',
    label: 'Bake Uncovered',
    description: 'Remove lid, reduce heat to 465°F, and bake until deep golden brown.',
    countDown: 25,
    typicalMin: 25,
    typicalMax: 25,
    ovenTemp: '465°F / 240°C',
    tips: [
      'Lower to 465°F when removing the lid',
      'Bake until deep golden-brown — don\'t under-bake',
      'Internal temp: 205–210°F (96–99°C)',
      'Cool on a wire rack at least 1 hour before slicing',
    ],
  },
]

export const STAGE_IDS = STAGES.map(s => s.id)

export function getStage(id) {
  return STAGES.find(s => s.id === id)
}
