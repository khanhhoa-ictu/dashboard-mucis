import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  actionLabel?: string
  subtitle?: string
}

type MediaThumbProps = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  children?: ReactNode
}

type PanelProps = {
  className?: string
  children: ReactNode
}

type PageHeroProps = {
  imageSrc: string
  imageAlt: string
  title: ReactNode
  description: ReactNode
  buttonLabel?: string
  className?: string
  imageFirstColsClassName?: string
}

export const panelClass =
  'rounded-[24px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:rounded-[28px] sm:p-[18px]'

const heroClass =
  'grid items-center gap-4 rounded-[24px] border border-white/70 bg-linear-to-br from-[color-mix(in_srgb,var(--route-accent-soft)_72%,white)] via-[color-mix(in_srgb,var(--route-accent-soft)_88%,white)] to-[color-mix(in_srgb,var(--route-accent-soft)_76%,#f7efff)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:gap-6 sm:rounded-[28px] sm:px-6 sm:py-5'

export function SectionHeader({
  title,
  actionLabel,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="mb-[18px] flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">{title}</h3>
        {subtitle ? <p className="text-[#7d728e]">{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          className="rounded-full bg-[var(--route-chip-bg)] px-[14px] py-2 text-[#736885] shadow-[0_10px_18px_var(--route-chip-shadow)] transition duration-300 hover:text-[var(--route-accent-strong)]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

export function MediaThumb({
  src,
  alt,
  className,
  imgClassName,
  children,
}: MediaThumbProps) {
  return (
    <div className={className}>
      <img src={src} alt={alt} className={imgClassName ?? 'artwork-media h-full w-full object-cover'} />
      {children}
    </div>
  )
}

export function Panel({ className, children }: PanelProps) {
  return <article className={`${panelClass} ${className ?? ''}`.trim()}>{children}</article>
}

export function PageHero({
  imageSrc,
  imageAlt,
  title,
  description,
  buttonLabel,
  className,
  imageFirstColsClassName = 'lg:grid-cols-[1.1fr_0.9fr]',
}: PageHeroProps) {
  return (
    <section className={`${heroClass} ${imageFirstColsClassName} ${className ?? ''}`.trim()}>
      <div className="overflow-hidden rounded-[24px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
        <img src={imageSrc} alt={imageAlt} className="artwork-media h-[220px] w-full object-cover sm:h-[280px]" />
      </div>

      <div className="text-center lg:text-left">
        <h2 className="text-[1.65rem] leading-tight font-extrabold text-[#2f2961] sm:text-[2rem]">{title}</h2>
        <div className="mt-3 mb-6 text-[0.98rem] text-[#5e5178] sm:text-[1.06rem]">{description}</div>
        {buttonLabel ? (
          <button
            type="button"
            className="w-full rounded-full bg-linear-to-br from-[var(--route-accent)] to-[var(--route-accent-strong)] px-6 py-3.5 font-extrabold text-white shadow-[0_14px_26px_var(--route-chip-shadow)] transition duration-300 hover:brightness-[1.03] sm:w-auto"
          >
            {buttonLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}
