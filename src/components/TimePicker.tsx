import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimePickerProps {
  initialHours: number
  initialMinutes: number
  initialSeconds: number
  onSave: (hours: number, minutes: number, seconds: number) => void
  onCancel: () => void
}

function ScrollPicker({
  value,
  onChange,
  max,
  label,
}: {
  value: number
  onChange: (v: number) => void
  max: number
  label: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current.querySelector(`[data-val="${value}"]`)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [])

  const numbers = Array.from({ length: max + 1 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        ref={containerRef}
        className="h-40 overflow-y-auto snap-y snap-mandatory scrollbar-hide px-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="h-14" />
        {numbers.map((n) => (
          <div
            key={n}
            data-val={n}
            onClick={() => onChange(n)}
            className={`
              h-11 flex items-center justify-center snap-center cursor-pointer
              text-2xl font-semibold rounded-2xl transition-all duration-150
              ${n === value
                ? 'text-warm-800 bg-warm-100 scale-110'
                : 'text-warm-300 hover:text-warm-500 hover:bg-warm-50'
              }
            `}
          >
            {n.toString().padStart(2, '0')}
          </div>
        ))}
        <div className="h-14" />
      </div>
      <span className="text-[11px] font-bold text-warm-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function TimePicker({
  initialHours,
  initialMinutes,
  initialSeconds,
  onSave,
  onCancel,
}: TimePickerProps) {
  const [hours, setHours] = useState(initialHours)
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-4xl z-10 flex flex-col items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="flex gap-5 mb-8">
        <ScrollPicker value={hours} onChange={setHours} max={23} label="hours" />
        <span className="text-4xl font-bold text-warm-300 self-center mt-[-1.5rem]">:</span>
        <ScrollPicker value={minutes} onChange={setMinutes} max={59} label="min" />
        <span className="text-4xl font-bold text-warm-300 self-center mt-[-1.5rem]">:</span>
        <ScrollPicker value={seconds} onChange={setSeconds} max={59} label="sec" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave(hours, minutes, seconds)}
          disabled={totalSeconds <= 0}
          className="px-10 py-3 bg-warm-800 text-white rounded-full text-base font-bold
                     hover:bg-warm-700 active:bg-warm-900 transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Set Time
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-3 text-warm-500 rounded-full text-base font-bold
                     hover:bg-warm-100 active:bg-warm-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )
}
