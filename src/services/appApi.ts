import type { AppApiEndpoint, AppApiResponseMap } from '../types/appData'

export type AppApi = {
  get<K extends AppApiEndpoint>(endpoint: K): Promise<AppApiResponseMap[K]>
}

