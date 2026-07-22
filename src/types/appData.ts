export type ToneKey = string
export type UiIconKey = string

export type NavItem = string

export type StatItem = {
  icon: UiIconKey
  title: string
  value: string
  note: string
  tone: ToneKey
}

export type TrackListItem = {
  title: string
  artist: string
  tone: ToneKey
}

export type GenreItem = {
  name: string
  share: string
  color: string
}

export type MusicCardItem = {
  title: string
  artist: string
  duration?: string
  tone: ToneKey
  liked?: boolean
  rank?: number
}

export type AlbumCardItem = {
  title: string
  artist: string
  tone: ToneKey
}

export type ArtistCardItem = {
  name: string
  songs: string
  tone: ToneKey
}

export type ContinueListeningItem = {
  title: string
  artist: string
  remaining: string
  progress: string
  tone: ToneKey
}

export type MoodItem = {
  name: string
  songs: string
  tone: ToneKey
  icon: UiIconKey
}

export type PodcastShowItem = {
  title: string
  category: string
  tone: ToneKey
}

export type PodcastContinueItem = {
  title: string
  show: string
  remaining: string
  progress: string
  tone: ToneKey
}

export type PodcastCategoryItem = {
  name: string
  icon: UiIconKey
  tone: ToneKey
}

export type SavedShowItem = {
  title: string
  episodes: string
  tone: ToneKey
}

export type NewEpisodeItem = {
  title: string
  show: string
  time: string
  tone: ToneKey
}

export type FriendListeningItem = {
  name: string
  track: string
  time: string
  bars: string[]
  tone: ToneKey
}

export type MilestoneItem = {
  title: string
  note: string
  icon: UiIconKey
  status: string
}

export type ActivityRecentItem = {
  time: string
  title: string
  artist: string
  tone: ToneKey
}

export type SettingOptionItem = {
  title: string
  value?: string
  note?: string
  type?: string
  enabled?: boolean
  tone?: ToneKey
  icon: UiIconKey
}

export type AppearanceThemeItem = {
  name: string
  tone: ToneKey
}

export type ConnectedDeviceItem = {
  name: string
  model: string
  status: string
  tone: ToneKey
  connected: boolean
}

export type PlaylistItem = {
  title: string
  songs?: string
  friends?: string
  tone: ToneKey
  favorite?: boolean
}

export type MoodCollectionItem = {
  name: string
  playlists: string
  tone: ToneKey
  icon: UiIconKey
}

export type SidebarPayload = {
  navItems: NavItem[]
}

export type OverviewPayload = {
  stats: StatItem[]
  recentTracks: TrackListItem[]
  genres: GenreItem[]
}

export type MyMusicPayload = {
  recentlyAdded: MusicCardItem[]
  topTracks: MusicCardItem[]
  albums: AlbumCardItem[]
  artists: ArtistCardItem[]
  continueListening: ContinueListeningItem[]
}

export type FavoritesPayload = {
  likedSongs: MusicCardItem[]
  lovedAlbums: AlbumCardItem[]
  moodPicks: MoodItem[]
  favoriteArtists: ArtistCardItem[]
  recentlyLoved: TrackListItem[]
}

export type PlaylistsPayload = {
  featuredPlaylists: PlaylistItem[]
  userPlaylists: PlaylistItem[]
  moodCollections: MoodCollectionItem[]
  sharedPlaylists: PlaylistItem[]
}

export type PodcastsPayload = {
  trendingShows: PodcastShowItem[]
  podcastContinue: PodcastContinueItem[]
  podcastCategories: PodcastCategoryItem[]
  savedShows: SavedShowItem[]
  newEpisodes: NewEpisodeItem[]
}

export type ActivityPayload = {
  activityStats: StatItem[]
  friendsListening: FriendListeningItem[]
  genres: GenreItem[]
  milestones: MilestoneItem[]
  activityRecent: ActivityRecentItem[]
}

export type SettingsPayload = {
  playbackOptions: SettingOptionItem[]
  notificationSettings: SettingOptionItem[]
  appearanceThemes: AppearanceThemeItem[]
  connectedDevices: ConnectedDeviceItem[]
  privacyOptions: SettingOptionItem[]
}

export type AppApiResponseMap = {
  sidebar: SidebarPayload
  overview: OverviewPayload
  'my-music': MyMusicPayload
  favorites: FavoritesPayload
  playlists: PlaylistsPayload
  podcasts: PodcastsPayload
  activity: ActivityPayload
  settings: SettingsPayload
}

export type AppApiEndpoint = keyof AppApiResponseMap
