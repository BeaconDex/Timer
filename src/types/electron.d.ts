export interface ElectronAPI {
  showNotification: (title: string, body: string) => Promise<boolean>
  setAlwaysOnTop: (onTop: boolean) => Promise<void>
  minimizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
