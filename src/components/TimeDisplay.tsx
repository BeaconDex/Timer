import { motion, AnimatePresence } from 'framer-motion'

interface TimeDisplayProps {
  hours: number
  minutes: number
  seconds: number
  isCompleted: boolean
  onClick?: () => void
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function AnimatedDigit({ digit }: { digit: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={digit}
        initial={{ y: 28, opacity: 0, filter: 'blur(4px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: -28, opacity: 0, filter: 'blur(4px)' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="inline-block tabular-nums"
      >
        {digit}
      </motion.span>
    </AnimatePresence>
  )
}

export default function TimeDisplay({ hours, minutes, seconds, isCompleted, onClick }: TimeDisplayProps) {
  const hh = pad(hours)
  const mm = pad(minutes)
  const ss = pad(seconds)

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-bold tracking-tight text-warm-400 cursor-pointer select-none"
        onClick={onClick}
      >
        Done ✓
      </motion.div>
    )
  }

  const hasHours = hours > 0

  return (
    <div
      className="flex items-baseline gap-1.5 cursor-pointer select-none group"
      onClick={onClick}
    >
      {hasHours && (
        <>
          <span className="text-5xl font-bold tracking-tighter text-warm-800">
            <AnimatedDigit digit={hh[0]} />
            <AnimatedDigit digit={hh[1]} />
          </span>
          <span className="text-2xl font-semibold text-warm-300 mx-0.5">h</span>
        </>
      )}
      <span className="text-5xl font-bold tracking-tighter text-warm-800">
        <AnimatedDigit digit={mm[0]} />
        <AnimatedDigit digit={mm[1]} />
      </span>
      <span className="text-2xl font-semibold text-warm-300 mx-0.5">m</span>
      <span className="text-5xl font-bold tracking-tighter text-warm-800">
        <AnimatedDigit digit={ss[0]} />
        <AnimatedDigit digit={ss[1]} />
      </span>
      <span className="text-2xl font-semibold text-warm-300">s</span>
    </div>
  )
}
