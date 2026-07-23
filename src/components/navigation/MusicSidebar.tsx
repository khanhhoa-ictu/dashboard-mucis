import { motion } from 'motion/react'
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

function MusicSidebar() {
  const { data } = useSidebarData()
  const navItems = data?.navItems ?? []
  const navItemsWithAdmin = navItems.includes('Library Admin')
    ? navItems
    : [...navItems, 'Library Admin']

  const iconMap = {
    Dashboard: HomeIcon,
    'My Music': MusicNoteIcon,
    Favorites: HeartIcon,
    Playlists: ListMusicIcon,
    Podcasts: MicIcon,
    Activity: ActivityIcon,
    Settings: SettingsIcon,
    'Library Admin': ListMusicIcon,
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col gap-3 rounded-[24px] bg-linear-to-b from-[color-mix(in_srgb,var(--route-accent)_62%,white)] via-[color-mix(in_srgb,var(--route-accent)_78%,#c9bbff)] to-[var(--route-accent-strong)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_45px_var(--route-chip-shadow)] sm:gap-4 sm:rounded-[30px] sm:p-4 lg:h-full lg:min-h-0 lg:overflow-hidden"
    >
      <div className="flex items-center gap-3.5 text-left text-white sm:block sm:text-center">
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#f9d5ff] to-[#fff6ff] p-1 shadow-[0_12px_26px_rgba(95,67,164,0.26)] sm:mx-auto sm:mb-2 sm:h-[96px] sm:w-[96px] sm:p-1.5"
        >
          <img src={avatarMia} alt="Mia avatar" className="h-full w-full rounded-full object-cover" />
        </motion.div>
        <div className="min-w-0">
          <h2 className="text-[1.3rem] font-extrabold text-white sm:text-[1.62rem]">Hi, Mia!</h2>
          <p className="mt-1 text-[0.92rem] leading-6 text-white/82 sm:mt-1 sm:text-[0.9rem] sm:leading-6">Ready for a cozy listening session?</p>
        </div>
      </div>

      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0" aria-label="Music navigation">
        {!data &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-[52px] min-w-[140px] rounded-[18px] lg:min-w-0" />
          ))}
        {navItemsWithAdmin.map((item) => {
          const to = sidebarRouteMap[item as keyof typeof sidebarRouteMap] ?? null

          if (!to) {
            const Icon = iconMap[item as keyof typeof iconMap]
            return (
              <motion.button
                key={item}
                type="button"
                whileHover={{ x: 6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex shrink-0 items-center gap-3 rounded-[18px] px-[14px] py-2.5 text-left text-[0.98rem] font-bold whitespace-nowrap text-white/92 transition duration-300 hover:translate-x-1 hover:bg-white/96 hover:text-[var(--route-accent-strong)] hover:shadow-[0_12px_24px_var(--route-chip-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--route-accent)] active:scale-[0.985] lg:w-full lg:shrink"
                >
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-white/14 text-[0.82rem] font-extrabold transition duration-300"
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
                  'group relative flex items-center gap-3 rounded-[18px] px-[14px] py-2.5 text-left text-[0.98rem] font-bold transition duration-200',
                  'shrink-0 whitespace-nowrap lg:w-full lg:shrink',
                  isActive
                    ? 'translate-x-1 bg-white/96 text-[var(--route-accent-strong)] shadow-[0_12px_24px_var(--route-chip-shadow)]'
                    : 'text-white/92 hover:translate-x-1 hover:bg-white/96 hover:text-[var(--route-accent-strong)] hover:shadow-[0_12px_24px_var(--route-chip-shadow)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--route-accent)] active:scale-[0.985]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-[18px] bg-white/96 shadow-[0_12px_24px_var(--route-chip-shadow)]"
                      transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.75 }}
                    />
                  )}
                  {(() => {
                    const Icon = iconMap[item as keyof typeof iconMap]
                    return (
                  <motion.span
                    layout="position"
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className={[
                      'relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-[10px] text-[0.82rem] font-extrabold transition duration-300',
                      isActive
                        ? 'bg-[color-mix(in_srgb,var(--route-accent)_16%,white)] text-[var(--route-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
                        : 'bg-white/14 text-current group-hover:bg-white/20',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                          {Icon ? <Icon size={16} /> : item.charAt(0)}
                  </motion.span>
                    )
                  })()}
                  <motion.span
                    layout="position"
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className="relative z-10 tracking-[0.01em]"
                  >
                    {item}
                  </motion.span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

    </motion.aside>
  )
}

export default MusicSidebar
