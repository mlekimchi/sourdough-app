import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RECIPES } from '../data/recipes'

export default function RecipeBook({ onStartBake }) {
  const navigate = useNavigate()

  const handleSelect = (recipe) => {
    onStartBake({
      recipe: recipe.defaultIngredients || {
        name: '', starterGrams: null, flourGrams: null, waterGrams: null, saltGrams: null, notes: '',
      },
      stageConfigs: recipe.stageConfigs,
      autoAdvance:  recipe.autoAdvance,
      recipeId:     recipe.id,
    })
    navigate('/bake')
  }

  return (
    <div className="min-h-screen bg-dough-50">
      {/* Header */}
      <div className="bg-dough-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/new-bake')} className="p-1">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">Recipe Book</h2>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {RECIPES.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl border border-dough-100 overflow-hidden">

            {/* Card header — tap to start bake */}
            <button
              className="w-full text-left p-4"
              onClick={() => handleSelect(recipe)}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl leading-none shrink-0">{recipe.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{recipe.name}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{recipe.description}</p>
                  <p className="text-dough-500 text-xs mt-1.5 font-medium">
                    {recipe.stageConfigs.length} stages · tap to start
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-300 shrink-0" />
              </div>
            </button>

            {/* Ingredient preview */}
            {recipe.defaultIngredients && (
              <div className="px-4 pb-4">
                <div className="bg-dough-50 rounded-xl p-3 text-xs text-gray-600">
                  <p className="font-semibold text-dough-700 mb-2">Key Ingredients</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Starter: {recipe.defaultIngredients.starterGrams}g</span>
                    <span>Flour: {recipe.defaultIngredients.flourGrams}g</span>
                    <span>
                      {recipe.defaultIngredients.waterLabel || 'Water'}: {recipe.defaultIngredients.waterGrams}g
                    </span>
                    <span>Salt: {recipe.defaultIngredients.saltGrams}g</span>
                  </div>
                  {recipe.defaultIngredients.notes && (
                    <p className="text-gray-400 mt-2 leading-relaxed whitespace-pre-line">
                      {recipe.defaultIngredients.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <p className="text-center text-gray-400 text-xs pt-2 pb-4">
          More recipes coming soon 🌾
        </p>
      </div>
    </div>
  )
}
