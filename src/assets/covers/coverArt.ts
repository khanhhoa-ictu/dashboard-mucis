import amber from './amber.webp'
import artistA from './artist-a.webp'
import artistB from './artist-b.webp'
import artistC from './artist-c.webp'
import artistD from './artist-d.webp'
import board from './board.webp'
import brain from './brain.webp'
import coffeeLatte from './coffee-latte.webp'
import cozyRoom from './cozy-room.webp'
import dream from './dream.webp'
import dreamClouds from './dream-clouds.webp'
import fireplace from './fireplace.webp'
import fireplaceNight from './fireplace-night.webp'
import heart from './heart.webp'
import heartBalloon from './heart-balloon.webp'
import history from './history.webp'
import latte from './latte.webp'
import mic from './mic.webp'
import micStage from './mic-stage.webp'
import moonRiver from './moon-river.webp'
import night from './night.webp'
import rocket from './rocket.webp'
import roadTrip from './road-trip.webp'
import room from './room.webp'
import rhythmWaves from './rhythm-waves.webp'
import space from './space.webp'
import studyDesk from './study-desk.webp'
import summer from './summer.webp'
import summerPool from './summer-pool.webp'
import sunset from './sunset.webp'
import travel from './travel.webp'
import weekendVan from './weekend-van.webp'

export const coverArtByTone: Record<string, string> = {
  sunset,
  beach: sunset,
  'track-sunset': sunset,
  'album-sunset': sunset,
  'playlist-weekend': sunset,
  'favorites-sunset': sunset,
  'podcast-daily-calm': sunset,
  'cover-sunset': sunset,
  amber,
  road: amber,
  'track-golden-hour': amber,
  'playlist-roadtrip': amber,
  'favorites-golden-hour': amber,
  'cover-amber': amber,
  latte,
  'track-coffee-shop': latte,
  'album-coffee': latte,
  'podcast-art-of-living': latte,
  'cover-latte': latte,
  dream,
  'track-dreamscape': dream,
  'playlist-favorites': dream,
  'album-daydreams': dream,
  'cover-dream': dream,
  night,
  'track-starry-nights': night,
  'favorites-midnight': night,
  'podcast-sleep': night,
  'cover-night': night,
  room,
  'album-chill-vibes': room,
  'playlist-chill-mornings': room,
  'podcast-mindful': room,
  'cover-room': room,
  fireplace,
  'album-warm-nights': fireplace,
  'favorites-home': fireplace,
  'cover-fireplace': fireplace,
  heart,
  pink: heart,
  'favorites-heartbeats': heart,
  'favorites-soft-glow': heart,
  'playlist-workout': heart,
  'cover-heart': heart,
  space,
  'podcast-curious-minds': space,
  travel,
  'podcast-wanderlust': travel,
  'playlist-chill-friends': travel,
  mic,
  'podcast-creator-conversations': mic,
  'podcast-tech-talk': mic,
  board,
  'podcast-true-crime': board,
  history,
  'podcast-history-uncovered': history,
  brain,
  'podcast-habits': brain,
  rocket,
  'podcast-space-future': rocket,
  'playlist-study-focus': rocket,
  summer,
  'playlist-summer-hits': summer,
  'activity-blinding-lights': summer,
  'artist-a': artistA,
  'artist-lofi-chill': artistA,
  'artist-lana-del-rey': artistA,
  'artist-b': artistB,
  'artist-jvke': artistB,
  'artist-the-weeknd': artistB,
  'favorites-let-me-down-slowly': artistB,
  'artist-c': artistC,
  'artist-taylor-swift': artistC,
  'artist-d': artistD,
  'artist-beabadoobee': artistD,
  'artist-oatmello': artistD,
  'weekend-van': weekendVan,
  'coffee-latte': coffeeLatte,
  'dream-clouds': dreamClouds,
  'moon-river': moonRiver,
  'cozy-room': cozyRoom,
  'road-trip': roadTrip,
  'summer-pool': summerPool,
  'heart-balloon': heartBalloon,
  'study-desk': studyDesk,
  'fireplace-night': fireplaceNight,
  'mic-stage': micStage,
  'rhythm-waves': rhythmWaves,
}

export function getCoverArt(tone: string) {
  return coverArtByTone[tone] ?? sunset
}
