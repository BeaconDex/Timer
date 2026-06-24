import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsData {
  soundEnabled: boolean
  alarmDuration: number   // seconds, 0 = until dismissed
  notificationsEnabled: boolean
}

interface SettingsStore extends SettingsData {
  setSoundEnabled: (enabled: boolean) => void
  setAlarmDuration: (duration: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      alarmDuration: 0,          // 0 = ring until manually dismissed
      notificationsEnabled: true,

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setAlarmDuration: (duration) => set({ alarmDuration: duration }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'timer-settings-storage',
    }
  )
)
