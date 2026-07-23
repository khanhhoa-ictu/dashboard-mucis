import { useMemo } from 'react'
import { motion } from 'motion/react'
import { getCoverArt } from '../assets/covers/coverArt'
import heroPlaylists from '../assets/illustrations/hero-playlists.webp'
import {
  AnimatedSection,
  BookIcon,
  ChevronRightIcon,
  CloudIcon,
  HeaderActions,
  HeartIcon,
  MediaThumb,
  MoonIcon,
  MoreIcon,
  MotionButton,
  PauseIcon,
  PageDataFallback,
  PageHero,
  PlayIcon,
  PlusIcon,
  SearchField,
  SectionHeader,
  SunIcon,
  TiltCard,
  ZapIcon,
} from '../components/ui'
import { useAudioPlayer } from '../context/AudioPlayerContext'
import { usePlaylistsData } from '../hooks'
import { buildPlayableQueue, buildPlayableTrack } from '../lib/audio/playableTrack'

const moodClasses: Record<string, string> = {
  happy: 'from-[#ffd86b]/92 via-[#ffdf85]/86 to-[#ffc16a]/88',
  chill: 'from-[#b7c9ff]/92 via-[#c7d6ff]/84 to-[#98b3f2]/90',
  energetic: 'from-[#ffb4aa]/92 via-[#ffc7bf]/84 to-[#ff9e9b]/88',
  romantic: 'from-[#ffb6d2]/92 via-[#ffc8de]/84 to-[#f59bbd]/88',
  'focus-book': 'from-[#d7ed93]/92 via-[#e2f3b0]/84 to-[#b9d975]/88',
  'sleep-night': 'from-[#bdafff]/92 via-[#d0c4ff]/84 to-[#9f8bf4]/88',
}

const panelClass =
  'rounded-[24px] border border-white/72 bg-linear-to-b from-[var(--surface-card-start)] to-[var(--surface-card-end)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),var(--route-chip-shadow)] sm:rounded-[28px] sm:p-[18px]'

