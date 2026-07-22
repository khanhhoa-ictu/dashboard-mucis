import { motion } from 'motion/react'
import heroDashboard from '../assets/illustrations/hero-dashboard.webp'
import { getCoverArt } from '../assets/covers/coverArt'
import {
  AnimatedSection,
  ClockIcon,
  HeaderActions,
  HeartIcon,
  MotionButton,
  MusicNoteIcon,
  PageDataFallback,
  Panel,
  PlayIcon,
  SearchField,
  SectionHeader,
  SparklesIcon,
  TiltCard,
} from '../components/ui'
import { useOverviewData } from '../hooks'

const statIconClasses: Record<string, string> = {
  violet: 'from-violet-400 to-violet-500',
  pink: 'from-pink-300 to-rose-400',
  gold: 'from-amber-300 to-yellow-400',
  sky: 'from-sky-300 to-blue-400',
}

function DashboardOverview() {
  const { data } = useOverviewData()

  if (!data) {
    return <PageDataFallback title="Loading dashboard overview" />
  }

  const { genres, recentTracks, stats } = data

  return (
    <>
      <AnimatedSection as="header" className="grid items-center gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[1.95rem] leading-none font-extrabold text-[#30294f] sm:text-[2.35rem]"
        >
          Dashboard
        </motion.h1>

        <SearchField placeholder="Search for songs, artists..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05} className="grid items-center gap-4 rounded-[24px] border border-white/70 bg-linear-to-br from-[#d2c0ff] via-[#b999ff] to-[#c8b4ff] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:gap-[18px] sm:rounded-[28px] sm:px-6 sm:py-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-[24px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
          <img src={heroDashboard} alt="Mia listening to music" className="artwork-media h-[220px] w-full object-cover sm:h-[280px]" />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="text-[1.65rem] font-extrabold text-[#433663] sm:text-[2rem]">Good Morning, Mia!</h2>
          <p className="mt-2.5 mb-[18px] text-[0.98rem] text-[#5e5178] sm:text-[1.06rem]">
            Let&apos;s enjoy some music today!
          </p>
          <MotionButton
            className="w-full rounded-full bg-linear-to-br from-[#a77cfb] to-[#8d67eb] px-6 py-3.5 font-extrabold text-white shadow-[0_14px_26px_rgba(141,103,235,0.28)] sm:w-auto"
          >
            Play Something
          </MotionButton>
        </div>

      </AnimatedSection>

      <AnimatedSection delay={0.08} className="grid gap-3 sm:gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <TiltCard
            key={item.title}
            as="article"
            className="relative rounded-[24px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-5"
          >
            <span
              className={`mb-[14px] inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-linear-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ${statIconClasses[item.tone]}`}
            >
              {item.icon === 'N' ? <MusicNoteIcon size={20} /> : item.icon === 'H' ? <HeartIcon size={20} /> : item.icon === 'C' ? <ClockIcon size={20} /> : <SparklesIcon size={20} />}
            </span>
            <p className="text-[0.96rem] text-[#6b5f82]">{item.title}</p>
            <strong className="mt-2 mb-1 block text-[1.8rem] font-extrabold text-[#30294f] sm:text-[2.1rem]">
              {item.value}
            </strong>
            <span className="text-[0.92rem] font-bold text-[#3ca969]">{item.note}</span>
          </TiltCard>
        ))}
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1.2fr_0.9fr]">
        <TiltCard as="article" className="relative rounded-[24px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-[18px]">
            <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Listening Overview</h3>
            <button
              type="button"
              className="rounded-full bg-white px-[14px] py-2 text-[#736885] shadow-[0_10px_18px_rgba(223,208,235,0.26)]"
            >
              This Week
            </button>
          </div>

          <div className="grid min-h-[190px] grid-cols-7 items-end gap-2 px-1 pt-3 pb-1 sm:min-h-[230px] sm:gap-[14px] sm:px-3 sm:pt-[18px] sm:pb-1.5">
            {[
              ['Mon', '58%', 'from-violet-300 to-violet-500'],
              ['Tue', '82%', 'from-pink-200 to-pink-400'],
              ['Wed', '64%', 'from-orange-200 to-orange-400'],
              ['Thu', '88%', 'from-yellow-200 to-amber-400'],
              ['Fri', '60%', 'from-lime-200 to-lime-400'],
              ['Sat', '84%', 'from-sky-200 to-sky-400'],
              ['Sun', '68%', 'from-purple-200 to-violet-400'],
            ].map(([day, height, colors]) => (
              <div key={day} className="grid justify-items-center gap-2">
                <span
                  className={`block w-4 rounded-full bg-linear-to-b shadow-[inset_0_8px_12px_rgba(255,255,255,0.32)] sm:w-6 ${colors}`}
                  style={{ height }}
                />
                <small className="text-[0.72rem] text-[#7c718d] sm:text-[0.84rem]">{day}</small>
              </div>
            ))}
          </div>
        </TiltCard>

        <Panel>
          <SectionHeader title="Top Genres" />

          <div className="grid items-center gap-4 sm:gap-[18px] sm:grid-cols-[160px_1fr]">
            <div
              className="relative mx-auto h-40 w-40 rounded-full shadow-[inset_0_8px_14px_rgba(255,255,255,0.4)]"
              style={{
                background:
                  'conic-gradient(#a482f4 0 45%, #f39bbc 45% 70%, #ffd46d 70% 85%, #89cb76 85% 95%, #8ec5ff 95% 100%)',
              }}
            >
              <div className="absolute inset-8 rounded-full bg-linear-to-b from-[#fff9f8] to-[#fff0ee]" />
            </div>

            <ul className="grid gap-3">
              {genres.map((genre) => (
                <li
                  key={genre.name}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[#54496e]"
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: genre.color }} />
                  <span>{genre.name}</span>
                  <strong className="text-[#2e2944]">{genre.share}</strong>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </AnimatedSection>

      <AnimatedSection delay={0.12} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1fr_0.92fr]">
        <Panel>
          <SectionHeader title="Recently Played" actionLabel="See All" />

          <div className="grid gap-3 sm:gap-[14px]">
            {recentTracks.map((track) => (
              <div key={track.title} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 sm:grid-cols-[64px_1fr_auto] sm:gap-[14px]">
                <div
                  className="h-[52px] w-[52px] overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-16 sm:w-16 sm:rounded-[18px]"
                >
                  <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-[1rem] text-[#30294f] sm:text-[1.08rem]">{track.title}</strong>
                  <span className="mt-0.5 block text-sm text-[#7d728e] sm:mt-1 sm:text-base">{track.artist}</span>
                </div>
                <button
                  type="button"
                  className="h-[42px] w-[42px] rounded-full bg-white font-extrabold text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.26)]"
                >
                  <PlayIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title="Daily Mix" actionLabel="See All" />

          <div className="relative mb-[14px] overflow-hidden rounded-[22px]">
            <img src={getCoverArt('room')} alt="Daily mix artwork" className="artwork-media h-[180px] w-full object-cover sm:h-[220px]" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <strong className="text-[1.08rem] text-[#30294f]">Chill Vibes</strong>
              <span className="mt-1 block text-[#7d728e]">80 songs</span>
            </div>
            <button
              type="button"
              className="h-[42px] w-[42px] rounded-full bg-white font-extrabold text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.26)]"
            >
              <PlayIcon size={16} />
            </button>
          </div>
        </Panel>
      </AnimatedSection>

      <AnimatedSection delay={0.15} className="grid items-center gap-4 rounded-[24px] bg-linear-to-br from-[#b684ff] to-[#9d73ef] px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_18px_35px_rgba(157,115,239,0.24)] sm:gap-5 sm:rounded-[28px] sm:px-6 sm:py-[18px] md:grid-cols-[auto_1fr_auto] md:text-left">
        <div
          className="relative h-[76px] w-[76px] rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]"
          aria-hidden="true"
        >
          <span className="absolute inset-[24px_21px_20px] rounded-full bg-[radial-gradient(circle_at_30%_46%,#4d2f59_0_3px,transparent_4px),radial-gradient(circle_at_70%_46%,#4d2f59_0_3px,transparent_4px),radial-gradient(circle_at_50%_72%,#4d2f59_0_5px,transparent_6px)]" />
        </div>

        <div>
          <strong className="block text-[1.42rem] text-white">Discover new music</strong>
          <p className="mt-1 text-white/84">Play songs we think you&apos;ll love</p>
        </div>

        <MotionButton
          className="w-full rounded-full bg-linear-to-br from-[#b88fff] to-[#8e67eb] px-6 py-3.5 font-extrabold text-white shadow-[0_14px_26px_rgba(141,103,235,0.28)] md:w-auto"
        >
          Explore Now
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default DashboardOverview
