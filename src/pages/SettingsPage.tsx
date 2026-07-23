import { motion } from 'motion/react'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
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
import { useMockApiContext } from '../context/MockApiContext'
import { useSettingsData } from '../hooks'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'
import { emitDataSourceNotice } from '../lib/supabase/statusEvents'

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

const DEMO_PROFILE_ID = '11111111-1111-1111-1111-111111111111'
const APPEARANCE_STORAGE_KEY = 'patreon-clone-appearance'

const audioBucketName = import.meta.env.VITE_SUPABASE_AUDIO_BUCKET?.trim() || 'audio'
const coverBucketName = import.meta.env.VITE_SUPABASE_COVER_BUCKET?.trim() || 'covers'
const coverToneOptions = [
  'dream-clouds',
  'coffee-latte',
  'road-trip',
  'weekend-van',
  'moon-river',
  'cozy-room',
  'fireplace-night',
]

type UploadTrackOption = {
  id: string
  title: string
  artist: string
  artistId?: string
  audioUrl: string | null
  durationSeconds?: number | null
  coverUrl?: string | null
}

type ArtistOption = {
  id: string
  name: string
}

type UploadMode = 'existing' | 'new'
type ArtistMode = 'existing' | 'new'
type AudioFilter = 'all' | 'with-audio' | 'demo-only'
type CoverFilter = 'all' | 'with-cover' | 'tone-only'

function sanitizeFileSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'track'
}

function getReadableStorageErrorMessage(bucketName: string, message: string) {
  const normalized = message.trim().toLowerCase()

  if (normalized.includes('bucket not found')) {
    return `Khong tim thay bucket "${bucketName}" trong Supabase Storage. Hay tao bucket nay hoac doi bien moi truong cho dung ten bucket hien co.`
  }

  return message
}

function readAudioDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const audio = document.createElement('audio')
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      audio.removeAttribute('src')
      audio.load()
      URL.revokeObjectURL(objectUrl)
    }

    audio.preload = 'metadata'

    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? Math.max(0, Math.round(audio.duration)) : 0
      cleanup()
      resolve(duration)
    }

    audio.onerror = () => {
      cleanup()
      reject(new Error('Khong doc duoc metadata tu file audio nay.'))
    }

    audio.src = objectUrl
  })
}

function toDisplayTitle(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeFilenameText(value: string) {
  return value
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\([^)]*\blyrics?\b[^)]*\)/gi, ' ')
    .replace(/\b(?:lyrics?|official|audio|video|visualizer|mv|hd|4k)\b/gi, ' ')
    .replace(/\byoutube\b/gi, ' ')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferTrackMetaFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.[a-z0-9]+$/i, '')
  const normalized = normalizeFilenameText(withoutExtension)
  const splitMatch = normalized.match(/^(.+?)\s+-\s+(.+)$/)

  if (splitMatch) {
    return {
      artistGuess: toDisplayTitle(splitMatch[1]),
      titleGuess: toDisplayTitle(splitMatch[2]),
    }
  }

  return {
    artistGuess: '',
    titleGuess: toDisplayTitle(normalized || withoutExtension),
  }
}

function suggestCoverTone(title: string) {
  const normalized = title.trim().toLowerCase()

  if (!normalized) return 'dream-clouds'
  if (normalized.includes('coffee') || normalized.includes('latte') || normalized.includes('cafe')) return 'coffee-latte'
  if (normalized.includes('gold') || normalized.includes('road') || normalized.includes('drive')) return 'road-trip'
  if (normalized.includes('sunset') || normalized.includes('summer') || normalized.includes('beach')) return 'weekend-van'
  if (normalized.includes('dream') || normalized.includes('cloud')) return 'dream-clouds'
  if (normalized.includes('night') || normalized.includes('moon') || normalized.includes('star') || normalized.includes('sleep')) return 'moon-river'
  if (normalized.includes('home') || normalized.includes('room') || normalized.includes('chill')) return 'cozy-room'
  if (normalized.includes('fire') || normalized.includes('warm')) return 'fireplace-night'
  return 'dream-clouds'
}

function buildUniqueSlug(baseValue: string) {
  return `${sanitizeFileSegment(baseValue)}-${Date.now()}`
}

