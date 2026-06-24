import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimer } from '@/hooks/useTimer'
import { useTimerStore, TimerData } from '@/stores/timerStore'
import TimeDisplay from './TimeDisplay'
import TimePicker from './TimePicker'
import ProgressRing from './ProgressRing'
import TimerControls from './TimerControls'

interface TimerCardProps {
  timer: TimerData
  onComplete: (id: string) => void
}

export default function TimerCard({ timer: timerData, onComplete }: TimerCardProps) {
  const timerHook = useTimer(timerData.id)
  const [showPicker, setShowPicker] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(timerData.label)

  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const removeTimer = useTimerStore((s) => s.removeTimer)
  const updateTimer = useTimerStore((s) => s.updateTimer)

  const handleComplete = useCallback(() => {
    onComplete(timerData.id)
  }, [timerData.id, onComplete])

  const handleSaveTime = useCallback(
    (h: number, m: number, s: number) => {
      const total = h * 3600 + m * 60 + s
      updateTimer(timerData.id, {
        totalSeconds: total,
        remainingSeconds: total,
        isCompleted: false,
      })
      setShowPicker(false)
    },
    [timerData.id, updateTimer]
  )

  const handleSaveLabel = useCallback(() => {
    const trimmed = editLabel.trim()
    if (trimmed) {
      updateTimer(timerData.id, { label: trimmed })
    }
    setIsEditing(false)
  }, [editLabel, timerData.id, updateTimer])

  if (!timerHook) return null

  const { timer, progress, display } = timerHook

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
      {/* TimePicker overlay */}
      <AnimatePresence>
        {showPicker && (
          <TimePicker
            initialHours={Math.floor(timer.totalSeconds / 3600)}
            initialMinutes={Math.floor((timer.totalSeconds % 3600) / 60)}
            initialSeconds={timer.totalSeconds % 60}
            onSave={handleSaveTime}
            onCancel={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-5">
        {/* Left: Progress ring + Timer info */}
        <div className="flex items-center gap-5 min-w-0">
          <ProgressRing
            progress={timer.isCompleted ? 0 : progress}
            color={timer.color}
            size={88}
            strokeWidth={7}
          />

          <div className="flex flex-col min-w-0 gap-1">
            {/* Label */}
            {isEditing ? (
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleSaveLabel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel()
                  if (e.key === 'Escape') {
                    setEditLabel(timer.label)
                    setIsEditing(false)
                  }
                }}
                className="text-base font-semibold text-warm-700 bg-warm-50 rounded-2xl px-3 py-1.5
                           outline-none ring-2 ring-warm-200 focus:ring-warm-400 w-full"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-base font-semibold text-warm-500 hover:text-warm-700
                           transition-colors text-left truncate cursor-text"
              >
                {timer.label}
              </button>
            )}

            {/* Time display */}
            <TimeDisplay
              hours={display.hours}
              minutes={display.minutes}
              seconds={display.seconds}
              isCompleted={timer.isCompleted}
              onClick={() => setShowPicker(true)}
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-shrink-0 pt-1">
          <TimerControls
            isRunning={timer.isRunning}
            isCompleted={timer.isCompleted}
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
