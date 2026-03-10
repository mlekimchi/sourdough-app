import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'

const CRITERIA = [
  { key: 'rise',   label: 'Oven Spring / Rise',   description: 'How much did it rise in the oven?' },
  { key: 'crumb',  label: 'Crumb Structure',        description: 'Open & airy vs dense & tight' },
  { key: 'crust',  label: 'Crust',                  description: 'Color, crackle, and thickness' },
  { key: 'flavor', label: 'Flavor',                 description: 'Tang, complexity, overall taste' },
  { key: 'overall',label: 'Overall',                description: 'Your overall satisfaction' },
]

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} className="focus:outline-none">
          <Star
            size={32}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
          />
        </button>
      ))}
    </div>
  )
}

export default function Survey({ onCompleteBake }) {
  const navigate = useNavigate()
  const [ratings, setRatings] = useState({ rise: 0, crumb: 0, crust: 0, flavor: 0, overall: 0 })
  const [notes, setNotes] = useState('')

  const set = (key, val) => setRatings(r => ({ ...r, [key]: val }))
  const allRated = Object.values(ratings).every(v => v > 0)

  const handleSubmit = () => {
    if (!allRated) return
    onCompleteBake({ ...ratings, notes })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-dough-50 pb-32">
      {/* Header */}
      <div className="bg-dough-600 text-white px-4 pt-12 pb-6">
        <h2 className="text-2xl font-bold">Rate Your Bake</h2>
        <p className="text-dough-200 text-sm mt-1">Your feedback trains the AI suggestions</p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {CRITERIA.map(c => (
          <div key={c.key} className="bg-white rounded-2xl border border-dough-100 p-4">
            <div className="mb-1">
              <span className="font-semibold text-gray-800">{c.label}</span>
              <p className="text-gray-500 text-xs mt-0.5">{c.description}</p>
            </div>
            <div className="mt-3">
              <StarRating value={ratings[c.key]} onChange={v => set(c.key, v)} />
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-dough-100 p-4">
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[100px]"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you notice? What would you change next time?"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-dough-200 px-4 py-4">
        <button
          onClick={handleSubmit}
          disabled={!allRated}
          className="w-full bg-dough-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg"
        >
          Save Bake
        </button>
        {!allRated && (
          <p className="text-center text-xs text-gray-400 mt-2">Rate all categories to save</p>
        )}
      </div>
    </div>
  )
}
