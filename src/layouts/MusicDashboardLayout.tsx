import type { CSSProperties } from 'react'
import { AnimatePresence } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { MusicSidebar } from '../components/navigation'
import { PageTransition } from '../components/ui'
import { useAutoScrollTop } from '../hooks'

const routeThemeMap: Record<string, CSSProperties> = {
  '/': {
    ['--route-accent' as string]: '#a77cfb',
    ['--route-accent-strong' as string]: '#8d67eb',
    ['--route-accent-soft' as string]: '#efe4ff',
    ['--route-chip-bg' as string]: 'rgba(244, 237, 255, 0.92)',
    ['--route-chip-shadow' as string]: 'rgba(188, 169, 226, 0.28)',
  },
  '/my-music': {
    ['--route-accent' as string]: '#9b7cff',
    ['--route-accent-strong' as string]: '#7f63ef',
    ['--route-accent-soft' as string]: '#eee3ff',
    ['--route-chip-bg' as string]: 'rgba(241, 232, 255, 0.92)',
    ['--route-chip-shadow' as string]: 'rgba(181, 159, 233, 0.3)',
  },
  '/favorites': {
    ['--route-accent' as string]: '#ee8eb7',
    ['--route-accent-strong' as string]: '#d9709f',
    ['--route-accent-soft' as string]: '#ffe5ef',
    ['--route-chip-bg' as string]: 'rgba(255, 235, 243, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(232, 156, 191, 0.26)',
  },
  '/playlists': {
    ['--route-accent' as string]: '#a47cf4',
    ['--route-accent-strong' as string]: '#8b67ea',
    ['--route-accent-soft' as string]: '#f3e9ff',
    ['--route-chip-bg' as string]: 'rgba(245, 236, 255, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(186, 163, 228, 0.28)',
  },
  '/podcasts': {
    ['--route-accent' as string]: '#a17cf6',
    ['--route-accent-strong' as string]: '#7e65de',
    ['--route-accent-soft' as string]: '#efe8ff',
    ['--route-chip-bg' as string]: 'rgba(241, 235, 255, 0.93)',
    ['--route-chip-shadow' as string]: 'rgba(170, 156, 225, 0.28)',
  },
  '/activity': {
    ['--route-accent' as string]: '#9d7bf8',
    ['--route-accent-strong' as string]: '#7b61de',
    ['--route-accent-soft' as string]: '#efe6ff',
    ['--route-chip-bg' as string]: 'rgba(243, 236, 255, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(180, 163, 228, 0.3)',
  },
  '/settings': {
    ['--route-accent' as string]: '#b58af4',
    ['--route-accent-strong' as string]: '#8f6de0',
    ['--route-accent-soft' as string]: '#f3ebff',
    ['--route-chip-bg' as string]: 'rgba(246, 239, 255, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(190, 173, 228, 0.28)',
  },
}

function MusicDashboardLayout() {
  const location = useLocation()
  useAutoScrollTop(location.pathname)
  const routeTheme = routeThemeMap[location.pathname] ?? routeThemeMap['/']

  return (
    <div className="min-h-screen" style={routeTheme}>
      <div className="grid w-full gap-3 bg-[rgba(255,249,245,0.72)] p-2.5 shadow-[0_28px_60px_rgba(164,130,210,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-[18px] sm:gap-5 sm:p-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <MusicSidebar />

        <main className="grid gap-3 p-0.5 sm:gap-5 sm:p-1.5">
          <AnimatePresence mode="wait">
            <PageTransition pageKey={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default MusicDashboardLayout
