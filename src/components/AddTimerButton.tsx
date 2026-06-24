import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerStore } from '@/stores/timerStore'

const QUICK_TIMES = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '60 min', seconds: 3600 },
]

export default function AddTimerButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const addTimer = useTimerStore((s) => s.addTimer)

  const handleQuickAdd = (seconds: number, label: string) => {
    addTimer(label, seconds)
    setIsOpen(false)
  }

  const handleCustomAdd = () => {
    const mins = parseInt(customMinutes)
    if (mins > 0 && mins <= 1440) {
      addTimer(`${mins} min`, mins * 60)
      setCustomMinutes('')
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 bg-white rounded-3xl shadow-card-hover p-5 w-72 z-20"
          >
            <p className="text-xs font-bold text-warm-400 uppercase tracking-widest mb-4 px-1">
              Quick Add
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {QUICK_TIMES.map((qt) => (
                <button
                  key={qt.label}
                  onClick={() => handleQuickAdd(qt.seconds, qt.label)}
                  className="px-2 py-2.5 text-sm font-bold text-warm-600 bg-warm-50
                             hover:bg-warm-100 active:bg-warm-200 rounded-2xl transition-colors"
                >
                  {qt.label}
                </button>
              ))}
            </div>
            <div className="border-t-2 border-warm-100 pt-4">
              <p className="text-xs font-bold text-warm-400 uppercase tracking-widest mb-3 px-1">
                Custom Minutes
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomAdd()
                  }}
                  placeholder="e.g. 45"
                  min="1"
                  max="1440"
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-warm-50 rounded-2xl outline-none
                             ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                             transition-all"
                />
                <button
                  onClick={handleCustomAdd}
                  disabled={!customMinutes || parseInt(customMinutes) <= 0}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-warm-800
                             hover:bg-warm-700 active:bg-warm-900 rounded-2xl transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-2xl bg-warm-800 text-white shadow-card hover:shadow-card-hover
                   flex items-center justify-center transition-shadow"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </motion.svg>
      </motion.button>
    </div>
  )
}
