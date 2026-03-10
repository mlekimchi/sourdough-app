// Default starter recipe (country loaf, ~75% hydration)
export const DEFAULT_RECIPE = {
  name: 'Country Sourdough',
  totalFlourWeight: 500, // grams
  flours: [
    { name: 'Bread Flour', percentage: 90 },
    { name: 'Whole Wheat', percentage: 10 },
  ],
  hydration: 75,         // % of total flour weight
  starterPercentage: 20, // % of total flour weight
  saltPercentage: 2,     // % of total flour weight
  notes: '',
}

export const FLOUR_SUGGESTIONS = [
  'Bread Flour',
  'All-Purpose Flour',
  'Whole Wheat',
  'Rye',
  'Spelt',
  'Einkorn',
  'Semolina',
]
