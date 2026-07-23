export const appRoutes = {
  dashboard: '/',
  myMusic: '/my-music',
  favorites: '/favorites',
  playlists: '/playlists',
  podcasts: '/podcasts',
  activity: '/activity',
  settings: '/settings',
  libraryAdmin: '/library-admin',
} as const

export const sidebarRouteMap = {
  Dashboard: appRoutes.dashboard,
  'My Music': appRoutes.myMusic,
  Favorites: appRoutes.favorites,
  Playlists: appRoutes.playlists,
  Podcasts: appRoutes.podcasts,
  Activity: appRoutes.activity,
  Settings: appRoutes.settings,
  'Library Admin': appRoutes.libraryAdmin,
} as const

export const routeOrder = [
  appRoutes.dashboard,
  appRoutes.myMusic,
  appRoutes.favorites,
  appRoutes.playlists,
  appRoutes.podcasts,
  appRoutes.activity,
  appRoutes.settings,
  appRoutes.libraryAdmin,
] as const
