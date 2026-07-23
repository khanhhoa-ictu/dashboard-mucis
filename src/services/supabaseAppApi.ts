import type { AppApi } from './appApi'
import { mockAppApi } from './mockAppApi'
import { navItems, genres as mockGenres } from '../data/dashboardData'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'
import { emitDataSourceNotice } from '../lib/supabase/statusEvents'
import type {
  AppApiEndpoint,
  AppApiResponseMap,
  MyMusicPayload,
  OverviewPayload,
  TrackListItem,
} from '../types/appData'

const fallbackToneMap: Record<string, string> = {
  'sunset drive': 'weekend-van',
  'golden hour': 'road-trip',
  'coffee shop': 'coffee-latte',
  dreamscape: 'dream-clouds',
  home: 'cozy-room',
  dreams: 'moon-river',
}

function resolveToneKey(value: string | null | undefined, title?: string) {
  if (value) {
    if (/^(https?:\/\/|data:|blob:)/i.test(value)) {
      return value
    }

    const normalized = value
      .split('/')
      .pop()
      ?.replace(/\.[a-z0-9]+$/i, '')
      ?.trim()
      .toLowerCase()

    if (normalized) {
      return normalized
    }
  }

  if (title) {
    return fallbackToneMap[title.trim().toLowerCase()] ?? 'dream-clouds'
  }

  return 'dream-clouds'
}

function formatHours(totalSeconds: number) {
  return (totalSeconds / 3600).toFixed(1)
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatSongsLabel(count: number) {
  return `${count} song${count === 1 ? '' : 's'}`
}

function computeListeningStreak(playedDates: string[]) {
  if (!playedDates.length) {
    return 0
  }

  const uniqueDates = Array.from(new Set(playedDates)).sort((a, b) => b.localeCompare(a))
  let streak = 1

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = new Date(`${uniqueDates[index - 1]}T00:00:00`)
    const current = new Date(`${uniqueDates[index]}T00:00:00`)
    const difference = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)

    if (difference === 1) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function getSupabaseErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const message = 'message' in error ? error.message : null
    if (typeof message === 'string') {
      return message
    }
  }

  return String(error)
}

const notifiedFallbackEndpoints = new Set<string>()
const notifiedLiveEndpoints = new Set<string>()

function notifyMockFallback(endpoint: string, message: string) {
  if (notifiedFallbackEndpoints.has(endpoint)) {
    return
  }

  notifiedFallbackEndpoints.add(endpoint)
  emitDataSourceNotice({
    endpoint,
    title: 'Dang hien du lieu mau',
    message,
    tone: 'warning',
  })
}

function notifySupabaseLive(endpoint: string, message: string) {
  if (notifiedLiveEndpoints.has(endpoint)) {
    return
  }

  notifiedLiveEndpoints.add(endpoint)
  emitDataSourceNotice({
    endpoint,
    title: 'Da ket noi Supabase',
    message,
    tone: 'success',
  })
}

