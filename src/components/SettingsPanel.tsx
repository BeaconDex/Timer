import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/stores/settingsStore'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

// ── M3 Switch ──────────────────────────────────────────────
// Specs from Material Design 3 token file (v0.192):
//   track: 52×32px  ·  handle: 16→24px  ·  pressed: 28px
//   outline: 2px  ·  icon: 16px  ·  state-layer: 40px
//   Colors adapted to project warm palette:
//     primary         → warm-600 #84715E  (selected track)
//     surface-variant → warm-200 #E8E0D5  (unselected track)
//     outline         → warm-400 #B8A99A  (unselected handle + track border)
//     on-primary      → #FFFFFF           (selected handle)

const SWITCH = {
  track:  { w: 52, h: 32 },
  handle: { off: 16, on: 24, pressed: 28 },
  icon:   16,
  outline: 2,
  // handle position (x): inset from track edge
  inset:  { off: 4, on: 4 }, // symmetrical inset
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  const hOff = SWITCH.handle.off
  const hOn  = SWITCH.handle.on
  const tW   = SWITCH.track.w
  const tH   = SWITCH.track.h

  // handle top = vertically centered inside track
  const topOff = (tH - hOff) / 2 // 8
  const topOn  = (tH - hOn)  / 2 // 4

  // x inset so handle never touches track edge
  const xOff = SWITCH.inset.off                    // 4
  const xOn  = tW - hOn - SWITCH.inset.on           // 52-24-4 = 24

  return (
    <motion.button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 rounded-full outline-none
                 focus-visible:ring-2 focus-visible:ring-warm-400 focus-visible:ring-offset-2
                 focus-visible:ring-offset-white
                 disabled:opacity-40 disabled:cursor-not-allowed
                 group"
      style={{ width: tW, height: tH }}
    >
      {/* ── Track ─────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          backgroundColor: checked ? '#84715E' : '#E8E0D5',
          boxShadow: checked
            ? 'inset 0 1px 3px rgba(0,0,0,0.18)'
            : `inset 0 0 0 ${SWITCH.outline}px rgba(156,139,122,0.35), inset 0 1px 2px rgba(0,0,0,0.04)`,
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* ── Inner glow when ON ────────────────────── */}
      <motion.div
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        className="absolute inset-[1px] rounded-full pointer-events-none"
        style={{ boxShadow: 'inset 0 0 3px rgba(255,255,255,0.15)' }}
      />

      {/* ── State layer (hover) ───────────────────── */}
      <motion.div
        className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        animate={{
          width: SWITCH.handle.pressed,
          height: SWITCH.handle.pressed,
          left: checked
            ? xOn + (hOn - SWITCH.handle.pressed) / 2
            : xOff + (hOff - SWITCH.handle.pressed) / 2,
          top: (tH - SWITCH.handle.pressed) / 2,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 25, mass: 1.1 }}
        style={{
          backgroundColor: checked
            ? 'rgba(132,113,94, 0.08)'
            : 'rgba(61,53,46, 0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Handle ────────────────────────────────── */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{ left: 0 }}
        animate={{
          x:              checked ? xOn  : xOff,
          width:          checked ? hOn  : hOff,
          height:         checked ? hOn  : hOff,
          top:            checked ? topOn : topOff,
          backgroundColor: checked ? '#FFFFFF' : '#B8A99A',
          boxShadow: checked
            ? '0 2px 6px rgba(0,0,0,0.12), 0 0.5px 1.5px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)'
            : '0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 25, mass: 1.1 }}
      >
        {/* ── Checkmark icon (selected only) ──── */}
        <motion.svg
          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
          transition={{ duration: 0.12 }}
          width={SWITCH.icon}
          height={SWITCH.icon}
          viewBox="0 0 24 24"
          className="pointer-events-none"
        >
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill="#84715E"
          />
        </motion.svg>
      </motion.div>
    </motion.button>
  )
}

const DURATION_PRESETS = [
  { label: 'Until dismissed', value: 0 },
  { label: '5 sec', value: 5 },
  { label: '10 sec', value: 10 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
]

const SPRING = { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.8 }

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settings = useSettingsStore()
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled)
  const setAlarmDuration = useSettingsStore((s) => s.setAlarmDuration)
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-end justify-center pb-[100px] overflow-hidden"
          style={{ background: 'rgba(61, 53, 46, 0.10)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[660px] bg-white rounded-[2rem] px-9 pt-3.5 pb-8
                       shadow-card-hover overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-7">
              <h2 className="relative top-2.5 text-2xl font-extrabold text-warm-800 tracking-tight">Settings</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING}
                className="w-10 h-10 rounded-full flex items-center justify-center
                           hover:bg-warm-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" className="text-warm-400">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Sound toggle */}
            <div className="bg-warm-50 rounded-3xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-bold text-warm-800">Sound Alarm</label>
                  <p className="text-[13px] font-medium text-warm-400 mt-0.5">
                    Play a chime when a timer finishes
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.soundEnabled}
                  onChange={() => setSoundEnabled(!settings.soundEnabled)}
                />
              </div>

              {/* Alarm duration */}
              {settings.soundEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t-2 border-warm-100 pb-1">
                    <label className="text-xs font-bold text-warm-500 tracking-wide mb-3 block">
                      Alarm duration
                    </label>
                    <div className="flex flex-wrap gap-2 pl-2.5">
                      {DURATION_PRESETS.map((preset) => (
                        <motion.button
                          key={preset.value}
                          onClick={() => setAlarmDuration(preset.value)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={SPRING}
                          className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors
                            ${settings.alarmDuration === preset.value
                              ? 'bg-warm-800 text-white'
                              : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                            }`}
                        >
                          {preset.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Notification toggle */}
            <div className="bg-warm-50 rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-bold text-warm-800">Desktop Notifications</label>
                  <p className="text-[13px] font-medium text-warm-400 mt-0.5">
                    Show a Windows notification when a timer finishes
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!settings.notificationsEnabled)}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
