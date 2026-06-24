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
  addTimer: (label: string, totalSeconds: number) => void
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

      addTimer: (label, totalSeconds) =>
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
          timers: state.timers.map((t) =>
            t.id === id
              ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false }
              : t
          ),
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
          timers: state.timers.map((t) =>
            t.id === id && t.isRunning && t.remainingSeconds > 0
              ? { ...t, remainingSeconds: t.remainingSeconds - 1 }
              : t
          ),
        })),

      tickTimerBySeconds: (id, seconds) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id && t.isRunning
              ? { ...t, remainingSeconds: Math.max(0, t.remainingSeconds - seconds) }
              : t
          ),
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
