import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { MusicSidebar } from '../components/navigation'
import { DataSourceToast, GlobalAudioDock, PageTransition } from '../components/ui'
import { useAutoScrollTop } from '../hooks'
import { appRoutes } from '../constants/routes'

const APPEARANCE_STORAGE_KEY = 'patreon-clone-appearance'

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
  '/library-admin': {
    ['--route-accent' as string]: '#9b7cff',
    ['--route-accent-strong' as string]: '#7e61e0',
    ['--route-accent-soft' as string]: '#f1e8ff',
    ['--route-chip-bg' as string]: 'rgba(243, 236, 255, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(184, 164, 229, 0.28)',
  },
}

const appearanceThemeMap: Record<string, CSSProperties> = {
  Lavender: {
    ['--route-accent' as string]: '#b58af4',
    ['--route-accent-strong' as string]: '#8f6de0',
    ['--route-accent-soft' as string]: '#f3ebff',
    ['--route-chip-bg' as string]: 'rgba(246, 239, 255, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(190, 173, 228, 0.28)',
    ['--app-bg-start' as string]: 'rgba(217, 188, 255, 0.78)',
    ['--app-bg-end' as string]: '#efe0ff',
    ['--app-bg-bottom' as string]: '#fff6ef',
    ['--app-shell-bg' as string]: 'rgba(255,249,245,0.72)',
    ['--surface-card-start' as string]: 'rgba(255,252,250,0.96)',
    ['--surface-card-end' as string]: 'rgba(255,245,240,0.94)',
    ['--surface-soft' as string]: 'rgba(255,255,255,0.62)',
    ['--surface-strong' as string]: 'rgba(255,255,255,0.82)',
  },
  Peach: {
    ['--route-accent' as string]: '#f0a27f',
    ['--route-accent-strong' as string]: '#da7c5f',
    ['--route-accent-soft' as string]: '#ffefe6',
    ['--route-chip-bg' as string]: 'rgba(255, 242, 235, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(235, 177, 150, 0.28)',
    ['--app-bg-start' as string]: 'rgba(255, 213, 194, 0.76)',
    ['--app-bg-end' as string]: '#fff0e6',
    ['--app-bg-bottom' as string]: '#fff8f2',
    ['--app-shell-bg' as string]: 'rgba(255,245,238,0.76)',
    ['--surface-card-start' as string]: 'rgba(255,249,245,0.97)',
    ['--surface-card-end' as string]: 'rgba(255,238,228,0.95)',
    ['--surface-soft' as string]: 'rgba(255,248,244,0.72)',
    ['--surface-strong' as string]: 'rgba(255,250,247,0.88)',
  },
  Mint: {
    ['--route-accent' as string]: '#8cc98f',
    ['--route-accent-strong' as string]: '#5ea86f',
    ['--route-accent-soft' as string]: '#eef9eb',
    ['--route-chip-bg' as string]: 'rgba(241, 251, 237, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(168, 214, 170, 0.28)',
    ['--app-bg-start' as string]: 'rgba(204, 236, 194, 0.78)',
    ['--app-bg-end' as string]: '#edf9eb',
    ['--app-bg-bottom' as string]: '#f8fff4',
    ['--app-shell-bg' as string]: 'rgba(244,251,242,0.76)',
    ['--surface-card-start' as string]: 'rgba(249,255,247,0.97)',
    ['--surface-card-end' as string]: 'rgba(236,248,232,0.95)',
    ['--surface-soft' as string]: 'rgba(247,255,245,0.72)',
    ['--surface-strong' as string]: 'rgba(251,255,249,0.88)',
  },
  'Deep Night': {
    ['--route-accent' as string]: '#4f55a8',
    ['--route-accent-strong' as string]: '#2e3274',
    ['--route-accent-soft' as string]: '#e7e9ff',
    ['--route-chip-bg' as string]: 'rgba(236, 239, 255, 0.94)',
    ['--route-chip-shadow' as string]: 'rgba(124, 132, 193, 0.28)',
    ['--app-bg-start' as string]: 'rgba(145, 152, 228, 0.66)',
    ['--app-bg-end' as string]: '#e8ebff',
    ['--app-bg-bottom' as string]: '#f4f6ff',
    ['--app-shell-bg' as string]: 'rgba(236,240,255,0.78)',
    ['--surface-card-start' as string]: 'rgba(245,247,255,0.97)',
    ['--surface-card-end' as string]: 'rgba(225,230,252,0.95)',
    ['--surface-soft' as string]: 'rgba(237,241,255,0.76)',
    ['--surface-strong' as string]: 'rgba(248,250,255,0.9)',
  },
}

