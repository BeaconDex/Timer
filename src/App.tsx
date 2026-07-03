import { useState, useEffect, useCallback } from 'react'
import { useTimerStore } from './stores/timerStore'
import { useSettingsStore } from './stores/settingsStore'
import { useSound } from './hooks/useSound'
import TimerList from './components/TimerList'
import AddTimerButton from './components/AddTimerButton'
import AlertDialog from './components/AlertDialog'
import SettingsPanel from './components/SettingsPanel'
import TitleBar from './components/TitleBar'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const { startAlarm, stopAlarm } = useSound()
  const alertQueue = useTimerStore((s) => s.alertQueue)
  const dismissAlertAction = useTimerStore((s) => s.dismissAlert)
  const timers = useTimerStore((s) => s.timers)
  const settings = useSettingsStore()

  // Track which alert IDs we've already fired sound/notification for,
  // so we don't repeat on re-renders or StrictMode double-invoke.
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set())

  // Current alert is the first in the queue
  const currentAlertId: string | null = alertQueue.length > 0 ? alertQueue[0] : null

  // Fire sound + notification when a new alert enters the queue
  useEffect(() => {
    if (!currentAlertId) return

    // Skip if we already fired for this ID (handles StrictMode double-fire)
    if (notifiedIds.has(currentAlertId)) return

    setNotifiedIds((prev) => new Set(prev).add(currentAlertId))

    const timer = timers.find((t) => t.id === currentAlertId)

    if (settings.soundEnabled) {
      startAlarm(settings.alarmDuration > 0 ? settings.alarmDuration : undefined)
    }

    if (settings.notificationsEnabled && window.electronAPI) {
      window.electronAPI.showNotification(
        'Timer Finished',
        timer ? `"${timer.label}" has completed!` : 'A timer has completed!'
      ).catch(() => {})
    }

    // Cleanup: stop alarm if this alert is removed from the queue
    return () => {
      stopAlarm()
    }
  }, [currentAlertId]) // eslint-disable-line react-hooks/exhaustive-deps

  // When the queue empties, reset notifiedIds so future alerts fire again
  useEffect(() => {
    if (alertQueue.length === 0 && notifiedIds.size > 0) {
      setNotifiedIds(new Set())
    }
  }, [alertQueue.length, notifiedIds.size])

  const handleDismissAlert = useCallback((id: string) => {
    stopAlarm()
    dismissAlertAction(id)
  }, [stopAlarm, dismissAlertAction])

  const currentTimer = currentAlertId
    ? timers.find((t) => t.id === currentAlertId)
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
          <TimerList />
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
            <svg width="33" height="33" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8L15 8M15 8C15 9.65686 16.3431 11 18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8ZM9 16L21 16M9 16C9 17.6569 7.65685 19 6 19C4.34315 19 3 17.6569 3 16C3 14.3431 4.34315 13 6 13C7.65685 13 9 14.3431 9 16Z" />
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

        {/* Alert dialog — shows for the current (first) alert in the queue */}
        {currentTimer && (
          <AlertDialog
            isOpen={!!currentTimer}
            timerLabel={currentTimer.label}
            timerId={currentTimer.id}
            onDismiss={handleDismissAlert}
          />
        )}
      </div>
    </div>
  )
}
