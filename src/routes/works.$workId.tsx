import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { worksQueryOptions } from "@/lib/works";

export const Route = createFileRoute("/works/$workId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQueryOptions()),
  component: WorkDetailPage,
});

function WorkDetailPage() {
  const { workId } = Route.useParams();
  const { data: works } = useSuspenseQuery(worksQueryOptions());
  const idx = works.findIndex((w) => w.id === workId);
  const work = idx >= 0 ? works[idx] : undefined;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = work ? [work.imageSrc, ...(work.gallery ?? [])] : [];

  useEffect(() => {
    setLightboxIndex(null);
    window.scrollTo({ top: 0 });
  }, [workId]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % allImages.length,
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + allImages.length) % allImages.length,
        );
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, allImages.length]);

  if (!work) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col justify-center px-6 py-24 md:px-12">
          <p className="font-mono-meta text-primary">Work not found</p>
          <h1 className="mt-4 font-display text-4xl font-medium md:text-6xl">
            Piece not in archive.
          </h1>
          <div className="mt-8">
            <Link
              to="/"
              className="border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:border-primary hover:bg-primary"
            >
              Return to Selected Work
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const prevWork = idx > 0 ? works[idx - 1] : undefined;
  const nextWork = idx < works.length - 1 ? works[idx + 1] : undefined;
  const gallerySlides = work.gallery ?? [];

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1380px] px-6 pb-20 pt-10 md:px-12 md:pb-28 md:pt-14">
        {/* Top utility bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-6">
          <Link
            to="/"
            className="editorial-link inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Selected Work</span>
          </Link>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            {work.behanceUrl && (
              <a
                href={work.behanceUrl}
                target="_blank"
                rel="noreferrer"
                className="editorial-link inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
              >
                <span>View on Behance</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {work.contraUrl && (
              <a
                href={work.contraUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Contra</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* Case Study Header */}
        <header className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7 animate-editorial-rise">
            <div className="flex items-center gap-3 font-mono-meta text-muted-foreground">
              <span className="text-primary">{String(idx + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span>{work.category}</span>
              {work.year && (
                <>
                  <span>·</span>
                  <span>{work.year}</span>
                </>
              )}
            </div>

            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {work.title}
            </h1>
            {work.subtitle && (
              <p className="mt-2 font-editorial text-2xl italic text-muted-foreground sm:text-3xl">
                {work.subtitle}
              </p>
            )}
          </div>

          <div
            className="flex flex-col justify-end md:col-span-5 animate-editorial-rise"
            style={{ animationDelay: "90ms" }}
          >
            {work.description && (
              <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
                {work.description}
              </p>
            )}
          </div>
        </header>

        {/* Metadata strip */}
        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-rule py-6 sm:grid-cols-4">
          <div>
            <dt className="font-mono-meta text-[10px] text-muted-foreground">Discipline</dt>
            <dd className="mt-1.5 text-sm font-medium text-foreground">{work.category}</dd>
          </div>
          {work.client && (
            <div>
              <dt className="font-mono-meta text-[10px] text-muted-foreground">Project Type</dt>
              <dd className="mt-1.5 text-sm font-medium text-foreground">{work.client}</dd>
            </div>
          )}
          {work.year && (
            <div>
              <dt className="font-mono-meta text-[10px] text-muted-foreground">Year</dt>
              <dd className="mt-1.5 text-sm font-medium text-foreground">{work.year}</dd>
            </div>
          )}
          {work.medium && (
            <div>
              <dt className="font-mono-meta text-[10px] text-muted-foreground">Tools &amp; Craft</dt>
              <dd className="mt-1.5 text-sm font-medium text-foreground">{work.medium}</dd>
            </div>
          )}
        </dl>

        {/* Hero Artwork */}
        <div className="mt-12 md:mt-16">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="group block w-full cursor-zoom-in overflow-hidden bg-surface text-left focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Inspect ${work.title} hero artwork full screen`}
          >
            <img
              src={work.imageSrc}
              alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
              className="mx-auto block max-h-[82vh] w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
          </button>
        </div>

        {/* Design Story / Creative Process */}
        {work.story && (
          <section className="mt-14 grid gap-6 border-t border-rule pt-12 md:mt-20 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <p className="font-mono-meta text-primary">Creative Process</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-foreground">
                Concept &amp; approach
              </h2>
            </div>
            <div className="md:col-span-8">
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {work.story}
              </p>
            </div>
          </section>
        )}

        {/* Case Study Plates */}
        {gallerySlides.length > 0 && (
          <section className="mt-16 border-t border-rule pt-12 md:mt-20">
            <div className="mb-10 flex items-baseline justify-between">
              <p className="font-mono-meta text-primary">Case Study Plates</p>
              <span className="font-mono-meta text-[10px] text-muted-foreground">
                {String(gallerySlides.length).padStart(2, "0")} plates · Click any image to expand
              </span>
            </div>

            <div className="space-y-10 md:space-y-14">
              {gallerySlides.map((slideUrl, i) => (
                <figure key={slideUrl} className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(i + 1)}
                    className="group block w-full cursor-zoom-in overflow-hidden bg-surface focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label={`Open ${work.title} plate ${i + 1} full screen`}
                  >
                    <img
                      src={slideUrl}
                      alt={`${work.title} — case study plate ${i + 1}`}
                      loading="lazy"
                      className="mx-auto block w-full max-w-[1160px] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.008]"
                    />
                  </button>
                  <figcaption className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono-meta text-[10px]">
                      Plate {String(i + 1).padStart(2, "0")} /{" "}
                      {String(gallerySlides.length).padStart(2, "0")}
                    </span>
                    <span>{work.title}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* External Behance Callout */}
        {work.behanceUrl && (
          <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-rule pt-8 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Published originally on Behance by Shan pc.
            </p>
            <a
              href={work.behanceUrl}
              target="_blank"
              rel="noreferrer"
              className="editorial-link inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <span>Open original project on Behance</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        )}

        {/* Previous / Next Navigation */}
        {(prevWork || nextWork) && (
          <nav
            aria-label="Adjacent projects"
            className="mt-20 grid gap-8 border-t border-rule pt-12 sm:grid-cols-2"
          >
            <div>
              {prevWork && (
                <Link
                  to="/works/$workId"
                  params={{ workId: prevWork.id }}
                  className="group flex items-center gap-5"
                >
                  <img
                    src={prevWork.imageSrc}
                    alt={prevWork.title}
                    className="hidden h-16 w-20 shrink-0 bg-surface object-cover sm:block"
                  />
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono-meta text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                      <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                      <span>Previous project</span>
                    </span>
                    <span className="mt-1 block font-display text-xl font-medium text-foreground transition-colors group-hover:text-primary md:text-2xl">
                      {prevWork.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{prevWork.category}</span>
                  </div>
                </Link>
              )}
            </div>

            <div className="sm:flex sm:justify-end sm:text-right">
              {nextWork && (
                <Link
                  to="/works/$workId"
                  params={{ workId: nextWork.id }}
                  className="group flex items-center gap-5 sm:flex-row-reverse"
                >
                  <img
                    src={nextWork.imageSrc}
                    alt={nextWork.title}
                    className="hidden h-16 w-20 shrink-0 bg-surface object-cover sm:block"
                  />
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono-meta text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                      <span>Next project</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block font-display text-xl font-medium text-foreground transition-colors group-hover:text-primary md:text-2xl">
                      {nextWork.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{nextWork.category}</span>
                  </div>
                </Link>
              )}
            </div>
          </nav>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title} image viewer`}
          className="fixed inset-0 z-50 flex flex-col bg-foreground/95 p-4 text-background md:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono-meta text-[11px] text-background/70">
              {work.title} — {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
              {String(allImages.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close image viewer"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-background/80 transition-colors hover:text-background"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length)
                }
                aria-label="Previous image"
                className="absolute left-0 z-10 inline-flex h-12 w-12 cursor-pointer items-center justify-center text-background/75 transition-colors hover:text-background md:left-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <img
              src={allImages[lightboxIndex]}
              alt={`${work.title} view ${lightboxIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % allImages.length)}
                aria-label="Next image"
                className="absolute right-0 z-10 inline-flex h-12 w-12 cursor-pointer items-center justify-center text-background/75 transition-colors hover:text-background md:right-4"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
