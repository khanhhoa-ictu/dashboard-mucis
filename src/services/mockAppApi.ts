import type { AppApi } from './appApi'
import { fetchMockEndpoint } from '../data/mockApi'

export const mockAppApi: AppApi = {
  get(endpoint) {
    return fetchMockEndpoint(endpoint)
  },
}

