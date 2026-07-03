import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'

export function useTimer(timerId: string) {
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === timerId))
  const tickTimerBySeconds = useTimerStore((s) => s.tickTimerBySeconds)
  const completeTimer = useTimerStore((s) => s.completeTimer)
  const lastTickRef = useRef<number>(Date.now())

  // ── Tick source ──────────────────────────────────────────
  // Prefers main-process heartbeat (IPC 'timer-tick') which is
  // immune to Chromium's background throttling. Falls back to
  // renderer-side setInterval when running in a plain browser.
  useEffect(() => {
    if (!timer?.isRunning) return

    lastTickRef.current = Date.now()

    const tick = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - lastTickRef.current) / 1000)
      if (elapsed >= 1) {
        tickTimerBySeconds(timerId, elapsed)
        lastTickRef.current += elapsed * 1000
      }
    }

    // Main-process heartbeat — runs even when window is hidden
    if (window.electronAPI?.onTimerTick) {
      return window.electronAPI.onTimerTick(() => tick())
    }

    // Fallback: renderer interval (subject to background throttling)
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [timer?.isRunning, timerId, tickTimerBySeconds])

  // ── Completion detection (countdown only — stopwatch never completes) ─
  useEffect(() => {
    if (timer && timer.mode === 'countdown' && timer.remainingSeconds <= 0 && timer.isRunning) {
      completeTimer(timerId)
    }
  }, [timer?.remainingSeconds, timer?.isRunning, timer?.mode, timerId, completeTimer])

  // ── Visibility catch-up ──────────────────────────────────
  // Secondary safety net: when the window regains focus after
  // a long absence, immediately process any ticks that were
  // queued up by the main-process heartbeat while hidden.
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
