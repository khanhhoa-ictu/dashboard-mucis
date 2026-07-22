import { useEffect } from 'react'

export function useAutoScrollTop(pathname: string) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
}

