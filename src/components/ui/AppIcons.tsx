import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

function IconBase({
  size = 20,
  className,
  children,
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 1.9,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </IconBase>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.2 18h5.6" />
      <path d="M10.3 20a1.8 1.8 0 0 0 3.4 0" />
      <path d="M18 15H6l1.4-1.9V10a4.6 4.6 0 1 1 9.2 0v3.1z" />
    </IconBase>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 18.5a7.8 7.8 0 0 1 13 0" />
    </IconBase>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" stroke="none" {...props}>
      <path d="M9 6.7v10.6a.8.8 0 0 0 1.2.7l8.2-5.3a.8.8 0 0 0 0-1.4l-8.2-5.3a.8.8 0 0 0-1.2.7Z" />
    </IconBase>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <IconBase fill="currentColor" stroke="none" {...props}>
      <rect x="7.2" y="6.5" width="3.4" height="11" rx="1.1" />
      <rect x="13.4" y="6.5" width="3.4" height="11" rx="1.1" />
    </IconBase>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
    </IconBase>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  )
}

export function MoreIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m7 10 5 5 5-5" />
    </IconBase>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m10 7 5 5-5 5" />
    </IconBase>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4.2 4.2L19 6.8" />
    </IconBase>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10.7 12 4l8 6.7" />
      <path d="M6.5 9.8V20h11V9.8" />
    </IconBase>
  )
}

export function MusicNoteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 5v9.2A2.8 2.8 0 1 1 13 11.5V6.3L19 5v7.2a2.8 2.8 0 1 1-2-2.7V6.2" />
    </IconBase>
  )
}

export function ListMusicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 7h11" />
      <path d="M8 12h11" />
      <path d="M8 17h11" />
      <circle cx="4" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="17" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function MicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="4" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v3" />
      <path d="M9 20h6" />
    </IconBase>
  )
}

export function ActivityIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12h4l2.2-5 4.1 10 2.3-5H21" />
    </IconBase>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 0 1-3.6 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1 .2l-.2.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 0 1 0-3.6h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1L4.8 9a1.8 1.8 0 0 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 0 1 3.6 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1-.2l.2-.1A1.8 1.8 0 0 1 19 7.3l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1.8 1.8 0 0 1 0 3.6h-.2a1 1 0 0 0-.9.7Z" />
    </IconBase>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.8" />
    </IconBase>
  )
}

export function FlameIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3c1.4 2.4.6 4.2-.5 5.8-1 1.4-1.7 2.5-1.7 4A4.2 4.2 0 0 0 18 14c0-2.8-1.3-4.4-2.8-6-1-1-1.9-2-2.2-5Z" />
      <path d="M9.5 15.5A2.8 2.8 0 0 0 15 16c0-1.2-.6-2-1.3-2.9-.4-.5-.8-1-.9-1.8-.7 1.2-2 2.1-2 4.2Z" />
    </IconBase>
  )
}

export function TrophyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4h8v3a4 4 0 0 1-8 0Z" />
      <path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v.3A3.2 3.2 0 0 0 7.2 10H8" />
      <path d="M16 5h2.5A1.5 1.5 0 0 1 20 6.5v.3A3.2 3.2 0 0 1 16.8 10H16" />
      <path d="M12 11v4" />
      <path d="M9 20h6" />
      <path d="M8.5 15.5h7" />
    </IconBase>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 14.8A7.5 7.5 0 0 1 9.2 5a8 8 0 1 0 9.8 9.8Z" />
    </IconBase>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.1" />
      <path d="M12 19.1v2.1" />
      <path d="m4.9 4.9 1.5 1.5" />
      <path d="m17.6 17.6 1.5 1.5" />
      <path d="M2.8 12h2.1" />
      <path d="M19.1 12h2.1" />
      <path d="m4.9 19.1 1.5-1.5" />
      <path d="m17.6 6.4 1.5-1.5" />
    </IconBase>
  )
}

export function CloudIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 18h8a3.5 3.5 0 1 0-.5-7 5 5 0 0 0-9.6 1.5A3 3 0 0 0 7.5 18Z" />
    </IconBase>
  )
}

