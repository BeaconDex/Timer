import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/stores/settingsStore'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-14 h-8 rounded-full transition-colors duration-200 outline-none flex-shrink-0
        ${checked ? 'bg-warm-800' : 'bg-warm-300'}`}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 28 }}
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
      />
    </button>
  )
}

const DURATION_PRESETS = [
  { label: 'Until dismissed', value: 0 },
  { label: '5 sec', value: 5 },
  { label: '10 sec', value: 10 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
]

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
          className="absolute inset-0 z-40 flex items-end justify-center overflow-hidden"
          style={{ background: 'rgba(61, 53, 46, 0.12)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-[2rem] px-8 pt-8 pb-10
                       shadow-card-hover overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-warm-800 tracking-tight">Settings</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center
                           hover:bg-warm-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" className="text-warm-400">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sound toggle */}
            <div className="bg-warm-50 rounded-3xl p-5 mb-4">
              <div className="flex items-center justify-between mb-1">
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
                  className="mt-4 pt-4 border-t-2 border-warm-100"
                >
                  <label className="text-xs font-bold text-warm-500 uppercase tracking-widest mb-3 block">
                    Alarm Duration
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setAlarmDuration(preset.value)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all
                          ${settings.alarmDuration === preset.value
                            ? 'bg-warm-800 text-white shadow-md'
                            : 'bg-white text-warm-500 hover:bg-warm-100 border-2 border-warm-100'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
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
