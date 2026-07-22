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
import { usePlaylistsData } from '../hooks'

const moodClasses: Record<string, string> = {
  happy: 'from-[#ffe59e] to-[#ffd36d]',
  chill: 'from-[#dbe6ff] to-[#b8ccff]',
  energetic: 'from-[#ffd7d4] to-[#ffc1b7]',
  romantic: 'from-[#ffd2df] to-[#ffb6cb]',
  'focus-book': 'from-[#e3efc9] to-[#c6de95]',
  'sleep-night': 'from-[#ddd5ff] to-[#b8a4ff]',
}

const panelClass =
  'rounded-[24px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]'

function PlaylistsPage() {
  const { data } = usePlaylistsData()

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
            <TiltCard key={playlist.title} as="article" className="relative grid gap-2.5 rounded-[20px] sm:gap-3 sm:rounded-[24px]">
              <MediaThumb
                src={getCoverArt(playlist.tone)}
                alt={playlist.title}
                className="relative aspect-[0.92] overflow-hidden rounded-[18px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[24px]"
              >
                <span className="absolute right-3 bottom-3 grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[#8f6aea] shadow-[0_12px_22px_rgba(180,162,220,0.28)]">
                  <PlayIcon size={16} />
                </span>
              </MediaThumb>
              <div>
                <strong className="block text-[0.98rem] leading-tight text-[#30294f] sm:text-[1.1rem]">{playlist.title}</strong>
                <span className="mt-0.5 block text-sm text-[#7d728e] sm:mt-1 sm:text-base">{playlist.songs}</span>
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
              <motion.div key={playlist.title} whileHover={{ x: 4 }} className="grid grid-cols-[48px_1fr_auto] items-center gap-2.5 rounded-[16px] px-1 py-1 sm:grid-cols-[56px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-2 sm:py-1.5">
                <div className="relative h-12 w-12 overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[56px] sm:w-[56px] sm:rounded-[16px]">
                  <img src={getCoverArt(playlist.tone)} alt={playlist.title} className="artwork-media h-full w-full object-cover" />
                  {playlist.favorite && (
                    <span className="absolute right-[-4px] top-[-4px] grid h-6 w-6 place-items-center rounded-full bg-[#b28cf9] text-xs text-white">
                      <HeartIcon size={14} />
                    </span>
                  )}
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{playlist.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{playlist.songs}</span>
                </div>
                <span className="text-[#8e81a8]"><MoreIcon size={18} /></span>
              </motion.div>
            ))}
            <motion.div whileHover={{ x: 4 }} className="grid grid-cols-[48px_1fr_auto] items-center gap-2.5 rounded-[16px] px-1 py-1 sm:grid-cols-[56px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-2 sm:py-1.5">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#eee4ff] text-2xl text-[#8f6aea] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[56px] sm:w-[56px] sm:rounded-[16px]">
                <PlusIcon size={20} />
              </div>
              <div>
                <strong className="block text-sm text-[#30294f] sm:text-base">Create New Playlist</strong>
                <span className="text-xs text-[#7d728e] sm:text-base">Build your perfect playlist</span>
              </div>
              <span className="text-[#8f6aea]"><ChevronRightIcon size={18} /></span>
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
                className={`relative grid min-h-[124px] place-items-center rounded-[20px] bg-linear-to-br text-center shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:min-h-[150px] sm:rounded-[24px] ${moodClasses[item.tone]}`}
              >
                <div>
                  <div className="mb-3 text-[#7f67d8]">
                    {(() => {
                      const Icon = moodIconMap[item.name as keyof typeof moodIconMap]
                      return Icon ? <Icon size={30} /> : item.icon
                    })()}
                  </div>
                  <strong className="block text-[0.98rem] text-[#30294f] sm:text-[1.08rem]">{item.name}</strong>
                  <span className="mt-0.5 block text-sm text-[#6f6387] sm:mt-1 sm:text-base">{item.playlists}</span>
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
              <motion.div key={playlist.title} whileHover={{ x: 4 }} className="grid grid-cols-[48px_1fr_auto] items-center gap-2.5 sm:grid-cols-[56px_1fr_auto] sm:gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[56px] sm:w-[56px] sm:rounded-[16px]">
                  <img src={getCoverArt(playlist.tone)} alt={playlist.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{playlist.title}</strong>
                  <span className="block text-xs text-[#7d728e] sm:text-base">{playlist.friends}</span>
                </div>
                <button type="button" className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.26)]">
                  <PlayIcon size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </article>

        <TiltCard as="article" className="relative overflow-hidden rounded-[24px] border border-white/72 bg-linear-to-br from-[#d38ecd] via-[#f7a5bf] to-[#ffcf7d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]">
          <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#ff7ea2]"><HeartIcon size={18} /></span>
          <div className="mb-4 aspect-[1.8] overflow-hidden rounded-[24px]">
            <img src={getCoverArt('weekend-van')} alt="Weekend Vibes cover" className="artwork-media h-full w-full object-cover" />
          </div>
          <strong className="block text-[1.6rem] text-white sm:text-[2rem]">Weekend Vibes</strong>
          <p className="mt-2 text-white/90">80 songs . 4h 23m</p>
          <div className="mt-5 flex justify-end">
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white/92 text-[#8f6aea] shadow-[0_14px_24px_rgba(157,115,239,0.24)] sm:h-16 sm:w-16">
              <PlayIcon size={20} />
            </button>
          </div>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection delay={0.17} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[#b98eff] to-[#9872ef] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_35px_rgba(157,115,239,0.24)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left">
        <div className="relative h-[82px] w-[82px]" aria-hidden="true">
          <div className="h-full w-full rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]" />
        </div>
        <div>
          <strong className="block text-[1.42rem] text-white">Organize. Discover. Enjoy.</strong>
          <p className="mt-1 text-white/84">Your perfect playlist is just a click away.</p>
        </div>
        <MotionButton className="w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] lg:w-auto">
          Create New Playlist
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default PlaylistsPage
