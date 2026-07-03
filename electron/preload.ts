import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),
  setAlwaysOnTop: (onTop: boolean) =>
    ipcRenderer.invoke('set-always-on-top', onTop),
  minimizeWindow: () =>
    ipcRenderer.invoke('minimize-window'),
  closeWindow: () =>
    ipcRenderer.invoke('close-window'),
  onTimerTick: (callback: (timestamp: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, timestamp: number) =>
      callback(timestamp)
    ipcRenderer.on('timer-tick', handler)
    return () => { ipcRenderer.removeListener('timer-tick', handler) }
  },
})