export function AudioUploadPanel() {
  const { loadEndpoint } = useMockApiContext()
  const [tracks, setTracks] = useState<UploadTrackOption[]>([])
  const [artists, setArtists] = useState<ArtistOption[]>([])
  const [mode, setMode] = useState<UploadMode>('existing')
  const [artistMode, setArtistMode] = useState<ArtistMode>('existing')
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [newArtistName, setNewArtistName] = useState('')
  const [newTrackTitle, setNewTrackTitle] = useState('')
  const [detectedDurationSeconds, setDetectedDurationSeconds] = useState<number | null>(null)
  const [isReadingDuration, setIsReadingDuration] = useState(false)
  const [newTrackCoverUrl, setNewTrackCoverUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [librarySearch, setLibrarySearch] = useState('')
  const [audioFilter, setAudioFilter] = useState<AudioFilter>('all')
  const [coverFilter, setCoverFilter] = useState<CoverFilter>('all')
  const [artistFilterId, setArtistFilterId] = useState('all')
  const [savingTrackId, setSavingTrackId] = useState<string | null>(null)
  const [savingArtistId, setSavingArtistId] = useState<string | null>(null)
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null)
  const [uploadingCoverTrackId, setUploadingCoverTrackId] = useState<string | null>(null)
  const [quickArtistName, setQuickArtistName] = useState('')
  const [isCreatingArtist, setIsCreatingArtist] = useState(false)

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      return
    }

    const client = supabase
    let isMounted = true

    const loadTracks = async () => {
      setIsLoadingTracks(true)
      setErrorMessage(null)

      const [tracksResult, artistsResult] = await Promise.all([
        client
          .from('tracks')
          .select('id, title, artist_id, audio_url, duration_seconds, cover_url')
          .order('title', { ascending: true }),
        client
          .from('artists')
          .select('id, name'),
      ])

      if (!isMounted) {
        return
      }

      if (tracksResult.error || artistsResult.error) {
        setErrorMessage(tracksResult.error?.message ?? artistsResult.error?.message ?? 'Khong the tai danh sach bai hat.')
        setIsLoadingTracks(false)
        return
      }

      const artistMap = new Map((artistsResult.data ?? []).map((artist) => [artist.id, artist.name]))
      const nextArtists = (artistsResult.data ?? []).map((artist) => ({
        id: artist.id,
        name: artist.name,
      }))
      const nextTracks = (tracksResult.data ?? []).map((track) => ({
        id: track.id,
        title: track.title,
        artist: artistMap.get(track.artist_id ?? '') ?? 'Unknown Artist',
        artistId: track.artist_id ?? undefined,
        audioUrl: track.audio_url ?? null,
        durationSeconds: track.duration_seconds ?? null,
        coverUrl: track.cover_url ?? null,
      }))

      setArtists(nextArtists)
      setTracks(nextTracks)
      setSelectedTrackId((current) => current || nextTracks[0]?.id || '')
      setSelectedArtistId((current) => current || nextArtists[0]?.id || '')
      setIsLoadingTracks(false)
    }

    void loadTracks()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? null,
    [selectedTrackId, tracks],
  )

  const selectedArtist = useMemo(
    () => artists.find((artist) => artist.id === selectedArtistId) ?? null,
    [artists, selectedArtistId],
  )

  const newTrackPreviewLabel = useMemo(() => {
    const artistName = artistMode === 'new'
      ? (newArtistName.trim() || 'New Artist')
      : (selectedArtist?.name ?? 'Unknown Artist')
    return `${newTrackTitle.trim() || 'Track moi'} - ${artistName}`
  }, [artistMode, newArtistName, newTrackTitle, selectedArtist])

  const newTrackPreviewTone = useMemo(
    () => newTrackCoverUrl.trim() || suggestCoverTone(newTrackTitle),
    [newTrackCoverUrl, newTrackTitle],
  )

  const filteredTracks = useMemo(() => {
    const keyword = librarySearch.trim().toLowerCase()

    return tracks.filter((track) => {
      const matchesKeyword = !keyword || `${track.title} ${track.artist}`.toLowerCase().includes(keyword)
      const matchesArtist = artistFilterId === 'all' || track.artistId === artistFilterId
      const matchesAudio = audioFilter === 'all'
        || (audioFilter === 'with-audio' && Boolean(track.audioUrl))
        || (audioFilter === 'demo-only' && !track.audioUrl)
      const hasRealCover = Boolean(track.coverUrl?.trim() && /^(https?:\/\/|data:|blob:)/i.test(track.coverUrl.trim()))
      const matchesCover = coverFilter === 'all'
        || (coverFilter === 'with-cover' && hasRealCover)
        || (coverFilter === 'tone-only' && !hasRealCover)

      return matchesKeyword && matchesArtist && matchesAudio && matchesCover
    })
  }, [artistFilterId, audioFilter, coverFilter, librarySearch, tracks])

  const filteredArtists = useMemo(() => {
    const keyword = librarySearch.trim().toLowerCase()

    if (!keyword) {
      return artists
    }

    return artists.filter((artist) => artist.name.toLowerCase().includes(keyword))
  }, [artists, librarySearch])

  const libraryStats = useMemo(() => ({
    totalTracks: tracks.length,
    withAudio: tracks.filter((track) => Boolean(track.audioUrl)).length,
    withRealCover: tracks.filter((track) => Boolean(track.coverUrl?.trim() && /^(https?:\/\/|data:|blob:)/i.test(track.coverUrl.trim()))).length,
    totalArtists: artists.length,
  }), [artists.length, tracks])

  const syncDashboardData = async () => {
    await Promise.allSettled([
      loadEndpoint('my-music', true),
      loadEndpoint('overview', true),
    ])
  }

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file)

    if (mode !== 'new') {
      return
    }

    if (!file) {
      setDetectedDurationSeconds(null)
      setIsReadingDuration(false)
      return
    }

    const inferredMeta = inferTrackMetaFromFilename(file.name)
    setNewTrackTitle(inferredMeta.titleGuess)
    setNewTrackCoverUrl((current) => current || suggestCoverTone(inferredMeta.titleGuess))

    if (inferredMeta.artistGuess) {
      const matchedArtist = artists.find(
        (artist) => artist.name.trim().toLowerCase() === inferredMeta.artistGuess.trim().toLowerCase(),
      )

      if (matchedArtist) {
        setArtistMode('existing')
        setSelectedArtistId(matchedArtist.id)
        setNewArtistName('')
      } else {
        setArtistMode('new')
        setNewArtistName(inferredMeta.artistGuess)
      }
    }

    setIsReadingDuration(true)
    setErrorMessage(null)

    try {
      const duration = await readAudioDuration(file)
      setDetectedDurationSeconds(duration)
    } catch (error) {
      setDetectedDurationSeconds(null)
      setErrorMessage(error instanceof Error ? error.message : 'Khong doc duoc thoi luong file audio.')
    } finally {
      setIsReadingDuration(false)
    }
  }

  const handleUpload = async () => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const client = supabase

    if (mode === 'existing' && !selectedTrack) {
      setErrorMessage('Hay chon bai hat truoc khi upload.')
      return
    }

    if (!selectedFile) {
      setErrorMessage('Hay chon file MP3 hoac WAV truoc khi upload.')
      return
    }

    if (mode === 'new') {
      if (!newTrackTitle.trim()) {
        setErrorMessage('Hay nhap ten bai hat moi.')
        return
      }

      if (artistMode === 'existing' && !selectedArtistId) {
        setErrorMessage('Hay chon artist cho track moi.')
        return
      }

      if (artistMode === 'new' && !newArtistName.trim()) {
        setErrorMessage('Hay nhap ten artist moi.')
        return
      }

      if (!selectedFile) {
        setErrorMessage('Hay chon file audio de tao track moi.')
        return
      }

      if (isReadingDuration) {
        setErrorMessage('App dang doc thoi luong file audio, ban cho mot chut nhe.')
        return
      }

      if (!detectedDurationSeconds || detectedDurationSeconds <= 0) {
        setErrorMessage('Khong lay duoc thoi luong tu file audio nay. Thu file khac hoac doi sang MP3/WAV chuan hon.')
        return
      }
    }

    setIsUploading(true)
    setErrorMessage(null)

    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || 'mp3'
    let targetTrackId = selectedTrack?.id ?? ''
    let targetTrackTitle = selectedTrack?.title ?? newTrackTitle.trim()
    let targetTrackArtist = selectedTrack?.artist
      ?? (artistMode === 'new'
        ? newArtistName.trim()
        : (artists.find((artist) => artist.id === selectedArtistId)?.name ?? 'Unknown Artist'))
    let targetArtistId = selectedArtistId

    if (mode === 'new' && artistMode === 'new') {
      const insertArtistResult = await client
        .from('artists')
        .insert({
          name: newArtistName.trim(),
          slug: buildUniqueSlug(newArtistName),
        })
        .select('id, name')
        .single()

      if (insertArtistResult.error || !insertArtistResult.data) {
        setIsUploading(false)
        setErrorMessage(insertArtistResult.error?.message ?? 'Khong the tao artist moi trong database.')
        emitDataSourceNotice({
          endpoint: 'audio-upload',
          title: 'Tao artist that bai',
          message: 'Database chua cho insert vao public.artists. Hay chay lai supabase/policies.sql ban moi nhat.',
          tone: 'warning',
        })
        return
      }

      targetArtistId = insertArtistResult.data.id
      targetTrackArtist = insertArtistResult.data.name
      setArtists((current) => [
        { id: insertArtistResult.data.id, name: insertArtistResult.data.name },
        ...current,
      ])
      setSelectedArtistId(insertArtistResult.data.id)
      setArtistMode('existing')
      setNewArtistName('')
    }

    if (mode === 'new') {
      const baseSlug = sanitizeFileSegment(newTrackTitle)
      const slug = `track-${baseSlug}-${Date.now()}`
      const durationSeconds = detectedDurationSeconds ?? 0

      const insertTrackResult = await client
        .from('tracks')
        .insert({
          artist_id: targetArtistId,
          title: newTrackTitle.trim(),
          slug,
          duration_seconds: durationSeconds,
          cover_url: newTrackCoverUrl.trim() || null,
        })
        .select('id, title')
        .single()

      if (insertTrackResult.error || !insertTrackResult.data) {
        setIsUploading(false)
        setErrorMessage(insertTrackResult.error?.message ?? 'Khong the tao track moi trong database.')
        emitDataSourceNotice({
          endpoint: 'audio-upload',
          title: 'Tao track that bai',
          message: 'Database chua cho insert vao public.tracks. Hay chay lai supabase/policies.sql ban moi nhat.',
          tone: 'warning',
        })
        return
      }

      targetTrackId = insertTrackResult.data.id
      targetTrackTitle = insertTrackResult.data.title
    }

    const storagePath = `tracks/${targetTrackId}/${sanitizeFileSegment(targetTrackTitle)}.${extension}`

    const uploadResult = await client.storage
      .from(audioBucketName)
      .upload(storagePath, selectedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: selectedFile.type || 'audio/mpeg',
      })

    if (uploadResult.error) {
      setIsUploading(false)
      setErrorMessage(getReadableStorageErrorMessage(audioBucketName, uploadResult.error.message))
      emitDataSourceNotice({
        endpoint: 'audio-upload',
        title: 'Upload chua thanh cong',
        message: getReadableStorageErrorMessage(audioBucketName, uploadResult.error.message),
        tone: 'warning',
      })
      return
    }

    const nextAudioUrl = `${audioBucketName}:${storagePath}`
    const trackUpdateResult = await client
      .from('tracks')
      .update({ audio_url: nextAudioUrl })
      .eq('id', targetTrackId)

    if (trackUpdateResult.error) {
      setIsUploading(false)
      setErrorMessage(trackUpdateResult.error.message)
      emitDataSourceNotice({
        endpoint: 'audio-upload',
        title: 'Cap nhat track that bai',
        message: 'Database khong cho update tracks.audio_url. Hay chay lai supabase/policies.sql ban moi nhat.',
        tone: 'warning',
      })
      return
    }

    setTracks((current) => {
      const hasTrack = current.some((track) => track.id === targetTrackId)

      if (hasTrack) {
        return current.map((track) => (
          track.id === targetTrackId
            ? { ...track, audioUrl: nextAudioUrl }
            : track
        ))
      }

      return [
        {
          id: targetTrackId,
          title: targetTrackTitle,
          artist: targetTrackArtist,
          artistId: targetArtistId || undefined,
          audioUrl: nextAudioUrl,
          durationSeconds: detectedDurationSeconds ?? null,
        },
        ...current,
      ]
    })

    setSelectedTrackId(targetTrackId)
    setSelectedFile(null)
    setMode('existing')
    setArtistMode('existing')
    setNewArtistName('')
    setNewTrackTitle('')
    setDetectedDurationSeconds(null)
    setNewTrackCoverUrl('')
    setIsUploading(false)

    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'audio-upload',
      title: mode === 'new' ? 'Da tao track va upload MP3' : 'Da upload MP3 thanh cong',
      message: `${targetTrackTitle} da san sang phat nhac trong app.`,
      tone: 'success',
    })
  }

  const handleQuickArtistCreate = async () => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const trimmedName = quickArtistName.trim()
    if (!trimmedName) {
      setErrorMessage('Hay nhap ten artist moi.')
      return
    }

    setIsCreatingArtist(true)
    setErrorMessage(null)

    const { data, error } = await supabase
      .from('artists')
      .insert({
        name: trimmedName,
        slug: buildUniqueSlug(trimmedName),
      })
      .select('id, name')
      .single()

    setIsCreatingArtist(false)

    if (error || !data) {
      setErrorMessage(error?.message ?? 'Khong tao duoc artist moi.')
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Tao artist that bai',
        message: error?.message ?? 'Khong tao duoc artist moi.',
        tone: 'warning',
      })
      return
    }

    setArtists((current) => [{ id: data.id, name: data.name }, ...current])
    setSelectedArtistId(data.id)
    setQuickArtistName('')

    emitDataSourceNotice({
      endpoint: 'audio-library',
      title: 'Da tao artist moi',
      message: `${data.name} da duoc them vao library.`,
      tone: 'success',
    })
  }

  const handleTrackTitleSave = async (trackId: string, nextTitle: string) => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const trimmedTitle = nextTitle.trim()
    if (!trimmedTitle) {
      setErrorMessage('Ten track khong duoc de trong.')
      return
    }

    setSavingTrackId(trackId)
    setErrorMessage(null)

    const { error } = await supabase
      .from('tracks')
      .update({
        title: trimmedTitle,
        slug: buildUniqueSlug(trimmedTitle),
      })
      .eq('id', trackId)

    setSavingTrackId(null)

    if (error) {
      setErrorMessage(error.message)
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Luu track that bai',
        message: error.message,
        tone: 'warning',
      })
      return
    }

    setTracks((current) => current.map((track) => (
      track.id === trackId
        ? { ...track, title: trimmedTitle }
        : track
    )))

    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'audio-library',
      title: 'Da cap nhat track',
      message: `${trimmedTitle} da duoc doi ten thanh cong.`,
      tone: 'success',
    })
  }

  const handleTrackVisualSave = async (trackId: string, nextCoverUrl: string) => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const trimmedCoverUrl = nextCoverUrl.trim()

    setSavingTrackId(trackId)
    setErrorMessage(null)

    const { error } = await supabase
      .from('tracks')
      .update({
        cover_url: trimmedCoverUrl || null,
      })
      .eq('id', trackId)

    setSavingTrackId(null)

    if (error) {
      setErrorMessage(error.message)
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Luu cover that bai',
        message: error.message,
        tone: 'warning',
      })
      return
    }

    setTracks((current) => current.map((track) => (
      track.id === trackId
        ? { ...track, coverUrl: trimmedCoverUrl || null }
        : track
    )))

    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'audio-library',
      title: 'Da cap nhat cover',
      message: 'Track da duoc doi cover/tone thanh cong.',
      tone: 'success',
    })
  }

  const handleTrackCoverUpload = async (trackId: string, file: File | null) => {
    if (!file) {
      return
    }

    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const track = tracks.find((item) => item.id === trackId)
    if (!track) {
      setErrorMessage('Khong tim thay track de upload cover.')
      return
    }

    setUploadingCoverTrackId(trackId)
    setErrorMessage(null)

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `tracks/${trackId}/cover-${Date.now()}.${extension}`

    const uploadResult = await supabase.storage
      .from(coverBucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      })

    if (uploadResult.error) {
      setUploadingCoverTrackId(null)
      const message = getReadableStorageErrorMessage(coverBucketName, uploadResult.error.message)
      setErrorMessage(message)
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Upload cover that bai',
        message,
        tone: 'warning',
      })
      return
    }

    const { data } = supabase.storage
      .from(coverBucketName)
      .getPublicUrl(storagePath)

    const publicUrl = data.publicUrl

    const updateResult = await supabase
      .from('tracks')
      .update({ cover_url: publicUrl })
      .eq('id', trackId)

    setUploadingCoverTrackId(null)

    if (updateResult.error) {
      setErrorMessage(updateResult.error.message)
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Gan cover that bai',
        message: updateResult.error.message,
        tone: 'warning',
      })
      return
    }

    setTracks((current) => current.map((item) => (
      item.id === trackId
        ? { ...item, coverUrl: publicUrl }
        : item
    )))

    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'audio-library',
      title: 'Da upload cover',
      message: `Cover moi da duoc gan cho ${track.title}.`,
      tone: 'success',
    })
  }

  const handleArtistNameSave = async (artistId: string, nextName: string) => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const trimmedName = nextName.trim()
    if (!trimmedName) {
      setErrorMessage('Ten artist khong duoc de trong.')
      return
    }

    setSavingArtistId(artistId)
    setErrorMessage(null)

    const { error } = await supabase
      .from('artists')
      .update({
        name: trimmedName,
        slug: buildUniqueSlug(trimmedName),
      })
      .eq('id', artistId)

    setSavingArtistId(null)

    if (error) {
      setErrorMessage(error.message)
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Luu artist that bai',
        message: error.message,
        tone: 'warning',
      })
      return
    }

    setArtists((current) => current.map((artist) => (
      artist.id === artistId
        ? { ...artist, name: trimmedName }
        : artist
    )))
    setTracks((current) => current.map((track) => (
      track.artistId === artistId
        ? { ...track, artist: trimmedName }
        : track
    )))

    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'audio-library',
      title: 'Da cap nhat artist',
      message: `${trimmedName} da duoc cap nhat trong library.`,
      tone: 'success',
    })
  }

  const handleTrackDelete = async (trackId: string) => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    const track = tracks.find((item) => item.id === trackId)
    if (!track) {
      return
    }

    const confirmed = window.confirm(`Xoa track "${track.title}" khoi library?`)
    if (!confirmed) {
      return
    }

    setDeletingTrackId(trackId)
    setErrorMessage(null)

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)

    setDeletingTrackId(null)

    if (error) {
      setErrorMessage(error.message)
      emitDataSourceNotice({
        endpoint: 'audio-library',
        title: 'Xoa track that bai',
        message: error.message,
        tone: 'warning',
      })
      return
    }

    const nextTracks = tracks.filter((item) => item.id !== trackId)
    setTracks(nextTracks)
    if (selectedTrackId === trackId) {
      setSelectedTrackId(nextTracks[0]?.id ?? '')
    }

    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'audio-library',
      title: 'Da xoa track',
      message: `${track.title} da duoc xoa khoi library.`,
      tone: 'success',
    })
  }

  return (
    <Panel>
      <SectionHeader title="Upload MP3" subtitle="Them file nhac that tu giao dien website" />

      {!isSupabaseConfigured ? (
        <div className="rounded-[18px] border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800">
          Ban can cau hinh `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` trong `.env` truoc khi upload nhac.
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'existing'
                  ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white shadow-[0_12px_20px_rgba(157,115,239,0.22)]'
                  : 'bg-white/70 text-[#6f6387] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
              }`}
            >
              Gan vao track co san
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'new'
                  ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white shadow-[0_12px_20px_rgba(157,115,239,0.22)]'
                  : 'bg-white/70 text-[#6f6387] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
              }`}
            >
              Tao track moi
            </button>
          </div>

          {mode === 'existing' ? (
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d728e]">Chon bai hat</span>
            <select
              value={selectedTrackId}
              onChange={(event) => setSelectedTrackId(event.target.value)}
              disabled={isLoadingTracks || isUploading || !tracks.length}
              className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
            >
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title} - {track.artist}
                </option>
              ))}
            </select>
          </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-[#7d728e]">Ten bai hat moi</span>
                <input
                  type="text"
                  value={newTrackTitle}
                  onChange={(event) => setNewTrackTitle(event.target.value)}
                  disabled={isUploading}
                  placeholder="Vi du: Starlight Echo"
                  className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#7d728e]">Artist</span>
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setArtistMode('existing')}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        artistMode === 'existing'
                          ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white shadow-[0_10px_18px_rgba(157,115,239,0.2)]'
                          : 'bg-white/72 text-[#6f6387] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
                      }`}
                    >
                      Artist co san
                    </button>
                    <button
                      type="button"
                      onClick={() => setArtistMode('new')}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        artistMode === 'new'
                          ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white shadow-[0_10px_18px_rgba(157,115,239,0.2)]'
                          : 'bg-white/72 text-[#6f6387] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
                      }`}
                    >
                      Tao artist moi
                    </button>
                  </div>

                  {artistMode === 'existing' ? (
                    <select
                      value={selectedArtistId}
                      onChange={(event) => setSelectedArtistId(event.target.value)}
                      disabled={isUploading || !artists.length}
                      className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                    >
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newArtistName}
                      onChange={(event) => setNewArtistName(event.target.value)}
                      disabled={isUploading}
                      placeholder="Vi du: Keshi"
                      className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                    />
                  )}
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#7d728e]">Thoi luong tu file</span>
                <div className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  {isReadingDuration
                    ? 'Dang doc metadata file...'
                    : detectedDurationSeconds
                      ? `${detectedDurationSeconds} giay`
                      : 'Chon file audio de app tu lay thoi luong'}
                </div>
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-[#7d728e]">Cover tone / cover_url (khong bat buoc)</span>
                <input
                  type="text"
                  value={newTrackCoverUrl}
                  onChange={(event) => setNewTrackCoverUrl(event.target.value)}
                  disabled={isUploading}
                  placeholder="Vi du: moon-river"
                  className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                />
              </label>

              <div className="sm:col-span-2 rounded-[18px] bg-white/55 px-4 py-3 text-sm leading-6 text-[#6f6387]">
                <p><span className="font-semibold text-[#30294f]">Tu dong dien title:</span> ten file se duoc doi thanh ten bai hat de doc hon.</p>
                <p><span className="font-semibold text-[#30294f]">Tu dong doan artist:</span> neu ten file theo dang `Artist - Song.mp3`, app se tu chon artist neu tim thay.</p>
                <p><span className="font-semibold text-[#30294f]">Goi y cover:</span> app se tu map keyword sang cover tone nhu `coffee-latte`, `weekend-van`, `moon-river`.</p>
              </div>

              <div className="sm:col-span-2 grid gap-4 rounded-[20px] border border-white/70 bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:grid-cols-[92px_1fr]">
                <div className="h-[92px] w-[92px] overflow-hidden rounded-[20px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.24)]">
                  <img
                    src={getCoverArt(newTrackPreviewTone)}
                    alt={newTrackTitle || 'Track preview'}
                    className="artwork-media h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 self-center">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#9b8fb3] uppercase">Preview</p>
                  <strong className="mt-1 block truncate text-[1.08rem] text-[#30294f]">{newTrackTitle || 'Track moi'}</strong>
                  <span className="mt-1 block truncate text-sm text-[#7d728e]">{selectedArtist?.name ?? 'Unknown Artist'}</span>
                  <span className="mt-2 inline-flex rounded-full bg-[#f4ecff] px-3 py-1 text-xs font-semibold text-[#8f6aea]">
                    {newTrackPreviewTone}
                  </span>
                </div>
              </div>
            </div>
          )}

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#7d728e]">Chon file audio</span>
            <input
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
              disabled={isUploading}
              onChange={(event) => { void handleFileChange(event.target.files?.[0] ?? null) }}
              className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-sm text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] file:mr-3 file:rounded-full file:border-0 file:bg-[#f4ecff] file:px-4 file:py-2.5 file:font-semibold file:text-[#8f6aea]"
            />
          </label>

          <div className="rounded-[18px] bg-white/55 px-4 py-3 text-sm leading-6 text-[#6f6387]">
            <p><span className="font-semibold text-[#30294f]">Bucket:</span> {audioBucketName}</p>
            <p><span className="font-semibold text-[#30294f]">Mode:</span> {mode === 'existing' ? 'Gan vao track co san' : 'Tao track moi'}</p>
            <p><span className="font-semibold text-[#30294f]">Track:</span> {mode === 'existing' ? (selectedTrack ? `${selectedTrack.title} - ${selectedTrack.artist}` : 'Chua chon') : newTrackPreviewLabel}</p>
            <p><span className="font-semibold text-[#30294f]">File:</span> {selectedFile?.name ?? 'Chua chon file'}</p>
            {mode === 'new' ? (
              <p><span className="font-semibold text-[#30294f]">Duration:</span> {isReadingDuration ? 'Dang doc...' : detectedDurationSeconds ? `${detectedDurationSeconds} giay` : 'Chua doc duoc'}</p>
            ) : null}
            <p><span className="font-semibold text-[#30294f]">Audio hien tai:</span> {mode === 'existing' ? (selectedTrack?.audioUrl ?? 'Dang dung demo audio') : 'Track moi se duoc tao sau khi upload'}</p>
          </div>

          {errorMessage ? (
            <div className="rounded-[18px] border border-rose-200/70 bg-rose-50/85 px-4 py-3 text-sm leading-6 text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <MotionButton
              onClick={() => { void handleUpload() }}
              className="rounded-full bg-linear-to-r from-[#b98eff] to-[#9872ef] px-5 py-3 font-extrabold text-white shadow-[0_14px_24px_rgba(157,115,239,0.24)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isUploading ? 'Dang upload...' : mode === 'new' ? 'Tao track moi va upload MP3' : 'Upload va gan vao track'}
            </MotionButton>
            <span className="text-sm text-[#7d728e]">
              {isLoadingTracks ? 'Dang tai danh sach track...' : `${tracks.length} track san sang`}
            </span>
          </div>

          <div className="grid gap-5 rounded-[24px] border border-white/75 bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] lg:grid-cols-[1.35fr_1fr]">
            <div className="grid gap-4">
              <SectionHeader title="Quan ly tracks" subtitle="Tim kiem, doi ten, xoa track ngay tren web" />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[18px] border border-white/75 bg-white/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                  <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">Tong tracks</p>
                  <strong className="mt-2 block text-[1.7rem] text-[#30294f]">{libraryStats.totalTracks}</strong>
                </div>
                <div className="rounded-[18px] border border-white/75 bg-white/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                  <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">Co audio that</p>
                  <strong className="mt-2 block text-[1.7rem] text-[#30294f]">{libraryStats.withAudio}</strong>
                </div>
                <div className="rounded-[18px] border border-white/75 bg-white/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                  <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">Co cover that</p>
                  <strong className="mt-2 block text-[1.7rem] text-[#30294f]">{libraryStats.withRealCover}</strong>
                </div>
                <div className="rounded-[18px] border border-white/75 bg-white/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                  <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">Tong artists</p>
                  <strong className="mt-2 block text-[1.7rem] text-[#30294f]">{libraryStats.totalArtists}</strong>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#7d728e]">Tim trong library</span>
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(event) => setLibrarySearch(event.target.value)}
                  placeholder="Vi du: coffee, sunset, lofi..."
                  className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#7d728e]">Loc theo artist</span>
                  <select
                    value={artistFilterId}
                    onChange={(event) => setArtistFilterId(event.target.value)}
                    className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                  >
                    <option value="all">Tat ca artists</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#7d728e]">Loc theo audio</span>
                  <select
                    value={audioFilter}
                    onChange={(event) => setAudioFilter(event.target.value as AudioFilter)}
                    className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                  >
                    <option value="all">Tat ca</option>
                    <option value="with-audio">Da co audio</option>
                    <option value="demo-only">Dang dung demo</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#7d728e]">Loc theo cover</span>
                  <select
                    value={coverFilter}
                    onChange={(event) => setCoverFilter(event.target.value as CoverFilter)}
                    className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                  >
                    <option value="all">Tat ca</option>
                    <option value="with-cover">Co cover that</option>
                    <option value="tone-only">Chi dung tone/preset</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3">
                {filteredTracks.length ? (
                  filteredTracks.map((track) => (
                    <TrackLibraryRow
                      key={track.id}
                      track={track}
                      isSaving={savingTrackId === track.id}
                      isDeleting={deletingTrackId === track.id}
                      isUploadingCover={uploadingCoverTrackId === track.id}
                      onSave={(nextTitle) => { void handleTrackTitleSave(track.id, nextTitle) }}
                      onSaveVisual={(nextCoverUrl) => { void handleTrackVisualSave(track.id, nextCoverUrl) }}
                      onUploadCover={(file) => { void handleTrackCoverUpload(track.id, file) }}
                      onDelete={() => { void handleTrackDelete(track.id) }}
                    />
                  ))
                ) : (
                  <div className="rounded-[18px] bg-white/70 px-4 py-3 text-sm text-[#7d728e]">
                    Khong tim thay track nao khop voi tu khoa hien tai.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <SectionHeader title="Quan ly artists" subtitle="Doi ten artist de dong bo lai giao dien" />

              <div className="rounded-[20px] border border-white/75 bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                <p className="text-sm font-semibold text-[#30294f]">Tao artist nhanh</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={quickArtistName}
                    onChange={(event) => setQuickArtistName(event.target.value)}
                    placeholder="Vi du: keshi, wave to earth..."
                    disabled={isCreatingArtist}
                    className="min-w-0 flex-1 rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { void handleQuickArtistCreate() }}
                    disabled={isCreatingArtist || !quickArtistName.trim()}
                    className="rounded-full bg-[#f2e8ff] px-4 py-3 text-sm font-semibold text-[#7e58d7] transition hover:bg-[#eadbff] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isCreatingArtist ? 'Dang tao...' : 'Tao artist'}
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {filteredArtists.length ? (
                  filteredArtists.map((artist) => (
                    <ArtistLibraryRow
                      key={artist.id}
                      artist={artist}
                      trackCount={tracks.filter((track) => track.artistId === artist.id).length}
                      isSaving={savingArtistId === artist.id}
                      onSave={(nextName) => { void handleArtistNameSave(artist.id, nextName) }}
                    />
                  ))
                ) : (
                  <div className="rounded-[18px] bg-white/70 px-4 py-3 text-sm text-[#7d728e]">
                    Khong tim thay artist nao khop voi tu khoa hien tai.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}

function TrackLibraryRow({
  track,
  isSaving,
  isDeleting,
  isUploadingCover,
  onSave,
  onSaveVisual,
  onUploadCover,
  onDelete,
}: {
  track: UploadTrackOption
  isSaving: boolean
  isDeleting: boolean
  isUploadingCover: boolean
  onSave: (nextTitle: string) => void
  onSaveVisual: (nextCoverUrl: string) => void
  onUploadCover: (file: File | null) => void
  onDelete: () => void
}) {
  const [draftTitle, setDraftTitle] = useState(track.title)
  const [draftCoverUrl, setDraftCoverUrl] = useState(track.coverUrl?.trim() || '')
  const [isDraggingCover, setIsDraggingCover] = useState(false)

  useEffect(() => {
    setDraftTitle(track.title)
  }, [track.title])

  useEffect(() => {
    setDraftCoverUrl(track.coverUrl?.trim() || '')
  }, [track.coverUrl])

  const hasChanged = draftTitle.trim() !== track.title.trim()
  const hasVisualChanged = draftCoverUrl.trim() !== (track.coverUrl?.trim() || '')
  const durationLabel = track.durationSeconds
    ? `${Math.floor(track.durationSeconds / 60)}:${String(track.durationSeconds % 60).padStart(2, '0')}`
    : '--:--'
  const coverTone = draftCoverUrl.trim() || suggestCoverTone(draftTitle || track.title)
  const audioStatus = track.audioUrl ? 'Da co audio that' : 'Dang dung demo audio'

  const handleCoverDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingCover(false)

    const file = event.dataTransfer.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      return
    }

    onUploadCover(file)
  }

  return (
    <div className="rounded-[20px] border border-white/75 bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDraggingCover(true)
            }}
            onDragLeave={() => setIsDraggingCover(false)}
            onDrop={handleCoverDrop}
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[16px] shadow-[inset_0_8px_14px_rgba(255,255,255,0.24)] transition ${
              isDraggingCover ? 'ring-2 ring-[#9b74ff] ring-offset-2 ring-offset-white/60' : ''
            }`}
          >
            <img
              src={getCoverArt(coverTone)}
              alt={track.title}
              className="artwork-media h-full w-full object-cover"
            />
            <div className={`absolute inset-0 flex items-center justify-center bg-[#30294f]/45 text-[10px] font-bold text-white transition ${
              isDraggingCover ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            >
              Drop
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#30294f]">{track.artist}</p>
            <p className="mt-1 text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">{durationLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f4ecff] px-2.5 py-1 text-[11px] font-semibold text-[#8f6aea]">
                {coverTone}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                track.audioUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
              }`}
              >
                {audioStatus}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting || isSaving}
          className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? 'Dang xoa...' : 'Xoa'}
        </button>
      </div>

      <input
        type="text"
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        disabled={isSaving || isDeleting}
        className="mt-3 w-full rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
      />

      <div className="mt-3 grid gap-2">
        <span className="text-xs font-semibold tracking-[0.14em] text-[#9b8fb3] uppercase">Cover tone / cover_url</span>
        <input
          type="text"
          value={draftCoverUrl}
          onChange={(event) => setDraftCoverUrl(event.target.value)}
          disabled={isSaving || isDeleting || isUploadingCover}
          placeholder="Vi du: moon-river"
          className="w-full rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
        />
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-2 text-xs font-semibold text-[#4b7fd6] transition hover:bg-[#e0efff]">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            disabled={isSaving || isDeleting || isUploadingCover}
            onChange={(event) => onUploadCover(event.target.files?.[0] ?? null)}
            className="hidden"
          />
          {isUploadingCover ? 'Dang upload cover...' : 'Upload anh cover that'}
        </label>
        <span className="text-[11px] text-[#8b7ea2]">
          Hoac keo tha anh vao thumbnail ben trai
        </span>
        <div className="flex flex-wrap gap-2">
          {coverToneOptions.map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setDraftCoverUrl(tone)}
              disabled={isSaving || isDeleting || isUploadingCover}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                draftCoverUrl.trim() === tone
                  ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white shadow-[0_10px_18px_rgba(157,115,239,0.2)]'
                  : 'bg-[#f4ecff] text-[#8f6aea] hover:bg-[#eadcff]'
              } disabled:cursor-not-allowed disabled:opacity-55`}
            >
              {tone}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDraftCoverUrl('')}
            disabled={isSaving || isDeleting || isUploadingCover}
            className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#7d728e] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            Auto theo title
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onSave(draftTitle)}
          disabled={!hasChanged || isSaving || isDeleting || isUploadingCover}
          className="rounded-full bg-[#f2e8ff] px-4 py-2 text-sm font-semibold text-[#7e58d7] transition hover:bg-[#eadbff] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? 'Dang luu...' : 'Luu ten track'}
        </button>
        <button
          type="button"
          onClick={() => onSaveVisual(draftCoverUrl)}
          disabled={!hasVisualChanged || isSaving || isDeleting || isUploadingCover}
          className="rounded-full bg-[#ffe9f4] px-4 py-2 text-sm font-semibold text-[#d15c9a] transition hover:bg-[#ffdceb] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? 'Dang luu...' : 'Luu cover'}
        </button>
        <span className="text-xs text-[#8b7ea2]">
          Track ID: {track.id.slice(0, 8)}...
        </span>
      </div>
    </div>
  )
}

