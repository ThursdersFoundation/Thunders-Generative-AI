export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-40 h-16 border-b border-border bg-background">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="h-5 w-28 rounded bg-muted" />
          </div>
          <div className="h-9 w-64 rounded-md bg-muted" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-muted" />
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2.5">
              <div className="h-5 w-5 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-7 w-36 rounded bg-muted" />
            <div className="h-4 w-72 rounded bg-muted" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="h-5 w-14 rounded-full bg-muted" />
                </div>
                <div className="h-8 w-24 rounded bg-muted" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-[300px] w-full rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Bottom section skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="h-5 w-36 rounded bg-muted" />
              <div className="h-[250px] w-full rounded bg-muted" />
            </div>
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="h-5 w-32 rounded bg-muted" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
