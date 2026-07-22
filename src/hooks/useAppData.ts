import { useMockEndpoint } from '../context/MockApiContext'

export function useSidebarData() {
  return useMockEndpoint('sidebar')
}

export function useOverviewData() {
  return useMockEndpoint('overview')
}

export function useMyMusicData() {
  return useMockEndpoint('my-music')
}

export function useFavoritesData() {
  return useMockEndpoint('favorites')
}

export function usePlaylistsData() {
  return useMockEndpoint('playlists')
}

export function usePodcastsData() {
  return useMockEndpoint('podcasts')
}

export function useActivityData() {
  return useMockEndpoint('activity')
}

export function useSettingsData() {
  return useMockEndpoint('settings')
}

