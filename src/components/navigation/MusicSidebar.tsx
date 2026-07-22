import { AnimatePresence, motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import avatarMia from '../../assets/illustrations/avatar-mia.webp'
import { sidebarRouteMap } from '../../constants/routes'
import { useSidebarData } from '../../hooks'
import {
  ActivityIcon,
  HeartIcon,
  HomeIcon,
  ListMusicIcon,
  MicIcon,
  MusicNoteIcon,
  SettingsIcon,
} from '../ui/AppIcons'
import { MotionButton, TiltCard } from '../ui/MotionPrimitives'

function MusicSidebar() {
  const { data } = useSidebarData()
  const navItems = data?.navItems ?? []

  const iconMap = {
    Dashboard: HomeIcon,
    'My Music': MusicNoteIcon,
    Favorites: HeartIcon,
    Playlists: ListMusicIcon,
    Podcasts: MicIcon,
    Activity: ActivityIcon,
    Settings: SettingsIcon,
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col gap-3 rounded-[24px] bg-linear-to-b from-[#b79cf5] to-[#9e8df0] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_45px_rgba(158,141,240,0.34)] sm:gap-5 sm:rounded-[30px] sm:p-[18px]"
    >
      <div className="flex items-center gap-4 text-left text-white sm:block sm:text-center">
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#f9d5ff] to-[#fff6ff] p-1 shadow-[0_12px_26px_rgba(95,67,164,0.26)] sm:mx-auto sm:mb-3 sm:h-[118px] sm:w-[118px] sm:p-1.5"
        >
          <img src={avatarMia} alt="Mia avatar" className="h-full w-full rounded-full object-cover" />
        </motion.div>
        <div className="min-w-0">
          <h2 className="text-[1.45rem] font-extrabold text-white sm:text-[1.85rem]">Hi, Mia!</h2>
          <p className="mt-1 text-sm text-white/82 sm:mt-2 sm:text-[0.98rem]">Ready for a cozy listening session?</p>
        </div>
      </div>

      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0" aria-label="Music navigation">
        {!data &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-[52px] min-w-[140px] rounded-[18px] lg:min-w-0" />
          ))}
        {navItems.map((item) => {
          const to = sidebarRouteMap[item as keyof typeof sidebarRouteMap] ?? null

          if (!to) {
            const Icon = iconMap[item as keyof typeof iconMap]
            return (
              <motion.button
                key={item}
                type="button"
                whileHover={{ x: 6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex shrink-0 items-center gap-3 rounded-[18px] px-[14px] py-3 text-left font-bold whitespace-nowrap text-white/92 transition duration-200 hover:translate-x-1 hover:bg-[#fffaf9] hover:text-[#7e59e9] hover:shadow-[0_12px_24px_rgba(93,73,173,0.18)] lg:w-full lg:shrink"
                >
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-white/14 text-[0.82rem] font-extrabold"
                    aria-hidden="true"
                  >
                    {Icon ? <Icon size={16} /> : item.charAt(0)}
                  </span>
                  <span>{item}</span>
              </motion.button>
            )
          }

          return (
            <NavLink
              key={item}
              to={to}
              end={to === sidebarRouteMap.Dashboard}
              className={({ isActive }) =>
                [
                  'relative flex items-center gap-3 rounded-[18px] px-[14px] py-3 text-left font-bold transition duration-200',
                  'shrink-0 whitespace-nowrap lg:w-full lg:shrink',
                  isActive
                    ? 'translate-x-1 bg-[#fffaf9] text-[#7e59e9] shadow-[0_12px_24px_rgba(93,73,173,0.18)]'
                    : 'text-white/92 hover:translate-x-1 hover:bg-[#fffaf9] hover:text-[#7e59e9] hover:shadow-[0_12px_24px_rgba(93,73,173,0.18)]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-[18px] bg-[#fffaf9] shadow-[0_12px_24px_rgba(93,73,173,0.18)]"
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>
                  {(() => {
                    const Icon = iconMap[item as keyof typeof iconMap]
                    return (
                  <span
                    className={[
                      'relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-[10px] text-[0.82rem] font-extrabold',
                      isActive ? 'bg-[rgba(126,89,233,0.14)]' : 'bg-white/14',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                          {Icon ? <Icon size={16} /> : item.charAt(0)}
                  </span>
                    )
                  })()}
                  <span className="relative z-10">{item}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <TiltCard className="relative mt-auto hidden rounded-[24px] bg-linear-to-b from-[#ffccdd] to-[#ffb8d0] p-[18px] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_16px_30px_rgba(149,97,149,0.18)] lg:block">
        <div className="relative mx-auto mb-2.5 h-[72px] w-[72px] rounded-[22px] bg-linear-to-b from-[#ffd873] to-[#ffbe44] shadow-[inset_0_-8px_14px_rgba(209,138,21,0.22)]">
          <span className="absolute inset-[18px_13px_15px] bg-linear-to-b from-[#ffefb4] to-[#f5a91c] [clip-path:polygon(0_100%,16%_32%,36%_58%,50%_16%,64%_58%,84%_32%,100%_100%)]" />
        </div>
        <strong className="block text-[1.25rem] text-[#5b3d5f]">Go Premium</strong>
        <p className="my-2 text-[#5b3d5fd1]">Unlock ad-free music and more.</p>
        <MotionButton
          className="w-full rounded-full bg-linear-to-br from-[#ff8bb8] to-[#f06aa4] px-4 py-3 font-extrabold text-white shadow-[0_10px_18px_rgba(240,106,164,0.24)]"
        >
          Upgrade
        </MotionButton>
      </TiltCard>
    </motion.aside>
  )
}

export default MusicSidebar
