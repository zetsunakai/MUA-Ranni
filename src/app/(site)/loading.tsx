export default function SiteLoading() {
  return <div role="status" aria-live="polite" className="editorial-container py-16">
    <p className="editorial-label">Memuat halaman…</p>
    <div aria-hidden="true" className="mt-8 space-y-6 motion-safe:animate-pulse">
      <div className="h-12 w-3/4 max-w-lg bg-accent-soft" />
      <div className="h-4 w-full max-w-2xl bg-accent-soft" />
      <div className="h-64 bg-accent-soft/60" />
    </div>
  </div>;
}