async function getOverviewFromSupabase(): Promise<OverviewPayload> {
  if (!supabase) {
    throw new Error('Supabase client is not configured')
  }

  const recentPlaysResult = await supabase
    .from('recent_plays')
    .select('played_at, progress_seconds, track_id')
    .not('track_id', 'is', null)
    .order('played_at', { ascending: false })
    .limit(150)

  if (recentPlaysResult.error) {
    throw new Error(`Query recent_plays failed: ${recentPlaysResult.error.message}`)
  }

  const recentPlays = recentPlaysResult.data ?? []
  if (!recentPlays.length) {
    throw new Error(
      'Query recent_plays returned 0 rows. Check whether recent_plays has data and whether anon SELECT/RLS access is enabled.',
    )
  }

  const trackIds = Array.from(
    new Set(
      recentPlays
        .map((item) => item.track_id)
        .filter((trackId): trackId is string => Boolean(trackId)),
    ),
  )

  const tracksResult = await supabase
    .from('tracks')
    .select('id, title, cover_url, duration_seconds, artist_id, audio_url')
    .in('id', trackIds)

  if (tracksResult.error) {
    throw new Error(`Query tracks failed: ${tracksResult.error.message}`)
  }

  const tracks = tracksResult.data ?? []
  const trackMap = new Map(tracks.map((track) => [track.id, track]))

  const artistIds = Array.from(
    new Set(
      tracks
        .map((track) => track.artist_id)
        .filter((artistId): artistId is string => Boolean(artistId)),
    ),
  )

  const artistsResult = artistIds.length
    ? await supabase
        .from('artists')
        .select('id, name')
        .in('id', artistIds)
    : { data: [], error: null }

  if (artistsResult.error) {
    throw new Error(`Query artists failed: ${artistsResult.error.message}`)
  }

  const artists = artistsResult.data ?? []
  const artistMap = new Map(artists.map((artist) => [artist.id, artist.name]))

  const favoriteTracksResult = await supabase
    .from('favorite_tracks')
    .select('*', { count: 'exact', head: true })

  if (favoriteTracksResult.error) {
    throw new Error(`Query favorite_tracks failed: ${favoriteTracksResult.error.message}`)
  }

  const favoriteTracksCount = favoriteTracksResult.count ?? 0

  const totalSeconds = recentPlays.reduce((sum, play) => {
    const track = play.track_id ? trackMap.get(play.track_id) : null
    const fallbackDuration = track?.duration_seconds ?? 0
    return sum + (play.progress_seconds > 0 ? play.progress_seconds : fallbackDuration)
  }, 0)

  const recentTracks: TrackListItem[] = recentPlays
    .slice(0, 3)
    .map<TrackListItem | null>((play) => {
      const track = play.track_id ? trackMap.get(play.track_id) : null

      if (!track) {
        return null
      }

      return {
        trackId: track.id,
        title: track.title,
        artist: artistMap.get(track.artist_id ?? '') ?? 'Unknown Artist',
        tone: resolveToneKey(track.cover_url, track.title),
        audioUrl: track.audio_url ?? undefined,
      }
    })
    .filter((item): item is TrackListItem => Boolean(item))

  const streak = computeListeningStreak(
    recentPlays
      .map((play) => play.played_at?.slice(0, 10))
      .filter((date): date is string => Boolean(date)),
  )

  notifySupabaseLive('overview', 'Dashboard dang lay du lieu overview truc tiep tu Supabase.')

  return {
    stats: [
      {
        icon: 'N',
        title: 'Songs Played',
        value: new Intl.NumberFormat('en-US').format(recentPlays.length),
        note: 'Live from Supabase',
        tone: 'violet',
      },
      {
        icon: 'H',
        title: 'Favorites',
        value: new Intl.NumberFormat('en-US').format(favoriteTracksCount),
        note: 'Synced from database',
        tone: 'pink',
      },
      {
        icon: 'C',
        title: 'Hours Listened',
        value: formatHours(totalSeconds),
        note: 'Calculated from play history',
        tone: 'gold',
      },
      {
        icon: 'F',
        title: 'Current Streak',
        value: String(streak),
        note: 'days in a row',
        tone: 'sky',
      },
    ],
    recentTracks: recentTracks.length
      ? recentTracks
      : (await mockAppApi.get('overview')).recentTracks,
    genres: mockGenres,
  }
}

