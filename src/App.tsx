import { useState, useCallback, useRef, useEffect } from 'react'
import { useTimerStore } from './stores/timerStore'
import { useSettingsStore } from './stores/settingsStore'
import { useSound } from './hooks/useSound'
import TimerList from './components/TimerList'
import AddTimerButton from './components/AddTimerButton'
import AlertDialog from './components/AlertDialog'
import SettingsPanel from './components/SettingsPanel'
import TitleBar from './components/TitleBar'

export default function App() {
  const [alertTimerId, setAlertTimerId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { startAlarm, stopAlarm } = useSound()
  const alertedRef = useRef<Set<string>>(new Set())
  const timers = useTimerStore((s) => s.timers)
  const settings = useSettingsStore()

  // Watch for completed timers
  useEffect(() => {
    for (const timer of timers) {
      if (timer.isCompleted && !alertedRef.current.has(timer.id)) {
        alertedRef.current.add(timer.id)
        setAlertTimerId(timer.id)

        // Sound alarm (if enabled)
        if (settings.soundEnabled) {
          startAlarm(settings.alarmDuration > 0 ? settings.alarmDuration : undefined)
        }

        // Windows notification (if enabled)
        if (settings.notificationsEnabled && window.electronAPI) {
          window.electronAPI.showNotification(
            'Timer Finished',
            `"${timer.label}" has completed!`
          )
        }
      }
    }

    // Clean up refs for removed timers
    for (const id of alertedRef.current) {
      if (!timers.find((t) => t.id === id)) {
        alertedRef.current.delete(id)
      }
    }
  }, [timers, startAlarm, settings.soundEnabled, settings.notificationsEnabled, settings.alarmDuration])

  const handleDismissAlert = useCallback(() => {
    stopAlarm()
    setAlertTimerId(null)
  }, [stopAlarm])

  const alertTimer = alertTimerId
    ? timers.find((t) => t.id === alertTimerId)
    : null

  return (
    <div className="h-full flex flex-col bg-[#FAFAF9] overflow-hidden">
      <TitleBar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-shrink-0 px-8 pt-3 pb-5 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-warm-800 tracking-tighter">Timers</h1>
            <p className="text-sm font-semibold text-warm-400 mt-1">
              {timers.filter((t) => t.isRunning).length} running
              {' · '}
              {timers.length} total
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-28">
          <TimerList onTimerComplete={() => {}} />
        </div>

        {/* Settings button — bottom left */}
        <div className="absolute bottom-8 left-8">
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-2xl bg-white shadow-card hover:shadow-card-hover
                       flex items-center justify-center transition-shadow
                       text-warm-400 hover:text-warm-600"
            title="Settings"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Add timer FAB — bottom right */}
        <div className="absolute bottom-8 right-8">
          <AddTimerButton />
        </div>

        {/* Settings panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Alert dialog */}
        {alertTimer && (
          <AlertDialog
            isOpen={!!alertTimer}
            timerLabel={alertTimer.label}
            onDismiss={handleDismissAlert}
          />
        )}
      </div>
    </div>
  )
}
