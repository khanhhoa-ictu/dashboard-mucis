import { useMemo } from 'react'
import { motion } from 'motion/react'
import { getCoverArt } from '../assets/covers/coverArt'
import heroMyMusic from '../assets/illustrations/hero-my-music.webp'
import {
  AnimatedSection,
  HeaderActions,
  HeartIcon,
  MediaThumb,
  MoreIcon,
  MotionButton,
  PauseIcon,
  PageDataFallback,
  PageHero,
  Panel,
  PlayIcon,
  QueueIcon,
  RepeatIcon,
  SearchField,
  SectionHeader,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TiltCard,
  VolumeIcon,
} from '../components/ui'
import { useAudioPlayer } from '../context/AudioPlayerContext'
import { useMyMusicData } from '../hooks'
import { buildPlayableQueue, buildPlayableTrack, formatPlaybackTime } from '../lib/audio/playableTrack'

function MyMusicPage() {
  const { data } = useMyMusicData()
  const {
    currentTrack,
    duration,
    currentTime,
    isPlaying,
    playTrack,
    toggleTrack,
    togglePlayback,
    playNext,
    playPrevious,
    seekTo,
    isCurrentTrack,
  } = useAudioPlayer()

  if (!data) {
    return <PageDataFallback title="Loading my music" />
  }

  const { albums, artists, continueListening, recentlyAdded, topTracks } = data
  const playbackQueue = useMemo(
    () => buildPlayableQueue([...recentlyAdded, ...topTracks, ...continueListening]),
    [continueListening, recentlyAdded, topTracks],
  )

  const currentDisplayTrack = currentTrack ?? playbackQueue[0] ?? null
  const playbackProgress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0
  const handleMainPlayback = async () => {
    if (currentTrack) {
      await togglePlayback()
      return
    }

    if (playbackQueue[0]) {
      await playTrack(playbackQueue[0], playbackQueue)
    }
  }

  return (
    <>
      <AnimatedSection as="header" className="grid items-center gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[1.95rem] leading-none font-extrabold text-[#30294f] sm:text-[2.35rem]"
        >
          My Music
        </motion.h1>

        <SearchField placeholder="Search for songs, artists, or albums..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <PageHero
          imageSrc={heroMyMusic}
          imageAlt="Mia listening to music"
          title={<>Your music,<br />your mood</>}
          description={<>All your favorites,<br />all in one place.</>}
          buttonLabel="Shuffle My Music"
          imageFirstColsClassName="lg:grid-cols-[1.15fr_1fr]"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1.35fr_0.8fr]">
        <Panel>
          <SectionHeader title="Recently Added" actionLabel="See All" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recentlyAdded.map((track) => (
              <TiltCard
                key={track.title}
                as="article"
                className="relative grid gap-2.5 rounded-[20px] sm:gap-3 sm:rounded-[24px]"
              >
                <MediaThumb
                  src={getCoverArt(track.tone)}
                  alt={track.title}
                  className="aspect-square overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[20px]"
                />
                <div>
                  <strong className="block text-[0.98rem] leading-tight text-[#30294f] sm:text-[1.08rem]">{track.title}</strong>
                  <span className="mt-0.5 block text-sm text-[#7d728e] sm:mt-1 sm:text-base">{track.artist}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm text-[#7d728e] sm:gap-3 sm:text-base">
                  <span>{track.duration}</span>
                  <button
                    type="button"
                    onClick={() => {
                      void toggleTrack(buildPlayableTrack(track), playbackQueue)
                    }}
                    className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)]"
                  >
                    {isCurrentTrack(buildPlayableTrack(track)) && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title="Top Tracks" actionLabel="See All" />
          <div className="grid gap-3 sm:gap-4">
            {topTracks.map((track) => (
              <div key={track.rank} className="grid grid-cols-[auto_44px_1fr_auto] items-center gap-2.5 sm:grid-cols-[auto_52px_1fr_auto_auto] sm:gap-3">
                <span className="font-extrabold text-[#30294f]">{track.rank}</span>
                <div className="h-11 w-11 overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[52px] sm:w-[52px] sm:rounded-[16px]">
                  <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{track.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{track.artist}</span>
                </div>
                <span className={track.liked ? 'text-[#ff7ea2]' : 'text-[#c1b7d4]'}><HeartIcon size={18} /></span>
                <button
                  type="button"
                  onClick={() => {
                    void toggleTrack(buildPlayableTrack(track), playbackQueue)
                  }}
                  className="hidden rounded-full bg-white p-2 text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)] sm:grid sm:place-items-center"
                >
                  {isCurrentTrack(buildPlayableTrack(track)) && isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                </button>
                <span className="hidden text-[#6f6387] sm:inline">{track.duration}</span>
              </div>
            ))}
          </div>
        </Panel>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Panel>
          <SectionHeader title="Albums" actionLabel="See All" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {albums.map((album) => (
              <TiltCard
                key={album.title}
                as="article"
                className="relative grid gap-2.5 rounded-[20px] sm:gap-3 sm:rounded-[24px]"
              >
                <div className="aspect-square overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[20px]">
                  <img src={getCoverArt(album.tone)} alt={album.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-[0.98rem] leading-tight text-[#30294f] sm:text-[1.08rem]">{album.title}</strong>
                  <span className="mt-0.5 block text-sm text-[#7d728e] sm:mt-1 sm:text-base">{album.artist}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        </Panel>
      </AnimatedSection>

      <AnimatedSection delay={0.12} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.9fr_1fr_0.95fr]">
        <article className="rounded-[24px] border border-white/72 bg-linear-to-b from-[var(--surface-card-start)] to-[var(--surface-card-end)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),var(--route-chip-shadow)] sm:rounded-[28px] sm:p-[18px]">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-[18px]">
            <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Artists</h3>
            <button type="button" className="rounded-full bg-white/88 px-[14px] py-2 text-[#736885] shadow-[var(--route-chip-shadow)]">See All</button>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {artists.map((artist) => (
              <div key={artist.name} className="grid grid-cols-[44px_1fr_auto] items-center gap-2.5 sm:grid-cols-[52px_1fr_auto] sm:gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[52px] sm:w-[52px]">
                  <img src={getCoverArt(artist.tone)} alt={artist.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{artist.name}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{artist.songs}</span>
                </div>
                <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)]"><MoreIcon size={16} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-white/72 bg-linear-to-b from-[var(--surface-card-start)] to-[var(--surface-card-end)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),var(--route-chip-shadow)] sm:rounded-[28px] sm:p-[18px]">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-[18px]">
            <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Continue Listening</h3>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {continueListening.map((track) => (
              <div key={track.title} className="grid grid-cols-[52px_1fr_auto] items-center gap-2.5 sm:grid-cols-[64px_1fr_auto] sm:gap-3">
                <div className="h-[52px] w-[52px] overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-16 sm:w-16 sm:rounded-[18px]">
                  <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{track.title}</strong>
                  <span className="block text-xs text-[#7d728e] sm:text-base">{track.artist}</span>
                  <div className="mt-1.5 flex items-center gap-2 sm:mt-2 sm:gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-[color-mix(in_srgb,var(--route-accent-soft)_52%,white)]">
                      <div
                        className="h-1.5 rounded-full bg-linear-to-r from-[var(--route-accent)] to-[var(--route-accent-strong)]"
                        style={{ width: track.progress }}
                      />
                    </div>
                    <span className="text-xs text-[#7d728e] sm:text-sm">{track.remaining}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void toggleTrack(buildPlayableTrack(track), playbackQueue)
                  }}
                  className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)]"
                >
                  {isCurrentTrack(buildPlayableTrack(track)) && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>
              </div>
            ))}
          </div>
        </article>

        <TiltCard as="article" className="relative rounded-[24px] bg-linear-to-br from-[var(--route-accent)] to-[var(--route-accent-strong)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),var(--route-chip-shadow)] sm:rounded-[28px] sm:p-[18px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[1.2rem] font-extrabold text-white">Now Playing</h3>
            <MoreIcon size={18} />
          </div>
          <div className="mb-4 aspect-[1.15] overflow-hidden rounded-[20px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[24px]">
            <img
              src={getCoverArt(currentDisplayTrack?.tone ?? 'cozy-room')}
              alt={currentDisplayTrack?.title ?? 'Now playing cover'}
              className="artwork-media h-full w-full object-cover"
            />
          </div>
          <strong className="block text-[1.6rem] sm:text-[2rem]">{currentDisplayTrack?.title ?? 'Pick a track'}</strong>
          <span className="mt-1 block text-white/82">{currentDisplayTrack?.artist ?? 'Your music will appear here'}</span>
          <div className="mt-5">
            <div className="h-1.5 rounded-full bg-white/30">
              <div className="h-1.5 rounded-full bg-white" style={{ width: `${playbackProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-white/84">
              <span>{formatPlaybackTime(currentTime)}</span>
              <span>{formatPlaybackTime(duration)}</span>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between text-lg font-extrabold sm:text-xl">
            <HeartIcon size={18} />
            <button type="button" onClick={() => { void playPrevious() }}>
              <SkipBackIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => { void handleMainPlayback() }}
              className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--route-accent-strong)] sm:h-14 sm:w-14"
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            <button type="button" onClick={() => { void playNext() }}>
              <SkipForwardIcon size={18} />
            </button>
            <RepeatIcon size={18} />
          </div>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection delay={0.15} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[var(--route-accent)] to-[var(--route-accent-strong)] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),var(--route-chip-shadow)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[220px_1fr_auto] lg:text-left">
        <div className="flex items-center gap-3">
          <div className="h-[58px] w-[58px] overflow-hidden rounded-[18px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)]">
            <img
              src={getCoverArt(currentDisplayTrack?.tone ?? 'weekend-van')}
              alt={currentDisplayTrack?.title ?? 'Current track'}
              className="artwork-media h-full w-full object-cover"
            />
          </div>
          <div>
            <strong className="block text-[1.1rem]">{currentDisplayTrack?.title ?? 'Choose a song'}</strong>
            <span className="text-white/80">{currentDisplayTrack?.artist ?? 'Ready to play demo audio'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-lg font-extrabold sm:gap-5 sm:text-xl">
          <HeartIcon size={18} />
          <ShuffleIcon size={18} />
          <button type="button" onClick={() => { void playPrevious() }}>
            <SkipBackIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => { void handleMainPlayback() }}
            className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--route-accent-strong)] sm:h-14 sm:w-14"
          >
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <button type="button" onClick={() => { void playNext() }}>
            <SkipForwardIcon size={18} />
          </button>
          <RepeatIcon size={18} />
          <VolumeIcon size={18} />
          <QueueIcon size={18} />
        </div>

        <MotionButton className="justify-self-start rounded-full bg-white/18 px-5 py-3 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] lg:justify-self-end">
          Queue {playbackQueue.length}
        </MotionButton>
      </AnimatedSection>

      {currentDisplayTrack ? (
        <AnimatedSection delay={0.17}>
          <div className="rounded-[24px] border border-white/72 bg-white/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94),var(--route-chip-shadow)] sm:rounded-[28px]">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#6f6387]">Playback</span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color-mix(in_srgb,var(--route-accent-soft)_52%,white)]"
              />
              <span className="min-w-[82px] text-right text-sm font-semibold text-[#6f6387]">
                {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
              </span>
            </div>
          </div>
        </AnimatedSection>
      ) : null}
    </>
  )
}

export default MyMusicPage
