import type { ReactNode } from 'react'
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  UserIcon,
} from './AppIcons'
import { MotionButton } from './MotionPrimitives'

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <label className="flex h-[48px] items-center gap-3 rounded-full bg-white/78 px-3.5 sm:h-[58px] sm:px-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_14px_28px_rgba(203,188,224,0.18)]">
      <SearchIcon size={18} className="shrink-0 text-[#baa6d9]" />
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 w-full border-0 bg-transparent text-sm text-[#6f6387] outline-none placeholder:text-[#9f94b6] sm:text-base"
      />
    </label>
  )
}

export function HeaderActions() {
  return (
    <div className="flex gap-2.5 sm:gap-3">
      <MotionButton className="relative grid h-10 w-10 place-items-center rounded-full bg-linear-to-b from-[#fffefe] to-[#efe4ff] text-[#8d72db] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_12px_22px_rgba(203,188,224,0.22)] sm:h-[52px] sm:w-[52px]">
        <BellIcon size={20} />
        <span className="absolute top-[-3px] right-[-1px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ff809f] text-[0.72rem] font-extrabold text-white">
          3
        </span>
      </MotionButton>
      <MotionButton className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-b from-[#fffefe] to-[#efe4ff] text-[#8d72db] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_12px_22px_rgba(203,188,224,0.22)] sm:h-[52px] sm:w-[52px]">
        <UserIcon size={20} />
      </MotionButton>
    </div>
  )
}

export function SelectChevron() {
  return <ChevronDownIcon size={18} className="text-[#8f6aea]" />
}

export function CircularAction({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={`grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.26)] ${className ?? ''}`}
    >
      {children}
    </button>
  )
}
