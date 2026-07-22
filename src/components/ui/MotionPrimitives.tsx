import type { MouseEvent, PropsWithChildren, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

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
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 28, scale: 0.982, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -24, scale: 0.988, filter: 'blur(10px)' }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-4 sm:gap-5"
    >
      {children}
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
