import * as dashboardData from './dashboardData'
import type { AppApiEndpoint, AppApiResponseMap } from '../types/appData'

export const mockApiDatabase: AppApiResponseMap = {
  sidebar: {
    navItems: dashboardData.navItems,
  },
  overview: {
    stats: dashboardData.stats,
    recentTracks: dashboardData.recentTracks,
    genres: dashboardData.genres,
  },
  'my-music': {
    recentlyAdded: dashboardData.recentlyAdded,
    topTracks: dashboardData.topTracks,
    albums: dashboardData.albums,
    artists: dashboardData.artists,
    continueListening: dashboardData.continueListening,
  },
  favorites: {
    likedSongs: dashboardData.likedSongs,
    lovedAlbums: dashboardData.lovedAlbums,
    moodPicks: dashboardData.moodPicks,
    favoriteArtists: dashboardData.favoriteArtists,
    recentlyLoved: dashboardData.recentlyLoved,
  },
  playlists: {
    featuredPlaylists: dashboardData.featuredPlaylists,
    userPlaylists: dashboardData.userPlaylists,
    moodCollections: dashboardData.moodCollections,
    sharedPlaylists: dashboardData.sharedPlaylists,
  },
  podcasts: {
    trendingShows: dashboardData.trendingShows,
    podcastContinue: dashboardData.podcastContinue,
    podcastCategories: dashboardData.podcastCategories,
    savedShows: dashboardData.savedShows,
    newEpisodes: dashboardData.newEpisodes,
  },
  activity: {
    activityStats: dashboardData.activityStats,
    friendsListening: dashboardData.friendsListening,
    genres: dashboardData.genres,
    milestones: dashboardData.milestones,
    activityRecent: dashboardData.activityRecent,
  },
  settings: {
    playbackOptions: dashboardData.playbackOptions,
    notificationSettings: dashboardData.notificationSettings,
    appearanceThemes: dashboardData.appearanceThemes,
    connectedDevices: dashboardData.connectedDevices,
    privacyOptions: dashboardData.privacyOptions,
  },
}

export type MockApiEndpoint = AppApiEndpoint
export type MockApiResponseMap = AppApiResponseMap

export const mockApiLabels: Record<MockApiEndpoint, string> = {
  sidebar: 'Sidebar',
  overview: 'Dashboard',
  'my-music': 'My Music',
  favorites: 'Favorites',
  playlists: 'Playlists',
  podcasts: 'Podcasts',
  activity: 'Activity',
  settings: 'Settings',
}

const endpointLatency: Record<MockApiEndpoint, number> = {
  sidebar: 180,
  overview: 320,
  'my-music': 420,
  favorites: 460,
  playlists: 440,
  podcasts: 500,
  activity: 520,
  settings: 380,
}

function cloneMockData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function fetchMockEndpoint<K extends MockApiEndpoint>(
  endpoint: K,
): Promise<MockApiResponseMap[K]> {
  await delay(endpointLatency[endpoint])
  return cloneMockData(mockApiDatabase[endpoint])
}
