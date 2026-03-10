import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Wheat } from 'lucide-react'

export default function NewBake({ onStartBake }) {
  const navigate = useNavigate()

  const handleStart = () => {
    onStartBake({ name: '', starterGrams: null, flourGrams: null, waterGrams: null, saltGrams: null, notes: '' })
    navigate('/bake')
  }

  return (
    <div className="min-h-screen bg-dough-50">
      <div className="bg-dough-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">New Bake</h2>
        </div>
      </div>

      <div className="px-6 py-12 flex flex-col items-center text-center">
        <div className="bg-dough-100 rounded-full p-6 mb-6">
          <Wheat size={48} className="text-dough-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to bake?</h3>
        <p className="text-gray-500 mb-2">You'll enter your recipe and ingredients in the first steps.</p>
        <p className="text-gray-400 text-sm mb-10">
          First step: feed your starter and start the levain build timer.
        </p>

        <button
          onClick={handleStart}
          className="w-full bg-dough-600 hover:bg-dough-500 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
        >
          Start Bake
        </button>
      </div>
    </div>
  )
}
