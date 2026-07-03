export interface ElectronAPI {
  showNotification: (title: string, body: string) => Promise<boolean>
  setAlwaysOnTop: (onTop: boolean) => Promise<void>
  minimizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  /** Subscribe to main-process heartbeat ticks. Returns unsubscribe function. */
  onTimerTick: (callback: (timestamp: number) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
