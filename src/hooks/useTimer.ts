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

  // Main countdown — Date.now()-based to survive Chromium's background throttling
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

  // Detect completion
  useEffect(() => {
    if (timer && timer.remainingSeconds <= 0 && timer.isRunning) {
      completeTimer(timerId)
    }
  }, [timer?.remainingSeconds, timer?.isRunning, timerId, completeTimer])

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

  const progress = timer.totalSeconds > 0
    ? timer.remainingSeconds / timer.totalSeconds
    : 0

  const hours = Math.floor(timer.remainingSeconds / 3600)
  const minutes = Math.floor((timer.remainingSeconds % 3600) / 60)
  const seconds = timer.remainingSeconds % 60

  return {
    timer,
    progress,
    display: { hours, minutes, seconds },
  }
}
