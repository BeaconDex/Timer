import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerStore } from '@/stores/timerStore'

const QUICK_PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '60 min', seconds: 3600 },
]

/* ── Compact scroll column for H / M / S ── */
function ScrollColumn({
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
  const numbers = Array.from({ length: max + 1 }, (_, i) => i)

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current.querySelector(`[data-val="${value}"]`)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={containerRef}
        className="h-[104px] overflow-y-auto snap-y snap-mandatory scrollbar-hide px-2"
      >
        <div className="h-[36px]" />
        {numbers.map((n) => (
          <div
            key={n}
            data-val={n}
            onClick={() => onChange(n)}
            className={`h-[32px] flex items-center justify-center snap-center cursor-pointer
              text-lg font-semibold rounded-xl transition-all duration-150
              ${n === value
                ? 'text-warm-800 bg-warm-100 scale-105'
                : 'text-warm-300 hover:text-warm-500 hover:bg-warm-50'
              }`}
          >
            {n.toString().padStart(2, '0')}
          </div>
        ))}
        <div className="h-[36px]" />
      </div>
      <span className="text-[11px] font-bold text-warm-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function AddTimerButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [timerName, setTimerName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null) // seconds
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const addTimer = useTimerStore((s) => s.addTimer)

  const customTotal = hours * 3600 + minutes * 60 + seconds
  const hasCustomTime = customTotal > 0
  const hasPreset = selectedPreset !== null

  const resolveName = () => {
    const trimmed = timerName.trim()
    if (trimmed) return trimmed
    if (hasPreset) {
      const preset = QUICK_PRESETS.find((p) => p.seconds === selectedPreset)
      return preset?.label ?? 'Timer'
    }
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0) parts.push(`${seconds}s`)
    return parts.length > 0 ? parts.join(' ') : 'Timer'
  }

  const handleAdd = () => {
    if (hasPreset) {
      addTimer(resolveName(), selectedPreset!)
    } else if (hasCustomTime) {
      addTimer(resolveName(), customTotal)
    } else {
      return
    }
    // Reset
    setTimerName('')
    setSelectedPreset(null)
    setHours(0)
    setMinutes(5)
    setSeconds(0)
    setIsOpen(false)
  }

  const handlePresetClick = (secs: number) => {
    setSelectedPreset((prev) => (prev === secs ? null : secs))
  }

  const handleCustomChange = (
    setter: (v: number) => void,
    val: number
  ) => {
    setter(val)
    setSelectedPreset(null) // switch to custom mode
  }

  const canAdd = hasPreset || hasCustomTime

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 bg-white rounded-3xl shadow-card-hover p-6 w-[340px] z-20"
          >
            {/* Timer name */}
            <div className="mb-5">
              <p className="text-xs font-bold text-warm-400 uppercase tracking-widest mb-2 px-1">
                Timer Name
              </p>
              <input
                type="text"
                value={timerName}
                onChange={(e) => setTimerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAdd) handleAdd()
                }}
                placeholder="e.g. Pasta, Tea, Break…"
                className="w-full px-4 py-2.5 text-sm font-semibold bg-warm-50 rounded-2xl outline-none
                           ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                           transition-all placeholder:text-warm-300"
              />
            </div>

            {/* Quick presets */}
            <p className="text-xs font-bold text-warm-400 uppercase tracking-widest mb-3 px-1">
              Quick Select
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {QUICK_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.seconds
                return (
                  <button
                    key={preset.seconds}
                    onClick={() => handlePresetClick(preset.seconds)}
                    className={`px-2 py-2.5 text-sm font-bold rounded-2xl transition-all
                      ${isSelected
                        ? 'bg-warm-800 text-white shadow-md'
                        : 'bg-warm-50 text-warm-600 hover:bg-warm-100 active:bg-warm-200'
                      }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-warm-150" style={{ backgroundColor: '#E0D6CB' }} />
              <span className="text-[11px] font-bold text-warm-300 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-warm-150" style={{ backgroundColor: '#E0D6CB' }} />
            </div>

            {/* Custom time picker */}
            <p className="text-xs font-bold text-warm-400 uppercase tracking-widest mb-3 px-1">
              Custom Time
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <ScrollColumn value={hours} onChange={(v) => handleCustomChange(setHours, v)} max={23} label="h" />
              <span className="text-2xl font-bold text-warm-300 mt-[-0.75rem]">:</span>
              <ScrollColumn value={minutes} onChange={(v) => handleCustomChange(setMinutes, v)} max={59} label="m" />
              <span className="text-2xl font-bold text-warm-300 mt-[-0.75rem]">:</span>
              <ScrollColumn value={seconds} onChange={(v) => handleCustomChange(setSeconds, v)} max={59} label="s" />
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="w-full py-3 text-base font-bold text-white bg-warm-800
                         hover:bg-warm-700 active:bg-warm-900 rounded-2xl transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Add Timer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB trigger */}
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
