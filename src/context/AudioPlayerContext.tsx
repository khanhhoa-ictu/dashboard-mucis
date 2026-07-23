import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'

export type PlayableTrack = {
  id: string
  trackId?: string
  title: string
  artist: string
  tone: string
  audioUrl: string
}

type AudioPlayerContextValue = {
  currentTrack: PlayableTrack | null
  queue: PlayableTrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playTrack: (track: PlayableTrack, queue?: PlayableTrack[]) => Promise<void>
  toggleTrack: (track: PlayableTrack, queue?: PlayableTrack[]) => Promise<void>
  togglePlayback: () => Promise<void>
  playNext: () => Promise<void>
  playPrevious: () => Promise<void>
  seekTo: (nextTime: number) => void
  setVolumeLevel: (nextVolume: number) => void
  toggleMute: () => void
  isCurrentTrack: (track: PlayableTrack | null | undefined) => boolean
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)
const DEMO_PROFILE_ID = '11111111-1111-1111-1111-111111111111'
const MIN_PROGRESS_TO_SYNC_SECONDS = 5

function isAbortPlaybackError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function clampTime(value: number, duration: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), duration || 0)
}

export function AudioPlayerProvider({ children }: PropsWithChildren) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeRecentPlayIdRef = useRef<string | null>(null)
  const currentTrackRef = useRef<PlayableTrack | null>(null)
  const queueRef = useRef<PlayableTrack[]>([])
  const currentTimeRef = useRef(0)
  const isPlayPendingRef = useRef(false)
  const playRequestIdRef = useRef(0)
  const syncCurrentTrackProgressRef = useRef<(track: PlayableTrack | null, progressSeconds: number) => Promise<void>>(async () => {})
  const playNextRef = useRef<() => Promise<void>>(async () => {})
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null)
  const [queue, setQueue] = useState<PlayableTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.82)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  useEffect(() => {
    currentTimeRef.current = currentTime
  }, [currentTime])

  const syncCurrentTrackProgress = useEffectEvent(async (
    track: PlayableTrack | null,
    progressSeconds: number,
  ) => {
    if (!supabase || !isSupabaseConfigured || !track?.trackId) {
      return
    }

    const roundedProgress = Math.max(0, Math.floor(progressSeconds))

    if (roundedProgress < MIN_PROGRESS_TO_SYNC_SECONDS) {
      return
    }

    if (!activeRecentPlayIdRef.current) {
      const insertResult = await supabase
        .from('recent_plays')
        .insert({
          profile_id: DEMO_PROFILE_ID,
          track_id: track.trackId,
          progress_seconds: roundedProgress,
          played_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertResult.error) {
        if (import.meta.env.DEV) {
          console.warn('[audio-player] Failed to insert recent_plays row.', insertResult.error)
        }
        return
      }

      activeRecentPlayIdRef.current = insertResult.data.id
      return
    }

    const updateResult = await supabase
      .from('recent_plays')
      .update({
        progress_seconds: roundedProgress,
        played_at: new Date().toISOString(),
      })
      .eq('id', activeRecentPlayIdRef.current)

    if (updateResult.error && import.meta.env.DEV) {
      console.warn('[audio-player] Failed to update recent_plays row.', updateResult.error)
    }
  })

  useEffect(() => {
    syncCurrentTrackProgressRef.current = syncCurrentTrackProgress
  }, [syncCurrentTrackProgress])

  const playResolvedTrack = useEffectEvent(async (track: PlayableTrack, nextQueue?: PlayableTrack[]) => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (nextQueue?.length) {
      setQueue(nextQueue)
    }

    if (currentTrackRef.current && currentTrackRef.current.id !== track.id) {
      await syncCurrentTrackProgress(currentTrackRef.current, audio.currentTime || currentTimeRef.current)
      activeRecentPlayIdRef.current = null
    }

    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl
      audio.currentTime = 0
      setCurrentTime(0)
      setDuration(0)
    }

    setCurrentTrack(track)
    const requestId = ++playRequestIdRef.current
    isPlayPendingRef.current = true

    try {
      await audio.play()
    } catch (error) {
      if (requestId === playRequestIdRef.current) {
        isPlayPendingRef.current = false
        setIsPlaying(false)
      }

      if (isAbortPlaybackError(error)) {
        return
      }

      if (import.meta.env.DEV) {
        console.warn('[audio-player] Failed to play track.', error)
      }
      return
    }

    if (requestId === playRequestIdRef.current) {
      isPlayPendingRef.current = false
    }
  })

  const playTrack = useEffectEvent(async (track: PlayableTrack, nextQueue?: PlayableTrack[]) => {
    await playResolvedTrack(track, nextQueue)
  })

  const toggleTrack = useEffectEvent(async (track: PlayableTrack, nextQueue?: PlayableTrack[]) => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const isSameTrack = currentTrackRef.current?.id === track.id

    if (isPlayPendingRef.current) {
      return
    }

    if (isSameTrack && isPlaying) {
      audio.pause()
      return
    }

    if (isSameTrack && !isPlaying) {
      await audio.play()
      return
    }

    await playResolvedTrack(track, nextQueue)
  })

  const togglePlayback = useEffectEvent(async () => {
    const audio = audioRef.current

    if (!audio || !currentTrackRef.current) {
      return
    }

    if (isPlayPendingRef.current) {
      return
    }

    if (isPlaying) {
      audio.pause()
      return
    }

    await audio.play()
  })

  const playNext = useEffectEvent(async () => {
    const nextQueue = queueRef.current
    const activeTrack = currentTrackRef.current

    if (!nextQueue.length || !activeTrack) {
      return
    }

    const currentIndex = nextQueue.findIndex((item) => item.id === activeTrack.id)
    const nextTrack = nextQueue[(currentIndex + 1 + nextQueue.length) % nextQueue.length]

    await playResolvedTrack(nextTrack, nextQueue)
  })

  useEffect(() => {
    playNextRef.current = playNext
  }, [playNext])

  const playPrevious = useEffectEvent(async () => {
    const audio = audioRef.current
    const nextQueue = queueRef.current
    const activeTrack = currentTrackRef.current

    if (!audio || !nextQueue.length || !activeTrack) {
      return
    }

    if (audio.currentTime > 2.5) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const currentIndex = nextQueue.findIndex((item) => item.id === activeTrack.id)
    const previousTrack = nextQueue[(currentIndex - 1 + nextQueue.length) % nextQueue.length]

    await playResolvedTrack(previousTrack, nextQueue)
  })

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = volume
    audio.muted = isMuted
    audioRef.current = audio

    const syncTime = () => {
      const nextTime = audio.currentTime || 0
      currentTimeRef.current = nextTime
      setCurrentTime(nextTime)
    }

    const syncDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    const handleEnded = () => {
      void syncCurrentTrackProgressRef.current(currentTrackRef.current, audio.currentTime || currentTimeRef.current)
      activeRecentPlayIdRef.current = null
      currentTimeRef.current = 0
      setCurrentTime(0)
      if (queueRef.current.length > 1 && currentTrackRef.current) {
        void playNextRef.current()
        return
      }
      setIsPlaying(false)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => {
      isPlayPendingRef.current = false
      void syncCurrentTrackProgressRef.current(currentTrackRef.current, audio.currentTime || currentTimeRef.current)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', syncTime)
    audio.addEventListener('loadedmetadata', syncDuration)
    audio.addEventListener('durationchange', syncDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      isPlayPendingRef.current = false
      void syncCurrentTrackProgressRef.current(currentTrackRef.current, audio.currentTime || currentTimeRef.current)
      audio.pause()
      audio.removeEventListener('timeupdate', syncTime)
      audio.removeEventListener('loadedmetadata', syncDuration)
      audio.removeEventListener('durationchange', syncDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.muted = isMuted
  }, [isMuted])

  const seekTo = useEffectEvent((nextTime: number) => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const safeTime = clampTime(nextTime, Number.isFinite(audio.duration) ? audio.duration : duration)
    audio.currentTime = safeTime
    currentTimeRef.current = safeTime
    setCurrentTime(safeTime)
  })

  const setVolumeLevel = useEffectEvent((nextVolume: number) => {
    const safeVolume = Math.min(Math.max(nextVolume, 0), 1)
    setVolume(safeVolume)
    if (safeVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  })

  const toggleMute = useEffectEvent(() => {
    setIsMuted((current) => !current)
  })

  const isCurrentTrack = (track: PlayableTrack | null | undefined) => Boolean(track && currentTrack?.id === track.id)

  const value = useMemo<AudioPlayerContextValue>(() => ({
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    toggleTrack,
    togglePlayback,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleMute,
    isCurrentTrack,
  }), [
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    toggleTrack,
    togglePlayback,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleMute,
    isCurrentTrack,
  ])

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)

  if (!context) {
    throw new Error('useAudioPlayer must be used inside AudioPlayerProvider')
  }

  return context
}
