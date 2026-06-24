import { motion } from 'framer-motion'

interface TimerControlsProps {
  isRunning: boolean
  isCompleted: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onRemove: () => void
}

export default function TimerControls({
  isRunning,
  isCompleted,
  onStart,
  onPause,
  onReset,
  onRemove,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {isCompleted ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={onReset}
          className="w-11 h-11 rounded-full flex items-center justify-center
                     bg-warm-100 hover:bg-warm-200 active:bg-warm-300 transition-colors"
          title="Reset"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
               className="text-warm-600">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </motion.button>
      ) : (
        <>
          {isRunning ? (
            <button
              onClick={onPause}
              className="w-11 h-11 rounded-full flex items-center justify-center
                         bg-warm-200 hover:bg-warm-300 active:bg-warm-400 transition-colors"
              title="Pause"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-warm-700">
                <rect x="6" y="4" width="5" height="16" rx="1.5" />
                <rect x="13" y="4" width="5" height="16" rx="1.5" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="w-11 h-11 rounded-full flex items-center justify-center
                         bg-warm-800 hover:bg-warm-700 active:bg-warm-900 transition-colors"
              title="Start"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-0.5">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </button>
          )}

          <button
            onClick={onReset}
            className="w-9 h-9 rounded-full flex items-center justify-center
                       hover:bg-warm-100 active:bg-warm-200 transition-colors"
            title="Reset"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                 className="text-warm-400">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </>
      )}

      <button
        onClick={onRemove}
        className="w-9 h-9 rounded-full flex items-center justify-center
                   hover:bg-red-50 active:bg-red-100 transition-colors ml-1"
        title="Remove"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" strokeLinecap="round"
             className="text-warm-300 hover:text-red-400 transition-colors">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
