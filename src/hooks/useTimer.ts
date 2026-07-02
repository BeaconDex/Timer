import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer(timerId: string) {
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === timerId))
  const tickTimerBySeconds = useTimerStore((s) => s.tickTimerBySeconds)
  const completeTimer = useTimerStore((s) => s.completeTimer)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Main countdown / count-up — Date.now()-based to survive Chromium's background throttling
  useEffect(() => {
    if (timer?.isRunning) {
      lastTickRef.current = Date.now()

      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - lastTickRef.current) / 1000)
        if (elapsed >= 1) {
          tickTimerBySeconds(timerId, elapsed)
          lastTickRef.current += elapsed * 1000
        }
      }, 250) // poll every 250ms; actual ticks are batched by elapsed seconds

      return clearTimer
    } else {
      clearTimer()
    }
  }, [timer?.isRunning, timerId, tickTimerBySeconds, clearTimer])

  // Detect completion (countdown only — stopwatch never completes)
  useEffect(() => {
    if (timer && timer.mode === 'countdown' && timer.remainingSeconds <= 0 && timer.isRunning) {
      completeTimer(timerId)
    }
  }, [timer?.remainingSeconds, timer?.isRunning, timer?.mode, timerId, completeTimer])

  // Visibility change compensation — catch up on wake
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && timer?.isRunning) {
        const now = Date.now()
        const elapsed = Math.floor((now - lastTickRef.current) / 1000)
        if (elapsed > 1) {
          tickTimerBySeconds(timerId, elapsed)
          lastTickRef.current += elapsed * 1000
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [timer?.isRunning, timerId, tickTimerBySeconds])

  if (!timer) return null

  // Display seconds: countdown shows remaining, stopwatch shows elapsed
  const displaySeconds = timer.mode === 'stopwatch'
    ? timer.elapsedSeconds
    : timer.remainingSeconds

  // Progress: countdown = remaining/total, stopwatch = 60-second cycle
  const progress = timer.mode === 'stopwatch'
    ? (timer.elapsedSeconds % 60) / 60
    : timer.totalSeconds > 0
      ? timer.remainingSeconds / timer.totalSeconds
      : 0

  const hours = Math.floor(displaySeconds / 3600)
  const minutes = Math.floor((displaySeconds % 3600) / 60)
  const seconds = displaySeconds % 60

  return {
    timer,
    progress,
    display: { hours, minutes, seconds },
  }
}
