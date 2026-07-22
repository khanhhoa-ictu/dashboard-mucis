import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MockApiProvider } from './context/MockApiContext'
import { RouteFallback } from './components/sections'
import { MusicDashboardLayout } from './layouts'
import { appRoutes } from './constants/routes'

const DashboardOverview = lazy(() => import('./pages').then((module) => ({ default: module.DashboardOverview })))
const MyMusicPage = lazy(() => import('./pages').then((module) => ({ default: module.MyMusicPage })))
const FavoritesPage = lazy(() => import('./pages').then((module) => ({ default: module.FavoritesPage })))
const PlaylistsPage = lazy(() => import('./pages').then((module) => ({ default: module.PlaylistsPage })))
const PodcastsPage = lazy(() => import('./pages').then((module) => ({ default: module.PodcastsPage })))
const ActivityPage = lazy(() => import('./pages').then((module) => ({ default: module.ActivityPage })))
const SettingsPage = lazy(() => import('./pages').then((module) => ({ default: module.SettingsPage })))

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MockApiProvider><MusicDashboardLayout /></MockApiProvider>}>
          <Route index element={<DashboardOverview />} />
          <Route path={appRoutes.myMusic.slice(1)} element={<MyMusicPage />} />
          <Route path={appRoutes.favorites.slice(1)} element={<FavoritesPage />} />
          <Route path={appRoutes.playlists.slice(1)} element={<PlaylistsPage />} />
          <Route path={appRoutes.podcasts.slice(1)} element={<PodcastsPage />} />
          <Route path={appRoutes.activity.slice(1)} element={<ActivityPage />} />
          <Route path={appRoutes.settings.slice(1)} element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={appRoutes.dashboard} replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