function PlaylistsPage() {
  const { data } = usePlaylistsData()
  const { isCurrentTrack, isPlaying, playTrack, toggleTrack } = useAudioPlayer()

  if (!data) {
    return <PageDataFallback title="Loading playlists" />
  }

  const { featuredPlaylists, moodCollections, sharedPlaylists, userPlaylists } = data

  const moodIconMap = {
    Happy: SunIcon,
    Chill: CloudIcon,
    Energetic: ZapIcon,
    Romantic: HeartIcon,
    Focus: BookIcon,
    Sleep: MoonIcon,
  }

  const moodCoverMap = {
    Happy: 'summer-pool',
    Chill: 'dream-clouds',
    Energetic: 'road-trip',
    Romantic: 'heart-balloon',
    Focus: 'study-desk',
    Sleep: 'moon-river',
  }

  const featuredQueue = useMemo(
    () => buildPlayableQueue(
      featuredPlaylists.map((playlist) => ({
        title: playlist.title,
        artist: playlist.songs ?? 'Playlist mix',
        tone: playlist.tone,
      })),
    ),
    [featuredPlaylists],
  )

  const sharedQueue = useMemo(
    () => buildPlayableQueue(
      sharedPlaylists.map((playlist) => ({
        title: playlist.title,
        artist: playlist.friends ?? 'Shared playlist',
        tone: playlist.tone,
      })),
    ),
    [sharedPlaylists],
  )

  return (
    <>
      <AnimatedSection as="header" className="grid items-center gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[1.95rem] leading-none font-extrabold text-[#30294f] sm:text-[2.35rem]"
        >
          Playlists
        </motion.h1>

        <SearchField placeholder="Search for playlists, songs, artists..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <PageHero
          imageSrc={heroPlaylists}
          imageAlt="Playlist hero artwork"
          title="Curated for every moment"
          description={<>Discover playlists for every mood,<br />moment, and adventure.</>}
          buttonLabel="Create New Playlist"
          imageFirstColsClassName="lg:grid-cols-[1.02fr_0.98fr]"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08} className={`${panelClass} grid gap-3 sm:gap-4`}>
        <SectionHeader title="Featured Playlists" actionLabel="See All" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredPlaylists.map((playlist) => (
            <TiltCard
              key={playlist.title}
              as="article"
              className="group relative overflow-hidden rounded-[22px] border border-white/72 bg-white/38 p-2.5 shadow-[0_18px_32px_rgba(200,184,223,0.18),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-[10px] transition-[box-shadow,transform] duration-300 hover:shadow-[0_24px_42px_rgba(184,164,220,0.28),inset_0_1px_0_rgba(255,255,255,0.78)] sm:rounded-[26px] sm:p-3"
            >
              <MediaThumb
                src={getCoverArt(playlist.tone)}
                alt={playlist.title}
                className="relative aspect-[0.92] overflow-hidden rounded-[18px] shadow-[0_16px_28px_rgba(190,173,219,0.2),inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[22px]"
              >
                <div className="absolute inset-0 bg-linear-to-t from-[rgba(59,32,94,0.38)] via-transparent to-[rgba(255,255,255,0.06)]" />
                <span className="absolute left-3 top-3 rounded-full bg-white/28 px-2.5 py-1 text-[0.64rem] font-extrabold tracking-[0.18em] text-white uppercase backdrop-blur-[10px]">
                  Curated
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void toggleTrack(
                      buildPlayableTrack({
                        title: playlist.title,
                        artist: playlist.songs ?? 'Playlist mix',
                        tone: playlist.tone,
                      }),
                      featuredQueue,
                    )
                  }}
                  className="absolute right-3 bottom-3 grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)] transition duration-300 group-hover:scale-[1.08]"
                >
                  {isCurrentTrack(buildPlayableTrack({
                    title: playlist.title,
                    artist: playlist.songs ?? 'Playlist mix',
                    tone: playlist.tone,
                  })) && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>
              </MediaThumb>
              <div className="px-1 pb-1 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="block text-[0.98rem] leading-tight text-[#30294f] sm:text-[1.1rem]">{playlist.title}</strong>
                    <span className="mt-0.5 block text-sm text-[#7d728e] sm:mt-1 sm:text-[0.98rem]">{playlist.songs}</span>
                  </div>
                  <span className="rounded-full bg-[#f3eaff] px-2.5 py-1 text-[0.64rem] font-extrabold tracking-[0.14em] text-[#8b63e8] uppercase">
                    Mix
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[0.76rem] font-medium text-[#8d80a4] sm:text-[0.82rem]">
                  <span className="h-2 w-2 rounded-full bg-[#b38df5]" />
                  <span>Made for your mood</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.11} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.95fr_1.05fr]">
        <article className={panelClass}>
          <SectionHeader title="Your Playlists" actionLabel="See All" />
          <div className="grid gap-2.5 sm:gap-3">
            {userPlaylists.map((playlist) => (
              <motion.div
                key={playlist.title}
                whileHover={{ x: 4, y: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[20px] border border-white/70 bg-white/52 px-2.5 py-2.5 shadow-[0_14px_24px_rgba(222,208,236,0.16),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[10px] transition-[box-shadow,background-color] duration-300 hover:bg-white/66 hover:shadow-[0_18px_28px_rgba(212,196,232,0.24),inset_0_1px_0_rgba(255,255,255,0.76)] sm:grid-cols-[56px_1fr_auto] sm:gap-3.5 sm:rounded-[22px] sm:px-3 sm:py-3"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-[14px] shadow-[0_10px_18px_rgba(188,170,219,0.2),inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[56px] sm:w-[56px] sm:rounded-[16px]">
                  <img src={getCoverArt(playlist.tone)} alt={playlist.title} className="artwork-media h-full w-full object-cover" />
                  {playlist.favorite && (
                    <span className="absolute right-[-4px] top-[-4px] grid h-6 w-6 place-items-center rounded-full bg-[#b28cf9] text-xs text-white shadow-[0_10px_16px_rgba(178,140,249,0.32)]">
                      <HeartIcon size={14} />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="truncate text-sm text-[#30294f] sm:text-base">{playlist.title}</strong>
                    {playlist.favorite && (
                      <span className="rounded-full bg-[#f3eaff] px-2 py-0.5 text-[0.62rem] font-extrabold tracking-[0.16em] text-[#8b63e8] uppercase">
                        Favorite
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#7d728e] sm:text-sm">
                    <span>{playlist.songs}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d5c9eb]" />
                    <span>Personal mix</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/85 text-[#8e81a8] shadow-[0_10px_18px_rgba(220,205,235,0.22)] transition duration-300 hover:scale-[1.05] hover:text-[#7c56df] hover:shadow-[0_14px_22px_rgba(190,166,228,0.28)]"
                >
                  <MoreIcon size={18} />
                </button>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ x: 4, y: -2 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[20px] border border-[#eadfff] bg-linear-to-r from-[#f7efff] via-white/90 to-[#fff3fb] px-2.5 py-2.5 shadow-[0_14px_24px_rgba(222,208,236,0.16),inset_0_1px_0_rgba(255,255,255,0.78)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_20px_30px_rgba(212,196,232,0.26),inset_0_1px_0_rgba(255,255,255,0.82)] sm:grid-cols-[56px_1fr_auto] sm:gap-3.5 sm:rounded-[22px] sm:px-3 sm:py-3"
            >
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--route-chip-bg)] text-2xl text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow),inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[56px] sm:w-[56px] sm:rounded-[16px]">
                <PlusIcon size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="block text-sm text-[#30294f] sm:text-base">Create New Playlist</strong>
                  <span className="rounded-full bg-white/88 px-2 py-0.5 text-[0.62rem] font-extrabold tracking-[0.16em] text-[#8b63e8] uppercase">
                    New
                  </span>
                </div>
                <span className="mt-1 block text-xs text-[#7d728e] sm:text-sm">Build your perfect playlist</span>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/88 text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)] transition duration-300 group-hover:scale-[1.04]">
                <ChevronRightIcon size={18} />
              </span>
            </motion.div>
          </div>
        </article>

        <article className={panelClass}>
          <SectionHeader title="Mood Collections" actionLabel="See All" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {moodCollections.map((item) => (
              <TiltCard
                key={item.name}
                as="article"
                className="group relative overflow-hidden rounded-[22px] border border-white/70 shadow-[0_18px_32px_rgba(198,183,221,0.18),inset_0_1px_0_rgba(255,255,255,0.65)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_24px_40px_rgba(184,166,221,0.26),inset_0_1px_0_rgba(255,255,255,0.72)] sm:rounded-[26px]"
              >
                <img
                  src={getCoverArt(moodCoverMap[item.name as keyof typeof moodCoverMap] ?? 'dream-clouds')}
                  alt={item.name}
                  className="artwork-media absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                />
                <div className={`absolute inset-0 bg-linear-to-br ${moodClasses[item.tone]}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.6),transparent_34%),linear-gradient(to_top,rgba(255,250,248,0.2),rgba(255,250,248,0.02))]" />
                <div className="relative grid min-h-[142px] content-between p-4 text-left sm:min-h-[168px] sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white/58 text-[#7859df] shadow-[0_10px_18px_rgba(143,106,234,0.16),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[10px] sm:h-12 sm:w-12 sm:rounded-[16px]">
                    {(() => {
                      const Icon = moodIconMap[item.name as keyof typeof moodIconMap]
                        return Icon ? <Icon size={24} /> : item.icon
                    })()}
                    </span>
                    <span className="rounded-full bg-white/42 px-2.5 py-1 text-[0.68rem] font-extrabold tracking-[0.18em] text-[#7e6d99] uppercase backdrop-blur-[8px]">
                      Mood
                    </span>
                  </div>

                  <div className="mt-6">
                    <strong className="block text-[1.08rem] leading-tight font-extrabold text-[#2f2753] sm:text-[1.26rem]">{item.name}</strong>
                    <span className="mt-1.5 block text-[0.92rem] font-medium text-[#5f5376] sm:text-[1rem]">{item.playlists}</span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </article>
      </AnimatedSection>

      <AnimatedSection delay={0.14} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.9fr_1.1fr]">
        <article className={panelClass}>
          <SectionHeader title="Shared Playlists" actionLabel="See All" />
          <div className="grid gap-3 sm:gap-4">
            {sharedPlaylists.map((playlist) => (
              <motion.div
                key={playlist.title}
                whileHover={{ x: 4, y: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[20px] border border-white/70 bg-white/52 px-2.5 py-2.5 shadow-[0_14px_24px_rgba(222,208,236,0.16),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[10px] transition-[box-shadow,background-color] duration-300 hover:bg-white/66 hover:shadow-[0_18px_28px_rgba(212,196,232,0.24),inset_0_1px_0_rgba(255,255,255,0.76)] sm:grid-cols-[56px_1fr_auto] sm:gap-3.5 sm:rounded-[22px] sm:px-3 sm:py-3"
              >
                <div className="h-12 w-12 overflow-hidden rounded-[14px] shadow-[0_10px_18px_rgba(188,170,219,0.2),inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[56px] sm:w-[56px] sm:rounded-[16px]">
                  <img src={getCoverArt(playlist.tone)} alt={playlist.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-[#30294f] sm:text-base">{playlist.title}</strong>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#7d728e] sm:text-sm">
                    <span>{playlist.friends}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d5c9eb]" />
                    <span>Shared vibe</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void toggleTrack(
                      buildPlayableTrack({
                        title: playlist.title,
                        artist: playlist.friends ?? 'Shared playlist',
                        tone: playlist.tone,
                      }),
                      sharedQueue,
                    )
                  }}
                  className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)] transition duration-300 hover:scale-[1.08] sm:h-[46px] sm:w-[46px]"
                >
                  {isCurrentTrack(buildPlayableTrack({
                    title: playlist.title,
                    artist: playlist.friends ?? 'Shared playlist',
                    tone: playlist.tone,
                  })) && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>
              </motion.div>
            ))}
          </div>
        </article>

        <TiltCard
          as="article"
          className="group relative overflow-hidden rounded-[24px] border border-white/72 bg-linear-to-br from-[#d38ecd] via-[#f7a5bf] to-[#ffcf7d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]"
        >
          <img
            src={getCoverArt('weekend-van')}
            alt="Weekend Vibes cover"
            className="artwork-media absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-linear-to-br from-[#8d5cc9]/28 via-[#ef8ab7]/24 to-[#ffcf7d]/22" />
          <div className="absolute inset-0 bg-linear-to-t from-[rgba(68,32,106,0.38)] via-transparent to-[rgba(255,255,255,0.18)]" />
          <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#ff7ea2] shadow-[0_12px_18px_rgba(255,126,162,0.22)]">
            <HeartIcon size={18} />
          </span>
          <div className="relative flex min-h-[280px] flex-col justify-between sm:min-h-[360px]">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-white/24 px-3 py-1 text-[0.68rem] font-extrabold tracking-[0.2em] text-white uppercase backdrop-blur-[10px]">
                Featured Mix
              </span>
            </div>

            <div className="max-w-[320px]">
              <strong className="block text-[1.7rem] leading-[1.02] text-white drop-shadow-[0_10px_22px_rgba(79,35,124,0.28)] sm:text-[2.2rem]">
                Weekend Vibes
              </strong>
              <p className="mt-2 max-w-[24ch] text-sm leading-6 text-white/88 sm:text-base">
                A warm sunset mix for beach drives, golden hours, and soft late-night detours.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-semibold text-white/92 backdrop-blur-[10px]">
                  80 songs
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-semibold text-white/92 backdrop-blur-[10px]">
                  4h 23m
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-semibold text-white/92 backdrop-blur-[10px]">
                  Summer road trip
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/16 px-3 py-2 text-sm text-white/92 backdrop-blur-[10px]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffe27a]" />
                Trending now
              </div>
              <button
                type="button"
                onClick={() => {
                  const heroTrack = buildPlayableTrack({
                    title: 'Weekend Vibes',
                    artist: '80 songs',
                    tone: 'weekend-van',
                  })
                  void toggleTrack(heroTrack, featuredQueue)
                }}
                className="grid h-12 w-12 place-items-center rounded-full bg-white/92 text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)] transition duration-300 hover:scale-[1.08] sm:h-16 sm:w-16"
              >
                {isCurrentTrack(buildPlayableTrack({
                  title: 'Weekend Vibes',
                  artist: '80 songs',
                  tone: 'weekend-van',
                })) && isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
              </button>
            </div>
          </div>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection
        delay={0.17}
        className="relative grid items-center gap-4 overflow-hidden rounded-[24px] bg-linear-to-r from-[var(--route-accent)] via-[color-mix(in_srgb,var(--route-accent)_72%,var(--route-accent-strong))] to-[var(--route-accent-strong)] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),var(--route-chip-shadow)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(255,221,138,0.16),transparent_24%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.18),transparent_26%)]" />
        <div className="relative h-[82px] w-[82px]" aria-hidden="true">
          <div className="absolute -left-2 top-5 h-5 w-5 rounded-full bg-white/18 blur-[2px]" />
          <div className="absolute right-0 top-1 h-3 w-3 rounded-full bg-[#ffd86e]/90" />
          <div className="h-full w-full rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]" />
        </div>
        <div className="relative">
          <div className="mb-2 inline-flex rounded-full bg-white/16 px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.2em] text-white/92 uppercase backdrop-blur-[10px]">
            Discover Daily
          </div>
          <strong className="block text-[1.42rem] text-white sm:text-[1.56rem]">Organize. Discover. Enjoy.</strong>
          <p className="mt-1 text-white/84">Your perfect playlist is just a click away.</p>
        </div>
        <MotionButton
          onClick={() => {
            const firstTrack = featuredQueue[0]
            if (firstTrack) {
              void playTrack(firstTrack, featuredQueue)
            }
          }}
          className="relative w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_28px_rgba(102,69,182,0.2)] backdrop-blur-[10px] transition duration-300 hover:bg-white/24 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_18px_32px_rgba(102,69,182,0.28)] lg:w-auto"
        >
          Create New Playlist
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default PlaylistsPage
