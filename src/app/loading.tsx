/**
 * Shown at once while a page's data is loading, so a tap on a link gets an immediate answer instead of the old
 * page standing still. It fades in after a short delay: pages that answer quickly never show it.
 */
export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Seite wird geladen"
      className="mx-auto max-w-3xl animate-[fadeIn_0.25s_0.18s_both] px-7 py-10 sm:px-6 sm:py-16"
    >
      <div className="animate-pulse">
        <div className="h-[34px] w-44 rounded-xl bg-white/15 sm:h-12 sm:w-64" />
        <div className="mt-8 space-y-4">
          <div className="h-32 rounded-[1.75rem] border border-white/15 bg-white/[0.07]" />
          <div className="h-56 rounded-[1.75rem] border border-white/15 bg-white/[0.07]" />
          <div className="h-40 rounded-[1.75rem] border border-white/15 bg-white/[0.07]" />
        </div>
      </div>
    </section>
  );
}
