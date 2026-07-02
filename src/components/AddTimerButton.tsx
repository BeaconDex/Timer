import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerStore } from '@/stores/timerStore'

type TimerMode = 'countdown' | 'stopwatch'

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

export default function AddTimerButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown')
  const [timerName, setTimerName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [customMinutesOnly, setCustomMinutesOnly] = useState('')
  const [customMode, setCustomMode] = useState<'mixed' | 'minutes'>('mixed')
  const addTimer = useTimerStore((s) => s.addTimer)

  const h = parseInt(hours) || 0
  const m = parseInt(minutes) || 0
  const s = parseInt(seconds) || 0
  const cm = parseInt(customMinutesOnly) || 0

  const customTotal =
    customMode === 'minutes'
      ? cm * 60
      : h * 3600 + m * 60 + s

  const hasCustomTime = customTotal > 0
  const hasPreset = selectedPreset !== null
  const isCountdown = timerMode === 'countdown'

  const resolveName = () => {
    const trimmed = timerName.trim()
    if (trimmed) return trimmed
    if (!isCountdown) return 'Stopwatch'
    if (hasPreset) {
      const preset = QUICK_PRESETS.find((p) => p.seconds === selectedPreset)
      return preset?.label ?? 'Timer'
    }
    if (customMode === 'minutes' && cm > 0) return `${cm} min`
    const parts: string[] = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0) parts.push(`${s}s`)
    return parts.length > 0 ? parts.join(' ') : 'Timer'
  }

  const handleAdd = () => {
    if (isCountdown) {
      if (hasPreset) {
        addTimer(resolveName(), selectedPreset!, 'countdown')
      } else if (hasCustomTime) {
        addTimer(resolveName(), customTotal, 'countdown')
      } else {
        return
      }
    } else {
      // Stopwatch — starts at 0, counts up
      addTimer(resolveName(), 0, 'stopwatch')
    }

    setTimerName('')
    setSelectedPreset(null)
    setHours('')
    setMinutes('')
    setSeconds('')
    setCustomMinutesOnly('')
    setCustomMode('mixed')
    setTimerMode('countdown')
    setIsOpen(false)
  }

  const handlePresetClick = (secs: number) => {
    setSelectedPreset((prev) => (prev === secs ? null : secs))
  }

  const handleCustomInput = (setter: (v: string) => void, val: string) => {
    setter(val)
    setSelectedPreset(null)
  }

  const toggleCustomMode = () => {
    setCustomMode((prev) => (prev === 'mixed' ? 'minutes' : 'mixed'))
    setSelectedPreset(null)
  }

  const canAdd = !isCountdown || hasPreset || hasCustomTime

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 bg-white rounded-3xl shadow-card-hover p-4 w-[520px] z-20"
          >
            {/* ── Mode toggle ─────────────────────────────────── */}
            <div className="relative flex bg-warm-100 rounded-2xl p-1 mb-3">
              {/* Sliding pill indicator */}
              <motion.div
                layout
                className="absolute top-1 h-[calc(100%-8px)] bg-warm-800 rounded-lg shadow-sm"
                style={{
                  left: isCountdown ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 4px)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />

              <button
                onClick={() => setTimerMode('countdown')}
                className={`relative z-10 flex-1 py-1.5 text-sm font-bold rounded-xl transition-colors
                  ${isCountdown ? 'text-white' : 'text-warm-400 hover:text-warm-600'}`}
              >
                Countdown
              </button>
              <button
                onClick={() => setTimerMode('stopwatch')}
                className={`relative z-10 flex-1 py-1.5 text-sm font-bold rounded-xl transition-colors
                  ${!isCountdown ? 'text-white' : 'text-warm-400 hover:text-warm-600'}`}
              >
                Stopwatch
              </button>
            </div>

            {/* ── Timer name ──────────────────────────────────── */}
            <input
              type="text"
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canAdd) handleAdd()
              }}
              placeholder={isCountdown ? 'Timer name…' : 'Stopwatch name…'}
              className="w-full px-5 py-2.5 text-base font-semibold bg-warm-50 rounded-2xl outline-none
                         ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                         transition-all placeholder:text-warm-300 mb-2"
            />

            {/* ── Countdown-specific UI ───────────────────────── */}
            {isCountdown && (
              <>
                {/* Quick presets */}
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {QUICK_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.seconds
                    return (
                      <button
                        key={preset.seconds}
                        onClick={() => handlePresetClick(preset.seconds)}
                        className={`px-3 py-2 text-base font-bold rounded-2xl transition-all
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

                {/* Divider + Custom time */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-px" style={{ backgroundColor: '#E0D6CB' }} />
                  <span className="text-sm font-bold text-warm-300 tracking-wider">Or Custom</span>
                  <button
                    onClick={toggleCustomMode}
                    className="text-sm font-bold text-warm-400 hover:text-warm-600 bg-warm-100
                               hover:bg-warm-200 rounded-xl transition-colors w-[84px] h-7
                               flex items-center justify-center"
                  >
                    {customMode === 'mixed' ? 'Minutes' : 'Mixed'}
                  </button>
                  <div className="flex-1 h-px" style={{ backgroundColor: '#E0D6CB' }} />
                </div>

                {customMode === 'mixed' ? (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => handleCustomInput(setHours, e.target.value)}
                      placeholder="0"
                      min="0"
                      max="99"
                      className="w-[100px] px-4 py-2.5 text-center text-base font-bold bg-warm-50 rounded-2xl
                                 outline-none ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                                 transition-all placeholder:text-warm-300 focus:placeholder:text-transparent"
                    />
                    <span className="text-base font-bold text-warm-400">h</span>
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => handleCustomInput(setMinutes, e.target.value)}
                      placeholder="0"
                      min="0"
                      max="59"
                      className="w-[100px] px-4 py-2.5 text-center text-base font-bold bg-warm-50 rounded-2xl
                                 outline-none ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                                 transition-all placeholder:text-warm-300 focus:placeholder:text-transparent"
                    />
                    <span className="text-base font-bold text-warm-400">m</span>
                    <input
                      type="number"
                      value={seconds}
                      onChange={(e) => handleCustomInput(setSeconds, e.target.value)}
                      placeholder="0"
                      min="0"
                      max="59"
                      className="w-[100px] px-4 py-2.5 text-center text-base font-bold bg-warm-50 rounded-2xl
                                 outline-none ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                                 transition-all placeholder:text-warm-300 focus:placeholder:text-transparent"
                    />
                    <span className="text-base font-bold text-warm-400">s</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <input
                      type="number"
                      value={customMinutesOnly}
                      onChange={(e) => handleCustomInput(setCustomMinutesOnly, e.target.value)}
                      placeholder="0"
                      min="0"
                      max="1440"
                      className="w-[100px] px-4 py-2.5 text-center text-base font-bold bg-warm-50 rounded-2xl
                                 outline-none ring-2 ring-transparent focus:ring-warm-300 focus:bg-white
                                 transition-all placeholder:text-warm-300 focus:placeholder:text-transparent"
                    />
                    <span className="text-base font-bold text-warm-400">min</span>
                  </div>
                )}
              </>
            )}

            {/* ── Add button ──────────────────────────────────── */}
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="w-full py-3 text-lg font-bold text-white bg-warm-800
                         hover:bg-warm-700 active:bg-warm-900 rounded-2xl transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isCountdown ? 'Add Timer' : 'Start Stopwatch'}
            </button>
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