function MusicDashboardLayout() {
  const location = useLocation()
  useAutoScrollTop(location.pathname)
  const [appearanceThemeName, setAppearanceThemeName] = useState('Lavender')
  const [appearanceTextScale, setAppearanceTextScale] = useState(1)
  const routeTheme = routeThemeMap[location.pathname] ?? routeThemeMap['/']
  const appearanceTheme = appearanceThemeMap[appearanceThemeName] ?? appearanceThemeMap.Lavender
  const mergedTheme = useMemo(
    () => ({
      ...routeTheme,
      ...appearanceTheme,
    }),
    [appearanceTheme, routeTheme],
  )
  const shouldShowGlobalPlayer = location.pathname !== appRoutes.myMusic

  useEffect(() => {
    const syncAppearance = () => {
      try {
        const rawValue = localStorage.getItem(APPEARANCE_STORAGE_KEY)
        if (!rawValue) {
          setAppearanceThemeName('Lavender')
          return
        }

        const parsedValue = JSON.parse(rawValue) as { themeName?: string }
        setAppearanceThemeName(parsedValue.themeName || 'Lavender')
        setAppearanceTextScale(typeof (parsedValue as { textScale?: number }).textScale === 'number'
          ? (parsedValue as { textScale?: number }).textScale ?? 1
          : 1)
      } catch {
        setAppearanceThemeName('Lavender')
        setAppearanceTextScale(1)
      }
    }

    syncAppearance()
    window.addEventListener('storage', syncAppearance)
    window.addEventListener('appearance-settings-updated', syncAppearance)

    return () => {
      window.removeEventListener('storage', syncAppearance)
      window.removeEventListener('appearance-settings-updated', syncAppearance)
    }
  }, [])

  useEffect(() => {
    const themeVars = appearanceTheme as Record<string, string>
    const start = String(themeVars['--app-bg-start'] ?? 'rgba(217, 188, 255, 0.78)')
    const end = String(themeVars['--app-bg-end'] ?? '#efe0ff')
    const bottom = String(themeVars['--app-bg-bottom'] ?? '#fff6ef')

    document.body.style.background = [
      `radial-gradient(circle at top left, ${start}, transparent 28%)`,
      'radial-gradient(circle at 85% 15%, rgba(255, 215, 228, 0.42), transparent 22%)',
      `linear-gradient(180deg, ${end}, #f9ebf7 45%, ${bottom} 100%)`,
    ].join(', ')

    return () => {
      document.body.style.background = ''
    }
  }, [appearanceTheme])

  return (
    <div
      className="min-h-screen lg:h-screen lg:overflow-hidden"
      style={{
        ...mergedTheme,
        fontSize: `${appearanceTextScale}rem`,
        background: [
          'radial-gradient(circle at top left, var(--app-bg-start), transparent 28%)',
          'radial-gradient(circle at 85% 15%, rgba(255, 215, 228, 0.42), transparent 22%)',
          'linear-gradient(180deg, var(--app-bg-end), #f9ebf7 45%, var(--app-bg-bottom) 100%)',
        ].join(', '),
      }}
    >
      <div className="grid w-full gap-3 bg-[var(--app-shell-bg)] p-2.5 shadow-[0_28px_60px_rgba(164,130,210,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-[18px] sm:gap-5 sm:p-4 lg:h-screen lg:grid-cols-[250px_minmax(0,1fr)] lg:overflow-hidden">
        <MusicSidebar />

        <main className="grid gap-3 p-0.5 sm:gap-5 sm:p-1.5 lg:h-full lg:overflow-y-auto lg:pr-2">
          <AnimatePresence mode="wait">
            <PageTransition pageKey={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <DataSourceToast />
      {shouldShowGlobalPlayer ? <GlobalAudioDock /> : null}
    </div>
  )
}

export default MusicDashboardLayout
