import { AnimatePresence } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { MusicSidebar } from '../components/navigation'
import { MockApiPanel, PageTransition } from '../components/ui'
import { useAutoScrollTop } from '../hooks'

function MusicDashboardLayout() {
  const location = useLocation()
  useAutoScrollTop(location.pathname)

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-7">
      <div className="mx-auto grid w-full max-w-[1420px] gap-3 rounded-[26px] bg-[rgba(255,249,245,0.72)] p-2.5 shadow-[0_28px_60px_rgba(164,130,210,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-[18px] sm:gap-5 sm:rounded-[36px] sm:p-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <MusicSidebar />

        <main className="grid gap-3 p-0.5 sm:gap-5 sm:p-1.5">
          <AnimatePresence mode="wait">
            <PageTransition pageKey={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      <MockApiPanel />
    </div>
  )
}

export default MusicDashboardLayout