function ArtistLibraryRow({
  artist,
  trackCount,
  isSaving,
  onSave,
}: {
  artist: ArtistOption
  trackCount: number
  isSaving: boolean
  onSave: (nextName: string) => void
}) {
  const [draftName, setDraftName] = useState(artist.name)

  useEffect(() => {
    setDraftName(artist.name)
  }, [artist.name])

  const hasChanged = draftName.trim() !== artist.name.trim()

  return (
    <div className="rounded-[20px] border border-white/75 bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">Artist</p>
          <p className="mt-1 text-sm text-[#7d728e]">{trackCount} track</p>
        </div>
        <span className="rounded-full bg-[#f4ecff] px-3 py-1 text-xs font-semibold text-[#8f6aea]">
          {artist.id.slice(0, 6)}
        </span>
      </div>

      <input
        type="text"
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        disabled={isSaving}
        className="mt-3 w-full rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
      />

      <button
        type="button"
        onClick={() => onSave(draftName)}
        disabled={!hasChanged || isSaving}
        className="mt-3 rounded-full bg-[#f2e8ff] px-4 py-2 text-sm font-semibold text-[#7e58d7] transition hover:bg-[#eadbff] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSaving ? 'Dang luu...' : 'Luu ten artist'}
      </button>
    </div>
  )
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
  const [selectedThemeName, setSelectedThemeName] = useState('Lavender')
  const [textScale, setTextScale] = useState(1)
  const [isSavingAppearance, setIsSavingAppearance] = useState(false)

  useEffect(() => {
    if (!data?.appearanceThemes.length) {
      return
    }

    setSelectedThemeName((current) => current || data.appearanceThemes[0].name)
  }, [data])

  useEffect(() => {
    if (!data || !supabase || !isSupabaseConfigured) {
      return
    }

    const client = supabase
    let isMounted = true

    const loadAppearanceSettings = async () => {
      const { data: appearanceData, error } = await client
        .from('appearance_settings')
        .select('theme_name, text_scale')
        .eq('profile_id', DEMO_PROFILE_ID)
        .maybeSingle()

      if (!isMounted || error || !appearanceData) {
        return
      }

      setSelectedThemeName(appearanceData.theme_name || 'Lavender')
      setTextScale(Number(appearanceData.text_scale) || 1)
      localStorage.setItem(
        APPEARANCE_STORAGE_KEY,
        JSON.stringify({
          themeName: appearanceData.theme_name || 'Lavender',
          textScale: Number(appearanceData.text_scale) || 1,
        }),
      )
      window.dispatchEvent(new CustomEvent('appearance-settings-updated'))
    }

    void loadAppearanceSettings()

    return () => {
      isMounted = false
    }
  }, [data])

  if (!data) {
    return <PageDataFallback title="Loading settings" />
  }

  const { appearanceThemes, connectedDevices, notificationSettings, playbackOptions, privacyOptions } = data
  const currentThemeTone = appearanceThemes.find((theme) => theme.name === selectedThemeName)?.tone ?? appearanceThemes[0]?.tone ?? 'lavender'

  const saveAppearanceSettings = async (nextThemeName: string, nextTextScale: number) => {
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({
        themeName: nextThemeName,
        textScale: Number(nextTextScale.toFixed(2)),
      }),
    )
    window.dispatchEvent(new CustomEvent('appearance-settings-updated'))

    if (!supabase || !isSupabaseConfigured) {
      emitDataSourceNotice({
        endpoint: 'settings-appearance',
        title: 'Dang xem local preview',
        message: 'Supabase chua duoc cau hinh, nen thay doi Appearance moi chi hien tren giao dien hien tai.',
        tone: 'warning',
      })
      return
    }

    const client = supabase
    setIsSavingAppearance(true)

    const { error } = await client
      .from('appearance_settings')
      .upsert({
        profile_id: DEMO_PROFILE_ID,
        theme_name: nextThemeName,
        text_scale: Number(nextTextScale.toFixed(2)),
      }, {
        onConflict: 'profile_id',
      })

    setIsSavingAppearance(false)

    if (error) {
      emitDataSourceNotice({
        endpoint: 'settings-appearance',
        title: 'Luu Appearance that bai',
        message: error.message,
        tone: 'warning',
      })
      return
    }

    emitDataSourceNotice({
      endpoint: 'settings-appearance',
      title: 'Da luu Appearance',
      message: `${nextThemeName} / text scale ${nextTextScale.toFixed(2)} da duoc luu vao Supabase.`,
      tone: 'success',
    })
  }

  const handleThemeSelect = async (themeName: string) => {
    setSelectedThemeName(themeName)
    await saveAppearanceSettings(themeName, textScale)
  }

  const handleTextScaleCommit = async (nextScale: number) => {
    await saveAppearanceSettings(selectedThemeName, nextScale)
  }

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

      <AnimatedSection
        delay={0.05}
        className="grid items-center gap-4 rounded-[24px] border border-white/70 bg-linear-to-br from-[color-mix(in_srgb,var(--route-accent-soft)_74%,white)] via-[color-mix(in_srgb,var(--route-accent-soft)_84%,white)] to-[color-mix(in_srgb,var(--route-accent)_26%,white)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_var(--route-chip-shadow)] sm:gap-6 sm:rounded-[28px] sm:px-6 sm:py-5 lg:grid-cols-[1.1fr_0.9fr]"
      >
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
              <MotionButton className="w-full rounded-full bg-linear-to-r from-[var(--route-accent)] to-[var(--route-accent-strong)] px-5 py-3 font-extrabold text-white shadow-[0_14px_24px_var(--route-chip-shadow)] md:w-auto">
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
            <span className={`rounded-full bg-linear-to-r px-3 py-1 text-xs font-bold text-white ${themeClasses[currentThemeTone]}`}>
              {selectedThemeName}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2">
            {appearanceThemes.map((theme) => {
              const isSelected = selectedThemeName === theme.name

              return (
                <motion.button
                  key={theme.name}
                  type="button"
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { void handleThemeSelect(theme.name) }}
                  disabled={isSavingAppearance}
                  className={`relative min-h-[100px] rounded-[18px] bg-linear-to-br p-3 text-left shadow-[inset_0_8px_14px_rgba(255,255,255,0.22)] transition sm:min-h-[120px] sm:rounded-[22px] sm:p-4 ${themeClasses[theme.tone]} ${
                    isSelected ? 'ring-3 ring-white/85 shadow-[0_16px_28px_rgba(157,115,239,0.28)]' : 'opacity-88'
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                  aria-pressed={isSelected}
                >
                  {isSelected ? (
                    <span className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-[#8f6aea]">
                      <CheckIcon size={16} />
                    </span>
                  ) : null}
                  <div className="flex h-full items-end justify-between gap-3">
                    <strong className="text-white">{theme.name}</strong>
                    {isSelected ? <span className="text-xs font-bold text-white/92">Dang chon</span> : null}
                  </div>
                </motion.button>
              )
            })}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[#7d728e]">
              <span>Text Size</span>
              <span className="font-semibold">{textScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.2"
              step="0.01"
              value={textScale}
              onChange={(event) => setTextScale(Number(event.target.value))}
              onMouseUp={(event) => { void handleTextScaleCommit(Number((event.target as HTMLInputElement).value)) }}
              onTouchEnd={(event) => { void handleTextScaleCommit(Number((event.target as HTMLInputElement).value)) }}
              onKeyUp={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
                  void handleTextScaleCommit(Number((event.target as HTMLInputElement).value))
                }
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e7dcf6] accent-[#9c79ec]"
            />
            <div className="mt-3 flex items-center justify-between text-xs font-semibold tracking-[0.12em] text-[#a092ba] uppercase">
              <span>Compact</span>
              <span>{isSavingAppearance ? 'Dang luu...' : 'Auto save'}</span>
              <span>Large</span>
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
          <MotionButton className="mt-5 w-full rounded-full bg-[var(--route-chip-bg)] px-5 py-3 font-extrabold text-[var(--route-accent-strong)] shadow-[var(--route-chip-shadow)]">
            Connect New Device
          </MotionButton>
        </article>
      </AnimatedSection>

      <AnimatedSection delay={0.14} className="grid gap-3 sm:gap-[18px] xl:grid-cols-[1fr_1fr]">
        <TiltCard as="article" className={`${panelClass} relative bg-linear-to-br from-[color-mix(in_srgb,var(--route-accent-soft)_76%,white)] to-[color-mix(in_srgb,var(--route-accent)_56%,white)]`}>
          <h3 className="mb-[18px] text-[1.2rem] font-extrabold text-[#30294f]">Subscription</h3>
          <div className="rounded-[20px] bg-linear-to-br from-[color-mix(in_srgb,var(--route-accent-soft)_72%,white)] to-[color-mix(in_srgb,var(--route-accent)_70%,white)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:rounded-[24px] sm:p-5">
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
                <span className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-[var(--route-chip-bg)] font-extrabold text-[var(--route-accent-strong)]">
                  {(() => { const Icon = privacyIconMap[item.icon as keyof typeof privacyIconMap]; return Icon ? <Icon size={18} /> : item.icon })()}
                </span>
                <div>
                  <strong className="block text-sm text-[#30294f] sm:text-base">{item.title}</strong>
                  <span className="text-xs text-[#7d728e] sm:text-base">{item.note}</span>
                </div>
                {item.type === 'toggle' ? <Toggle enabled={Boolean(item.enabled)} /> : <span className="text-[var(--route-accent-strong)]"><ChevronRightIcon size={18} /></span>}
              </motion.div>
            ))}
          </div>
        </article>
      </AnimatedSection>

      <AnimatedSection delay={0.17} className="grid items-center gap-4 rounded-[24px] bg-linear-to-r from-[var(--route-accent)] to-[var(--route-accent-strong)] px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),var(--route-chip-shadow)] sm:rounded-[28px] sm:px-5 lg:grid-cols-[120px_1fr_auto] lg:text-left">
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
