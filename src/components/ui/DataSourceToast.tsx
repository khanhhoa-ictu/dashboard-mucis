import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import {
  DATA_SOURCE_NOTICE_EVENT,
  type DataSourceNoticeDetail,
} from '../../lib/supabase/statusEvents'

type ToastState = (DataSourceNoticeDetail & { id: string }) | null

const toneClassMap = {
  success: {
    shell: 'border-emerald-200/70 bg-white/88 text-slate-700 shadow-[0_20px_45px_rgba(93,170,129,0.18)]',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  warning: {
    shell: 'border-amber-200/70 bg-white/90 text-slate-700 shadow-[0_20px_45px_rgba(228,167,82,0.18)]',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700',
  },
} as const

function DataSourceToast() {
  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    const handleNotice = (event: Event) => {
      const customEvent = event as CustomEvent<DataSourceNoticeDetail>
      setToast({
        ...customEvent.detail,
        id: `${customEvent.detail.endpoint}-${Date.now()}`,
      })
    }

    window.addEventListener(DATA_SOURCE_NOTICE_EVENT, handleNotice)
    return () => window.removeEventListener(DATA_SOURCE_NOTICE_EVENT, handleNotice)
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current))
    }, 3800)

    return () => window.clearTimeout(timeoutId)
  }, [toast])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(360px,calc(100vw-1.5rem))] flex-col items-end sm:right-5 sm:top-5">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className={`pointer-events-auto w-full rounded-[24px] border px-4 py-3 backdrop-blur-xl ${toneClassMap[toast.tone].shell}`}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneClassMap[toast.tone].dot}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{toast.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClassMap[toast.tone].badge}`}>
                    {toast.tone === 'success' ? 'Live' : 'Mock'}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-500">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default DataSourceToast
