import { useRef, useCallback, useEffect, useState } from 'react'

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stoppedRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const getContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playBeep = useCallback(() => {
    const ctx = getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  }, [getContext])

  const startAlarm = useCallback((durationSeconds?: number) => {
    if (isPlaying) return

    stoppedRef.current = false
    setIsPlaying(true)
    const ctx = getContext()

    const playPattern = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed' || stoppedRef.current) return
      const now = audioContextRef.current.currentTime

      const notes = [1047, 784] // C6, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.2)
        gain.gain.setValueAtTime(0, now + i * 0.2)
        gain.gain.linearRampToValueAtTime(0.4, now + i * 0.2 + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.2)
        osc.stop(now + i * 0.2 + 0.5)
      })
    }

    playPattern()
    intervalRef.current = setInterval(playPattern, 2500)

    // Auto-stop after duration if specified
    if (durationSeconds && durationSeconds > 0) {
      setTimeout(() => {
        if (!stoppedRef.current) {
          stopAlarmInternal()
        }
      }, durationSeconds * 1000)
    }
  }, [isPlaying, getContext])

  const stopAlarmInternal = useCallback(() => {
    stoppedRef.current = true
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Close AudioContext to immediately kill any currently-playing sounds
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
    }
  }, [])

  const stopAlarm = useCallback(() => {
    stopAlarmInternal()
  }, [stopAlarmInternal])

  useEffect(() => {
    return () => {
      stopAlarmInternal()
    }
  }, [stopAlarmInternal])

  return { playBeep, startAlarm, stopAlarm, isPlaying }
}
