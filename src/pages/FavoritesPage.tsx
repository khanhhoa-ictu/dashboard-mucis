import { motion } from 'motion/react'
import { getCoverArt } from '../assets/covers/coverArt'
import heroFavorites from '../assets/illustrations/hero-favorites-v2.webp'
import {
  AnimatedSection,
  CloudIcon,
  HeaderActions,
  HeartIcon,
  MotionButton,
  MoonIcon,
  PageDataFallback,
  PageHero,
  SearchField,
  SectionHeader,
  SparklesIcon,
  SunIcon,
  TiltCard,
} from '../components/ui'
import { useFavoritesData } from '../hooks'

const moodCardClasses: Record<string, string> = {
  chill: 'from-violet-300 to-violet-500',
  romance: 'from-pink-200 to-rose-400',
  happy: 'from-amber-200 to-yellow-400',
  sleep: 'from-sky-200 to-indigo-300',
  focus: 'from-lime-200 to-green-300',
}

const moodIconMap: Record<string, typeof HeartIcon> = {
  Chill: CloudIcon,
  Romance: HeartIcon,
  Happy: SunIcon,
  Sleep: MoonIcon,
  Focus: SparklesIcon,
}

const moodCoverMap: Record<string, string> = {
  Chill: 'dream-clouds',
  Romance: 'heart-balloon',
  Happy: 'summer-pool',
  Sleep: 'moon-river',
  Focus: 'study-desk',
}

const panelClass =
  'rounded-[24px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]'

