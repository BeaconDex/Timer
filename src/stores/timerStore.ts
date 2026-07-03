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

function nextColor(existingCount: number): string {
  return COLORS[existingCount % COLORS.length]
}

interface TimerStore {
  timers: TimerData[]
  /** FIFO queue of timer IDs awaiting user dismissal. */
  alertQueue: string[]
  addTimer: (label: string, totalSeconds: number, mode?: 'countdown' | 'stopwatch') => void
  removeTimer: (id: string) => void
  updateTimer: (id: string, updates: Partial<TimerData>) => void
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  resetTimer: (id: string) => void
  completeTimer: (id: string) => void
  /** Dismiss a specific alert and reset that timer's remaining time. */
  dismissAlert: (id: string) => void
  tickTimer: (id: string) => void
  tickTimerBySeconds: (id: string, seconds: number) => void
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set) => ({
      timers: [],
      alertQueue: [],

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
              color: nextColor(state.timers.length),
              mode,
              elapsedSeconds: 0,
            },
          ],
        })),

      removeTimer: (id) =>
        set((state) => ({
          timers: state.timers.filter((t) => t.id !== id),
          alertQueue: state.alertQueue.filter((aid) => aid !== id),
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
          alertQueue: state.alertQueue.filter((aid) => aid !== id),
        })),

      completeTimer: (id) =>
        set((state) => {
          // Stopwatch never completes — ignore
          const timer = state.timers.find((t) => t.id === id)
          if (!timer || timer.mode === 'stopwatch') return state
          // Avoid duplicate entries in the alert queue
          if (state.alertQueue.includes(id)) return state
          return {
            timers: state.timers.map((t) =>
              t.id === id
                ? { ...t, isRunning: false, remainingSeconds: 0 }
                : t
            ),
            alertQueue: [...state.alertQueue, id],
          }
        }),

      dismissAlert: (id) =>
        set((state) => ({
          alertQueue: state.alertQueue.filter((aid) => aid !== id),
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, remainingSeconds: t.totalSeconds } : t
          ),
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
              return { ...t, elapsedSeconds: t.elapsedSeconds + seconds }
            }
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
        // alertQueue is NOT persisted — alerts are a message, not a status
      }),
    }
  )
)
