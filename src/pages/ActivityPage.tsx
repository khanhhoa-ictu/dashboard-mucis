import { motion } from 'motion/react'
import { getCoverArt } from '../assets/covers/coverArt'
import heroActivityWide from '../assets/illustrations/hero-activity-wide-v2.webp'
import heroActivity from '../assets/illustrations/hero-activity-v3.webp'
import {
  AnimatedSection,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  HeaderActions,
  MoreIcon,
  MotionButton,
  MusicNoteIcon,
  PageDataFallback,
  Panel,
  PlayIcon,
  SearchField,
  SectionHeader,
  SparklesIcon,
  TiltCard,
  TrophyIcon,
  panelClass,
} from '../components/ui'
import { useActivityData } from '../hooks'

const statClasses: Record<string, string> = {
  violet: 'from-violet-200 to-violet-50',
  pink: 'from-pink-200 to-rose-50',
  gold: 'from-amber-200 to-yellow-50',
  sky: 'from-sky-200 to-blue-50',
}

const friendClasses: Record<string, string> = {
  violet: 'from-violet-400 to-violet-500',
  pink: 'from-pink-300 to-rose-400',
  gold: 'from-amber-300 to-yellow-400',
  sky: 'from-sky-300 to-blue-400',
}

function ActivityPage() {
  const { data } = useActivityData()

  if (!data) {
    return <PageDataFallback title="Loading activity" />
  }

  const { activityRecent, activityStats, friendsListening, genres, milestones } = data

  return (
    <>
      <AnimatedSection as="header" className="grid items-center gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[1.95rem] leading-none font-extrabold text-[#30294f] sm:text-[2.35rem]"
        >
          Activity
        </motion.h1>

        <SearchField placeholder="Search for songs, artists, or albums..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05} className="grid items-center gap-4 rounded-[24px] border border-white/70 bg-linear-to-br from-[color-mix(in_srgb,var(--route-accent-soft)_82%,white)] via-[color-mix(in_srgb,var(--route-accent)_62%,white)] to-[color-mix(in_srgb,var(--route-accent-strong)_48%,white)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),var(--route-chip-shadow)] sm:gap-6 sm:rounded-[28px] sm:px-6 sm:py-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[24px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
          <img src={heroActivityWide} alt="Mia enjoying music with coffee" className="artwork-media h-[220px] w-full object-cover sm:h-[280px]" />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="text-[1.65rem] leading-tight font-extrabold text-[#2f2961] sm:text-[2rem]">
            Every song tells a story
          </h2>
          <p className="mt-3 mb-6 text-[0.98rem] text-[#5e5178] sm:text-[1.06rem]">
            Track your listening, celebrate
            <br />
            your moments, and keep the
            <br />
            music alive.
          </p>
          <MotionButton className="w-full rounded-full bg-linear-to-br from-[var(--route-accent)] to-[var(--route-accent-strong)] px-6 py-3.5 font-extrabold text-white shadow-[var(--route-chip-shadow)] sm:w-auto">
            View Your Highlights
          </MotionButton>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.08} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1.3fr_0.9fr]">
        <article className={panelClass}>
          <SectionHeader title="Weekly Stats" actionLabel="This Week" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {activityStats.map((item) => (
              <TiltCard
                key={item.title}
                as="article"
                className={`relative rounded-[20px] bg-linear-to-b p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:rounded-[24px] sm:p-5 ${statClasses[item.tone]}`}
              >
                <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/65 font-extrabold text-[var(--route-accent-strong)]">
                  {item.icon === 'N' ? <MusicNoteIcon size={20} /> : item.icon === 'M' ? <MusicNoteIcon size={20} /> : item.icon === 'C' ? <ClockIcon size={20} /> : <SparklesIcon size={20} />}
                </span>
                <p className="text-[#6b5f82]">{item.title}</p>
                <strong className="mt-2 block text-[1.6rem] font-extrabold text-[#30294f] sm:text-[2rem]">{item.value}</strong>
                <span className="mt-1 block text-[0.92rem] font-bold text-[#2f9f64]">{item.note}</span>
              </TiltCard>
            ))}
          </div>
        </article>

        <Panel>
          <SectionHeader title="Friends Listening" actionLabel="See All" />
          <div className="grid gap-3 sm:gap-4">
            {friendsListening.map((friend) => (
              <motion.div key={friend.name} whileHover={{ x: 4 }} className="grid grid-cols-[46px_1fr_auto] items-center gap-2.5 sm:grid-cols-[54px_1fr_auto] sm:gap-3">
                <div className={`h-[46px] w-[46px] rounded-full bg-linear-to-br ${friendClasses[friend.tone]} shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[54px] sm:w-[54px]`} />
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{friend.name}</strong>
                  <span className="block text-xs text-[#7d728e] sm:text-base">Listening to</span>
                  <span className="text-xs text-[#54496e] sm:text-base">{friend.track}</span>
                </div>
                <div className="justify-self-end text-right">
                  <span className="mb-2 block text-sm text-[#8e81a8]">{friend.time}</span>
                  <div className="flex items-end gap-1">
                    {friend.bars.map((bar, index) => (
                      <span key={index} className={`w-1.5 rounded-full bg-linear-to-t ${friendClasses[friend.tone]} ${bar}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </AnimatedSection>

      <AnimatedSection delay={0.11} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
        <article className={panelClass}>
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Top Genres</h3>
            <button type="button" className="rounded-full bg-white px-[14px] py-2 text-[#736885] shadow-[0_10px_18px_rgba(223,208,235,0.26)]">This Week</button>
          </div>
          <div className="grid items-center gap-4 sm:gap-[18px] sm:grid-cols-[160px_1fr] xl:grid-cols-1">
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
                <li key={genre.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[#54496e]">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: genre.color }} />
                  <span>{genre.name}</span>
                  <strong className="text-[#2e2944]">{genre.share}</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className={panelClass}>
          <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Milestones</h3>
          <div className="grid gap-3 sm:gap-4">
            {milestones.map((item) => (
              <motion.div key={item.title} whileHover={{ x: 4 }} className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[16px] bg-white/55 px-2.5 py-2.5 sm:grid-cols-[42px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-3 sm:py-3">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-[#fff1d7] font-extrabold text-[#f0ac3d]">
                  {item.icon === 'F' ? <FlameIcon size={20} /> : item.icon === 'S' ? <SparklesIcon size={20} /> : item.icon === 'N' ? <MusicNoteIcon size={20} /> : <TrophyIcon size={20} />}
                </span>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{item.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{item.note}</span>
                </div>
                <span className={`rounded-full px-2 py-1 text-sm font-bold ${item.status === 'top10' ? 'bg-[var(--route-chip-bg)] text-[var(--route-accent-strong)]' : 'bg-[#ecffe9] text-[#4d9b54]'}`}>
                  {item.status === 'top10' ? 'Top 10' : 'Done'}
                </span>
              </motion.div>
            ))}
          </div>
        </article>

        <TiltCard as="article" className="relative rounded-[24px] bg-linear-to-br from-[var(--route-accent)] via-[color-mix(in_srgb,var(--route-accent)_72%,var(--route-accent-strong))] to-[var(--route-accent-strong)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),var(--route-chip-shadow)] sm:rounded-[28px] sm:p-[18px]">
          <h3 className="text-[1.6rem] font-extrabold sm:text-[2rem]">Your Highlights</h3>
          <strong className="mt-4 block text-[1.7rem] sm:text-[2rem]">Top Listener</strong>
          <p className="mt-2 text-white/84">You&apos;re in the top 10% of listeners this month!</p>
          <div className="my-6 overflow-hidden rounded-[24px]">
            <img src={heroActivity} alt="Activity highlight artwork" className="artwork-media h-[220px] w-full object-cover sm:h-[260px]" />
          </div>
          <MotionButton className="w-full rounded-full bg-white/18 px-5 py-3 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            Share Your Achievement
          </MotionButton>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection delay={0.14} className={panelClass}>
        <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Recently Played</h3>
        <div className="grid gap-3 sm:gap-4">
            {activityRecent.map((track) => (
            <motion.div key={track.title} whileHover={{ x: 4 }} className="grid grid-cols-[58px_46px_1fr_auto] items-center gap-2.5 sm:grid-cols-[72px_54px_1fr_auto_auto] sm:gap-3">
              <div className="relative pr-3 text-xs text-[#7d728e] sm:pr-4 sm:text-sm">
                <span>{track.time}</span>
                <span className="absolute top-[-8px] right-0 bottom-[-8px] w-px bg-[#d2c6ef]" />
                <span className="absolute top-1/2 right-[-5px] h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#9d7ceb]" />
              </div>
              <div className="h-[46px] w-[46px] overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[54px] sm:w-[54px] sm:rounded-[16px]">
                <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
              </div>
              <div>
                <strong className="block text-sm text-[#30294f] sm:text-base">{track.title}</strong>
                <span className="text-xs text-[#7d728e] sm:text-base">{track.artist}</span>
              </div>
              <button type="button" className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)]">
                <PlayIcon size={16} />
              </button>
              <span className="hidden text-[#8e81a8] sm:inline"><MoreIcon size={16} /></span>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.17} className={`${panelClass} grid items-center gap-4 lg:grid-cols-[1.1fr_0.95fr]`}>
        <div>
          <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Listening Streak</h3>
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff0d8] text-[#f1a544]"><FlameIcon size={24} /></span>
              <div>
                <strong className="block text-[1.7rem] text-[#30294f] sm:text-[2rem]">7</strong>
                <span className="text-[#7d728e]">days in a row!</span>
              </div>
            </div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="grid justify-items-center gap-2">
                <span className={`grid h-10 w-10 place-items-center rounded-full font-extrabold sm:h-12 sm:w-12 ${index < 6 ? 'bg-[#ad8bf9] text-white' : 'border-4 border-[#efb8c5] text-[#efb8c5]'}`}>
                  {index < 6 ? <CheckIcon size={18} /> : ''}
                </span>
                <small className="text-[#7d728e]">{day}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] bg-linear-to-r from-[#ffe1da] to-[#fff4ef] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <strong className="block text-[#30294f]">Next Reward</strong>
          <p className="mt-2 text-[1.3rem] font-extrabold text-[#30294f]">10-Day Streak</p>
          <span className="block text-[#7d728e]">Special Badge</span>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[var(--route-accent)] to-[var(--route-accent-strong)] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),var(--route-chip-shadow)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left">
        <div className="relative h-[82px] w-[82px]" aria-hidden="true">
          <div className="h-full w-full rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]" />
        </div>
        <div>
          <strong className="block text-[1.42rem] text-white">Keep the music playing, Mia!</strong>
          <p className="mt-1 text-white/84">Small moments, big vibes.</p>
        </div>
        <MotionButton className="w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] lg:w-auto">
          Explore More
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default ActivityPage
