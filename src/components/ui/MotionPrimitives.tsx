import type { MouseEvent, PropsWithChildren, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

const pageAccentMap: Record<string, { primary: string; secondary: string }> = {
  '/': { primary: 'rgba(255, 210, 126, 0.22)', secondary: 'rgba(178, 144, 255, 0.16)' },
  '/my-music': { primary: 'rgba(182, 149, 255, 0.24)', secondary: 'rgba(255, 205, 229, 0.18)' },
  '/favorites': { primary: 'rgba(255, 170, 211, 0.24)', secondary: 'rgba(187, 153, 255, 0.16)' },
  '/playlists': { primary: 'rgba(255, 192, 127, 0.22)', secondary: 'rgba(195, 153, 255, 0.18)' },
  '/podcasts': { primary: 'rgba(255, 184, 214, 0.22)', secondary: 'rgba(137, 184, 255, 0.16)' },
  '/activity': { primary: 'rgba(255, 209, 121, 0.22)', secondary: 'rgba(173, 156, 255, 0.18)' },
  '/settings': { primary: 'rgba(255, 195, 222, 0.22)', secondary: 'rgba(174, 220, 162, 0.16)' },
}

type PageTransitionProps = PropsWithChildren<{
  pageKey: string
}>

type AnimatedSectionProps = PropsWithChildren<{
  className?: string
  delay?: number
  as?: 'section' | 'article' | 'div' | 'header'
}>

type MotionButtonProps = PropsWithChildren<{
  className?: string
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}>

type TiltCardProps = PropsWithChildren<{
  className?: string
  as?: 'div' | 'article'
}>

const revealVariants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const reduceMotion = useReducedMotion()
  const accent = pageAccentMap[pageKey] ?? pageAccentMap['/']

  return (
    <motion.div
      key={pageKey}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.978, filter: 'blur(14px)' }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -30, scale: 0.989, filter: 'blur(12px)' }}
      transition={{
        duration: reduceMotion ? 0.18 : 0.52,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: reduceMotion ? 0 : 0.045,
        delayChildren: reduceMotion ? 0 : 0.03,
      }}
      className="relative grid gap-4 overflow-x-clip sm:gap-5"
    >
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, x: -24, y: -10 }}
        animate={reduceMotion ? { opacity: 0.32 } : { opacity: 0.5, scale: 1, x: 0, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06, x: 18, y: -8 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.58, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-[-5%] top-[-4%] z-0 h-[180px] w-[280px] rounded-full blur-[40px] sm:h-[220px] sm:w-[360px] sm:blur-[54px]"
        style={{ backgroundColor: accent.primary }}
      />
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, x: 28, y: 8 }}
        animate={reduceMotion ? { opacity: 0.24 } : { opacity: 0.42, scale: 1, x: 0, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, x: -16, y: 12 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-[-4%] top-[8%] z-0 h-[150px] w-[220px] rounded-full blur-[34px] sm:h-[190px] sm:w-[300px] sm:blur-[48px]"
        style={{ backgroundColor: accent.secondary }}
      />
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0.28, scaleY: 1.02 }}
        animate={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleY: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0.2, scaleY: 0.985 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 z-20 rounded-[32px] bg-linear-to-b from-white/26 via-[#f9f2ff]/12 to-transparent"
      />
      <div className="relative z-10 grid gap-4 sm:gap-5 lg:gap-6">{children}</div>
    </motion.div>
  )
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  as = 'section',
}: AnimatedSectionProps) {
  const Component =
    as === 'article'
      ? motion.article
      : as === 'div'
        ? motion.div
        : as === 'header'
          ? motion.header
          : motion.section

  return (
    <Component
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ delay }}
    >
      {children}
    </Component>
  )
}

export function MotionButton({
  children,
  className,
  type = 'button',
}: MotionButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}

export function TiltCard({
  children,
  className,
  as = 'div',
}: TiltCardProps) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const smoothRotateX = useSpring(rotateX, { stiffness: 180, damping: 16, mass: 0.35 })
  const smoothRotateY = useSpring(rotateY, { stiffness: 180, damping: 16, mass: 0.35 })
  const glareX = useTransform(smoothRotateY, [-8, 8], ['35%', '65%'])
  const glareY = useTransform(smoothRotateX, [-8, 8], ['35%', '65%'])

  const handleMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const rotateYValue = ((x / bounds.width) - 0.5) * 10
    const rotateXValue = (0.5 - y / bounds.height) * 10

    rotateX.set(rotateXValue)
    rotateY.set(rotateYValue)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const Component = as === 'article' ? motion.article : motion.div

  return (
    <Component
      className={`artwork-shell relative ${className ?? ''}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ y: -8, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1400,
      }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background:
            'radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.22), transparent 42%)',
          ['--glare-x' as string]: glareX,
          ['--glare-y' as string]: glareY,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </Component>
  )
}
