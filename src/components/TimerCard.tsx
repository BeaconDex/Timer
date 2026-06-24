import { motion } from 'framer-motion'
import { useTimer } from '@/hooks/useTimer'
import { useTimerStore, TimerData } from '@/stores/timerStore'
import TimeDisplay from './TimeDisplay'
import ProgressRing from './ProgressRing'
import TimerControls from './TimerControls'

interface TimerCardProps {
  timer: TimerData
}

export default function TimerCard({ timer: timerData }: TimerCardProps) {
  const timerHook = useTimer(timerData.id)

  const alertTimerId = useTimerStore((s) => s.alertTimerId)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const removeTimer = useTimerStore((s) => s.removeTimer)

  if (!timerHook) return null

  const { timer, progress, display } = timerHook
  const isCompleted = timer.id === alertTimerId

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-4xl p-7 shadow-card hover:shadow-card-hover
                 transition-shadow duration-300"
      style={{
        borderLeft: `6px solid ${timer.color}`,
      }}
    >
      <div className="flex items-start justify-between gap-5">
        {/* Left: Progress ring + Timer info */}
        <div className="flex items-center gap-5 min-w-0">
          <ProgressRing
            progress={isCompleted ? 0 : progress}
            color={timer.color}
            size={88}
            strokeWidth={7}
          />

          <div className="flex flex-col min-w-0 gap-1">
            {/* Label */}
            <span className="text-base font-semibold text-warm-500 text-left truncate">
              {timer.label}
            </span>

            {/* Time display */}
            <TimeDisplay
              hours={display.hours}
              minutes={display.minutes}
              seconds={display.seconds}
              isCompleted={isCompleted}
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-shrink-0 pt-1">
          <TimerControls
            isRunning={timer.isRunning}
            isCompleted={isCompleted}
            onStart={() => startTimer(timer.id)}
            onPause={() => pauseTimer(timer.id)}
            onReset={() => resetTimer(timer.id)}
            onRemove={() => removeTimer(timer.id)}
          />
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="mt-5 h-2 rounded-full bg-warm-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: timer.color }}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}
