import { useState } from 'react'

export default function TitleBar() {
  const [isPinned, setIsPinned] = useState(false)

  const handleClose = () => {
    window.electronAPI?.closeWindow()
  }

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow()
  }

  const handlePin = () => {
    const newState = !isPinned
    setIsPinned(newState)
    window.electronAPI?.setAlwaysOnTop(newState)
  }

  return (
    <div className="drag-region h-11 flex items-center justify-between px-4 select-none flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="no-drag w-3.5 h-3.5 rounded-full bg-red-300/80 hover:bg-red-400 active:bg-red-500 transition-colors cursor-pointer outline-none border-none p-0"
            onClick={handleClose}
            title="Close"
          />
          <button
            className="no-drag w-3.5 h-3.5 rounded-full bg-yellow-300/80 hover:bg-yellow-400 active:bg-yellow-500 transition-colors cursor-pointer outline-none border-none p-0"
            onClick={handleMinimize}
            title="Minimize"
          />
          <button
            className="no-drag w-3.5 h-3.5 rounded-full bg-green-300/80 hover:bg-green-400 active:bg-green-500 transition-colors cursor-pointer outline-none border-none p-0"
            onClick={handlePin}
            title={isPinned ? 'Unpin from top' : 'Always on top'}
          />
        </div>
        <span className="text-xs font-semibold text-warm-300 ml-1">Timer</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePin}
          className={`no-drag text-[11px] px-3 py-1 rounded-full font-bold transition-colors outline-none border-none
            ${isPinned
              ? 'bg-warm-800 text-white'
              : 'text-warm-400 hover:text-warm-600 hover:bg-warm-100'
            }`}
          title={isPinned ? 'Unpin from top' : 'Always on top'}
        >
          {isPinned ? 'Pinned' : 'Pin'}
        </button>
      </div>
    </div>
  )
}
