import { motion } from 'motion/react'
import avatarMia from '../assets/illustrations/avatar-mia.webp'
import { getCoverArt } from '../assets/covers/coverArt'
import heroSettings from '../assets/illustrations/hero-settings-v2.webp'
import {
  AnimatedSection,
  CarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  EqualizerIcon,
  EyeIcon,
  HeaderActions,
  HeadphonesIcon,
  HeartIcon,
  MotionButton,
  MoreIcon,
  MusicNoteIcon,
  PageDataFallback,
  Panel,
  PlayIcon,
  SearchField,
  SectionHeader,
  SettingsIcon,
  SlidersIcon,
  SpeakerIcon,
  SparklesIcon,
  TiltCard,
  UserIcon,
  UserXIcon,
  panelClass,
} from '../components/ui'
import { useSettingsData } from '../hooks'

const themeClasses: Record<string, string> = {
  lavender: 'from-[#b997ff] via-[#a17cec] to-[#8d67eb]',
  peach: 'from-[#ffd8cb] via-[#ffc7b0] to-[#ffb183]',
  mint: 'from-[#d9efc3] via-[#c0dfaa] to-[#a5cf8d]',
  deep: 'from-[#31367e] via-[#3d2a77] to-[#101638]',
}

const iconToneClasses: Record<string, string> = {
  pink: 'from-pink-200 to-rose-300',
  violet: 'from-violet-200 to-violet-300',
  sky: 'from-sky-200 to-blue-300',
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`relative inline-flex h-8 w-14 rounded-full transition ${enabled ? 'bg-[#a985ff]' : 'bg-[#e7e0ef]'}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_8px_14px_rgba(184,171,209,0.3)] transition ${enabled ? 'left-7' : 'left-1'}`}
      />
    </span>
  )
}

