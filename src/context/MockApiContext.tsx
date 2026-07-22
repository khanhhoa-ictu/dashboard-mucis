import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import {
  mockApiDatabase,
  type MockApiEndpoint,
  type MockApiResponseMap,
} from '../data/mockApi'
import { mockAppApi } from '../services'

type EndpointStatus = 'idle' | 'loading' | 'success' | 'error'

type EndpointStatusMap = Record<MockApiEndpoint, EndpointStatus>
type EndpointErrorMap = Partial<Record<MockApiEndpoint, string>>
type EndpointCache = Partial<MockApiResponseMap>

type MockApiContextValue = {
  cache: EndpointCache
  statuses: EndpointStatusMap
  errors: EndpointErrorMap
  lastUpdated: string | null
  loadEndpoint: <K extends MockApiEndpoint>(endpoint: K, force?: boolean) => Promise<MockApiResponseMap[K]>
  refreshAll: () => Promise<void>
}

const initialStatuses = Object.keys(mockApiDatabase).reduce((accumulator, endpoint) => {
  accumulator[endpoint as MockApiEndpoint] = 'idle'
  return accumulator
}, {} as EndpointStatusMap)

const MockApiContext = createContext<MockApiContextValue | null>(null)

export function MockApiProvider({ children }: PropsWithChildren) {
  const [cache, setCache] = useState<EndpointCache>({})
  const [statuses, setStatuses] = useState<EndpointStatusMap>(initialStatuses)
  const [errors, setErrors] = useState<EndpointErrorMap>({})
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const pendingRequests = useRef<Partial<Record<MockApiEndpoint, Promise<unknown>>>>({})

  const runRequest = useEffectEvent(async <K extends MockApiEndpoint>(endpoint: K, force = false) => {
    if (!force && cache[endpoint]) {
      return cache[endpoint] as MockApiResponseMap[K]
    }

    if (!force && pendingRequests.current[endpoint]) {
      return pendingRequests.current[endpoint] as Promise<MockApiResponseMap[K]>
    }

    setStatuses((current) => ({ ...current, [endpoint]: 'loading' }))
    setErrors((current) => {
      if (!(endpoint in current)) {
        return current
      }

      const next = { ...current }
      delete next[endpoint]
      return next
    })

    const request = mockAppApi.get(endpoint)
      .then((response) => {
        setCache((current) => ({ ...current, [endpoint]: response }))
        setStatuses((current) => ({ ...current, [endpoint]: 'success' }))
        setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        return response
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown mock API error'
        setStatuses((current) => ({ ...current, [endpoint]: 'error' }))
        setErrors((current) => ({ ...current, [endpoint]: message }))
        throw error
      })
      .finally(() => {
        delete pendingRequests.current[endpoint]
      })

    pendingRequests.current[endpoint] = request
    return request
  })

  const loadEndpoint: MockApiContextValue['loadEndpoint'] = (endpoint, force) => runRequest(endpoint, force)

  const refreshAll = async () => {
    await Promise.all(
      (Object.keys(mockApiDatabase) as MockApiEndpoint[]).map((endpoint) => runRequest(endpoint, true)),
    )
  }

  return (
    <MockApiContext.Provider value={{ cache, statuses, errors, lastUpdated, loadEndpoint, refreshAll }}>
      {children}
    </MockApiContext.Provider>
  )
}

export function useMockApiContext() {
  const context = useContext(MockApiContext)

  if (!context) {
    throw new Error('useMockApiContext must be used inside MockApiProvider')
  }

  return context
}

export function useMockEndpoint<K extends MockApiEndpoint>(endpoint: K) {
  const { cache, statuses, errors, loadEndpoint } = useMockApiContext()

  const loadCurrentEndpoint = useEffectEvent(() => {
    void loadEndpoint(endpoint)
  })

  const data = cache[endpoint] as MockApiResponseMap[K] | undefined

  useEffect(() => {
    loadCurrentEndpoint()
  }, [loadCurrentEndpoint])

  return {
    data,
    error: errors[endpoint] ?? null,
    loading: statuses[endpoint] === 'loading' || statuses[endpoint] === 'idle',
    reload: () => loadEndpoint(endpoint, true),
  }
}