export function ZapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 2 5.5 12h5l-1 10L17.5 12h-5L13 2Z" />
    </IconBase>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12v16H7a2.5 2.5 0 0 0-2.5 2.5Z" />
      <path d="M7 3v18" />
    </IconBase>
  )
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 9 9-4 9 4-9 4Z" />
      <path d="M7 11v4.5c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5V11" />
      <path d="M21 10v5" />
    </IconBase>
  )
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="7" width="17" height="12" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3.5 11.5h17" />
    </IconBase>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 5c-6 .4-10.6 4.3-12.7 10.6" />
      <path d="M19 5c.8 7.6-3 12-9.8 12-1.5 0-2.5-.3-3.2-.8C5.7 9.7 10.7 5 19 5Z" />
    </IconBase>
  )
}

export function HeadphonesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="4" y="12.5" width="4" height="7" rx="2" />
      <rect x="16" y="12.5" width="4" height="7" rx="2" />
    </IconBase>
  )
}

export function SpeakerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="4" width="10" height="16" rx="2" />
      <circle cx="12" cy="9" r="1.2" />
      <circle cx="12" cy="15" r="2.7" />
    </IconBase>
  )
}

export function CarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 15 7 9.5A2 2 0 0 1 8.9 8H15a2 2 0 0 1 1.9 1.5l1.6 5.5" />
      <rect x="4" y="12" width="16" height="5" rx="1.5" />
      <circle cx="7.5" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12s3.2-5.5 9.5-5.5S21.5 12 21.5 12 18.3 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </IconBase>
  )
}

export function UserXIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10" cy="8" r="3" />
      <path d="M4.5 18a6.7 6.7 0 0 1 11 0" />
      <path d="m17 8 4 4" />
      <path d="m21 8-4 4" />
    </IconBase>
  )
}

export function SlidersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h6" />
      <path d="M14 6h6" />
      <circle cx="12" cy="6" r="2" />
      <path d="M4 12h2" />
      <path d="M10 12h10" />
      <circle cx="8" cy="12" r="2" />
      <path d="M4 18h10" />
      <path d="M18 18h2" />
      <circle cx="16" cy="18" r="2" />
    </IconBase>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </IconBase>
  )
}

export function ShuffleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 3h4v4" />
      <path d="M4 18h2.5a5 5 0 0 0 4.1-2.1L20 3" />
      <path d="M16 21h4v-4" />
      <path d="M4 6h2.5a5 5 0 0 1 4.1 2.1L13 11" />
      <path d="m20 21-7-8" />
    </IconBase>
  )
}

export function SkipBackIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 6v12" />
      <path d="m18 7-8 5 8 5V7Z" />
    </IconBase>
  )
}

export function SkipForwardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M17 6v12" />
      <path d="m6 7 8 5-8 5V7Z" />
    </IconBase>
  )
}

export function RepeatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M17 2.8 20 5.8 17 8.8" />
      <path d="M4 6h16" />
      <path d="M7 21.2 4 18.2 7 15.2" />
      <path d="M20 18H4" />
    </IconBase>
  )
}

export function VolumeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 10h3l4-4v12l-4-4H5Z" />
      <path d="M16 9a4.5 4.5 0 0 1 0 6" />
      <path d="M18 6.5a8 8 0 0 1 0 11" />
    </IconBase>
  )
}

export function VolumeMuteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 10h3l4-4v12l-4-4H5Z" />
      <path d="m16 9 4 4" />
      <path d="m20 9-4 4" />
    </IconBase>
  )
}

export function QueueIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h10" />
      <path d="M4 12h10" />
      <path d="M4 17h10" />
      <path d="m18 10 3 2-3 2v-4Z" />
    </IconBase>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4Z" />
      <path d="m5 14 .8 2 .2.8 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
      <path d="m19 14 .7 1.8.3.7 1.8.7-1.8.7-.3.7-.7 1.8-.7-1.8-.3-.7-1.8-.7 1.8-.7Z" />
    </IconBase>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.2l-5.5 3 1-6.2L3 9.6l6.2-.9Z" />
    </IconBase>
  )
}

export function EqualizerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 5v14" />
      <path d="M12 3v18" />
      <path d="M18 7v10" />
      <circle cx="6" cy="10" r="2" />
      <circle cx="12" cy="15" r="2" />
      <circle cx="18" cy="10" r="2" />
    </IconBase>
  )
}
