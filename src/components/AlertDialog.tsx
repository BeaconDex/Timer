import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AlertDialogProps {
  isOpen: boolean
  timerLabel: string
  onDismiss: () => void
}

export default function AlertDialog({ isOpen, timerLabel, onDismiss }: AlertDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        onDismiss()
      }
    },
    [onDismiss]
  )

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center
                     bg-warm-900/30 backdrop-blur-md"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-4xl p-10 shadow-card-hover max-w-sm w-full mx-4 text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-soft/30
                         flex items-center justify-center"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                   stroke="#D4A0A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </motion.div>

            <h2 className="text-2xl font-bold text-warm-800 mb-2">Time's Up!</h2>
            <p className="text-base text-warm-500 mb-8">
              <span className="font-bold text-warm-700">{timerLabel}</span> has finished.
            </p>

            <button
              onClick={onDismiss}
              className="w-full py-3.5 bg-warm-800 text-white rounded-2xl font-bold
                         hover:bg-warm-700 active:bg-warm-900 transition-colors text-base"
              autoFocus
            >
              Dismiss
            </button>

            <p className="text-sm font-medium text-warm-400 mt-4">
              Press Enter, Space, or click to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
