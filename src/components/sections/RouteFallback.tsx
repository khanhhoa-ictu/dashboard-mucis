function RouteFallback() {
  return (
    <div className="grid min-h-[340px] gap-4 rounded-[28px] border border-white/72 bg-linear-to-b from-[rgba(255,252,250,0.96)] to-[rgba(255,245,240,0.94)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_35px_rgba(195,180,216,0.18)] sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
        <div className="skeleton-shimmer min-h-[180px] rounded-[26px]" />
        <div className="grid gap-3">
          <div className="skeleton-shimmer h-12 w-40 rounded-full" />
          <div className="skeleton-shimmer h-5 w-full rounded-full" />
          <div className="skeleton-shimmer h-5 w-[82%] rounded-full" />
          <div className="skeleton-shimmer mt-2 h-12 w-44 rounded-full" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid gap-3 rounded-[24px] bg-white/38 p-3">
            <div className="skeleton-shimmer aspect-square rounded-[20px]" />
            <div className="skeleton-shimmer h-4 w-2/3 rounded-full" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RouteFallback

