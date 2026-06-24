import { AnimatePresence } from 'framer-motion'
import { useTimerStore } from '@/stores/timerStore'
import TimerCard from './TimerCard'

interface TimerListProps {
  onTimerComplete: (id: string) => void
}

export default function TimerList({ onTimerComplete }: TimerListProps) {
  const timers = useTimerStore((s) => s.timers)

  if (timers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-24 h-24 rounded-full bg-warm-100 flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="text-warm-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p className="text-warm-500 text-base font-bold mb-1">No timers yet</p>
        <p className="text-warm-400 text-sm font-medium">
          Click the + button to create your first timer
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {timers.map((timer) => (
          <TimerCard
            key={timer.id}
            timer={timer}
            onComplete={onTimerComplete}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
