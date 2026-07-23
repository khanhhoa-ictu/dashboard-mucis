import type {
  ContinueListeningItem,
  MusicCardItem,
  TrackListItem,
} from '../../types/appData'
import type { PlayableTrack } from '../../context/AudioPlayerContext'
import { getPlayableAudioUrl } from './trackAudio'

type TrackSource = TrackListItem | MusicCardItem | ContinueListeningItem

export function buildPlayableTrack(track: TrackSource): PlayableTrack {
  return {
    id: `${track.title}::${track.artist}`.toLowerCase(),
    trackId: track.trackId,
    title: track.title,
    artist: track.artist,
    tone: track.tone,
    audioUrl: getPlayableAudioUrl(track.title, track.artist, track.audioUrl),
  }
}

export function buildPlayableQueue(tracks: TrackSource[]) {
  const uniqueTracks = new Map<string, PlayableTrack>()

  tracks.forEach((track) => {
    const playableTrack = buildPlayableTrack(track)

    if (!uniqueTracks.has(playableTrack.id)) {
      uniqueTracks.set(playableTrack.id, playableTrack)
    }
  })

  return [...uniqueTracks.values()]
}

export function formatPlaybackTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

