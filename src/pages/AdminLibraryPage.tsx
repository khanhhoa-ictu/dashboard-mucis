import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { motion } from 'motion/react'
import { getCoverArt } from '../assets/covers/coverArt'
import {
  HeaderActions,
  ListMusicIcon,
  MotionButton,
  PageDataFallback,
  Panel,
  SearchField,
  SectionHeader,
} from '../components/ui'
import { useMockApiContext } from '../context/MockApiContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'
import { emitDataSourceNotice } from '../lib/supabase/statusEvents'

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
] as const

type TrackRow = {
  id: string
  title: string
  artist: string
  artistId?: string
  audioUrl: string | null
  durationSeconds?: number | null
  coverUrl?: string | null
}

type ArtistRow = {
  id: string
  name: string
}

type UploadMode = 'existing' | 'new'
type ArtistMode = 'existing' | 'new'
type AudioFilter = 'all' | 'with-audio' | 'demo-only'
type CoverFilter = 'all' | 'with-cover' | 'tone-only'
type AdminTab = 'tracks' | 'uploads' | 'artists'

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

function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds) return '--:--'
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function hasRealCover(value?: string | null) {
  return Boolean(value?.trim() && /^(https?:\/\/|data:|blob:)/i.test(value.trim()))
}

function AdminLibraryPage() {
  const { loadEndpoint } = useMockApiContext()
  const [tracks, setTracks] = useState<TrackRow[] | null>(null)
  const [artists, setArtists] = useState<ArtistRow[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [mode, setMode] = useState<UploadMode>('existing')
  const [artistMode, setArtistMode] = useState<ArtistMode>('existing')
  const [newArtistName, setNewArtistName] = useState('')
  const [newTrackTitle, setNewTrackTitle] = useState('')
  const [newTrackCoverUrl, setNewTrackCoverUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [detectedDurationSeconds, setDetectedDurationSeconds] = useState<number | null>(null)
  const [isReadingDuration, setIsReadingDuration] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [quickArtistName, setQuickArtistName] = useState('')
  const [isCreatingArtist, setIsCreatingArtist] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('tracks')
  const [audioFilter, setAudioFilter] = useState<AudioFilter>('all')
  const [coverFilter, setCoverFilter] = useState<CoverFilter>('all')
  const [artistFilterId, setArtistFilterId] = useState('all')
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [bulkCoverTone, setBulkCoverTone] = useState<(typeof coverToneOptions)[number]>('dream-clouds')
  const [savingTrackId, setSavingTrackId] = useState<string | null>(null)
  const [savingArtistId, setSavingArtistId] = useState<string | null>(null)
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkUpdatingCover, setIsBulkUpdatingCover] = useState(false)
  const [uploadingCoverTrackId, setUploadingCoverTrackId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const syncDashboardData = async () => {
    await Promise.allSettled([
      loadEndpoint('my-music', true),
      loadEndpoint('overview', true),
    ])
  }

  const refreshLibrary = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return
    }

    setErrorMessage(null)

    const [tracksResult, artistsResult] = await Promise.all([
      supabase
        .from('tracks')
        .select('id, title, artist_id, audio_url, duration_seconds, cover_url')
        .order('title', { ascending: true }),
      supabase
        .from('artists')
        .select('id, name')
        .order('name', { ascending: true }),
    ])

    if (tracksResult.error || artistsResult.error) {
      setErrorMessage(tracksResult.error?.message ?? artistsResult.error?.message ?? 'Khong tai duoc library tu Supabase.')
      return
    }

    const artistMap = new Map((artistsResult.data ?? []).map((artist) => [artist.id, artist.name]))
    const nextArtists = (artistsResult.data ?? []).map((artist) => ({ id: artist.id, name: artist.name }))
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
  }

  useEffect(() => {
    void refreshLibrary()
  }, [])

  const selectedTrack = useMemo(
    () => tracks?.find((track) => track.id === selectedTrackId) ?? null,
    [selectedTrackId, tracks],
  )

  const selectedArtist = useMemo(
    () => artists.find((artist) => artist.id === selectedArtistId) ?? null,
    [artists, selectedArtistId],
  )

  const filteredTracks = useMemo(() => {
    const currentTracks = tracks ?? []
    const keyword = search.trim().toLowerCase()

    return currentTracks.filter((track) => {
      const matchesKeyword = !keyword || `${track.title} ${track.artist}`.toLowerCase().includes(keyword)
      const matchesArtist = artistFilterId === 'all' || track.artistId === artistFilterId
      const matchesAudio = audioFilter === 'all'
        || (audioFilter === 'with-audio' && Boolean(track.audioUrl))
        || (audioFilter === 'demo-only' && !track.audioUrl)
      const matchesCover = coverFilter === 'all'
        || (coverFilter === 'with-cover' && hasRealCover(track.coverUrl))
        || (coverFilter === 'tone-only' && !hasRealCover(track.coverUrl))

      return matchesKeyword && matchesArtist && matchesAudio && matchesCover
    })
  }, [artistFilterId, audioFilter, coverFilter, search, tracks])

  const filteredArtists = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) {
      return artists
    }
    return artists.filter((artist) => artist.name.toLowerCase().includes(keyword))
  }, [artists, search])

  const stats = useMemo(() => {
    const currentTracks = tracks ?? []
    return {
      totalTracks: currentTracks.length,
      withAudio: currentTracks.filter((track) => Boolean(track.audioUrl)).length,
      withRealCover: currentTracks.filter((track) => hasRealCover(track.coverUrl)).length,
      totalArtists: artists.length,
    }
  }, [artists.length, tracks])

  const newTrackPreviewTone = useMemo(
    () => newTrackCoverUrl.trim() || suggestCoverTone(newTrackTitle),
    [newTrackCoverUrl, newTrackTitle],
  )

  const allFilteredTrackIds = useMemo(
    () => filteredTracks.map((track) => track.id),
    [filteredTracks],
  )

  const selectedFilteredTrackIds = useMemo(
    () => selectedTrackIds.filter((trackId) => allFilteredTrackIds.includes(trackId)),
    [allFilteredTrackIds, selectedTrackIds],
  )

  const areAllFilteredTracksSelected = Boolean(
    allFilteredTrackIds.length && selectedFilteredTrackIds.length === allFilteredTrackIds.length,
  )

  const newTrackPreviewLabel = useMemo(() => {
    const artistName = artistMode === 'new'
      ? (newArtistName.trim() || 'New Artist')
      : (selectedArtist?.name ?? 'Unknown Artist')
    return `${newTrackTitle.trim() || 'Track moi'} - ${artistName}`
  }, [artistMode, newArtistName, newTrackTitle, selectedArtist])

  useEffect(() => {
    setSelectedTrackIds((current) => current.filter((trackId) => tracks?.some((track) => track.id === trackId)))
  }, [tracks])

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file)

    if (mode !== 'new' || !file) {
      if (!file) {
        setDetectedDurationSeconds(null)
        setIsReadingDuration(false)
      }
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

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((current) => (
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId]
    ))
  }

  const handleSelectAllFilteredTracks = () => {
    setSelectedTrackIds((current) => {
      const next = new Set(current)
      allFilteredTrackIds.forEach((trackId) => next.add(trackId))
      return Array.from(next)
    })
  }

  const handleClearTrackSelection = () => {
    setSelectedTrackIds([])
  }

  const handleUpload = async () => {
    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Ban chua cau hinh Supabase trong file .env.')
      return
    }

    if (!selectedFile) {
      setErrorMessage('Hay chon file MP3 hoac WAV truoc khi upload.')
      return
    }

    if (mode === 'existing' && !selectedTrack) {
      setErrorMessage('Hay chon track de gan audio.')
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
      if (isReadingDuration) {
        setErrorMessage('App dang doc metadata file, cho mot chut nhe.')
        return
      }
      if (!detectedDurationSeconds || detectedDurationSeconds <= 0) {
        setErrorMessage('Khong lay duoc thoi luong tu file audio nay.')
        return
      }
    }

    setIsUploading(true)
    setErrorMessage(null)

    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || 'mp3'
    let targetTrackId = selectedTrack?.id ?? ''
    let targetTrackTitle = selectedTrack?.title ?? newTrackTitle.trim()
    let targetArtistId = selectedArtistId

    if (mode === 'new' && artistMode === 'new') {
      const insertArtistResult = await supabase
        .from('artists')
        .insert({
          name: newArtistName.trim(),
          slug: buildUniqueSlug(newArtistName),
        })
        .select('id, name')
        .single()

      if (insertArtistResult.error || !insertArtistResult.data) {
        setIsUploading(false)
        setErrorMessage(insertArtistResult.error?.message ?? 'Khong tao duoc artist moi.')
        return
      }

      targetArtistId = insertArtistResult.data.id
    }

    if (mode === 'new') {
      const insertTrackResult = await supabase
        .from('tracks')
        .insert({
          artist_id: targetArtistId,
          title: newTrackTitle.trim(),
          slug: buildUniqueSlug(newTrackTitle),
          duration_seconds: detectedDurationSeconds ?? 0,
          cover_url: newTrackCoverUrl.trim() || null,
        })
        .select('id, title')
        .single()

      if (insertTrackResult.error || !insertTrackResult.data) {
        setIsUploading(false)
        setErrorMessage(insertTrackResult.error?.message ?? 'Khong tao duoc track moi.')
        return
      }

      targetTrackId = insertTrackResult.data.id
      targetTrackTitle = insertTrackResult.data.title
    }

    const storagePath = `tracks/${targetTrackId}/${sanitizeFileSegment(targetTrackTitle)}.${extension}`
    const uploadResult = await supabase.storage
      .from(audioBucketName)
      .upload(storagePath, selectedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: selectedFile.type || 'audio/mpeg',
      })

    if (uploadResult.error) {
      setIsUploading(false)
      setErrorMessage(getReadableStorageErrorMessage(audioBucketName, uploadResult.error.message))
      return
    }

    const nextAudioUrl = `${audioBucketName}:${storagePath}`
    const updateResult = await supabase
      .from('tracks')
      .update({ audio_url: nextAudioUrl })
      .eq('id', targetTrackId)

    setIsUploading(false)

    if (updateResult.error) {
      setErrorMessage(updateResult.error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()

    setSelectedTrackId(targetTrackId)
    setSelectedFile(null)
    setMode('existing')
    setArtistMode('existing')
    setNewArtistName('')
    setNewTrackTitle('')
    setNewTrackCoverUrl('')
    setDetectedDurationSeconds(null)

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
    const result = await supabase
      .from('artists')
      .insert({
        name: trimmedName,
        slug: buildUniqueSlug(trimmedName),
      })
      .select('id, name')
      .single()
    setIsCreatingArtist(false)

    if (result.error || !result.data) {
      setErrorMessage(result.error?.message ?? 'Khong tao duoc artist moi.')
      return
    }

    await refreshLibrary()
    setQuickArtistName('')
    setSelectedArtistId(result.data.id)
  }

  const handleTrackTitleSave = async (trackId: string, nextTitle: string) => {
    if (!supabase || !isSupabaseConfigured) return
    const trimmedTitle = nextTitle.trim()
    if (!trimmedTitle) return

    setSavingTrackId(trackId)
    const { error } = await supabase
      .from('tracks')
      .update({ title: trimmedTitle, slug: buildUniqueSlug(trimmedTitle) })
      .eq('id', trackId)
    setSavingTrackId(null)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()
  }

  const handleTrackVisualSave = async (trackId: string, nextCoverUrl: string) => {
    if (!supabase || !isSupabaseConfigured) return

    setSavingTrackId(trackId)
    const { error } = await supabase
      .from('tracks')
      .update({ cover_url: nextCoverUrl.trim() || null })
      .eq('id', trackId)
    setSavingTrackId(null)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()
  }

  const handleArtistNameSave = async (artistId: string, nextName: string) => {
    if (!supabase || !isSupabaseConfigured) return
    const trimmedName = nextName.trim()
    if (!trimmedName) return

    setSavingArtistId(artistId)
    const { error } = await supabase
      .from('artists')
      .update({ name: trimmedName, slug: buildUniqueSlug(trimmedName) })
      .eq('id', artistId)
    setSavingArtistId(null)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()
  }

  const handleTrackDelete = async (trackId: string) => {
    if (!supabase || !isSupabaseConfigured) return
    const track = tracks?.find((item) => item.id === trackId)
    if (!track) return

    if (!window.confirm(`Xoa track "${track.title}" khoi library?`)) {
      return
    }

    setDeletingTrackId(trackId)
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)
    setDeletingTrackId(null)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()
    setSelectedTrackIds((current) => current.filter((id) => id !== trackId))
  }

  const handleBulkApplyCover = async () => {
    if (!supabase || !isSupabaseConfigured || !selectedTrackIds.length) return

    setIsBulkUpdatingCover(true)
    setErrorMessage(null)

    const { error } = await supabase
      .from('tracks')
      .update({ cover_url: bulkCoverTone })
      .in('id', selectedTrackIds)

    setIsBulkUpdatingCover(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'library-admin',
      title: 'Da cap nhat cover hang loat',
      message: `${selectedTrackIds.length} track da doi sang tone ${bulkCoverTone}.`,
      tone: 'success',
    })
  }

  const handleBulkDeleteTracks = async () => {
    if (!supabase || !isSupabaseConfigured || !selectedTrackIds.length) return

    if (!window.confirm(`Xoa ${selectedTrackIds.length} track da chon khoi library?`)) {
      return
    }

    setIsBulkDeleting(true)
    setErrorMessage(null)

    const { error } = await supabase
      .from('tracks')
      .delete()
      .in('id', selectedTrackIds)

    setIsBulkDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    const deletedCount = selectedTrackIds.length
    setSelectedTrackIds([])
    await refreshLibrary()
    await syncDashboardData()

    emitDataSourceNotice({
      endpoint: 'library-admin',
      title: 'Da xoa track hang loat',
      message: `${deletedCount} track da duoc xoa khoi Supabase.`,
      tone: 'success',
    })
  }

  const handleTrackCoverUpload = async (trackId: string, file: File | null) => {
    if (!supabase || !isSupabaseConfigured || !file) return

    const track = tracks?.find((item) => item.id === trackId)
    if (!track) return

    setUploadingCoverTrackId(trackId)
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
      setErrorMessage(getReadableStorageErrorMessage(coverBucketName, uploadResult.error.message))
      return
    }

    const { data } = supabase.storage.from(coverBucketName).getPublicUrl(storagePath)
    const updateResult = await supabase
      .from('tracks')
      .update({ cover_url: data.publicUrl })
      .eq('id', trackId)

    setUploadingCoverTrackId(null)

    if (updateResult.error) {
      setErrorMessage(updateResult.error.message)
      return
    }

    await refreshLibrary()
    await syncDashboardData()
  }

  if (!tracks) {
    return <PageDataFallback title="Loading admin library" />
  }

  return (
    <div className="grid gap-5">
      <header className="grid items-center gap-3 sm:gap-4 xl:grid-cols-[auto_minmax(0,1fr)_auto]">
        <motion.h1
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[2rem] leading-none font-extrabold text-[#30294f] sm:text-[2.55rem]"
        >
          Admin Library
        </motion.h1>
        <SearchField placeholder="Search tracks, artists, covers..." />
        <HeaderActions />
      </header>

      <Panel className="overflow-hidden bg-linear-to-br from-[#f6efff] via-[#fcf8ff] to-[#fff7fb]">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/82 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#8f6aea] uppercase shadow-[0_10px_24px_rgba(184,166,229,0.22)]">
              <ListMusicIcon size={16} />
              Independent CMS
            </div>
            <h2 className="mt-4 text-[2rem] font-black tracking-[-0.03em] text-[#30294f] sm:text-[2.8rem]">
              Quan ly track, artist va media
            </h2>
            <p className="mt-3 max-w-[58ch] text-[1rem] leading-7 text-[#6d6286]">
              Page nay tach rieng khoi Settings de ban quan ly kho nhac theo dung workflow admin:
              upload MP3, upload cover, doi ten, loc du lieu va dong bo Supabase ngay tren web.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Tong tracks', String(stats.totalTracks)],
              ['Co audio that', String(stats.withAudio)],
              ['Co cover that', String(stats.withRealCover)],
              ['Tong artists', String(stats.totalArtists)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[20px] border border-white/75 bg-white/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">{label}</p>
                <strong className="mt-2 block text-[1.7rem] text-[#30294f]">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {errorMessage ? (
        <div className="rounded-[18px] border border-rose-200/70 bg-rose-50/85 px-4 py-3 text-sm leading-6 text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          ['tracks', 'Tracks'],
          ['uploads', 'Uploads'],
          ['artists', 'Artists'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as AdminTab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === key
                ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white shadow-[0_12px_20px_rgba(157,115,239,0.22)]'
                : 'bg-white/78 text-[#6f6387] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        {activeTab === 'tracks' ? (
          <Panel>
            <SectionHeader title="Track Manager" subtitle="Sua ten, doi cover va loc nhanh theo trang thai" />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-sm font-semibold text-[#7d728e]">Tim trong library</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Vi du: coffee, sunset, lofi..."
                  className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#7d728e]">Audio</span>
                <select
                  value={audioFilter}
                  onChange={(event) => setAudioFilter(event.target.value as AudioFilter)}
                  className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                >
                  <option value="all">Tat ca</option>
                  <option value="with-audio">Da co audio</option>
                  <option value="demo-only">Dang dung demo</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#7d728e]">Cover</span>
                <select
                  value={coverFilter}
                  onChange={(event) => setCoverFilter(event.target.value as CoverFilter)}
                  className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                >
                  <option value="all">Tat ca</option>
                  <option value="with-cover">Co cover that</option>
                  <option value="tone-only">Chi tone/preset</option>
                </select>
              </label>

              <label className="grid gap-2 sm:col-span-2 xl:col-span-4">
                <span className="text-sm font-semibold text-[#7d728e]">Artist</span>
                <select
                  value={artistFilterId}
                  onChange={(event) => setArtistFilterId(event.target.value)}
                  className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                >
                  <option value="all">Tat ca artists</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[20px] border border-white/75 bg-linear-to-r from-[#faf5ff] via-white/90 to-[#fff5fb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#30294f]">Bulk actions</p>
                    <p className="mt-1 text-sm text-[#7d728e]">
                      Da chon {selectedTrackIds.length} track
                      {allFilteredTrackIds.length ? ` / ${allFilteredTrackIds.length} track trong bo loc hien tai` : ''}.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={areAllFilteredTracksSelected ? handleClearTrackSelection : handleSelectAllFilteredTracks}
                      disabled={!allFilteredTrackIds.length || isBulkDeleting || isBulkUpdatingCover}
                      className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#6f6387] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {areAllFilteredTracksSelected ? 'Bo chon tat ca' : 'Chon tat ca theo bo loc'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearTrackSelection}
                      disabled={!selectedTrackIds.length || isBulkDeleting || isBulkUpdatingCover}
                      className="rounded-full bg-[#f4ecff] px-4 py-2 text-sm font-semibold text-[#8f6aea] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#7d728e]">Bulk cover tone</span>
                    <select
                      value={bulkCoverTone}
                      onChange={(event) => setBulkCoverTone(event.target.value as (typeof coverToneOptions)[number])}
                      disabled={isBulkDeleting || isBulkUpdatingCover}
                      className="rounded-[16px] border border-white/70 bg-white/90 px-4 py-3 text-[#54496e] outline-none disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {coverToneOptions.map((tone) => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </label>

                  <MotionButton
                    onClick={() => { void handleBulkApplyCover() }}
                    className="self-end rounded-full bg-[#ffe9f4] px-4 py-3 text-sm font-semibold text-[#d15c9a] disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={!selectedTrackIds.length || isBulkDeleting || isBulkUpdatingCover}
                  >
                    {isBulkUpdatingCover ? 'Dang doi cover...' : 'Apply tone cho nhieu track'}
                  </MotionButton>

                  <MotionButton
                    onClick={() => { void handleBulkDeleteTracks() }}
                    className="self-end rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={!selectedTrackIds.length || isBulkDeleting || isBulkUpdatingCover}
                  >
                    {isBulkDeleting ? 'Dang xoa...' : 'Xoa track da chon'}
                  </MotionButton>
                </div>
              </div>

              {filteredTracks.length ? (
                filteredTracks.map((track) => (
                  <AdminTrackRow
                    key={track.id}
                    track={track}
                    isSelected={selectedTrackIds.includes(track.id)}
                    isSaving={savingTrackId === track.id}
                    isDeleting={deletingTrackId === track.id}
                    isUploadingCover={uploadingCoverTrackId === track.id}
                    onToggleSelect={() => toggleTrackSelection(track.id)}
                    onSaveTitle={(nextTitle) => { void handleTrackTitleSave(track.id, nextTitle) }}
                    onSaveCover={(nextCoverUrl) => { void handleTrackVisualSave(track.id, nextCoverUrl) }}
                    onUploadCover={(file) => { void handleTrackCoverUpload(track.id, file) }}
                    onDelete={() => { void handleTrackDelete(track.id) }}
                  />
                ))
              ) : (
                <div className="rounded-[18px] bg-white/70 px-4 py-3 text-sm text-[#7d728e]">
                  Khong tim thay track nao phu hop bo loc hien tai.
                </div>
              )}
            </div>
          </Panel>
        ) : null}

        {activeTab === 'uploads' ? (
          <Panel>
            <SectionHeader title="Upload Center" subtitle="Gan MP3 vao track co san hoac tao track moi" />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode('existing')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === 'existing'
                    ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white'
                    : 'bg-white/75 text-[#6f6387]'
                }`}
              >
                Gan vao track co san
              </button>
              <button
                type="button"
                onClick={() => setMode('new')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === 'new'
                    ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white'
                    : 'bg-white/75 text-[#6f6387]'
                }`}
              >
                Tao track moi
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {mode === 'existing' ? (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#7d728e]">Track hien co</span>
                  <select
                    value={selectedTrackId}
                    onChange={(event) => setSelectedTrackId(event.target.value)}
                    className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                  >
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>{track.title} - {track.artist}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#7d728e]">Ten track moi</span>
                    <input
                      type="text"
                      value={newTrackTitle}
                      onChange={(event) => setNewTrackTitle(event.target.value)}
                      placeholder="Vi du: Starlight Echo"
                      className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                    />
                  </label>

                  <div className="grid gap-2">
                    <span className="text-sm font-semibold text-[#7d728e]">Artist</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setArtistMode('existing')}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${artistMode === 'existing' ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white' : 'bg-white/70 text-[#6f6387]'}`}
                      >
                        Artist co san
                      </button>
                      <button
                        type="button"
                        onClick={() => setArtistMode('new')}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${artistMode === 'new' ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white' : 'bg-white/70 text-[#6f6387]'}`}
                      >
                        Tao artist moi
                      </button>
                    </div>

                    {artistMode === 'existing' ? (
                      <select
                        value={selectedArtistId}
                        onChange={(event) => setSelectedArtistId(event.target.value)}
                        className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                      >
                        {artists.map((artist) => (
                          <option key={artist.id} value={artist.id}>{artist.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newArtistName}
                        onChange={(event) => setNewArtistName(event.target.value)}
                        placeholder="Vi du: keshi"
                        className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                      />
                    )}
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#7d728e]">Cover tone / cover_url</span>
                    <input
                      type="text"
                      value={newTrackCoverUrl}
                      onChange={(event) => setNewTrackCoverUrl(event.target.value)}
                      placeholder="Vi du: moon-river"
                      className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                    />
                  </label>

                  <div className="grid gap-3 rounded-[18px] border border-white/75 bg-white/76 p-4 sm:grid-cols-[84px_1fr]">
                    <div className="h-[84px] w-[84px] overflow-hidden rounded-[18px]">
                      <img src={getCoverArt(newTrackPreviewTone)} alt={newTrackTitle || 'Track preview'} className="artwork-media h-full w-full object-cover" />
                    </div>
                    <div className="self-center">
                      <p className="text-xs tracking-[0.16em] text-[#9b8fb3] uppercase">Preview</p>
                      <strong className="mt-1 block text-[#30294f]">{newTrackPreviewLabel}</strong>
                      <span className="mt-2 inline-flex rounded-full bg-[#f4ecff] px-3 py-1 text-xs font-semibold text-[#8f6aea]">
                        {newTrackPreviewTone}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#7d728e]">File audio</span>
                <input
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
                  onChange={(event) => { void handleFileChange(event.target.files?.[0] ?? null) }}
                  className="rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-sm text-[#54496e] file:mr-3 file:rounded-full file:border-0 file:bg-[#f4ecff] file:px-4 file:py-2.5 file:font-semibold file:text-[#8f6aea]"
                />
              </label>

              <div className="rounded-[18px] bg-white/60 px-4 py-3 text-sm leading-6 text-[#6f6387]">
                <p><span className="font-semibold text-[#30294f]">Bucket:</span> {audioBucketName}</p>
                <p><span className="font-semibold text-[#30294f]">Track:</span> {mode === 'existing' ? (selectedTrack ? `${selectedTrack.title} - ${selectedTrack.artist}` : 'Chua chon') : newTrackPreviewLabel}</p>
                <p><span className="font-semibold text-[#30294f]">File:</span> {selectedFile?.name ?? 'Chua chon file'}</p>
                <p><span className="font-semibold text-[#30294f]">Duration:</span> {isReadingDuration ? 'Dang doc...' : formatDuration(detectedDurationSeconds)}</p>
              </div>

              <MotionButton
                onClick={() => { void handleUpload() }}
                className="rounded-full bg-linear-to-r from-[#b98eff] to-[#9872ef] px-5 py-3 font-extrabold text-white shadow-[0_14px_24px_rgba(157,115,239,0.24)] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isUploading ? 'Dang upload...' : mode === 'new' ? 'Tao track moi va upload MP3' : 'Upload va gan vao track'}
              </MotionButton>
            </div>
          </Panel>
        ) : null}

        {activeTab === 'artists' ? (
          <Panel>
            <SectionHeader title="Artist Manager" subtitle="Tao nhanh va doi ten artist ngay tren page admin" />

            <div className="grid gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={quickArtistName}
                  onChange={(event) => setQuickArtistName(event.target.value)}
                  placeholder="Vi du: wave to earth"
                  className="min-w-0 flex-1 rounded-[16px] border border-white/70 bg-white/82 px-4 py-3 text-[#54496e] outline-none"
                />
                <button
                  type="button"
                  onClick={() => { void handleQuickArtistCreate() }}
                  disabled={isCreatingArtist || !quickArtistName.trim()}
                  className="rounded-full bg-[#f2e8ff] px-4 py-3 text-sm font-semibold text-[#7e58d7] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isCreatingArtist ? 'Dang tao...' : 'Tao artist'}
                </button>
              </div>

              <div className="grid gap-3">
                {filteredArtists.map((artist) => (
                  <AdminArtistRow
                    key={artist.id}
                    artist={artist}
                    trackCount={tracks.filter((track) => track.artistId === artist.id).length}
                    isSaving={savingArtistId === artist.id}
                    onSave={(nextName) => { void handleArtistNameSave(artist.id, nextName) }}
                  />
                ))}
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  )
}

function AdminTrackRow({
  track,
  isSelected,
  isSaving,
  isDeleting,
  isUploadingCover,
  onToggleSelect,
  onSaveTitle,
  onSaveCover,
  onUploadCover,
  onDelete,
}: {
  track: TrackRow
  isSelected: boolean
  isSaving: boolean
  isDeleting: boolean
  isUploadingCover: boolean
  onToggleSelect: () => void
  onSaveTitle: (nextTitle: string) => void
  onSaveCover: (nextCoverUrl: string) => void
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

  const coverTone = draftCoverUrl.trim() || suggestCoverTone(draftTitle || track.title)
  const hasTitleChanged = draftTitle.trim() !== track.title.trim()
  const hasCoverChanged = draftCoverUrl.trim() !== (track.coverUrl?.trim() || '')

  const handleCoverDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingCover(false)
    const file = event.dataTransfer.files?.[0]
    if (!file?.type.startsWith('image/')) {
      return
    }
    onUploadCover(file)
  }

  return (
    <div className={`rounded-[22px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)] transition ${
      isSelected
        ? 'border-[#c7a6ff] bg-[#fcf8ff]'
        : 'border-white/75 bg-white/78'
    }`}
    >
      <div className="grid gap-4 lg:grid-cols-[auto_84px_minmax(0,1fr)_auto]">
        <div className="pt-1">
          <button
            type="button"
            onClick={onToggleSelect}
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black transition ${
              isSelected
                ? 'border-[#9b74ff] bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white'
                : 'border-[#dccdff] bg-white text-transparent'
            }`}
            aria-pressed={isSelected}
            aria-label={isSelected ? 'Bo chon track' : 'Chon track'}
          >
            ✓
          </button>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDraggingCover(true)
          }}
          onDragLeave={() => setIsDraggingCover(false)}
          onDrop={handleCoverDrop}
          className={`relative h-[84px] w-[84px] overflow-hidden rounded-[20px] transition ${
            isDraggingCover ? 'ring-2 ring-[#9b74ff] ring-offset-2 ring-offset-white/60' : ''
          }`}
        >
          <img src={getCoverArt(coverTone)} alt={track.title} className="artwork-media h-full w-full object-cover" />
          <div className={`absolute inset-0 flex items-center justify-center bg-[#30294f]/45 text-[10px] font-bold text-white transition ${
            isDraggingCover ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          >
            Drop
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f4ecff] px-2.5 py-1 text-[11px] font-semibold text-[#8f6aea]">
              {track.artist}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              track.audioUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
            }`}
            >
              {track.audioUrl ? 'Da co audio' : 'Demo'}
            </span>
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#84779f]">
              {formatDuration(track.durationSeconds)}
            </span>
          </div>

          <input
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            disabled={isSaving || isDeleting || isUploadingCover}
            className="rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
          />

          <input
            type="text"
            value={draftCoverUrl}
            onChange={(event) => setDraftCoverUrl(event.target.value)}
            disabled={isSaving || isDeleting || isUploadingCover}
            placeholder="cover_url hoac tone"
            className="rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
          />

          <div className="flex flex-wrap gap-2">
            {coverToneOptions.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setDraftCoverUrl(tone)}
                disabled={isSaving || isDeleting || isUploadingCover}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  draftCoverUrl.trim() === tone
                    ? 'bg-linear-to-r from-[#b98eff] to-[#9872ef] text-white'
                    : 'bg-[#f4ecff] text-[#8f6aea]'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-2">
          <MotionButton
            onClick={() => onSaveTitle(draftTitle)}
            className="rounded-full bg-[#f2e8ff] px-4 py-2 text-sm font-semibold text-[#7e58d7] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!hasTitleChanged || isSaving || isDeleting || isUploadingCover}
          >
            {isSaving ? 'Dang luu...' : 'Luu ten'}
          </MotionButton>
          <MotionButton
            onClick={() => onSaveCover(draftCoverUrl)}
            className="rounded-full bg-[#ffe9f4] px-4 py-2 text-sm font-semibold text-[#d15c9a] disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!hasCoverChanged || isSaving || isDeleting || isUploadingCover}
          >
            {isSaving ? 'Dang luu...' : 'Luu cover'}
          </MotionButton>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#eef6ff] px-4 py-2 text-sm font-semibold text-[#4b7fd6]">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              disabled={isSaving || isDeleting || isUploadingCover}
              onChange={(event) => onUploadCover(event.target.files?.[0] ?? null)}
              className="hidden"
            />
            {isUploadingCover ? 'Dang upload...' : 'Upload cover'}
          </label>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting || isSaving || isUploadingCover}
            className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isDeleting ? 'Dang xoa...' : 'Xoa track'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminArtistRow({
  artist,
  trackCount,
  isSaving,
  onSave,
}: {
  artist: ArtistRow
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
    <div className="rounded-[18px] border border-white/75 bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#30294f]">{artist.name}</p>
          <p className="text-xs text-[#7d728e]">{trackCount} track</p>
        </div>
        <span className="rounded-full bg-[#f4ecff] px-3 py-1 text-xs font-semibold text-[#8f6aea]">
          {artist.id.slice(0, 6)}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          disabled={isSaving}
          className="min-w-0 flex-1 rounded-[14px] border border-white/75 bg-[#fffafc] px-4 py-3 text-[#54496e] outline-none"
        />
        <button
          type="button"
          onClick={() => onSave(draftName)}
          disabled={!hasChanged || isSaving}
          className="rounded-full bg-[#f2e8ff] px-4 py-3 text-sm font-semibold text-[#7e58d7] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? 'Dang luu...' : 'Luu'}
        </button>
      </div>
    </div>
  )
}

export default AdminLibraryPage
