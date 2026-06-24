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
})