function FavoritesPage() {
  const { data } = useFavoritesData()

  if (!data) {
    return <PageDataFallback title="Loading favorites" />
  }

  const { favoriteArtists, likedSongs, lovedAlbums, moodPicks, recentlyLoved } = data

  return (
    <>
      <AnimatedSection as="header" className="grid items-center gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[1.95rem] leading-none font-extrabold text-[#30294f] sm:text-[2.35rem]"
        >
          Favorites
        </motion.h1>

        <SearchField placeholder="Search for songs, artists, or albums..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <PageHero
          imageSrc={heroFavorites}
          imageAlt="Mia hugging a heart"
          title={<>Your favorites,<br />all in one place</>}
          description={<>The songs, albums and artists<br />you love the most.</>}
          buttonLabel="Play Your Favorites"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.08} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.95fr_1.45fr]">
        <article className={panelClass}>
          <SectionHeader title="Liked Songs" actionLabel="See All" />
          <div className="grid gap-3 sm:gap-4">
            {likedSongs.map((track) => (
              <motion.div
                key={track.title}
                whileHover={{ x: 4, y: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="grid grid-cols-[52px_1fr_auto] items-center gap-2.5 rounded-[18px] px-1 py-1 sm:grid-cols-[64px_1fr_auto_auto] sm:gap-3 sm:rounded-[20px] sm:px-2 sm:py-1.5"
              >
                <div className="h-[52px] w-[52px] overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-16 sm:w-16 sm:rounded-[18px]">
                  <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{track.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{track.artist}</span>
                </div>
                <span className="hidden text-[#6f6387] sm:inline">{track.duration}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff0f6] text-[#ff7ea2] shadow-[0_10px_18px_rgba(248,183,207,0.24)]">
                  <HeartIcon size={17} />
                </span>
              </motion.div>
            ))}
          </div>
          <MotionButton
            className="mt-6 rounded-full bg-[#fff1f6] px-5 py-3 font-bold text-[#8d67eb] shadow-[0_10px_18px_rgba(223,208,235,0.2)]"
          >
            View All Liked Songs
          </MotionButton>
        </article>

        <div className="grid gap-[18px]">
          <article className={panelClass}>
            <SectionHeader title="Loved Albums" actionLabel="See All" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
              {lovedAlbums.map((album) => (
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
          </article>

          <article className={panelClass}>
            <SectionHeader title="Mood Picks" actionLabel="See All" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {moodPicks.map((mood) => (
                <TiltCard
                  key={mood.name}
                  as="article"
                  className="relative grid gap-2.5 rounded-[20px] text-center sm:gap-3 sm:rounded-[24px]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[20px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:rounded-[24px]">
                    <img
                      src={getCoverArt(moodCoverMap[mood.name] ?? 'dream-clouds')}
                      alt={mood.name}
                      className="artwork-media h-full w-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-linear-to-br opacity-70 ${moodCardClasses[mood.tone]}`} />
                    <div className="absolute inset-0 grid place-items-center text-2xl font-extrabold text-white">
                    {(() => {
                      const Icon = moodIconMap[mood.name] ?? SparklesIcon
                      return <Icon size={30} />
                    })()}
                    </div>
                  </div>
                  <div>
                    <strong className="block text-[#30294f]">{mood.name}</strong>
                    <span className="text-[#7d728e]">{mood.songs}</span>
                  </div>
                </TiltCard>
              ))}
            </div>
          </article>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.11} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.95fr_1.45fr]">
        <article className={panelClass}>
          <SectionHeader title="Favorite Artists" actionLabel="See All" />
          <div className="grid gap-3 sm:gap-4">
            {favoriteArtists.map((artist) => (
              <motion.div
                key={artist.name}
                whileHover={{ x: 4, y: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-[16px] px-1 py-1 sm:grid-cols-[52px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-2 sm:py-1.5"
              >
                <div className="h-11 w-11 overflow-hidden rounded-full shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[52px] sm:w-[52px]">
                  <img src={getCoverArt(artist.tone)} alt={artist.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{artist.name}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{artist.songs}</span>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff0f6] text-[#ff7ea2] shadow-[0_10px_18px_rgba(248,183,207,0.24)]">
                  <HeartIcon size={17} />
                </span>
              </motion.div>
            ))}
          </div>
        </article>

        <TiltCard as="article" className="relative rounded-[24px] border border-white/72 bg-linear-to-br from-[#d9c9ff] via-[#cfb8ff] to-[#c9b7ff] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[24px]">
          <div className="grid items-center gap-4 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h3 className="text-[1.6rem] leading-tight font-extrabold text-[#2f2961] sm:text-[2rem]">
                Your Heart Mix
              </h3>
              <p className="mt-3 mb-6 text-[0.98rem] text-[#5e5178] sm:text-[1.06rem]">
                A cozy mix of all your
                <br />
                favorite vibes
              </p>
              <MotionButton
                className="w-full rounded-full bg-linear-to-br from-[#a77cfb] to-[#8d67eb] px-6 py-3.5 font-extrabold text-white shadow-[0_14px_26px_rgba(141,103,235,0.28)] sm:w-auto"
              >
                Play Mix
              </MotionButton>
            </div>

            <div className="overflow-hidden rounded-[24px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <img src={heroFavorites} alt="Heart mix artwork" className="artwork-media h-[200px] w-full object-cover sm:min-h-[220px]" />
            </div>
          </div>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection delay={0.14} className={panelClass}>
        <SectionHeader title="Recently Loved" actionLabel="See All" />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {recentlyLoved.map((track) => (
            <motion.div
              key={track.title}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-[16px] bg-white/50 px-2 py-2 sm:grid-cols-[52px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-3"
            >
              <div className="h-11 w-11 overflow-hidden rounded-[14px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.26)] sm:h-[52px] sm:w-[52px] sm:rounded-[16px]">
                <img src={getCoverArt(track.tone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
              </div>
              <div>
                <strong className="block text-sm text-[#30294f] sm:text-base">{track.title}</strong>
                <span className="text-xs text-[#7d728e] sm:text-base">{track.artist}</span>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f3ecff] text-[#a482f4] shadow-[0_10px_18px_rgba(191,177,230,0.24)]">
                <HeartIcon size={17} />
              </span>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.17} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[#b98eff] to-[#9872ef] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_35px_rgba(157,115,239,0.24)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left">
        <div className="relative h-[82px] w-[82px]" aria-hidden="true">
          <div className="h-full w-full rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]" />
        </div>
        <div>
          <strong className="block text-[1.42rem] text-white">Keep the music close to your heart.</strong>
          <p className="mt-1 text-white/84">Your favorites, always here for you.</p>
        </div>
        <MotionButton
          className="w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] lg:w-auto"
        >
          Explore More
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default FavoritesPage
