import { RefreshCwIcon } from './RefreshIcon'
import { mockApiLabels, type MockApiEndpoint } from '../../data/mockApi'
import { useMockApiContext } from '../../context/MockApiContext'

const statusClasses = {
  idle: 'bg-[#d9cfff]',
  loading: 'bg-[#ffd46d] animate-pulse',
  success: 'bg-[#63d48b]',
  error: 'bg-[#ff8ba9]',
}

function MockApiPanel() {
  const { statuses, lastUpdated, refreshAll } = useMockApiContext()
  const endpoints = Object.keys(mockApiLabels) as MockApiEndpoint[]

  return (
    <aside className="pointer-events-auto fixed right-3 bottom-3 z-40 hidden w-[260px] rounded-[24px] border border-white/70 bg-[rgba(255,250,248,0.86)] p-4 shadow-[0_18px_40px_rgba(180,162,220,0.24)] backdrop-blur-[18px] xl:block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-[#9a8cb7] uppercase">Mock API</p>
          <strong className="mt-1 block text-[1rem] text-[#30294f]">Endpoint Status</strong>
          <span className="mt-1 block text-xs text-[#7d728e]">
            {lastUpdated ? `Updated ${lastUpdated}` : 'Waiting for first request'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void refreshAll()}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#efe6ff] text-[#8f6aea] shadow-[0_10px_18px_rgba(223,208,235,0.2)] transition hover:scale-[1.04]"
          aria-label="Refresh mock API"
        >
          <RefreshCwIcon size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-2.5">
        {endpoints.map((endpoint) => (
          <div key={endpoint} className="flex items-center justify-between rounded-[16px] bg-white/66 px-3 py-2.5">
            <span className="text-sm font-semibold text-[#54496e]">{mockApiLabels[endpoint]}</span>
            <span className="flex items-center gap-2 text-xs font-bold text-[#7d728e]">
              <span className={`h-2.5 w-2.5 rounded-full ${statusClasses[statuses[endpoint]]}`} />
              {statuses[endpoint]}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default MockApiPanel

