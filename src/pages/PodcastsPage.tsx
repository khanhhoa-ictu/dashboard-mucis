import { motion } from 'motion/react'
import { getCoverArt } from '../assets/covers/coverArt'
import heroPodcasts from '../assets/illustrations/hero-podcasts-v2.webp'
import {
  AnimatedSection,
  BookIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  HeaderActions,
  HeartIcon,
  LeafIcon,
  MediaThumb,
  MoreIcon,
  MotionButton,
  PageDataFallback,
  PageHero,
  PlayIcon,
  SearchField,
  SearchIcon,
  SectionHeader,
  SunIcon,
  TiltCard,
} from '../components/ui'
import { usePodcastsData } from '../hooks'

const categoryClasses: Record<string, string> = {
  education: 'from-[#d8c9ff] to-[#b498ff]',
  crime: 'from-[#ffd9dd] to-[#ffb8c5]',
  comedy: 'from-[#ffe8a9] to-[#ffd26d]',
  health: 'from-[#d8efc1] to-[#b5d98b]',
  business: 'from-[#d4e7ff] to-[#9fc5ff]',
  stories: 'from-[#ddd5ff] to-[#c1b2ff]',
}

const panelClass =
  'rounded-[24px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]'

function PodcastsPage() {
  const { data } = usePodcastsData()

  if (!data) {
    return <PageDataFallback title="Loading podcasts" />
  }

  const { newEpisodes, podcastCategories, podcastContinue, savedShows, trendingShows } = data

  const categoryIconMap = {
    Education: GraduationCapIcon,
    'True Crime': SearchIcon,
    Comedy: SunIcon,
    Health: LeafIcon,
    Business: BriefcaseIcon,
    Stories: BookIcon,
  }

  const categoryCoverMap = {
    Education: 'study-desk',
    'True Crime': 'board',
    Comedy: 'summer-pool',
    Health: 'cozy-room',
    Business: 'mic-stage',
    Stories: 'dream-clouds',
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
          Podcasts
        </motion.h1>

        <SearchField placeholder="Search for podcasts, episodes..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <PageHero
          imageSrc={heroPodcasts}
          imageAlt="Mia recording a podcast"
          title="Stories. Ideas. Inspiration."
          description={<>Dive into conversations that<br />inform, inspire, and entertain.</>}
          buttonLabel="Explore Podcasts"
          imageFirstColsClassName="lg:grid-cols-[1.1fr_1fr]"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08} className={`${panelClass} grid gap-3 sm:gap-4`}>
        <SectionHeader title="Trending Shows" actionLabel="See All" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
          {trendingShows.map((show) => (
            <TiltCard key={show.title} as="article" className="relative grid gap-2.5 rounded-[20px] sm:gap-3 sm:rounded-[24px]">
              <MediaThumb
                src={getCoverArt(show.tone)}
                alt={show.title}
                className="relative aspect-[0.88] overflow-hidden rounded-[18px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[24px]"
              >
                <span className="absolute right-3 bottom-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#8f6aea] shadow-[0_12px_22px_rgba(180,162,220,0.28)]">
                  <PlayIcon size={16} />
                </span>
              </MediaThumb>
              <div>
                <strong className="block text-[0.98rem] leading-tight text-[#30294f] sm:text-[1.1rem]">{show.title}</strong>
                <span className="mt-0.5 block text-sm text-[#7d728e] sm:mt-1 sm:text-base">{show.category}</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.11} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1.08fr_1fr]">
        <article className={panelClass}>
          <SectionHeader title="Continue Listening" actionLabel="See All" />
          <div className="grid gap-3 sm:gap-4">
            {podcastContinue.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ x: 4, y: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="grid grid-cols-[52px_1fr_auto] items-center gap-2.5 rounded-[18px] px-1 py-1 sm:grid-cols-[60px_1fr_auto] sm:gap-4 sm:rounded-[20px] sm:px-2 sm:py-1.5"
              >
                <div className="h-[52px] w-[52px] overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[60px] sm:w-[60px] sm:rounded-[18px]">
                  <img src={getCoverArt(item.tone)} alt={item.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{item.title}</strong>
                  <span className="block text-xs text-[#7d728e] sm:text-base">{item.show}</span>
                  <div className="mt-1.5 flex items-center gap-2 sm:mt-2 sm:gap-3">
                    <span className="text-xs text-[#7d728e] sm:text-sm">{item.remaining}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-[#ece4f8]">
                      <div className="h-1.5 rounded-full bg-linear-to-r from-[#b68eff] to-[#8f6aea]" style={{ width: item.progress }} />
                    </div>
                  </div>
                </div>
                <button type="button" className="grid h-[44px] w-[44px] place-items-center rounded-full bg-white text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.26)]">
                  <PlayIcon size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </article>

        <article className={panelClass}>
          <SectionHeader title="Categories" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {podcastCategories.map((item) => (
              <TiltCard
                key={item.name}
                as="article"
                className="relative grid min-h-[108px] place-items-center overflow-hidden rounded-[20px] text-center shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:min-h-[120px] sm:rounded-[24px]"
              >
                <img
                  src={getCoverArt(categoryCoverMap[item.name as keyof typeof categoryCoverMap] ?? 'dream-clouds')}
                  alt={item.name}
                  className="artwork-media absolute inset-0 h-full w-full object-cover"
                />
                <div className={`absolute inset-0 bg-linear-to-br opacity-78 ${categoryClasses[item.tone]}`} />
                <div className="relative">
                  <div className="mb-3 text-[#6e57bf]">
                    {(() => {
                      const Icon = categoryIconMap[item.name as keyof typeof categoryIconMap]
                      return Icon ? <Icon size={28} /> : item.icon
                    })()}
                  </div>
                  <strong className="block text-[0.95rem] text-[#30294f] sm:text-[1.05rem]">{item.name}</strong>
                </div>
              </TiltCard>
            ))}
          </div>
        </article>
      </AnimatedSection>

      <AnimatedSection delay={0.14} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.9fr_1.02fr_0.95fr]">
        <article className={panelClass}>
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Saved Shows</h3>
            <button type="button" className="rounded-full bg-white px-[14px] py-2 text-[#736885] shadow-[0_10px_18px_rgba(223,208,235,0.26)]">See All</button>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {savedShows.map((show) => (
              <motion.div key={show.title} whileHover={{ x: 4 }} className="grid grid-cols-[46px_1fr_auto] items-center gap-2.5 sm:grid-cols-[54px_1fr_auto] sm:gap-3">
                <div className="h-[46px] w-[46px] overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[54px] sm:w-[54px] sm:rounded-[16px]">
                  <img src={getCoverArt(show.tone)} alt={show.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{show.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{show.episodes}</span>
                </div>
                <span className="text-[#8f7eb4]"><MoreIcon size={18} /></span>
              </motion.div>
            ))}
          </div>
        </article>

        <article className={panelClass}>
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">New Episodes</h3>
            <button type="button" className="rounded-full bg-white px-[14px] py-2 text-[#736885] shadow-[0_10px_18px_rgba(223,208,235,0.26)]">See All</button>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {newEpisodes.map((episode) => (
              <motion.div key={episode.title} whileHover={{ x: 4 }} className="grid grid-cols-[46px_1fr_auto] items-center gap-2.5 sm:grid-cols-[54px_1fr_auto] sm:gap-3">
                <div className="h-[46px] w-[46px] overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[54px] sm:w-[54px] sm:rounded-[16px]">
                  <img src={getCoverArt(episode.tone)} alt={episode.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{episode.title}</strong>
                  <span className="block text-xs text-[#7d728e] sm:text-base">{episode.show}</span>
                  <span className="text-xs text-[#a193bb] sm:text-sm">{episode.time}</span>
                </div>
                <button type="button" className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.26)]">
                  <PlayIcon size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </article>

        <TiltCard as="article" className={`${panelClass} relative`}>
          <h3 className="mb-4 text-[1.2rem] font-extrabold text-[#30294f]">Featured Podcast</h3>
          <div className="relative mb-4 aspect-[1.16] overflow-hidden rounded-[20px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.22)] sm:rounded-[24px]">
            <img src={getCoverArt('mic-stage')} alt="Voices Unfiltered" className="artwork-media h-full w-full object-cover" />
            <span className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/88 text-[#ff7ea2]"><HeartIcon size={18} /></span>
          </div>
          <strong className="block text-[1.18rem] text-[#30294f]">Voices Unfiltered</strong>
          <p className="mt-1 text-[#7d728e]">Real stories. Raw conversations.</p>
          <div className="mt-3 flex items-center justify-between text-sm text-[#7d728e]">
            <span>8.2K followers</span>
            <span><MoreIcon size={18} /></span>
          </div>
          <MotionButton className="mt-5 w-full rounded-full bg-linear-to-r from-[#b98eff] to-[#9872ef] px-5 py-3 font-extrabold text-white shadow-[0_14px_24px_rgba(157,115,239,0.24)]">
            Listen Now
          </MotionButton>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection delay={0.17} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[#b98eff] to-[#9872ef] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_35px_rgba(157,115,239,0.24)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left">
        <div className="relative h-[82px] w-[82px]" aria-hidden="true">
          <div className="h-full w-full rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]" />
        </div>
        <div>
          <strong className="block text-[1.42rem] text-white">Discover amazing podcasts</strong>
          <p className="mt-1 text-white/84">Find your next favorite show.</p>
        </div>
        <MotionButton className="w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] lg:w-auto">
          Browse All Podcasts
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default PodcastsPage