async function getMyMusicFromSupabase(): Promise<MyMusicPayload> {
  if (!supabase) {
    throw new Error('Supabase client is not configured')
  }

  const [tracksResult, albumsResult, artistsResult, recentPlaysResult, favoriteTracksResult] = await Promise.all([
    supabase
      .from('tracks')
      .select('id, title, cover_url, duration_seconds, artist_id, album_id, created_at, audio_url')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('albums')
      .select('id, title, cover_url, artist_id, created_at')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('artists')
      .select('id, name, image_url')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('recent_plays')
      .select('track_id, progress_seconds, played_at')
      .not('track_id', 'is', null)
      .order('played_at', { ascending: false })
      .limit(40),
    supabase
      .from('favorite_tracks')
      .select('track_id'),
  ])

  if (tracksResult.error) throw new Error(`Query tracks failed: ${tracksResult.error.message}`)
  if (albumsResult.error) throw new Error(`Query albums failed: ${albumsResult.error.message}`)
  if (artistsResult.error) throw new Error(`Query artists failed: ${artistsResult.error.message}`)
  if (recentPlaysResult.error) throw new Error(`Query recent_plays failed: ${recentPlaysResult.error.message}`)
  if (favoriteTracksResult.error) {
    throw new Error(`Query favorite_tracks failed: ${favoriteTracksResult.error.message}`)
  }

  const tracks = tracksResult.data ?? []
  const albums = albumsResult.data ?? []
  const artists = artistsResult.data ?? []
  const recentPlays = recentPlaysResult.data ?? []
  const favoriteTracks = favoriteTracksResult.data ?? []

  if (!tracks.length || !artists.length) {
    throw new Error('Supabase does not have enough music data yet')
  }

  const artistMap = new Map(artists.map((artist) => [artist.id, artist]))
  const albumMap = new Map(albums.map((album) => [album.id, album]))
  const favoriteTrackIds = new Set(
    favoriteTracks
      .map((item) => item.track_id)
      .filter((trackId): trackId is string => Boolean(trackId)),
  )

  const playCounts = new Map<string, number>()
  recentPlays.forEach((play) => {
    if (!play.track_id) return
    playCounts.set(play.track_id, (playCounts.get(play.track_id) ?? 0) + 1)
  })

  const recentTrackIds = recentPlays
    .map((play) => play.track_id)
    .filter((trackId): trackId is string => Boolean(trackId))

  const uniqueRecentTrackIds = Array.from(new Set(recentTrackIds))

  const recentlyAdded = tracks.slice(0, 4).map((track) => ({
    trackId: track.id,
    title: track.title,
    artist: artistMap.get(track.artist_id ?? '')?.name ?? 'Unknown Artist',
    duration: formatDuration(track.duration_seconds ?? 0),
    tone: resolveToneKey(track.cover_url, track.title),
    audioUrl: track.audio_url ?? undefined,
  }))

  const topTracks = [...tracks]
    .sort((left, right) => (playCounts.get(right.id) ?? 0) - (playCounts.get(left.id) ?? 0))
    .slice(0, 5)
    .map((track, index) => ({
      trackId: track.id,
      rank: index + 1,
      title: track.title,
      artist: artistMap.get(track.artist_id ?? '')?.name ?? 'Unknown Artist',
      duration: formatDuration(track.duration_seconds ?? 0),
      tone: resolveToneKey(track.cover_url, track.title),
      liked: favoriteTrackIds.has(track.id),
      audioUrl: track.audio_url ?? undefined,
    }))

  const albumTrackCounts = new Map<string, number>()
  tracks.forEach((track) => {
    if (!track.album_id) return
    albumTrackCounts.set(track.album_id, (albumTrackCounts.get(track.album_id) ?? 0) + 1)
  })

  const myAlbums = albums.slice(0, 4).map((album) => ({
    title: album.title,
    artist: artistMap.get(album.artist_id ?? '')?.name ?? 'Unknown Artist',
    tone: resolveToneKey(album.cover_url, album.title),
  }))

  const artistTrackCounts = new Map<string, number>()
  tracks.forEach((track) => {
    if (!track.artist_id) return
    artistTrackCounts.set(track.artist_id, (artistTrackCounts.get(track.artist_id) ?? 0) + 1)
  })

  const myArtists = artists.slice(0, 4).map((artist) => ({
    name: artist.name,
    songs: formatSongsLabel(artistTrackCounts.get(artist.id) ?? 0),
    tone: resolveToneKey(artist.image_url, artist.name),
  }))

  const continueListening = uniqueRecentTrackIds
    .slice(0, 3)
    .map<MyMusicPayload['continueListening'][number] | null>((trackId) => {
      const track = tracks.find((item) => item.id === trackId)
      const recentPlay = recentPlays.find((item) => item.track_id === trackId)

      if (!track || !recentPlay) {
        return null
      }

      const remainingSeconds = Math.max((track.duration_seconds ?? 0) - (recentPlay.progress_seconds ?? 0), 0)
      const progressValue = track.duration_seconds
        ? `${Math.round(((recentPlay.progress_seconds ?? 0) / track.duration_seconds) * 100)}%`
        : '0%'

      return {
        trackId: track.id,
        title: albumMap.get(track.album_id ?? '')?.title ?? track.title,
        artist: artistMap.get(track.artist_id ?? '')?.name ?? 'Unknown Artist',
        remaining: `${formatDuration(remainingSeconds)} left`,
        progress: progressValue,
        tone: resolveToneKey(track.cover_url, track.title),
        audioUrl: track.audio_url ?? undefined,
      }
    })
    .filter((item): item is MyMusicPayload['continueListening'][number] => Boolean(item))

  notifySupabaseLive('my-music', 'Trang My Music dang lay du lieu truc tiep tu Supabase.')

  return {
    recentlyAdded: recentlyAdded.length ? recentlyAdded : (await mockAppApi.get('my-music')).recentlyAdded,
    topTracks: topTracks.length ? topTracks : (await mockAppApi.get('my-music')).topTracks,
    albums: myAlbums.length ? myAlbums : (await mockAppApi.get('my-music')).albums,
    artists: myArtists.length ? myArtists : (await mockAppApi.get('my-music')).artists,
    continueListening: continueListening.length
      ? continueListening
      : (await mockAppApi.get('my-music')).continueListening,
  }
}