function SettingsPage() {
  const { data } = useSettingsData()

  if (!data) {
    return <PageDataFallback title="Loading settings" />
  }

  const { appearanceThemes, connectedDevices, notificationSettings, playbackOptions, privacyOptions } = data

  const playbackIconMap = {
    N: MusicNoteIcon,
    H: HeadphonesIcon,
    E: EqualizerIcon,
    P: PlayIcon,
    M: SlidersIcon,
  }

  const notificationIconMap = {
    N: MusicNoteIcon,
    L: SettingsIcon,
    H: HeartIcon,
    P: PlayIcon,
    A: SparklesIcon,
  }

  const privacyIconMap = {
    O: EyeIcon,
    U: UserXIcon,
    D: SlidersIcon,
    V: DownloadIcon,
    A: UserIcon,
  }

  return (
    <>
      <AnimatedSection as="header" className="grid items-center gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[1.95rem] leading-none font-extrabold text-[#30294f] sm:text-[2.35rem]"
        >
          Settings
        </motion.h1>

        <SearchField placeholder="Search for songs, artists, or albums..." />
        <HeaderActions />
      </AnimatedSection>

      <AnimatedSection delay={0.05} className="grid items-center gap-4 rounded-[24px] border border-white/70 bg-linear-to-br from-[#d8cbff] via-[#cfbeff] to-[#cfc3ff] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:gap-6 sm:rounded-[28px] sm:px-6 sm:py-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[24px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
          <img src={heroSettings} alt="Mia using a laptop" className="artwork-media h-[220px] w-full object-cover sm:h-[280px]" />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="text-[1.65rem] leading-tight font-extrabold text-[#2f2961] sm:text-[2rem]">
            Make it yours, Mia
          </h2>
          <p className="mt-3 mb-6 text-[0.98rem] text-[#5e5178] sm:text-[1.06rem]">
            Personalize your music experience
            <br />
            just the way you like it.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.08} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1fr_1.06fr]">
        <Panel>
          <SectionHeader title="Profile" />
          <div className="grid gap-4 sm:gap-5 md:grid-cols-[120px_1fr]">
            <div className="grid justify-items-center gap-3 sm:gap-4">
              <div className="h-24 w-24 rounded-full bg-linear-to-br from-[#ffd7e1] to-[#ffeef2] p-1 shadow-[0_12px_22px_rgba(223,208,235,0.22)] sm:h-[120px] sm:w-[120px] sm:p-1.5">
                <img src={avatarMia} alt="Mia avatar" className="h-full w-full rounded-full object-cover" />
              </div>
              <MotionButton className="w-full rounded-full bg-linear-to-r from-[#b98eff] to-[#9872ef] px-5 py-3 font-extrabold text-white shadow-[0_14px_24px_rgba(157,115,239,0.24)] md:w-auto">
                Edit Profile
              </MotionButton>
            </div>
            <div className="grid gap-4">
              {[
                ['Display Name', 'Mia'],
                ['Email', 'mia.loves.music@email.com'],
                ['Username', '@mialovesmusic'],
              ].map(([label, value]) => (
                <label key={label} className="grid gap-2">
                  <span className="text-sm font-semibold text-[#7d728e]">{label}</span>
                  <span className="rounded-[16px] border border-white/70 bg-white/70 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHeader title="Playback" />
          <div className="grid gap-2.5 sm:gap-3">
            {playbackOptions.map((item) => (
              <motion.div key={item.title} whileHover={{ x: 4 }} className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[16px] bg-white/55 px-2.5 py-2.5 sm:grid-cols-[42px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-3 sm:py-3">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-[#efe6ff] font-extrabold text-[#8f6aea]">
                  {(() => { const Icon = playbackIconMap[item.icon as keyof typeof playbackIconMap]; return Icon ? <Icon size={18} /> : item.icon })()}
                </span>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{item.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{item.value}</span>
                </div>
                {item.type === 'toggle' ? <Toggle enabled={Boolean(item.enabled)} /> : <span className="text-[#8f6aea]"><ChevronDownIcon size={18} /></span>}
              </motion.div>
            ))}
          </div>
        </Panel>
      </AnimatedSection>

      <AnimatedSection delay={0.11} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[0.95fr_0.95fr_1fr]">
        <article className={panelClass}>
          <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Notifications</h3>
          <div className="grid gap-2.5 sm:gap-3">
            {notificationSettings.map((item) => (
              <motion.div key={item.title} whileHover={{ x: 4 }} className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[16px] bg-white/55 px-2.5 py-2.5 sm:grid-cols-[42px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-3 sm:py-3">
                <span className={`grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-linear-to-b font-extrabold text-white ${iconToneClasses[item.tone ?? 'violet']}`}>
                  {(() => { const Icon = notificationIconMap[item.icon as keyof typeof notificationIconMap]; return Icon ? <Icon size={18} /> : item.icon })()}
                </span>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{item.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{item.note}</span>
                </div>
                <Toggle enabled={Boolean(item.enabled)} />
              </motion.div>
            ))}
          </div>
        </article>

        <article className={panelClass}>
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[1.2rem] font-extrabold text-[#30294f]">Appearance</h3>
              <p className="text-[#7d728e]">Choose your vibe</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2">
            {appearanceThemes.map((theme, index) => (
              <TiltCard key={theme.name} as="article" className={`relative min-h-[100px] rounded-[18px] bg-linear-to-br p-3 shadow-[inset_0_8px_14px_rgba(255,255,255,0.22)] sm:min-h-[120px] sm:rounded-[22px] sm:p-4 ${themeClasses[theme.tone]}`}>
                {index === 0 && <span className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[#8f6aea]"><CheckIcon size={16} /></span>}
                <div className="flex h-full items-end">
                  <strong className="text-white">{theme.name}</strong>
                </div>
              </TiltCard>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[#7d728e]">
              <span>Text Size</span>
              <span>A</span>
            </div>
            <div className="relative h-2 rounded-full bg-[#e7dcf6]">
              <span className="absolute left-[58%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#9c79ec] shadow-[0_8px_14px_rgba(157,115,239,0.3)]" />
            </div>
          </div>
        </article>

        <article className={panelClass}>
          <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Connected Devices</h3>
          <div className="grid gap-2.5 sm:gap-3">
            {connectedDevices.map((device) => (
              <motion.div key={device.name} whileHover={{ x: 4 }} className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[16px] bg-white/55 px-2.5 py-2.5 sm:grid-cols-[42px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-3 sm:py-3">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-[#f3ecff] font-extrabold text-[#8f6aea]">
                  {device.tone === 'headphones' ? <HeadphonesIcon size={18} /> : device.tone === 'speaker' ? <SpeakerIcon size={18} /> : <CarIcon size={18} />}
                </span>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{device.name}</strong>
                  <span className="block text-xs text-[#7d728e] sm:text-base">{device.model}</span>
                  <span className={`${device.connected ? 'text-[#43a35e]' : 'text-[#8e81a8]'} text-xs sm:text-base`}>{device.status}</span>
                </div>
                <span className="text-[#8e81a8]"><MoreIcon size={18} /></span>
              </motion.div>
            ))}
          </div>
          <MotionButton className="mt-5 w-full rounded-full bg-[#f4ecff] px-5 py-3 font-extrabold text-[#8f6aea] shadow-[0_12px_20px_rgba(223,208,235,0.22)]">
            Connect New Device
          </MotionButton>
        </article>
      </AnimatedSection>

      <AnimatedSection delay={0.14} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1fr_1fr]">
        <TiltCard as="article" className={`${panelClass} relative bg-linear-to-br from-[#efe2ff] to-[#d9c3ff]`}>
          <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Subscription</h3>
          <div className="rounded-[20px] bg-linear-to-br from-[#d8c4ff] to-[#c09eff] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:rounded-[24px] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <strong className="text-[1.2rem] text-[#30294f] sm:text-[1.4rem]">Premium Plan</strong>
              <span className="rounded-full bg-[#edffe8] px-3 py-1 text-sm font-bold text-[#46a35e]">Active</span>
            </div>
            <div className="grid items-center gap-4 sm:gap-5 md:grid-cols-[1fr_124px]">
              <ul className="grid gap-2 text-[#54496e]">
                <li className="flex items-center gap-2"><CheckIcon size={16} />Ad-free music listening</li>
                <li className="flex items-center gap-2"><CheckIcon size={16} />Unlimited skips</li>
                <li className="flex items-center gap-2"><CheckIcon size={16} />High quality audio</li>
                <li className="flex items-center gap-2"><CheckIcon size={16} />Offline downloads</li>
                <li className="flex items-center gap-2"><CheckIcon size={16} />Play on any device</li>
              </ul>
              <div className="justify-self-center overflow-hidden rounded-[20px] shadow-[0_16px_28px_rgba(143,106,234,0.22)] md:h-[124px] md:w-[124px]">
                <img src={getCoverArt('heart-balloon')} alt="Premium artwork" className="artwork-media h-full w-full object-cover" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 sm:gap-4">
              <MotionButton className="rounded-full bg-linear-to-r from-[#ff9eb9] to-[#ef7ca4] px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_rgba(240,106,164,0.24)] sm:px-5 sm:text-base">
                Manage Plan
              </MotionButton>
            </div>
          </div>
        </TiltCard>

        <article className={panelClass}>
          <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Privacy</h3>
          <div className="grid gap-2.5 sm:gap-3">
            {privacyOptions.map((item) => (
              <motion.div key={item.title} whileHover={{ x: 4 }} className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[16px] bg-white/55 px-2.5 py-2.5 sm:grid-cols-[42px_1fr_auto] sm:gap-3 sm:rounded-[18px] sm:px-3 sm:py-3">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-[#efe6ff] font-extrabold text-[#8f6aea]">
                  {(() => { const Icon = privacyIconMap[item.icon as keyof typeof privacyIconMap]; return Icon ? <Icon size={18} /> : item.icon })()}
                </span>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{item.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{item.note}</span>
                </div>
                {item.type === 'toggle' ? <Toggle enabled={Boolean(item.enabled)} /> : <span className="text-[#8f6aea]"><ChevronRightIcon size={18} /></span>}
              </motion.div>
            ))}
          </div>
        </article>
      </AnimatedSection>

      <AnimatedSection delay={0.17} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[#b98eff] to-[#9872ef] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_35px_rgba(157,115,239,0.24)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left">
        <div className="relative h-[82px] w-[82px]" aria-hidden="true">
          <div className="h-full w-full rounded-[26px] bg-linear-to-b from-[#ffd76e] to-[#ffbf4b] shadow-[0_16px_30px_rgba(98,52,164,0.18)] [clip-path:polygon(50%_0%,63%_31%,98%_35%,72%_58%,79%_94%,50%_74%,21%_94%,28%_58%,2%_35%,37%_31%)]" />
        </div>
        <div>
          <strong className="block text-[1.42rem] text-white">All set, Mia!</strong>
          <p className="mt-1 text-white/84">Your preferences are saved and ready to go.</p>
        </div>
        <MotionButton className="w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] lg:w-auto">
          Save Changes
        </MotionButton>
      </AnimatedSection>
    </>
  )
}

export default SettingsPage
