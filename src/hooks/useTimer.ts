import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer(timerId: string) {
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === timerId))
  const tickTimer = useTimerStore((s) => s.tickTimer)
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

  // Main countdown interval
  useEffect(() => {
    if (timer?.isRunning && !timer.isCompleted) {
      lastTickRef.current = Date.now()

      intervalRef.current = setInterval(() => {
        tickTimer(timerId)
      }, 1000)

      return clearTimer
    } else {
      clearTimer()
    }
  }, [timer?.isRunning, timer?.isCompleted, timerId, tickTimer, clearTimer])

  // Detect completion
  useEffect(() => {
    if (timer && timer.remainingSeconds <= 0 && timer.isRunning) {
      completeTimer(timerId)
    }
  }, [timer?.remainingSeconds, timer?.isRunning, timerId, completeTimer])

  // Visibility change compensation
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && timer?.isRunning) {
        const now = Date.now()
        const elapsed = Math.floor((now - lastTickRef.current) / 1000)
        if (elapsed > 1) {
          tickTimerBySeconds(timerId, elapsed)
        }
        lastTickRef.current = now
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
