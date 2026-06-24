import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 640,
    minWidth: 520,
    minHeight: 400,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#FAFAF9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Close → minimize to tray (unless actually quitting)
  mainWindow.on('close', (event) => {
    if (!isQuitting && tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

function createTrayIcon(): Electron.NativeImage {
  // Build a 16x16 clock icon from raw RGBA pixel data
  const size = 16
  const buf = Buffer.alloc(size * size * 4, 0)
  const cx = 7.5
  const cy = 7.5
  const r = 6.5           // circle radius
  const thick = 0.9       // ring thickness

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      const idx = (y * size + x) * 4

      // Circle ring
      if (d >= r - thick && d <= r + thick) {
        buf[idx] = 0x78; buf[idx + 1] = 0x71; buf[idx + 2] = 0x6C; buf[idx + 3] = 0xFF
        continue
      }

      // Hour hand (pointing up and slightly right, ~10 o'clock)
      // Check if pixel lies on a line from center going up-right
      const hx = dx, hy = dy
      const hLen = Math.sqrt(hx * hx + hy * hy)
      if (hLen > 0 && hLen <= 4.5) {
        // Normalized direction: hands at ~10 o'clock (hour) and ~2 o'clock (minute)
        const hnx = hx / hLen, hny = hy / hLen
        // Hour hand dot product with (-0.5, -0.866) ≈ 10:00 position
        const hourDot = Math.abs(hnx * (-0.5) + hny * (-0.866))
        if (hourDot > 0.92 && hLen > 0.5) {
          buf[idx] = 0x78; buf[idx + 1] = 0x71; buf[idx + 2] = 0x6C; buf[idx + 3] = 0xFF
          continue
        }
        // Minute hand dot product with (0.866, -0.5) ≈ 2:00 position
        const minDot = Math.abs(hnx * 0.866 + hny * (-0.5))
        if (minDot > 0.92 && hLen > 0.5) {
          buf[idx] = 0x78; buf[idx + 1] = 0x71; buf[idx + 2] = 0x6C; buf[idx + 3] = 0xFF
          continue
        }
      }
    }
  }

  return nativeImage.createFromBuffer(buf, { width: size, height: size })
}

function createTray() {
  const icon = createTrayIcon()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Timer',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        if (tray) {
          tray.destroy()
          tray = null
        }
        app.quit()
      },
    },
  ])

  tray.setToolTip('Timer App')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// IPC handlers
ipcMain.handle('show-notification', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      urgency: 'critical',
      timeoutType: 'never',
    })
    notification.on('click', () => {
      mainWindow?.show()
      mainWindow?.focus()
    })
    notification.show()
    return true
  }
  return false
})

ipcMain.handle('set-always-on-top', (_event, onTop: boolean) => {
  mainWindow?.setAlwaysOnTop(onTop)
})

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize()
})

ipcMain.handle('close-window', () => {
  // Red close button → fully quit the app
  isQuitting = true
  if (tray) {
    tray.destroy()
    tray = null
  }
  mainWindow?.close()
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
  if (tray) {
    tray.destroy()
    tray = null
  }
})