async function getFromSupabase<K extends AppApiEndpoint>(endpoint: K): Promise<AppApiResponseMap[K]> {
  if (!isSupabaseConfigured || !supabase) {
    if (import.meta.env.DEV) {
      console.warn(`[supabaseAppApi] Using mock for "${endpoint}" because Supabase is not configured.`)
    }
    notifyMockFallback(endpoint, 'Chua tim thay cau hinh Supabase hop le, nen app tam dung du lieu mock.')
    return mockAppApi.get(endpoint)
  }

  try {
    if (endpoint === 'sidebar') {
      if (import.meta.env.DEV) {
        console.info('[supabaseAppApi] Using Supabase-backed sidebar payload.')
      }
      notifySupabaseLive('sidebar', 'Sidebar da dung du lieu va route cua app ket noi Supabase.')
      return { navItems } as AppApiResponseMap[K]
    }

    if (endpoint === 'overview') {
      if (import.meta.env.DEV) {
        console.info('[supabaseAppApi] Fetching overview from Supabase.')
      }
      return await getOverviewFromSupabase() as AppApiResponseMap[K]
    }

    if (endpoint === 'my-music') {
      if (import.meta.env.DEV) {
        console.info('[supabaseAppApi] Fetching my-music from Supabase.')
      }
      return await getMyMusicFromSupabase() as AppApiResponseMap[K]
    }

    if (import.meta.env.DEV) {
      console.info(`[supabaseAppApi] "${endpoint}" still uses mock data by design.`)
    }
    return await mockAppApi.get(endpoint)
  } catch (error) {
    console.warn(
      `[supabaseAppApi] Falling back to mock data for "${endpoint}": ${getSupabaseErrorMessage(error)}`,
      error,
    )
    notifyMockFallback(endpoint, `Supabase gap loi o "${endpoint}", app tam chuyen sang du lieu mock.`)
    return mockAppApi.get(endpoint)
  }
}

export const supabaseAppApi: AppApi = {
  async get(endpoint) {
    return getFromSupabase(endpoint)
  },
}
