import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimerData {
  id: string
  label: string
  totalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  createdAt: number
  color: string
  mode: 'countdown' | 'stopwatch'
  elapsedSeconds: number
}

const COLORS = ['#E8C5C5', '#C5D3E8', '#C5E8D3', '#E8DDC5', '#D3C5E8']
let colorIndex = 0

function nextColor(): string {
  const c = COLORS[colorIndex % COLORS.length]
  colorIndex++
  return c
}

interface TimerStore {
  timers: TimerData[]
  alertTimerId: string | null
  addTimer: (label: string, totalSeconds: number, mode?: 'countdown' | 'stopwatch') => void
  removeTimer: (id: string) => void
  updateTimer: (id: string, updates: Partial<TimerData>) => void
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  resetTimer: (id: string) => void
  completeTimer: (id: string) => void
  dismissAlert: () => void
  tickTimer: (id: string) => void
  tickTimerBySeconds: (id: string, seconds: number) => void
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set) => ({
      timers: [],
      alertTimerId: null,

      addTimer: (label, totalSeconds, mode = 'countdown') =>
        set((state) => ({
          timers: [
            ...state.timers,
            {
              id: crypto.randomUUID(),
              label: label || 'Timer',
              totalSeconds,
              remainingSeconds: totalSeconds,
              isRunning: false,
              createdAt: Date.now(),
              color: nextColor(),
              mode,
              elapsedSeconds: 0,
            },
          ],
        })),

      removeTimer: (id) =>
        set((state) => ({
          timers: state.timers.filter((t) => t.id !== id),
          alertTimerId: state.alertTimerId === id ? null : state.alertTimerId,
        })),

      updateTimer: (id, updates) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      startTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, isRunning: true } : t
          ),
        })),

      pauseTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, isRunning: false } : t
          ),
        })),

      resetTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.id !== id) return t
            return t.mode === 'stopwatch'
              ? { ...t, elapsedSeconds: 0, isRunning: false }
              : { ...t, remainingSeconds: t.totalSeconds, isRunning: false }
          }),
          alertTimerId: state.alertTimerId === id ? null : state.alertTimerId,
        })),

      completeTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id
              ? { ...t, isRunning: false, remainingSeconds: 0 }
              : t
          ),
          // Emit alert event — non-persisted, survives only this session
          alertTimerId: id,
        })),

      dismissAlert: () =>
        set((state) => ({
          alertTimerId: null,
          timers: state.alertTimerId
            ? state.timers.map((t) =>
                t.id === state.alertTimerId
                  ? { ...t, remainingSeconds: t.totalSeconds }
                  : t
              )
            : state.timers,
        })),

      tickTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.id !== id || !t.isRunning) return t
            if (t.mode === 'stopwatch') {
              return { ...t, elapsedSeconds: t.elapsedSeconds + 1 }
            }
            return t.remainingSeconds > 0
              ? { ...t, remainingSeconds: t.remainingSeconds - 1 }
              : t
          }),
        })),

      tickTimerBySeconds: (id, seconds) =>
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.id !== id || !t.isRunning) return t
            if (t.mode === 'stopwatch') {
              // Count up — never completes
              return { ...t, elapsedSeconds: t.elapsedSeconds + seconds }
            }
            // Count down
            return { ...t, remainingSeconds: Math.max(0, t.remainingSeconds - seconds) }
          }),
        })),
    }),
    {
      name: 'timer-app-storage',
      partialize: (state) => ({
        timers: state.timers.map((t) => ({
          ...t,
          isRunning: false,
        })),
        // alertTimerId is NOT persisted — time-up is a message, not a status
      }),
    }
  )
)
