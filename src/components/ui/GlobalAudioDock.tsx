import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { getCoverArt } from '../../assets/covers/coverArt'
import { useAudioPlayer } from '../../context/AudioPlayerContext'
import { formatPlaybackTime } from '../../lib/audio/playableTrack'
import {
  HeartIcon,
  PauseIcon,
  PlayIcon,
  QueueIcon,
  RepeatIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from './AppIcons'

function GlobalAudioDock() {
  const {
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    playNext,
    playPrevious,
    seekTo,
    togglePlayback,
    queue,
    volume,
    isMuted,
    setVolumeLevel,
    toggleMute,
    isCurrentTrack,
    toggleTrack,
  } = useAudioPlayer()
  const [isQueueOpen, setIsQueueOpen] = useState(false)

  if (!currentTrack) {
    return null
  }

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0
  const nextUp = useMemo(
    () => queue.filter((track) => track.id !== currentTrack.id),
    [currentTrack.id, queue],
  )

  return (
    <motion.aside
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="pointer-events-auto fixed right-4 bottom-4 left-4 z-[85] rounded-[26px] border border-white/72 bg-[rgba(255,252,251,0.94)] px-4 py-3 shadow-[0_24px_45px_rgba(171,147,219,0.22),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[20px] sm:left-auto sm:w-[min(760px,calc(100vw-2.5rem))] sm:px-5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)]">
            <img src={getCoverArt(currentTrack.tone)} alt={currentTrack.title} className="artwork-media h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <strong className="block truncate text-[0.98rem] font-extrabold text-[#30294f]">{currentTrack.title}</strong>
            <span className="block truncate text-sm text-[#7d728e]">{currentTrack.artist}</span>
          </div>

          <div className="hidden items-center gap-3 text-[#7e6d99] sm:flex">
            <button type="button"><HeartIcon size={18} /></button>
            <button type="button"><RepeatIcon size={18} /></button>
            <button type="button" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
            </button>
            <button type="button" onClick={() => setIsQueueOpen((current) => !current)} className="relative">
              <QueueIcon size={18} />
              <span className="absolute -right-2 -top-2 rounded-full bg-[var(--route-chip-bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--route-accent-strong)]">
                {queue.length}
              </span>
            </button>
          </div>
        </div>

        <div className="grid items-center gap-3 sm:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center justify-center gap-3 text-[#6d5a8e]">
            <button type="button" onClick={() => { void playPrevious() }} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[0_12px_22px_rgba(214,200,236,0.2)]">
              <SkipBackIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => { void togglePlayback() }}
              className="grid h-12 w-12 place-items-center rounded-full bg-linear-to-br from-[var(--route-accent)] to-[var(--route-accent-strong)] text-white shadow-[var(--route-chip-shadow)]"
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            <button type="button" onClick={() => { void playNext() }} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[0_12px_22px_rgba(214,200,236,0.2)]">
              <SkipForwardIcon size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="min-w-[38px] text-xs font-semibold text-[#8e82a4]">{formatPlaybackTime(currentTime)}</span>
            <div className="relative flex-1">
              <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--route-accent-soft)_50%,white)]">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-[var(--route-accent)] to-[var(--route-accent-strong)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="absolute inset-0 h-2 w-full cursor-pointer appearance-none opacity-0"
              />
            </div>
            <span className="min-w-[38px] text-right text-xs font-semibold text-[#8e82a4]">{formatPlaybackTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-[#7e6d99] sm:hidden">
            <button type="button"><HeartIcon size={18} /></button>
            <button type="button"><RepeatIcon size={18} /></button>
            <button type="button" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
            </button>
            <button type="button" onClick={() => setIsQueueOpen((current) => !current)} className="relative">
              <QueueIcon size={18} />
              <span className="absolute -right-2 -top-2 rounded-full bg-[var(--route-chip-bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--route-accent-strong)]">
                {queue.length}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.14em] text-[#9b8fb3] uppercase">Volume</span>
            <div className="relative flex-1">
              <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--route-accent-soft)_50%,white)]">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-[color-mix(in_srgb,var(--route-accent)_62%,white)] to-[var(--route-accent-strong)]"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(event) => setVolumeLevel(Number(event.target.value))}
                className="absolute inset-0 h-2 w-full cursor-pointer appearance-none opacity-0"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQueueOpen((current) => !current)}
            className="justify-self-start rounded-full bg-[var(--route-chip-bg)] px-3 py-2 text-xs font-bold tracking-[0.14em] text-[var(--route-accent-strong)] uppercase shadow-[var(--route-chip-shadow)]"
          >
            {isQueueOpen ? 'Hide Queue' : 'Show Queue'}
          </button>
        </div>

        {isQueueOpen ? (
          <div className="rounded-[22px] border border-white/72 bg-white/76 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <strong className="text-sm font-extrabold text-[#30294f]">Queue</strong>
              <span className="text-xs font-semibold tracking-[0.14em] text-[#9b8fb3] uppercase">
                {queue.length} items
              </span>
            </div>

            <div className="grid max-h-[220px] gap-2 overflow-auto pr-1">
              {queue.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    void toggleTrack(track, queue)
                  }}
                  className={`grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-[18px] px-2.5 py-2.5 text-left transition ${
                    isCurrentTrack(track)
                      ? 'bg-[var(--route-chip-bg)] shadow-[var(--route-chip-shadow)]'
                      : 'bg-white/55 hover:bg-white/82'
                  }`}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-[12px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)]">
                    <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-[#30294f]">{track.title}</strong>
                    <span className="block truncate text-xs text-[#7d728e]">{track.artist}</span>
                  </div>
                  <span className="text-[var(--route-accent-strong)]">
                    {isCurrentTrack(track) && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                  </span>
                </button>
              ))}
            </div>

            {nextUp.length ? (
              <p className="mt-3 text-xs text-[#8e82a4]">
                Next up: <span className="font-semibold text-[#5e5178]">{nextUp[0].title}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.aside>
  )
}

export default GlobalAudioDock
